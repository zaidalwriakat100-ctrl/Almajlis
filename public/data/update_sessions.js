/**
 * سكريبت تحديث بيانات الجلسات
 * ================================
 * يقوم هذا السكريبت بقراءة ملفات التحديثات من مجلد session_updates
 * ودمجها في ملف sessions.json الرئيسي
 * 
 * كيفية الاستخدام:
 * 1. ضع ملفات التحديثات في مجلد session_updates (مثل session_44.json)
 * 2. شغل هذا السكريبت: node update_sessions.js
 * 
 * تنسيق ملفات التحديث:
 * {
 *   "session_id": "session_44",
 *   "session_title": "اسم الجلسة",
 *   "term": "الدورة العادية الثانية",
 *   "brief_summary": {
 *     "events": [...],
 *     "decisions": [...],
 *     "mp_interventions": [...]
 *   }
 * }
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// الحصول على __dirname في ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// المسارات
const DATA_DIR = __dirname;
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const UPDATES_DIR = path.join(DATA_DIR, 'session_updates');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

// دالة لقراءة ملف JSON
function readJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`❌ خطأ في قراءة الملف: ${filePath}`);
        console.error(error.message);
        return null;
    }
}

// دالة لكتابة ملف JSON
function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`❌ خطأ في كتابة الملف: ${filePath}`);
        console.error(error.message);
        return false;
    }
}

// دالة لإنشاء نسخة احتياطية
function createBackup() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `sessions_backup_${timestamp}.json`);

    try {
        fs.copyFileSync(SESSIONS_FILE, backupPath);
        console.log(`✅ تم إنشاء نسخة احتياطية: ${backupPath}`);
        return true;
    } catch (error) {
        console.error('❌ فشل إنشاء النسخة الاحتياطية');
        return false;
    }
}

// دالة لإيجاد الجلسة بناءً على المعرف أو العنوان
function findSession(sessions, update) {
    // البحث بالمعرف أولاً
    if (update.session_id) {
        const index = sessions.findIndex(s => s.id === update.session_id);
        if (index !== -1) return index;
    }

    // البحث بالعنوان والدورة
    if (update.session_title && update.term) {
        const index = sessions.findIndex(s =>
            s.title === update.session_title &&
            s.term === update.term
        );
        if (index !== -1) return index;
    }

    return -1;
}

// دالة لتحديث الجلسة
function updateSession(session, update) {
    // تحديث brief_summary
    if (update.brief_summary) {
        if (!session.brief_summary) {
            session.brief_summary = {};
        }

        // تحديث الأحداث
        if (update.brief_summary.events && update.brief_summary.events.length > 0) {
            session.brief_summary.events = update.brief_summary.events;
            console.log(`   📋 تم تحديث ملخص الجلسة (${update.brief_summary.events.length} حدث)`);
        }

        // تحديث القرارات
        if (update.brief_summary.decisions && update.brief_summary.decisions.length > 0) {
            session.brief_summary.decisions = update.brief_summary.decisions;
            console.log(`   ⚖️ تم تحديث القرارات (${update.brief_summary.decisions.length} قرار)`);
        }

        // تحديث مداخلات النواب
        if (update.brief_summary.mp_interventions && update.brief_summary.mp_interventions.length > 0) {
            session.brief_summary.mp_interventions = update.brief_summary.mp_interventions;
            console.log(`   🎤 تم تحديث مداخلات النواب (${update.brief_summary.mp_interventions.length} نائب)`);
        }
    }

    return session;
}

// الدالة الرئيسية
function main() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║    🔄 سكريبت تحديث بيانات الجلسات      ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');

    // التحقق من وجود المجلدات والملفات
    if (!fs.existsSync(SESSIONS_FILE)) {
        console.error('❌ ملف sessions.json غير موجود!');
        return;
    }

    if (!fs.existsSync(UPDATES_DIR)) {
        console.log('📁 إنشاء مجلد التحديثات...');
        fs.mkdirSync(UPDATES_DIR, { recursive: true });
    }

    // قراءة ملفات التحديثات
    const updateFiles = fs.readdirSync(UPDATES_DIR).filter(f => f.endsWith('.json'));

    if (updateFiles.length === 0) {
        console.log('ℹ️ لا توجد ملفات تحديث في مجلد session_updates');
        console.log('');
        console.log('💡 كيفية إضافة تحديثات:');
        console.log('   1. أنشئ ملف JSON في مجلد session_updates');
        console.log('   2. سمّه باسم الجلسة (مثل: session_44.json)');
        console.log('   3. أعد تشغيل هذا السكريبت');
        return;
    }

    console.log(`📂 وُجد ${updateFiles.length} ملف تحديث`);
    console.log('');

    // إنشاء نسخة احتياطية
    console.log('📦 إنشاء نسخة احتياطية...');
    if (!createBackup()) {
        console.log('⚠️ استمرار بدون نسخة احتياطية...');
    }
    console.log('');

    // قراءة ملف الجلسات الرئيسي
    console.log('📖 قراءة ملف sessions.json...');
    const sessions = readJsonFile(SESSIONS_FILE);
    if (!sessions) {
        console.error('❌ فشل قراءة ملف الجلسات!');
        return;
    }
    console.log(`   ✅ تم تحميل ${sessions.length} جلسة`);
    console.log('');

    // معالجة كل ملف تحديث
    let updatedCount = 0;
    let skippedCount = 0;

    console.log('🔄 بدء التحديث...');
    console.log('─'.repeat(50));

    for (const file of updateFiles) {
        const filePath = path.join(UPDATES_DIR, file);
        console.log(`\n📄 معالجة: ${file}`);

        const update = readJsonFile(filePath);
        if (!update) {
            skippedCount++;
            continue;
        }

        // إيجاد الجلسة
        const sessionIndex = findSession(sessions, update);

        if (sessionIndex === -1) {
            console.log(`   ⚠️ لم يتم العثور على الجلسة: ${update.session_id || update.session_title}`);
            skippedCount++;
            continue;
        }

        // تحديث الجلسة
        console.log(`   📍 وُجدت الجلسة: ${sessions[sessionIndex].title}`);
        sessions[sessionIndex] = updateSession(sessions[sessionIndex], update);
        updatedCount++;

        // نقل ملف التحديث إلى مجلد الأرشيف (اختياري)
        const processedDir = path.join(UPDATES_DIR, 'processed');
        if (!fs.existsSync(processedDir)) {
            fs.mkdirSync(processedDir, { recursive: true });
        }
        const processedPath = path.join(processedDir, file);
        fs.renameSync(filePath, processedPath);
        console.log(`   📁 تم نقل الملف إلى: processed/${file}`);
    }

    console.log('');
    console.log('─'.repeat(50));

    // حفظ التغييرات
    if (updatedCount > 0) {
        console.log('💾 حفظ التغييرات...');
        if (writeJsonFile(SESSIONS_FILE, sessions)) {
            console.log('✅ تم حفظ التغييرات بنجاح!');
        } else {
            console.error('❌ فشل حفظ التغييرات!');
        }
    }

    // ملخص
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║              📊 الملخص                  ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║  ✅ جلسات محدثة: ${updatedCount.toString().padStart(3)}                    ║`);
    console.log(`║  ⏭️ جلسات تم تخطيها: ${skippedCount.toString().padStart(3)}                 ║`);
    console.log('╚════════════════════════════════════════╝');
}

// تشغيل السكريبت
main();
