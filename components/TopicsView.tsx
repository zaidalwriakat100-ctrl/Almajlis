import React, { useState, useEffect } from 'react';
import { Search, Tag, Mic, Calendar, ChevronLeft, Loader2, Landmark, User, Hash, Bell, Play, Mic2, Minus } from 'lucide-react';
import { getSessions, addSubscription, getUserEmail, setUserEmail, searchTranscripts } from '../services/api';
import { getAllSegments, normalizeForSearch } from '../utils/dataProcessing';
import { TranscriptSegment, ParliamentSession, TranscriptMatch } from '../types';
import SubscriptionModal from './SubscriptionModal';

interface SpeakerStat {
    name: string;
    count: number;
}

interface TopicsViewProps {
    initialQuery?: string;
    onSessionSelect?: (id: string, segmentId?: string) => void;
}

const TopicsView: React.FC<TopicsViewProps> = ({ initialQuery = '', onSessionSelect }) => {
    // Existing States
    const [allSessions, setAllSessions] = useState<ParliamentSession[]>([]);

    // Search & Results States
    const [query, setQuery] = useState(initialQuery);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<TranscriptMatch[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    // Filter Logic
    const [filterSpeaker, setFilterSpeaker] = useState<string | null>(null);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingTerm, setPendingTerm] = useState('');

    useEffect(() => {
        getSessions().then(data => {
            setAllSessions(data);
        });
    }, []);

    // Initial query handling
    useEffect(() => {
        if (initialQuery) {
            setQuery(initialQuery);
            handleSearch(undefined, initialQuery);
        }
    }, [initialQuery]);

    const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
        if (e) e.preventDefault();
        const searchTerm = overrideQuery || query;

        if (!searchTerm || searchTerm.trim().length < 2) {
            setSearchResults([]);
            setHasSearched(false);
            return;
        }

        setIsSearching(true);
        setHasSearched(true);
        setFilterSpeaker(null); // Reset filters on new search

        try {
            const matches = await searchTranscripts(searchTerm);
            setSearchResults(matches);
        } catch (error) {
            console.error("Search failed:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubscribe = (value: string) => {
        const email = getUserEmail();
        if (!email) {
            setPendingTerm(value);
            setIsModalOpen(true);
        } else {
            addSubscription('keyword', value);
            alert(`تمت إضافة "${value}" لموجزك الموحد.`);
        }
    };

    const handleModalConfirm = (email: string) => {
        setUserEmail(email);
        addSubscription('keyword', pendingTerm);
        setIsModalOpen(false);
        setPendingTerm('');
    };

    const processSpeakerStats = () => {
        const stats: Record<string, number> = {};
        searchResults.forEach(match => {
            stats[match.speakerName] = (stats[match.speakerName] || 0) + 1;
        });
        return Object.entries(stats)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    };

    const [currentResultIndex, setCurrentResultIndex] = useState(0);

    const filteredResults = filterSpeaker
        ? searchResults.filter(r => r.speakerName === filterSpeaker)
        : searchResults;

    // Reset indicator when results change
    useEffect(() => {
        setCurrentResultIndex(0);
    }, [filteredResults.length, filterSpeaker]);

    const scrollToResult = (index: number) => {
        setCurrentResultIndex(index);
        const element = document.getElementById(`result-${index}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const handleNext = () => {
        const nextIndex = (currentResultIndex + 1) % filteredResults.length;
        scrollToResult(nextIndex);
    };

    const handlePrev = () => {
        const prevIndex = (currentResultIndex - 1 + filteredResults.length) % filteredResults.length;
        scrollToResult(prevIndex);
    };

    /**
     * تمييز الكلمات المبحوث عنها بطريقة ذكية
     * تقوم هذه الدالة بتمييز كافة الكلمات المدخلة في البحث بغض النظر عن ترتيبها أو اختلاف الأحرف (أ، إ، ه، ة)
     */
    const HighlightedText = ({ text, highlight, resultIndex }: { text: string, highlight: string, resultIndex: number }) => {
        if (!highlight.trim()) return <>{text}</>;

        const searchWords = normalizeForSearch(highlight)
            .split(/\s+/)
            .filter(w => w.length > 1); // فقط الكلمات التي تزيد عن حرف واحد لتجنب التمييز الخاطئ

        if (searchWords.length === 0) return <>{text}</>;

        // استراتيجية التمييز: تقسيم النص بناءً على الكلمات المبحوث عنها مع مراعاة التطبيع (Normalization)
        // سنبحث عن الكلمات في النص الأصلي باستخدام Regex يدعم كافة المتغيرات
        let lastIdx = 0;
        const result: (string | React.ReactNode)[] = [];

        // بناء Regex يبحث عن أي من الكلمات
        // نحتاج لتمثيل الكلمات بمرونة (مثلاً: ا|أ|إ|آ)
        const flexibleQuery = searchWords.map(word =>
            word.replace(/[أإآا]/g, '[أإآا]')
                .replace(/[هة]/g, '[هة]')
                .replace(/[يى]/g, '[يى]')
        ).join('|');

        try {
            const regex = new RegExp(`(${flexibleQuery})`, 'gi');
            const parts = text.split(regex);

            return (
                <>
                    {parts.map((part, i) => {
                        const normalizedPart = normalizeForSearch(part);
                        const isMatch = searchWords.some(w => normalizedPart.includes(w) || w.includes(normalizedPart));

                        return isMatch ? (
                            <span
                                key={i}
                                className={`px-0.5 rounded-sm font-black transition-all duration-300 ${resultIndex === currentResultIndex ? 'bg-[#2D463E] text-white ring-1 ring-[#B18154]' : 'bg-[#B18154]/20 text-[#B18154]'}`}
                            >
                                {part}
                            </span>
                        ) : part;
                    })}
                </>
            );
        } catch (e) {
            return <>{text}</>;
        }
    };

    const generalTopics = [
        'الاقتصاد', 'البطالة', 'غزة', 'التعليم', 'الصحة',
        'الموازنة', 'الفساد', 'المياه', 'الطاقة', 'الاستثمار'
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-24" dir="rtl">
            <SubscriptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleModalConfirm}
                targetName={pendingTerm}
            />

            {/* Header Section */}
            <header className="bg-gradient-to-br from-[#1A2E28] to-[#2D463E] p-12 md:p-16 rounded-[50px] shadow-2xl relative overflow-hidden text-center group mb-12">
                <div className="absolute inset-0 opacity-10 pattern-mashrabiyya scale-110 group-hover:scale-105 transition-transform duration-1000"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#B18154] blur-[100px] opacity-30 rounded-full"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#B18154] blur-[100px] opacity-20 rounded-full"></div>

                <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[#B18154] text-[10px] font-black uppercase tracking-widest mb-4">
                            <Hash size={12} /> محرك بحث القضايا
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                            القضايا <span className="text-[#B18154]">والمواضيع</span>
                        </h2>
                        <p className="text-white/70 font-bold text-lg max-w-xl mx-auto leading-relaxed">
                            ابحث في أرشيف المداخلات، وتعرف على مواقف النواب تجاه القضايا الوطنية المفصلية.
                        </p>
                    </div>

                    <form onSubmit={(e) => handleSearch(e)} className="relative group/input">
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-white/50 group-focus-within/input:text-[#B18154] transition-colors">
                            <Search size={24} />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="ابحث عن قضية (مثلاً: الموازنة، الإعفاءات، المخدرات)..."
                            className="w-full bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-[#2D463E] placeholder-white/40 rounded-2xl py-6 pr-14 pl-6 text-lg font-black border-2 border-white/10 focus:border-[#B18154] outline-none shadow-xl transition-all duration-300"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => {
                                    setQuery('');
                                    setSearchResults([]);
                                    setHasSearched(false);
                                }}
                                className="absolute inset-y-0 left-4 flex items-center text-white/50 hover:text-white transition-colors"
                            >
                                <span className="bg-white/10 hover:bg-white/20 p-1 rounded-full"><Minus size={16} className="rotate-45" /></span>
                            </button>
                        )}
                        <button type="submit" className="hidden">بحث</button>
                    </form>

                    {/* Popular Topics Tags */}
                    <div className="flex flex-wrapjustify-center gap-2 pt-4">
                        {generalTopics.map(topic => (
                            <button
                                key={topic}
                                onClick={() => {
                                    setQuery(topic);
                                    handleSearch(undefined, topic);
                                }}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white/80 hover:text-white transition-all backdrop-blur-sm"
                            >
                                #{topic}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Results Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {hasSearched && searchResults.length > 0 && (
                        <div className="bg-white p-6 rounded-[32px] border border-parliament-wood/10 shadow-sm sticky top-24">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-parliament-wall">
                                <h3 className="font-black text-[#2D463E] text-sm flex items-center gap-2">
                                    <User size={16} className="text-[#B18154]" /> المتحدثون الأبرز
                                </h3>
                                <span className="text-[10px] bg-parliament-wall px-2 py-1 rounded-lg font-bold text-parliament-textMuted">{searchResults.length} نتيجة</span>
                            </div>
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                                {processSpeakerStats().map(stat => (
                                    <button
                                        key={stat.name}
                                        onClick={() => setFilterSpeaker(filterSpeaker === stat.name ? null : stat.name)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all border ${filterSpeaker === stat.name ? 'bg-[#2D463E] text-white border-[#2D463E] shadow-md' : 'bg-[#F2F0EA]/50 text-[#6B6862] hover:bg-[#F2F0EA] border-transparent'}`}
                                    >
                                        <span className="truncate">{stat.name}</span>
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] ${filterSpeaker === stat.name ? 'bg-white/20 text-white' : 'bg-[#B18154]/10 text-[#B18154]'}`}>{stat.count}</span>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => handleSubscribe(query)}
                                className="w-full mt-6 py-3 bg-[#B18154]/10 hover:bg-[#B18154] text-[#B18154] hover:text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 group"
                            >
                                <Bell size={16} className="group-hover:animate-swing" />
                                تنبيهات لهذا الموضوع
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Results List */}
                <div className="lg:col-span-3 space-y-6">
                    {isSearching ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={48} className="text-[#B18154] animate-spin mb-4" />
                            <p className="font-bold text-[#6B6862] animate-pulse">جاري البحث في الأرشيف...</p>
                        </div>
                    ) : hasSearched ? (
                        filteredResults.length > 0 ? (
                            <>
                                {/* Floating Search Navigator */}
                                <div className="sticky top-24 z-30 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-[#B18154]/20 shadow-lg flex items-center justify-between animate-slide-down">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-[#2D463E] text-white px-4 py-2 rounded-xl text-xs font-black shadow-inner">
                                            النتيجة {currentResultIndex + 1} من {filteredResults.length}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handlePrev}
                                            className="p-2 bg-[#F2F0EA] hover:bg-[#B18154] text-[#2D463E] hover:text-white rounded-xl transition-all active:scale-90"
                                            title="النتيجة السابقة"
                                        >
                                            <ChevronLeft size={20} className="rotate-180" />
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="p-2 bg-[#F2F0EA] hover:bg-[#B18154] text-[#2D463E] hover:text-white rounded-xl transition-all active:scale-90"
                                            title="النتيجة التالية"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                    </div>
                                </div>

                                {filteredResults.map((result, idx) => (
                                    <div
                                        key={idx}
                                        id={`result-${idx}`}
                                        className={`bg-white p-6 rounded-[32px] border transition-all duration-500 group flex flex-col md:flex-row gap-6 items-start animate-fade-in ${idx === currentResultIndex ? 'ring-2 ring-[#B18154] border-transparent shadow-2xl scale-[1.02] bg-gradient-to-br from-white to-[#F2F0EA]/30' : 'border-parliament-wood/10 shadow-sm opacity-80'}`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shrink-0 md:mt-1 border transition-colors ${idx === currentResultIndex ? 'bg-[#B18154] text-white border-white' : 'bg-[#F2F0EA] text-[#B18154] border-[#B18154]/10'}`}>
                                            {idx === currentResultIndex ? <Mic size={24} /> : <Mic2 size={24} />}
                                        </div>
                                        <div className="flex-1 space-y-3 font-arabic">
                                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-wider">
                                                <span className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${idx === currentResultIndex ? 'bg-[#2D463E] text-white' : 'bg-[#2D463E]/80 text-white'}`}><User size={12} /> {result.speakerName}</span>
                                                <span className="bg-[#F2F0EA] text-[#6B6862] px-3 py-1.5 rounded-lg flex items-center gap-1.5"><Calendar size={12} /> {result.sessionDate}</span>
                                                <button
                                                    onClick={() => onSessionSelect && onSessionSelect(result.sessionId)}
                                                    className="text-[#B18154] hover:underline px-2 transition-colors font-black"
                                                >
                                                    {result.sessionTitle}
                                                </button>
                                            </div>

                                            <div className="relative">
                                                <div className={`absolute -right-3 top-0 bottom-0 w-1 rounded-full transition-colors ${idx === currentResultIndex ? 'bg-[#B18154]' : 'bg-[#B18154]/20'}`}></div>
                                                <p className={`font-bold text-base leading-loose pr-4 whitespace-pre-line transition-colors ${idx === currentResultIndex ? 'text-[#1A2E28]' : 'text-[#2D463E]'}`}>
                                                    "...<HighlightedText text={result.text} highlight={query} resultIndex={idx} />..."
                                                </p>
                                            </div>

                                        </div>
                                    </div>
                                ))}</>
                        ) : (
                            <div className="text-center py-20 bg-white/50 rounded-[40px] border-2 border-dashed border-[#B18154]/20">
                                <Search size={48} className="mx-auto text-[#B18154]/20 mb-4" />
                                <h4 className="text-xl font-black text-[#6B6862] mb-2">لم يتم العثور على نتائج</h4>
                                <p className="text-[#6B6862]/60 text-sm">حاول البحث بكلمات أخرى أو تحقق من الإملاء.</p>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-40">
                            <Landmark size={80} className="text-[#B18154] mb-6 grayscale opacity-30" />
                            <p className="font-black text-xl text-[#2D463E]">ابدأ بكتابة موضوع البحث أعلاه</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopicsView;
