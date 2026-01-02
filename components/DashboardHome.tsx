
import React, { useState, useEffect } from 'react';
import { Users, PlayCircle, BookOpen } from 'lucide-react';
import { getMPs, getSessions } from '../services/api';

interface DashboardHomeProps {
    onNavigate: (tab: string) => void;
    onSessionSelect: (id: string) => void;
    onMpSelect: (id: string) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate }) => {
    const [stats, setStats] = useState({
        mpsCount: 0,
        sessionsCount: 0,
        legislationCount: 0,
        blocsCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                // Load MPs count
                const mpsData = await getMPs();
                const mpsCount = mpsData.length;
                console.log('MPs count:', mpsCount);

                // Load Sessions count
                const sessionsData = await getSessions();
                const sessionsCount = sessionsData.length;
                console.log('Sessions count:', sessionsCount);

                // Load Blocs count from current session (ordinary_2)
                const blocsResponse = await fetch('/data/blocs.json');
                let blocsCount = 0;
                if (blocsResponse.ok) {
                    const blocsData = await blocsResponse.json();
                    // blocsData is an array of sessions, find ordinary_2
                    const currentSession = blocsData.find((s: any) => s.id === 'ordinary_2');
                    blocsCount = currentSession?.blocs?.length || 0;
                    console.log('Blocs count:', blocsCount, 'from session:', currentSession);
                }

                // Load Laws count from laws.json
                const lawsResponse = await fetch('/data/laws.json');
                let legislationCount = 0;
                if (lawsResponse.ok) {
                    const lawsData = await lawsResponse.json();
                    legislationCount = Array.isArray(lawsData)
                        ? lawsData.filter((law: any) => law.status === 'passed').length
                        : 0;
                    console.log('Passed laws count:', legislationCount);
                }

                setStats({
                    mpsCount,
                    sessionsCount,
                    legislationCount,
                    blocsCount
                });
                console.log('Final stats:', { mpsCount, sessionsCount, legislationCount, blocsCount });
            } catch (error) {
                console.error('Error loading stats:', error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    return (
        <div className="space-y-10 animate-fade-in pb-24 max-w-6xl mx-auto px-4">

            {/* Hero Section: Compact Green Card with Search */}
            <section
                className="relative bg-marble-green text-white py-12 md:py-16 px-8 md:px-12 rounded-[50px] shadow-2xl overflow-hidden border-[4px] border-parliament-wood/30 flex items-center justify-center text-center"
                aria-labelledby="hero-title"
            >
                <div className="absolute inset-0 opacity-[0.05] pattern-mashrabiyya scale-110 pointer-events-none"></div>

                <div className="relative z-10 w-full max-w-4xl flex flex-col items-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-white text-[#2D463E] rounded-full text-[10px] font-black tracking-widest uppercase border border-[#B18154]/20 shadow-sm">
                        مرصد مجلس النواب الأردني
                    </div>

                    <h1 id="hero-title" className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
                        دليل النواب
                    </h1>

                    <p className="text-parliament-wall text-lg md:text-xl leading-relaxed font-medium opacity-90 max-w-2xl">
                        ابحث عن ممثلك تحت القبة وتتبع أداءه البرلماني وتوجهاته التشريعية بدقة.
                    </p>
                </div>
            </section>

            {/* Quick Stats Grid: Linked to Tabs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" role="list">
                {[
                    { label: 'نائباً مسجلاً', value: loading ? '...' : stats.mpsCount.toString(), icon: Users, target: 'mps' },
                    { label: 'جلسة مؤرشفة', value: loading ? '...' : stats.sessionsCount.toString(), icon: PlayCircle, target: 'sessions' },
                    { label: 'قانوناً مقراً', value: loading ? '...' : stats.legislationCount.toString(), icon: BookOpen, target: 'laws' },
                    { label: 'كتلة برلمانية', value: loading ? '...' : stats.blocsCount.toString(), icon: Users, target: 'parties' },
                ].map((stat, i) => (
                    <div
                        key={i}
                        onClick={() => onNavigate(stat.target)}
                        className="group relative bg-[#B18154] hover:bg-[#966b42] p-6 rounded-[32px] overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 shadow-lg ring-1 ring-white/20 flex flex-col items-center justify-center min-h-[180px]"
                        role="listitem"
                    >
                        {/* Abstract shapes for background texture */}
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-black/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>

                        {/* Icon Container with new creative shape (rotated square with inner icon) */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="mb-6 relative">
                                <div className="absolute inset-0 bg-white/20 rotate-45 rounded-xl blur-sm group-hover:rotate-90 transition-transform duration-500"></div>
                                <div className="relative w-16 h-16 bg-gradient-to-br from-[#F2F0EA] to-[#E6E2D6] rotate-45 rounded-[18px] shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/40">
                                    <stat.icon className="-rotate-45 text-[#B18154]" size={28} />
                                </div>
                            </div>

                            <div className="text-4xl font-black text-white mb-2 tracking-tight drop-shadow-sm">{stat.value}</div>
                            <div className="text-[11px] font-black text-[#F2F0EA]/90 uppercase tracking-widest border-t border-white/20 pt-2 w-full text-center">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Note about neutrality */}
            <div className="text-center py-10 opacity-40 border-t border-parliament-wood/10 mt-10">
                <p className="text-xs font-bold text-parliament-textMuted leading-relaxed max-w-md mx-auto">
                    منصة مستقلة تهدف لتعزيز الشفافية البرلمانية. جميع البيانات مستقاة من موقع وقناة مجلس النواب المتاحة للعامة.
                </p>
            </div>
        </div>
    );
};

export default DashboardHome;
