
import React, { useState, useEffect } from 'react';
import { MP } from '../types';
import { getMPs } from '../services/api';
import ImageWithFallback from './ImageWithFallback';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Search, ArrowRightLeft, Users } from 'lucide-react';

const CompareView: React.FC = () => {
    const [allMps, setAllMps] = useState<MP[]>([]);
    const [mp1, setMp1] = useState<MP | null>(null);
    const [mp2, setMp2] = useState<MP | null>(null);
    const [search1, setSearch1] = useState('');
    const [search2, setSearch2] = useState('');

    useEffect(() => {
        getMPs().then(setAllMps);
    }, []);

    const filteredMps1 = allMps.filter(m => m.fullName.includes(search1) && m.id !== mp2?.id);
    const filteredMps2 = allMps.filter(m => m.fullName.includes(search2) && m.id !== mp1?.id);

    // Prepare data for comparison charts
    const attendanceData = [
        { name: 'نسبة الحضور', [mp1?.fullName || 'MP1']: mp1?.attendanceRate || 0, [mp2?.fullName || 'MP2']: mp2?.attendanceRate || 0 }
    ];

    const activityData = [
        { name: 'أسئلة', [mp1?.fullName || 'MP1']: mp1?.activityStats?.questionsAsked || 0, [mp2?.fullName || 'MP2']: mp2?.activityStats?.questionsAsked || 0 },
        { name: 'مداخلات', [mp1?.fullName || 'MP1']: mp1?.activityStats?.speechesGiven || 0, [mp2?.fullName || 'MP2']: mp2?.activityStats?.speechesGiven || 0 },
        { name: 'قوانين', [mp1?.fullName || 'MP1']: mp1?.activityStats?.billsProposed || 0, [mp2?.fullName || 'MP2']: mp2?.activityStats?.billsProposed || 0 },
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <header className="mb-8 border-b border-parliament-wood/30 pb-6">
                <h2 className="text-3xl font-black text-parliament-greenMain flex items-center gap-3">
                    <ArrowRightLeft className="text-parliament-wood" />
                    مقارنة النواب
                </h2>
                <p className="text-parliament-textMuted mt-2">قارن بين أداء نائبين وجهاً لوجه في الحضور، التصويت، والنشاط التشريعي.</p>
            </header>

            {/* Selection Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-parliament-wall rounded-full p-2 border-2 border-parliament-wood text-parliament-woodDark">
                    <span className="font-black text-xl">VS</span>
                </div>

                {/* MP 1 Selector */}
                <div className={`parliament-card p-6 ${mp1 ? 'bg-white' : 'bg-parliament-wall/20 border-dashed'}`}>
                    {!mp1 ? (
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-parliament-greenMain">اختر النائب الأول</h3>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="بحث بالاسم..." 
                                    className="w-full pl-4 pr-10 py-2 border border-parliament-wood/30 rounded-md focus:outline-none focus:ring-1 focus:ring-parliament-wood"
                                    onChange={(e) => setSearch1(e.target.value)}
                                />
                                <Search className="absolute right-3 top-2.5 text-parliament-textMuted" size={16}/>
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-2 border border-parliament-wood/10 rounded-md p-2 bg-white">
                                {filteredMps1.slice(0, 10).map(mp => (
                                    <button 
                                        key={mp.id} 
                                        onClick={() => setMp1(mp)}
                                        className="w-full flex items-center gap-3 p-2 hover:bg-parliament-wallWarm/20 rounded-md text-right transition-colors"
                                    >
                                        <ImageWithFallback src={mp.photoUrl} alt={mp.fullName} className="w-8 h-8 rounded-full object-cover"/>
                                        <div className="text-sm font-bold text-parliament-text">{mp.fullName}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center relative">
                            <button onClick={() => setMp1(null)} className="absolute top-0 left-0 text-xs text-red-500 hover:underline">تغيير</button>
                            <ImageWithFallback src={mp1.photoUrl} alt={mp1.fullName} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-parliament-wood/20 shadow-md"/>
                            <h3 className="text-xl font-black text-parliament-greenMain">{mp1.fullName}</h3>
                            <div className="text-parliament-textMuted text-sm mt-1">{mp1.district || mp1.governorate}</div>
                            <span className="inline-block bg-parliament-wood/10 text-parliament-woodDark px-3 py-1 rounded-full text-xs font-bold mt-2">{mp1.party || 'مستقل'}</span>
                        </div>
                    )}
                </div>

                {/* MP 2 Selector */}
                <div className={`parliament-card p-6 ${mp2 ? 'bg-white' : 'bg-parliament-wall/20 border-dashed'}`}>
                    {!mp2 ? (
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-parliament-greenMain">اختر النائب الثاني</h3>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="بحث بالاسم..." 
                                    className="w-full pl-4 pr-10 py-2 border border-parliament-wood/30 rounded-md focus:outline-none focus:ring-1 focus:ring-parliament-wood"
                                    onChange={(e) => setSearch2(e.target.value)}
                                />
                                <Search className="absolute right-3 top-2.5 text-parliament-textMuted" size={16}/>
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-2 border border-parliament-wood/10 rounded-md p-2 bg-white">
                                {filteredMps2.slice(0, 10).map(mp => (
                                    <button 
                                        key={mp.id} 
                                        onClick={() => setMp2(mp)}
                                        className="w-full flex items-center gap-3 p-2 hover:bg-parliament-wallWarm/20 rounded-md text-right transition-colors"
                                    >
                                        <ImageWithFallback src={mp.photoUrl} alt={mp.fullName} className="w-8 h-8 rounded-full object-cover"/>
                                        <div className="text-sm font-bold text-parliament-text">{mp.fullName}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center relative">
                             <button onClick={() => setMp2(null)} className="absolute top-0 left-0 text-xs text-red-500 hover:underline">تغيير</button>
                            <ImageWithFallback src={mp2.photoUrl} alt={mp2.fullName} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-parliament-wood/20 shadow-md"/>
                            <h3 className="text-xl font-black text-parliament-greenMain">{mp2.fullName}</h3>
                            <div className="text-parliament-textMuted text-sm mt-1">{mp2.district || mp2.governorate}</div>
                            <span className="inline-block bg-parliament-wood/10 text-parliament-woodDark px-3 py-1 rounded-full text-xs font-bold mt-2">{mp2.party || 'مستقل'}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Comparison Charts */}
            {mp1 && mp2 && (
                <div className="space-y-8 animate-fade-in">
                    
                    {/* Activity Comparison */}
                    <div className="parliament-card p-6">
                        <h3 className="font-bold text-parliament-greenMain mb-6 text-center">مقارنة النشاط البرلماني</h3>
                        <div className="h-80 w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis dataKey="name" tick={{fill: '#4b5563', fontSize: 12, fontWeight: 'bold'}} />
                                    <YAxis />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Legend />
                                    <Bar dataKey={mp1.fullName} fill="#436058" name={mp1.fullName} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey={mp2.fullName} fill="#C6986F" name={mp2.fullName} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Attendance */}
                        <div className="parliament-card p-6">
                             <h3 className="font-bold text-parliament-greenMain mb-6 text-center">نسبة الحضور</h3>
                             <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={attendanceData} layout="vertical">
                                        <XAxis type="number" domain={[0, 100]} hide />
                                        <YAxis type="category" dataKey="name" hide />
                                        <Tooltip />
                                        <Bar dataKey={mp1.fullName} fill="#436058" name={mp1.fullName} barSize={20} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#436058', fontWeight: 'bold' }} />
                                        <Bar dataKey={mp2.fullName} fill="#C6986F" name={mp2.fullName} barSize={20} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#C6986F', fontWeight: 'bold' }} />
                                    </BarChart>
                                </ResponsiveContainer>
                             </div>
                        </div>

                         {/* Topics Overlap */}
                         <div className="parliament-card p-6">
                             <h3 className="font-bold text-parliament-greenMain mb-2 text-center">الاهتمامات المشتركة</h3>
                             <div className="flex flex-wrap gap-2 justify-center mt-8">
                                 {mp1.topicsOfInterest?.map(t => t.subject).filter(sub => mp2.topicsOfInterest?.some(t2 => t2.subject === sub)).map((sub, idx) => (
                                     <span key={idx} className="bg-parliament-greenMain text-white px-4 py-2 rounded-full font-bold shadow-sm">
                                         {sub}
                                     </span>
                                 ))}
                                 <p className="text-xs text-parliament-textMuted w-full text-center mt-4">المواضيع التي يركز عليها كلا النائبين</p>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {(!mp1 || !mp2) && (
                <div className="text-center py-12 opacity-50">
                    <Users size={64} className="mx-auto text-parliament-wood mb-4"/>
                    <p className="font-bold text-lg text-parliament-woodDark">اختر نائبين للبدء في المقارنة</p>
                </div>
            )}
        </div>
    );
};

export default CompareView;
