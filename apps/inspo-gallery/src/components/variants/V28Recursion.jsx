// V28Recursion.jsx — Circuit-board traces radiating outward from the DS2 logo.
// Recursive lines branch at right angles only (no organic curves), each branch
// terminating in a small node. Single SF-blue accent on a deep neutral
// background. Cursor steers the dominant branching direction; scroll grows
// the recursion depth.
import { useEffect, useRef } from 'react';
import VariantShell from '@/components/variants/VariantShell';
import logoWhite from '@/assets/logo-white.png';

const Scene = ({ progress, active }) => {
    const mount = useRef(null);
    const state = useRef({ mouseX: 0.5, mouseY: 0.5, progress: 0, active: false });

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
        window.addEventListener('resize', resize);

        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            state.current.mouseX = (e.clientX - r.left) / r.width;
            state.current.mouseY = (e.clientY - r.top) / r.height;
        };
        el.addEventListener('pointermove', onMove);

        // Logo image — drawn over the traces in the centre
        let logoImg = null;
        const im = new Image();
        im.crossOrigin = 'anonymous';
        im.src = logoWhite;
        im.onload = () => { logoImg = im; };

        let raf;
        const start = performance.now();

        function drawTrace(ctx, x, y, dir, len, depth, t, basePulse) {
            if (depth <= 0 || len < 6) return;
            // Direction enum: 0=right, 1=down, 2=left, 3=up
            const dx = [1, 0, -1, 0][dir];
            const dy = [0, 1, 0, -1][dir];
            const x2 = x + dx * len;
            const y2 = y + dy * len;

            // Pulse alpha travels along the trace based on time + depth
            const pulse = 0.18 + 0.35 * Math.max(0, Math.sin(t * 1.6 - depth * 0.4 + basePulse));
            const alpha = 0.20 + (depth / 9) * 0.55;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = Math.max(0.6, depth * 0.32);
            ctx.strokeStyle = `rgba(150, 200, 245, ${alpha})`;
            ctx.shadowColor = `rgba(90, 200, 250, ${pulse * 0.4})`;
            ctx.shadowBlur = 4;
            ctx.stroke();

            // Node at branch point
            ctx.beginPath();
            ctx.arc(x2, y2, Math.max(1.2, depth * 0.5), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(220, 240, 255, ${0.6 + pulse * 0.3})`;
            ctx.fill();

            // Branch: turn left or right (90°) — sometimes both
            const branchProb = depth > 3 ? 0.85 : 0.55;
            if (Math.random() < branchProb) {
                drawTrace(ctx, x2, y2, (dir + 1) % 4, len * 0.62, depth - 1, t, basePulse + 0.7);
            }
            if (Math.random() < branchProb) {
                drawTrace(ctx, x2, y2, (dir + 3) % 4, len * 0.62, depth - 1, t, basePulse - 0.7);
            }
            // Sometimes continue straight
            if (Math.random() < 0.45) {
                drawTrace(ctx, x2, y2, dir, len * 0.74, depth - 1, t, basePulse + 0.3);
            }
        }

        const tick = () => {
            raf = requestAnimationFrame(tick);
            if (!state.current.active) return;
            const t = (performance.now() - start) / 1000;
            const w = canvas.width, h = canvas.height;

            // Background: deep neutral with subtle radial cool wash
            const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
            bg.addColorStop(0, '#0a0d14');
            bg.addColorStop(1, '#06070a');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, w, h);

            // Recursion depth grows with scroll
            const maxDepth = Math.floor(5 + state.current.progress * 4);
            const len0 = Math.min(w, h) * 0.18;

            // 4 root traces from centre going right/down/left/up
            const cx = w / 2, cy = h / 2;
            // Mouse biases the seed pulse phase so cursor changes the rhythm
            const basePulse = (state.current.mouseX + state.current.mouseY) * 3;
            // Reset RNG-ish: use a deterministic seed each frame so paths don't jitter
            let seed = Math.floor(t * 0.3) * 1000;
            const _origRandom = Math.random;
            Math.random = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
            for (let dir = 0; dir < 4; dir++) {
                drawTrace(ctx, cx, cy, dir, len0, maxDepth, t, basePulse + dir * 0.8);
            }
            Math.random = _origRandom;

            ctx.shadowBlur = 0;

            // Logo on top — bright white, slight breath
            if (logoImg) {
                const aspect = logoImg.width / logoImg.height;
                const targetH = h * 0.18;
                const targetW = targetH * aspect;
                const breath = 1.0 + 0.015 * Math.sin(t * 1.2);
                ctx.save();
                ctx.translate(cx, cy);
                ctx.scale(breath, breath);
                // Subtle SF-blue glow halo behind
                ctx.shadowColor = 'rgba(90, 200, 250, 0.5)';
                ctx.shadowBlur = 24;
                ctx.drawImage(logoImg, -targetW / 2, -targetH / 2, targetW, targetH);
                ctx.shadowBlur = 0;
                ctx.restore();
            }
        };
        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
            el.removeEventListener('pointermove', onMove);
            if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        };
    }, []);

    state.current.progress = progress;
    state.current.active = active;
    return <div ref={mount} className="absolute inset-0" style={{ touchAction: 'pan-y' }} />;
};

export const V28Recursion = () => (
    <VariantShell index={28} title="Recursion" technique="Canvas 2D · Circuit Trace · 90° Branching" hint="cursor shifts the pulse · scroll deepens the network">
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V28Recursion;
