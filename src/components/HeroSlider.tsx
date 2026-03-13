import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

const SLIDES = [
    {
        id: 1,
        title: 'جلسات دعم وعلاج نفسي',
        description: 'احصل على دعم نفسي متخصص من نخبة الأخصائيين والمعالجين للتعامل مع مختلف التحديات النفسية في بيئة آمنة وخصوصية تامة.',
        image: '/images/therapy_session_new.png',
        ctaPrimary: 'احجز الآن',
        ctaSecondary: 'تعرف علينا',
        linkPrimary: '/sessions',
        linkSecondary: '/about',
        tag: 'دعم مهني مستمر'
    },
    {
        id: 2,
        title: 'ارتقِ بمهاراتك الإكلينيكية',
        description: 'Psycho-Club هو المنصة التعليمية والتدريبية الرائدة لتطوير مهارات الممارسين في مجال الصحة النفسية من خلال دورات متخصصة وأدوات تفاعلية.',
        image: '/images/hero1.png',
        ctaPrimary: 'استكشف الدورات',
        ctaSecondary: 'احجز جلستك الآن',
        linkPrimary: '/courses',
        linkSecondary: '/sessions',
        tag: 'المنصة التعليمية الرائدة'
    },
    {
        id: 3,
        title: 'أدوات ومقاييس تفاعلية',
        description: 'نوفر لك مجموعة متكاملة من الأدوات الإكلينيكية والمقاييس النفسية المعتمدة لدعم عملية التقييم والتشخيص بدقة.',
        image: '/images/hero3.png',
        ctaPrimary: 'استعرض الأدوات',
        ctaSecondary: 'المكتبة العلمية',
        linkPrimary: '/tools',
        linkSecondary: '/articles',
        tag: 'ابتكار في الممارسة'
    },
    {
        id: 4,
        title: 'الإشراف الإكلينيكي المتخصص',
        description: 'احجز جلسة إشراف مهني متخصصة مع مصطفى صالح لتطوير ممارستك الإكلينيكية والحصول على التوجيه المهني اللازم.',
        image: '/images/clinical_supervision.png',
        ctaPrimary: 'احجز جلسة إشراف',
        ctaSecondary: 'عن الخدمة',
        linkPrimary: '/sessions/2880b57d-b858-480d-b32d-c5303cbff1e6',
        linkSecondary: '/about',
        tag: 'تطوير مهني متخصص'
    }
];

export function HeroSlider() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % SLIDES.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrent((prev) => (prev + 1) % SLIDES.length);
    const prevSlide = () => setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));

    return (
        <section className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden bg-slate-900">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 w-full h-full"
                >
                    {/* Background Image with Overlay */}
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] scale-110 motion-safe:animate-[zoom_20s_infinite_alternate]"
                        style={{ backgroundImage: `url(${SLIDES[current].image})` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1F2F4A] via-[#1F2F4A]/80 to-transparent md:bg-gradient-to-r md:from-[#1F2F4A]/95 md:via-[#1F2F4A]/80 md:to-transparent rtl:md:bg-gradient-to-l" />
                    </div>

                    {/* Content Wrapper */}
                    <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                        <div className="max-w-2xl w-full space-y-4 md:space-y-8 mt-12 md:mt-0">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] md:text-sm font-medium"
                            >
                                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-[#6FA65A]" />
                                {SLIDES[current].tag}
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="text-3xl md:text-6xl font-bold text-white leading-tight rtl:text-right"
                            >
                                {SLIDES[current].title.split(' ').map((word, i) =>
                                    word.includes('الإكلينيكية') || word.includes('متخصص') || word.includes('تفاعلية') ? (
                                        <span key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-[#6FA65A] to-emerald-400"> {word} </span>
                                    ) : <span key={i}> {word} </span>
                                )}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                                className="text-base md:text-xl text-slate-200 leading-relaxed rtl:text-right max-w-lg"
                            >
                                {SLIDES[current].description}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9, duration: 0.8 }}
                                className="flex flex-col sm:flex-row gap-3 pt-2 md:pt-4"
                            >
                                <Link
                                    to={SLIDES[current].linkPrimary}
                                    className="bg-[#6FA65A] hover:bg-emerald-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 text-sm md:text-base"
                                >
                                    {SLIDES[current].ctaPrimary}
                                    <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 rtl:rotate-180" />
                                </Link>
                                <Link
                                    to={SLIDES[current].linkSecondary}
                                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                                >
                                    {SLIDES[current].ctaSecondary}
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 z-20">
                <button
                    onClick={prevSlide}
                    className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all group"
                >
                    <ChevronRight className="w-6 h-6 group-hover:scale-110 rtl:hidden" />
                    <ChevronLeft className="w-6 h-6 group-hover:scale-110 hidden rtl:block" />
                </button>

                <div className="flex gap-3">
                    {SLIDES.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`h-1.5 transition-all duration-500 rounded-full ${current === i ? 'w-8 bg-[#6FA65A]' : 'w-2 bg-white/30 hover:bg-white/50'
                                }`}
                        />
                    ))}
                </div>

                <button
                    onClick={nextSlide}
                    className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all group"
                >
                    <ChevronLeft className="w-6 h-6 group-hover:scale-110 rtl:hidden" />
                    <ChevronRight className="w-6 h-6 group-hover:scale-110 hidden rtl:block" />
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
      `}} />
        </section>
    );
}
