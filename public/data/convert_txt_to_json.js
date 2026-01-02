/**
 * سكريبت تحويل ملفات النص إلى JSON
 * ===================================
 * يقرأ ملفات .txt من مجلد raw_text ويحولها إلى ملفات JSON
 * 
 * كيفية الاستخدام:
 * 1. ضع ملفات .txt في مجلد: session_updates/raw_text/
 * 2. شغل: node convert_txt_to_json.js
 * 3. ثم شغل: node update_sessions.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_TEXT_DIR = path.join(__dirname, 'session_updates', 'raw_text');
const OUTPUT_DIR = path.join(__dirname, 'session_updates');
const PROCESSED_DIR = path.join(RAW_TEXT_DIR, 'processed');

// دالة لاستخراج معلومات الجلسة من اسم الملف أو المحتوى
function extractSessionInfo(content, filename) {
    const info = {
        session_id: null,
        session_title: null,
        term: null,
        youtube_url: null
    };

    // البحث عن اسم الجلسة
    const titleMatch = content.match(/(?:اسم الجلسة|عنوان الجلسة)[:\s]+(.+)/);
    if (titleMatch) {
        info.session_title = titleMatch[1].trim();
    } else {
        // محاولة استخراج من اسم الملف
        const filenameMatch = filename.match(/الجلسة\s+(.+?)(?:\.txt)?$/i);
        if (filenameMatch) {
            info.session_title = `الجلسة ${filenameMatch[1]}`.replace('.txt', '');
        }
    }

    // البحث عن الدورة
    const termMatch = content.match(/(?:الدورة|العادية)[:\s]*(الدورة العادية (?:الأولى|الثانية|الاولى))/i);
    if (termMatch) {
        info.term = termMatch[1].trim();
    } else if (content.includes('العادية الثانية')) {
        info.term = 'الدورة العادية الثانية';
    } else if (content.includes('العادية الأولى') || content.includes('العادية الاولى')) {
        info.term = 'الدورة العادية الأولى';
    }

    // البحث عن رابط يوتيوب
    const youtubeMatch = content.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
        info.youtube_url = `https://www.youtube.com/watch?v=${youtubeMatch[1]}`;
    }

    // توليد session_id
    if (info.session_title) {
        const numMatch = info.session_title.match(/(\d+)/);
        if (numMatch) {
            info.session_id = `session_${numMatch[1]}`;
        }
    }

    return info;
}

// دالة لاستخراج الأحداث (ماذا جرى في الجلسة)
function extractEvents(content) {
    const events = [];

    // البحث عن قسم الأحداث
    const eventsMatch = content.match(/(?:ماذا جرى|ما جرى|ملخص الجلسة|أحداث الجلسة)[^\n]*\n([\s\S]*?)(?=(?:أبرز القرارات|القرارات|ملخص ما طرحه النواب|$))/i);

    if (eventsMatch) {
        const eventsText = eventsMatch[1];
        const lines = eventsText.split('\n');

        for (const line of lines) {
            const cleanLine = line.replace(/^[•\-\*\d\.]+\s*/, '').trim();
            if (cleanLine && cleanLine.length > 10) {
                events.push(cleanLine);
            }
        }
    }

    return events;
}

// دالة لاستخراج القرارات
function extractDecisions(content) {
    const decisions = [];

    // البحث عن قسم القرارات
    const decisionsMatch = content.match(/(?:أبرز القرارات|القرارات الرئيسية|قرارات الجلسة)[^\n]*\n([\s\S]*?)(?=(?:ملخص ما طرحه النواب|أبرز ما طرحه|مداخلات النواب|$))/i);

    if (decisionsMatch) {
        const decisionsText = decisionsMatch[1];
        const lines = decisionsText.split('\n');

        let currentDecision = '';
        for (const line of lines) {
            const cleanLine = line.trim();

            // تجاهل العناوين الفرعية
            if (cleanLine.match(/^\d+\.\s*القرار/)) {
                if (currentDecision) {
                    decisions.push(currentDecision.trim());
                }
                currentDecision = '';
                continue;
            }

            // إذا كان سطر يبدأ برقم أو نقطة
            if (cleanLine.match(/^[•\-\*\d\.]+\s*/) && cleanLine.length > 20) {
                if (currentDecision) {
                    decisions.push(currentDecision.trim());
                }
                currentDecision = cleanLine.replace(/^[•\-\*\d\.]+\s*/, '');
            } else if (cleanLine && currentDecision) {
                currentDecision += ' ' + cleanLine;
            }
        }
        if (currentDecision) {
            decisions.push(currentDecision.trim());
        }
    }

    return decisions;
}

// دالة لاستخراج مداخلات النواب
function extractMPInterventions(content) {
    const interventions = [];

    // البحث عن قسم النواب
    const mpMatch = content.match(/(?:ملخص ما طرحه النواب|مداخلات النواب|أبرز ما طرحه النواب)[^\n]*\n([\s\S]*?)$/i);

    if (mpMatch) {
        const mpText = mpMatch[1];
        const lines = mpText.split('\n');

        let currentMP = null;
        let currentPoints = [];

        for (const line of lines) {
            const cleanLine = line.trim();

            // تجاهل الأسطر الفارغة
            if (!cleanLine) continue;

            // التحقق إذا كان اسم نائب جديد (لا يبدأ بنقطة أو رقم)
            const isNewMP = !cleanLine.match(/^[•\-\*\d\.]+/) &&
                cleanLine.length < 100 &&
                cleanLine.length > 3 &&
                !cleanLine.includes('>>') &&
                (cleanLine.match(/^[أ-ي]/) || cleanLine.match(/^[\u0600-\u06FF]/));

            if (isNewMP && !cleanLine.startsWith('•') && !cleanLine.startsWith('-')) {
                // حفظ النائب السابق
                if (currentMP && currentPoints.length > 0) {
                    interventions.push({
                        mp_name: currentMP,
                        points: currentPoints
                    });
                }

                // بدء نائب جديد
                currentMP = cleanLine.replace(/[:\-–]$/, '').trim();
                currentPoints = [];
            } else if (cleanLine.match(/^[•\-\*]/) && currentMP) {
                // إضافة نقطة للنائب الحالي
                const point = cleanLine.replace(/^[•\-\*]\s*/, '').trim();
                if (point && point.length > 10) {
                    currentPoints.push(point);
                }
            }
        }

        // حفظ النائب الأخير
        if (currentMP && currentPoints.length > 0) {
            interventions.push({
                mp_name: currentMP,
                points: currentPoints
            });
        }
    }

    return interventions;
}

// دالة لتحويل ملف نص إلى JSON
function convertTextToJson(content, filename) {
    console.log(`\n📄 معالجة: ${filename}`);

    // استخراج المعلومات
    const sessionInfo = extractSessionInfo(content, filename);
    const events = extractEvents(content);
    const decisions = extractDecisions(content);
    const mpInterventions = extractMPInterventions(content);

    console.log(`   📋 الأحداث: ${events.length}`);
    console.log(`   ⚖️ القرارات: ${decisions.length}`);
    console.log(`   🎤 النواب: ${mpInterventions.length}`);

    // إنشاء كائن JSON
    const jsonData = {
        session_id: sessionInfo.session_id,
        session_title: sessionInfo.session_title,
        term: sessionInfo.term,
        brief_summary: {
            events: events,
            decisions: decisions,
            mp_interventions: mpInterventions
        }
    };

    return jsonData;
}

// الدالة الرئيسية
function main() {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║  📝 تحويل ملفات النص إلى JSON              ║');
    console.log('╚════════════════════════════════════════════╝');

    // التحقق من وجود المجلد
    if (!fs.existsSync(RAW_TEXT_DIR)) {
        fs.mkdirSync(RAW_TEXT_DIR, { recursive: true });
        console.log(`\n📁 تم إنشاء مجلد: ${RAW_TEXT_DIR}`);
        console.log('   ضع ملفات .txt هنا وأعد تشغيل السكريبت');
        return;
    }

    // قراءة ملفات النص
    const txtFiles = fs.readdirSync(RAW_TEXT_DIR).filter(f => f.endsWith('.txt'));

    if (txtFiles.length === 0) {
        console.log('\nℹ️ لا توجد ملفات .txt في المجلد');
        console.log(`📂 المجلد: ${RAW_TEXT_DIR}`);
        return;
    }

    console.log(`\n📂 وُجد ${txtFiles.length} ملف نصي`);

    // إنشاء مجلد الملفات المعالجة
    if (!fs.existsSync(PROCESSED_DIR)) {
        fs.mkdirSync(PROCESSED_DIR, { recursive: true });
    }

    let successCount = 0;
    let failCount = 0;

    for (const file of txtFiles) {
        const filePath = path.join(RAW_TEXT_DIR, file);

        try {
            // قراءة الملف
            const content = fs.readFileSync(filePath, 'utf8');

            // تحويل إلى JSON
            const jsonData = convertTextToJson(content, file);

            // تحديد اسم ملف الخرج
            const outputFilename = file.replace('.txt', '.json');
            const outputPath = path.join(OUTPUT_DIR, outputFilename);

            // كتابة ملف JSON
            fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf8');
            console.log(`   ✅ تم إنشاء: ${outputFilename}`);

            // نقل الملف الأصلي إلى processed
            const processedPath = path.join(PROCESSED_DIR, file);
            fs.renameSync(filePath, processedPath);

            successCount++;
        } catch (error) {
            console.error(`   ❌ خطأ في معالجة ${file}: ${error.message}`);
            failCount++;
        }
    }

    console.log('\n' + '─'.repeat(50));
    console.log('📊 الملخص:');
    console.log(`   ✅ نجاح: ${successCount}`);
    console.log(`   ❌ فشل: ${failCount}`);
    console.log('\n💡 الخطوة التالية: شغّل node update_sessions.js لدمج البيانات');
}

main();
