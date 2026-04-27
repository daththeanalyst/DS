// V19SpectrumBars.jsx — DS2 reconstructed from vertical "audio" frequency bars.
// Bars dance to a layered sine signal; cursor drops a "bass" wave that propagates.
import { useEffect, useRef } from 'react';
import VariantShell from '@/components/variants/VariantShell';
import { sampleLogo } from '@/lib/logoSampler';

const LOGO = import.meta.env.BASE_URL + 'logos/ds2-a.png';

const Scene = ({ progress, active }) => {
    const canvasRef = useRef(null);
    const state = useRef({ mx: -9999, my: -9999, drops: [], t: 0, progress: 0, active: false, sample: null });

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
        const onClick = (e) => {
            const r = canvas.getBoundingClientRect();
            state.current.drops.push({
                x: e.clientX - r.left,
                t: 0,
            });
            if (state.current.drops.length > 5) state.current.drops.shift();
        };
        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mouseleave', onLeave);
        canvas.addEventListener('click', onClick);

        sampleLogo(LOGO, { step: 1, threshold: 130, targetWidth: 600 }).then((s) => {
            if (disposed) return;
            // Build per-column max-height profile from logo brightness
            const COLS = 220;
            const colHeights = new Float32Array(COLS);
            const colTop = new Float32Array(COLS);
            const colBottom = new Float32Array(COLS);
            for (let c = 0; c < COLS; c++) {
                const u = c / (COLS - 1);
                let topY = -1, botY = -1;
                let maxBr = 0;
                for (let y = 0; y < s.height; y++) {
                    const x = Math.floor(u * (s.width - 1));
                    const v = y / (s.height - 1);
                    const br = s.brightness[y * s.width + x];
                    if (br) {
                        if (topY < 0) topY = v;
                        botY = v;
                        if (br > maxBr) maxBr = br;
                    }
                }
                colHeights[c] = maxBr / 255;
                colTop[c] = topY < 0 ? 0.5 : topY;
                colBottom[c] = botY < 0 ? 0.5 : botY;
            }
            state.current.sample = { COLS, colHeights, colTop, colBottom, aspect: s.aspect };
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
                ctx.fillStyle = 'rgba(7,9,15,0.32)';
                ctx.fillRect(0, 0, cw, ch);

                const samp = state.current.sample;
                if (!samp) return;
                const { COLS, colHeights, colTop, colBottom, aspect } = samp;

                const fitW = cw * 0.78;
                const fitH = fitW / aspect;
                const ox = (cw - fitW) / 2;
                const oy = (ch - fitH) / 2;
                const stepX = fitW / COLS;
                const barW = stepX * 0.7;

                const mx = state.current.mx * dpr;
                const cursorOn = state.current.mx > -100;
                const prog = state.current.progress;

                // process drops
                state.current.drops.forEach((d) => { d.t += 1; });
                state.current.drops = state.current.drops.filter((d) => d.t < 200);

                ctx.lineCap = 'round';
                for (let c = 0; c < COLS; c++) {
                    const u = c / (COLS - 1);
                    const x = ox + c * stepX + stepX / 2;
                    const baseHeight = colHeights[c];
                    if (baseHeight < 0.05) continue;
                    // Letter top/bottom in canvas space
                    const lTop = oy + colTop[c] * fitH;
                    const lBot = oy + colBottom[c] * fitH;
                    const lMid = (lTop + lBot) / 2;
                    const lH = lBot - lTop;

                    // Audio amplitude signal (multiple sines)
                    const a1 = Math.sin(t * 4.0 + c * 0.18) * 0.5;
                    const a2 = Math.sin(t * 2.5 - c * 0.07) * 0.35;
                    const a3 = Math.sin(t * 6.7 + c * 0.04) * 0.2;
                    let amp = 0.4 + a1 * 0.3 + a2 * 0.25 + a3 * 0.18;
                    amp = Math.max(0.15, amp);

                    // Cursor proximity boost
                    if (cursorOn) {
                        const dx = (x - mx) / cw;
                        amp += Math.max(0, 1 - Math.abs(dx) * 6) * 0.55;
                    }
                    // Drop wave — propagates outward from each drop's x
                    let dropAmp = 0;
                    for (let k = 0; k < state.current.drops.length; k++) {
                        const d = state.current.drops[k];
                        const dpx = d.x * dpr;
                        const dx = Math.abs(x - dpx);
                        const wavefront = d.t * 4 * dpr;
                        const dist = Math.abs(dx - wavefront);
                        if (dist < 80 * dpr) {
                            dropAmp += (1 - dist / (80 * dpr)) * Math.exp(-d.t * 0.025) * 0.9;
                        }
                    }
                    amp += dropAmp;
                    amp *= 0.6 + prog * 0.8;

                    // Bar grows from middle up + down
                    const halfH = (lH * 0.55 + amp * lH * 0.95);
                    const barTop = Math.max(oy + 6 * dpr, lMid - halfH);
                    const barBot = Math.min(oy + fitH - 6 * dpr, lMid + halfH);

                    // Color gradient — frequency-style
                    const huePos = c / (COLS - 1);
                    const hue = 22 + huePos * 170 + amp * 30;
                    const sat = 90 - amp * 10;
                    const light = 50 + amp * 25;
                    const grad = ctx.createLinearGradient(0, barTop, 0, barBot);
                    grad.addColorStop(0, `hsla(${hue}, ${sat}%, ${light + 15}%, 0.95)`);
                    grad.addColorStop(0.5, `hsla(${hue + 15}, ${sat}%, ${light}%, 0.95)`);
                    grad.addColorStop(1, `hsla(${hue + 30}, ${sat}%, ${light - 10}%, 0.95)`);
                    ctx.fillStyle = grad;
                    // Rounded rect bar
                    const r = barW * 0.45;
                    ctx.beginPath();
                    ctx.moveTo(x - barW / 2 + r, barTop);
                    ctx.lineTo(x + barW / 2 - r, barTop);
                    ctx.quadraticCurveTo(x + barW / 2, barTop, x + barW / 2, barTop + r);
                    ctx.lineTo(x + barW / 2, barBot - r);
                    ctx.quadraticCurveTo(x + barW / 2, barBot, x + barW / 2 - r, barBot);
                    ctx.lineTo(x - barW / 2 + r, barBot);
                    ctx.quadraticCurveTo(x - barW / 2, barBot, x - barW / 2, barBot - r);
                    ctx.lineTo(x - barW / 2, barTop + r);
                    ctx.quadraticCurveTo(x - barW / 2, barTop, x - barW / 2 + r, barTop);
                    ctx.closePath();
                    ctx.fill();

                    // Glow for top edge
                    ctx.fillStyle = `hsla(${hue + 20}, 95%, 80%, 0.45)`;
                    ctx.fillRect(x - barW / 2, barTop, barW, 2 * dpr);
                }

                // Reflection at the bottom — subtle mirrored gradient
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.globalAlpha = 0.18;
                ctx.translate(0, oy + fitH * 1.95);
                ctx.scale(1, -0.4);
                ctx.translate(0, -(oy + fitH));
                ctx.drawImage(canvas, 0, 0);
                ctx.restore();

                // Cursor beam (vertical line)
                if (cursorOn) {
                    const grd = ctx.createLinearGradient(mx - 30 * dpr, 0, mx + 30 * dpr, 0);
                    grd.addColorStop(0, 'hsla(22, 95%, 60%, 0)');
                    grd.addColorStop(0.5, 'hsla(22, 95%, 60%, 0.4)');
                    grd.addColorStop(1, 'hsla(22, 95%, 60%, 0)');
                    ctx.fillStyle = grd;
                    ctx.fillRect(mx - 30 * dpr, 0, 60 * dpr, ch);
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
            canvas.removeEventListener('click', onClick);
        };
    }, []);

    state.current.progress = progress;
    state.current.active = active;
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export const V19SpectrumBars = () => (
    <VariantShell
        index={19}
        title="Spectrum Bars"
        technique="Canvas 2D · Per-column bar grid · Layered sine drive · Click bass drop"
        hint="hover for a beam · click to drop a bass wave"
    >
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V19SpectrumBars;
