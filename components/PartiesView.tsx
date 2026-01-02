
import React, { useState, useEffect } from 'react';
import { Users, Landmark, Layers, Shield, Search, Info, ChevronLeft, Clock, History } from 'lucide-react';
import { Party, MP, BlocMembership } from '../types';
import { getParties, getMPs, getBlocMemberships } from '../services/api';

interface Bloc {
    id: string;
    name: string;
    totalSeats: number;
    leadParty: string;
    color: string;
    description: string;
}

interface PartiesViewProps {
    onPartySelect?: (id: string) => void;
    onMpSelect?: (name: string) => void;
}

const PartiesView: React.FC<PartiesViewProps> = ({ onPartySelect, onMpSelect }) => {
    const [viewMode, setViewMode] = useState<'parties' | 'blocs'>('blocs');
    const [expandedBlocId, setExpandedBlocId] = useState<string | null>(null);
    const [selectedTerm, setSelectedTerm] = useState<1 | 2>(2);
    const [parties, setParties] = useState<Party[]>([]);
    const [blocs, setBlocs] = useState<Bloc[]>([]);
    const [mps, setMps] = useState<MP[]>([]);
    const [blocMemberships, setBlocMemberships] = useState<BlocMembership[]>([]);
    const [loading, setLoading] = useState(true);

    const [allBlocsData, setAllBlocsData] = useState<any[]>([]);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                // Load parties from parties.json instead of API
                const partiesResponse = await fetch('/data/parties.json');
                let partiesData = [];

                if (partiesResponse.ok) {
                    partiesData = await partiesResponse.json();
                } else {
                    // Fallback to old API if parties.json doesn't exist
                    partiesData = await getParties();
                }

                setParties(partiesData.sort((a, b) => b.totalSeats - a.totalSeats));

                const mpsData = await getMPs();
                setMps(mpsData);

                const blocsResponse = await fetch('/data/blocs.json');
                if (blocsResponse.ok) {
                    const sessionsData = await blocsResponse.json();
                    setAllBlocsData(sessionsData);
                }
            } catch (e) {
                console.error("Error loading parties/blocs data:", e);
            }
            setLoading(false);
        };
        loadInitialData();
    }, []);

    // Effect to update displayed blocs when term or data changes
    useEffect(() => {
        if (allBlocsData.length > 0) {
            const sessionKey = selectedTerm === 1 ? 'ordinary_1' : 'ordinary_2';
            const sessionObj = allBlocsData.find((s: any) => s.id === sessionKey);
            if (sessionObj && sessionObj.blocs) {
                setBlocs(sessionObj.blocs);
            } else {
                setBlocs([]);
            }
        }
    }, [selectedTerm, allBlocsData]);

    useEffect(() => {
        if (viewMode === 'blocs') {
            const loadMemberships = async () => {
                const data = await getBlocMemberships(selectedTerm);
                setBlocMemberships(data);
            };
            loadMemberships();
        }
    }, [selectedTerm, viewMode]);

    const getBlocMembers = (blocName: string) => {
        // If viewing current data or specific term
        return blocMemberships.filter(m => m.blocName === blocName);
    };

    const getPartyMembers = (partyName: string) => {
        return mps.filter(mp => mp.party === partyName);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 text-parliament-textMuted gap-4">
            <div className="w-12 h-12 border-4 border-parliament-wall border-t-parliament-wood rounded-full animate-spin"></div>
            <p className="font-black animate-pulse">جاري تحميل الخارطة السياسية والكتلوية...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <header className="bg-white p-8 md:p-12 rounded-[40px] border border-parliament-wood/20 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-parliament-wood/20"></div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-parliament-wall/50 rounded-3xl text-parliament-greenMain shadow-inner">
                            <Landmark size={36} />
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-parliament-greenMain">مكونات المجلس العشرين</h2>
                            <p className="text-parliament-textMuted font-bold mt-1">تتبع الهوية الحزبية والائتلافات البرلمانية تحت القبة</p>
                        </div>
                    </div>

                    <div className="flex bg-parliament-wall/40 p-1.5 rounded-2xl border border-parliament-wood/10 shadow-inner">
                        <button
                            onClick={() => { setViewMode('blocs'); setExpandedBlocId(null); }}
                            className={`px-8 py-3.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${viewMode === 'blocs' ? 'bg-white text-parliament-greenMain shadow-xl scale-105' : 'text-parliament-textMuted hover:text-parliament-text'}`}
                        >
                            <Layers size={18} /> الكتل البرلمانية
                        </button>
                        <button
                            onClick={() => setViewMode('parties')}
                            className={`px-8 py-3.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${viewMode === 'parties' ? 'bg-white text-parliament-greenMain shadow-xl scale-105' : 'text-parliament-textMuted hover:text-parliament-text'}`}
                        >
                            <Shield size={18} /> الأحزاب السياسية
                        </button>
                    </div>
                </div>

                {/* Term Switcher - Only visible for Blocs */}
                {viewMode === 'blocs' && (
                    <div className="mt-8 pt-8 border-t border-parliament-wall flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-parliament-textMuted uppercase tracking-tighter">عرض حسب الدورة:</span>
                            <div className="flex bg-parliament-wall/60 p-1 rounded-xl border border-parliament-wood/5">
                                <button
                                    onClick={() => setSelectedTerm(2)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all flex items-center gap-2 ${selectedTerm === 2 ? 'bg-parliament-greenMain text-white shadow-md' : 'text-parliament-textMuted hover:text-parliament-greenMain'}`}
                                >
                                    <Clock size={12} /> العادية الثانية (الحالية)
                                </button>
                                <button
                                    onClick={() => setSelectedTerm(1)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all flex items-center gap-2 ${selectedTerm === 1 ? 'bg-parliament-wood text-white shadow-md' : 'text-parliament-textMuted hover:text-parliament-wood'}`}
                                >
                                    <History size={12} /> العادية الأولى
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-parliament-textMuted bg-parliament-wall px-3 py-1 rounded-full border border-parliament-wood/10">
                            <Info size={12} className="text-parliament-wood" />
                            تتغير عضوية الكتل من دورة إلى أخرى بسبب الاستقالات أو الائتلافات الجديدة.
                        </div>
                    </div>
                )}

                <div className="mt-8 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4 text-sm text-blue-900 leading-relaxed shadow-sm">
                    <Info size={22} className="shrink-0 text-blue-600" />
                    <div className="font-bold">
                        {viewMode === 'blocs'
                            ? `الكتل البرلمانية (${selectedTerm === 1 ? 'الدورة الأولى' : 'الدورة الثانية'}): هي التجمعات الفعلية للنواب تحت القبة. تتبدل هذه الكتل في مطلع كل دورة عادية.`
                            : "الأحزاب السياسية: تعكس الهوية الحزبية التي ترشح بموجبها النائب، سواء فاز عبر القائمة الوطنية أو الدوائر المحلية."}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {viewMode === 'blocs' ? (
                    blocs.map(bloc => {
                        const members = getBlocMembers(bloc.name);
                        const isExpanded = expandedBlocId === bloc.id;

                        return (
                            <div key={bloc.id} className={`parliament-card group bg-white hover:shadow-2xl transition-all duration-500 border-t-8 flex flex-col rounded-[32px] overflow-hidden ${isExpanded ? 'row-span-2' : ''}`} style={{ borderTopColor: bloc.color }}>
                                <div className="p-8 pb-4">
                                    <div className="flex justify-between items-start mb-8">
                                        <h3 className="font-black text-2xl text-parliament-greenMain leading-tight group-hover:text-parliament-woodDark transition-colors">{bloc.name}</h3>
                                        <div className="bg-parliament-greenMain text-white px-4 py-2 rounded-2xl text-lg font-black whitespace-nowrap shadow-lg">
                                            {members.length || 0}
                                            <span className="text-[10px] mr-1 opacity-80 uppercase tracking-tighter">عضو</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-parliament-wall/20 rounded-2xl border border-parliament-wood/10 mb-4">
                                        <Users className="text-parliament-wood" size={24} />
                                        <div>
                                            <div className="text-[10px] font-black text-parliament-textMuted uppercase">في الدورة المختارة</div>
                                            <div className="text-xl font-black text-parliament-text">{members.length} نائباً</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto border-t border-parliament-wall">
                                    <button
                                        onClick={() => setExpandedBlocId(isExpanded ? null : bloc.id)}
                                        className={`w-full py-4 text-xs font-black transition-all flex items-center justify-center gap-2 ${isExpanded ? 'bg-parliament-wood text-white' : 'bg-parliament-wall/30 text-parliament-greenMain hover:bg-parliament-greenMain hover:text-white'}`}
                                    >
                                        {isExpanded ? 'إخفاء الأعضاء' : 'عرض أعضاء الكتلة'}
                                        {isExpanded ? <ChevronLeft size={14} className="rotate-90" /> : <ChevronLeft size={14} className="-rotate-90" />}
                                    </button>

                                    {isExpanded && (
                                        <div className="bg-parliament-wall/10 p-4 animate-fade-in max-h-96 overflow-y-auto custom-scrollbar">
                                            <div className="grid grid-cols-1 gap-2">
                                                {members.sort((a, b) => a.memberName.localeCompare(b.memberName, 'ar')).map((m, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => onMpSelect && onMpSelect(m.memberName)}
                                                        className="flex items-center gap-3 p-2 bg-white rounded-xl border border-parliament-wood/5 text-sm font-bold text-parliament-text shadow-sm hover:shadow-md hover:border-parliament-greenMain hover:text-parliament-greenMain transition-all w-full text-right"
                                                    >
                                                        <span className="w-6 h-6 bg-parliament-wall text-[10px] flex items-center justify-center rounded-full text-parliament-woodDark font-black">{idx + 1}</span>
                                                        {m.memberName}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    parties.map(party => {
                        const members = getPartyMembers(party.name);
                        const localSeats = party.localSeats || 0;
                        const nationalSeats = party.nationalListSeats || 0;
                        const totalSeats = party.totalSeats || members.length;

                        return (
                            <div key={party.id} className="parliament-card group bg-white p-8 hover:shadow-2xl transition-all duration-500 border-r-8 flex flex-col h-full rounded-[32px] overflow-hidden" style={{ borderRightColor: party.color }}>
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="font-black text-xl text-parliament-greenMain group-hover:text-parliament-woodDark transition-colors leading-tight">{party.name}</h3>
                                    <Shield size={24} className="text-parliament-wood opacity-20" />
                                </div>

                                <div className="space-y-6 flex-1">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-bold text-parliament-textMuted uppercase">إجمالي المقاعد</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-parliament-greenMain">{totalSeats}</span>
                                            <span className="text-xs text-parliament-textMuted font-bold">مقعد</span>
                                        </div>
                                    </div>

                                    {/* المقاعد العامة */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-black text-parliament-textMuted">
                                            <span className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                الدائرة العامة
                                            </span>
                                            <span>{nationalSeats} مقعد</span>
                                        </div>
                                        <div className="w-full bg-parliament-wall/40 h-2.5 rounded-full overflow-hidden shadow-inner border border-parliament-wood/10">
                                            <div
                                                className="h-full shadow-lg transition-all duration-1000 ease-out bg-blue-500"
                                                style={{ width: `${totalSeats > 0 ? (nationalSeats / totalSeats) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* المقاعد المحلية */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-black text-parliament-textMuted">
                                            <span className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: party.color }}></div>
                                                الدوائر المحلية
                                            </span>
                                            <span>{localSeats} مقعد</span>
                                        </div>
                                        <div className="w-full bg-parliament-wall/40 h-2.5 rounded-full overflow-hidden shadow-inner border border-parliament-wood/10">
                                            <div
                                                className="h-full shadow-lg transition-all duration-1000 ease-out"
                                                style={{
                                                    backgroundColor: party.color,
                                                    width: `${totalSeats > 0 ? (localSeats / totalSeats) * 100 : 0}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* ملاحظة إن وجدت */}
                                    {party.note && (
                                        <div className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 font-bold">
                                            ℹ️ {party.note}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default PartiesView;
