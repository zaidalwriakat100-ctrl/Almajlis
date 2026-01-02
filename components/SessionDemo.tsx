
import React, { useState } from 'react';
import { Calendar, User, Quote, FileText, Loader2, AlertCircle } from 'lucide-react';

interface Segment {
  speaker: string;
  summary: string;
  quote: string;
}

interface SessionData {
  title: string;
  date: string;
  summary: string[];
  segments: Segment[];
}

const DEMO_DATA: SessionData = {
  "title": "الجلسة الثامنة",
  "date": "2025-12-08",
  "summary": [
    "افتتاح الجلسة بعد اكتمال النصاب القانوني.",
    "مداخلات نيابية حول زيارة البرلمان الأوروبي والإشادة بدور الأردن.",
    "بدء مناقشة تقرير اللجنة المالية حول موازنة 2026."
  ],
  "segments": [
    {
      "speaker": "خميس عطية",
      "summary": "عرض نتائج زيارة وفد مجلس النواب إلى بروكسل والإشادة بدور الأردن والملك.",
      "quote": "الاردن يشكل ركيزه استقرار في الشرق الاوسط"
    },
    {
      "speaker": "هالة الجراح",
      "summary": "شكر البرلمان الأوروبي والتأكيد على الشراكة وقمة 2026.",
      "quote": "القمه الاردنيه الاوروبيه المرتقبه في عام 2026"
    },
    {
      "speaker": "خليفة الديات",
      "summary": "الإشادة بإنجازات مؤسسات أردنية فازت بجوائز التميز الحكومي.",
      "quote": "حازت على جائزه التميز الحكومي العربي"
    }
  ]
};

const SessionDemo: React.FC = () => {
  const [data, setData] = useState<SessionData | null>(DEMO_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-parliament-textMuted">
        <Loader2 className="animate-spin mb-4 text-parliament-wood" size={48} />
        <p>جاري تحميل الجلسة التجريبية...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-red-50/50 rounded-lg border border-red-100 text-center parliament-card mt-8">
        <AlertCircle className="text-jordan-red mb-4 opacity-80" size={48} />
        <h3 className="text-parliament-marble font-bold text-lg mb-2">خطأ في الاتصال</h3>
        <p className="text-parliament-textMuted mb-6">{error || 'لم يتم العثور على بيانات.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="parliament-card p-8 bg-white border-t-8 border-parliament-wood relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-parliament-wood/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <h1 className="text-3xl font-black text-parliament-greenMain mb-3 relative z-10">{data.title}</h1>
        <div className="flex items-center gap-2 text-parliament-textMuted font-bold text-sm bg-parliament-wall/30 inline-flex px-3 py-1 rounded-full border border-parliament-wood/20">
          <Calendar size={16} className="text-parliament-wood" />
          <span>{data.date}</span>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white p-8 rounded-xl border border-parliament-wood/30 shadow-sm relative">
        <h2 className="text-xl font-bold text-parliament-woodDark mb-6 flex items-center gap-2 pb-4 border-b border-parliament-wall">
          <FileText size={24} />
          ملخص مجريات الجلسة
        </h2>
        <ul className="space-y-4">
          {data.summary.map((point, idx) => (
            <li key={idx} className="flex items-start gap-4 text-slate-700 leading-relaxed font-medium">
              <span className="w-2 h-2 bg-parliament-greenMain rounded-full mt-2.5 shrink-0 shadow-sm"></span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Segments Timeline */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-2xl font-black text-parliament-greenMain">
            مداخلات النواب
          </h2>
          <div className="h-1 flex-1 bg-gradient-to-l from-parliament-wood/30 to-transparent rounded-full"></div>
        </div>

        {data.segments.map((seg, idx) => (
          <div key={idx} className="group bg-white p-6 rounded-xl border border-parliament-wood/20 hover:shadow-lg transition-all duration-300 relative overflow-hidden hover:border-parliament-wood/50">
            {/* Decorative Side Bar */}
            <div className="absolute top-0 right-0 w-1.5 h-full bg-parliament-wall group-hover:bg-parliament-wood transition-colors"></div>
            
            <div className="flex items-center gap-4 mb-4 pr-3">
              <div className="w-12 h-12 bg-parliament-wall rounded-full flex items-center justify-center text-parliament-woodDark border border-parliament-wood/30 shadow-sm group-hover:bg-parliament-greenMain group-hover:text-white transition-colors">
                <User size={24} />
              </div>
              <div>
                <span className="font-black text-lg text-parliament-text block group-hover:text-parliament-greenMain transition-colors">{seg.speaker}</span>
                <span className="text-xs text-parliament-textMuted font-bold">نائب</span>
              </div>
            </div>

            <p className="text-slate-600 mb-5 leading-relaxed pr-3 text-lg">{seg.summary}</p>

            <div className="mr-3 bg-parliament-wall/20 p-5 rounded-lg border-r-4 border-parliament-greenMain/30 relative">
              <Quote className="absolute top-3 left-3 text-parliament-wood/10" size={32} />
              <p className="text-parliament-greenDark font-bold italic relative z-10 text-base font-serif">
                "{seg.quote}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionDemo;
