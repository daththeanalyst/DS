import { useEffect, useRef, useState } from 'react';
import Hero3D from '@/components/Hero3D';
import { ArrowDown, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Hero = () => {
    const subtitleRef = useRef(null);
    const taglineRef = useRef(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => {
            if (subtitleRef.current) subtitleRef.current.classList.add('is-in');
        }, 1900);
        const t2 = setTimeout(() => {
            if (taglineRef.current) taglineRef.current.classList.add('is-in');
        }, 2300);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    return (
        <section
            id="top"
            className="relative min-h-[100svh] w-full overflow-hidden"
        >
            {/* 3D canvas */}
            <div className="absolute inset-0">
                <Hero3D onReady={() => setReady(true)} />
            </div>

            {/* Top metadata */}
            <div className="absolute top-28 left-5 sm:left-8 z-20 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
                    <span className="h-px w-8 bg-primary" />
                    Reel — 026
                </div>
                <div className="hidden md:block font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground/70 max-w-[260px] leading-relaxed">
                    A motion-first design studio crafting cinematic identities & immersive web experiences
                </div>
            </div>

            {/* Side vertical */}
            <div className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 z-20">
                <div className="writing-vertical font-mono text-[10px] uppercase tracking-[0.5em] text-muted-foreground/60 rotate-180">
                    Scroll · Engage · Distort
                </div>
            </div>

            <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 z-20 flex-col items-end gap-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                    01 / 06
                </div>
                <div className="flex flex-col gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className={`h-px transition-all duration-500 ${
                                i === 1 ? 'w-10 bg-primary' : 'w-5 bg-foreground/30'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Subtitle absolutely overlaid */}
            <div className="absolute inset-x-0 bottom-[8%] z-20 px-5 sm:px-12">
                <div className="max-w-[1480px] mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div
                        ref={subtitleRef}
                        className="hero-rise flex flex-col gap-3"
                    >
                        <div className="font-mono text-[11px] uppercase tracking-[0.4em] text-secondary/80 flex items-center gap-3">
                            <span className="h-1.5 w-1.5 rounded-full bg-secondary glow-frost" />
                            Design · Story · Code
                        </div>
                        <h2 className="font-grotesk text-foreground text-2xl sm:text-3xl md:text-4xl leading-tight max-w-2xl tracking-tight">
                            <span className="text-foreground">We design </span>
                            <span className="text-gradient-ember">cinematic brands</span>
                            <span className="text-foreground"> & build immersive interfaces engineered for impact.</span>
                        </h2>
                    </div>

                    <div
                        ref={taglineRef}
                        className="hero-rise flex flex-col gap-4 md:items-end"
                    >
                        <div className="flex items-center gap-3">
                            <Button
                                size="lg"
                                data-cursor="hover"
                                data-cursor-label="Play"
                                className="liquid-btn group rounded-full bg-foreground text-background hover:bg-foreground hover:text-background h-12 px-6 gap-2 font-medium"
                            >
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-110">
                                    <Play size={11} fill="currentColor" />
                                </span>
                                Watch Reel
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                data-cursor="hover"
                                className="rounded-full border-foreground/30 bg-transparent text-foreground hover:bg-foreground/10 hover:text-foreground h-12 px-6 font-medium"
                                onClick={() => {
                                    const el = document.getElementById('showcase');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                Explore Work
                            </Button>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground animate-pulse-glow">
                            <ArrowDown size={12} />
                            scroll to enter
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom edge fade */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background pointer-events-none" />

            <style>{`
                .hero-rise { opacity: 0; transform: translateY(36px); transition: opacity 1.1s var(--ease-out-expo), transform 1.1s var(--ease-out-expo); }
                .hero-rise.is-in { opacity: 1; transform: translateY(0); }
            `}</style>
        </section>
    );
};

export default Hero;
