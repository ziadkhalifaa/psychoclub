import React, { useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export const AnimatedBackground = () => {
    const { scrollYProgress } = useScroll();

    // Smooth out the scroll progress
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Transform scroll progress to background positions
    const y1 = useTransform(smoothProgress, [0, 1], ['0%', '100%']);
    const y2 = useTransform(smoothProgress, [0, 1], ['0%', '-100%']);
    const rotate1 = useTransform(smoothProgress, [0, 1], [0, 180]);
    const rotate2 = useTransform(smoothProgress, [0, 1], [0, -180]);

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden bg-slate-50 pointer-events-none">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-100" />

            {/* Animated blob 1 */}
            <motion.div
                style={{ y: y1, rotate: rotate1, willChange: 'transform', backfaceVisibility: 'hidden' }}
                className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full mix-blend-multiply filter blur-[60px] opacity-40 bg-gradient-to-br from-emerald-100 to-teal-100"
            />

            {/* Animated blob 2 */}
            <motion.div
                style={{ y: y2, rotate: rotate2, willChange: 'transform', backfaceVisibility: 'hidden' }}
                className="absolute top-[40%] -left-[10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[80px] opacity-30 bg-gradient-to-tr from-blue-100 to-indigo-100"
            />

            {/* Animated blob 3 (follows scroll loosely) */}
            <motion.div
                style={{ y: useTransform(smoothProgress, [0, 1], ['50%', '-50%']), willChange: 'transform', backfaceVisibility: 'hidden' }}
                className="absolute bottom-0 right-[20%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-[70px] opacity-30 bg-gradient-to-tl from-green-100 to-emerald-50"
            />

            {/* Noise overlay for texture */}
            <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
        </div>
    );
};
