import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function LoadingScreen() {
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('جاري تهيئة المسارات العصبية...');

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) return 100;
                // Target: 100% over 10,000ms. Interval is 50ms (200 steps total).
                // Average increment should be 0.5% per step.
                return prev + Math.random() * 1;
            });
        }, 50);

        const messages = [
            'جاري تهيئة المسارات العصبية...',
            'تحميل البيانات الإكلينيكية...',
            'تجهيز الأدوات النفسية...',
            'ربط مجتمع الأخصائيين...',
            'نكاد ننتهي...'
        ];

        let msgIdx = 0;
        const msgTimer = setInterval(() => {
            msgIdx = (msgIdx + 1) % messages.length;
            setMessage(messages[msgIdx]);
        }, 800);

        return () => {
            clearInterval(timer);
            clearInterval(msgTimer);
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
            className="fixed inset-0 z-[9999] bg-[#1F2F4A] flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Background Decorative Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6FA65A]/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Logo Animation Container */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, filter: "blur(10px)" }}
                    animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="relative mb-12"
                >
                    <div className="absolute inset-0 bg-white/40 rounded-full blur-[80px] scale-150 animate-pulse" />

                    <motion.div
                        className="relative"
                        animate={{
                            y: [0, -30, 0, 30, 0],
                            x: [0, 20, -20, 0],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.05, 1],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <img
                                src="/loader-logo-custom.png"
                                alt="Logo"
                                className="w-40 md:w-56 h-auto object-contain"
                            />
                        </motion.div>
                    </motion.div>

                    {/* Neural Pulse Rings */}
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: [0, 0.3, 0], scale: [0.8, 3.5] }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                delay: i * 1.5,
                                ease: "easeOut"
                            }}
                            className="absolute inset-0 border-2 border-white/20 rounded-full"
                        />
                    ))}
                </motion.div>

                {/* Progress Content */}
                <div className="w-64 flex flex-col items-center">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={message}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mb-6 text-center h-4"
                            dir="rtl"
                        >
                            {message}
                        </motion.p>
                    </AnimatePresence>

                    {/* Shimmering Progress Bar */}
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#6FA65A] to-emerald-400"
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "easeOut" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-20 h-full -skew-x-12 animate-[shimmer_1.5s_infinite]" />
                    </div>

                    <motion.span
                        className="text-[#6FA65A] text-[10px] font-black mt-3 family-mono"
                    >
                        {Math.round(progress)}%
                    </motion.span>
                </div>
            </div>

            {/* Bottom Branding */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-12 flex flex-col items-center"
            >
                <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em] mb-2">Developed by</span>
                <span className="text-[#6FA65A] font-black text-xs tracking-tighter uppercase">Ziad Khalifa</span>
            </motion.div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shimmer {
                    from { transform: translateX(-100%) skewX(-12deg); }
                    to { transform: translateX(400%) skewX(-12deg); }
                }
            `}} />
        </motion.div>
    );
}
