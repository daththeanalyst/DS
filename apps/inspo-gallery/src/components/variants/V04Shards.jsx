// V04Shards.jsx — logo broken into rectangular shards that shatter around the cursor
import { useEffect, useRef } from 'react';
import VariantShell from '@/components/variants/VariantShell';

const LOGO = import.meta.env.BASE_URL + 'logos/ds2-a.png';

const Scene = ({ progress, active }) => {
    const canvasRef = useRef(null);
    const state = useRef({ mx: -9999, my: -9999, progress: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let disposed = false, raf, shards = [], logoCanvas = null;
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
            logoCanvas = document.createElement('canvas');
            logoCanvas.width = img.width;
            logoCanvas.height = img.height;
            logoCanvas.getContext('2d').drawImage(img, 0, 0);

            // Build shard grid from the logo
            const COLS = 26;
            const ROWS = 14;
            const sw = img.width / COLS;
            const sh = img.height / ROWS;
            shards = [];
            for (let j = 0; j < ROWS; j++) {
                for (let i = 0; i < COLS; i++) {
                    shards.push({
                        sx: i * sw,
                        sy: j * sh,
                        sw,
                        sh,
                        ox: i / COLS - 0.5,
                        oy: j / ROWS - 0.5,
                        rot: 0,
                        rotV: (Math.random() - 0.5) * 0.02,
                        dx: 0,
                        dy: 0,
                        dz: 0, // scale-z "depth"
                    });
                }
            }

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
                const dpr = Math.min(2, window.devicePixelRatio || 1);
                const cw = canvas.width, ch = canvas.height;
                ctx.clearRect(0, 0, cw, ch);

                const ratio = img.width / img.height;
                const fitH = ch * 0.55;
                const fitW = fitH * ratio;
                const baseX = cw / 2;
                const baseY = ch / 2;
                const cellW = fitW / 26;
                const cellH = fitH / 14;

                const mx = state.current.mx * dpr;
                const my = state.current.my * dpr;
                const prog = state.current.progress;
                // scroll: 0 = whole, 1 = exploded outward
                const shatter = Math.pow(prog, 1.4);

                for (const s of shards) {
                    const tx = baseX + s.ox * fitW;
                    const ty = baseY + s.oy * fitH;
                    // cursor repulsion
                    const cdx = tx - mx;
                    const cdy = ty - my;
                    const cd = Math.sqrt(cdx * cdx + cdy * cdy);
                    const nearForce = Math.exp(-cd / (180 * dpr));
                    const targetDx = (cdx / (cd + 1)) * nearForce * 90 + s.ox * shatter * 480;
                    const targetDy = (cdy / (cd + 1)) * nearForce * 90 + s.oy * shatter * 240;
                    const targetRot = nearForce * 0.6 * Math.sign(cdx * cdy) + shatter * (s.ox + s.oy) * 1.2;
                    const targetZ = nearForce * 1.4 + shatter * 1.2;

                    s.dx += (targetDx - s.dx) * 0.1;
                    s.dy += (targetDy - s.dy) * 0.1;
                    s.rot += (targetRot - s.rot) * 0.08;
                    s.dz += (targetZ - s.dz) * 0.08;

                    const scale = 1 + s.dz * 0.15;
                    const alpha = Math.max(0, 1 - shatter * 0.3 - nearForce * 0.1);

                    ctx.save();
                    ctx.translate(tx + s.dx, ty + s.dy);
                    ctx.rotate(s.rot);
                    ctx.scale(scale, scale);
                    ctx.globalAlpha = alpha;
                    ctx.drawImage(
                        logoCanvas,
                        s.sx, s.sy, s.sw, s.sh,
                        -cellW / 2, -cellH / 2, cellW + 1, cellH + 1
                    );
                    // edge glow on near shards
                    if (nearForce > 0.2) {
                        ctx.strokeStyle = `hsla(22, 95%, 60%, ${nearForce * 0.7})`;
                        ctx.lineWidth = 1 * dpr;
                        ctx.strokeRect(-cellW / 2, -cellH / 2, cellW, cellH);
                    }
                    ctx.restore();
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

export const V04Shards = () => (
    <VariantShell
        index={4}
        title="Polygon Shatter"
        technique="Canvas 2D · 26×14 shard lattice · Cursor repulsion"
        hint="hover to fracture · scroll to explode"
    >
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V04Shards;
