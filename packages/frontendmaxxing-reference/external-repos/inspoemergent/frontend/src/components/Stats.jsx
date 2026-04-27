import { useEffect, useRef, useState } from 'react';

const STATS = [
    { v: 142, suffix: '+', label: 'Projects shipped', sub: 'across 14 countries' },
    { v: 38, suffix: 'M', label: 'Views generated', sub: 'on launch films & reels' },
    { v: 26, suffix: '', label: 'Industry awards', sub: 'Awwwards · FWA · Cannes' },
    { v: 11, suffix: 'YR', label: 'Studio practice', sub: 'est. 2018 · LA + Berlin' },
];

const Counter = ({ to, suffix }) => {
    const [val, setVal] = useState(0);
    const ref = useRef(null);
    const startedRef = useRef(false);
    useEffect(() => {
        if (!ref.current) return;
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !startedRef.current) {
                        startedRef.current = true;
                        const duration = 1800;
                        const start = performance.now();
                        const tick = () => {
                            const elapsed = performance.now() - start;
                            const p = Math.min(1, elapsed / duration);
                            const eased = 1 - Math.pow(1 - p, 3);
                            setVal(Math.floor(to * eased));
                            if (p < 1) requestAnimationFrame(tick);
                            else setVal(to);
                        };
                        requestAnimationFrame(tick);
                    }
                });
            },
            { threshold: 0.5 }
        );
        obs.observe(ref.current);
        return () => obs.disconnect();
    }, [to]);
    return (
        <span ref={ref}>
            {val}
            {suffix}
        </span>
    );
};

export const Stats = () => {
    return (
        <section
            id="stats"
            className="relative py-24 sm:py-32 px-5 sm:px-8 border-t border-border/50"
        >
            <div className="max-w-[1480px] mx-auto">
                <div className="flex flex-col gap-3 mb-14 sm:mb-20">
                    <div className="font-mono text-[11px] uppercase tracking-[0.4em] text-primary flex items-center gap-3">
                        <span className="h-px w-8 bg-primary" />
                        Studio Numbers — As of 2026
                    </div>
                    <h2 className="font-grotesk text-4xl sm:text-5xl lg:text-6xl tracking-tight text-foreground max-w-3xl leading-tight">
                        Receipts. <span className="text-muted-foreground">A decade of cinematic work, in numbers.</span>
                    </h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border/60 rounded-3xl overflow-hidden">
                    {STATS.map((s, i) => (
                        <div
                            key={i}
                            className="relative group bg-background/80 p-7 sm:p-10 flex flex-col gap-4 hover:bg-card transition-colors duration-500 min-h-[260px]"
                        >
                            <div
                                className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            />
                            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                                {String(i + 1).padStart(2, '0')}
                            </div>
                            <div className="font-display text-7xl sm:text-8xl lg:text-9xl text-foreground leading-none tracking-tight">
                                <Counter to={s.v} suffix={s.suffix} />
                            </div>
                            <div className="mt-auto flex flex-col gap-1">
                                <div className="text-base text-foreground">{s.label}</div>
                                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                                    {s.sub}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;
