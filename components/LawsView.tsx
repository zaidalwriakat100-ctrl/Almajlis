import React, { useState, useEffect, useMemo } from 'react';
import { ApprovedLaw, UserVote, Law } from '../types';
import { getApprovedLaws, saveUserVote, getUserVotes, getProposedBills } from '../services/api';
import {
    Scale, ChevronLeft, ArrowRight, Landmark, CheckCircle,
    Users, FileText, Download, Gavel, FileSearch, Crown,
    BookMarked, ChevronDown, ShieldAlert, Send, ThumbsUp, ThumbsDown, Minus, EyeOff, CalendarRange, Info,
    ScrollText, Timer
} from 'lucide-react';

const LawsView: React.FC = () => {
    console.log("LawsView Mounted - Debug Version");
    const [viewState, setViewState] = useState<'list' | 'law-detail'>('list');
    const [activeTab, setActiveTab] = useState<'approved' | 'proposed'>('approved');
    const [selectedTerm, setSelectedTerm] = useState<1 | 2>(1); // Default to 1 to show likely existing data
    const [laws, setLaws] = useState<Law[]>([]);
    const [proposedBills, setProposedBills] = useState<Law[]>([]);
    const [selectedLaw, setSelectedLaw] = useState<Law | null>(null);
    const [loading, setLoading] = useState(true);
    const [userVotes, setUserVotes] = useState<Record<string, UserVote>>({});

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                console.log("Fetching laws...");
                const [approvedData, proposedData] = await Promise.all([
                    getApprovedLaws(),
                    getProposedBills()
                ]);
                console.log("Laws loaded:", approvedData?.length, proposedData?.length);
                setLaws(approvedData || []);
                setProposedBills(proposedData || []);
                setUserVotes(getUserVotes());
            } catch (error) {
                console.error("Failed to load laws", error);
                setLaws([]);
                setProposedBills([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filteredLaws = useMemo(() => {
        // Session 1: 2024-2025
        // Session 2: 2026+
        return laws.filter(l => {
            const lawDate = l.datePassed || (l.year + '-01-01');
            const isLate2025 = lawDate >= '2025-11-01';

            // Allow 2023 and 2024 for Term 1 as well to show legacy data
            if (selectedTerm === 1) {
                return String(l.year) === '2023' || String(l.year) === '2024' || (String(l.year) === '2025' && !isLate2025);
            }
            return String(l.year) === '2026' || (String(l.year) === '2025' && isLate2025);
        }).sort((a, b) => {
            const dateA = a.datePassed ? new Date(a.datePassed).getTime() : 0;
            const dateB = b.datePassed ? new Date(b.datePassed).getTime() : 0;
            return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
        });
    }, [laws, selectedTerm]);

    const filteredProposed = useMemo(() => {
        return proposedBills.filter(b => {
            const date = b.dateProposed || '';
            // Include drafts from April 2025 onwards in Session 2 (covers all 5 drafts)
            const isLate2025 = date >= '2025-04-01';

            if (selectedTerm === 1) {
                return date.includes('2024') || (date.includes('2025') && !isLate2025);
            } else {
                return date.includes('2026') || (date.includes('2025') && isLate2025);
            }
        }).sort((a, b) => {
            const dateA = a.dateProposed ? new Date(a.dateProposed).getTime() : 0;
            const dateB = b.dateProposed ? new Date(b.dateProposed).getTime() : 0;
            return dateB - dateA;
        });
    }, [proposedBills, selectedTerm]);

    const handleLawSelect = async (law: Law) => {
        setSelectedLaw(law);
        setViewState('law-detail');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleVote = (articleId: string, vote: UserVote) => {
        saveUserVote(articleId, vote);
        setUserVotes(prev => ({ ...prev, [articleId]: vote }));
    };

    const legislativeSteps = [
        { title: "رئاسة الوزراء", phase: "الصياغة", desc: "إعداد المسودة القانونية وإحالتها للمجلس.", icon: CheckCircle, bg: "bg-parliament-wallWarm/60" },
        { title: "مجلس النواب", phase: "المناقشة", desc: "دراسة البنود والتصويت تحت القبة.", icon: Landmark, bg: "bg-parliament-wallWarm/60" },
        { title: "مجلس الأعيان", phase: "المراجعة", desc: "ضمان التوافق الدستوري والمصلحة الوطنية.", icon: Gavel, bg: "bg-parliament-wallWarm/60" },
        { title: "الإرادة الملكية", phase: "المصادقة", desc: "توشيح القانون بتوقيع جلالة الملك.", icon: Crown, bg: "bg-parliament-accent/10" },
        { title: "الجريدة الرسمية", phase: "النفاذ", desc: "النشر ليصبح القانون ملزماً للجميع.", icon: BookMarked, bg: "bg-parliament-wallWarm/60" }
    ];

    if (loading && viewState === 'list') {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="w-16 h-16 border-4 border-parliament-wall border-t-parliament-greenMain rounded-full animate-spin"></div>
                <p className="font-black text-parliament-greenMain animate-pulse">جاري جلب السجل التشريعي...</p>
            </div>
        );
    }

    if (viewState === 'law-detail' && selectedLaw) {
        return (
            <div className="space-y-8 max-w-5xl mx-auto pb-24 px-4" dir="rtl">
                <button
                    onClick={() => setViewState('list')}
                    className="flex items-center gap-2 text-parliament-greenMain hover:text-parliament-accent transition-colors font-black group"
                >
                    <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
                    العودة للقائمة الرئيسية
                </button>

                <div className="bg-parliament-wallWarm p-10 rounded-[50px] border-2 border-parliament-accent/30 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-3 h-full bg-parliament-greenMain"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="flex-1 space-y-6">
                            <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-1.5 bg-parliament-greenMain text-parliament-accent rounded-full text-[10px] font-black uppercase tracking-widest border border-parliament-accent/40">
                                    قانون مُقر
                                </span>
                                <span className="px-4 py-1.5 bg-parliament-wall text-[10px] font-black text-parliament-greenMain rounded-full border border-parliament-accent/20">
                                    لسنة {selectedLaw.year}
                                </span>
                            </div>
                            <h2 className="text-4xl font-black text-parliament-greenMain leading-tight">{selectedLaw.title}</h2>
                            <div className="flex items-center gap-6 text-sm font-bold text-parliament-greenMain/80">
                                <div className="flex items-center gap-2"><CheckCircle size={18} className="text-parliament-accent" /> {selectedLaw.datePassed}</div>
                            </div>
                        </div>
                        <a
                            href={selectedLaw.source || selectedLaw.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-3 px-8 py-4 bg-parliament-greenMain text-parliament-accent rounded-2xl font-black hover:bg-parliament-greenDark transition-all shadow-lg border-b-4 border-parliament-accent"
                        >
                            <Download size={20} /> النص الرسمي (PDF)
                        </a>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-parliament-wallWarm/40 p-10 rounded-[45px] border border-parliament-accent/30 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-center mb-8">
                            <div className="text-xs font-black text-parliament-accent bg-parliament-greenMain px-6 py-2 rounded-full border border-parliament-accent shadow-sm">
                                التصويت العام على القانون
                            </div>

                            {!!userVotes[selectedLaw.id] ? (
                                <div className="flex items-center gap-4 text-[10px] font-black text-parliament-greenMain uppercase">
                                    <Users size={14} className="text-parliament-accent" /> نبض الشارع:
                                    <div className="flex h-2 w-32 bg-parliament-wall rounded-full overflow-hidden border border-parliament-accent/10">
                                        <div className="bg-parliament-greenMain h-full" style={{ width: `70%` }}></div>
                                        <div className="bg-parliament-accent h-full" style={{ width: `30%` }}></div>
                                    </div>
                                    <span className="text-parliament-greenMain">70% أيدوا</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-[10px] font-black text-parliament-greenMain/40 italic">
                                    <EyeOff size={14} /> صوت للمشاركة في نبض الشارع
                                </div>
                            )}
                        </div>

                        <div className="mb-12 text-center">
                            <h3 className="text-3xl text-parliament-greenMain font-black">ما هو رأيك العام في هذا القانون؟</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 px-4 md:px-12">
                            <button
                                onClick={() => handleVote(selectedLaw.id, 'YES')}
                                className={`relative group p-8 rounded-[40px] transition-all duration-300 flex flex-col items-center gap-4 border-2 ${userVotes[selectedLaw.id] === 'YES' ? 'bg-parliament-greenMain border-parliament-accent shadow-2xl scale-105 ring-4 ring-parliament-accent/20' : 'bg-white border-parliament-wallWarm hover:border-parliament-greenMain hover:shadow-xl hover:-translate-y-2'}`}
                            >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${userVotes[selectedLaw.id] === 'YES' ? 'bg-parliament-accent text-parliament-greenMain shadow-inner' : 'bg-parliament-greenMain/10 text-parliament-greenMain group-hover:scale-110 group-hover:bg-parliament-greenMain group-hover:text-parliament-accent'}`}>
                                    <ThumbsUp size={32} />
                                </div>
                                <div className="text-center">
                                    <h4 className={`text-xl font-black mb-1 ${userVotes[selectedLaw.id] === 'YES' ? 'text-parliament-accent' : 'text-parliament-greenMain'}`}>أؤيد القانون</h4>
                                    <p className={`text-[10px] font-bold ${userVotes[selectedLaw.id] === 'YES' ? 'text-white/80' : 'text-gray-400'}`}>أدعم إقرار هذا التشريع</p>
                                </div>
                                {userVotes[selectedLaw.id] === 'YES' && (
                                    <div className="absolute top-4 right-4 text-parliament-accent animate-bounce">
                                        <CheckCircle size={20} />
                                    </div>
                                )}
                            </button>

                            <button
                                onClick={() => handleVote(selectedLaw.id, 'NO')}
                                className={`relative group p-8 rounded-[40px] transition-all duration-300 flex flex-col items-center gap-4 border-2 ${userVotes[selectedLaw.id] === 'NO' ? 'bg-parliament-greenDark border-parliament-greenMain shadow-2xl scale-105 ring-4 ring-parliament-greenDark/20' : 'bg-white border-parliament-wallWarm hover:border-parliament-greenDark hover:shadow-xl hover:-translate-y-2'}`}
                            >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${userVotes[selectedLaw.id] === 'NO' ? 'bg-white text-parliament-greenDark shadow-inner' : 'bg-red-50 text-red-500 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white'}`}>
                                    <ThumbsDown size={32} />
                                </div>
                                <div className="text-center">
                                    <h4 className={`text-xl font-black mb-1 ${userVotes[selectedLaw.id] === 'NO' ? 'text-white' : 'text-parliament-greenMain'}`}>أعارض القانون</h4>
                                    <p className={`text-[10px] font-bold ${userVotes[selectedLaw.id] === 'NO' ? 'text-white/60' : 'text-gray-400'}`}>أرفض هذا التشريع</p>
                                </div>
                                {userVotes[selectedLaw.id] === 'NO' && (
                                    <div className="absolute top-4 right-4 text-white animate-bounce">
                                        <CheckCircle size={20} />
                                    </div>
                                )}
                            </button>

                            <button
                                onClick={() => handleVote(selectedLaw.id, 'ABSTAIN')}
                                className={`relative group p-8 rounded-[40px] transition-all duration-300 flex flex-col items-center gap-4 border-2 ${userVotes[selectedLaw.id] === 'ABSTAIN' ? 'bg-parliament-accent border-parliament-greenMain shadow-2xl scale-105 ring-4 ring-parliament-accent/20' : 'bg-white border-parliament-wallWarm hover:border-parliament-accent hover:shadow-xl hover:-translate-y-2'}`}
                            >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${userVotes[selectedLaw.id] === 'ABSTAIN' ? 'bg-parliament-greenMain text-parliament-accent shadow-inner' : 'bg-parliament-wood/10 text-parliament-wood group-hover:scale-110 group-hover:bg-parliament-wood group-hover:text-white'}`}>
                                    <Minus size={32} />
                                </div>
                                <div className="text-center">
                                    <h4 className={`text-xl font-black mb-1 ${userVotes[selectedLaw.id] === 'ABSTAIN' ? 'text-parliament-greenMain' : 'text-parliament-greenMain'}`}>محايد</h4>
                                    <p className={`text-[10px] font-bold ${userVotes[selectedLaw.id] === 'ABSTAIN' ? 'text-parliament-greenMain/60' : 'text-gray-400'}`}>ليس لدي رأي محدد</p>
                                </div>
                                {userVotes[selectedLaw.id] === 'ABSTAIN' && (
                                    <div className="absolute top-4 right-4 text-parliament-greenMain animate-bounce">
                                        <CheckCircle size={20} />
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-24 px-4" dir="rtl">
            {/* Combined Header & Timeline Card */}
            <div className="bg-[#f8f9fa] rounded-[32px] shadow-sm border border-parliament-wall/10 p-6 md:p-8 mb-10 relative overflow-hidden group max-w-4xl mx-auto">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-parliament-accent via-parliament-greenMain to-parliament-accent"></div>
                <div className="absolute inset-0 bg-parliament-wall/5 opacity-50 pattern-dots"></div>

                <header className="flex flex-col items-center justify-center text-center gap-2 mb-8 relative z-10 transition-all">
                    <div className="flex items-center gap-3 text-parliament-greenMain">
                        <Scale size={32} className="text-parliament-accent drop-shadow-sm" />
                        <h1 className="text-3xl font-black text-parliament-greenMain tracking-tight">السجل التشريعي</h1>
                    </div>
                    <p className="text-parliament-textMuted text-sm font-bold max-w-md mx-auto">تصفح القوانين والمشاريع حسب الدورة البرلمانية</p>
                </header>

                {/* Session Timeline Switcher */}
                <div className="relative max-w-2xl mx-auto">
                    {/* Connecting Line */}
                    <div className="absolute top-[28px] left-[15%] right-[15%] h-[3px] bg-parliament-wall/30 -z-0 rounded-full"></div>

                    <div className="flex justify-between items-center relative z-10 px-8">
                        <button
                            onClick={() => setSelectedTerm(1)}
                            className={`group flex flex-col items-center gap-3 transition-all duration-300 ${selectedTerm === 1 ? 'scale-105' : 'opacity-60 hover:opacity-100'}`}
                        >
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 shadow-lg transition-all ${selectedTerm === 1 ? 'bg-parliament-greenMain border-parliament-accent text-parliament-accent ring-2 ring-parliament-accent/20' : 'bg-white border-parliament-wall text-parliament-textMuted group-hover:border-parliament-greenMain'}`}>
                                <span className="font-black text-xl">1</span>
                            </div>
                            <div className={`text-center transition-colors ${selectedTerm === 1 ? 'text-parliament-greenMain' : 'text-parliament-textMuted'}`}>
                                <div className="text-sm font-black">الدورة العادية الأولى</div>
                            </div>
                        </button>

                        <button
                            onClick={() => setSelectedTerm(2)}
                            className={`group flex flex-col items-center gap-3 transition-all duration-300 ${selectedTerm === 2 ? 'scale-105' : 'opacity-60 hover:opacity-100'}`}
                        >
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 shadow-lg transition-all ${selectedTerm === 2 ? 'bg-parliament-greenMain border-parliament-accent text-parliament-accent ring-2 ring-parliament-accent/20' : 'bg-white border-parliament-wall text-parliament-textMuted group-hover:border-parliament-greenMain'}`}>
                                <span className="font-black text-xl">2</span>
                            </div>
                            <div className={`text-center transition-colors ${selectedTerm === 2 ? 'text-parliament-greenMain' : 'text-parliament-textMuted'}`}>
                                <div className="text-sm font-black">الدورة العادية الثانية</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Law Type Tabs */}
            <div className="flex border-b border-parliament-wood/20 bg-white rounded-t-lg overflow-hidden mb-8 sticky top-4 z-20 shadow-sm mx-auto max-w-5xl">
                <button
                    onClick={() => setActiveTab('approved')}
                    className={`flex-1 py-4 font-bold text-lg flex items-center justify-center gap-3 transition-all ${activeTab === 'approved' ? 'text-parliament-greenMain bg-parliament-greenMain/5 border-b-4 border-parliament-greenMain' : 'text-parliament-textMuted hover:bg-parliament-wall/20'}`}
                >
                    <Gavel size={22} className={activeTab === 'approved' ? 'text-parliament-accent' : ''} />
                    <span>القوانين المقرة</span>
                    <span className="bg-parliament-wall px-2 py-0.5 rounded text-xs text-parliament-textMuted">{filteredLaws.length}</span>
                </button>
                <div className="w-px bg-parliament-wall"></div>
                <button
                    onClick={() => setActiveTab('proposed')}
                    className={`flex-1 py-4 font-bold text-lg flex items-center justify-center gap-3 transition-all ${activeTab === 'proposed' ? 'text-parliament-woodDark bg-parliament-wood/5 border-b-4 border-parliament-wood' : 'text-parliament-textMuted hover:bg-parliament-wall/20'}`}
                >
                    <FileSearch size={22} className={activeTab === 'proposed' ? 'text-parliament-wood' : ''} />
                    <span>مشاريع القوانين</span>
                    <span className="bg-parliament-wall px-2 py-0.5 rounded text-xs text-parliament-textMuted">{filteredProposed.length}</span>
                </button>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto">
                {activeTab === 'approved' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredLaws.length > 0 ? filteredLaws.map(law => (
                            <div key={law.id} onClick={() => handleLawSelect(law)} className="group bg-white rounded-[20px] border border-parliament-wall/60 hover:border-parliament-greenMain shadow-sm hover:shadow-xl transition-all cursor-pointer relative overflow-hidden flex flex-col h-full transform hover:-translate-y-1">
                                {/* Decorative "Official" Stripe */}
                                <div className="w-full h-2 bg-parliament-greenMain"></div>

                                <div className="p-6 flex-1 flex flex-col relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col items-start gap-2">
                                            <span className="text-[10px] font-black text-white bg-parliament-greenMain px-3 py-1 rounded-full shadow-sm mb-1">قانون مُقر</span>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-parliament-textMuted bg-parliament-wall/20 px-2 py-1 rounded-md">
                                                <CalendarRange size={12} /> {law.datePassed}
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-parliament-greenMain/5 flex items-center justify-center text-parliament-greenMain border border-parliament-greenMain/10 group-hover:bg-parliament-greenMain group-hover:text-parliament-accent transition-colors">
                                            <ScrollText size={18} />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-parliament-greenMain leading-snug mb-4 line-clamp-3">
                                        {law.title}
                                    </h3>

                                    <div className="mt-auto pt-4 border-t border-parliament-wall/30 flex justify-end items-center text-xs font-bold text-parliament-textMuted">
                                        <span className="flex items-center gap-1 text-parliament-greenMain group-hover:translate-x-1 transition-transform font-black">
                                            عرض التفاصيل <ArrowRight size={14} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center bg-white rounded-[30px] border-2 border-dashed border-parliament-wall flex flex-col items-center justify-center gap-4">
                                <div className="w-16 h-16 bg-parliament-wall/20 rounded-full flex items-center justify-center text-parliament-textMuted">
                                    <Landmark size={32} />
                                </div>
                                <div>
                                    <div className="text-parliament-greenMain font-black text-lg">لا توجد قوانين مقرة مسجلة</div>
                                    <p className="text-parliament-textMuted text-sm">لم يتم تسجيل أي قوانين مقرة في هذه الدورة بعد.</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {activeTab === 'proposed' && selectedTerm === 1 ? (
                            <div className="col-span-full py-24 text-center bg-gradient-to-b from-white to-parliament-wall/10 rounded-[40px] border border-parliament-wall/20 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-5 pattern-dots pointer-events-none"></div>
                                <div className="w-24 h-24 bg-parliament-greenMain/5 rounded-full flex items-center justify-center text-parliament-greenMain mb-2 relative">
                                    <div className="absolute inset-0 rounded-full border-4 border-parliament-greenMain/10 border-dashed animate-spin-slow"></div>
                                    <CheckCircle size={40} />
                                </div>
                                <div className="relative z-10 max-w-md mx-auto space-y-3">
                                    <h3 className="text-2xl font-black text-parliament-greenMain">تم اختتام أعمال الدورة العادية الأولى</h3>
                                    <div className="inline-flex items-center gap-2 text-xs font-bold text-parliament-accent bg-parliament-greenMain/5 px-4 py-2 rounded-full border border-parliament-greenMain/10 mt-2">
                                        <Info size={14} />
                                        انتقل لتبويب "القوانين المقرة" للاطلاع على النتائج
                                    </div>
                                </div>
                            </div>
                        ) : filteredProposed.length > 0 ? filteredProposed.map(bill => (
                            <div key={bill.id} className="bg-white rounded-[24px] border border-parliament-wall hover:border-parliament-wood shadow-sm hover:shadow-xl transition-all p-0 flex flex-col h-full relative group overflow-hidden hover:-translate-y-1">
                                <div className="h-2 w-full bg-parliament-wood/80"></div>
                                <div className="p-6 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-5">
                                        <div>
                                            <div className="text-[10px] font-black text-parliament-woodDark uppercase opacity-70 mb-1">جهة الاقتراح</div>
                                            <div className="text-xs font-black text-white bg-parliament-wood px-3 py-1 rounded-full inline-block shadow-sm">
                                                رئاسة الوزراء
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 bg-parliament-wood/10 rounded-full flex items-center justify-center text-parliament-wood group-hover:bg-parliament-wood group-hover:text-white transition-colors">
                                            <Timer size={20} />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-parliament-greenMain mb-4 leading-snug group-hover:text-parliament-woodDark transition-colors min-h-[3.5rem]">{bill.title}</h3>

                                    <div className="mt-auto space-y-4 pt-4 border-t border-dashed border-parliament-wall">
                                        <a
                                            href={bill.pdfUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-parliament-wood/5 text-parliament-wood rounded-xl text-xs font-black hover:bg-parliament-wood hover:text-white transition-all border border-parliament-wood/20"
                                        >
                                            <Download size={16} /> تحميل المسودة
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center bg-white rounded-[30px] border-2 border-dashed border-parliament-wall flex flex-col items-center justify-center gap-4">
                                <div className="w-16 h-16 bg-parliament-wall/20 rounded-full flex items-center justify-center text-parliament-textMuted">
                                    <FileSearch size={32} />
                                </div>
                                <div>
                                    <div className="text-parliament-greenMain font-black text-lg">لا توجد مقترحات مسجلة</div>
                                    <p className="text-parliament-textMuted text-sm">لم يتم تسجيل أي مقترحات قوانين في هذه الدورة حالياً.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <section className="mt-24 relative max-w-6xl mx-auto hidden md:block">
                <div className="bg-parliament-wallWarm/60 rounded-[60px] border-4 border-parliament-accent/20 p-12 md:p-16 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 pattern-mashrabiyya opacity-[0.03] pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="text-center mb-16 space-y-4">
                            <h3 className="text-4xl font-black text-parliament-greenMain">كيف يولد القانون في الأردن؟</h3>
                            <p className="text-parliament-greenMain/70 font-bold max-w-xl mx-auto text-base">دليل لمراحل التشريع من المسودة الأولى وحتى النفاذ الرسمي</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative">
                            <div className="hidden lg:block absolute top-[56px] left-[10%] right-[10%] h-[3px] bg-gradient-to-r from-transparent via-parliament-accent/30 to-transparent -z-0"></div>
                            {legislativeSteps.map((step, index) => (
                                <div key={index} className="relative z-10 flex flex-col items-center group/step text-center">
                                    <div className={`w-28 h-28 ${step.bg} border-parliament-accent/40 rounded-[40px] border-4 flex items-center justify-center shadow-xl transition-all duration-500 group-hover/step:scale-110 group-hover/step:border-parliament-greenMain relative text-parliament-greenMain`}>
                                        <step.icon size={48} />
                                        <div className="absolute -top-4 -right-4 w-10 h-10 bg-parliament-accent text-parliament-greenMain font-black text-sm rounded-2xl flex items-center justify-center shadow-lg border-2 border-parliament-wall">
                                            {index + 1}
                                        </div>
                                    </div>
                                    <div className="mt-8 space-y-3 px-2">
                                        <div className="text-[10px] font-black text-parliament-accent uppercase bg-parliament-greenMain px-4 py-1.5 rounded-full inline-block border border-parliament-accent">
                                            {step.phase}
                                        </div>
                                        <h4 className="font-black text-parliament-greenMain text-xl leading-none">{step.title}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LawsView;
