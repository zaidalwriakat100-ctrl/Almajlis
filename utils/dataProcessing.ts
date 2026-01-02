
/**
 * تبسيط العنوان ليظهر "الجلسة [الرقم]" فقط
 * يدعم الأرقام المركبة مثل "الواحدة والعشرين"
 */
export const getSimpleTitle = (fullTitle: string): string => {
    // البحث عن "الجلسة" متبوعة بالرقم (بسيط أو مركب)
    // مثال: الجلسة الأولى، الجلسة العاشرة، الجلسة الواحدة والعشرين
    const match = fullTitle.match(/الجلسة\s+([\u0621-\u064A\d]+(?:\s+و[\u0621-\u064A]+)?)/);
    if (match) {
        return `الجلسة ${match[1]}`;
    }
    // إذا لم يجد، نعيد العنوان قبل أول "-" أو "(" 
    const cleanTitle = fullTitle.split(/[-\(]/)[0].trim();
    return cleanTitle || fullTitle;
};

/**
 * تحويل الدقائق إلى تنسيق مقروء (مثلاً: 2س 15د)
 */
export const formatDuration = (minutes: number | null): string => {
    if (!minutes) return 'غير محدد';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}س ${m}د` : `${m}د`;
};

/**
 * تطبيع النصوص للبحث (إزالة التشكيل وتوحيد الهمزات)
 */
export const normalizeForSearch = (text: string): string => {
    return text?.trim()
        .replace(/[إأآا]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي') || '';
};

export const getAllSegments = (sessions: any[]): any[] => {
    return sessions.flatMap(session =>
        (session.chunks || []).flatMap((chunk: any) =>
            (chunk.interventions || []).map((intervention: any) => ({
                ...intervention,
                sessionId: session.id,
                sessionTitle: session.title,
                sessionDate: session.date,
                textExcerpt: intervention.intervention_text,
                speakerName: intervention.speakerNameRaw
            }))
        )
    );
};

// قائمة الألقاب والصفات التي يجب تجاهلها عند المطابقة
const HONORIFICS = ['النائب', 'الدكتور', 'المهندس', 'المحامي', 'السيد', 'السيدة', 'معالي', 'عطوفة', 'سعادة', 'الوزير', 'دولة', 'فضيلة', 'سماحة', 'd.', 'dr.', 'م.'];

// قائمة الألقاب التي تشير إلى أن الشخص مسؤول حكومي وليس نائباً
// هذه الألقاب تمنع محاولة ربط الاسم بصفحة نائب
const GOVERNMENT_TITLES = [
    'رئيس الوزراء', 'رئيس مجلس الوزراء',
    'وزير الداخلية', 'وزير المالية', 'وزير الخارجية', 'وزير الدفاع', 'وزير العدل',
    'وزير التربية', 'وزير الصحة', 'وزير الزراعة', 'وزير العمل', 'وزير الأشغال',
    'وزير الاتصالات', 'وزير السياحة', 'وزير الثقافة', 'وزير البيئة', 'وزير الطاقة',
    'وزير التخطيط', 'وزير النقل', 'وزير الصناعة', 'وزير التجارة', 'وزير الاقتصاد',
    'وزير الشؤون', 'وزير الأوقاف', 'وزير التنمية', 'وزير الإدارة', 'وزير دولة',
    'أمين عام', 'الأمين العام', 'مدير عام', 'المدير العام',
    'رئيس المجلس', 'رئيس مجلس النواب', 'رئيس مجلس الأعيان',
    'نائب رئيس الوزراء', 'نائب الرئيس'
];

// تطبيع متقدم للنص العربي
const advancedNormalize = (text: string): string => {
    if (!text) return '';
    return text
        .trim()
        .replace(/[إأآا]/g, 'ا')  // توحيد الألف
        .replace(/ة/g, 'ه')       // تاء مربوطة
        .replace(/ى/g, 'ي')       // ألف مقصورة
        .replace(/ئ/g, 'ي')       // الهمزة على الياء
        .replace(/ؤ/g, 'و')       // الهمزة على الواو
        .replace(/ء/g, '')        // الهمزة
        .replace(/[ًٌٍَُِّْ]/g, '') // التشكيل
        .toLowerCase();
};

// Helper to tokenize arabic names
export const tokenizeName = (name: string): string[] => {
    if (!name) return [];

    // إزالة النص بين الأقواس (مثل "مقرر لجنة التوجيه" أو "ورد في النص باسم...")
    let cleanedName = name
        .replace(/\([^)]*\)/g, '')  // إزالة الأقواس العادية ومحتواها
        .replace(/\[[^\]]*\]/g, '') // إزالة الأقواس المربعة ومحتواها
        .replace(/\"[^\"]*\"/g, '') // إزالة النص بين علامات الاقتباس
        .trim();

    const normalized = advancedNormalize(cleanedName);
    return normalized
        .split(/\s+/)
        .filter(p => p.length > 1 && !HONORIFICS.some(h => advancedNormalize(h) === p));
};

// التحقق من تطابق جزئي للكلمات (مثلاً "حويلة" تطابق "حويله")
const partialMatch = (token1: string, token2: string): boolean => {
    if (token1 === token2) return true;
    // تطابق إذا كانت إحدى الكلمتين جزءاً من الأخرى (على الأقل 3 أحرف)
    if (token1.length >= 3 && token2.length >= 3) {
        if (token1.includes(token2) || token2.includes(token1)) return true;
        // تطابق بداية الكلمة (أول 3+ أحرف)
        const minLen = Math.min(token1.length, token2.length);
        if (minLen >= 3 && token1.slice(0, minLen) === token2.slice(0, minLen)) return true;
    }
    return false;
};

// حساب نقاط التطابق بين اسمين
const calculateMatchScore = (speakerTokens: string[], mpTokens: string[]): number => {
    let score = 0;
    const mpTokenSet = new Set(mpTokens);

    speakerTokens.forEach((speakerToken, idx) => {
        // تطابق دقيق
        if (mpTokenSet.has(speakerToken)) {
            // الاسم الأول أو العائلة يحصل على نقاط أعلى
            if (idx === 0) score += 2;  // الاسم الأول
            else if (idx === speakerTokens.length - 1) score += 2;  // اسم العائلة (آخر كلمة)
            else score += 1;
            return;
        }

        // تطابق جزئي
        for (const mpToken of mpTokens) {
            if (partialMatch(speakerToken, mpToken)) {
                if (idx === 0) score += 1.5;
                else if (idx === speakerTokens.length - 1) score += 1.5;
                else score += 0.5;
                break;
            }
        }
    });

    return score;
};

export const findBestMatchMP = (speakerName: string, mps: any[]): any | undefined => {
    if (!speakerName || !mps || mps.length === 0) return undefined;

    // التحقق من أن الاسم لا ينتمي لمسؤول حكومي (وزير، رئيس وزراء، أمين عام، إلخ)
    // هؤلاء لا يجب ربطهم بصفحات النواب
    const normalizedSpeaker = advancedNormalize(speakerName);
    for (const title of GOVERNMENT_TITLES) {
        if (normalizedSpeaker.includes(advancedNormalize(title))) {
            return undefined; // هذا مسؤول حكومي وليس نائباً
        }
    }

    const speakerTokens = tokenizeName(speakerName);
    if (speakerTokens.length === 0) return undefined;

    // إنشاء سلسلة نظيفة من الاسم للمقارنة المباشرة
    const cleanSpeakerName = advancedNormalize(speakerName.replace(/\([^)]*\)/g, '').trim());

    let bestMatch: any = undefined;
    let bestScore = 0;
    const minRequiredScore = speakerTokens.length >= 2 ? 3 : 2; // حد أدنى للنقاط

    for (const mp of mps) {
        // أولاً: التحقق من الأسماء البديلة (aliases) - تطابق مباشر
        if (mp.aliases && Array.isArray(mp.aliases)) {
            for (const alias of mp.aliases) {
                const normalizedAlias = advancedNormalize(alias);
                if (cleanSpeakerName.includes(normalizedAlias) || normalizedAlias.includes(cleanSpeakerName)) {
                    return mp; // تطابق مباشر مع اسم بديل
                }
            }
        }

        // ثانياً: التحقق من الاسم الكامل
        const mpTokens = tokenizeName(mp.fullName);
        if (mpTokens.length === 0) continue;

        const score = calculateMatchScore(speakerTokens, mpTokens);

        // أولوية إضافية: إذا تطابق الاسم الأول + اسم العائلة
        const firstNameMatch = speakerTokens[0] && mpTokens.some(t => partialMatch(speakerTokens[0], t));
        const lastNameMatch = speakerTokens.length > 1 &&
            mpTokens.some(t => partialMatch(speakerTokens[speakerTokens.length - 1], t));

        const bonusScore = (firstNameMatch && lastNameMatch) ? 1 : 0;
        const totalScore = score + bonusScore;

        if (totalScore > bestScore && totalScore >= minRequiredScore) {
            bestScore = totalScore;
            bestMatch = mp;
        }
    }

    return bestMatch;
};

export const getSegmentsForMP = (mpId: string, mps: any[], allSessions: any[]): any[] => {
    const mp = mps.find(m => m.id === mpId);
    if (!mp) return [];

    const mpNameTokens = tokenizeName(mp.fullName);
    if (mpNameTokens.length === 0) return [];

    const allSegments = getAllSegments(allSessions);
    const minRequiredScore = 3; // حد أدنى للتطابق

    return allSegments.filter(segment => {
        if (!segment.speakerName) return false;

        const speakerTokens = tokenizeName(segment.speakerName);
        if (speakerTokens.length === 0) return false;

        // استخدام نفس نظام النقاط المحسن
        const score = calculateMatchScore(speakerTokens, mpNameTokens);

        // أولوية إضافية: إذا تطابق الاسم الأول + اسم العائلة
        const firstNameMatch = speakerTokens[0] && mpNameTokens.some(t => partialMatch(speakerTokens[0], t));
        const lastNameMatch = speakerTokens.length > 1 &&
            mpNameTokens.some(t => partialMatch(speakerTokens[speakerTokens.length - 1], t));

        const bonusScore = (firstNameMatch && lastNameMatch) ? 1 : 0;
        const totalScore = score + bonusScore;

        return totalScore >= minRequiredScore;
    });
};

export const extractMPInterests = (segments: any[]): string[] => {
    const topicCounts: { [key: string]: number } = {};

    segments.forEach(segment => {
        if (segment.topics && Array.isArray(segment.topics)) {
            segment.topics.forEach((topic: string) => {
                topicCounts[topic] = (topicCounts[topic] || 0) + 1;
            });
        }
    });

    return Object.entries(topicCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([topic]) => topic);
};

export const getMPInterventionHistory = (segments: any[], allSessions: any[], mpName?: string): any[] => {
    const sessionMap: { [key: string]: { session: any, count: number, firstSegmentId: string, summaryPoints: string[], timestamp: number } } = {};

    // First pass: count segments and get basic session info from chunks/interventions
    segments.forEach(segment => {
        if (!sessionMap[segment.sessionId]) {
            const session = allSessions.find(s => s.id === segment.sessionId);
            if (session) {
                // Find summary points if MP name is provided
                let summaryPoints: string[] = [];
                if (mpName && session.brief_summary?.mp_interventions) {
                    const mpSummary = findBestMatchMP(mpName, session.brief_summary.mp_interventions.map((i: any) => ({ ...i, fullName: i.mp_name })));
                    if (mpSummary) {
                        summaryPoints = mpSummary.points || [];
                    }
                }

                sessionMap[segment.sessionId] = {
                    session: {
                        id: session.id,
                        title: session.title,
                        date: session.date,
                        term: session.term,
                        ordinaryTerm: session.ordinaryTerm
                    },
                    count: 0,
                    firstSegmentId: segment.id || segment.chunk_id,
                    summaryPoints: summaryPoints,
                    timestamp: segment.videoTimestamp || segment.start_sec || 0
                };
            }
        }

        if (sessionMap[segment.sessionId]) {
            sessionMap[segment.sessionId].count++;
        }
    });

    // Second pass: Also check all sessions for mp_interventions even if no segments found
    // This ensures MPs with brief_summary entries appear even without chunk-level segments
    if (mpName) {
        allSessions.forEach(session => {
            if (!sessionMap[session.id] && session.brief_summary?.mp_interventions) {
                const mpSummary = findBestMatchMP(mpName, session.brief_summary.mp_interventions.map((i: any) => ({ ...i, fullName: i.mp_name })));
                if (mpSummary && mpSummary.points && mpSummary.points.length > 0) {
                    sessionMap[session.id] = {
                        session: {
                            id: session.id,
                            title: session.title,
                            date: session.date,
                            term: session.term,
                            ordinaryTerm: session.ordinaryTerm
                        },
                        count: mpSummary.points.length, // Use number of points as intervention count
                        firstSegmentId: '',
                        summaryPoints: mpSummary.points || [],
                        timestamp: 0
                    };
                }
            }
        });
    }

    return Object.values(sessionMap).sort((a, b) =>
        new Date(b.session.date).getTime() - new Date(a.session.date).getTime()
    );
};

export const getMPRadarData = (segments: any[]): any[] => {
    const topicCounts: { [key: string]: number } = {};

    segments.forEach(segment => {
        if (segment.topics && Array.isArray(segment.topics)) {
            segment.topics.forEach((topic: string) => {
                topicCounts[topic] = (topicCounts[topic] || 0) + 1;
            });
        }
    });

    // Take top 6 topics for radar chart
    return Object.entries(topicCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([subject, value]) => ({
            subject,
            value,
            fullMark: Math.max(...Object.values(topicCounts))
        }));
};

// قائمة الموضوعات الرئيسية للبحث عنها في نصوص المداخلات
const TOPIC_KEYWORDS: { [key: string]: string[] } = {
    'فلسطين وغزة': ['غزة', 'فلسطين', 'القدس', 'الاحتلال', 'المقاومة', 'التهجير', 'الضفة', 'حماس', 'نتنياهو'],
    'الصحة': ['الصحة', 'صحي', 'مستشفى', 'طبي', 'علاج', 'سرطان', 'تأمين صحي', 'إعفاء', 'مرضى'],
    'التعليم': ['التعليم', 'مدارس', 'جامعة', 'طلاب', 'مناهج', 'توجيهي', 'تعليمي'],
    'الاقتصاد': ['اقتصاد', 'مديونية', 'ضرائب', 'جباية', 'موازنة', 'استثمار', 'البنوك'],
    'البطالة': ['بطالة', 'عمل', 'توظيف', 'متعطلين', 'فرص عمل'],
    'المياه والطاقة': ['مياه', 'ناقل', 'كهرباء', 'طاقة', 'غاز', 'الريشة'],
    'التنمية المحلية': ['محافظة', 'تنموية', 'بلدية', 'خدمات', 'بنية تحتية', 'طرق'],
    'الحريات': ['حريات', 'جرائم إلكترونية', 'معتقلين', 'رأي', 'صحافة', 'حبس'],
    'القوات المسلحة': ['جيش', 'عسكري', 'متقاعدين', 'أمن', 'دفاع'],
    'الزراعة': ['زراعة', 'مزارعين', 'محاصيل', 'بادية'],
    'السياحة': ['سياحة', 'سياحي', 'أثري', 'البترا', 'جرش'],
    'المرأة والأسرة': ['المرأة', 'أسرة', 'طلاق', 'زواج', 'أطفال']
};

/**
 * استخراج المواضيع الرئيسية من نصوص مداخلات النائب
 */
export const extractTopicsFromInterventions = (interventionHistory: any[]): { topic: string; count: number }[] => {
    const topicCounts: { [key: string]: number } = {};

    // جمع جميع النقاط من جميع الجلسات
    const allPoints: string[] = [];
    interventionHistory.forEach(item => {
        if (item.summaryPoints && Array.isArray(item.summaryPoints)) {
            allPoints.push(...item.summaryPoints);
        }
    });

    // البحث عن الكلمات المفتاحية في النصوص
    allPoints.forEach(point => {
        const normalizedPoint = point.toLowerCase();

        Object.entries(TOPIC_KEYWORDS).forEach(([topic, keywords]) => {
            keywords.forEach(keyword => {
                if (normalizedPoint.includes(keyword)) {
                    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
                }
            });
        });
    });

    // ترتيب المواضيع حسب التكرار وإرجاع أعلى 6
    return Object.entries(topicCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([topic, count]) => ({ topic, count }));
};

export const cleanSpeakerName = (name: string): string => {
    if (!name) return '';
    // Remove common honorifics and titles
    return name
        .replace(/(سعادة|معالي|عطوفة|دولة|النائب|الوزير|الدكتور|المهندس|المحامي|السيد|السيدة)\s+/g, '')
        .trim();
};
