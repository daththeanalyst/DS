// V32Slitscan.jsx — Slit-scan temporal displacement. The DS2 logo is rendered
// to a rolling history buffer; each pixel column on the final canvas reads
// from a different point in the past. Movement smears across time.
// Cursor adds a horizontal "drag" that intensifies the smear.
import { useEffect, useRef } from 'react';
import VariantShell from '@/components/variants/VariantShell';

const LOGO = import.meta.env.BASE_URL + 'logos/ds2-a.png';

const Scene = ({ progress, active }) => {
    const mount = useRef(null);
    const state = useRef({ mouse: { x: 0.5, y: 0.5 }, progress: 0, active: false });

    useEffect(() => {
        const el = mount.current;
        if (!el) return;

        const display = document.createElement('canvas');
        display.style.position = 'absolute';
        display.style.inset = '0';
        display.style.width = '100%';
        display.style.height = '100%';
        el.appendChild(display);
        const ctx = display.getContext('2d');

        // Off-screen "live frame" the logo gets drawn to each tick
        const live = document.createElement('canvas');
        const liveCtx = live.getContext('2d');

        // Rolling history of past frames (we keep N frames as separate canvases)
        const HISTORY_LEN = 90;
        const history = [];

        const dpr = Math.min(window.devicePixelRatio, 2);
        const sizeAll = () => {
            const w = el.clientWidth, h = el.clientHeight;
            display.width = w * dpr;
            display.height = h * dpr;
            live.width = w * dpr;
            live.height = h * dpr;
            history.length = 0;
        };
        sizeAll();

        const onResize = () => sizeAll();
        window.addEventListener('resize', onResize);

        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            state.current.mouse.x = (e.clientX - r.left) / r.width;
            state.current.mouse.y = (e.clientY - r.top) / r.height;
        };
        el.addEventListener('mousemove', onMove);

        let img = null;
        const im = new Image();
        im.crossOrigin = 'anonymous';
        im.src = LOGO;
        im.onload = () => { img = im; };

        const start = performance.now();
        let raf;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            if (!state.current.active) return;
            const t = (performance.now() - start) / 1000;
            const W = live.width, H = live.height;

            // ---- 1. Render the live logo frame -----------------------------
            liveCtx.fillStyle = '#06080c';
            liveCtx.fillRect(0, 0, W, H);
            if (img) {
                const aspect = img.width / img.height;
                const targetH = H * 0.55;
                const targetW = targetH * aspect;
                // logo orbits / wobbles slightly
                const cx = W / 2 + Math.sin(t * 0.7) * W * 0.08;
                const cy = H / 2 + Math.cos(t * 0.5) * H * 0.04;
                const rot = Math.sin(t * 0.3) * 0.18 + (state.current.mouse.x - 0.5) * 0.6;
                liveCtx.save();
                liveCtx.translate(cx, cy);
                liveCtx.rotate(rot);
                liveCtx.scale(1.0 + 0.12 * Math.sin(t * 1.1), 1.0 + 0.12 * Math.cos(t * 1.1));
                // glow halo behind
                const grad = liveCtx.createRadialGradient(0, 0, 0, 0, 0, targetW * 0.7);
                grad.addColorStop(0, 'rgba(120, 220, 255, 0.55)');
                grad.addColorStop(1, 'rgba(120, 220, 255, 0)');
                liveCtx.fillStyle = grad;
                liveCtx.fillRect(-targetW, -targetH, targetW * 2, targetH * 2);
                liveCtx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
                liveCtx.restore();
            }

            // ---- 2. Push live frame into the history queue -----------------
            const snapshot = document.createElement('canvas');
            snapshot.width = W;
            snapshot.height = H;
            snapshot.getContext('2d').drawImage(live, 0, 0);
            history.push(snapshot);
            while (history.length > HISTORY_LEN) history.shift();

            // ---- 3. Composite the slit-scan: each column reads its own frame
            // index from history. Drag intensity scales with cursor X.
            const drag = 0.6 + state.current.progress * 0.6 + Math.abs(state.current.mouse.x - 0.5) * 0.6;
            // Use vertical bands of width B for perf
            const B = Math.max(2, Math.floor(2 * dpr));
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, W, H);
            for (let x = 0; x < W; x += B) {
                // bend the time-offset so center pixels show "now", edges show past
                const u = x / W;
                const offset = Math.floor(Math.pow(Math.abs(u - 0.5) * 2., 1.4) * (HISTORY_LEN - 1) * drag);
                const idx = Math.max(0, history.length - 1 - offset);
                const frame = history[idx];
                if (frame) ctx.drawImage(frame, x, 0, B, H, x, 0, B, H);
            }

            // chromatic aberration: re-draw R and B channels offset slightly
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = 0.18;
            ctx.drawImage(live, -3 * dpr, 0);
            ctx.drawImage(live, 3 * dpr, 0);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';

            // tech HUD overlay (subtle)
            ctx.fillStyle = 'rgba(180, 220, 255, 0.55)';
            ctx.font = `${Math.floor(11 * dpr)}px ui-monospace, monospace`;
            ctx.fillText(`SLITSCAN · DRAG ${drag.toFixed(2)} · HIST ${history.length}/${HISTORY_LEN}`, 12 * dpr, 22 * dpr);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
            el.removeEventListener('mousemove', onMove);
            history.length = 0;
            if (display.parentNode) display.parentNode.removeChild(display);
        };
    }, []);

    state.current.progress = progress;
    state.current.active = active;
    return <div ref={mount} className="absolute inset-0" />;
};

export const V32Slitscan = () => (
    <VariantShell index={32} title="Slitscan" technique="Canvas 2D · Temporal Column Displacement · Rolling History" hint="cursor X drags time · scroll widens the smear">
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V32Slitscan;
