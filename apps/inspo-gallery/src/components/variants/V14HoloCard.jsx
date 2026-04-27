// V14HoloCard.jsx — A holographic 3D card with the DS2 logo embossed. Mouse tilts the
// card in 3D, chromatic aberration follows tilt, holographic gradient sweeps with light.
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';
import VariantShell from '@/components/variants/VariantShell';

import logoImg from '@/assets/logo-outline.png';
const LOGO = logoImg;

const Scene = ({ progress, active }) => {
    const wrapRef = useRef(null);
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const sx = useSpring(mx, { stiffness: 130, damping: 18, mass: 0.6 });
    const sy = useSpring(my, { stiffness: 130, damping: 18, mass: 0.6 });

    // Tilt — 22deg max
    const rotY = useTransform(sx, [-0.5, 0.5], [22, -22]);
    const rotX = useTransform(sy, [-0.5, 0.5], [-18, 18]);
    // Light highlight position
    const hlx = useTransform(sx, [-0.5, 0.5], ['18%', '82%']);
    const hly = useTransform(sy, [-0.5, 0.5], ['18%', '82%']);
    // Chromatic shift
    const shiftR = useTransform(sx, [-0.5, 0.5], [-10, 10]);
    const shiftB = useTransform(sx, [-0.5, 0.5], [10, -10]);
    const shiftG = useTransform(sy, [-0.5, 0.5], [-4, 4]);
    // Hue rotate based on tilt
    const hueRot = useTransform(sx, [-0.5, 0.5], [-30, 30]);

    useEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        const onMove = (e) => {
            const r = wrap.getBoundingClientRect();
            mx.set((e.clientX - r.left) / r.width - 0.5);
            my.set((e.clientY - r.top) / r.height - 0.5);
        };
        const onLeave = () => { mx.set(0); my.set(0); };
        wrap.addEventListener('mousemove', onMove);
        wrap.addEventListener('mouseleave', onLeave);
        return () => {
            wrap.removeEventListener('mousemove', onMove);
            wrap.removeEventListener('mouseleave', onLeave);
        };
    }, [mx, my]);

    return (
        <div ref={wrapRef} className="absolute inset-0 flex items-center justify-center">
            {/* Backdrop with subtle iridescent gradient */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(circle at 50% 60%, hsl(225 30% 8%) 0%, hsl(225 35% 4%) 70%, hsl(225 50% 1%) 100%)',
                }}
            />
            <div
                className="absolute inset-0 opacity-40 pointer-events-none mix-blend-screen"
                style={{
                    background:
                        'radial-gradient(ellipse at 50% 50%, hsla(22, 95%, 50%, 0.18) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, hsla(175, 80%, 50%, 0.18) 0%, transparent 60%)',
                }}
            />

            {/* Card */}
            <div
                className="relative"
                style={{ perspective: '1400px', perspectiveOrigin: '50% 50%' }}
            >
                <motion.div
                    className="relative w-[min(60vw,720px)] aspect-[3/2] rounded-3xl overflow-hidden"
                    style={{
                        rotateX: rotX,
                        rotateY: rotY,
                        transformStyle: 'preserve-3d',
                        boxShadow:
                            '0 40px 100px -30px hsla(22, 95%, 50%, 0.45), 0 30px 80px -20px hsla(175, 80%, 50%, 0.35), 0 0 1px hsla(36, 30%, 96%, 0.25) inset',
                        background:
                            'linear-gradient(135deg, hsl(225 30% 8%), hsl(225 40% 5%) 60%, hsl(225 28% 10%))',
                        border: '1px solid hsl(225 25% 22% / 0.6)',
                    }}
                >
                    {/* Holographic grain layer */}
                    <div
                        className="absolute inset-0 mix-blend-screen pointer-events-none"
                        style={{
                            background:
                                'conic-gradient(from 200deg at 50% 50%, hsl(22 95% 60% / 0.0) 0deg, hsl(22 95% 60% / 0.18) 60deg, hsl(280 70% 60% / 0.18) 130deg, hsl(175 85% 60% / 0.18) 200deg, hsl(45 95% 60% / 0.18) 280deg, hsl(22 95% 60% / 0.0) 360deg)',
                            filter: 'blur(28px)',
                        }}
                    />
                    {/* Diagonal sheen that follows mouse */}
                    <motion.div
                        className="absolute inset-0 pointer-events-none mix-blend-screen"
                        style={{
                            background: useTransform(
                                [hlx, hly],
                                ([x, y]) =>
                                    `radial-gradient(circle at ${x} ${y}, hsla(36, 95%, 80%, 0.55) 0%, hsla(22, 95%, 60%, 0.22) 24%, hsla(225, 50%, 5%, 0) 55%)`
                            ),
                        }}
                    />

                    {/* Logo layers — RGB-split via three offset copies */}
                    <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ transform: 'translateZ(40px)' }}
                    >
                        <motion.img
                            src={LOGO}
                            alt=""
                            className="absolute w-[78%] mix-blend-screen pointer-events-none select-none"
                            style={{
                                x: shiftR,
                                filter:
                                    'drop-shadow(0 0 14px hsla(22, 95%, 60%, 0.6)) brightness(1.6) sepia(1) hue-rotate(-30deg) saturate(6)',
                            }}
                            draggable={false}
                        />
                        <motion.img
                            src={LOGO}
                            alt=""
                            className="absolute w-[78%] mix-blend-screen pointer-events-none select-none"
                            style={{
                                y: shiftG,
                                filter:
                                    'drop-shadow(0 0 12px hsla(135, 85%, 55%, 0.45)) brightness(1.4) sepia(1) hue-rotate(60deg) saturate(5)',
                            }}
                            draggable={false}
                        />
                        <motion.img
                            src={LOGO}
                            alt="DS2 holographic"
                            className="absolute w-[78%] mix-blend-screen pointer-events-none select-none"
                            style={{
                                x: shiftB,
                                filter:
                                    'drop-shadow(0 0 18px hsla(195, 80%, 65%, 0.55)) brightness(1.4) sepia(1) hue-rotate(170deg) saturate(6)',
                            }}
                            draggable={false}
                        />
                        {/* Crisp white logo on top for legibility */}
                        <motion.img
                            src={LOGO}
                            alt=""
                            className="relative w-[78%] pointer-events-none select-none"
                            style={{
                                filter: useTransform(
                                    hueRot,
                                    (h) => `drop-shadow(0 8px 24px hsla(225, 50%, 0%, 0.6)) brightness(1.05) hue-rotate(${h}deg)`
                                ),
                            }}
                            draggable={false}
                        />
                    </div>

                    {/* Etched grid pattern as a "card surface" texture */}
                    <div
                        className="absolute inset-0 opacity-25 pointer-events-none"
                        style={{
                            backgroundImage:
                                'linear-gradient(0deg, hsla(36, 30%, 96%, 0.05) 1px, transparent 1px), linear-gradient(90deg, hsla(36, 30%, 96%, 0.05) 1px, transparent 1px)',
                            backgroundSize: '32px 32px',
                            mixBlendMode: 'overlay',
                        }}
                    />

                    {/* Card chrome — corner labels */}
                    <div className="absolute top-5 left-5 right-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70 pointer-events-none">
                        <span>DS² · holo edition</span>
                        <span className="text-primary">●</span>
                        <span>0014 / 9999</span>
                    </div>
                    <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70 pointer-events-none">
                        <span>signed · ds² studio</span>
                        <span>2026</span>
                    </div>

                    {/* Edge bevel highlight — top-left & bottom-right */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            boxShadow:
                                'inset 1px 1px 0 hsla(36, 30%, 96%, 0.18), inset -1px -1px 0 hsla(225, 50%, 1%, 0.6)',
                            borderRadius: 'inherit',
                        }}
                    />
                </motion.div>
            </div>

            {/* Floor reflection */}
            <motion.div
                className="absolute left-1/2 top-[78%] -translate-x-1/2 w-[min(56vw,680px)] h-24 rounded-[50%] pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse, hsla(22, 95%, 50%, 0.35) 0%, transparent 70%)',
                    filter: 'blur(28px)',
                    opacity: 0.55,
                }}
            />
        </div>
    );
};

export const V14HoloCard = () => (
    <VariantShell
        index={14}
        title="Holographic Tilt Card"
        technique="Framer Motion · 3D rotateX/Y · Chromatic split · Conic sheen"
        hint="hover to tilt the card · the holo follows the light"
        accent="primary"
    >
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V14HoloCard;

