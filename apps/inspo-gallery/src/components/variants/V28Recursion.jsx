// V28Recursion.jsx — L-system fractal tree growing into the DS2 logo silhouette.
// Branches drawn as anti-aliased canvas strokes; cursor pushes the wind vector;
// scroll grows the recursion depth.
import { useEffect, useRef } from 'react';
import VariantShell from '@/components/variants/VariantShell';

const Scene = ({ progress, active }) => {
    const mount = useRef(null);
    const state = useRef({ wind: 0, progress: 0, active: false });

    useEffect(() => {
        const el = mount.current;
        if (!el) return;
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.inset = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        el.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        const dpr = Math.min(window.devicePixelRatio, 2);
        const resize = () => {
            canvas.width = el.clientWidth * dpr;
            canvas.height = el.clientHeight * dpr;
        };
        resize();

        const onResize = () => resize();
        window.addEventListener('resize', onResize);

        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width;
            state.current.wind = (x - 0.5) * 0.6; // -0.3 to +0.3 rad
        };
        el.addEventListener('pointermove', onMove);

        let raf;
        const start = performance.now();

        const draw = () => {
            raf = requestAnimationFrame(draw);
            if (!state.current.active) return;
            const t = (performance.now() - start) / 1000;
            const w = canvas.width, h = canvas.height;
            // background fade
            ctx.fillStyle = 'rgba(8, 10, 14, 0.18)';
            ctx.fillRect(0, 0, w, h);

            // recursive depth grows with scroll progress
            const maxDepth = Math.floor(7 + state.current.progress * 3);
            const len0 = h * 0.16;
            const wind = state.current.wind + Math.sin(t * 0.7) * 0.04;

            // multiple seeds across the bottom for the "forest growing into the logo" feel
            const seeds = 5;
            for (let s = 0; s < seeds; s++) {
                const x = w * (0.18 + (s / (seeds - 1)) * 0.64);
                const y = h * 0.92;
                drawBranch(ctx, x, y, -Math.PI / 2 + (s - 2) * 0.04, len0, maxDepth, t, wind, h);
            }

            // DS wordmark — clean white, very subtle SF-blue glow
            ctx.save();
            ctx.globalAlpha = 0.85;
            ctx.font = `600 ${Math.floor(h * 0.18)}px ui-sans-serif, system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(245, 247, 250, 0.92)';
            ctx.shadowColor = 'rgba(90, 200, 250, 0.25)';
            ctx.shadowBlur = 8;
            ctx.fillText('DS', w / 2, h * 0.45);
            ctx.restore();
        };

        function drawBranch(ctx, x, y, angle, len, depth, t, wind, h) {
            if (depth <= 0 || len < 1) return;
            const sway = Math.sin(t * 0.9 + len * 0.02) * wind * (depth / 8);
            const a = angle + sway;
            const x2 = x + Math.cos(a) * len;
            const y2 = y + Math.sin(a) * len;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = Math.max(0.5, depth * 0.55);
            // Single cool-grey tone, brighter at tips. No magenta, no neon.
            const tDepth = depth / 9;
            const lightness = 140 + (1 - tDepth) * 70;
            const tint = `rgba(${lightness}, ${lightness + 16}, ${lightness + 28}, ${0.22 + tDepth * 0.45})`;
            ctx.strokeStyle = tint;
            // Glow halved + recoloured to subtle SF-blue (was depth*1.5 with full saturation)
            ctx.shadowColor = `rgba(90, 200, 250, 0.18)`;
            ctx.shadowBlur = Math.max(2, depth * 0.7);
            ctx.stroke();

            const branching = depth > 2 ? 2 : 3;
            for (let i = 0; i < branching; i++) {
                const split = (i - (branching - 1) / 2) * (0.42 + 0.08 * Math.sin(t + i));
                drawBranch(ctx, x2, y2, a + split, len * 0.74, depth - 1, t, wind, h);
            }
        }

        raf = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
            el.removeEventListener('pointermove', onMove);
            if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        };
    }, []);

    state.current.progress = progress;
    state.current.active = active;
    return <div ref={mount} className="absolute inset-0" style={{ touchAction: 'pan-y' }} />;
};

export const V28Recursion = () => (
    <VariantShell index={28} title="Recursion" technique="Canvas 2D · L-system · Recursive Branch Tree" hint="cursor X bends the wind · scroll deepens recursion">
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V28Recursion;
