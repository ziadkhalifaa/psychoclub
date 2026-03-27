import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, FileText, ArrowLeft, ArrowRight, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { ArticleCardSkeleton } from '../components/Skeleton';

export default function Articles() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(t('articles.filters.all'));
  const [categories, setCategories] = useState<string[]>([t('articles.filters.all')]);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: () => fetch('/api/articles').then(res => res.ok ? res.json() : [])
  });

  useEffect(() => {
    fetch('/api/article-categories')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setCategories([t('articles.filters.all'), ...data.map((c: any) => c.name)]);
        }
      })
      .catch(() => setCategories([t('articles.filters.all')]));
  }, []);

  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    return articles.filter((article: any) => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === t('articles.filters.all') || article.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchTerm, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-[#1F2F4A] rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl mb-12"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#6FA65A]/20 via-transparent to-transparent mix-blend-overlay" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#6FA65A]/10 rounded-full blur-[100px]" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[#6FA65A] text-[10px] font-black uppercase tracking-widest">
            <FileText className="w-3 h-3" /> {t('articles.hero.badge')}
          </div>
          <h1 className="text-3xl md:text-6xl font-black mb-4 tracking-tighter">{t('articles.hero.title')}</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-lg font-medium leading-relaxed">
            {t('articles.hero.subtitle')}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Categories & Search */}
        <aside className="lg:col-span-1 space-y-8">
          <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/60 sticky top-32">
            <div className="mb-10">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">{t('articles.filters.search')}</h3>
              <div className="relative group">
                <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#6FA65A] transition-colors`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('articles.filters.placeholder')}
                  className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-[#6FA65A] transition-all text-xs font-bold`}
                />
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">{t('articles.filters.categories')}</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-between group ${cat === selectedCategory ? 'bg-[#1F2F4A] text-white shadow-lg' : 'text-[#1F2F4A]/70 hover:bg-slate-50'}`}
                  >
                    {cat}
                    <ChevronDown className={`w-3 h-3 ${isRTL ? '-rotate-90' : 'rotate-90'} transition-transform ${cat === selectedCategory ? 'text-[#6FA65A]' : 'opacity-0 group-hover:opacity-100'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Article Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Array.from({ length: 4 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-20 text-slate-500 font-bold">
              {isRTL ? 'لا توجد مقالات تطابق بحثك حالياً.' : 'No articles match your search currently.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredArticles.map((article: any, i: number) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                  key={article.id}
                  className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/40 border border-white/60 hover:border-[#6FA65A]/40 transition-all duration-500 group flex flex-col"
                >
                  <div className="relative h-64 overflow-hidden shrink-0">
                    <img src={article.coverImage || `https://picsum.photos/seed/${article.slug}/600/400`} alt={article.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1F2F4A]/80 to-transparent opacity-60" />
                    <div className={`absolute bottom-6 ${isRTL ? 'right-6' : 'left-6'} flex items-center gap-3`}>
                      <div className="w-10 h-10 rounded-full border-2 border-[#6FA65A] p-0.5 shadow-xl overflow-hidden">
                        <img src={article.author?.photo || article.author?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.author?.user?.name || 'Admin')}&background=random`} className="w-full h-full rounded-full object-cover" alt="" />
                      </div>
                      <span className="text-white text-[10px] font-black uppercase tracking-wider">{article.author?.user?.name || t('articles.card.author')}</span>
                    </div>
                  </div>
                  <div className="p-10 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="px-3 py-1 bg-[#6FA65A]/10 text-[#6FA65A] text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-[#6FA65A]/20">
                        {article.category}
                      </div>
                      {article.publishedAt && (
                        <span className="text-slate-400 text-[10px] font-bold">{new Date(article.publishedAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-[#1F2F4A] mb-4 leading-snug group-hover:text-[#6FA65A] transition-colors">
                      <Link to={`/articles/${article.slug}`}>{article.title}</Link>
                    </h3>
                    <p className="text-slate-500 text-sm font-medium leading-[1.8] mb-10 line-clamp-3">
                      {article.excerpt}
                    </p>

                    <Link to={`/articles/${article.slug}`} className="mt-auto inline-flex items-center gap-2 text-[#1F2F4A] hover:text-[#6FA65A] font-black text-sm transition-all group/link">
                      {t('articles.card.readMore')}
                      {isRTL ? <ArrowLeft className="w-4 h-4 group-hover/link:-translate-x-1 transition-transform" /> : <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />}
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
