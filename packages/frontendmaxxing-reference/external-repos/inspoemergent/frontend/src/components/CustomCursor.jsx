import { useEffect, useRef, useState } from 'react';

export const CustomCursor = () => {
    const dotRef = useRef(null);
    const ringRef = useRef(null);
    const trailRef = useRef(null);
    const [hidden, setHidden] = useState(true);
    const [variant, setVariant] = useState('default');
    const [label, setLabel] = useState('');

    const pos = useRef({ x: 0, y: 0 });
    const ringPos = useRef({ x: 0, y: 0 });
    const trailPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (isMobile) return;

        let raf;
        const onMove = (e) => {
            pos.current.x = e.clientX;
            pos.current.y = e.clientY;
            if (hidden) setHidden(false);
        };
        const onLeave = () => setHidden(true);
        const onEnter = () => setHidden(false);

        const onOver = (e) => {
            const target = e.target;
            if (!target || !target.closest) return;
            const interactive = target.closest('a, button, [role=button], [data-cursor]');
            if (interactive) {
                const cursorType = interactive.getAttribute('data-cursor');
                const cursorLabel = interactive.getAttribute('data-cursor-label') || '';
                setVariant(cursorType || 'hover');
                setLabel(cursorLabel);
            } else {
                setVariant('default');
                setLabel('');
            }
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseover', onOver);
        document.documentElement.addEventListener('mouseleave', onLeave);
        document.documentElement.addEventListener('mouseenter', onEnter);

        const tick = () => {
            // Smooth lerp
            ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.18;
            ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.18;
            trailPos.current.x += (pos.current.x - trailPos.current.x) * 0.08;
            trailPos.current.y += (pos.current.y - trailPos.current.y) * 0.08;

            if (dotRef.current) {
                dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
            }
            if (ringRef.current) {
                ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
            }
            if (trailRef.current) {
                trailRef.current.style.transform = `translate3d(${trailPos.current.x}px, ${trailPos.current.y}px, 0) translate(-50%, -50%)`;
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseover', onOver);
            document.documentElement.removeEventListener('mouseleave', onLeave);
            document.documentElement.removeEventListener('mouseenter', onEnter);
            cancelAnimationFrame(raf);
        };
    }, [hidden]);

    const ringSize = variant === 'hover' ? 70 : variant === 'work' ? 110 : 36;
    const ringBg = variant === 'hover' ? 'hsl(var(--primary) / 0.15)' : variant === 'work' ? 'hsl(var(--secondary) / 0.18)' : 'transparent';
    const ringBorder = variant === 'hover' ? '1px solid hsl(var(--primary))' : variant === 'work' ? '1px solid hsl(var(--secondary))' : '1px solid hsl(var(--foreground) / 0.4)';
    const dotScale = variant === 'hover' || variant === 'work' ? 0 : 1;

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block" aria-hidden>
            {/* Trail (glow) */}
            <div
                ref={trailRef}
                className="absolute top-0 left-0 rounded-full pointer-events-none"
                style={{
                    width: 180,
                    height: 180,
                    background: 'radial-gradient(circle, hsl(var(--primary) / 0.18) 0%, transparent 60%)',
                    filter: 'blur(20px)',
                    opacity: hidden ? 0 : 1,
                    transition: 'opacity 0.3s',
                }}
            />
            {/* Ring */}
            <div
                ref={ringRef}
                className="absolute top-0 left-0 rounded-full backdrop-blur-sm flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-foreground"
                style={{
                    width: ringSize,
                    height: ringSize,
                    background: ringBg,
                    border: ringBorder,
                    opacity: hidden ? 0 : 1,
                    transition: 'width 0.35s var(--ease-out-expo), height 0.35s var(--ease-out-expo), background 0.3s, border 0.3s, opacity 0.3s',
                }}
            >
                {label}
            </div>
            {/* Dot */}
            <div
                ref={dotRef}
                className="absolute top-0 left-0 rounded-full bg-primary"
                style={{
                    width: 6,
                    height: 6,
                    opacity: hidden ? 0 : dotScale,
                    transition: 'opacity 0.3s, transform 0.05s linear',
                    boxShadow: '0 0 12px hsl(var(--primary))',
                }}
            />
        </div>
    );
};

export default CustomCursor;
