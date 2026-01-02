
import React from 'react';
import { Shield, Database, Mail, Heart, Wallet, BookOpen } from 'lucide-react';

const AboutView: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in">
            <div className="text-center py-12">
                <h1 className="text-4xl font-black text-slate-900 mb-4">من نحن؟</h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                    منصة المجلس هي منصة مستقلة تهدف لتعزيز الشفافية التشريعية وتمكين المواطن الأردني من متابعة أداء ممثليه تحت القبة من خلال البيانات الرسمية المجردة.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                        <Database size={24} />
                    </div>
                    <h3 className="font-black text-lg mb-3 text-parliament-greenMain">مصادر البيانات</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-bold">
                        نعتمد بشكل حصري على البيانات الرسمية الصادرة عن موقع مجلس النواب، الجريدة الرسمية، والجلسات المتلفزة للمجلس المتاحة للعامة لضمان دقة المعلومة.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                        <Shield size={24} />
                    </div>
                    <h3 className="font-black text-lg mb-3 text-parliament-greenMain">الحيادية</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-bold">
                        لا نتبع لأي حزب. هدفنا تقديم المعلومة المجردة للمواطن كما هي، ليبني عليها موقفه الخاص دون توجيه.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-parliament-wall text-parliament-wood rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                        <BookOpen size={24} />
                    </div>
                    <h3 className="font-black text-lg mb-3 text-parliament-greenMain">لدعم البحث في الشأن البرلماني في الأردن</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-bold">
                        نسعى لتوفير مادة علمية وبيانات منظمة للباحثين والأكاديميين والطلبة لتعميق الفهم بالعملية التشريعية والرقابية في المملكة.
                    </p>
                </div>
            </div>

            <div className="bg-slate-900 text-white rounded-[40px] p-8 md:p-16 relative overflow-hidden shadow-2xl border-t-8 border-parliament-wood">
                <div className="absolute inset-0 pattern-mashrabiyya opacity-10 pointer-events-none"></div>
                <div className="relative z-10 text-center md:text-right">
                    <h2 className="text-3xl font-black mb-6 text-white">تواصل معنا</h2>
                    <p className="text-slate-300 mb-8 max-w-xl text-lg leading-relaxed font-medium">
                        يسعدنا تواصلكم معنا لأي استفسار أو فكرة تعاون
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">

                        <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 border border-slate-200">
                            <Mail size={20} className="text-parliament-wood" />
                            تواصل معنا
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 left-0 w-64 h-64 bg-parliament-wood opacity-20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>


        </div>
    );
};

export default AboutView;
