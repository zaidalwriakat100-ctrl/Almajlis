
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Party, MP, Law, Subscription } from '../types';
import { getMPs, getLaws, getParties, getSubscriptions, addSubscription, removeSubscription } from '../services/api';
import { Search, Filter, ChevronRight, AlertCircle, RefreshCw, Bell, BellRing } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

interface VotingViewProps {
    onMpSelect?: (id: string) => void;
}

const VotingView: React.FC<VotingViewProps> = ({ onMpSelect }) => {
  const [mps, setMps] = useState<MP[]>([]);
  const [laws, setLaws] = useState<Law[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mpSearch, setMpSearch] = useState('');

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
        const [mpsData, lawsData, partiesData] = await Promise.all([getMPs(), getLaws(), getParties()]);
        setMps(mpsData);
        setLaws(lawsData);
        setParties(partiesData);
        setSubs(getSubscriptions());
    } catch (e) {
        setError('تعذر تحميل بيانات التصويت.');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleToggleSub = (e: React.MouseEvent, mpName: string) => {
    e.stopPropagation();
    const existing = subs.find(s => s.type === 'speaker' && s.value === mpName);
    if (existing) {
      removeSubscription(existing.id);
    } else {
      addSubscription('speaker', mpName);
    }
    setSubs(getSubscriptions());
  };

  const isSubscribed = (name: string) => subs.some(s => s.type === 'speaker' && s.value === name);

  const recentLaw = laws.find(l => l.status === 'passed' && l.voteBreakdown) || laws[0];
  const votingData = recentLaw?.voteBreakdown ? [
    { name: 'مع', value: recentLaw.voteBreakdown.with, color: '#436058' },
    { name: 'ضد', value: recentLaw.voteBreakdown.against, color: '#8B0000' },
    { name: 'امتناع', value: recentLaw.voteBreakdown.abstain, color: '#C6986F' },
    { name: 'غياب', value: recentLaw.voteBreakdown.absent, color: '#A9A9A9' },
  ] : [];

  const filteredMps = mps.filter(mp => mp.fullName.includes(mpSearch) || mp.district?.includes(mpSearch));

  if (loading) return <div className="text-center py-20 text-parliament-textMuted font-bold">جاري تحميل تحليل التصويت...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-parliament-greenMain">تحليل التصويت والكتل</h2>
            <p className="text-parliament-textMuted">استكشاف مواقف النواب والكتل تجاه القوانين المفصلية</p>
        </div>
        <button className="bg-white border border-parliament-wood text-parliament-greenMain px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-parliament-wall shadow-sm">
            <Filter size={16} /> تصفية البيانات
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="parliament-card p-6">
            <h3 className="font-bold text-parliament-greenMain mb-4 border-b border-parliament-wood/30 pb-2">
                نتائج التصويت: {recentLaw?.title || 'لا توجد بيانات'}
            </h3>
            {votingData.length > 0 ? (
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={votingData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {votingData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : <div className="h-64 flex items-center justify-center text-parliament-textMuted/50">لا توجد بيانات</div>}
        </div>

        <div className="parliament-card p-6">
            <h3 className="font-bold text-parliament-greenMain mb-4 border-b border-parliament-wood/30 pb-2">توزيع المقاعد الحزبية</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={parties} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fontWeight: 'bold', fill: '#2B3132'}} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="seats" name="عدد المقاعد" radius={[0, 4, 4, 0]}>
                            {parties.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color || '#436058'} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      <div className="parliament-card overflow-hidden">
        <div className="p-6 border-b border-parliament-wood/30 flex flex-col md:flex-row justify-between items-center gap-4 bg-parliament-wall/30">
            <h3 className="font-bold text-lg text-parliament-greenMain">قائمة النواب ({mps.length})</h3>
            <div className="relative w-full md:w-96">
                <input 
                    type="text" 
                    placeholder="ابحث باسم النائب أو الدائرة..." 
                    value={mpSearch}
                    onChange={(e) => setMpSearch(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-md border border-parliament-wood/30 focus:outline-none focus:ring-1 focus:ring-parliament-greenMain bg-white"
                />
                <Search className="absolute right-3 top-3 text-parliament-textMuted" size={18} />
            </div>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-right">
                <thead className="bg-parliament-greenMain text-parliament-wall text-xs font-bold uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4">النائب</th>
                        <th className="px-6 py-4">الكتلة / الحزب</th>
                        <th className="px-6 py-4">الدائرة</th>
                        <th className="px-6 py-4">نسبة الحضور</th>
                        <th className="px-6 py-4"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-parliament-wood/20">
                    {filteredMps.slice(0, 10).map((mp) => {
                        const subscribed = isSubscribed(mp.fullName);
                        return (
                          <tr 
                              key={mp.id} 
                              className="hover:bg-parliament-wallWarm/30 transition-colors cursor-pointer group"
                              onClick={() => onMpSelect && onMpSelect(mp.id)}
                          >
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <div className="relative">
                                        <ImageWithFallback src={mp.photoUrl} alt={mp.fullName} className="w-10 h-10 rounded-full object-cover border border-parliament-wood/50" />
                                        <button 
                                          onClick={(e) => handleToggleSub(e, mp.fullName)}
                                          className={`absolute -top-1 -left-1 p-1 rounded-full shadow-sm border transition-all ${subscribed ? 'bg-parliament-wood text-white border-parliament-wood' : 'bg-white text-parliament-wood border-parliament-wood/20 hover:scale-110'}`}
                                        >
                                          {subscribed ? <BellRing size={10} /> : <Bell size={10} />}
                                        </button>
                                      </div>
                                      <span className="font-bold text-parliament-text group-hover:text-parliament-greenMain transition-colors">{mp.fullName}</span>
                                  </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-parliament-textMuted">{mp.party || 'مستقل'}</td>
                              <td className="px-6 py-4 text-sm text-parliament-textMuted">{mp.district || mp.governorate}</td>
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                      <div className="w-16 h-1.5 bg-parliament-wall rounded-full overflow-hidden border border-parliament-wood/20">
                                          <div className={`h-full ${mp.attendanceRate && mp.attendanceRate > 90 ? 'bg-parliament-greenMain' : 'bg-parliament-wood'}`} style={{ width: `${mp.attendanceRate || 0}%` }}></div>
                                      </div>
                                      <span className="text-xs font-bold text-parliament-text">{mp.attendanceRate || 0}%</span>
                                  </div>
                              </td>
                              <td className="px-6 py-4 text-left">
                                  <ChevronRight size={18} className="text-parliament-wood group-hover:text-parliament-greenMain" />
                              </td>
                          </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default VotingView;
