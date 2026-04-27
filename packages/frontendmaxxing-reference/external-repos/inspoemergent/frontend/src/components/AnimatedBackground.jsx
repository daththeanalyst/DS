import { useEffect, useRef } from 'react';

// Kinetic background: drifting starfield + fog wisps that respond to scroll velocity
export const AnimatedBackground = () => {
    const canvasRef = useRef(null);
    const rafRef = useRef(0);
    const stateRef = useRef({
        stars: [],
        wisps: [],
        scrollVelocity: 0,
        lastScroll: 0,
        time: 0,
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let dpr = Math.min(window.devicePixelRatio || 1, 2);

        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            seed();
        };

        const seed = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const count = Math.min(180, Math.floor((w * h) / 12000));
            stateRef.current.stars = Array.from({ length: count }).map(() => ({
                x: Math.random() * w,
                y: Math.random() * h,
                z: Math.random() * 1 + 0.2, // depth
                r: Math.random() * 1.4 + 0.2,
                tw: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.15 + 0.05,
            }));
            // Fog wisps
            stateRef.current.wisps = Array.from({ length: 6 }).map(() => ({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 360 + 240,
                hue: Math.random() > 0.5 ? 22 : 175,
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.1,
            }));
        };

        const onScroll = () => {
            const dy = window.scrollY - stateRef.current.lastScroll;
            stateRef.current.scrollVelocity = dy;
            stateRef.current.lastScroll = window.scrollY;
        };

        const draw = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const s = stateRef.current;
            s.time += 0.016;
            s.scrollVelocity *= 0.92;

            // Background gradient
            ctx.clearRect(0, 0, w, h);
            const grad = ctx.createRadialGradient(w * 0.5, h * 0.3, 50, w * 0.5, h * 0.5, Math.max(w, h));
            grad.addColorStop(0, 'hsl(225, 35%, 6%)');
            grad.addColorStop(1, 'hsl(225, 40%, 2%)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Fog wisps
            ctx.globalCompositeOperation = 'lighter';
            for (const wisp of s.wisps) {
                wisp.x += wisp.vx + s.scrollVelocity * 0.0006 * (wisp.hue === 22 ? 1 : -1);
                wisp.y += wisp.vy + s.scrollVelocity * 0.001;
                if (wisp.x < -wisp.r) wisp.x = w + wisp.r;
                if (wisp.x > w + wisp.r) wisp.x = -wisp.r;
                if (wisp.y < -wisp.r) wisp.y = h + wisp.r;
                if (wisp.y > h + wisp.r) wisp.y = -wisp.r;
                const g = ctx.createRadialGradient(wisp.x, wisp.y, 0, wisp.x, wisp.y, wisp.r);
                g.addColorStop(0, `hsl(${wisp.hue}, 80%, 50%, 0.10)`);
                g.addColorStop(0.5, `hsl(${wisp.hue}, 80%, 50%, 0.04)`);
                g.addColorStop(1, `hsl(${wisp.hue}, 80%, 50%, 0)`);
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(wisp.x, wisp.y, wisp.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalCompositeOperation = 'source-over';

            // Stars
            for (const star of s.stars) {
                star.x += star.speed * star.z + s.scrollVelocity * 0.005 * star.z;
                star.y += s.scrollVelocity * 0.02 * star.z;
                star.tw += 0.03;
                if (star.x > w + 5) star.x = -5;
                if (star.x < -5) star.x = w + 5;
                if (star.y > h + 5) star.y = -5;
                if (star.y < -5) star.y = h + 5;
                const tw = (Math.sin(star.tw) + 1) * 0.5;
                const alpha = 0.25 + tw * 0.55 * star.z;
                ctx.fillStyle = `hsl(36, 30%, 96%, ${alpha})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.r * star.z, 0, Math.PI * 2);
                ctx.fill();
                if (star.r > 1) {
                    ctx.fillStyle = `hsl(22, 95%, 65%, ${alpha * 0.5})`;
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.r * star.z * 2.2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Vignette
            const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.4, w / 2, h / 2, Math.max(w, h) * 0.7);
            vg.addColorStop(0, 'hsl(0, 0%, 0%, 0)');
            vg.addColorStop(1, 'hsl(0, 0%, 0%, 0.55)');
            ctx.fillStyle = vg;
            ctx.fillRect(0, 0, w, h);

            rafRef.current = requestAnimationFrame(draw);
        };

        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('scroll', onScroll, { passive: true });
        rafRef.current = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none"
            aria-hidden
        />
    );
};

export default AnimatedBackground;
