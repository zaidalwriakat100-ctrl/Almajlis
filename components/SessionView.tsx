import React, { useState, useEffect } from 'react';
import { Search, Calendar, PlayCircle, Landmark, Mic2 } from 'lucide-react';
import { ParliamentSession } from '../types';
import { getSessions } from '../services/api';
import { normalizeForSearch } from '../utils/dataProcessing';

// استخراج اسم الجلسة من اسم الملف (بدون بادئة الدورة)
const getSessionName = (title: string): string => {
    // اسم الملف بصيغة: "العادية الأولى_اسم الجلسة" أو "العادية الثانية_اسم الجلسة"
    const parts = title.split('_');
    if (parts.length > 1) {
        return parts.slice(1).join('_'); // إرجاع كل شيء بعد الـ underscore الأول
    }
    return title;
};

import { MP } from '../types';

interface SessionViewProps {
    onSessionSelect: (id: string) => void;
    // Props needed for SessionDetailView when it's rendered inside or passed through
    mps: MP[];
    onMpClick: (mpId: string) => void;
}

const SessionView: React.FC<SessionViewProps> = ({ onSessionSelect, mps, onMpClick }) => {
    const [sessions, setSessions] = useState<ParliamentSession[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTerm, setSelectedTerm] = useState<1 | 2>(1);

    useEffect(() => {
        const loadSessions = async () => {
            const data = await getSessions();
            setSessions(data);
        };
        loadSessions();
    }, []);

    const filteredSessions = sessions.filter(s => {
        // تحسين البحث: تقسيم الاستعلام إلى كلمات والتحقق من وجود كل كلمة
        const searchWords = normalizeForSearch(searchQuery).split(/\s+/).filter(word => word.length > 0);
        const normalizedTitle = normalizeForSearch(s.title);
        const matchesSearch = searchWords.every(word => normalizedTitle.includes(word));

        // التفريق بين الدورات بناءً على حقل ordinaryTerm أو term
        let termMatch = false;
        if (s.ordinaryTerm !== undefined) {
            // استخدام حقل ordinaryTerm إذا كان موجوداً
            termMatch = s.ordinaryTerm === selectedTerm;
        } else if (s.term) {
            // الرجوع للبحث في حقل term
            termMatch = selectedTerm === 2
                ? s.term.includes('الثانية')
                : s.term.includes('الأولى');
        } else {
            // الرجوع للبحث في العنوان (للتوافق مع البيانات القديمة)
            const normalizedTitleForTerm = s.title;
            termMatch = selectedTerm === 2
                ? normalizedTitleForTerm.includes('الثانية')
                : normalizedTitleForTerm.includes('الأولى');
        }

        return matchesSearch && termMatch;
    }).sort((a, b) => {
        // الترتيب حسب التاريخ أولاً (الأحدث في الأعلى)
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;

        if (dateA !== dateB) {
            return dateB - dateA; // الأحدث تاريخياً في الأعلى
        }

        // استخراج ترتيب الجزء من العنوان (اليوم الأول، اليوم الثاني 1، إلخ)
        const getPartOrder = (title: string): number => {
            if (title.includes('اليوم الأول') || title.includes('اليوم الاول')) return 1;
            if (title.includes('اليوم الثاني 1') || title.includes('الجزء الأول') || title.includes('الجزء الاول')) return 2;
            if (title.includes('اليوم الثاني 2') || title.includes('الجزء الثاني')) return 3;
            if (title.includes('الجزء الثالث')) return 4;
            if (title.includes('الجزء الرابع')) return 5;
            if (title.includes('الجزء الخامس')) return 6;
            return 0; // جلسة بدون أجزاء تأتي أولاً
        };

        // إذا تساوى التاريخ، نرتب حسب الجزء (الجزء الأول ثم الثاني...)
        return getPartOrder(a.title) - getPartOrder(b.title);
    });

    return (
        <div className="space-y-10 animate-fade-in max-w-7xl mx-auto px-4" dir="rtl">
            <header className="space-y-8">
                <h2 className="text-4xl font-black text-[#2D463E] flex items-center gap-4 border-b border-[#B18154]/20 pb-8">
                    <Landmark className="text-[#B18154]" size={44} />
                    سجل وأرشيف الجلسات
                </h2>

                <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                    {/* شريط البحث */}
                    <div className="bg-white p-4 rounded-[24px] border border-[#B18154]/10 shadow-sm w-full md:max-w-xl">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="بحث برقم الجلسة..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-4 pr-12 py-3 rounded-xl border-none bg-[#F2F0EA]/40 font-bold outline-none focus:ring-2 focus:ring-[#2D463E]/20"
                            />
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6862]" size={20} />
                        </div>
                    </div>

                    {/* تبويب الدورات */}
                    <div className="bg-[#F2F0EA]/60 p-1.5 rounded-2xl border border-[#B18154]/10 flex items-center shadow-inner">
                        <button
                            onClick={() => setSelectedTerm(2)}
                            className={`px-6 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${selectedTerm === 2 ? 'bg-white text-[#2D463E] shadow-md ring-1 ring-[#B18154]/10' : 'text-[#6B6862] hover:bg-[#B18154]/5'}`}
                        >
                            <span className="bg-[#2D463E] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">2</span>
                            الدورة العادية الثانية
                        </button>
                        <div className="w-px h-6 bg-[#B18154]/20 mx-1"></div>
                        <button
                            onClick={() => setSelectedTerm(1)}
                            className={`px-6 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${selectedTerm === 1 ? 'bg-white text-[#2D463E] shadow-md ring-1 ring-[#B18154]/10' : 'text-[#6B6862] hover:bg-[#B18154]/5'}`}
                        >
                            <span className="bg-[#B18154] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span>
                            الدورة العادية الأولى
                        </button>
                    </div>
                </div>
            </header>

            {/* شبكة البطاقات */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredSessions.length > 0 ? filteredSessions.map((session) => (
                    <div
                        key={session.id}
                        className="group bg-white p-8 rounded-[40px] border border-[#B18154]/10 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col h-full relative overflow-hidden"
                        onClick={() => onSessionSelect(session.id)}
                    >
                        {/* الشريط الخشبي الجانبي المميز */}
                        <div className="absolute top-0 right-0 w-3 h-full bg-[#B18154] group-hover:w-4 transition-all"></div>

                        <div className="relative z-10 flex flex-col h-full pr-4">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-2 text-[10px] font-black text-[#6B6862] bg-[#F2F0EA]/60 px-3 py-1.5 rounded-full">
                                    <Calendar size={14} className="text-[#B18154]" /> {session.date}
                                </div>
                                <span className="px-3 py-1 bg-[#2D463E] text-white rounded-lg text-[9px] font-black">{session.term}</span>
                            </div>

                            {/* عنوان الجلسة (اسم الملف) */}
                            <h3 className="font-black text-[#2D463E] text-2xl leading-tight group-hover:text-[#8B633F] transition-colors mb-6 flex-1 flex items-center">
                                {getSessionName(session.title)}
                            </h3>


                            <div className="flex justify-center">
                                <div className="bg-gradient-to-br from-[#F2F0EA] to-white p-6 rounded-3xl text-center border border-[#B18154]/10 min-w-[140px]">
                                    <div className="flex items-center justify-center gap-1.5 mb-2">
                                        <Mic2 size={12} className="text-[#B18154]" />
                                        <div className="text-[9px] font-black text-[#6B6862] uppercase">متحدث</div>
                                    </div>
                                    <div className="text-3xl font-black text-[#1A2E28]">{session.num_speakers || session.stats?.distinct_speakers_count || 0}</div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-[#F2F0EA] flex justify-end">
                                <div className="flex items-center gap-3 text-xs font-black text-[#B18154] group-hover:text-[#2D463E] transition-colors">
                                    استعراض تفاصيل الجلسة
                                    <div className="w-12 h-12 rounded-2xl bg-[#F2F0EA] flex items-center justify-center group-hover:bg-[#2D463E] group-hover:text-white transition-all shadow-md">
                                        <PlayCircle size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-[30px] border-2 border-dashed border-[#B18154]/20 flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 bg-[#F2F0EA] rounded-full flex items-center justify-center text-[#6B6862]">
                            <Search size={32} />
                        </div>
                        <div>
                            <div className="text-[#2D463E] font-black text-lg">لا توجد جلسات مطابقة</div>
                            <p className="text-[#6B6862] text-sm">حاول تغيير معايير البحث أو الدورة البرلمانية.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* تنويه أسفل الجلسات */}
            <footer className="mt-16 py-8 flex justify-center">
                <div className="bg-gradient-to-r from-[#F2F0EA]/80 via-white/40 to-[#F2F0EA]/80 backdrop-blur-sm border border-[#B18154]/10 rounded-[30px] px-8 py-5 flex items-center gap-4 text-[#2D463E]/80 max-w-3xl shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                        <PlayCircle size={24} className="text-[#B18154]" />
                    </div>
                    <p className="text-sm md:text-base font-bold leading-relaxed">
                        <span className="text-[#B18154]">📺 تنويه:</span> ترتيب الجلسات هنا هو نفس ترتيب بث جلسات مجلس النواب المتلفزة.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default SessionView;
