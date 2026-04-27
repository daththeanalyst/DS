// VariantShell.jsx
// Provides: full-viewport section, scroll progress, in-view detection (lazy mount),
// and labels. Children receive { progress, active, inView }.

import { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from '@/hooks/useScrollProgress';

export const VariantShell = ({
    index,
    title,
    technique,
    children,
    accent = 'primary',
}) => {
    const { ref, progress, active } = useScrollProgress();
    const [hasMounted, setHasMounted] = useState(false);
    const [inView, setInView] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            (entries) => {
                for (const e of entries) {
                    setInView(e.isIntersecting);
                    if (e.isIntersecting) setHasMounted(true);
                }
            },
            { rootMargin: '200px 0px', threshold: 0.01 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // Combine refs
    const setRefs = (node) => {
        sectionRef.current = node;
        ref.current = node;
    };

    const accentClass = accent === 'primary' ? 'text-primary' : 'text-secondary';
    const accentBg = accent === 'primary' ? 'bg-primary' : 'bg-secondary';

    return (
        <section
            ref={setRefs}
            data-testid={`variant-${String(index).padStart(2, '0')}`}
            id={`variant-${String(index).padStart(2, '0')}`}
            className="relative min-h-[100svh] w-full overflow-hidden border-t border-border/30"
        >
            {/* Canvas area — only mounted after first intersection */}
            <div className="absolute inset-0">
                {hasMounted && (typeof children === 'function'
                    ? children({ progress, active, inView })
                    : children)}
                {!hasMounted && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50">
                            preparing canvas…
                        </div>
                    </div>
                )}
            </div>

            {/* Top-left: index + technique */}
            <div className="absolute top-6 left-5 sm:left-8 z-10 flex flex-col gap-2 pointer-events-none">
                <div className="flex items-center gap-3">
                    <span className={`font-mono text-[10px] uppercase tracking-[0.3em] ${accentClass}`}>
                        Variant / {String(index).padStart(2, '0')} of 20
                    </span>
                    <span className={`h-px w-8 ${accentBg}`} />
                </div>
                <h2 className="font-grotesk text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-foreground max-w-md leading-tight">
                    {title}
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {technique}
                </span>
            </div>

            {/* Bottom hint */}
            {hint && (
                <div className="absolute bottom-6 left-5 sm:left-8 z-10 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground pointer-events-none">
                    ↳ {hint}
                </div>
            )}

            {/* Scroll progress bar — right edge */}
            <div className="absolute right-5 sm:right-8 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col items-center gap-2 pointer-events-none">
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                    {Math.round(progress * 100).toString().padStart(2, '0')}
                </span>
                <div className="relative h-40 w-px bg-foreground/15">
                    <div
                        className={`absolute top-0 left-0 right-0 ${accentBg}`}
                        style={{ height: `${progress * 100}%` }}
                    />
                </div>
            </div>
        </section>
    );
};

export default VariantShell;
