
import React from 'react';
import { ArrowRight, Calendar, FileText, Check, Clock, ExternalLink, HelpCircle, Lightbulb } from 'lucide-react';
import { Law } from '../types';
import DataMeta from './DataMeta';

interface LawDetailViewProps {
  law: Law;
  onBack: () => void;
}

const LawDetailView: React.FC<LawDetailViewProps> = ({ law, onBack }) => {
  return (
    <div className="space-y-8 animate-fade-in">
       <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium">
        <ArrowRight size={20} /> العودة للتشريعات
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8 mb-8">
            <div className="flex-1">
                <div className="flex gap-2 mb-3">
                    {law.tags.map(tag => (
                        <span key={tag} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">{tag}</span>
                    ))}
                </div>
                <h1 className="text-3xl font-black text-slate-900 leading-tight mb-4">{law.title}</h1>
                <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">{law.description}</p>
                
                <div className="mt-6">
                    <DataMeta source={law.source} lastUpdated={law.lastUpdated} />
                </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 min-w-[200px]">
                <div className="text-sm text-slate-500 mb-1">تاريخ الطرح</div>
                <div className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Calendar size={16}/> {law.dateProposed}</div>
                {law.status === 'passed' && (
                    <div className="text-green-700 font-bold flex items-center gap-2"><Check size={16}/> تم الإقرار</div>
                )}
            </div>
        </div>

        {/* AI Explainer Section */}
        {law.simpleExplainer && (
            <div className="mb-8 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-100 rounded-full blur-2xl opacity-50 -z-0 transform translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="flex items-center gap-2 mb-4 relative z-10">
                    <Lightbulb className="text-indigo-600" size={24} />
                    <h3 className="text-xl font-bold text-indigo-900">ماذا يعني هذا القانون لك؟</h3>
                </div>
                
                <p className="text-indigo-800 mb-6 font-medium leading-relaxed max-w-4xl">
                    {law.simpleExplainer.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div className="bg-white/60 p-4 rounded-lg border border-indigo-50">
                        <h4 className="font-bold text-indigo-700 mb-2 text-sm">من يتأثر؟</h4>
                        <ul className="space-y-2">
                            {law.simpleExplainer.whoIsAffected.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white/60 p-4 rounded-lg border border-indigo-50">
                        <h4 className="font-bold text-indigo-700 mb-2 text-sm">أبرز التغييرات</h4>
                        <ul className="space-y-2">
                            {law.simpleExplainer.keyChanges.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="mt-4 text-[10px] text-indigo-400 flex items-center gap-1">
                    <HelpCircle size={10} /> شرح مبسط تم إنشاؤه بواسطة الذكاء الاصطناعي لأغراض التوعية.
                </div>
            </div>
        )}

        {/* Timeline */}
        <div className="mb-8">
            <h3 className="font-bold text-slate-800 text-lg mb-6">المسار التشريعي</h3>
            <div className="relative">
                {/* Horizontal Line (Desktop) */}
                <div className="hidden md:block absolute top-4 left-0 right-0 h-0.5 bg-slate-200 -z-0"></div>
                {/* Vertical Line (Mobile) */}
                <div className="md:hidden absolute top-0 bottom-0 right-4 w-0.5 bg-slate-200 -z-0"></div>

                <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4 relative z-10">
                    {law.timeline && law.timeline.length > 0 ? law.timeline.map((event, idx) => (
                        <div key={idx} className="flex md:flex-col items-center md:items-start gap-4 md:gap-0 flex-1 group">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-4 border-white shadow-sm shrink-0 ${event.status === 'Completed' ? 'bg-parliament-greenMain text-white' : 'bg-slate-200 text-slate-400'}`}>
                                {event.status === 'Completed' ? <Check size={16} /> : <Clock size={16} />}
                            </div>
                            <div className="mt-0 md:mt-4 text-right md:text-center w-full">
                                <div className="font-bold text-slate-800 text-sm">{event.stage}</div>
                                <div className="text-xs text-slate-500 mt-1">{event.date}</div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-slate-400 text-sm italic py-4">لم يتم تسجيل أحداث في الجدول الزمني بعد.</div>
                    )}
                </div>
            </div>
        </div>

        {law.pdfUrl && (
             <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex justify-between items-center mt-8">
                <div>
                    <h3 className="font-bold text-slate-800">النص الرسمي للقانون</h3>
                    <p className="text-sm text-slate-500">متاح بصيغة PDF من المصدر الرسمي</p>
                </div>
                <a href={law.pdfUrl} target="_blank" rel="noopener noreferrer" className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-100 transition-colors flex items-center gap-2">
                    <FileText size={18} /> تحميل الملف <ExternalLink size={14} />
                </a>
             </div>
        )}
      </div>
    </div>
  );
};

export default LawDetailView;
