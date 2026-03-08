import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

interface Particle {
    x: number;
    y: number;
    z: number;
    px: number;
    py: number;
    vx: number;
    vy: number;
    vz: number;
    size: number;
    color: string;
    opacity: number;
    type: 'point' | 'symbol' | 'brain' | 'wave';
    phase: number; // For pulsing animations
}

export const InteractiveBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        const mouse = { x: 0, y: 0, active: false, targetX: 0, targetY: 0 };
        let scrollY = window.scrollY;
        let time = 0;

        const particleCount = 180; // Increased density
        const fieldDepth = 1000;
        const focalLength = 300;

        // Simple Flow Field / Noise approximation using sin/cos
        const getFlowAngle = (x: number, y: number, z: number, t: number) => {
            const scale = 0.0005;
            const noise = Math.sin(x * scale + t) * Math.cos(y * scale - t) * Math.PI * 2;
            return noise + (z * 0.001); // Depth adds a slight twist
        };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };

        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                const typeRand = Math.random();
                particles.push({
                    x: (Math.random() - 0.5) * canvas.width * 4,
                    y: (Math.random() - 0.5) * canvas.height * 5,
                    z: Math.random() * fieldDepth,
                    px: 0, py: 0,
                    vx: 0, vy: 0, vz: 0,
                    size: Math.random() * 5 + 3,
                    color: theme === 'dark'
                        ? (i % 2 === 0 ? 'rgba(52, 211, 153, 0.6)' : 'rgba(165, 180, 252, 0.4)') // More vibrant dark mode colors
                        : (i % 2 === 0 ? 'rgba(31, 47, 74, 0.4)' : 'rgba(111, 166, 90, 0.2)'),
                    opacity: 0,
                    type: typeRand > 0.97 ? 'brain' : typeRand > 0.93 ? 'symbol' : typeRand > 0.85 ? 'wave' : 'point',
                    phase: Math.random() * Math.PI * 2
                });
            }
        };

        const drawPsi = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number, glow: boolean) => {
            const baseColor = theme === 'dark' ? `rgba(52, 211, 153, ${opacity})` : `rgba(31, 47, 74, ${opacity})`;
            ctx.strokeStyle = baseColor;
            ctx.lineWidth = glow ? 2.5 : 1.5;
            if (glow) {
                ctx.shadowBlur = 15;
                ctx.shadowColor = theme === 'dark' ? 'rgba(52, 211, 153, 0.8)' : 'rgba(31, 47, 74, 0.4)';
            }
            ctx.beginPath();
            ctx.moveTo(x, y - size);
            ctx.lineTo(x, y + size);
            ctx.moveTo(x - size * 0.8, y - size * 0.4);
            ctx.quadraticCurveTo(x - size * 0.8, y + size * 0.6, x, y + size * 0.6);
            ctx.quadraticCurveTo(x + size * 0.8, y + size * 0.6, x + size * 0.8, y - size * 0.4);
            ctx.stroke();
            ctx.shadowBlur = 0;
        };

        const drawBrain = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number, glow: boolean) => {
            const baseColor = theme === 'dark' ? `rgba(52, 211, 153, ${opacity})` : `rgba(110, 166, 90, ${opacity})`;
            ctx.strokeStyle = baseColor;
            ctx.lineWidth = glow ? 2 : 1.2;
            if (glow) {
                ctx.shadowBlur = 20;
                ctx.shadowColor = theme === 'dark' ? 'rgba(52, 211, 153, 0.9)' : 'rgba(110, 166, 90, 0.5)';
            }
            ctx.beginPath();
            ctx.moveTo(x, y - size * 0.5);
            ctx.bezierCurveTo(x - size * 1.2, y - size * 1.2, x - size * 1.2, y + size * 1.2, x, y + size * 0.5);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y - size * 0.5);
            ctx.bezierCurveTo(x + size * 1.2, y - size * 1.2, x + size * 1.2, y + size * 1.2, x, y + size * 0.5);
            ctx.stroke();
            ctx.shadowBlur = 0;
        };

        const drawWave = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number, phase: number, glow: boolean) => {
            const baseColor = theme === 'dark' ? `rgba(165, 180, 252, ${opacity * 0.7})` : `rgba(31, 47, 74, ${opacity * 0.2})`;
            ctx.strokeStyle = baseColor;
            ctx.lineWidth = glow ? 1.5 : 0.8;
            ctx.beginPath();
            for (let i = -size; i <= size; i += 5) {
                const yOffset = Math.sin(i * 0.1 + phase + time) * 10;
                if (i === -size) ctx.moveTo(x + i, y + yOffset);
                else ctx.lineTo(x + i, y + yOffset);
            }
            ctx.stroke();
        };

        const animate = () => {
            time += 0.002; // Very slow time progression for flow field
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const scrollShift = scrollY * 0.3;

            // Interactive smoothing
            mouse.x += (mouse.targetX - mouse.x) * 0.08;
            mouse.y += (mouse.targetY - mouse.y) * 0.08;

            particles.forEach((p, i) => {
                // 1. Follow Flow Field
                const angle = getFlowAngle(p.x, p.y, p.z, time);
                const flowVx = Math.cos(angle) * 0.18;
                const flowVy = Math.sin(angle) * 0.18;

                // 2. Interaction
                let interactVx = 0;
                let interactVy = 0;
                let isNearMouse = false;
                if (mouse.active) {
                    const dx = mouse.x - p.px;
                    const dy = mouse.y - p.py;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const range = 500;
                    if (dist < range) {
                        isNearMouse = true;
                        const strength = (1 - dist / range);
                        // Stronger vortex effect
                        interactVx = -dy * strength * 0.04;
                        interactVy = dx * strength * 0.04;
                    }
                }

                // Apply velocities with inertia
                p.vx += (flowVx + interactVx - p.vx) * 0.015;
                p.vy += (flowVy + interactVy - p.vy) * 0.015;

                p.x += p.vx;
                p.y += p.vy;

                // Wrap around
                const boundX = canvas.width * 2;
                const boundY = canvas.height * 2.5;
                if (p.x < -boundX) p.x = boundX;
                if (p.x > boundX) p.x = -boundX;
                if (p.y < -boundY) p.y = boundY;
                if (p.y > boundY) p.y = -boundY;

                // 3. Projection
                const scale = focalLength / (focalLength + p.z);
                const projectedY = p.y - scrollShift * (1 - scale * 0.4);

                p.px = centerX + p.x * scale;
                p.py = centerY + projectedY * scale;
                p.opacity = (1 - (p.z / fieldDepth)) * 0.75;

                // 4. Render Connections (Neural Net) - Better visibility
                if (mouse.active) {
                    const dMouse = Math.sqrt(Math.pow(mouse.x - p.px, 2) + Math.pow(mouse.y - p.py, 2));
                    if (dMouse < 350) {
                        const step = theme === 'dark' ? 3 : 5; // Denser connections in dark mode
                        for (let j = i + 1; j < particles.length; j += step) {
                            const p2 = particles[j];
                            const d = Math.sqrt(Math.pow(p.px - p2.px, 2) + Math.pow(p.py - p2.py, 2));
                            if (d < 140) {
                                ctx.beginPath();
                                ctx.strokeStyle = theme === 'dark'
                                    ? `rgba(52, 211, 153, ${p.opacity * 0.3 * (1 - d / 140)})`
                                    : `rgba(31, 47, 74, ${p.opacity * 0.1 * (1 - d / 140)})`;
                                ctx.lineWidth = 0.6;
                                ctx.moveTo(p.px, p.py);
                                ctx.lineTo(p2.px, p2.py);
                                ctx.stroke();
                            }
                        }
                    }
                }

                // 5. Draw Symbol with Proximity Glow
                const sizeScale = p.type === 'point' ? 1 : 1.2;
                const effectiveOpacity = isNearMouse ? p.opacity * 1.2 : p.opacity;

                if (p.type === 'point') {
                    ctx.fillStyle = p.color.replace('opacity', (effectiveOpacity * (theme === 'dark' ? 0.8 : 0.5)).toString());
                    ctx.beginPath();
                    ctx.arc(p.px, p.py, p.size * scale * (1 + Math.sin(time * 2 + p.phase) * 0.2), 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.type === 'symbol') {
                    drawPsi(ctx, p.px, p.py, 50 * scale * sizeScale, effectiveOpacity * 0.9, isNearMouse);
                } else if (p.type === 'brain') {
                    drawBrain(ctx, p.px, p.py, 60 * scale * sizeScale, effectiveOpacity * 1.0, isNearMouse);
                } else if (p.type === 'wave') {
                    drawWave(ctx, p.px, p.py, 90 * scale * sizeScale, effectiveOpacity * 0.6, p.phase, isNearMouse);
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (event: MouseEvent) => {
            mouse.targetX = event.clientX;
            mouse.targetY = event.clientY;
            mouse.active = true;
        };

        const handleScroll = () => { scrollY = window.scrollY; };

        const handleCursorInteraction = (e: any) => {
            const { type, x, y } = e.detail;
            if (type === 'move') {
                mouse.targetX = x;
                mouse.targetY = y;
                mouse.active = true;
            }
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('cursor-interaction', handleCursorInteraction);
        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('cursor-interaction', handleCursorInteraction);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-50 pointer-events-none"
        />
    );
};
