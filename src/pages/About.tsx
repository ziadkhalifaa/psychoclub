import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Brain, Target, Users, Award, Heart, Sparkles, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Controller } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

const specialists = [
    { src: '/images/specialists/specialist1.png', name: 'أ.مصطفى صالح' },
    { src: '/images/specialists/specialist2.png', name: 'أ.احمد عبد العظيم' },
    { src: '/images/specialists/specialist3.png', name: 'أ.مالك وليد' },
    { src: '/images/specialists/specialist4.png', name: 'أ.مصطفى احمد' },
    { src: '/images/specialists/specialist5.png', name: 'أ.بدير محمد' },
    { src: '/images/specialists/specialist6.png', name: 'أ.صفية سويلم' },
    { src: '/images/specialists/specialist7.png', name: 'أ.سماح احمد' },
    { src: '/images/specialists/specialist8.png', name: 'أ.مريم السيد' },
    { src: '/images/specialists/specialist9.png', name: 'أ.حنان بلال' },
    { src: '/images/specialists/specialist10.png', name: 'أ.بسمة شعبان' },
    { src: '/images/specialists/specialist11.png', name: 'أ.شروق فتوح' },
    { src: '/images/specialists/specialist12.png', name: 'أ.سها خيري' },
    { src: '/images/specialists/specialist13.png', name: 'أ.شيرين همام' },
    { src: '/images/specialists/specialist14.png', name: 'أ.رانيا محمد' },
    { src: '/images/specialists/specialist15.png', name: 'أ.سماء عثمان' },
    { src: '/images/specialists/specialist16.png', name: 'أ.سمر احمد' },
    { src: '/images/specialists/specialist17.png', name: 'أ.عمرو ناجح' },
];

const stats = [
    { label: 'خريج متدرب', value: '+3000', icon: Users },
    { label: 'دورة تدريبية', value: '+100', icon: Brain },
    { label: 'سنة خبرة', value: '+5', icon: Award },
    { label: 'محاضر خبير', value: '+15', icon: Sparkles },
];

const values = [
    {
        title: 'الأمانة العلمية',
        description: 'نلتزم بتقديم محتوى علمي رصين ومبني على أحدث الأدلة والبراهين في مجال الصحة النفسية.',
        icon: Heart,
    },
    {
        title: 'التطبيق العملي',
        description: 'تركيزنا الأساسي هو سد الفجوة بين النظرية والممارسة لتمكين المعالج من أدواته.',
        icon: Target,
    },
    {
        title: 'المجتمع المهني',
        description: 'نسعى لبناء بيئة داعمة تجمع المختصين لتبادل الخبرات والنمو المشترك.',
        icon: Users,
    },
];

export default function About() {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const { user } = useAuth();
    const [firstSwiper, setFirstSwiper] = useState<SwiperType | null>(null);
    const [secondSwiper, setSecondSwiper] = useState<SwiperType | null>(null);

    const specialistNames: Record<string, string> = {
        'أ.مصطفى صالح': 'Mustafa Saleh',
        'أ.احمد عبد العظيم': 'Ahmed Abdel-Azim',
        'أ.مالك وليد': 'Malek Walid',
        'أ.مصطفى احمد': 'Mustafa Ahmed',
        'أ.بدير محمد': 'Bedir Mohamed',
        'أ.صفية سويلم': 'Safia Sweilem',
        'أ.سماح احمد': 'Samah Ahmed',
        'أ.مريم السيد': 'Mariam El-Sayed',
        'أ.حنان بلال': 'Hanan Belal',
        'أ.بسمة شعبان': 'Basma Shaaban',
        'أ.شروق فتوح': 'Shorouk Fattouh',
        'أ.سها خيري': 'Soha Khairy',
        'أ.شيرين همام': 'Shereen Hammam',
        'أ.رانيا محمد': 'Rania Mohamed',
        'أ.سماء عثمان': 'Samaa Osman',
        'أ.سمر احمد': 'Samar Ahmed',
        'أ.عمرو ناجح': 'Amr Nagah'
    };

    const stats = [
        { label: t('about.stats.graduates'), value: '+3000', icon: Users },
        { label: t('about.stats.courses'), value: '+100', icon: Brain },
        { label: t('about.stats.experience'), value: '+5', icon: Award },
        { label: t('about.stats.lecturers'), value: '+15', icon: Sparkles },
    ];

    const values = [
        {
            title: t('about.values.scientific.title'),
            description: t('about.values.scientific.desc'),
            icon: Heart,
        },
        {
            title: t('about.values.practical.title'),
            description: t('about.values.practical.desc'),
            icon: Target,
        },
        {
            title: t('about.values.community.title'),
            description: t('about.values.community.desc'),
            icon: Users,
        },
    ];

    return (
        <div className="pt-20 lg:pt-32 pb-24 overflow-hidden">
            {/* Hero Section */}
            <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
                <div className="absolute top-0 right-0 -z-10 w-72 h-72 bg-[#6FA65A]/10 rounded-full blur-3xl opacity-50" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-100 dark:border-emerald-900">
                            <Sparkles className="w-3 h-3" /> {t('about.hero.badge')}
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-black text-[#1F2F4A] dark:text-white mb-8 leading-[1.1] tracking-tighter">
                            {t('about.hero.title')}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg lg:text-xl leading-relaxed font-medium mb-10 max-w-xl">
                            {t('about.hero.description')}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="relative"
                    >
                        <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800 bg-white dark:bg-slate-900 aspect-[4/5]">
                            <Swiper
                                modules={[Autoplay, EffectFade, Pagination, Controller]}
                                onSwiper={setFirstSwiper}
                                controller={{ control: secondSwiper }}
                                effect="fade"
                                fadeEffect={{ crossFade: true }}
                                autoplay={{
                                    delay: 3500,
                                    disableOnInteraction: false,
                                }}
                                pagination={{
                                    clickable: true,
                                }}
                                loop={true}
                                className="w-full h-full"
                            >
                                {specialists.map((item, index) => (
                                    <SwiperSlide key={index}>
                                        <div className="w-full h-full flex items-center justify-center bg-white dark:bg-slate-900">
                                            <img
                                                src={item.src}
                                                alt={item.name}
                                                className="w-full h-full object-contain"
                                                loading="lazy"
                                            />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        {/* Text Slider */}
                        <div className="mt-8 relative z-20">
                            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-8 shadow-xl max-w-[280px] mx-auto text-center transform hover:scale-105 transition-transform duration-300">
                                <Swiper
                                    modules={[Autoplay, Controller]}
                                    onSwiper={setSecondSwiper}
                                    controller={{ control: firstSwiper }}
                                    slidesPerView={1}
                                    loop={true}
                                    className="h-8"
                                >
                                    {specialists.map((item, index) => (
                                        <SwiperSlide key={index} className="flex items-center justify-center">
                                            <span className="text-xl font-black text-[#1F2F4A] dark:text-white tracking-tight">
                                                {isRTL ? item.name : (specialistNames[item.name] || item.name)}
                                            </span>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                                <div className="h-1 w-12 bg-[#6FA65A] mx-auto mt-2 rounded-full opacity-50" />
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#1F2F4A] rounded-full -z-10 animate-pulse" />
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#6FA65A]/20 rounded-full -z-10 blur-2xl" />
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-[#1F2F4A] py-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,#6FA65A_0%,transparent_50%)]" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-white text-3xl md:text-4xl font-black">{t('about.stats.title')}</h2>
                        <p className="text-slate-400 mt-4 font-bold">{t('about.stats.subtitle')}</p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center"
                            >
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                                    <stat.icon className="w-8 h-8 text-[#6FA65A]" />
                                </div>
                                <h3 className="text-4xl font-black text-white mb-2">{stat.value}</h3>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="py-32 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {values.map((value, i) => (
                            <motion.div
                                key={value.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 hover:border-[#6FA65A]/30 transition-all group"
                            >
                                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#6FA65A] transition-colors">
                                    <value.icon className="w-6 h-6 text-[#1F2F4A] dark:text-white group-hover:text-white" />
                                </div>
                                <h3 className="text-2xl font-black text-[#1F2F4A] dark:text-white mb-4">{value.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Founder Section */}
            <section className="py-24 bg-white dark:bg-transparent transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 lg:p-24 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center border border-transparent dark:border-slate-800">
                        <div className="w-48 h-48 lg:w-96 lg:h-96 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl shrink-0">
                            <img
                                src="/images/specialists/admin.png"
                                alt="Founder"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <h2 className="text-3xl lg:text-5xl font-black text-[#1F2F4A] dark:text-white mb-6 tracking-tighter">{t('about.founder.title')}</h2>
                            <p className="text-slate-600 dark:text-slate-400 text-lg lg:text-xl leading-loose italic mb-10">
                                {t('about.founder.message')}
                            </p>
                            <div>
                                <h4 className="text-xl font-black text-[#1F2F4A] dark:text-white">{t('about.founder.name')}</h4>
                                <p className="text-[#6FA65A] font-bold uppercase tracking-widest text-xs mt-1">{t('about.founder.role')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="space-y-10"
                    >
                        <h2 className="text-4xl lg:text-6xl font-black text-[#1F2F4A] dark:text-white tracking-tighter">
                            {user ? t('common.loading').slice(0, 0) + (isRTL ? 'مستمرون معك في رحلة التعلم' : 'Continuing your learning journey') : t('about.cta.title')}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xl font-medium">
                            {user
                                ? (isRTL ? 'استكشف أحدث الدورات والمقالات المتاحة لتطوير مهاراتك بشكل إحترافي.' : 'Explore the latest courses and articles to professionally develop your skills.')
                                : t('about.cta.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            {user ? (
                                <a href="/courses" className="w-full sm:w-auto px-10 py-5 bg-[#1F2F4A] dark:bg-[#6FA65A] text-white rounded-[2rem] font-black text-lg hover:opacity-90 transition-all shadow-xl shadow-[#1F2F4A]/10 active:scale-95 flex items-center justify-center gap-3 group">
                                    {t('about.cta.courses')}
                                    {isRTL ? <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                </a>
                            ) : (
                                <a href="/register" className="w-full sm:w-auto px-10 py-5 bg-[#1F2F4A] dark:bg-[#6FA65A] text-white rounded-[2rem] font-black text-lg hover:opacity-90 transition-all shadow-xl shadow-[#1F2F4A]/10 active:scale-95 flex items-center justify-center gap-3 group">
                                    {t('about.cta.register')}
                                    {isRTL ? <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                </a>
                            )}
                            <a href={user ? "/community" : "/courses"} className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-800 text-[#1F2F4A] dark:text-white border border-slate-200 dark:border-slate-700 rounded-[2rem] font-black text-lg hover:border-[#6FA65A] transition-all flex items-center justify-center">
                                {user ? (isRTL ? "المجتمع المهني" : "Professional Community") : t('about.cta.courses')}
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
