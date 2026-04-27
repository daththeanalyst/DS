// V20NeonRain.jsx — Cyberpunk DS2: neon outline of the logo pulses with breathing
// glow; inside the strokes, vertical streams of binary characters cascade down.
import { useEffect, useRef } from 'react';
import VariantShell from '@/components/variants/VariantShell';
import { sampleLogo } from '@/lib/logoSampler';

import logoImg from '@/assets/logo-outline.png';
const LOGO = logoImg;
const RAIN_CHARS = '01010101▌▎│┃║▒▓░Ξ※◤◣◢◥█';

const Scene = ({ progress, active }) => {
    const canvasRef = useRef(null);
    const state = useRef({ mx: -9999, my: -9999, t: 0, progress: 0, active: false });
    const dataRef = useRef({ sample: null, edgePts: null, rainStreams: null });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let disposed = false, raf;

        const resize = () => {
            const { clientWidth: w, clientHeight: h } = canvas;
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            canvas.width = w * dpr;
            canvas.height = h * dpr;
        };
        resize();
        window.addEventListener('resize', resize);

        const onMove = (e) => {
            const r = canvas.getBoundingClientRect();
            state.current.mx = e.clientX - r.left;
            state.current.my = e.clientY - r.top;
        };
        const onLeave = () => { state.current.mx = -9999; state.current.my = -9999; };
        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mouseleave', onLeave);

        sampleLogo(LOGO, { step: 1, threshold: 130, targetWidth: 280 }).then((s) => {
            if (disposed) return;
            // Build edge map via Sobel-ish neighbour comparison
            const W = s.width, H = s.height;
            const edges = new Uint8Array(W * H);
            for (let y = 1; y < H - 1; y++) {
                for (let x = 1; x < W - 1; x++) {
                    const c = s.brightness[y * W + x];
                    if (!c) continue;
                    // any neighbour off → edge
                    const off = !s.brightness[(y - 1) * W + x] || !s.brightness[(y + 1) * W + x]
                        || !s.brightness[y * W + (x - 1)] || !s.brightness[y * W + (x + 1)];
                    if (off) edges[y * W + x] = 1;
                }
            }
            // Sample edge pixel positions
            const edgePts = [];
            for (let y = 0; y < H; y += 1) {
                for (let x = 0; x < W; x += 1) {
                    if (edges[y * W + x]) {
                        edgePts.push((x / (W - 1)) - 0.5);
                        edgePts.push(0.5 - (y / (H - 1)) / s.aspect);
                    }
                }
            }

            // Build rain streams — for each column inside the logo silhouette
            const COL_STEP = 4;
            const streams = [];
            for (let x = 0; x < W; x += COL_STEP) {
                let topY = -1, botY = -1;
                for (let y = 0; y < H; y++) {
                    if (s.brightness[y * W + x]) {
                        if (topY < 0) topY = y;
                        botY = y;
                    }
                }
                if (topY > 0) {
                    const topNorm = topY / (H - 1);
                    const botNorm = botY / (H - 1);
                    streams.push({
                        u: x / (W - 1),                 // column position 0..1
                        topV: topNorm,                   // top of letter at this column
                        botV: botNorm,                   // bottom of letter
                        offset: Math.random(),           // start phase
                        speed: 0.08 + Math.random() * 0.18, // fall speed
                    });
                }
            }

            dataRef.current = {
                sample: s,
                edgePts: new Float32Array(edgePts),
                rainStreams: streams,
            };
            start();
        });

        const start = () => {
            const render = () => {
                raf = requestAnimationFrame(render);
                if (!state.current.active) return;
                state.current.t += 0.016;
                const t = state.current.t;
                const dpr = Math.min(2, window.devicePixelRatio || 1);
                const cw = canvas.width, ch = canvas.height;
                // Trail-fade background
                ctx.fillStyle = 'rgba(2, 4, 10, 0.32)';
                ctx.fillRect(0, 0, cw, ch);

                const data = dataRef.current;
                if (!data.sample) return;
                const { sample: s, edgePts, rainStreams } = data;

                const fitW = cw * 0.7;
                const fitH = fitW / s.aspect;
                const ox = cw / 2;
                const oy = ch / 2;

                const mx = state.current.mx * dpr;
                const my = state.current.my * dpr;
                const cursorOn = state.current.mx > -100;
                const prog = state.current.progress;

                // 1) Digital rain — falling characters inside the silhouette
                const baseFontPx = 12 * dpr;
                ctx.font = `700 ${baseFontPx}px "JetBrains Mono", monospace`;
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                const tail = 22; // tail length in chars
                for (let i = 0; i < rainStreams.length; i++) {
                    const sm = rainStreams[i];
                    const xPx = ox + (sm.u - 0.5) * fitW;
                    const topPx = oy + (sm.topV - 0.5) * fitH;
                    const botPx = oy + (sm.botV - 0.5) * fitH;
                    const colH = botPx - topPx;
                    const phase = (t * sm.speed + sm.offset) % 1.0;
                    const headY = topPx + phase * (colH + baseFontPx * tail);

                    for (let k = 0; k < tail; k++) {
                        const y = headY - k * baseFontPx;
                        if (y < topPx || y > botPx) continue;
                        const a = (1 - k / tail) ** 1.6;
                        const ch2 = RAIN_CHARS[(Math.floor(t * 18 + i + k) | 0) % RAIN_CHARS.length];
                        const head = k === 0;
                        const hue = head ? 168 : 22;
                        const lit = head ? 80 : 50;
                        ctx.fillStyle = `hsla(${hue}, 95%, ${lit}%, ${0.25 + a * 0.85})`;
                        ctx.fillText(ch2, xPx, y);
                    }
                }

                // 2) Neon edge outline — pulsing breathing glow
                const breath = 0.55 + 0.45 * Math.sin(t * 1.6);
                const glowSize = (12 + breath * 12) * dpr;
                ctx.save();
                ctx.shadowColor = 'hsla(22, 95%, 60%, 0.95)';
                ctx.shadowBlur = glowSize;
                ctx.fillStyle = `hsla(22, 95%, ${65 + breath * 10}%, 0.95)`;
                const dotR = (1.4 + breath * 0.8) * dpr;
                for (let i = 0; i < edgePts.length; i += 2) {
                    const x = ox + edgePts[i] * fitW;
                    const y = oy - edgePts[i + 1] * fitW;
                    const dCur = cursorOn ? Math.hypot(x - mx, y - my) : 9999;
                    const near = cursorOn ? Math.max(0, 1 - dCur / (220 * dpr)) : 0;
                    const r = dotR + near * 1.6 * dpr;
                    if (near > 0.3) {
                        ctx.fillStyle = `hsla(0, 95%, 70%, 0.95)`;
                    } else {
                        ctx.fillStyle = `hsla(22, 95%, ${60 + breath * 12}%, 0.9)`;
                    }
                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();

                // 3) Outer rim glow
                ctx.save();
                ctx.shadowColor = 'hsla(22, 95%, 60%, 0.85)';
                ctx.shadowBlur = 28 * dpr;
                ctx.strokeStyle = `hsla(22, 95%, ${50 + breath * 18}%, 0.18)`;
                ctx.lineWidth = 2 * dpr;
                ctx.strokeRect(ox - fitW / 2 - 6 * dpr, oy - fitH / 2 - 6 * dpr, fitW + 12 * dpr, fitH + 12 * dpr);
                ctx.restore();

                // 4) Scanline overlay
                ctx.save();
                ctx.globalAlpha = 0.16 + prog * 0.1;
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                for (let y = 0; y < ch; y += 3 * dpr) {
                    ctx.fillRect(0, y, cw, 1 * dpr);
                }
                ctx.restore();

                // 5) Cursor ring
                if (cursorOn) {
                    ctx.strokeStyle = 'hsla(0, 95%, 70%, 0.6)';
                    ctx.lineWidth = 1.5 * dpr;
                    ctx.beginPath();
                    ctx.arc(mx, my, 220 * dpr, 0, Math.PI * 2);
                    ctx.stroke();
                }

                // 6) Corner CRT chroma fringe
                ctx.save();
                const fringe = ctx.createRadialGradient(cw / 2, ch / 2, ch * 0.4, cw / 2, ch / 2, ch * 0.9);
                fringe.addColorStop(0, 'rgba(0,0,0,0)');
                fringe.addColorStop(1, 'rgba(2, 4, 10, 0.55)');
                ctx.fillStyle = fringe;
                ctx.fillRect(0, 0, cw, ch);
                ctx.restore();
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

export const V20NeonRain = () => (
    <VariantShell scrollable={true}
        index={20}
        title="Neon Wire · Digital Rain"
        technique="Canvas 2D · Edge detection · Falling glyph streams · Pulse glow"
        hint="hover the wireframe · the rain only falls inside the strokes"
        accent="primary"
    >
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V20NeonRain;

V20NeonRain.isTall = true;
