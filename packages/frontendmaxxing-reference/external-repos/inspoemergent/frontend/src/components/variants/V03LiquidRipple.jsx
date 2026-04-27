// V03LiquidRipple.jsx — 2D canvas displacement of logo pixels via radial ripples
import { useEffect, useRef } from 'react';
import VariantShell from '@/components/variants/VariantShell';

const LOGO = '/logos/ds2-a.png';

const Scene = ({ progress, active }) => {
    const canvasRef = useRef(null);
    const state = useRef({ mx: -9999, my: -9999, ripples: [], progress: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let disposed = false;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        let logoCanvas = null;
        let raf;

        const resize = () => {
            const { clientWidth: w, clientHeight: h } = canvas;
            canvas.width = w * Math.min(2, window.devicePixelRatio || 1);
            canvas.height = h * Math.min(2, window.devicePixelRatio || 1);
        };
        resize();
        window.addEventListener('resize', resize);

        img.onload = () => {
            if (disposed) return;
            logoCanvas = document.createElement('canvas');
            logoCanvas.width = img.width;
            logoCanvas.height = img.height;
            logoCanvas.getContext('2d').drawImage(img, 0, 0);
            start();
        };
        img.src = LOGO;

        const onMove = (e) => {
            const r = canvas.getBoundingClientRect();
            state.current.mx = e.clientX - r.left;
            state.current.my = e.clientY - r.top;
        };
        const onLeave = () => { state.current.mx = -9999; state.current.my = -9999; };
        const onClick = (e) => {
            const r = canvas.getBoundingClientRect();
            state.current.ripples.push({
                x: e.clientX - r.left,
                y: e.clientY - r.top,
                t: 0,
                amp: 40,
            });
            if (state.current.ripples.length > 6) state.current.ripples.shift();
        };
        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mouseleave', onLeave);
        canvas.addEventListener('click', onClick);

        const start = () => {
            let t = 0;
            const render = () => {
                raf = requestAnimationFrame(render);
                if (!state.current.active) return;
                t += 0.016;
                const dpr = Math.min(2, window.devicePixelRatio || 1);
                const cw = canvas.width;
                const ch = canvas.height;
                ctx.clearRect(0, 0, cw, ch);

                // Fit logo
                const ratio = img.width / img.height;
                const fitH = ch * 0.52;
                const fitW = fitH * ratio;
                const dx = (cw - fitW) / 2;
                const dy = (ch - fitH) / 2;

                // Draw logo with slice-by-slice horizontal displacement based on ripples
                const slices = 80;
                const sh = fitH / slices;
                const srcSh = img.height / slices;
                const mx = state.current.mx * dpr;
                const my = state.current.my * dpr;
                const prog = state.current.progress;
                const ampBase = 8 + prog * 20;

                for (let i = 0; i < slices; i++) {
                    const yDst = dy + i * sh;
                    const yCenter = yDst + sh / 2;
                    // radial distortion from cursor
                    const mdx = mx - cw / 2;
                    const mdy = my - yCenter;
                    const dist = Math.sqrt(mdx * mdx + mdy * mdy);
                    const falloff = Math.exp(-dist / (220 * dpr));
                    const phase = t * 2 + i * 0.35;
                    const rippleShift = Math.sin(phase + prog * 6) * ampBase * falloff;
                    // click ripples
                    let clickShift = 0;
                    for (const r of state.current.ripples) {
                        const cdx = r.x * dpr - cw / 2;
                        const cdy = r.y * dpr - yCenter;
                        const cd = Math.sqrt(cdx * cdx + cdy * cdy);
                        const wave = Math.sin(cd * 0.04 - r.t * 0.18) * r.amp * Math.exp(-cd / 320) * Math.exp(-r.t * 0.02);
                        clickShift += wave;
                    }
                    const shift = rippleShift + clickShift;
                    ctx.drawImage(
                        logoCanvas,
                        0, i * srcSh, img.width, srcSh,
                        dx + shift, yDst, fitW, sh + 1
                    );
                }

                // advance ripples
                state.current.ripples = state.current.ripples.filter((r) => (r.t += 1) < 260);

                // overlay glow near cursor
                if (state.current.mx > -100) {
                    const grd = ctx.createRadialGradient(mx, my, 0, mx, my, 240 * dpr);
                    grd.addColorStop(0, 'hsla(22, 95%, 60%, 0.22)');
                    grd.addColorStop(1, 'hsla(22, 95%, 60%, 0)');
                    ctx.fillStyle = grd;
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
            canvas.removeEventListener('click', onClick);
        };
    }, []);

    state.current.progress = progress;
    state.current.active = active;
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export const V03LiquidRipple = () => (
    <VariantShell
        index={3}
        title="Liquid Ripple Distortion"
        technique="Canvas 2D · Slice-based radial displacement"
        hint="hover to warp · click to drop a wave"
        accent="secondary"
    >
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V03LiquidRipple;
