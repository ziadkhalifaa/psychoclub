import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Filter, FileText, Download, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Tools() {
  const { user } = useAuth();
  const { data: tools, isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: () => fetch('/api/tools').then(res => res.json())
  });

  if (isLoading) return <div className="p-24 text-center">جاري التحميل...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#1F2F4A] border border-white/10 shadow-2xl rounded-3xl p-12 text-center text-white relative overflow-hidden backdrop-blur-sm"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#6FA65A]/20 to-transparent mix-blend-overlay" />
        <h1 className="text-4xl font-bold mb-4 relative z-10">الأدوات التفاعلية</h1>
        <p className="text-slate-300 max-w-2xl mx-auto relative z-10">
          مجموعة من الأدوات والمقاييس وأوراق العمل المصممة خصيصاً للممارسين في مجال الصحة النفسية.
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full md:w-64 shrink-0 space-y-8"
        >
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/50">
            <h3 className="font-bold text-[#1F2F4A] mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              تصفية النتائج
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">النوع</h4>
                <div className="space-y-2">
                  {['PDF', 'HTML'].map(type => (
                    <label key={type} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-300 text-[#6FA65A] focus:ring-[#6FA65A]" />
                      {type === 'PDF' ? 'ملفات PDF' : 'أدوات تفاعلية'}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tools Grid */}
      <div className="flex-1 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex justify-between items-center bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-white/50"
        >
          <div className="relative w-full max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث في الأدوات..."
              className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6FA65A]/50 focus:border-[#6FA65A] transition-all"
            />
          </div>
          <div className="text-sm font-medium text-slate-500 hidden sm:block bg-slate-100/80 px-4 py-2 rounded-xl">
            عرض {tools?.length || 0} أداة
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tools?.map((tool: any, i: number) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 + (i * 0.1) }}
              whileHover={{ y: -5 }}
              key={tool.id}
              className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/50 group flex flex-col hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-[#6FA65A] mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="bg-slate-100 px-2 py-1 rounded-md text-xs font-medium text-slate-600">
                  {tool.type}
                </span>
                {JSON.parse(tool.categories).map((cat: string) => (
                  <span key={cat} className="bg-emerald-50 px-2 py-1 rounded-md text-xs font-medium text-[#6FA65A]">
                    {cat}
                  </span>
                ))}
              </div>

              <h3 className="text-xl font-bold text-[#1F2F4A] mb-2 line-clamp-2 group-hover:text-[#6FA65A] transition-colors">
                {tool.title}
              </h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1">{tool.description}</p>

              <div className="space-y-3 pt-4 border-t border-slate-100 mt-auto">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">سعر المشاهدة</span>
                  <span className="font-bold text-[#1F2F4A]">{tool.priceView} ج.م</span>
                </div>
                {tool.priceDownload && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">سعر التحميل</span>
                    <span className="font-bold text-[#1F2F4A]">{tool.priceDownload} ج.م</span>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Link to={`/tools/${tool.id}`} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-[#1F2F4A] py-2 rounded-xl text-sm font-semibold transition-colors">
                    <Eye className="w-4 h-4" />
                    عرض التفاصيل
                  </Link>
                  {user?.role === 'ADMIN' ? (
                    <Link to={`/tools/${tool.id}`} className="flex-1 flex items-center justify-center gap-2 bg-[#6FA65A] hover:bg-emerald-600 text-white py-2 rounded-xl text-sm font-semibold transition-colors">
                      <Download className="w-4 h-4" />
                      فتح الأداة
                    </Link>
                  ) : (
                    <Link to={`/tools/${tool.id}`} className="flex-1 flex items-center justify-center gap-2 bg-[#1F2F4A] hover:bg-[#2a3f63] text-white py-2 rounded-xl text-sm font-semibold transition-colors">
                      <Lock className="w-4 h-4" />
                      شراء
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
