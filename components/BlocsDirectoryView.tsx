
import React, { useState, useEffect } from 'react';
import { Layers, Search, ChevronDown, ChevronUp, Users, History, Clock } from 'lucide-react';
import { getBlocMemberships } from '../services/api';
import { BlocMembership } from '../types';
import { normalizeForSearch } from '../utils/dataProcessing';

const BlocsDirectoryView: React.FC = () => {
    const [activeTerm, setActiveTerm] = useState<1 | 2>(2);
    const [members, setMembers] = useState<BlocMembership[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedBloc, setExpandedBloc] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await getBlocMemberships(activeTerm);
            setMembers(data);
            setLoading(false);
        };
        load();
    }, [activeTerm]);

    // Group members by bloc
    const blocsMap = members.reduce((acc, m) => {
        if (!acc[m.blocName]) acc[m.blocName] = [];
        acc[m.blocName].push(m.memberName);
        return acc;
    }, {} as Record<string, string[]>);

    const filteredBlocNames = Object.keys(blocsMap).filter(blocName => {
        if (!searchQuery) return true;
        const normalizedQuery = normalizeForSearch(searchQuery);
        // Match bloc name or any member in the bloc
        return normalizeForSearch(blocName).includes(normalizedQuery) || 
               blocsMap[blocName].some(m => normalizeForSearch(m).includes(normalizedQuery));
    });

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-parliament-wood/20 pb-8">
                <div>
                    <h2 className="text-3xl font-black text-parliament-greenMain flex items-center gap-3">
                        <Layers className="text-parliament-wood" size={32} />
                        هيكلية الكتل النيابية
                    </h2>
                    <p className="text-parliament-textMuted mt-2 text-lg font-bold">استعرض توزع النواب داخل الكتل حسب الدورة البرلمانية.</p>
                </div>

                <div className="flex bg-parliament-wall/40 p-1.5 rounded-2xl border border-parliament-wood/10 shadow-inner">
                    <button 
                        onClick={() => setActiveTerm(2)}
                        className={`px-6 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTerm === 2 ? 'bg-parliament-greenMain text-white shadow-lg' : 'text-parliament-textMuted hover:text-parliament-greenMain'}`}
                    >
                        <Clock size={16} /> الدورة العادية الثانية
                    </button>
                    <button 
                        onClick={() => setActiveTerm(1)}
                        className={`px-6 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTerm === 1 ? 'bg-parliament-wood text-white shadow-lg' : 'text-parliament-textMuted hover:text-parliament-wood'}`}
                    >
                        <History size={16} /> الدورة العادية الأولى
                    </button>
                </div>
            </header>

            <div className="max-w-2xl mx-auto">
                <div className="relative group">
                    <input 
                        type="text" 
                        placeholder="ابحث عن اسم نائب أو كتلة..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border-2 border-parliament-wood/20 rounded-2xl pl-4 pr-12 py-4 font-bold focus:outline-none focus:border-parliament-greenMain transition-all shadow-sm"
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-parliament-textMuted group-focus-within:text-parliament-greenMain transition-colors" size={24} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                    Array(4).fill(0).map((_, i) => <div key={i} className="h-20 bg-parliament-wall/30 animate-pulse rounded-2xl"></div>)
                ) : filteredBlocNames.length > 0 ? (
                    filteredBlocNames.map(blocName => (
                        <div key={blocName} className="bg-white rounded-3xl border border-parliament-wood/10 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <button 
                                onClick={() => setExpandedBloc(expandedBloc === blocName ? null : blocName)}
                                className="w-full flex items-center justify-between p-6 hover:bg-parliament-wall/20 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-parliament-wall rounded-2xl flex items-center justify-center text-parliament-wood shadow-inner border border-parliament-wood/10">
                                        <Users size={24} />
                                    </div>
                                    <div className="text-right">
                                        <h3 className="font-black text-parliament-greenMain text-lg">{blocName}</h3>
                                        <p className="text-[10px] font-black text-parliament-textMuted uppercase tracking-widest">{blocsMap[blocName].length} عضواً</p>
                                    </div>
                                </div>
                                {expandedBloc === blocName ? <ChevronUp size={20} className="text-parliament-wood" /> : <ChevronDown size={20} className="text-parliament-wood" />}
                            </button>

                            {expandedBloc === blocName && (
                                <div className="p-6 bg-parliament-wall/10 border-t border-parliament-wall animate-fade-in">
                                    <div className="grid grid-cols-1 gap-2">
                                        {blocsMap[blocName].sort().map((name, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-parliament-wood/5 text-sm font-bold text-parliament-text">
                                                <span className="w-6 h-6 bg-parliament-wall text-[10px] flex items-center justify-center rounded-full text-parliament-woodDark">{idx + 1}</span>
                                                {name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-parliament-wall">
                        <p className="text-parliament-textMuted font-black">لا توجد نتائج تطابق بحثك في هذه الدورة.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlocsDirectoryView;
