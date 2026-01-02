
import React, { useState } from 'react';
import { X, Mail, Bell, ShieldCheck } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (email: string) => void;
  targetName: string;
  initialEmail?: string;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onConfirm, targetName, initialEmail }) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [error, setError] = useState('');

  // Update email if initialEmail changes and current email is empty
  React.useEffect(() => {
    if (initialEmail && !email) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    onConfirm(email);
    setEmail('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[#1A2E28]/80 backdrop-blur-xl animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden relative animate-scale-in border border-white/20">
        {/* Decorative Header Area */}
        <div className="h-24 bg-gradient-to-br from-[#1A2E28] to-[#2D463E] relative flex items-center justify-center">
          <div className="absolute inset-0 pattern-mashrabiyya opacity-10"></div>
          <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-[#B18154] absolute -bottom-10 border-4 border-white">
            <Bell size={40} className="animate-swing" />
          </div>
          <button
            onClick={onClose}
            className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-8 pt-16 pb-10 text-center">
          <h3 className="text-2xl font-black text-[#2D463E] mb-3">تفعيل التنبيهات المجانية</h3>
          <p className="text-slate-500 text-sm font-bold leading-relaxed mb-8 px-4">
            سجل بريدك الإلكتروني لتكون أول من يعلم بمداخلات ومواقف <span className="text-[#B18154]">{targetName}</span> فور صدورها.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-right">
              <label className="block text-[10px] font-black text-[#B18154] uppercase mb-2 mr-2 tracking-widest text-right">البريد الإلكتروني</label>
              <div className="relative group">
                <input
                  type="email"
                  autoFocus
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 pr-14 focus:outline-none focus:border-[#B18154] focus:bg-white focus:ring-8 focus:ring-[#B18154]/5 transition-all text-slate-900 font-bold"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#B18154] transition-colors">
                  <Mail size={22} />
                </div>
              </div>
              {error && (
                <div className="mt-2 text-right animate-shake">
                  <span className="text-red-500 text-[10px] font-bold bg-red-50 px-2 py-1 rounded-md">{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#B18154] to-[#8B633F] text-white py-5 rounded-2xl font-black shadow-[0_12px_24px_-6px_rgba(177,129,84,0.4)] hover:shadow-[0_20px_40px_-12px_rgba(177,129,84,0.6)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-3 text-lg"
            >
              <ShieldCheck size={24} />
              اشتراك مجاني الآن
            </button>
          </form>

          <div className="mt-8 p-4 bg-slate-50 rounded-2xl flex items-center gap-3 text-right">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
              <ShieldCheck size={16} />
            </div>
            <p className="text-[10px] text-slate-400 font-bold leading-tight">
              نحن نحترم خصوصیك. يمكنك إلغاء الاشتراك في أي وقت، ولن نطالبك بأي رسوم مقابل هذه الخدمة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
