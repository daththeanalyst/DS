import { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

const PROJECTS = [
    {
        title: 'Helix Aurora',
        client: 'Helix Industries',
        category: 'Brand Identity · Motion',
        year: '2026',
        image: 'https://images.unsplash.com/photo-1739056238917-d89cd05c48d5',
        accent: 'ember',
    },
    {
        title: 'Vanta Records',
        client: 'Vanta',
        category: 'Music Visual · WebGL',
        year: '2025',
        image: 'https://images.unsplash.com/photo-1626908013351-800ddd734b8a',
        accent: 'frost',
    },
    {
        title: 'Obelisk Drift',
        client: 'Obelisk Capital',
        category: 'Site Design · 3D',
        year: '2025',
        image: 'https://images.unsplash.com/photo-1659776026027-6b0f66d92675',
        accent: 'ember',
    },
    {
        title: 'Kilowatt OS',
        client: 'Kilowatt',
        category: 'Product UI · Motion',
        year: '2025',
        image: 'https://images.unsplash.com/photo-1710438399422-2fca27686bcd',
        accent: 'frost',
    },
    {
        title: 'Ghostline Tour',
        client: 'Ghostline',
        category: 'AV · Stage Design',
        year: '2024',
        image: 'https://images.pexels.com/photos/31002870/pexels-photo-31002870.jpeg',
        accent: 'ember',
    },
    {
        title: 'Neuroforge',
        client: 'Neuroforge AI',
        category: 'Identity · Site',
        year: '2024',
        image: 'https://images.pexels.com/photos/28905636/pexels-photo-28905636.jpeg',
        accent: 'frost',
    },
];

export const Showcase = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const cards = sectionRef.current?.querySelectorAll('[data-card]');
        if (!cards) return;
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-in');
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );
        cards.forEach((c) => obs.observe(c));
        return () => obs.disconnect();
    }, []);

    return (
        <section
            id="showcase"
            ref={sectionRef}
            className="relative py-24 sm:py-32 px-5 sm:px-8"
        >
            <div className="max-w-[1480px] mx-auto">
                {/* Heading */}
                <div className="flex items-end justify-between mb-12 sm:mb-20">
                    <div className="flex flex-col gap-4 max-w-2xl">
                        <div className="font-mono text-[11px] uppercase tracking-[0.4em] text-secondary flex items-center gap-3">
                            <span className="h-px w-8 bg-secondary" />
                            Selected Work — 06 Pieces
                        </div>
                        <h2 className="font-grotesk text-5xl sm:text-7xl lg:text-8xl tracking-tight text-foreground leading-[0.95]">
                            Stories rendered<br />
                            <span className="italic text-gradient-ember font-light">in motion.</span>
                        </h2>
                    </div>
                    <a
                        href="#"
                        data-cursor="hover"
                        className="hidden md:flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors group"
                    >
                        View Archive
                        <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
                    {PROJECTS.map((p, i) => {
                        // Asymmetric layout: alternate big/small
                        const layout = [
                            'md:col-span-7',
                            'md:col-span-5',
                            'md:col-span-5',
                            'md:col-span-7',
                            'md:col-span-7',
                            'md:col-span-5',
                        ][i];
                        const tall = i === 0 || i === 3 || i === 4;
                        return (
                            <a
                                href="#"
                                key={p.title}
                                data-card
                                data-cursor="work"
                                data-cursor-label="View"
                                className={`reveal-card group relative ${layout} block overflow-hidden rounded-2xl border border-border/50 bg-card`}
                                style={{ '--delay': `${i * 80}ms` }}
                            >
                                <div className={`relative ${tall ? 'aspect-[16/11]' : 'aspect-[16/10]'} overflow-hidden`}>
                                    <img
                                        src={p.image}
                                        alt={p.title}
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1500ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-700" />
                                    {/* Accent overlay on hover */}
                                    <div
                                        className={`absolute inset-0 mix-blend-overlay opacity-0 group-hover:opacity-50 transition-opacity duration-700`}
                                        style={{
                                            background:
                                                p.accent === 'ember'
                                                    ? 'linear-gradient(135deg, hsl(22 95% 50% / 0.6), transparent 60%)'
                                                    : 'linear-gradient(135deg, hsl(175 85% 50% / 0.55), transparent 60%)',
                                        }}
                                    />

                                    {/* Top right tag */}
                                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70 px-2 py-1 rounded-full border border-border/60 bg-background/40 backdrop-blur-md">
                                            {String(i + 1).padStart(2, '0')} / 06
                                        </span>
                                        <span
                                            className={`h-2 w-2 rounded-full ${p.accent === 'ember' ? 'bg-primary' : 'bg-secondary'} animate-pulse-glow`}
                                        />
                                    </div>

                                    {/* Bottom info */}
                                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                                                <span>{p.category}</span>
                                                <span className="h-px w-6 bg-border" />
                                                <span>{p.year}</span>
                                            </div>
                                            <div className="flex items-end justify-between gap-3">
                                                <h3 className="font-grotesk text-2xl sm:text-3xl text-foreground tracking-tight">
                                                    {p.title}
                                                </h3>
                                                <ArrowUpRight
                                                    size={28}
                                                    className="text-foreground/60 transition-all duration-500 group-hover:text-primary group-hover:rotate-45"
                                                />
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {p.client}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>

            <style>{`
                .reveal-card { opacity: 0; transform: translateY(60px); transition: opacity 1.2s var(--ease-out-expo), transform 1.2s var(--ease-out-expo); transition-delay: var(--delay, 0ms); }
                .reveal-card.is-in { opacity: 1; transform: translateY(0); }
            `}</style>
        </section>
    );
};

export default Showcase;
