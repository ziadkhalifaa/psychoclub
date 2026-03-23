import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

const SLIDE_IMAGES = [
    '/images/therapy_session_new.png',
    '/images/hero1.png',
    '/images/hero3.png',
    '/images/clinical_supervision.png'
];

const SLIDE_LINKS = [
    { primary: '/sessions', secondary: '/about' },
    { primary: '/courses', secondary: '/sessions' },
    { primary: '/tools', secondary: '/articles' },
    { primary: '/sessions/2880b57d-b858-480d-b32d-c5303cbff1e6', secondary: '/about' }
];

export function HeroSlider() {
    const [current, setCurrent] = useState(0);
    const { t } = useTranslation();
    const { isRTL } = useLanguage();

    const slidesCount = 4;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slidesCount);
        }, 6000);
        return () => clearInterval(timer);
    }, [slidesCount]);

    const nextSlide = () => setCurrent((prev) => (prev + 1) % slidesCount);
    const prevSlide = () => setCurrent((prev) => (prev === 0 ? slidesCount - 1 : prev - 1));

    const currentSlide = {
        title: t(`home.hero.slides.${current}.title`),
        description: t(`home.hero.slides.${current}.description`),
        tag: t(`home.hero.slides.${current}.tag`),
        ctaPrimary: t(`home.hero.slides.${current}.ctaPrimary`),
        ctaSecondary: t(`home.hero.slides.${current}.ctaSecondary`),
        image: SLIDE_IMAGES[current],
        linkPrimary: SLIDE_LINKS[current].primary,
        linkSecondary: SLIDE_LINKS[current].secondary
    };

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
                        style={{ backgroundImage: `url(${currentSlide.image})` }}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-t from-[#1F2F4A] via-[#1F2F4A]/80 to-transparent md:bg-gradient-to-r md:from-[#1F2F4A]/95 md:via-[#1F2F4A]/80 md:to-transparent ${isRTL ? 'rtl:md:bg-gradient-to-l' : ''}`} />
                    </div>

                    {/* Content Wrapper */}
                    <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                        <div className={`max-w-2xl w-full space-y-4 md:space-y-8 mt-12 md:mt-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] md:text-sm font-medium"
                            >
                                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-[#6FA65A]" />
                                {currentSlide.tag}
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className={`text-3xl md:text-6xl font-bold text-white leading-tight ${isRTL ? 'text-right' : 'text-left'}`}
                            >
                                {currentSlide.title.split(' ').map((word, i) =>
                                    word.toLowerCase().includes('clinical') || word.includes('الإكلينيكية') || word.includes('متخصص') || word.includes('specialized') || word.includes('تفاعلية') || word.includes('interactive') ? (
                                        <span key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-[#6FA65A] to-emerald-400"> {word} </span>
                                    ) : <span key={i}> {word} </span>
                                )}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                                className={`text-base md:text-xl text-slate-200 leading-relaxed max-w-lg ${isRTL ? 'text-right ml-auto' : 'text-left'}`}
                            >
                                {currentSlide.description}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9, duration: 0.8 }}
                                className={`flex flex-col sm:flex-row gap-3 pt-2 md:pt-4 ${isRTL ? 'justify-start' : 'justify-start'}`}
                            >
                                <Link
                                    to={currentSlide.linkPrimary}
                                    className="bg-[#6FA65A] hover:bg-emerald-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 text-sm md:text-base"
                                >
                                    {currentSlide.ctaPrimary}
                                    {isRTL ? <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 rotate-0" /> : <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 rotate-180" />}
                                </Link>
                                <Link
                                    to={currentSlide.linkSecondary}
                                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                                >
                                    {currentSlide.ctaSecondary}
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
                    <ChevronRight className={`w-6 h-6 group-hover:scale-110 ${isRTL ? 'hidden' : 'block'}`} />
                    <ChevronLeft className={`w-6 h-6 group-hover:scale-110 ${isRTL ? 'block' : 'hidden'}`} />
                </button>

                <div className="flex gap-3">
                    {[...Array(slidesCount)].map((_, i) => (
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
                    <ChevronLeft className={`w-6 h-6 group-hover:scale-110 ${isRTL ? 'hidden' : 'block'}`} />
                    <ChevronRight className={`w-6 h-6 group-hover:scale-110 ${isRTL ? 'block' : 'hidden'}`} />
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
