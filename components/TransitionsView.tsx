
import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Search, Filter, Info, ArrowUpRight, ArrowDownRight, UserCheck, UserMinus, UserPlus } from 'lucide-react';
import { getMPTransitions } from '../services/api';
import { MPTransition, TransitionStatus } from '../types';
import { normalizeForSearch } from '../utils/dataProcessing';

const TransitionsView: React.FC = () => {
    const [transitions, setTransitions] = useState<MPTransition[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<TransitionStatus | 'ALL'>('ALL');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await getMPTransitions();
            setTransitions(data);
            setLoading(false);
        };
        load();
    }, []);

    const filtered = transitions.filter(t => {
        const matchesSearch = !searchQuery || normalizeForSearch(t.name).includes(normalizeForSearch(searchQuery));
        const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        shifted: transitions.filter(t => t.status === 'SHIFTED').length,
        stable: transitions.filter(t => t.status === 'STABLE').length,
        new: transitions.filter(t => t.status === 'NEW_ENTRY').length,
        left: transitions.filter(t => t.status === 'LEFT_MEMBER').length
    };

    const getStatusBadge = (status: TransitionStatus) => {
        switch(status) {
            case 'STABLE': return <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-100 flex items-center gap-1"><UserCheck size={12}/> ثابت</span>;
            case 'SHIFTED': return <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black border border-orange-100 flex items-center gap-1"><ArrowRightLeft size={12}/> انتقال</span>;
            case 'NEW_ENTRY': return <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black border border-blue-100 flex items-center gap-1"><UserPlus size={12}/> دخول جديد</span>;
            case 'LEFT_MEMBER': return <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-[10px] font-black border border-rose-100 flex items-center gap-1"><UserMinus size={12}/> خرج</span>;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <header className="mb-8 border-b border-parliament-wood/30 pb-8">
                <h2 className="text-3xl font-black text-parliament-greenMain flex items-center gap-3">
                    <ArrowRightLeft className="text-parliament-wood" size={32} />
                    بورصة الانتقالات النيابية
                </h2>
                <p className="text-parliament-textMuted mt-2 text-lg font-bold">تتبع حركة النواب بين الكتل من الدورة الأولى إلى الدورة الثانية.</p>
            </header>

            {/* Top Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-parliament-wood/10 shadow-sm text-center">
                    <div className="text-3xl font-black text-orange-600 mb-1">{stats.shifted}</div>
                    <div className="text-[10px] font-black text-parliament-textMuted uppercase tracking-widest">عمليات انتقال</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-parliament-wood/10 shadow-sm text-center">
                    <div className="text-3xl font-black text-emerald-600 mb-1">{stats.stable}</div>
                    <div className="text-[10px] font-black text-parliament-textMuted uppercase tracking-widest">نواب ثابتون</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-parliament-wood/10 shadow-sm text-center">
                    <div className="text-3xl font-black text-blue-600 mb-1">{stats.new}</div>
                    <div className="text-[10px] font-black text-parliament-textMuted uppercase tracking-widest">دخلوا حديثاً للثانية</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-parliament-wood/10 shadow-sm text-center">
                    <div className="text-3xl font-black text-rose-600 mb-1">{stats.left}</div>
                    <div className="text-[10px] font-black text-parliament-textMuted uppercase tracking-widest">لم يظهروا في الثانية</div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-[40px] border border-parliament-wood/10 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <input 
                            type="text" 
                            placeholder="ابحث باسم النائب..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-parliament-wall/30 border border-parliament-wood/10 rounded-2xl pl-4 pr-12 py-3.5 font-bold focus:outline-none"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-parliament-textMuted" size={20} />
                    </div>
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="bg-parliament-wall/30 border border-parliament-wood/10 rounded-2xl px-6 py-3.5 font-black text-xs text-parliament-greenDark focus:outline-none w-full md:w-48"
                    >
                        <option value="ALL">كل الحالات</option>
                        <option value="SHIFTED">انتقالات فقط</option>
                        <option value="STABLE">ثابتون فقط</option>
                        <option value="NEW_ENTRY">دخلوا للثانية</option>
                        <option value="LEFT_MEMBER">خرجوا</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-parliament-wall/50 text-[10px] font-black text-parliament-woodDark uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">اسم النائب</th>
                                <th className="px-6 py-4">كتلة (الدورة الأولى)</th>
                                <th className="px-6 py-4">كتلة (الدورة الثانية)</th>
                                <th className="px-6 py-4 text-center">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-parliament-wall">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => <tr key={i} className="h-16 animate-pulse bg-parliament-wall/10"></tr>)
                            ) : filtered.map((t, idx) => (
                                <tr key={idx} className="hover:bg-parliament-wall/20 transition-colors group">
                                    <td className="px-6 py-4 font-black text-parliament-greenMain">{t.name}</td>
                                    <td className="px-6 py-4">
                                        {t.term1Bloc ? (
                                            <span className="text-xs font-bold text-parliament-textMuted">{t.term1Bloc}</span>
                                        ) : (
                                            <span className="text-[10px] italic text-slate-300">غير متوفر</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {t.term2Bloc ? (
                                            <span className="text-xs font-black text-parliament-greenDark">{t.term2Bloc}</span>
                                        ) : (
                                            <span className="text-[10px] italic text-rose-300">لم يسجل</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 flex justify-center">
                                        {getStatusBadge(t.status)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TransitionsView;
