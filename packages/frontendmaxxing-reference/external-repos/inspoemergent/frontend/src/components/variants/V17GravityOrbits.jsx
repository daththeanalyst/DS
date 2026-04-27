// V17GravityOrbits.jsx — Hundreds of particles drift through space and get pulled
// into orbits around DS2 letter "gravity wells". Cursor disrupts the field.
import { useEffect, useRef } from 'react';
import VariantShell from '@/components/variants/VariantShell';
import { sampleLogo } from '@/lib/logoSampler';

const LOGO = '/logos/ds2-a.png';

const Scene = ({ progress, active }) => {
    const canvasRef = useRef(null);
    const state = useRef({ mx: -9999, my: -9999, mouseDown: false, t: 0, progress: 0, active: false });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let disposed = false, raf;
        let attractors = [];
        let particles = [];
        let trailBuf = null, trailCtx = null;

        const resize = () => {
            const { clientWidth: w, clientHeight: h } = canvas;
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            if (trailBuf) {
                trailBuf.width = canvas.width;
                trailBuf.height = canvas.height;
            }
        };
        resize();
        window.addEventListener('resize', resize);
        trailBuf = document.createElement('canvas');
        trailBuf.width = canvas.width;
        trailBuf.height = canvas.height;
        trailCtx = trailBuf.getContext('2d');

        const onMove = (e) => {
            const r = canvas.getBoundingClientRect();
            state.current.mx = e.clientX - r.left;
            state.current.my = e.clientY - r.top;
        };
        const onLeave = () => { state.current.mx = -9999; state.current.my = -9999; };
        const onDown = () => { state.current.mouseDown = true; };
        const onUp = () => { state.current.mouseDown = false; };
        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mouseleave', onLeave);
        canvas.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup', onUp);

        sampleLogo(LOGO, { step: 24, threshold: 130, targetWidth: 600 }).then((s) => {
            if (disposed) return;
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            const cw = canvas.width;
            const ch = canvas.height;
            const fitH = ch * 0.5;
            const fitW = fitH * s.aspect;
            const cx = cw / 2;
            const cy = ch / 2;
            // Use sampled points as attractors
            attractors = [];
            for (let i = 0; i < s.count; i++) {
                attractors.push({
                    x: cx + s.positions[i * 2] * fitW,
                    y: cy - s.positions[i * 2 + 1] * fitW,
                    m: 80 + Math.random() * 90,
                });
            }
            // Spawn particles
            const N = 520;
            particles = [];
            for (let i = 0; i < N; i++) {
                const ang = Math.random() * Math.PI * 2;
                const r = Math.random() * cw * 0.55 + cw * 0.25;
                particles.push({
                    x: cx + Math.cos(ang) * r,
                    y: cy + Math.sin(ang) * r,
                    vx: -Math.sin(ang) * (0.4 + Math.random() * 0.4) * dpr,
                    vy: Math.cos(ang) * (0.4 + Math.random() * 0.4) * dpr,
                    life: Math.random() * 2,
                    hue: 22 + Math.random() * 160,
                });
            }
            start();
        });

        const start = () => {
            const render = () => {
                raf = requestAnimationFrame(render);
                if (!state.current.active) return;
                state.current.t += 0.016;
                const dpr = Math.min(2, window.devicePixelRatio || 1);
                const cw = canvas.width, ch = canvas.height;

                // Fade trail buffer
                trailCtx.globalCompositeOperation = 'destination-out';
                trailCtx.fillStyle = 'rgba(0,0,0,0.025)';
                trailCtx.fillRect(0, 0, trailBuf.width, trailBuf.height);
                trailCtx.globalCompositeOperation = 'lighter';

                const mx = state.current.mx * dpr;
                const my = state.current.my * dpr;
                const cursorOn = state.current.mx > -100;
                const repel = state.current.mouseDown ? -1 : 1;
                const cursorMass = cursorOn ? 4500 * repel : 0;
                const prog = state.current.progress;
                const G = 0.035 * (0.6 + prog * 0.6);
                const drag = 0.998;

                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    let ax = 0, ay = 0;
                    // Sum attractor forces
                    for (let k = 0; k < attractors.length; k++) {
                        const a = attractors[k];
                        const dx = a.x - p.x;
                        const dy = a.y - p.y;
                        const d2 = dx * dx + dy * dy + 1500;
                        const f = (a.m * G) / d2;
                        ax += dx * f;
                        ay += dy * f;
                    }
                    // Cursor force
                    if (cursorOn) {
                        const dx = mx - p.x;
                        const dy = my - p.y;
                        const d2 = dx * dx + dy * dy + 800;
                        const f = (cursorMass * G) / d2;
                        ax += dx * f;
                        ay += dy * f;
                    }
                    p.vx = (p.vx + ax) * drag;
                    p.vy = (p.vy + ay) * drag;
                    // Cap velocity
                    const sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                    const maxSp = 6.5 * dpr;
                    if (sp > maxSp) {
                        p.vx *= maxSp / sp;
                        p.vy *= maxSp / sp;
                    }
                    p.x += p.vx;
                    p.y += p.vy;
                    p.life += 0.016;

                    // Wrap around viewport
                    if (p.x < -50) p.x = cw + 50;
                    if (p.x > cw + 50) p.x = -50;
                    if (p.y < -50) p.y = ch + 50;
                    if (p.y > ch + 50) p.y = -50;

                    // Draw to trail buffer
                    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                    const intensity = Math.min(1, speed / (5 * dpr));
                    const alpha = 0.18 + intensity * 0.55;
                    trailCtx.fillStyle = `hsla(${p.hue}, 90%, ${50 + intensity * 30}%, ${alpha})`;
                    trailCtx.beginPath();
                    trailCtx.arc(p.x, p.y, (1.0 + intensity * 1.4) * dpr, 0, Math.PI * 2);
                    trailCtx.fill();
                }

                // Composite trail buffer to main canvas
                ctx.fillStyle = 'rgba(7,9,15,0.7)';
                ctx.fillRect(0, 0, cw, ch);
                ctx.drawImage(trailBuf, 0, 0);

                // Draw attractor glows
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                for (let k = 0; k < attractors.length; k++) {
                    const a = attractors[k];
                    const g = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, 18 * dpr);
                    g.addColorStop(0, 'hsla(36, 95%, 80%, 0.65)');
                    g.addColorStop(1, 'hsla(36, 95%, 80%, 0)');
                    ctx.fillStyle = g;
                    ctx.beginPath();
                    ctx.arc(a.x, a.y, 18 * dpr, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();

                // Cursor influence ring
                if (cursorOn) {
                    ctx.strokeStyle = state.current.mouseDown
                        ? 'hsla(0, 95%, 65%, 0.85)'
                        : 'hsla(22, 95%, 60%, 0.6)';
                    ctx.lineWidth = 1.5 * dpr;
                    ctx.setLineDash([6 * dpr, 6 * dpr]);
                    ctx.beginPath();
                    ctx.arc(mx, my, 80 * dpr, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            };
            raf = requestAnimationFrame(render);
        };

        return () => {
            disposed = true;
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mouseup', onUp);
            canvas.removeEventListener('mousemove', onMove);
            canvas.removeEventListener('mouseleave', onLeave);
            canvas.removeEventListener('mousedown', onDown);
        };
    }, []);

    state.current.progress = progress;
    state.current.active = active;
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export const V17GravityOrbits = () => (
    <VariantShell
        index={17}
        title="Gravity Orbit Dance"
        technique="Canvas 2D · N-body forces · Logo as gravity wells · Persistence trails"
        hint="hover to attract · hold mouse-down to repel"
    >
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V17GravityOrbits;
