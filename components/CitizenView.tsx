
import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, RefreshCw, AlertCircle, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { Law } from '../types';
import { getLaws } from '../services/api';

interface CitizenViewProps {
    onLawSelect?: (id: string) => void;
}

const CitizenView: React.FC<CitizenViewProps> = ({ onLawSelect }) => {
    const [laws, setLaws] = useState<Law[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userVotes, setUserVotes] = useState<Record<string, 'with' | 'against' | 'abstain'>>({});
    
    const loadLaws = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getLaws();
            setLaws(data);
        } catch (e) {
            setError('تعذر تحميل قائمة التشريعات.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLaws();
    }, []);

    const handleVote = (e: React.MouseEvent, lawId: string, vote: 'with' | 'against' | 'abstain') => {
        e.stopPropagation(); // Prevent triggering the card click
        setUserVotes(prev => ({
            ...prev,
            [lawId]: vote
        }));
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-red-50/50 rounded-lg border border-red-100 text-center parliament-card mt-8">
                <AlertCircle className="text-jordan-red mb-4 opacity-80" size={48} />
                <h3 className="text-parliament-marble font-bold text-lg mb-2">خطأ في الاتصال</h3>
                <p className="text-parliament-textMuted mb-6">{error}</p>
                <button onClick={loadLaws} className="flex items-center gap-2 bg-white px-6 py-2.5 rounded-md border border-parliament-wood/30 text-parliament-woodDark hover:border-parliament-wood hover:bg-parliament-wallWarm/10 font-bold transition-all shadow-sm">
                    <RefreshCw size={16} /> إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="mb-8 border-b border-parliament-wood/30 pb-6">
                <h2 className="text-3xl font-black text-parliament-greenMain">التشريعات والقوانين</h2>
                <p className="text-parliament-textMuted mt-2">استعرض مسودات القوانين وشارك في النقاش.</p>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-parliament-wall/30 h-32 rounded-xl animate-pulse border border-parliament-wood/10"></div>
                    ))
                ) : laws.length > 0 ? (
                    laws.map(law => (
                        <div key={law.id} className="parliament-card p-6 flex flex-col md:flex-row justify-between items-start gap-6 hover:shadow-md transition-shadow group">
                            <div className="flex-1 w-full">
                                <div className="flex gap-2 mb-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${law.status === 'passed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                        {law.status === 'passed' ? 'تم إقراره' : law.status}
                                    </span>
                                    {law.tags.map(t => <span key={t} className="text-[10px] bg-parliament-wall text-parliament-textMuted px-2 py-0.5 rounded border border-parliament-wood/20">{t}</span>)}
                                </div>
                                <h3 className="text-xl font-bold text-parliament-text mb-2 group-hover:text-parliament-greenMain transition-colors">{law.title}</h3>
                                <p className="text-parliament-textMuted text-sm line-clamp-2 mb-4">{law.description}</p>
                                
                                {/* Voting Interaction Section */}
                                <div className="flex items-center flex-wrap gap-4 pt-4 border-t border-parliament-wood/10">
                                    <span className="text-xs font-bold text-parliament-textMuted/70">ما رأيك؟</span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={(e) => handleVote(e, law.id, 'with')}
                                            className={`
                                                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 transform active:scale-95
                                                ${userVotes[law.id] === 'with' 
                                                    ? 'bg-green-600 text-white border-green-600 shadow-inner' 
                                                    : 'bg-white border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-sm hover:-translate-y-0.5'
                                                }
                                            `}
                                        >
                                            <ThumbsUp size={12} className={userVotes[law.id] === 'with' ? 'fill-white' : ''} />
                                            <span>أؤيد</span>
                                        </button>
                                        
                                        <button 
                                            onClick={(e) => handleVote(e, law.id, 'against')}
                                            className={`
                                                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 transform active:scale-95
                                                ${userVotes[law.id] === 'against' 
                                                    ? 'bg-red-600 text-white border-red-600 shadow-inner' 
                                                    : 'bg-white border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 hover:shadow-sm hover:-translate-y-0.5'
                                                }
                                            `}
                                        >
                                            <ThumbsDown size={12} className={userVotes[law.id] === 'against' ? 'fill-white' : ''} />
                                            <span>أعارض</span>
                                        </button>
                                        
                                        <button 
                                            onClick={(e) => handleVote(e, law.id, 'abstain')}
                                            className={`
                                                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 transform active:scale-95
                                                ${userVotes[law.id] === 'abstain' 
                                                    ? 'bg-parliament-text text-white border-parliament-text shadow-inner' 
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5'
                                                }
                                            `}
                                        >
                                            <Minus size={12} />
                                            <span>محايد</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => onLawSelect && onLawSelect(law.id)}
                                className="bg-parliament-wall/20 text-parliament-woodDark hover:bg-parliament-greenMain hover:text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 border border-parliament-wood/20 transition-all whitespace-nowrap self-start md:self-center mt-4 md:mt-0 active:scale-95"
                            >
                                <FileText size={16} /> التفاصيل
                            </button>
                        </div>
                    ))
                ) : (
                     <div className="text-center py-16 bg-parliament-wall/20 rounded-xl border-2 border-dashed border-parliament-wood/20">
                        <BookOpen className="mx-auto text-parliament-wood/40 mb-4" size={32} />
                        <p className="text-parliament-greenMain font-bold text-lg">لا توجد تشريعات متاحة حالياً.</p>
                        <p className="text-xs text-parliament-textMuted mt-1">يرجى إضافة بيانات إلى قاعدة البيانات.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CitizenView;
