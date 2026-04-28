// V07FisheyeDots.jsx — regular dot grid with fisheye/bulge lens distortion from cursor
import { useEffect, useRef } from 'react';
import VariantShell from '@/components/variants/VariantShell';

import logoImg from '@/assets/logo-outline.png';
const LOGO = logoImg;

const Scene = ({ progress, active }) => {
    const canvasRef = useRef(null);
    const state = useRef({ mx: -9999, my: -9999, progress: 0, grid: null });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let disposed = false, raf;

        const resize = () => {
            const { clientWidth: w, clientHeight: h } = canvas;
            canvas.width = w * Math.min(2, window.devicePixelRatio || 1);
            canvas.height = h * Math.min(2, window.devicePixelRatio || 1);
        };
        resize();
        window.addEventListener('resize', resize);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            if (disposed) return;
            const samp = document.createElement('canvas');
            samp.width = 512;
            samp.height = Math.round(512 / (img.width / img.height));
            const sctx = samp.getContext('2d');
            sctx.drawImage(img, 0, 0, samp.width, samp.height);
            const data = sctx.getImageData(0, 0, samp.width, samp.height).data;
            state.current.grid = { samp, data };
            start();
        };
        img.src = LOGO;

        const onMove = (e) => {
            const r = canvas.getBoundingClientRect();
            state.current.mx = e.clientX - r.left;
            state.current.my = e.clientY - r.top;
        };
        const onLeave = () => { state.current.mx = -9999; state.current.my = -9999; };
        canvas.addEventListener('pointermove', onMove);
        canvas.addEventListener('pointerleave', onLeave);

        const start = () => {
            let tlast = performance.now();
            const render = () => {
                raf = requestAnimationFrame(render);
                if (!state.current.active) return;
                const now = performance.now();
                const t = (now - tlast) * 0.001;
                const dpr = Math.min(2, window.devicePixelRatio || 1);
                const cw = canvas.width, ch = canvas.height;
                ctx.clearRect(0, 0, cw, ch);

                const { samp, data } = state.current.grid;
                const sw = samp.width, sh = samp.height;
                const ratio = sw / sh;
                // fit logo area
                const fitH = ch * 0.6;
                const fitW = fitH * ratio;
                const ox = (cw - fitW) / 2;
                const oy = (ch - fitH) / 2;

                const COLS = 160;
                const ROWS = Math.round(COLS / ratio);
                const stepX = fitW / COLS;
                const stepY = fitH / ROWS;

                const mx = state.current.mx * dpr;
                const my = state.current.my * dpr;
                const prog = state.current.progress;
                const bulgeRadius = 220 * dpr;
                const bulgeStrength = 1.4 + prog * 1.2;

                for (let j = 0; j < ROWS; j++) {
                    for (let i = 0; i < COLS; i++) {
                        const baseX = ox + i * stepX + stepX / 2;
                        const baseY = oy + j * stepY + stepY / 2;
                        const u = Math.min(sw - 1, Math.max(0, Math.floor((i / COLS) * sw)));
                        const v = Math.min(sh - 1, Math.max(0, Math.floor((j / ROWS) * sh)));
                        const idx = (v * sw + u) * 4;
                        const br = (data[idx] + data[idx + 1] + data[idx + 2]) / (3 * 255);

                        // fisheye
                        const ddx = baseX - mx;
                        const ddy = baseY - my;
                        const dd = Math.sqrt(ddx * ddx + ddy * ddy);
                        let nx = baseX, ny = baseY;
                        if (dd < bulgeRadius) {
                            const k = 1 - dd / bulgeRadius;
                            const displace = Math.pow(k, 2) * bulgeStrength;
                            nx = baseX + ddx * displace * 0.4;
                            ny = baseY + ddy * displace * 0.4;
                        }
                        // dot size modulated by brightness + proximity
                        const near = dd < bulgeRadius ? (1 - dd / bulgeRadius) : 0;
                        const r = Math.max(0.4, (br * 2.2 + near * 1.4)) * dpr;
                        // color
                        const hue = br > 0.5 ? 22 : 200;
                        const l = 20 + br * 65 + near * 20;
                        const sat = br > 0.5 ? 90 : 25;
                        ctx.fillStyle = `hsla(${hue},${sat}%,${l}%,${0.25 + br * 0.85})`;
                        ctx.beginPath();
                        ctx.arc(nx, ny, r, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                // Subtle cursor halo
                if (state.current.mx > -100) {
                    const g = ctx.createRadialGradient(mx, my, 0, mx, my, bulgeRadius);
                    g.addColorStop(0, 'hsla(22, 95%, 60%, 0.18)');
                    g.addColorStop(1, 'hsla(22, 95%, 60%, 0)');
                    ctx.fillStyle = g;
                    ctx.fillRect(0, 0, cw, ch);
                }
            };
            raf = requestAnimationFrame(render);
        };

        return () => {
            disposed = true;
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('pointermove', onMove);
            canvas.removeEventListener('pointerleave', onLeave);
        };
    }, []);

    state.current.progress = progress;
    state.current.active = active;
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export const V07FisheyeDots = () => (
    <VariantShell
        index={7}
        title="Fisheye Dot Matrix"
        technique="Canvas 2D · Lens displacement field"
        hint="hover to bulge the matrix · scroll to intensify lens"
        accent="primary"
    >
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V07FisheyeDots;

