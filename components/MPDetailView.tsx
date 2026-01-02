
import React, { useState, useEffect } from 'react';
import { ArrowRight, MapPin, Twitter, Link as LinkIcon, Award, Mail, Calendar, Mic, History, ChevronLeft, HelpCircle, Bell, BellRing, Play, Landmark } from 'lucide-react';
import { MP, ParliamentSession, TranscriptSegment } from '../types';
import { getSessions, addSubscription, getSubscriptions, getUserEmail, setUserEmail } from '../services/api';
import { getSegmentsForMP, getMPInterventionHistory } from '../utils/dataProcessing';
import ImageWithFallback from './ImageWithFallback';
import SubscriptionModal from './SubscriptionModal';

interface MPDetailViewProps {
    mp: MP;
    onBack: () => void;
    onSessionClick?: (id: string, segmentId?: string) => void;
    onCommitteeClick?: (committeeName: string, session: string) => void;
}

const MPDetailView: React.FC<MPDetailViewProps> = ({ mp, onBack, onSessionClick, onCommitteeClick }) => {
    const [activeTab, setActiveTab] = useState<'speeches' | 'committees'>('speeches');
    const [committeeTerm, setCommitteeTerm] = useState<'first' | 'second'>('first');
    const [mpSegments, setMpSegments] = useState<TranscriptSegment[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFollowed, setIsFollowed] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const allSessions = await getSessions();
            const segments = getSegmentsForMP(mp.id, [mp], allSessions);
            setMpSegments(segments);
            const interventionHistory = getMPInterventionHistory(segments, allSessions, mp.fullName);
            setHistory(interventionHistory);

            const subs = getSubscriptions();
            setIsFollowed(subs.some(s => s.type === 'speaker' && s.value === mp.fullName));
            setLoading(false);
        };
        loadData();
    }, [mp]);

    const handleFollow = () => {
        setIsModalOpen(true);
    };

    const handleModalConfirm = (email: string) => {
        setUserEmail(email);
        addSubscription('speaker', mp.fullName);
        setIsFollowed(true);
        setIsModalOpen(false);
    };

    const getCommitteesFromMemberships = (term: 'first' | 'second') => {
        const sessionCode = term === 'first' ? 'ordinary_1' : 'ordinary_2';
        const membership = mp.memberships?.find(m => m.session === sessionCode);
        if (!membership || !membership.committees) return null;

        return membership.committees.map(name => ({
            committeeName: name,
            role: 'member' as const
        }));
    };

    const currentCommittees = getCommitteesFromMemberships(committeeTerm) || (committeeTerm === 'first'
        ? mp.committeeTerms?.firstOrdinary
        : mp.committeeTerms?.secondOrdinary);

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-parliament-textMuted hover:text-parliament-greenMain transition-colors font-bold group"
            >
                <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
                العودة لقائمة النواب
            </button>

            {/* Header Profile Card */}
            <div className="bg-white rounded-[32px] border border-parliament-wood/20 shadow-xl overflow-hidden relative">
                {/* Modern Decorative Background */}
                <div className="h-40 bg-curtain-gradient relative overflow-hidden">
                    <div className="absolute inset-0 pattern-mashrabiyya opacity-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E28] to-transparent"></div>
                </div>

                <div className="px-6 md:px-10 pb-8 relative">
                    <div className="flex flex-col md:flex-row items-end gap-6 -mt-20">
                        {/* صورة النائب بتصميم أفخم */}
                        <div className="relative group shrink-0">
                            <div className="absolute -inset-1 bg-gradient-to-br from-[#B18154] to-[#2D463E] rounded-[28px] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative bg-white p-1.5 rounded-[26px] shadow-2xl border border-white">
                                <ImageWithFallback
                                    src={mp.photoUrl}
                                    alt={mp.fullName}
                                    className="w-40 h-40 md:w-48 md:h-48 rounded-[20px] object-cover bg-parliament-wall"
                                />
                            </div>
                        </div>

                        {/* معلومات النائب - موزعة بشكل أفضل */}
                        <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-end w-full pb-2">
                            <div className="space-y-4 flex-1">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl md:text-4xl font-black text-[#1A2E28] tracking-tight">
                                        {mp.fullName}
                                    </h1>
                                    <button
                                        onClick={handleFollow}
                                        className={`flex items-center gap-2 px-5 py-2 rounded-2xl text-xs font-black transition-all shadow-sm ${isFollowed ? 'bg-[#2D463E] text-white' : 'bg-[#F2F0EA] text-[#B18154] hover:bg-[#B18154] hover:text-white'}`}
                                    >
                                        {isFollowed ? <BellRing size={16} /> : <Bell size={16} />}
                                        {isFollowed ? 'مُتابع' : 'تلقي تنبيهات'}
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="flex items-center gap-2 bg-[#F8F7F2] text-[#6B6862] px-4 py-2 rounded-xl text-sm font-bold border border-slate-100">
                                        <MapPin size={14} className="text-[#B18154]" />
                                        {mp.governorate} • {mp.district}
                                    </span>
                                    {mp.party && (
                                        <span className="flex items-center gap-2 bg-[#2D463E]/5 text-[#2D463E] px-4 py-2 rounded-xl text-sm font-black border border-[#2D463E]/10">
                                            {mp.party}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* أزرار التواصل بشكل أنيق الموضع */}
                            <div className="flex items-center gap-3 mt-6 md:mt-0">
                                {mp.officialProfileUrl && (
                                    <a href={mp.officialProfileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-[#B18154] text-white rounded-2xl text-sm font-black hover:bg-[#8B633F] transition-all shadow-lg shadow-[#B18154]/20">
                                        <LinkIcon size={16} /> الملف الرسمي
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">

                    <div className="flex border-b border-parliament-wood/20 bg-white rounded-t-lg overflow-hidden">
                        <button
                            onClick={() => setActiveTab('speeches')}
                            className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'speeches' ? 'text-parliament-greenMain bg-parliament-greenMain/5 border-b-2 border-parliament-greenMain' : 'text-parliament-textMuted hover:bg-parliament-wall/20'}`}
                        >
                            <Mic size={16} /> المداخلات والاهتمامات
                        </button>
                        <button
                            onClick={() => setActiveTab('committees')}
                            className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'committees' ? 'text-parliament-greenMain bg-parliament-greenMain/5 border-b-2 border-parliament-greenMain' : 'text-parliament-textMuted hover:bg-parliament-wall/20'}`}
                        >
                            <Award size={16} /> اللجان والعضويات
                        </button>
                    </div>

                    {activeTab === 'speeches' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Intervention History - Timeline Design */}
                            <section className="bg-white p-6 rounded-xl border border-parliament-wood/20 shadow-sm">
                                <h3 className="font-black text-parliament-greenDark mb-8 flex items-center gap-2 border-b border-parliament-wall pb-4">
                                    <History size={20} className="text-parliament-wood" />
                                    سجل المداخلات البرلمانية
                                </h3>

                                {loading ? (
                                    <div className="space-y-6">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex gap-4">
                                                <div className="w-3 h-3 rounded-full bg-parliament-wall/40 animate-pulse mt-2"></div>
                                                <div className="flex-1 h-24 bg-parliament-wall/20 animate-pulse rounded-2xl"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : history.length > 0 ? (
                                    <div className="relative">
                                        {/* Timeline vertical line */}
                                        <div className="absolute right-[6px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-parliament-greenMain via-parliament-wood/30 to-parliament-wall/20"></div>

                                        <div className="space-y-6">
                                            {history.map(({ session, firstSegmentId, summaryPoints }, index) => (
                                                <div
                                                    key={session.id}
                                                    onClick={() => onSessionClick && onSessionClick(session.id, firstSegmentId)}
                                                    className="relative flex gap-5 cursor-pointer group"
                                                >
                                                    {/* Timeline dot */}
                                                    <div className={`relative z-10 w-3.5 h-3.5 rounded-full mt-2 ring-4 ring-white shadow-lg transition-all duration-300 group-hover:scale-125 ${session.ordinaryTerm === 2 ? 'bg-parliament-greenMain' : 'bg-parliament-wood'}`}>
                                                        {/* Pulse animation on hover */}
                                                        <div className={`absolute inset-0 rounded-full animate-ping opacity-0 group-hover:opacity-30 ${session.ordinaryTerm === 2 ? 'bg-parliament-greenMain' : 'bg-parliament-wood'}`}></div>
                                                    </div>

                                                    {/* Content card */}
                                                    <div className="flex-1 bg-gradient-to-br from-parliament-wall/20 to-parliament-wall/5 rounded-2xl p-5 border border-parliament-wood/10 hover:border-parliament-wood/30 hover:shadow-lg hover:bg-white transition-all duration-300 group-hover:-translate-x-1">
                                                        {/* Header */}
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${session.ordinaryTerm === 2 ? 'bg-parliament-greenMain text-white' : 'bg-parliament-wood/20 text-parliament-woodDark'}`}>
                                                                        {session.ordinaryTerm === 2 ? 'الدورة الثانية' : 'الدورة الأولى'}
                                                                    </span>
                                                                    <span className="text-xs font-bold text-parliament-textMuted">{session.date}</span>
                                                                </div>
                                                                <h4 className="font-black text-parliament-text group-hover:text-parliament-greenMain transition-colors text-base leading-relaxed">
                                                                    {session.title}
                                                                </h4>
                                                            </div>
                                                            <ChevronLeft size={20} className="text-parliament-wood/50 group-hover:text-parliament-greenMain group-hover:-translate-x-1 transition-all shrink-0 mt-1" />
                                                        </div>

                                                        {/* Summary Points */}
                                                        {summaryPoints?.length > 0 && (
                                                            <div className="mt-4 pt-4 border-t border-parliament-wood/10">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <div className="w-1 h-4 bg-parliament-wood rounded-full"></div>
                                                                    <span className="text-[10px] font-black text-parliament-woodDark uppercase tracking-wider">أبرز ما طرحه النائب</span>
                                                                </div>
                                                                <ul className="space-y-2 pr-3">
                                                                    {summaryPoints.slice(0, 3).map((point: string, idx: number) => (
                                                                        <li key={idx} className="flex items-start gap-2 text-xs font-bold text-slate-600 leading-relaxed">
                                                                            <span className="text-parliament-wood mt-0.5">◆</span>
                                                                            <span>{point}</span>
                                                                        </li>
                                                                    ))}
                                                                    {summaryPoints.length > 3 && (
                                                                        <li className="text-[10px] font-black text-parliament-greenMain pr-4">
                                                                            + {summaryPoints.length - 3} نقاط أخرى...
                                                                        </li>
                                                                    )}
                                                                </ul>

                                                                {firstSegmentId && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onSessionClick && onSessionClick(session.id, firstSegmentId);
                                                                        }}
                                                                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-parliament-wood/10 hover:bg-parliament-wood text-parliament-wood hover:text-white rounded-xl text-xs font-black transition-all duration-300 group/btn"
                                                                    >
                                                                        <Play size={14} fill="currentColor" />
                                                                        <span>شاهد المداخلة</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-parliament-wall/10 rounded-2xl border-2 border-dashed border-parliament-wall">
                                        <Mic size={48} className="mx-auto text-parliament-wall mb-4" />
                                        <p className="text-parliament-textMuted font-bold">لم يتم رصد مداخلات مسجلة لهذا النائب.</p>
                                        <p className="text-xs text-parliament-textMuted/70 mt-2">ستظهر هنا جميع مداخلات النائب في الجلسات البرلمانية</p>
                                    </div>
                                )}
                            </section>
                        </div>
                    )}

                    {activeTab === 'committees' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex bg-parliament-wall/40 p-1.5 rounded-xl w-fit border border-parliament-wood/10 shadow-inner">
                                <button
                                    onClick={() => setCommitteeTerm('first')}
                                    className={`px-6 py-2.5 rounded-lg text-sm font-black transition-all duration-300 ${committeeTerm === 'first' ? 'bg-white text-parliament-greenMain shadow-md scale-105' : 'text-parliament-textMuted hover:text-parliament-text'}`}
                                >
                                    الدورة العادية الأولى
                                </button>
                                <button
                                    onClick={() => setCommitteeTerm('second')}
                                    className={`px-6 py-2.5 rounded-lg text-sm font-black transition-all duration-300 ${committeeTerm === 'second' ? 'bg-white text-parliament-greenMain shadow-md scale-105' : 'text-parliament-textMuted hover:text-parliament-text'}`}
                                >
                                    الدورة العادية الثانية
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentCommittees && currentCommittees.length > 0 ? currentCommittees.map((role, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => onCommitteeClick && onCommitteeClick(role.committeeName, committeeTerm === 'first' ? 'ordinary_1' : 'ordinary_2')}
                                        className="bg-white p-5 rounded-xl border border-parliament-wood/20 flex items-start gap-4 shadow-sm hover:border-parliament-greenMain transition-colors group cursor-pointer"
                                    >
                                        <div className="w-10 h-10 bg-parliament-greenMain/5 text-parliament-greenMain rounded-full flex items-center justify-center shrink-0 group-hover:bg-parliament-greenMain group-hover:text-white transition-all">
                                            <Award size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-parliament-text text-lg group-hover:text-parliament-greenMain transition-colors">{role.committeeName}</div>
                                            <div className="text-xs font-black text-parliament-woodDark mt-1 uppercase tracking-widest bg-parliament-wall/30 px-2 py-0.5 rounded inline-block">
                                                {role.role === 'chair' ? 'رئيس اللجنة' : role.role === 'deputy-chair' ? 'نائب الرئيس' : role.role === 'rapporteur' ? 'مقرر' : 'عضو لجنة'}
                                            </div>
                                            <div className="text-[10px] text-parliament-textMuted mt-2 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                ⬅️ اضغط لعرض جميع أعضاء اللجنة
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full bg-white border-2 border-dashed border-parliament-wall rounded-2xl p-16 text-center shadow-inner">
                                        <div className="bg-parliament-wall/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-parliament-wall">
                                            <HelpCircle size={40} className="text-parliament-wall" />
                                        </div>
                                        <h4 className="text-parliament-text font-black text-xl mb-2">بيانات غير متوفرة</h4>
                                        <p className="text-parliament-textMuted max-w-sm mx-auto text-sm">لم يتم رصد عضويات مسجلة لهذا النائب في هذه الدورة البرلمانية ضمن السجلات الرسمية المرصودة حالياً.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-parliament-wood/20 shadow-sm">
                        <h3 className="font-black text-parliament-greenDark mb-6 flex items-center gap-2 border-b border-parliament-wall pb-4">
                            <Mail size={18} className="text-parliament-wood" />
                            معلومات التواصل
                        </h3>
                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-parliament-wall/40 rounded-lg flex items-center justify-center text-parliament-woodDark">
                                    <Mail size={18} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="text-[10px] text-parliament-textMuted font-bold uppercase tracking-tighter">البريد الإلكتروني</div>
                                    <div className="text-sm font-bold text-parliament-text truncate">{mp.email || 'غير متوفر'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-parliament-wall/40 rounded-lg flex items-center justify-center text-parliament-woodDark">
                                    <LinkIcon size={18} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="text-[10px] text-parliament-textMuted font-bold uppercase tracking-tighter">الموقع الإلكتروني</div>
                                    <div className="text-sm font-bold text-parliament-text truncate">{mp.social?.website || 'غير متوفر'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-parliament-wall/10 p-6 rounded-xl border border-parliament-wood/20 italic text-xs text-parliament-textMuted leading-relaxed">
                        هذه البيانات مستمدة حصرياً من السجلات الرسمية لمجلس النواب الأردني ومحاضر الجلسات العامة المرصودة.
                    </div>
                </div>
            </div>

            <SubscriptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleModalConfirm}
                targetName={mp.fullName}
                initialEmail={getUserEmail() || ''}
            />
        </div>
    );
};

export default MPDetailView;
