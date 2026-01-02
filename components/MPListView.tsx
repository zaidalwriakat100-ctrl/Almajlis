
import React, { useState, useEffect } from 'react';
import { Search, Users, ChevronLeft, Bell, BellRing, MapPin, Flag, Home, Filter } from 'lucide-react';
import { MP, Subscription } from '../types';
import { getMPs, getSubscriptions, addSubscription, removeSubscription, getUserEmail, setUserEmail, normalizeForSearch } from '../services/api';
import ImageWithFallback from './ImageWithFallback';
import SubscriptionModal from './SubscriptionModal';

interface MPListViewProps {
    onMpSelect: (id: string) => void;
    selectedCommittee?: { name: string, session: string } | null;
    onClearCommittee?: () => void;
}

const MPListView: React.FC<MPListViewProps> = ({ onMpSelect, selectedCommittee, onClearCommittee }) => {
    const [mps, setMps] = useState<MP[]>([]);
    const [filteredMps, setFilteredMps] = useState<MP[]>([]);
    const [subs, setSubs] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGovernorate, setSelectedGovernorate] = useState('all');
    const [selectedParty, setSelectedParty] = useState('all');
    const [selectedWinType, setSelectedWinType] = useState('all');

    const [governorates, setGovernorates] = useState<string[]>([]);
    const [parties, setParties] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingMp, setPendingMp] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMPs();
            setMps(data);
            setSubs(getSubscriptions());

            const govSet = new Set<string>();
            const partySet = new Set<string>();
            data.forEach(mp => {
                if (mp.governorate) govSet.add(mp.governorate);
                if (mp.party) partySet.add(mp.party);
            });
            setGovernorates(Array.from(govSet).sort());
            setParties(Array.from(partySet).sort());
        } catch (err) {
            setError('تعذر تحميل بيانات النواب.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    useEffect(() => {
        let result = mps;
        if (searchQuery) {
            const searchWords = normalizeForSearch(searchQuery).split(/\s+/).filter(word => word.length > 0);
            result = result.filter(mp => {
                const normalizedFullName = normalizeForSearch(mp.fullName);
                return searchWords.every(word => normalizedFullName.includes(word));
            });
        }
        if (selectedGovernorate !== 'all') {
            result = result.filter(mp => mp.governorate === selectedGovernorate);
        }
        if (selectedParty !== 'all') {
            result = result.filter(mp => mp.party === selectedParty);
        }
        if (selectedWinType !== 'all') {
            result = result.filter(mp => mp.winType === selectedWinType);
        }
        // Filter by committee if selected
        if (selectedCommittee) {
            result = result.filter(mp => {
                const membership = mp.memberships?.find(m => m.session === selectedCommittee.session);
                return membership?.committees?.includes(selectedCommittee.name);
            });
        }
        setFilteredMps(result);
    }, [searchQuery, selectedGovernorate, selectedParty, selectedWinType, mps, selectedCommittee]);

    const handleToggleSub = (e: React.MouseEvent, mpName: string) => {
        e.stopPropagation();
        const existing = subs.find(s => s.type === 'speaker' && s.value === mpName);
        if (existing) {
            removeSubscription(existing.id);
            setSubs(getSubscriptions());
        } else {
            setPendingMp(mpName);
            setIsModalOpen(true);
        }
    };

    const handleModalConfirm = (email: string) => {
        if (pendingMp) {
            setUserEmail(email);
            addSubscription('speaker', pendingMp);
            setSubs(getSubscriptions());
            setIsModalOpen(false);
            setPendingMp(null);
        }
    };

    const isSubscribed = (name: string) => subs.some(s => s.type === 'speaker' && s.value === name);

    if (loading) return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => <div key={i} className="bg-parliament-wall/50 rounded-lg h-72 animate-pulse"></div>)}
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in px-2 md:px-0">
            <header className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-[#2D463E] flex items-center gap-3">
                            <Users className="text-[#B18154]" size={28} />
                            سجل أعضاء المجلس العشرين
                        </h2>
                        <p className="text-slate-500 mt-1 text-sm md:text-lg font-medium">تتبع دقيق لـ 138 نائباً، انتساباتهم الحزبية، وكتلهم البرلمانية.</p>
                    </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-parliament-wood/20 shadow-sm space-y-4">
                    <div className="flex flex-col gap-3">
                        <div className="relative group flex-1">
                            <input
                                type="text"
                                placeholder="بحث باسم النائب..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-4 pr-12 py-3.5 md:py-4 rounded-2xl border-2 border-slate-50 focus:border-[#B18154] bg-slate-50 focus:bg-white focus:outline-none transition-all font-bold text-slate-800"
                            />
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#B18154] transition-colors" size={22} />
                        </div>

                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden flex items-center justify-center gap-2 py-3 bg-[#F2F0EA] text-[#2D463E] rounded-xl font-black text-xs transition-colors"
                        >
                            <Filter size={16} />
                            {showFilters ? 'إخفاء الفلاتر' : 'إظهار خيارات التصفية'}
                        </button>

                        <div className={`${showFilters ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-2 flex-wrap animate-fade-in`}>
                            <div className="flex-1 min-w-[140px]">
                                <select
                                    value={selectedWinType}
                                    onChange={(e) => setSelectedWinType(e.target.value)}
                                    className="w-full bg-[#F8F7F2] border-2 border-slate-50 rounded-xl px-4 py-3 text-xs font-black text-[#1A2E28] focus:border-[#B18154] focus:outline-none appearance-none cursor-pointer"
                                >
                                    <option value="all">كل أنواع القوائم</option>
                                    <option value="national">قائمة وطنية (حزبية)</option>
                                    <option value="local">قائمة محلية</option>
                                </select>
                            </div>
                            <div className="flex-1 min-w-[140px]">
                                <select
                                    value={selectedGovernorate}
                                    onChange={(e) => setSelectedGovernorate(e.target.value)}
                                    className="w-full bg-[#F8F7F2] border-2 border-slate-50 rounded-xl px-4 py-3 text-xs font-black text-[#1A2E28] focus:border-[#B18154] focus:outline-none appearance-none cursor-pointer"
                                >
                                    <option value="all">كل المحافظات</option>
                                    {governorates.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Committee Filter Badge */}
                {selectedCommittee && (
                    <div className="bg-[#2D463E]/5 border border-[#2D463E]/20 px-4 py-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#B18154] shadow-sm">
                                <Filter size={18} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">تصفية حسب اللجنة</div>
                                <div className="text-sm font-black text-[#2D463E] mt-1">
                                    {selectedCommittee.name} <span className="text-[#B18154] text-xs opacity-60">({selectedCommittee.session === 'ordinary_1' ? 'الدورة الأولى' : 'الدورة الثانية'})</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClearCommittee}
                            className="bg-[#2D463E] text-white rounded-xl px-6 py-2.5 text-xs font-black hover:bg-[#1A2E28] transition-all shadow-lg shadow-[#2D463E]/20 text-center"
                        >
                            إلغاء التصفية
                        </button>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredMps.map((mp) => {
                    const subscribed = isSubscribed(mp.fullName);
                    const isNational = mp.winType === 'national';

                    return (
                        <div
                            key={mp.id}
                            onClick={() => onMpSelect(mp.id)}
                            className="parliament-card bg-white hover:shadow-xl hover:border-[#B18154] transition-all cursor-pointer group relative rounded-xl overflow-hidden flex flex-col h-full border border-slate-100"
                        >
                            <button
                                onClick={(e) => handleToggleSub(e, mp.fullName)}
                                className={`absolute top-2 left-2 z-20 p-1.5 rounded-lg backdrop-blur-md transition-all ${subscribed ? 'bg-[#B18154] text-white shadow-lg' : 'bg-white/40 text-white hover:bg-white/80 hover:text-[#B18154]'}`}
                                title={subscribed ? "إلغاء التنبيهات" : "تفعيل التنبيهات"}
                            >
                                {subscribed ? <BellRing size={14} /> : <Bell size={14} />}
                            </button>

                            <div className="relative pt-[110%] bg-slate-50 overflow-hidden shrink-0">
                                <ImageWithFallback src={mp.photoUrl} alt={mp.fullName} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                {/* تدرج أقوى لضمان وضوح النص */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                                <div className="absolute bottom-0 right-0 left-0 p-3 text-white">
                                    {/* خلفية للاسم لضمان القراءة */}
                                    <div className="bg-black/30 backdrop-blur-sm rounded-lg px-2 py-1.5">
                                        <h3 className="font-black text-[11px] md:text-[13px] leading-snug drop-shadow-lg line-clamp-2">{mp.fullName}</h3>
                                        <div className="flex items-center gap-1 text-[9px] opacity-90 mt-1 font-bold">
                                            <MapPin size={8} className="text-[#B18154] shrink-0" />
                                            <span className="truncate">{mp.governorate}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-2 flex-1 flex flex-col justify-between bg-white">
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${mp.party === 'مستقل' ? 'bg-slate-300' : 'bg-[#2D463E]'}`}></div>
                                        <span className="text-[9px] font-black text-slate-600 truncate">{mp.party}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-100">
                                            {mp.parliamentaryBloc}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <SubscriptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleModalConfirm}
                targetName={pendingMp || ''}
                initialEmail={getUserEmail() || ''}
            />
        </div>
    );
};

export default MPListView;
