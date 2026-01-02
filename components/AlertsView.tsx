
import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Trash2, Calendar, Mic, ChevronLeft, Bookmark, Sparkles, MessageSquare, Mail, Edit2 } from 'lucide-react';
import { getSubscriptions, removeSubscription, generateAlerts, addSubscription, getUserEmail, setUserEmail } from '../services/api';
import { Subscription, MentionsAlert } from '../types';
import SubscriptionModal from './SubscriptionModal';

const AlertsView: React.FC<{ onSessionSelect?: (id: string, segmentId?: string) => void }> = ({ onSessionSelect }) => {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [alerts, setAlerts] = useState<MentionsAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [keywordInput, setKeywordInput] = useState('');
  const [userEmail, setUserEmailState] = useState<string | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setSubs(getSubscriptions());
    setUserEmailState(getUserEmail());
    const generated = await generateAlerts();
    setAlerts(generated);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;
    const email = getUserEmail();
    if (!email) {
      setIsModalOpen(true);
    } else {
      addSubscription('keyword', keywordInput.trim());
      setKeywordInput('');
      loadData();
    }
  };

  const handleModalConfirm = (email: string) => {
    if (keywordInput.trim()) {
      addSubscription('keyword', keywordInput.trim(), email);
      setKeywordInput('');
    } else {
      setUserEmail(email);
    }
    loadData();
    setIsModalOpen(false);
  };

  const handleDeleteSub = (id: string) => {
    removeSubscription(id);
    loadData();
  };

  const handleChangeEmail = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <SubscriptionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
        targetName={keywordInput || 'تحديثات البريد'}
      />

      <header className="mb-8 border-b border-parliament-wood/30 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-parliament-greenMain flex items-center gap-3">
            <Bell className="text-parliament-wood" size={32} />
            تنبيهاتي الذكية
          </h2>
          <p className="text-parliament-textMuted mt-2 text-lg">موجز مخصص للمواضيع والنواب والوزارات التي تهمك.</p>
        </div>
        
        {userEmail && (
          <div className="bg-white border border-parliament-wood/20 p-4 rounded-2xl shadow-sm flex items-center gap-4 group">
            <div className="w-10 h-10 bg-parliament-wall rounded-full flex items-center justify-center text-parliament-woodDark">
              <Mail size={20} />
            </div>
            <div>
              <div className="text-[9px] font-black text-parliament-woodDark uppercase tracking-tighter">بريد الموجز الموحد</div>
              <div className="text-sm font-bold text-parliament-text">{userEmail}</div>
            </div>
            <button onClick={handleChangeEmail} className="p-2 hover:bg-parliament-wall rounded-lg transition-colors text-parliament-textMuted">
              <Edit2 size={14} />
            </button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sidebar: Subscriptions Management */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-parliament-wood/20 shadow-sm">
            <h3 className="font-black text-parliament-greenDark text-sm mb-4 flex items-center gap-2">
              <Bookmark size={18} className="text-parliament-wood" />
              إدارة الاشتراكات
            </h3>
            
            <div className="relative mb-6">
              <input 
                type="text" 
                placeholder="أضف كلمة متابعة..." 
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                className="w-full bg-parliament-wall/30 border border-parliament-wood/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-parliament-wood/50"
              />
              <button 
                onClick={handleAddKeyword}
                className="absolute left-2 top-2 bg-parliament-greenMain text-white p-1.5 rounded-lg hover:bg-parliament-greenDark"
              >
                <Bell size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {subs.length > 0 ? subs.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-3 bg-parliament-wall/10 rounded-xl border border-transparent hover:border-parliament-wood/20 transition-all group">
                  <div>
                    <div className="text-[10px] font-bold text-parliament-woodDark uppercase tracking-tighter">
                      {sub.type === 'keyword' ? 'كلمة مفتاحية' : sub.type === 'speaker' ? 'نائب' : 'وزارة'}
                    </div>
                    <div className="text-sm font-bold text-parliament-text">{sub.value}</div>
                  </div>
                  <button 
                    onClick={() => handleDeleteSub(sub.id)}
                    className="p-1.5 text-parliament-textMuted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )) : (
                <p className="text-xs text-parliament-textMuted italic text-center py-4">لم تضف أي تنبيهات بعد.</p>
              )}
            </div>
          </div>

          <div className="bg-parliament-greenDark/90 text-parliament-wall p-6 rounded-2xl border border-parliament-wood/30 relative overflow-hidden shadow-xl">
             <div className="absolute inset-0 pattern-mashrabiyya opacity-5"></div>
             <div className="relative z-10">
                <h4 className="font-black text-white text-sm mb-2 flex items-center gap-2">
                   <Sparkles size={16} className="text-parliament-wood" />
                   نظام الموجز الموحد
                </h4>
                <p className="text-[11px] leading-relaxed opacity-80 mb-4">
                  بدلاً من إزعاجك برسائل متعددة، نقوم بجمع كافة التحديثات المتعلقة بـ {subs.length} اشتراكات في رسالة احترافية واحدة تصلك دورياً.
                </p>
                <div className="bg-white/10 p-3 rounded-lg border border-white/10 text-xs font-bold text-center">
                  الحالة: {userEmail ? 'نشط ومفعل' : 'بانتظار إدخال البريد'}
                </div>
             </div>
          </div>
        </div>

        {/* Main Feed: Alerts/Mentions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-2">
             <h3 className="font-black text-parliament-text flex items-center gap-2">
               <MessageSquare size={20} className="text-parliament-wood" />
               آخر المذكورات ({alerts.length})
             </h3>
             <span className="text-[10px] font-bold text-parliament-textMuted bg-parliament-wall px-3 py-1 rounded-full uppercase tracking-widest">تحديث تلقائي</span>
          </div>

          {loading ? (
             <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-40 bg-parliament-wall/20 animate-pulse rounded-2xl"></div>)}
             </div>
          ) : alerts.length > 0 ? (
            alerts.map(alert => (
              <div 
                key={alert.id}
                onClick={() => onSessionSelect && onSessionSelect(alert.sessionId, alert.id)}
                className="group parliament-card bg-white p-6 hover:shadow-xl transition-all cursor-pointer border-r-4 border-parliament-wood"
              >
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-parliament-wall rounded-full flex items-center justify-center text-parliament-woodDark group-hover:bg-parliament-greenMain group-hover:text-white transition-all">
                          <Mic size={20} />
                       </div>
                       <div>
                          <div className="font-black text-parliament-text">{alert.speakerName}</div>
                          <div className="text-[10px] font-bold text-parliament-textMuted uppercase tracking-widest flex items-center gap-1">
                             <Calendar size={10} /> {alert.date} • {alert.sessionTitle}
                          </div>
                       </div>
                    </div>
                    <span className="bg-parliament-wood/10 text-parliament-woodDark text-[9px] font-black px-3 py-1 rounded-full border border-parliament-wood/20 uppercase tracking-tighter">
                       مطابقة: {alert.subscriptionValue}
                    </span>
                 </div>
                 
                 <div className="relative">
                    <p className="text-sm text-slate-700 italic leading-relaxed line-clamp-2 pr-4 border-r-2 border-parliament-wall">
                      "...{alert.textExcerpt}..."
                    </p>
                 </div>

                 <div className="mt-4 flex items-center justify-between text-[10px] font-black">
                    <div className="text-parliament-greenMain hover:underline flex items-center gap-1">
                       انتقل إلى المداخلة في الجلسة <ChevronLeft size={12} />
                    </div>
                 </div>
              </div>
            ))
          ) : (
            <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-parliament-wall shadow-inner">
               <BellOff size={64} className="mx-auto text-parliament-wall mb-4" />
               <h4 className="text-xl font-black text-parliament-textMuted mb-2">لا توجد تنبيهات جديدة</h4>
               <p className="text-parliament-textMuted max-w-sm mx-auto text-sm">أضف كلمات مفتاحية مثل "التعليم" أو "الموازنة" لتصلك آخر المذكورات فور حدوثها.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsView;
