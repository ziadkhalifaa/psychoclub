import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';

export default function ArticleView() {
  const { slug } = useParams();

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => fetch(`/api/articles/${slug}`).then(res => res.json())
  });

  if (isLoading) return <div className="p-24 text-center">جاري التحميل...</div>;
  if (!article) return <div className="p-24 text-center">لم يتم العثور على المقال</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link to="/articles" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#6FA65A] font-black text-[10px] uppercase tracking-widest transition-all group">
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          البوابة العلمية
        </Link>
      </motion.div>

      <article className="space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-[500px] md:h-[600px] rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white/5"
        >
          <img src={article.coverImage || `https://picsum.photos/seed/${article.slug}/1600/900`} alt={article.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F2F4A] via-[#1F2F4A]/40 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-10 md:p-20 text-white space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="px-4 py-1.5 bg-[#6FA65A] rounded-xl text-[10px] font-black uppercase tracking-widest inline-block shadow-lg shadow-emerald-500/20"
            >
              {article.category}
            </motion.div>

            <h1 className="text-4xl md:text-7xl font-black leading-[1.1] tracking-tighter max-w-4xl">{article.title}</h1>

            <div className="flex flex-wrap items-center gap-10 pt-4 border-t border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-0.5 overflow-hidden">
                  <img src={article.author.photo || article.author.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.author.user.name)}&background=random`} className="w-full h-full rounded-[0.9rem] object-cover" alt="" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">بقلم</p>
                  <span className="font-black text-sm">{article.author.user.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#6FA65A]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                  {new Date(article.publishedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-16">
          {article.excerpt && (
            <div className="text-2xl md:text-3xl text-[#1F2F4A] leading-snug font-black mb-16 relative p-10 bg-slate-50/50 rounded-[3rem] border border-slate-100">
              <span className="absolute -top-6 right-10 text-8xl text-[#6FA65A]/20 font-serif">"</span>
              {article.excerpt}
            </div>
          )}

          <div
            className="prose prose-2xl prose-slate max-w-none prose-headings:text-[#1F2F4A] prose-headings:font-black prose-headings:tracking-tighter prose-p:text-slate-600 prose-p:leading-[2] prose-p:font-medium prose-strong:text-[#1F2F4A] prose-strong:font-black prose-a:text-[#6FA65A] hover:prose-a:text-emerald-700 transition-colors prose-img:m-0 prose-img:inline-block prose-video:m-0 prose-video:inline-block prose-iframe:m-0 prose-iframe:inline-block"
            dangerouslySetInnerHTML={{ __html: article.contentRichText }}
          />

          {article.tags && (
            <div className="mt-20 pt-12 border-t border-slate-100 flex flex-wrap items-center gap-4">
              <Tag className="w-5 h-5 text-slate-400" />
              {JSON.parse(article.tags).map((tag: string) => (
                <span key={tag} className="bg-slate-50 text-slate-400 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:border-[#6FA65A] hover:text-[#6FA65A] transition-all cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Bio */}
          <section className="bg-gradient-to-br from-[#1F2F4A] to-[#2a3f63] rounded-[3.5rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,#6FA65A15_0%,transparent_50%)]" />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
              <div className="w-32 h-32 rounded-[2.5rem] bg-white/5 backdrop-blur-md p-1 border border-white/10 shrink-0 shadow-2xl group overflow-hidden">
                {article.author.photo || article.author.user.avatar ? (
                  <img src={article.author.photo || article.author.user.avatar} alt={article.author.user.name} className="w-full h-full object-cover rounded-[2rem] transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#6FA65A] font-black text-4xl">
                    {article.author.user.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="text-center md:text-right space-y-4">
                <div>
                  <p className="text-[10px] text-[#6FA65A] font-black uppercase tracking-[0.2em] mb-1 italic">كلمة الكاتب</p>
                  <h3 className="text-3xl font-black tracking-tighter">{article.author.user.name}</h3>
                  <p className="text-slate-400 font-bold text-sm tracking-wide">{article.author.title}</p>
                </div>
                <p className="text-slate-300 leading-relaxed text-lg font-medium opacity-80">{article.author.bio}</p>
              </div>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
