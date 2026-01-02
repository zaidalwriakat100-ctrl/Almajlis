
import React, { useState, useEffect } from 'react';
import { Database, Download, FileJson, FileSpreadsheet, Info, Terminal, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { getSessions, getMPs, downloadAsJSON, downloadAsCSV, generateAlerts } from '../services/api';

const DataCenterView: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const handleDownloadSessions = async () => {
        setLoading(true);
        const data = await getSessions();
        downloadAsJSON(data, 'parliament_sessions_archive.json');
        setLoading(false);
    };

    const handleDownloadParticipationStats = async () => {
        setLoading(true);
        const mps = await getMPs();
        const headers = ['المعرف', 'الاسم الكامل', 'المحافظة', 'الحزب', 'نسبة الحضور', 'عدد المداخلات', 'عدد الأسئلة'];
        const rows = mps.map(mp => [
            mp.id,
            `"${mp.fullName}"`,
            `"${mp.governorate || ''}"`,
            `"${mp.party || 'مستقل'}"`,
            mp.attendanceRate,
            mp.activityStats?.speechesGiven || 0,
            mp.activityStats?.questionsAsked || 0
        ]);
        downloadAsCSV(headers, rows, 'mp_participation_stats.csv');
        setLoading(false);
    };

    const handleDownloadKeywordHits = async () => {
        setLoading(true);
        const alerts = await generateAlerts();
        const headers = ['التاريخ', 'الجلسة', 'المتحدث', 'الكلمة المفتاحية', 'نص المداخلة'];
        const rows = alerts.map(a => [
            a.date,
            `"${a.sessionTitle}"`,
            `"${a.speakerName}"`,
            `"${a.subscriptionValue}"`,
            `"${a.textExcerpt.replace(/"/g, '""')}"`
        ]);
        downloadAsCSV(headers, rows, 'keyword_mentions_export.csv');
        setLoading(false);
    };

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            <header className="mb-8 border-b border-parliament-wood/30 pb-8">
                <h2 className="text-3xl font-black text-parliament-greenMain flex items-center gap-3">
                    <Database className="text-parliament-wood" size={32} />
                    مركز البيانات المفتوحة
                </h2>
                <p className="text-parliament-textMuted mt-2 text-lg">أدوات مخصصة للباحثين، الصحفيين، ومطوري البرمجيات المهتمين بالشأن البرلماني.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Information Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-parliament-wood/20 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-parliament-greenMain"></div>
                        <h3 className="font-black text-parliament-greenDark text-sm mb-4 flex items-center gap-2">
                            <Info size={18} className="text-parliament-wood" />
                            عن هذه البيانات
                        </h3>
                        <p className="text-xs text-parliament-textMuted leading-relaxed space-y-3">
                            تخضع كافة البيانات المتوفرة في هذا المركز لرخصة 
                            <strong className="text-parliament-greenDark mx-1">قاعدة البيانات المفتوحة (ODbL)</strong>. 
                            نشجع الباحثين على استخدام هذه البيانات في دراساتهم مع الإشارة إلى المرصد كمصدر.
                        </p>
                        <div className="mt-6 pt-6 border-t border-parliament-wall">
                            <h4 className="font-bold text-[10px] text-parliament-woodDark uppercase mb-3">تنسيقات الملفات</h4>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                    <FileJson size={14} className="text-orange-500" /> JSON
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                    <FileSpreadsheet size={14} className="text-green-600" /> CSV (Excel)
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 text-white p-6 rounded-2xl border border-white/10 shadow-xl">
                        <h3 className="font-black text-white text-sm mb-4 flex items-center gap-2">
                            <Terminal size={18} className="text-parliament-wood" />
                            Public API (Beta)
                        </h3>
                        <p className="text-[11px] opacity-70 mb-4 leading-relaxed">
                            نوفر واجهة برمجية تجريبية للوصول اللحظي للبيانات. إذا كنت مطوراً، يمكنك استخدام الروابط التالية:
                        </p>
                        <div className="space-y-2 font-mono text-[10px]">
                            <div className="bg-black/30 p-2 rounded border border-white/5 flex justify-between">
                                <span className="text-parliament-wood">GET</span>
                                <span className="text-green-400">/api/v1/sessions</span>
                            </div>
                            <div className="bg-black/30 p-2 rounded border border-white/5 flex justify-between">
                                <span className="text-parliament-wood">GET</span>
                                <span className="text-green-400">/api/v1/mps</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Download Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-black text-parliament-text">الملفات المتاحة للتحميل</h3>
                        <span className="text-[10px] font-bold text-parliament-textMuted bg-parliament-wall px-3 py-1 rounded-full uppercase">تحديث يومي</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Dataset 1 */}
                        <div className="parliament-card p-6 bg-white hover:border-parliament-greenMain transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                    <FileJson size={24} />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400">4.2 MB</span>
                            </div>
                            <h4 className="font-black text-parliament-text mb-2">أرشيف الجلسات الكامل</h4>
                            <p className="text-xs text-parliament-textMuted leading-relaxed mb-6">
                                يحتوي على كافة الجلسات المرصودة، مفرغات النصوص، تحليل المداخلات، والكيانات المستخرجة بصيغة JSON.
                            </p>
                            <button 
                                onClick={handleDownloadSessions}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-parliament-wall/40 text-parliament-greenDark rounded-xl text-xs font-bold hover:bg-parliament-greenMain hover:text-white transition-all"
                            >
                                <Download size={16} /> تحميل الملف
                            </button>
                        </div>

                        {/* Dataset 2 */}
                        <div className="parliament-card p-6 bg-white hover:border-parliament-greenMain transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 border border-green-100 group-hover:bg-green-600 group-hover:text-white transition-all">
                                    <FileSpreadsheet size={24} />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400">120 KB</span>
                            </div>
                            <h4 className="font-black text-parliament-text mb-2">إحصائيات مشاركة النواب</h4>
                            <p className="text-xs text-parliament-textMuted leading-relaxed mb-6">
                                بيانات جدولية (CSV) تشمل نسب الحضور، عدد المداخلات والأسئلة لكافة أعضاء مجلس النواب للدورة الحالية.
                            </p>
                            <button 
                                onClick={handleDownloadParticipationStats}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-parliament-wall/40 text-parliament-greenDark rounded-xl text-xs font-bold hover:bg-parliament-greenMain hover:text-white transition-all"
                            >
                                <Download size={16} /> تحميل الملف
                            </button>
                        </div>

                        {/* Dataset 3 */}
                        <div className="parliament-card p-6 bg-white border-dashed hover:border-solid hover:border-parliament-greenMain transition-all group">
                             <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <Sparkles size={24} />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400">حسب الطلب</span>
                            </div>
                            <h4 className="font-black text-parliament-text mb-2">تصدير مذكرات الكلمات المفتاحية</h4>
                            <p className="text-xs text-parliament-textMuted leading-relaxed mb-6">
                                تصدير كافة المداخلات التي طابقت تنبيهاتك الشخصية الحالية إلى ملف CSV لاستخدامها في الأبحاث.
                            </p>
                            <button 
                                onClick={handleDownloadKeywordHits}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-parliament-wall/40 text-parliament-greenDark rounded-xl text-xs font-bold hover:bg-parliament-greenMain hover:text-white transition-all"
                            >
                                <Download size={16} /> تصدير وتنزيل
                            </button>
                        </div>

                        {/* Resource */}
                        <div className="bg-parliament-wall/20 p-6 rounded-2xl border-2 border-dashed border-parliament-wood/20 flex flex-col justify-center items-center text-center">
                            <BookOpen size={32} className="text-parliament-wood/50 mb-3" />
                            <h4 className="font-bold text-parliament-greenDark text-xs mb-1">دليل الاستخدام</h4>
                            <p className="text-[10px] text-parliament-textMuted">اقرأ الوثائق الفنية حول هيكلية البيانات.</p>
                        </div>
                    </div>

                    <div className="p-4 bg-parliament-wall/20 rounded-xl border border-parliament-wood/10 flex gap-3">
                        <AlertCircle size={16} className="text-parliament-wood shrink-0 mt-0.5" />
                        <p className="text-[10px] text-parliament-textMuted leading-relaxed">
                            <strong>ملاحظة تقنية:</strong> يتم تحديث هذه الملفات تلقائياً كل ليلة عند الساعة 12:00 صباحاً بتوقيت عمان لضمان دقة البيانات المستخرجة من أحدث الجلسات.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataCenterView;
