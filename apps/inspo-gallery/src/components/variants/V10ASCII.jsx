// V10ASCII.jsx — logo rendered as ASCII characters; cursor scrambles nearby glyphs
import { useEffect, useRef } from 'react';
import VariantShell from '@/components/variants/VariantShell';

const LOGO = import.meta.env.BASE_URL + 'logos/ds2-a.png';
const CHARS = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@', 'D', 'S', '2', 'X', 'O'];

const Scene = ({ progress, active }) => {
    const canvasRef = useRef(null);
    const state = useRef({ mx: -9999, my: -9999, progress: 0, t: 0, grid: null });

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
            const s = document.createElement('canvas');
            s.width = 400;
            s.height = Math.round(400 / (img.width / img.height));
            s.getContext('2d').drawImage(img, 0, 0, s.width, s.height);
            const data = s.getContext('2d').getImageData(0, 0, s.width, s.height).data;
            state.current.grid = { s, data };
            start();
        };
        img.src = LOGO;

        const onMove = (e) => {
            const r = canvas.getBoundingClientRect();
            state.current.mx = e.clientX - r.left;
            state.current.my = e.clientY - r.top;
        };
        const onLeave = () => { state.current.mx = -9999; state.current.my = -9999; };
        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mouseleave', onLeave);

        const start = () => {
            const render = () => {
                raf = requestAnimationFrame(render);
                if (!state.current.active) return;
                state.current.t += 0.016;
                const t = state.current.t;
                const dpr = Math.min(2, window.devicePixelRatio || 1);
                const cw = canvas.width, ch = canvas.height;
                ctx.fillStyle = 'rgba(7,9,15,0.28)';
                ctx.fillRect(0, 0, cw, ch);

                const { s, data } = state.current.grid;
                const ratio = s.width / s.height;
                // Character grid sizing
                const fitH = ch * 0.7;
                const fitW = fitH * ratio;
                const COLS = 120;
                const ROWS = Math.round(COLS / ratio * 0.55);
                const cellW = fitW / COLS;
                const cellH = fitH / ROWS;
                const ox = (cw - fitW) / 2;
                const oy = (ch - fitH) / 2;

                const mx = state.current.mx * dpr;
                const my = state.current.my * dpr;
                const prog = state.current.progress;
                const fontPx = Math.max(10, cellH * 0.95);
                ctx.font = `700 ${fontPx}px "JetBrains Mono", monospace`;
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';

                for (let j = 0; j < ROWS; j++) {
                    for (let i = 0; i < COLS; i++) {
                        const u = Math.floor((i / COLS) * s.width);
                        const v = Math.floor((j / ROWS) * s.height);
                        const idx = (v * s.width + u) * 4;
                        const br = (data[idx] + data[idx + 1] + data[idx + 2]) / (3 * 255);
                        if (br < 0.05) continue;

                        const cx = ox + i * cellW + cellW / 2;
                        const cy = oy + j * cellH + cellH / 2;
                        // distance from cursor
                        const dd = Math.sqrt((cx - mx) ** 2 + (cy - my) ** 2);
                        const near = Math.max(0, 1 - dd / (240 * dpr));
                        // glyph index driven by brightness, cursor and time noise
                        const noise = (Math.sin(i * 0.3 + j * 0.2 + t * 2.6 + near * 18) + 1) * 0.5;
                        let g = Math.floor(br * (CHARS.length - 1));
                        if (near > 0.2) g = Math.floor(noise * (CHARS.length - 1));
                        // scroll also scrambles
                        if (prog > 0.05 && Math.random() < prog * 0.3) g = Math.floor(Math.random() * CHARS.length);

                        const ch2 = CHARS[g];
                        const hue = near > 0.2 ? 22 : (br > 0.6 ? 36 : 175);
                        const sat = near > 0.2 ? 95 : br > 0.6 ? 30 : 40;
                        const light = 20 + br * 60 + near * 30;
                        ctx.fillStyle = `hsla(${hue},${sat}%,${light}%,${0.35 + br * 0.7})`;
                        ctx.fillText(ch2, cx, cy);
                    }
                }

                // cursor aura
                if (state.current.mx > -100) {
                    const g = ctx.createRadialGradient(mx, my, 0, mx, my, 240 * dpr);
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
            canvas.removeEventListener('mousemove', onMove);
            canvas.removeEventListener('mouseleave', onLeave);
        };
    }, []);

    state.current.progress = progress;
    state.current.active = active;
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export const V10ASCII = () => (
    <VariantShell
        index={10}
        title="ASCII Character Rain"
        technique="Canvas 2D · Monospaced glyph sampling"
        hint="hover to scramble glyphs · scroll to randomize"
        accent="secondary"
    >
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V10ASCII;
