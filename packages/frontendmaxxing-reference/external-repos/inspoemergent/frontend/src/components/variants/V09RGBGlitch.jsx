// V09RGBGlitch.jsx — RGB channel split of the logo, cursor-driven chromatic aberration
import { useEffect, useRef } from 'react';
import VariantShell from '@/components/variants/VariantShell';

const LOGO = '/logos/ds2-a.png';

// Build a cached colored channel canvas once
const buildChannel = (img, color) => {
    const cv = document.createElement('canvas');
    cv.width = img.width;
    cv.height = img.height;
    const c = cv.getContext('2d');
    c.drawImage(img, 0, 0);
    c.globalCompositeOperation = 'multiply';
    c.fillStyle = color;
    c.fillRect(0, 0, cv.width, cv.height);
    c.globalCompositeOperation = 'destination-in';
    c.drawImage(img, 0, 0);
    return cv;
};

const Scene = ({ progress, active }) => {
    const canvasRef = useRef(null);
    const state = useRef({ mx: -9999, my: -9999, progress: 0, active: false, t: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let disposed = false, raf;
        let chR = null, chG = null, chB = null;
        const img = new Image();
        img.crossOrigin = 'anonymous';

        const resize = () => {
            const { clientWidth: w, clientHeight: h } = canvas;
            canvas.width = w * Math.min(2, window.devicePixelRatio || 1);
            canvas.height = h * Math.min(2, window.devicePixelRatio || 1);
        };
        resize();
        window.addEventListener('resize', resize);

        img.onload = () => {
            if (disposed) return;
            chR = buildChannel(img, '#ff3a3a');
            chG = buildChannel(img, '#4bff9c');
            chB = buildChannel(img, '#5aa8ff');
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
                ctx.clearRect(0, 0, cw, ch);

                const ratio = img.width / img.height;
                const fitH = ch * 0.55;
                const fitW = fitH * ratio;
                const dx = (cw - fitW) / 2;
                const dy = (ch - fitH) / 2;

                const mx = state.current.mx * dpr;
                const my = state.current.my * dpr;
                const cx = cw / 2, cy = ch / 2;
                const dxCur = state.current.mx > -100 ? (mx - cx) / cw : 0;
                const dyCur = state.current.mx > -100 ? (my - cy) / ch : 0;
                const prog = state.current.progress;
                const baseShift = 6 + prog * 40;
                const cursorShift = state.current.mx > -100 ? 28 : 0;
                const shiftX = dxCur * cursorShift + Math.sin(t * 2.7) * baseShift * 0.2;
                const shiftY = dyCur * cursorShift + Math.cos(t * 2.3) * baseShift * 0.2;

                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.drawImage(chR, dx + shiftX * dpr, dy + shiftY * dpr, fitW, fitH);
                ctx.drawImage(chG, dx - shiftX * 0.2 * dpr, dy + shiftY * 0.2 * dpr, fitW, fitH);
                ctx.drawImage(chB, dx - shiftX * dpr, dy - shiftY * dpr, fitW, fitH);
                ctx.restore();

                // occasional glitch slices
                const glitchProb = 0.05 + prog * 0.4;
                if (Math.random() < glitchProb) {
                    const n = 2 + Math.floor(Math.random() * 4);
                    for (let k = 0; k < n; k++) {
                        const sh = 3 + Math.random() * 22;
                        const sy = Math.random() * ch;
                        const sx = (Math.random() - 0.5) * 90 * (prog + 0.2);
                        ctx.save();
                        ctx.globalCompositeOperation = 'lighter';
                        ctx.drawImage(canvas, 0, sy, cw, sh, sx, sy, cw, sh);
                        ctx.restore();
                    }
                }

                // scanlines
                ctx.save();
                ctx.globalAlpha = 0.18 + prog * 0.12;
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                for (let y = 0; y < ch; y += 3 * dpr) {
                    ctx.fillRect(0, y, cw, 1 * dpr);
                }
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

export const V09RGBGlitch = () => (
    <VariantShell
        index={9}
        title="RGB Chromatic Glitch"
        technique="Canvas 2D · Channel split · Scanline overlay"
        hint="hover to shift channels · scroll to increase glitch"
    >
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V09RGBGlitch;
