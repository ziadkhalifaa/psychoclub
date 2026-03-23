import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Star, ArrowLeft } from 'lucide-react';

export default function Sessions() {
  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => fetch('/api/doctors').then(res => res.json())
  });

  if (isLoading) return <div className="p-24 text-center">جاري تحميل قائمة الأخصائيين...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="bg-[#1F2F4A] rounded-3xl p-6 md:p-12 text-center text-white relative overflow-hidden mt-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6FA65A]/20 to-transparent mix-blend-overlay" />
        <h1 className="text-2xl md:text-4xl font-bold mb-4 relative z-10">حجز جلسة علاجية</h1>
        <p className="text-slate-300 max-w-2xl mx-auto relative z-10 font-bold text-sm md:text-base">
          احجز جلستك الآن مع نخبة من الأخصائيين النفسيين المعتمدين للحصول على الدعم النفسي والعلاج المتكامل في بيئة آمنة ومهنية.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {doctors?.map((doc: any) => (
          <Link
            key={doc.id}
            to={`/sessions/${doc.id}`}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group block"
          >
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-slate-50 relative group-hover:border-emerald-50 transition-colors">
                {doc.photo || doc.user?.avatar ? (
                  <img src={doc.photo || doc.user?.avatar} alt={doc.user?.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                    <User className="w-10 h-10" />
                  </div>
                )}
              </div>
              <h3 className="font-black text-xl text-[#1F2F4A] group-hover:text-[#6FA65A] transition-colors text-center">{doc.user?.name}</h3>
              <p className="text-sm font-bold text-slate-400 mt-1 text-center">{doc.title || "أخصائي"}</p>
              
              <div className="flex items-center gap-1.5 mt-3 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                <Star className={`w-3.5 h-3.5 ${doc.rating > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                <span className="text-xs font-black text-[#1F2F4A]">{doc.rating?.toFixed(1) || '0.0'}</span>
                <span className="text-[10px] font-bold text-slate-400">({doc._count?.reviews || 0})</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <div className="text-sm font-black text-[#1F2F4A]">
                {doc.sessionPrice} <span className="text-[#6FA65A] text-xs">ج.م / جلسة</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-[#6FA65A] group-hover:translate-x-[-4px] transition-transform">
                احجز الآن
                <ArrowLeft className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
        {(!doctors || doctors.length === 0) && (
          <div className="col-span-full py-20 text-center text-slate-400 font-bold">
            لا يوجد أخصائيين متاحين حالياً
          </div>
        )}
      </div>
    </div>
  );
}
