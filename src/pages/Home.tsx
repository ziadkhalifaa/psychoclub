import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, Clock, Users, FileText, Calendar, Sparkles, Fingerprint, Activity, Layers, PlayCircle, Star, CheckCircle, ChevronDown, PenTool } from 'lucide-react';
import { HeroSlider } from '../components/HeroSlider';

export default function Home() {
  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => fetch('/api/courses').then(res => res.json())
  });

  const { data: articles } = useQuery({
    queryKey: ['articles'],
    queryFn: () => fetch('/api/articles').then(res => res.json())
  });

  return (
    <div className="space-y-24 relative z-10">
      {/* Hero Slider Section */}
      <HeroSlider />



      {/* About Section */}
      <section className="bg-slate-50 dark:bg-slate-900/40 py-16 md:py-24 relative overflow-hidden transition-colors duration-500">
        <div className="absolute inset-0 bg-[#6FA65A]/5 dark:bg-[url('https://picsum.photos/seed/brain/1920/1080')] dark:bg-cover dark:bg-center dark:mix-blend-overlay dark:opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h2 className="text-3xl md:text-5xl font-black text-[#1F2F4A] dark:text-white tracking-tighter mb-6 uppercase">عن Clinical Cases Group <span className="text-[#6FA65A] block md:inline text-2xl md:text-3xl font-black">| Psycho-Club</span></h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg font-medium">
                نحن في Clinical Cases Group | Psycho-Club، نؤمن بأن الصحة النفسية هي رحلة مستمرة من التعلم والدعم. نسعى لتقديم خدمات تخصصية تجمع بين التدريب المتقدم، الإرشاد المهني، والجلسات العلاجية المبنية على أحدث الأسس العلمية، لنكون شريكك الدائم في مسار التميز والاستقرار النفسي.
              </p>
              <ul className="space-y-4">
                {['تدريب عملي مبني على الأدلة', 'دعم وعلاج نفسي متخصص', 'أدوات ومقاييس نفسية معتمدة', 'مجتمع مهني داعم'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-bold">
                    <div className="w-6 h-6 rounded-full bg-[#6FA65A]/10 dark:bg-[#6FA65A]/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#6FA65A]" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/about" className="inline-block mt-8 text-[#6FA65A] font-semibold hover:text-emerald-400 transition-colors flex items-center gap-2">
                اقرأ المزيد عنا
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              <img src="/images/therapy_session.png" alt="Therapy Session" className="rounded-[2.5rem] object-cover h-64 md:h-80 w-full shadow-2xl border-4 border-white dark:border-slate-800" referrerPolicy="no-referrer" />
              <img src="/images/clinical_training.png" alt="Clinical Training" className="rounded-[2.5rem] object-cover h-64 md:h-80 w-full mt-12 shadow-2xl border-4 border-white dark:border-slate-800" referrerPolicy="no-referrer" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6FA65A]/5 rounded-full blur-3xl -z-10" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-6"
        >
          <div className="text-center md:text-right">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4 border border-emerald-100 dark:border-emerald-900 shadow-sm">
              <Sparkles className="w-3 h-3" /> التميز الإكلينيكي
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#1F2F4A] dark:text-white tracking-tighter mb-4">آفاق التعلم والعلاج</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl text-lg font-medium leading-relaxed">بوابتك المتكاملة للبروتوكولات العلاجية المبتكرة والتدريب الإكلينيكي العميق.</p>
          </div>
          <Link to="/courses" className="group flex items-center gap-3 bg-[#1F2F4A] dark:bg-[#6FA65A] hover:bg-[#6FA65A] dark:hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-[#1F2F4A]/10 active:scale-95">
            تصفح الأكاديمية
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {courses?.slice(0, 3).map((course: any, i: number) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ y: -15 }}
              className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-500/5 border border-white/60 dark:border-slate-800/60 group flex flex-col h-full hover:border-[#6FA65A]/30 transition-all duration-500"
            >
              <div className="relative h-48 md:h-60 overflow-hidden">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F2F4A]/80 dark:from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-4 md:top-6 right-4 md:right-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-3 md:px-4 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black text-[#1F2F4A] dark:text-white shadow-lg uppercase tracking-widest border border-white dark:border-slate-700">
                  {course.category}
                </div>
                <div className="absolute bottom-6 right-6 left-6 translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                  <Link to={`/courses/${course.slug}`} className="w-full py-2.5 md:py-3 bg-white dark:bg-slate-800 text-[#1F2F4A] dark:text-white rounded-xl font-black text-center text-xs md:text-sm shadow-xl inline-block">تفاصيل الدورة</Link>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-[0.1em]">
                  <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700">{course.level}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {course.duration}</span>
                </div>
                <h3 className="text-2xl font-black text-[#1F2F4A] dark:text-white mb-4 leading-snug group-hover:text-[#6FA65A] transition-colors line-clamp-2">
                  <Link to={`/courses/${course.slug}`}>{course.title}</Link>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8 line-clamp-2">{course.description}</p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-black text-[#1F2F4A] dark:text-white shadow-sm overflow-hidden">
                      {course.instructor.photo || course.instructor.user.avatar ? (
                        <img src={course.instructor.photo || course.instructor.user.avatar} alt={course.instructor.user.name} className="w-full h-full object-cover" />
                      ) : (
                        course.instructor.user.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-tighter">المحاضر</p>
                      <span className="text-sm font-extrabold text-[#1F2F4A] dark:text-slate-300">{course.instructor.user.name}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    {course.discount ? (
                      <div>
                        <span className="text-xs text-slate-400 dark:text-slate-500 line-through block font-bold mb-0.5">{course.price} ج.م</span>
                        <span className="text-2xl font-black text-[#6FA65A] tracking-tighter">{course.discount} <span className="text-[10px]">ج.م</span></span>
                      </div>
                    ) : (
                      <span className="text-2xl font-black text-[#6FA65A] tracking-tighter">{course.price} <span className="text-[10px]">ج.م</span></span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section - Visual Overhaul */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[#1F2F4A]/80 dark:bg-slate-900/80 backdrop-blur-md" />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,#6FA65A08_0%,transparent_50%)]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#6FA65A]/5 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative z-10 grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <motion.img whileHover={{ scale: 1.05 }} src="https://picsum.photos/seed/psy1/500/600" className="rounded-[3rem] shadow-2xl border-4 border-white/5 w-full h-72 object-cover" />
                  <div className="bg-[#6FA65A] p-8 rounded-[3rem] text-white shadow-xl shadow-emerald-500/20">
                    <h4 className="text-4xl font-black mb-2">+1500</h4>
                    <p className="text-sm font-bold opacity-80 uppercase tracking-widest">خريج متدرب</p>
                  </div>
                </div>
                <div className="space-y-6 pt-12">
                  <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 text-white">
                    <Activity className="w-10 h-10 text-[#6FA65A] mb-4" />
                    <h4 className="text-xl font-bold mb-2">منهجية إكلينيكية</h4>
                    <p className="text-xs text-slate-400 font-medium">نركز على التطبيق العملي للنماذج العلاجية الحديثة.</p>
                  </div>
                  <motion.img whileHover={{ scale: 1.05 }} src="https://picsum.photos/seed/psy2/500/600" className="rounded-[3rem] shadow-2xl border-4 border-white/5 w-full h-72 object-cover" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="space-y-10 order-1 lg:order-2"
            >
              <div>
                <div className="inline-block px-5 py-2 rounded-2xl bg-white/5 border border-white/10 text-[#6FA65A] text-xs font-black uppercase tracking-[0.3em] mb-6">رؤيتنا المهنية</div>
                <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">الريادة مع <span className="text-[#6FA65A]">Psycho-Club</span> <br />في الإرشاد والعلاج</h2>
              </div>

              <p className="text-slate-400 leading-[2.2] text-lg font-medium">
                في **Clinical Cases Group | Psycho-Club**، ندرك أن المختص النفسي يحتاج لمزيج من المعرفة والإرشاد المستمر. نحن لسنا مجرد منصة تعليمية، بل نحن مظلة مهنية وعلاجية ترافقك في كل خطوة، من التدريب الأساسي وحتى الإشراف الإكلينيكي المتقدم.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: 'جلسات علاجية', desc: 'دعم نفسي وعلاج متخصص للأفرد' },
                  { title: 'مواد حصرية', desc: 'مكتبة من المقاييس والأدوات المعتمدة' },
                  { title: 'شهادات مهنية', desc: 'اعتماد مهني يعزز مسارك الوظيفي' },
                  { title: 'دعم تقني', desc: 'مساعدة مستمرة طوال فترة التعلم' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <div className="w-12 h-12 rounded-2xl bg-[#6FA65A]/10 border border-[#6FA65A]/20 flex items-center justify-center shrink-0 group-hover:bg-[#6FA65A] transition-all">
                      <CheckCircle className="w-6 h-6 text-[#6FA65A] group-hover:text-white" />
                    </div>
                    <div>
                      <h5 className="text-white font-bold text-sm mb-1">{item.title}</h5>
                      <p className="text-slate-500 text-xs font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <Link to="/about" className="inline-flex items-center gap-3 text-white bg-white/5 hover:bg-[#6FA65A] px-10 py-5 rounded-[2rem] font-black border border-white/10 transition-all shadow-xl active:scale-95 group">
                  تعرف على الفريق
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-20 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center"
        >
          <div className="flex-1 space-y-8">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-[#1F2F4A] dark:text-white tracking-tighter mb-4 leading-tight">المعرفة الإرشادية <br /> <span className="text-[#6FA65A]">والعلاجية الحديثة</span></h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">كن دائماً في طليعة العلم من خلال مقالاتنا الدورية المترجمة والأصلية في مختلف المدارس العلاجية.</p>
            </div>
            <div className="space-y-4">
              {articles?.slice(0, 3).map((article: any, i: number) => (
                <Link key={article.id} to={`/articles/${article.slug}`} className="group flex items-center gap-6 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-lg group-hover:rotate-6 transition-transform">
                    <img src={article.coverImage || `https://picsum.photos/seed/${article.slug}/200/200`} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-[#6FA65A] uppercase tracking-widest mb-1">{article.category}</p>
                    <h4 className="text-lg font-extrabold text-[#1F2F4A] dark:text-white group-hover:text-[#6FA65A] transition-colors line-clamp-1">{article.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-5 h-5 rounded-full overflow-hidden border border-[#6FA65A]/30">
                        <img src={article.author?.photo || article.author?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.author?.user?.name || 'A')}&background=random`} className="w-full h-full object-cover" alt="" />
                      </div>
                      <p className="text-slate-400 dark:text-slate-500 text-[10px] font-medium uppercase tracking-tighter">
                        {article.author?.user?.name || 'الإدارة'} • {new Date(article.publishedAt).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-6 h-6 text-slate-200 dark:text-slate-700 -rotate-90 group-hover:text-[#6FA65A] transition-colors" />
                </Link>
              ))}
            </div>
            <Link to="/articles" className="inline-flex items-center gap-3 bg-slate-900 dark:bg-[#6FA65A] text-white px-8 py-4 rounded-2xl font-black hover:bg-[#6FA65A] dark:hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
              تصفح جميع المقالات
              <PenTool className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative">
              <div className="absolute -inset-4 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-[2.5rem] md:rounded-[4rem] blur-2xl -z-10" />
              <img src="https://picsum.photos/seed/science/800/1000" className="w-full h-[350px] md:h-[600px] object-cover rounded-[2rem] md:rounded-[3rem] shadow-2xl border-4 border-white dark:border-slate-800" alt="Scientific Research" />
              <div className="absolute -bottom-6 md:-bottom-10 -right-4 md:-right-10 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-slate-50 dark:border-slate-700 max-w-[240px] md:max-w-[280px]">
                <div className="flex gap-4 items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xl">٤.٩</div>
                  <p className="text-xs font-black text-[#1F2F4A] dark:text-white">تقييم المحتوى العلمي من رواد المنصة</p>
                </div>
                <div className="flex -space-x-3 space-x-reverse">
                  {[1, 2, 3, 4].map(n => <div key={n} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 overflow-hidden"><img src={`https://i.pravatar.cc/100?u=${n}`} alt="" /></div>)}
                  <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 bg-[#1F2F4A] dark:bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold opacity-80">+٥٠</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
