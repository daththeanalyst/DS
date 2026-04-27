// V18DepthDiorama.jsx — DS2 split into 5 stacked Z-layers; mouse parallaxes the
// camera; far layers blur and fade. Cinematic miniature feel.
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';
import VariantShell from '@/components/variants/VariantShell';

import logoImg from '@/assets/logo-outline.png';
const LOGO = logoImg;

// Each layer sits at a different Z and shows a different "slice" of the logo
// via clip-path or color treatment. We layer them with depth-based blur + opacity.
const LAYERS = [
    { z: 80, scale: 1.18, blur: 0, opacity: 1.0, hue: 0, saturate: 1.05, brightness: 1.15, parallax: 1.6, color: 'hsl(36, 30%, 96%)' },
    { z: 40, scale: 1.08, blur: 1, opacity: 0.95, hue: -10, saturate: 1.0, brightness: 1.0, parallax: 1.0, color: 'hsl(28, 95%, 70%)' },
    { z: 0, scale: 1.0, blur: 3, opacity: 0.85, hue: 20, saturate: 0.85, brightness: 0.85, parallax: 0.5, color: 'hsl(195, 80%, 70%)' },
    { z: -50, scale: 0.96, blur: 9, opacity: 0.55, hue: 50, saturate: 0.6, brightness: 0.55, parallax: 0.0, color: 'hsl(225, 30%, 30%)' },
    { z: -110, scale: 0.92, blur: 22, opacity: 0.3, hue: 80, saturate: 0.4, brightness: 0.35, parallax: -0.3, color: 'hsl(225, 50%, 14%)' },
];

const DioramaLayer = ({ layer, sx, sy, idx }) => {
    const px = useTransform(sx, [-0.5, 0.5], [-layer.parallax * 60, layer.parallax * 60]);
    const py = useTransform(sy, [-0.5, 0.5], [-layer.parallax * 35, layer.parallax * 35]);
    return (
        <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
                x: px,
                y: py,
                transform: `translateZ(${layer.z}px) scale(${layer.scale})`,
            }}
        >
            <img
                src={LOGO}
                alt={`DS2 layer ${idx}`}
                className="w-full h-auto select-none mix-blend-screen"
                draggable={false}
                style={{
                    opacity: layer.opacity,
                    filter: `blur(${layer.blur}px) hue-rotate(${layer.hue}deg) saturate(${layer.saturate}) brightness(${layer.brightness}) drop-shadow(0 ${idx * 3}px ${idx * 6}px hsla(225, 50%, 0%, ${idx * 0.12}))`,
                }}
            />
        </motion.div>
    );
};

const Scene = ({ progress, active }) => {
    const wrapRef = useRef(null);
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const sx = useSpring(mx, { stiffness: 90, damping: 22, mass: 0.8 });
    const sy = useSpring(my, { stiffness: 90, damping: 22, mass: 0.8 });
    // Camera tilt
    const camRotY = useTransform(sx, [-0.5, 0.5], [10, -10]);
    const camRotX = useTransform(sy, [-0.5, 0.5], [-7, 7]);

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
        <div ref={wrapRef} className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {/* Atmospheric gradient backdrop */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(circle at 50% 60%, hsl(225 30% 8%) 0%, hsl(225 35% 4%) 60%, hsl(225 50% 1%) 100%)',
                }}
            />
            {/* Atmospheric particles (decorative dots) */}
            <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 20% 30%, hsla(36, 30%, 96%, 0.15) 0px, transparent 1px), radial-gradient(circle at 70% 60%, hsla(36, 30%, 96%, 0.1) 0px, transparent 1px), radial-gradient(circle at 40% 80%, hsla(36, 30%, 96%, 0.08) 0px, transparent 1px)',
                    backgroundSize: '120px 120px, 200px 200px, 80px 80px',
                }}
            />
            {/* 3D scene */}
            <div
                className="relative"
                style={{ perspective: '1600px', perspectiveOrigin: '50% 50%' }}
            >
                <motion.div
                    className="relative w-[min(72vw,860px)] aspect-[3/2]"
                    style={{
                        transformStyle: 'preserve-3d',
                        rotateX: camRotX,
                        rotateY: camRotY,
                    }}
                >
                    {LAYERS.map((layer, i) => (
                        <DioramaLayer key={i} layer={layer} sx={sx} sy={sy} idx={i} />
                    ))}
                </motion.div>
            </div>
            {/* Dust motes that drift forward */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 18 }).map((_, i) => (
                    <span
                        key={i}
                        className="absolute h-[3px] w-[3px] rounded-full bg-foreground/50"
                        style={{
                            left: `${(i * 53 + 11) % 100}%`,
                            top: `${(i * 31 + 7) % 100}%`,
                            filter: 'blur(1px)',
                            animation: `v18-dust-${i % 4} ${10 + (i % 5) * 2}s ease-in-out infinite alternate`,
                            opacity: 0.5,
                        }}
                    />
                ))}
            </div>
            {/* Fog tint at far depths */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse at 50% 80%, transparent 30%, hsla(225, 50%, 1%, 0.7) 90%)',
                }}
            />
            {/* Tilt-shift blur strips (top + bottom) */}
            <div
                className="absolute top-0 inset-x-0 h-32 pointer-events-none"
                style={{
                    background: 'linear-gradient(to bottom, hsl(225 50% 1% / 0.65), transparent)',
                    backdropFilter: 'blur(2px)',
                }}
            />
            <div
                className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
                style={{
                    background: 'linear-gradient(to top, hsl(225 50% 1% / 0.65), transparent)',
                    backdropFilter: 'blur(2px)',
                }}
            />
            <style>{`
                @keyframes v18-dust-0 { from { transform: translateY(-20px) translateX(0); } to { transform: translateY(20px) translateX(40px); } }
                @keyframes v18-dust-1 { from { transform: translateY(0) translateX(-30px); } to { transform: translateY(30px) translateX(20px); } }
                @keyframes v18-dust-2 { from { transform: translateY(15px) translateX(20px); } to { transform: translateY(-15px) translateX(-30px); } }
                @keyframes v18-dust-3 { from { transform: translateY(-10px) translateX(-15px); } to { transform: translateY(20px) translateX(35px); } }
            `}</style>
        </div>
    );
};

export const V18DepthDiorama = () => (
    <VariantShell scrollable={true}
        index={18}
        title="Tilt-Shift Depth Diorama"
        technique="Framer Motion · 5 Z-layers · Parallax + depth blur"
        hint="hover to peer into the diorama · the foreground leads the camera"
        accent="secondary"
    >
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V18DepthDiorama;

V18DepthDiorama.isTall = true;
