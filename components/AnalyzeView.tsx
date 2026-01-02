
import React, { useState } from 'react';
import { analyzeSessionTranscriptV2 } from '../services/geminiService';
import { 
  Copy, Download, RefreshCw, AlertCircle, 
  CheckCircle, FileText, Sparkles, Database, 
  Terminal, History, LayoutDashboard
} from 'lucide-react';
import { downloadAsJSON } from '../services/api';

const AnalyzeView: React.FC = () => {
    const [input, setInput] = useState({ id: '', title: '', date: '', text: '' });
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleAnalyze = async () => {
        if (!input.text || !input.title) {
            setError('الرجاء إدخال عنوان الجلسة ونص المحضر على الأقل');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess(false);
        
        try {
            const data = await analyzeSessionTranscriptV2({
                sessionId: input.id || `sess_${Date.now()}`,
                title: input.title,
                date: input.date || new Date().toISOString().split('T')[0],
                transcriptText: input.text
            });
            
            if (data) {
                setResult(data);
                setSuccess(true);
            } else {
                setError('فشل الذكاء الاصطناعي في معالجة النص، حاول تقصير النص أو التأكد من المحتوى.');
            }
        } catch (e) {
            setError('حدث خطأ تقني أثناء الاتصال بخدمة التحليل.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(result, null, 2));
        alert('تم نسخ البيانات المنظمة! يمكنك الآن لصقها في ملف sessions.json');
    };

    const downloadResult = () => {
        downloadAsJSON(result, `session_analysis_${input.date || 'new'}.json`);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20 max-w-5xl mx-auto">
            <header className="bg-white p-8 rounded-[40px] border border-parliament-wood/20 shadow-sm">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-parliament-wall rounded-2xl text-parliament-greenMain shadow-inner">
                        <Terminal size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-parliament-greenMain">مركز رفع وإدارة الجلسات</h2>
                        <p className="text-parliament-textMuted font-bold text-sm">حول محاضر الجلسات الخام إلى ملخصات ذكية ومداخلات منظمة.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[40px] border border-parliament-wood/10 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-parliament-woodDark mb-2 uppercase mr-1">عنوان الجلسة (مثلاً: الجلسة السابعة)</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-parliament-wall/20 border border-parliament-wall rounded-xl px-4 py-3 text-sm font-bold focus:border-parliament-greenMain focus:outline-none transition-all"
                                    placeholder="أدخل عنوان الجلسة هنا..."
                                    value={input.title}
                                    onChange={e => setInput({...input, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-parliament-woodDark mb-2 uppercase mr-1">تاريخ الانعقاد</label>
                                <input 
                                    type="date" 
                                    className="w-full bg-parliament-wall/20 border border-parliament-wall rounded-xl px-4 py-3 text-sm font-bold focus:border-parliament-greenMain focus:outline-none transition-all"
                                    value={input.date}
                                    onChange={e => setInput({...input, date: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-parliament-woodDark mb-2 uppercase mr-1">نص المحضر (Transcript)</label>
                            <textarea 
                                className="w-full bg-parliament-wall/20 border border-parliament-wall rounded-2xl p-4 h-80 font-mono text-xs focus:border-parliament-greenMain focus:outline-none transition-all leading-relaxed"
                                placeholder="الصق النص المستخرج من يوتيوب أو المحاضر الرسمية هنا..."
                                value={input.text}
                                onChange={e => setInput({...input, text: e.target.value})}
                            ></textarea>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={handleAnalyze} 
                                disabled={loading}
                                className="flex-1 bg-parliament-greenMain text-white px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl hover:brightness-110 active:scale-95 transition-all"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
                                {loading ? 'جاري معالجة البيانات...' : 'بدء التحليل الذكي'}
                            </button>
                            {result && (
                                <button 
                                    onClick={() => {setResult(null); setInput({id: '', title:'', date:'', text:''}); setSuccess(false);}}
                                    className="px-6 py-4 bg-parliament-wall text-parliament-textMuted rounded-2xl font-bold hover:bg-parliament-wallWarm transition-all"
                                >
                                    إعادة ضبط
                                </button>
                            )}
                        </div>

                        {error && (
                            <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 flex items-center gap-3 font-bold text-sm animate-pulse">
                                <AlertCircle size={20} /> {error}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-parliament-greenDark text-white p-8 rounded-[40px] shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 pattern-mashrabiyya opacity-10"></div>
                        <div className="relative z-10">
                            <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-parliament-wood" /> تعليمات الرفع
                            </h3>
                            <ul className="text-xs space-y-4 leading-relaxed opacity-80 list-disc pr-4">
                                <li>الصق مفرغ النص كاملاً للحصول على أدق النتائج.</li>
                                <li>تأكد من إدراج التواريخ والأسماء بشكل صحيح.</li>
                                <li>يقوم الذكاء الاصطناعي بتصنيف المواقف السياسية تلقائياً.</li>
                            </ul>
                        </div>
                    </div>

                    {success && (
                        <div className="bg-emerald-50 p-6 rounded-[40px] border border-emerald-200 animate-fade-in shadow-sm">
                            <div className="flex items-center gap-2 text-emerald-800 font-black mb-4">
                                <CheckCircle size={20} /> تم التحليل بنجاح
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={copyToClipboard} className="flex flex-col items-center justify-center p-4 bg-white border border-emerald-200 rounded-2xl hover:bg-emerald-100 transition-all gap-2">
                                    <Copy size={20} className="text-emerald-600" />
                                    <span className="text-[10px] font-black">نسخ الكود</span>
                                </button>
                                <button onClick={downloadResult} className="flex flex-col items-center justify-center p-4 bg-white border border-emerald-200 rounded-2xl hover:bg-emerald-100 transition-all gap-2">
                                    <Download size={20} className="text-emerald-600" />
                                    <span className="text-[10px] font-black">تحميل JSON</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {result && (
                <div className="bg-white p-8 rounded-[40px] border border-parliament-wood/10 shadow-sm animate-fade-in">
                    <h3 className="font-black text-parliament-greenDark mb-6 flex items-center gap-2">
                        <Database size={20} className="text-parliament-wood" /> معاينة البيانات الناتجة
                    </h3>
                    <div className="bg-slate-900 text-emerald-400 p-6 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner">
                        <pre>{JSON.stringify(result, null, 2)}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyzeView;
