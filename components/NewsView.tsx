import React, { useState } from 'react';
import { Newspaper, ExternalLink, RefreshCw } from 'lucide-react';
import { analyzeNewsSentiment } from '../services/geminiService';

const MOCK_NEWS = [
    { id: 'n1', source: 'عمون', title: 'النواب يناقشون مشروع قانون الموازنة وسط انتقادات حادة للعجز', date: 'منذ ساعتين', url: '#' },
    { id: 'n2', source: 'الغد', title: 'الحكومة: لا ضرائب جديدة في موازنة 2024', date: 'منذ 4 ساعات', url: '#' },
    { id: 'n3', source: 'الرأي', title: 'لجنة الطاقة النيابية تبحث أسعار المحروقات مع المعنيين', date: 'منذ 5 ساعات', url: '#' },
    { id: 'n4', source: 'خبرني', title: 'مشادات كلامية تحت القبة بسبب ملف التعيينات', date: 'منذ يوم', url: '#' },
];

const NewsView: React.FC = () => {
    const [analysis, setAnalysis] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        const titles = MOCK_NEWS.map(n => n.title);
        const result = await analyzeNewsSentiment(titles);
        setAnalysis(result);
        setIsAnalyzing(false);
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">رصد الأخبار</h2>
                    <p className="text-slate-500">آخر ما نشرته الصحافة المحلية عن الشأن البرلماني</p>
                </div>
                <button className="bg-white border border-slate-300 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm">
                    <RefreshCw size={16} /> تحديث
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* News Feed */}
                <div className="lg:col-span-2 space-y-4">
                    {MOCK_NEWS.map(news => (
                        <div key={news.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4">
                             <div className="w-full md:w-32 h-24 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 flex-shrink-0">
                                <Newspaper size={32} />
                             </div>
                             <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{news.source}</span>
                                    <span className="text-xs text-slate-400">{news.date}</span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 mt-2 mb-2 line-clamp-2 hover:text-blue-700 cursor-pointer">{news.title}</h3>
                                <a href={news.url} className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1">
                                    اقرأ المزيد <ExternalLink size={12} />
                                </a>
                             </div>
                        </div>
                    ))}
                </div>

                {/* AI Insight Side Panel */}
                <div>
                    <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg sticky top-6">
                        <div className="mb-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                نبض الشارع
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">
                                تحليل الذكاء الاصطناعي لتوجهات الأخبار الحالية.
                            </p>
                        </div>

                        {!analysis ? (
                            <button 
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                {isAnalyzing ? 'جاري التحليل...' : 'تحليل المشهد الإعلامي'}
                            </button>
                        ) : (
                            <div className="bg-slate-800 rounded-lg p-4 text-sm leading-relaxed text-slate-200 animate-fade-in border border-slate-700">
                                {analysis}
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-slate-700">
                            <h4 className="font-bold text-sm mb-3 text-slate-300">مصادر الرصد</h4>
                            <div className="flex flex-wrap gap-2">
                                {['عمون', 'الغد', 'الرأي', 'خبرني', 'السبيل', 'سرايا'].map(src => (
                                    <span key={src} className="text-xs bg-slate-800 border border-slate-700 px-2 py-1 rounded text-slate-400">{src}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsView;
