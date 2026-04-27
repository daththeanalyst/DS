// V13MagneticField.jsx — Iron filings flow along the gradient of the DS2 brightness
// field (so they curl around the letterforms). Cursor adds a swirl pole.
import { useEffect, useRef } from 'react';
import VariantShell from '@/components/variants/VariantShell';
import { sampleLogo } from '@/lib/logoSampler';

const LOGO = '/logos/ds2-a.png';

const Scene = ({ progress, active }) => {
    const canvasRef = useRef(null);
    const state = useRef({ mx: -9999, my: -9999, t: 0, progress: 0, active: false, sample: null });

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

        // Build a downsampled brightness map for fast gradient lookups
        sampleLogo(LOGO, { step: 1, threshold: 80, targetWidth: 360 }).then((s) => {
            if (disposed) return;
            // Smooth the brightness map with a small box blur (gives smoother gradients)
            const W = s.width, H = s.height;
            const src = new Float32Array(W * H);
            for (let i = 0; i < W * H; i++) src[i] = s.brightness[i] / 255;
            const dst = new Float32Array(W * H);
            const R = 3;
            for (let y = 0; y < H; y++) {
                for (let x = 0; x < W; x++) {
                    let sum = 0, cnt = 0;
                    for (let dy = -R; dy <= R; dy++) {
                        const yy = y + dy;
                        if (yy < 0 || yy >= H) continue;
                        for (let dx = -R; dx <= R; dx++) {
                            const xx = x + dx;
                            if (xx < 0 || xx >= W) continue;
                            sum += src[yy * W + xx];
                            cnt++;
                        }
                    }
                    dst[y * W + x] = sum / cnt;
                }
            }
            state.current.sample = { width: W, height: H, aspect: s.aspect, field: dst };
            start();
        });

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
                ctx.fillStyle = 'rgba(7,9,15,0.22)';
                ctx.fillRect(0, 0, cw, ch);

                const samp = state.current.sample;
                if (!samp) return;
                const { width: SW, height: SH, aspect: SA, field } = samp;

                const fitW = cw * 0.6;
                const fitH = fitW / SA;
                const ox = (cw - fitW) / 2;
                const oy = (ch - fitH) / 2;

                const COLS = 90;
                const ROWS = Math.round(COLS * (ch / cw));
                const stepX = cw / COLS;
                const stepY = ch / ROWS;

                const mx = state.current.mx * dpr;
                const my = state.current.my * dpr;
                const cursorOn = state.current.mx > -100;
                const prog = state.current.progress;

                const fieldAt = (x, y) => {
                    // Map canvas (x,y) into logo image coords
                    const u = (x - ox) / fitW;
                    const v = (y - oy) / fitH;
                    if (u < 0 || u > 1 || v < 0 || v > 1) return 0;
                    const sx = Math.floor(u * (SW - 1));
                    const sy = Math.floor(v * (SH - 1));
                    return field[sy * SW + sx];
                };
                // central difference gradient
                const gradAt = (x, y, h) => {
                    const fx = fieldAt(x + h, y) - fieldAt(x - h, y);
                    const fy = fieldAt(x, y + h) - fieldAt(x, y - h);
                    return [fx, fy];
                };

                ctx.lineCap = 'round';
                const segLen = stepX * (1.0 + prog * 0.5);
                for (let j = 0; j < ROWS; j++) {
                    for (let i = 0; i < COLS; i++) {
                        // jitter to avoid grid look
                        const jx = ((i * 13 + j * 7) % 17) / 17 - 0.5;
                        const jy = ((i * 5 + j * 11) % 13) / 13 - 0.5;
                        const x = i * stepX + stepX / 2 + jx * stepX * 0.6;
                        const y = j * stepY + stepY / 2 + jy * stepY * 0.6;
                        // brightness at this point — used for line opacity/length
                        const br = fieldAt(x, y);
                        const [gx, gy] = gradAt(x, y, stepX * 1.4);
                        // Tangent (perpendicular to gradient) — field lines wrap around letters
                        let dx = -gy;
                        let dy = gx;
                        let mag = Math.sqrt(dx * dx + dy * dy) + 1e-6;
                        dx /= mag; dy /= mag;

                        // Add ambient curl noise so empty areas have flow too
                        const noise = Math.sin(x * 0.012 + y * 0.014 + t * 0.6) * 0.7
                                    + Math.cos(x * 0.018 - y * 0.011 + t * 0.4) * 0.5;
                        // Blend ambient direction with logo gradient
                        const inLogo = mag * 200; // gradient mag is small near edges
                        const w = Math.min(1, inLogo);
                        const ax = Math.cos(noise);
                        const ay = Math.sin(noise);
                        dx = dx * w + ax * (1 - w);
                        dy = dy * w + ay * (1 - w);
                        mag = Math.sqrt(dx * dx + dy * dy) + 1e-6;
                        dx /= mag; dy /= mag;

                        // Cursor swirl (tangential force)
                        let nearC = 0;
                        if (cursorOn) {
                            const ddx = x - mx;
                            const ddy = y - my;
                            const dd2 = ddx * ddx + ddy * ddy;
                            const R = 220 * dpr;
                            if (dd2 < R * R) {
                                const dd = Math.sqrt(dd2) + 1e-6;
                                nearC = 1 - dd / R;
                                // perpendicular vector (swirl)
                                const px = -ddy / dd;
                                const py = ddx / dd;
                                dx = dx * (1 - nearC * 0.85) + px * nearC * 0.85;
                                dy = dy * (1 - nearC * 0.85) + py * nearC * 0.85;
                                mag = Math.sqrt(dx * dx + dy * dy) + 1e-6;
                                dx /= mag; dy /= mag;
                            }
                        }
                        // Length scales with brightness + cursor proximity
                        const L = segLen * (0.55 + br * 0.6 + nearC * 0.4);
                        const ax2 = x - dx * L * 0.5;
                        const ay2 = y - dy * L * 0.5;
                        const bx = x + dx * L * 0.5;
                        const by = y + dy * L * 0.5;
                        // color
                        const inside = br > 0.35;
                        const hue = nearC > 0.25 ? 22 : (inside ? 36 : 195);
                        const sat = nearC > 0.25 ? 95 : (inside ? 30 : 35);
                        const light = inside ? 80 + nearC * 10 : 45 + nearC * 25;
                        const alpha = 0.18 + br * 0.55 + nearC * 0.45;
                        ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
                        ctx.lineWidth = (1 + nearC * 1.4 + br * 0.6) * dpr;
                        ctx.beginPath();
                        ctx.moveTo(ax2, ay2);
                        ctx.lineTo(bx, by);
                        ctx.stroke();
                    }
                }

                // Cursor pole
                if (cursorOn) {
                    const g = ctx.createRadialGradient(mx, my, 0, mx, my, 130 * dpr);
                    g.addColorStop(0, 'hsla(22, 95%, 65%, 0.95)');
                    g.addColorStop(0.5, 'hsla(22, 95%, 60%, 0.22)');
                    g.addColorStop(1, 'hsla(22, 95%, 60%, 0)');
                    ctx.fillStyle = g;
                    ctx.beginPath();
                    ctx.arc(mx, my, 130 * dpr, 0, Math.PI * 2);
                    ctx.fill();
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

export const V13MagneticField = () => (
    <VariantShell
        index={13}
        title="Iron-Filings Field"
        technique="Canvas 2D · Brightness gradient flow · Cursor swirl pole"
        hint="hover to swirl the magnetic field around the logo"
    >
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V13MagneticField;
