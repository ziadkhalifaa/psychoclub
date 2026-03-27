import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Filter, BookOpen, Clock, User, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { CourseCardSkeleton } from '../components/Skeleton';

export default function Courses() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => fetch('/api/courses').then(res => res.json())
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

  const categoryOptions = [
    { value: 'العلاج النفسي', label: t('courses.categories.therapy') },
    { value: 'علاج الإدمان', label: t('courses.categories.addiction') },
    { value: 'الطب النفسي', label: t('courses.categories.psychiatry') },
    { value: 'علم النفس الإكلينيكي', label: t('courses.categories.clinical') }
  ];

  const levelOptions = [
    { value: 'مبتدئ', label: t('courses.levels.beginner') },
    { value: 'متوسط', label: t('courses.levels.intermediate') },
    { value: 'متقدم', label: t('courses.levels.advanced') }
  ];

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    return courses.filter((course: any) => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(course.category);
      const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(course.level);

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courses, searchTerm, selectedCategories, selectedLevels]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const toggleLevel = (level: string) => {
    setSelectedLevels(prev => prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]);
  };

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
            <Sparkles className="w-3 h-3" /> {t('courses.hero.badge')}
          </div>
          <h1 className="text-3xl md:text-6xl font-black mb-4 tracking-tighter">{t('courses.hero.title')}</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-lg font-medium leading-relaxed">
            {t('courses.hero.subtitle')}
          </p>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full lg:w-80 shrink-0 space-y-8"
        >
          <div className="bg-white/40 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/60 sticky top-32">
            <h3 className="font-black text-[#1F2F4A] text-xl mb-8 flex items-center gap-3">
              <Filter className="w-5 h-5 text-[#6FA65A]" />
              {t('courses.filters.title')}
            </h3>

            <div className="space-y-10">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">{t('courses.filters.categories')}</h4>
                <div className="space-y-4">
                  {categoryOptions.map(cat => (
                    <label key={cat.value} className="flex items-center gap-3 text-sm font-bold text-[#1F2F4A]/70 cursor-pointer hover:text-[#1F2F4A] transition-colors group">
                      <div className="relative w-5 h-5 rounded-lg border-2 border-slate-200 group-hover:border-[#6FA65A] transition-all">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.value)}
                          onChange={() => toggleCategory(cat.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer peer"
                        />
                        <div className="absolute inset-1 rounded bg-[#6FA65A] scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      {cat.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">{t('courses.filters.levels')}</h4>
                <div className="space-y-4">
                  {levelOptions.map(level => (
                    <label key={level.value} className="flex items-center gap-3 text-sm font-bold text-[#1F2F4A]/70 cursor-pointer hover:text-[#1F2F4A] transition-colors group">
                      <div className="relative w-5 h-5 rounded-lg border-2 border-slate-200 group-hover:border-[#6FA65A] transition-all">
                        <input
                          type="checkbox"
                          checked={selectedLevels.includes(level.value)}
                          onChange={() => toggleLevel(level.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer peer"
                        />
                        <div className="absolute inset-1 rounded bg-[#6FA65A] scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      {level.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Course Grid */}
        <div className="flex-1 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-between items-center bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl border border-white/60 gap-4"
          >
            <div className="relative w-full max-w-md group">
              <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#6FA65A] transition-colors`} />
              <input
                type="text"
                placeholder={t('courses.filters.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${isRTL ? 'pl-6 pr-12' : 'pr-6 pl-12'} py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#6FA65A]/10 focus:border-[#6FA65A] transition-all font-bold text-sm`}
              />
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 border border-slate-200 px-6 py-2 rounded-xl">
              {t('courses.filters.total', { count: filteredCourses.length })}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)
            ) : filteredCourses.length === 0 ? (
              <div className="col-span-full py-24 text-center">
                <div className="w-24 h-24 rounded-[2rem] bg-slate-100 flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <Search className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-[#1F2F4A]">{t('courses.filters.noResults')}</h3>
                <p className="text-slate-400 text-sm mt-2">{isRTL ? 'حاول تغيير خيارات التصفية أو مصطلح البحث' : 'Try changing filter options or search term'}</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategories([]);
                    setSelectedLevels([]);
                  }}
                  className="mt-6 text-[#6FA65A] font-bold text-sm hover:underline"
                >
                  {t('courses.filters.reset')}
                </button>
              </div>
            ) : (
              filteredCourses.map((course: any, i: number) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + (i * 0.1) }}
                  whileHover={{ y: -12 }}
                  key={course.id}
                  className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-300/20 border border-white/60 hover:border-[#6FA65A]/30 transition-all duration-500 group flex flex-col h-full"
                >
                  <div className="relative h-56 overflow-hidden shrink-0">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1F2F4A]/60 to-transparent" />
                    <div className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'} bg-white/95 px-3 py-1 rounded-xl text-[10px] font-black text-[#1F2F4A] uppercase tracking-widest shadow-md border border-white`}>
                      {categoryOptions.find(c => c.value === course.category)?.label || course.category}
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 mb-5 uppercase tracking-[0.1em]">
                      <span className="flex items-center gap-1.5 bg-slate-100 py-1.5 px-3 rounded-lg border border-slate-200">
                        <BookOpen className="w-3.5 h-3.5" /> 
                        {levelOptions.find(l => l.value === course.level)?.label || course.level}
                      </span>
                      <span className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-100 bg-white/50"><Clock className="w-3.5 h-3.5" /> {course.duration}</span>
                    </div>
                    <h3 className="text-2xl font-black text-[#1F2F4A] mb-4 leading-snug group-hover:text-[#6FA65A] transition-colors line-clamp-2">
                      <Link to={`/courses/${course.slug}`}>{course.title}</Link>
                    </h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 line-clamp-3 italic">"{course.description}"</p>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#1F2F4A]/5 flex items-center justify-center text-xs font-black text-[#1F2F4A] border border-[#1F2F4A]/10 shadow-sm overflow-hidden">
                          {course.instructor.photo || course.instructor.user.avatar ? (
                            <img src={course.instructor.photo || course.instructor.user.avatar} className="w-full h-full object-cover" alt="" />
                          ) : (
                            course.instructor.user.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t('courses.card.instructor')}</p>
                          <span className="text-xs font-black text-[#1F2F4A]">{course.instructor.user.name}</span>
                        </div>
                      </div>
                      <div className="text-left">
                        {course.discount ? (
                          <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
                            <span className="text-[10px] text-slate-400 line-through font-bold">{course.price} {t('courses.card.currency')}</span>
                            <span className="text-2xl font-black text-[#6FA65A] tracking-tighter">{course.discount} <span className="text-[10px]">{t('courses.card.currency')}</span></span>
                          </div>
                        ) : (
                          <span className="text-2xl font-black text-[#6FA65A] tracking-tighter">{course.price} <span className="text-[10px]">{t('courses.card.currency')}</span></span>
                        )}
                      </div>
                    </div>
                    <Link to={`/courses/${course.slug}`} className="mt-8 w-full py-4 bg-[#1F2F4A] hover:bg-[#6FA65A] text-white text-center rounded-2xl font-black transition-all shadow-xl shadow-[#1F2F4A]/10 active:scale-95">{t('courses.card.view')}</Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
