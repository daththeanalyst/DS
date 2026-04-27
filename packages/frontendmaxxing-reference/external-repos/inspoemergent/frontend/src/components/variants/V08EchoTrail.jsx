// V08EchoTrail.jsx — logo rendered to a feedback buffer; cursor draws ink trails
// that blend with the logo. Scroll scrubs the trail intensity and direction.
import { useEffect, useRef } from 'react';
import VariantShell from '@/components/variants/VariantShell';

const LOGO = '/logos/ds2-a.png';

const Scene = ({ progress, active }) => {
    const canvasRef = useRef(null);
    const state = useRef({ mx: -9999, my: -9999, lastX: -9999, lastY: -9999, progress: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let disposed = false, raf, logoCanvas = null;

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
        const onLeave = () => {
            state.current.mx = -9999;
            state.current.lastX = -9999;
        };
        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mouseleave', onLeave);

        // offscreen persistence buffer for the trail
        let trailBuf, trailCtx;
        const initBuf = () => {
            trailBuf = document.createElement('canvas');
            trailBuf.width = canvas.width;
            trailBuf.height = canvas.height;
            trailCtx = trailBuf.getContext('2d');
        };

        const start = () => {
            initBuf();
            let t = 0;
            const render = () => {
                t += 0.016;
                const dpr = Math.min(2, window.devicePixelRatio || 1);
                const cw = canvas.width, ch = canvas.height;

                // 1) fade the trail buffer
                trailCtx.globalCompositeOperation = 'destination-out';
                trailCtx.fillStyle = `rgba(0,0,0,${0.04 + state.current.progress * 0.02})`;
                trailCtx.fillRect(0, 0, trailBuf.width, trailBuf.height);
                trailCtx.globalCompositeOperation = 'source-over';

                // 2) draw new ink segment from last cursor
                if (state.current.mx > -100) {
                    const mx = state.current.mx * dpr;
                    const my = state.current.my * dpr;
                    if (state.current.lastX < -100) { state.current.lastX = mx; state.current.lastY = my; }
                    const lx = state.current.lastX;
                    const ly = state.current.lastY;
                    // ember gradient stroke
                    const grd = trailCtx.createLinearGradient(lx, ly, mx, my);
                    grd.addColorStop(0, 'hsla(22, 95%, 60%, 0.75)');
                    grd.addColorStop(1, 'hsla(175, 85%, 60%, 0.75)');
                    trailCtx.strokeStyle = grd;
                    trailCtx.lineCap = 'round';
                    trailCtx.lineWidth = (16 + state.current.progress * 26) * dpr;
                    trailCtx.beginPath();
                    trailCtx.moveTo(lx, ly);
                    trailCtx.lineTo(mx, my);
                    trailCtx.stroke();
                    // glow dot at head
                    const g2 = trailCtx.createRadialGradient(mx, my, 0, mx, my, 60 * dpr);
                    g2.addColorStop(0, 'hsla(22, 95%, 70%, 0.8)');
                    g2.addColorStop(1, 'hsla(22, 95%, 70%, 0)');
                    trailCtx.fillStyle = g2;
                    trailCtx.fillRect(0, 0, trailBuf.width, trailBuf.height);

                    state.current.lastX = mx;
                    state.current.lastY = my;
                }

                // 3) composite to main canvas
                ctx.clearRect(0, 0, cw, ch);

                // a) logo base with "torn" mask using the trail as reveal
                const ratio = img.width / img.height;
                const fitH = ch * 0.55;
                const fitW = fitH * ratio;
                const dx = (cw - fitW) / 2;
                const dy = (ch - fitH) / 2;
                // logo in dim white
                ctx.save();
                ctx.globalAlpha = 0.3 + (1 - Math.abs(state.current.progress - 0.5) * 2) * 0.6;
                ctx.drawImage(logoCanvas, dx, dy, fitW, fitH);
                ctx.restore();
                // b) overlay trail with screen blend so it reveals logo edges brightly
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                ctx.drawImage(trailBuf, 0, 0);
                ctx.restore();
                // c) a subtle logo-tinted version clipped by trail
                ctx.save();
                ctx.globalCompositeOperation = 'source-atop';
                ctx.globalAlpha = 0.7;
                ctx.drawImage(trailBuf, 0, 0);
                ctx.restore();
            };
            raf = requestAnimationFrame(render);
        };

        const onResizeBuf = () => {
            resize();
            if (trailBuf) {
                trailBuf.width = canvas.width;
                trailBuf.height = canvas.height;
            }
        };
        window.addEventListener('resize', onResizeBuf);

        return () => {
            disposed = true;
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
            window.removeEventListener('resize', onResizeBuf);
            canvas.removeEventListener('mousemove', onMove);
            canvas.removeEventListener('mouseleave', onLeave);
        };
    }, []);

    state.current.progress = progress;
    state.current.active = active;
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export const V08EchoTrail = () => (
    <VariantShell
        index={8}
        title="Echo Trail Ink"
        technique="Canvas 2D · Persistence buffer · Gradient stroke"
        hint="drag cursor to paint the logo with light"
        accent="secondary"
    >
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V08EchoTrail;
