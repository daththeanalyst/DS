// IntroHero.jsx — opening section that frames the 15-variant lab
import { ArrowDown, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';

const VARIANTS = [
    'Particle Assembly',
    'Magnetic Dot Grid',
    'Liquid Ripple Distortion',
    'Polygon Shatter',
    'Voxel Height Field',
    'Smoke Trails',
    'Fisheye Dot Matrix',
    'Echo Trail Ink',
    'RGB Chromatic Glitch',
    'ASCII Character Rain',
    'Fluid Ink Smear',
    'Typographic Marquee Mask',
    'Iron-Filings Field',
    'Holographic Tilt Card',
    'Verlet Spring Mesh',
];

export const IntroHero = () => {
    const heroRef = useRef(null);
    useEffect(() => {
        const el = heroRef.current;
        if (!el) return;
        // mouse parallax for floating elements
        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width) - 0.5;
            const y = ((e.clientY - r.top) / r.height) - 0.5;
            el.style.setProperty('--mx', x.toFixed(3));
            el.style.setProperty('--my', y.toFixed(3));
        };
        el.addEventListener('mousemove', onMove);
        return () => el.removeEventListener('mousemove', onMove);
    }, []);

    return (
        <section
            ref={heroRef}
            className="relative min-h-[100svh] w-full overflow-hidden flex items-center"
            style={{ '--mx': 0, '--my': 0 }}
        >
            {/* ambient light orbs */}
            <div
                className="absolute top-1/3 -left-40 h-[460px] w-[460px] rounded-full blur-[120px] opacity-40 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, hsl(22, 95%, 58%) 0%, transparent 70%)',
                    transform: 'translate3d(calc(var(--mx) * 60px), calc(var(--my) * 40px), 0)',
                }}
            />
            <div
                className="absolute bottom-1/4 -right-40 h-[520px] w-[520px] rounded-full blur-[140px] opacity-30 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, hsl(175, 85%, 55%) 0%, transparent 70%)',
                    transform: 'translate3d(calc(var(--mx) * -50px), calc(var(--my) * -30px), 0)',
                }}
            />

            <div className="relative z-10 max-w-[1480px] w-full mx-auto px-5 sm:px-12 py-32 grid md:grid-cols-12 gap-10">
                <div className="md:col-span-8 flex flex-col gap-8">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary font-mono text-[11px] uppercase tracking-[0.3em]">
                            <Sparkles size={12} />
                            DS2 / Animation Lab
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                            20 / cinematic studies
                        </span>
                    </div>

                    <h1 className="font-grotesk font-semibold tracking-tighter text-foreground text-[clamp(3rem,9vw,9rem)] leading-[0.9]">
                        <span className="block">Twenty ways to</span>
                        <span className="block">
                            <span className="text-gradient-ember">render</span>{' '}
                            <span className="italic font-light">a logo</span>
                        </span>
                        <span className="block text-secondary">in motion.</span>
                    </h1>

                    <p className="text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">
                        A frame-by-frame scroll lab using the DS2 mark as a single source of truth.
                        Each section below is an independent canvas — WebGL, instanced geometry, or 2D
                        compositing — that reacts to your cursor and scrubs to the section's scroll
                        progress. Drag, click, scroll. Everything moves.
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mr-2">
                            Studies →
                        </span>
                        {VARIANTS.map((v, i) => (
                            <a
                                key={v}
                                href={`#variant-${String(i + 1).padStart(2, '0')}`}
                                data-cursor="hover"
                                data-testid={`variant-link-${i + 1}`}
                                className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/60 hover:border-primary/60 hover:bg-primary/5 transition-colors font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
                            >
                                <span className="text-primary/80 group-hover:text-primary">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                {v}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 mt-4 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground animate-pulse-glow">
                        <ArrowDown size={12} />
                        scroll to enter the lab
                    </div>
                </div>

                {/* DS2 brand block */}
                <div className="md:col-span-4 flex md:justify-end items-start md:items-center">
                    <div
                        className="relative aspect-square w-full max-w-[300px] rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden flex items-center justify-center"
                        style={{
                            boxShadow: 'var(--shadow-deep)',
                        }}
                    >
                        <img
                            src="/logos/ds2-a.png"
                            alt="DS2 Source Logo"
                            className="w-3/4 h-auto opacity-90 select-none pointer-events-none mix-blend-screen"
                            draggable={false}
                            style={{
                                transform: 'translate3d(calc(var(--mx) * -8px), calc(var(--my) * -6px), 0)',
                                transition: 'transform 0.3s var(--ease-out-expo)',
                            }}
                        />
                        <div className="absolute top-3 left-3 font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                            ds2 · source.png
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                            <span>1536 × 1024</span>
                            <span className="text-primary">●</span>
                            <span>rgba</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default IntroHero;
