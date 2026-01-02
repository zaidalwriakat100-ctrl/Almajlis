import React from 'react';
import { ArrowRight, Clock, Mic2, User, CheckCircle2, Timer } from 'lucide-react';
import { ParliamentSession, MP } from '../types';
import { getSimpleTitle, formatDuration, findBestMatchMP, cleanSpeakerName } from '../utils/dataProcessing';

interface SessionDetailViewProps {
    session: ParliamentSession;
    mps: MP[];
    onBack: () => void;
    onMpClick: (mpId: string) => void;
    highlightId?: string;
}

const SessionDetailView: React.FC<SessionDetailViewProps> = ({ session, mps, onBack, onMpClick }) => {

    return (
        <div className="space-y-6 animate-fade-in pb-24 max-w-[1600px] mx-auto px-4" dir="rtl">
            {/* شريط التنقل والعنوان */}
            <div className="bg-white rounded-2xl md:rounded-3xl border border-[#B18154]/20 p-4 md:p-6 shadow-sm sticky top-2 z-20">
                <div className="flex items-center justify-between gap-4">
                    <button onClick={onBack} className="text-[#6B6862] hover:text-[#2D463E] flex items-center gap-2 font-black text-sm group transition-colors shrink-0">
                        <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" /> العودة
                    </button>
                    <div className="flex-1 text-center">
                        <h1 className="font-black text-[#2D463E] text-lg md:text-2xl leading-tight">{session.title}</h1>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-[#8B633F]">{session.date}</span>
                            <span className="text-[#B18154]">•</span>
                            <span className="text-[10px] font-bold text-[#2D463E]">{session.term}</span>
                        </div>
                    </div>
                    <div className="w-16 md:w-20 shrink-0"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7">
                    {session.brief_summary && (
                        <div className="space-y-8 animate-fade-in">
                            {/* ما جرى في الجلسة */}
                            <div className="bg-white rounded-[28px] md:rounded-[40px] border border-[#B18154]/20 p-5 md:p-8 shadow-sm">
                                <h3 className="text-xl md:text-2xl font-black text-[#2D463E] mb-6 md:mb-8 flex items-center gap-2 md:gap-3">
                                    <Clock size={24} className="text-[#B18154] md:w-7 md:h-7" /> ماذا جرى في هذه الجلسة؟
                                </h3>
                                <ul className="space-y-5">
                                    {session.brief_summary.events.map((event, idx) => (
                                        <li key={idx} className="flex items-start gap-3 md:gap-4 text-slate-700 font-bold leading-relaxed md:leading-loose text-sm md:text-base">
                                            <span className="w-6 h-6 bg-[#F2F0EA] rounded-full flex items-center justify-center shrink-0 text-[10px] font-black text-[#8B633F] border border-[#B18154]/10 mt-0.5">{idx + 1}</span>
                                            <span className="flex-1">{event}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* أبرز القرارات */}
                            {session.brief_summary.decisions.length > 0 && (
                                <div className="bg-gradient-to-br from-[#2D463E] to-[#1A2E28] rounded-[28px] md:rounded-[40px] shadow-xl p-5 md:p-10 text-white relative overflow-hidden">
                                    {/* Decorative elements */}
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#B18154] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#B18154] opacity-5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

                                    {/* Header */}
                                    <div className="relative z-10 flex items-center gap-3 md:gap-4 mb-6 md:mb-8 pb-4 md:pb-6 border-b border-white/10">
                                        <div className="p-3 md:p-4 bg-[#B18154]/30 rounded-xl md:rounded-2xl border border-[#B18154]/40">
                                            <CheckCircle2 size={24} className="text-[#B18154] md:w-7 md:h-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl md:text-3xl font-black text-white">أبرز القرارات</h3>
                                            <p className="text-white/50 text-xs md:text-sm font-medium mt-1">القرارات والتوصيات الصادرة عن الجلسة</p>
                                        </div>
                                    </div>

                                    {/* Decisions List - Raw Data as-is */}
                                    <div className="relative z-10 space-y-4">
                                        {session.brief_summary.decisions.map((decision, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-white/5 rounded-2xl p-6 border border-white/10"
                                            >
                                                <p className="text-white/90 font-medium leading-relaxed md:leading-loose text-sm md:text-base">
                                                    {decision}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}


                            {/* ملخص المداخلات */}
                            <div className="space-y-4">
                                <h3 className="text-xl md:text-2xl font-black text-[#2D463E] px-2 md:px-4 flex items-center gap-2 md:gap-3">
                                    <Mic2 size={24} className="text-[#B18154] md:w-7 md:h-7" /> ملخص ما طرحه النواب
                                </h3>
                                {session.brief_summary.mp_interventions.map((mp, idx) => (
                                    <div key={idx} className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-[#B18154]/10 shadow-sm">
                                        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                            <div className="w-9 h-9 md:w-10 md:h-10 bg-[#F2F0EA] rounded-lg md:rounded-xl flex items-center justify-center text-[#B18154]">
                                                <User size={18} className="md:w-5 md:h-5" />
                                            </div>
                                            {(() => {
                                                const matchedMp = findBestMatchMP(mp.mp_name, mps);

                                                return matchedMp ? (
                                                    <button
                                                        onClick={() => onMpClick(matchedMp.id)}
                                                        className="font-black text-lg text-[#2D463E] hover:text-[#B18154] hover:underline transition-all text-right"
                                                    >
                                                        {cleanSpeakerName(mp.mp_name)}
                                                    </button>
                                                ) : (
                                                    <span className="font-black text-lg text-[#2D463E]">{cleanSpeakerName(mp.mp_name)}</span>
                                                );
                                            })()}
                                        </div>
                                        <ul className="space-y-3 md:space-y-4 mr-3 md:mr-4">
                                            {mp.points.map((point, pIdx) => (
                                                <li key={pIdx} className="text-sm md:text-base text-slate-600 font-bold list-disc marker:text-[#B18154] pr-2 leading-relaxed md:leading-loose">{point}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* القسم الجانبي: الفيديو والمعلومات الأساسية */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                    <div className="rounded-[40px] bg-black shadow-2xl overflow-hidden aspect-video ring-4 ring-[#B18154]/5">
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${session.youtube.video_id}`}
                            title={session.title}
                            allowFullScreen
                        ></iframe>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-[#B18154]/20 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-full bg-[#B18154]"></div>
                        <h1 className="text-4xl font-black text-[#2D463E] mb-6 leading-tight">{getSimpleTitle(session.title)}</h1>
                        <div className="flex flex-wrap gap-2 mb-8">
                            <span className="text-[10px] font-black text-[#8B633F] bg-[#F2F0EA] px-3 py-1.5 rounded-lg border border-[#B18154]/10">{session.date}</span>
                            <span className="text-[10px] font-black text-white bg-[#2D463E] px-3 py-1.5 rounded-lg">{session.term}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#F2F0EA]/40 p-6 rounded-3xl text-center border border-[#B18154]/5">
                                <div className="flex items-center justify-center gap-1.5 mb-1 text-[#6B6862] text-[9px] font-black">
                                    <Mic2 size={12} className="text-[#B18154]" /> متحدث
                                </div>
                                <div className="text-4xl font-black text-[#1A2E28]">{session.num_speakers || session.stats?.distinct_speakers_count || 0}</div>
                            </div>
                            <div className="bg-[#F2F0EA]/40 p-6 rounded-3xl text-center border border-[#B18154]/5">
                                <div className="flex items-center justify-center gap-1.5 mb-1 text-[#6B6862] text-[9px] font-black">
                                    <Timer size={12} className="text-[#B18154]" /> زمن الجلسة
                                </div>
                                <div className="text-2xl font-black text-[#1A2E28]">{session.duration || formatDuration(session.stats?.estimated_duration_minutes)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ملاحظة المصدر */}
            <div className="text-center py-6 opacity-40">
                <p className="text-xs font-bold text-[#6B6862]">
                    البيانات مستخرجة من الجلسات المتلفزة لمجلس النواب.
                </p>
            </div>
        </div>
    );
};

export default SessionDetailView;
