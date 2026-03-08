import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export const CustomCursor: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // Spring for the outer ring (lagging effect)
    const ringX = useSpring(mouseX, { damping: 30, stiffness: 400 });
    const ringY = useSpring(mouseY, { damping: 30, stiffness: 400 });

    useEffect(() => {
        const dispatchInteraction = (type: string, data: any) => {
            window.dispatchEvent(new CustomEvent('cursor-interaction', {
                detail: { type, ...data }
            }));
        };

        const moveCursor = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            dispatchInteraction('move', { x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isClickable =
                target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.closest('button') ||
                target.closest('a') ||
                window.getComputedStyle(target).cursor === 'pointer';

            if (isClickable) {
                setIsHovered(true);
                dispatchInteraction('hover', { active: true });
            } else {
                setIsHovered(false);
                dispatchInteraction('hover', { active: false });
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            setIsClicked(true);
            dispatchInteraction('click', { x: e.clientX, y: e.clientY });
        };
        const handleMouseUp = () => setIsClicked(false);

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleMouseOver);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [mouseX, mouseY]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] hidden md:block">
            {/* 1. Main Interactive Ring (The "Aura") */}
            <motion.div
                style={{
                    left: ringX,
                    top: ringY,
                    x: '-50%',
                    y: '-50%',
                }}
                animate={{
                    width: isHovered ? 80 : 40,
                    height: isHovered ? 80 : 40,
                    borderColor: isHovered ? '#6FA65A' : '#1F2F4A',
                    opacity: isClicked ? 0.8 : 0.4,
                }}
                className="absolute border-2 rounded-full flex items-center justify-center transition-colors duration-300"
            >
                {/* Secondary inner pulse */}
                {isHovered && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: [0, 0.2, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 border border-[#6FA65A] rounded-full"
                    />
                )}
            </motion.div>

            {/* 2. The Psychology "Ψ" Core (Creative Symbol) */}
            <motion.div
                style={{
                    left: mouseX,
                    top: mouseY,
                    x: '-50%',
                    y: '-50%',
                }}
                animate={{
                    scale: isClicked ? 0.8 : isHovered ? 1.2 : 1,
                    rotate: isHovered ? 15 : 0
                }}
                className="absolute w-8 h-8 flex items-center justify-center text-[#1F2F4A]"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M12 2v20M6 4c0 4 0 9 6 9s6-5 6-9" />
                </svg>
            </motion.div>

            {/* 3. Small Focus Point */}
            <motion.div
                style={{
                    left: mouseX,
                    top: mouseY,
                    x: '-50%',
                    y: '-50%',
                }}
                className="absolute w-1 h-1 bg-[#6FA65A] rounded-full"
            />

            {/* Global cursor style - Still hiding real cursor but making custom very present */}
            <style dangerouslySetInnerHTML={{
                __html: `
                body, a, button, input {
                    cursor: none !important;
                }
            ` }} />
        </div>
    );
};
