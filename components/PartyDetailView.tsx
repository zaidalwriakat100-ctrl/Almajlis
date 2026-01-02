
import React, { useState } from 'react';
import { ArrowRight, Users, MapPin, Search, Shield, ChevronLeft, Info, Flag, Home } from 'lucide-react';
import { Party, MP } from '../types';
import DataMeta from './DataMeta';

interface PartyDetailViewProps {
    party: Party;
    partyMps?: MP[];
    onBack: () => void;
    onMpClick: (id: string) => void;
}

const PartyDetailView: React.FC<PartyDetailViewProps> = ({ party, partyMps = [], onBack, onMpClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'national' | 'local'>('all');

    const filteredMps = partyMps.filter(mp => {
        const matchesSearch = mp.fullName.includes(searchTerm) || (mp.governorate?.includes(searchTerm));
        const matchesType = filterType === 'all' || (filterType === 'national' && mp.winType === 'national') || (filterType === 'local' && mp.winType === 'local');
        return matchesSearch && matchesType;
    });

    const nationalCount = partyMps.filter(m => m.winType === 'national').length;
    const localCount = partyMps.filter(m => m.winType === 'local').length;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-parliament-textMuted hover:text-parliament-greenMain transition-all font-black group bg-white px-5 py-2.5 rounded-2xl border border-parliament-wood/10 shadow-sm"
                >
                    <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
                    العودة للقائمة
                </button>
                <div className="flex items-center gap-3 bg-parliament-wall/50 px-4 py-2 rounded-2xl border border-parliament-wood/5">
                    <span className="text-[10px] font-black text-parliament-textMuted uppercase tracking-widest">آخر تحديث للبيانات</span>
                    <span className="text-xs font-bold text-parliament-greenMain">{new Date().toLocaleDateString('ar-JO')}</span>
                </div>
            </div>

            {/* Simplified Hero Header */}
            <div className="bg-white p-8 md:p-10 rounded-[40px] border border-parliament-wood/20 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-3 h-full" style={{ backgroundColor: party.color }}></div>

                <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                    <div className="w-24 h-24 rounded-[20px] flex items-center justify-center text-white font-black text-4xl shadow-md border-4 border-white shrink-0" style={{ backgroundColor: party.color }}>
                        {party.logoUrl ? <img src={party.logoUrl} alt={party.name} className="w-full h-full rounded-[15px] object-cover" /> : party.name.charAt(0)}
                    </div>

                    <div className="flex-1 text-center md:text-right">
                        <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-parliament-wall rounded-full text-[9px] font-black text-parliament-woodDark mb-2 border border-parliament-wood/10 uppercase tracking-widest">
                            <Shield size={10} /> بيانات الكتلة الرسمية
                        </div>
                        <h1 className="text-3xl font-black text-parliament-greenMain mb-2">{party.name}</h1>
                        <p className="text-parliament-textMuted text-sm font-bold">إجمالي نواب الكتلة المرصودين: {partyMps.length}</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-parliament-wall px-5 py-2 rounded-xl text-center border border-parliament-wood/10">
                            <div className="text-[8px] font-black text-parliament-textMuted uppercase mb-0.5">قائمة عامة</div>
                            <div className="text-lg font-black text-parliament-greenMain">{nationalCount}</div>
                        </div>
                        <div className="bg-parliament-wall px-5 py-2 rounded-xl text-center border border-parliament-wood/10">
                            <div className="text-[8px] font-black text-parliament-textMuted uppercase mb-0.5">دوائر محلية</div>
                            <div className="text-lg font-black text-parliament-greenMain">{localCount}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Directory Section */}
            <div className="bg-white p-6 md:p-10 rounded-[45px] border border-parliament-wood/10 shadow-sm space-y-8">
                {/* Member Search Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-parliament-wall">
                    <h2 className="text-xl font-black text-parliament-greenMain flex items-center gap-3">
                        <Users size={22} className="text-parliament-wood" />
                        أعضاء الكتلة تحت القبة
                    </h2>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <input
                                type="text"
                                placeholder="ابحث باسم النائب..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-parliament-wall/40 border border-parliament-wood/5 rounded-2xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-parliament-greenMain transition-all pr-10"
                            />
                            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-parliament-textMuted" />
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="bg-parliament-wall/40 border border-parliament-wood/5 rounded-2xl px-4 py-2.5 text-[10px] font-black text-parliament-greenMain focus:outline-none cursor-pointer"
                        >
                            <option value="all">كل النواب</option>
                            <option value="national">القائمة الوطنية</option>
                            <option value="local">الدوائر المحلية</option>
                        </select>
                    </div>
                </div>

                {/* Members Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredMps.length > 0 ? filteredMps.map(mp => (
                        <div
                            key={mp.id}
                            onClick={() => onMpClick(mp.id)}
                            className="group bg-parliament-wall/20 p-4 rounded-[24px] border border-transparent hover:border-parliament-greenMain hover:bg-white hover:shadow-lg cursor-pointer transition-all duration-300 flex flex-col items-center text-center"
                        >
                            <div className="w-20 h-20 rounded-full bg-white p-1 shadow-sm mb-3 border border-parliament-wood/10 group-hover:border-parliament-greenMain transition-colors overflow-hidden">
                                {mp.photoUrl ? (
                                    <img src={mp.photoUrl} alt={mp.fullName} className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-parliament-wood/20"><Users size={24} /></div>
                                )}
                            </div>

                            <div className="flex-1 space-y-0.5">
                                <h4 className="font-black text-parliament-text text-xs group-hover:text-parliament-greenMain transition-colors line-clamp-1">{mp.fullName}</h4>
                                <div className="flex items-center justify-center gap-1.5">
                                    <MapPin size={10} className="text-parliament-wood" />
                                    <span className="text-[9px] font-bold text-parliament-textMuted">{mp.governorate}</span>
                                </div>
                            </div>

                            <div className="mt-3 flex gap-1.5 w-full pt-3 border-t border-parliament-wall/50">
                                <span className={`flex-1 text-[8px] font-black px-2 py-1 rounded-md flex items-center justify-center gap-1 ${mp.winType === 'national' ? 'bg-blue-50 text-blue-700' : 'bg-parliament-wall text-parliament-textMuted'}`}>
                                    {mp.winType === 'national' ? <Flag size={8} /> : <Home size={8} />}
                                    {mp.winType === 'national' ? 'وطنية' : 'دائرة'}
                                </span>
                                <div className="w-6 h-6 rounded-md bg-parliament-wall flex items-center justify-center text-parliament-wood group-hover:bg-parliament-greenMain group-hover:text-white transition-all">
                                    <ChevronLeft size={12} />
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center bg-parliament-wall/10 rounded-[30px] border-2 border-dashed border-parliament-wall">
                            <Info size={32} className="mx-auto text-parliament-wood/20 mb-3" />
                            <p className="text-parliament-textMuted font-black text-sm">لا يوجد نواب يطابقون بحثك داخل هذه الكتلة.</p>
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-parliament-wall flex flex-col md:flex-row justify-between items-center gap-4">
                    <DataMeta source={party.source} lastUpdated={party.lastUpdated} />
                    <div className="text-[10px] font-bold text-parliament-textMuted italic">
                        يتم تحديث قائمة الأعضاء فور إعلان التغييرات الرسمية من الأمانة العامة للمجلس.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartyDetailView;
