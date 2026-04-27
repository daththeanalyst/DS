// VariantNavRail.jsx — sticky right-edge dot rail showing current section
import { useEffect, useState } from 'react';

const ITEMS = Array.from({ length: 20 }, (_, i) => i + 1);

export const VariantNavRail = () => {
    const [active, setActive] = useState(0);

    useEffect(() => {
        const tick = () => {
            const vh = window.innerHeight;
            let bestIndex = 0;
            let bestDist = Infinity;
            ITEMS.forEach((n) => {
                const el = document.querySelector(`[data-testid="variant-${String(n).padStart(2, '0')}"]`);
                if (!el) return;
                const r = el.getBoundingClientRect();
                const center = r.top + r.height / 2;
                const dist = Math.abs(center - vh / 2);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestIndex = n;
                }
            });
            setActive(bestIndex);
        };
        const interval = setInterval(tick, 120);
        return () => clearInterval(interval);
    }, []);

    return (
        <nav
            data-testid="variant-nav-rail"
            className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col gap-3 items-center"
            aria-label="Variant navigation"
        >
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground rotate-180 [writing-mode:vertical-rl] mb-2">
                Variants
            </span>
            {ITEMS.map((n) => (
                <a
                    key={n}
                    href={`#variant-${String(n).padStart(2, '0')}`}
                    onClick={(e) => {
                        e.preventDefault();
                        const el = document.querySelector(`[data-testid="variant-${String(n).padStart(2, '0')}"]`);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    data-cursor="hover"
                    data-testid={`nav-rail-${n}`}
                    className="group relative flex items-center gap-2"
                >
                    <span
                        className={`block h-px transition-all duration-500 ${
                            active === n
                                ? 'w-6 bg-primary'
                                : 'w-3 bg-foreground/30 group-hover:w-5 group-hover:bg-primary/70'
                        }`}
                    />
                    <span
                        className={`font-mono text-[9px] uppercase tracking-[0.25em] transition-opacity ${
                            active === n
                                ? 'opacity-100 text-foreground'
                                : 'opacity-0 group-hover:opacity-60'
                        }`}
                    >
                        {String(n).padStart(2, '0')}
                    </span>
                </a>
            ))}
        </nav>
    );
};

export default VariantNavRail;
