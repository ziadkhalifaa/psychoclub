import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Package, FileText, Eye, ShoppingCart } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function Tools() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: () => fetch('/api/packages').then(res => res.ok ? res.json() : [])
  });

  const filtered = useMemo(() => {
    if (!packages) return [];
    if (!searchTerm.trim()) return packages;
    return packages.filter((p: any) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [packages, searchTerm]);

  if (isLoading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#6FA65A] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-[#1F2F4A] via-[#253756] to-[#1a2940] border border-white/10 shadow-2xl rounded-3xl p-12 text-center text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#6FA65A]/15 to-transparent mix-blend-overlay" />
        <div className="absolute top-0 left-0 w-40 h-40 bg-[#6FA65A]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-[#6FA65A]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 bg-[#6FA65A]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-[#6FA65A]/30"
        >
          <Package className="w-10 h-10 text-[#6FA65A]" />
        </motion.div>

        <h1 className="text-4xl font-bold mb-4 relative z-10">الحزم التعليمية</h1>
        <p className="text-slate-300 max-w-2xl mx-auto relative z-10 leading-relaxed">
          مجموعة من الحزم التعليمية المتخصصة تحتوي على أدوات ومقاييس وأوراق عمل مصممة للممارسين في مجال الصحة النفسية.
          استعرض المحتوى مجاناً وقم بتحميل الحزمة كاملة عند الحاجة.
        </p>
      </motion.div>

      {/* Search & Count Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50"
      >
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="ابحث في الحزم..."
            className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6FA65A]/50 focus:border-[#6FA65A] transition-all"
          />
        </div>
        <div className="text-sm font-medium text-slate-500 bg-slate-100/80 px-4 py-2 rounded-xl shrink-0">
          عرض {filtered.length} حزمة
        </div>
      </motion.div>

      {/* Packages Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-xl font-bold">لا توجد حزم متاحة حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map((pkg: any, i: number) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 + (i * 0.08) }}
              whileHover={{ y: -6 }}
              key={pkg.id}
              className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 flex flex-col hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              {/* Cover Image */}
              <div className="h-48 bg-gradient-to-br from-[#1F2F4A] to-[#2a4068] relative overflow-hidden">
                {pkg.coverImage ? (
                  <img
                    src={pkg.coverImage}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-white/20" />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-[#1F2F4A] flex items-center gap-1.5 shadow-lg">
                  <FileText className="w-3.5 h-3.5 text-[#6FA65A]" />
                  {pkg.fileCount} ملف
                </div>
                {pkg.price > 0 && (
                  <div className="absolute top-4 right-4 bg-[#6FA65A] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    {pkg.price} ج.م
                  </div>
                )}
                {pkg.price === 0 && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    مجاني
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-[#1F2F4A] mb-2 line-clamp-2 group-hover:text-[#6FA65A] transition-colors">
                  {pkg.title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">{pkg.description}</p>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <Link
                    to={`/tools/${pkg.id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#1F2F4A] hover:bg-[#2a3f63] text-white py-3 rounded-xl text-sm font-bold transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    استعراض الحزمة
                  </Link>
                  {pkg.price > 0 && (
                    <Link
                      to={`/tools/${pkg.id}`}
                      className="flex items-center justify-center gap-2 bg-[#6FA65A] hover:bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-bold transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
