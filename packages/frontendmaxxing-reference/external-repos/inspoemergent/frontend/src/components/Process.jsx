import { useEffect, useRef, useState } from 'react';

const STEPS = [
    {
        n: '01',
        title: 'Listen',
        body: 'We start with a deep dive into your story, audience and ambitions. Workshops, audits and a clear creative brief.',
        keyword: 'Discovery',
    },
    {
        n: '02',
        title: 'Direct',
        body: 'Concept exploration, mood, type, motion principles and a directional pitch — the soul of the project.',
        keyword: 'Direction',
    },
    {
        n: '03',
        title: 'Design',
        body: 'High-fidelity systems, components, frame-by-frame motion, sound. Built in tandem with engineering.',
        keyword: 'Production',
    },
    {
        n: '04',
        title: 'Deploy',
        body: 'Performance-tuned builds, rigorous QA, launch choreography and a roadmap for the next chapter.',
        keyword: 'Launch',
    },
];

export const Process = () => {
    const sectionRef = useRef(null);
    const [active, setActive] = useState(0);

    useEffect(() => {
        const onScroll = () => {
            if (!sectionRef.current) return;
            const rect = sectionRef.current.getBoundingClientRect();
            const total = rect.height - window.innerHeight;
            if (total <= 0) return;
            const scrolled = Math.min(Math.max(-rect.top, 0), total);
            const p = scrolled / total;
            const idx = Math.min(STEPS.length - 1, Math.floor(p * STEPS.length * 0.999));
            setActive(idx);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <section
            id="process"
            ref={sectionRef}
            className="relative"
            style={{ height: '380vh' }}
        >
            <div className="sticky top-0 h-screen overflow-hidden flex items-center">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-shadow" />
                </div>
                <div className="relative max-w-[1480px] mx-auto w-full px-5 sm:px-8 grid lg:grid-cols-12 gap-12 items-center">
                    {/* Left: meta + step list */}
                    <div className="lg:col-span-5 flex flex-col gap-10">
                        <div className="flex flex-col gap-4">
                            <div className="font-mono text-[11px] uppercase tracking-[0.4em] text-secondary flex items-center gap-3">
                                <span className="h-px w-8 bg-secondary" />
                                The Process
                            </div>
                            <h2 className="font-grotesk text-5xl sm:text-6xl lg:text-7xl tracking-tight text-foreground leading-[0.95]">
                                A choreography<br />
                                <span className="italic font-light text-gradient-ember">in four acts.</span>
                            </h2>
                        </div>
                        <div className="flex flex-col">
                            {STEPS.map((s, i) => (
                                <button
                                    key={s.n}
                                    data-cursor="hover"
                                    className={`flex items-center justify-between py-5 border-t border-border/50 last:border-b text-left transition-all duration-500 ${
                                        active === i ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                                    }`}
                                >
                                    <div className="flex items-center gap-5">
                                        <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
                                        <span
                                            className={`font-grotesk text-2xl sm:text-3xl tracking-tight transition-colors duration-500 ${
                                                active === i ? 'text-foreground' : 'text-foreground/70'
                                            }`}
                                        >
                                            {s.title}
                                        </span>
                                    </div>
                                    <span
                                        className={`h-1.5 rounded-full transition-all duration-500 ${
                                            active === i ? 'w-12 bg-primary' : 'w-3 bg-foreground/20'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: large active panel */}
                    <div className="lg:col-span-6 lg:col-start-7">
                        <div className="relative aspect-square rounded-3xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
                            {/* Floating large numeral */}
                            <div className="absolute -top-10 -right-6 font-display text-[16rem] sm:text-[22rem] leading-none text-foreground/[0.04] select-none pointer-events-none">
                                {STEPS[active].n}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-secondary/[0.04]" />

                            {/* Content */}
                            <div className="relative h-full flex flex-col justify-between p-8 sm:p-10">
                                <div className="flex items-center justify-between">
                                    <span className="px-3 py-1 rounded-full border border-primary/40 bg-primary/10 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
                                        {STEPS[active].keyword}
                                    </span>
                                    <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                                        Step {active + 1} / {STEPS.length}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-6">
                                    <h3 className="font-grotesk text-6xl sm:text-7xl lg:text-8xl tracking-tight text-foreground leading-none">
                                        {STEPS[active].title}
                                    </h3>
                                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-md">
                                        {STEPS[active].body}
                                    </p>
                                    <div className="h-px w-full bg-border" />
                                    <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                                        <span>Phase</span>
                                        <div className="flex gap-1">
                                            {STEPS.map((_, i) => (
                                                <span
                                                    key={i}
                                                    className={`h-1 w-8 rounded-full transition-all duration-500 ${
                                                        i <= active ? 'bg-primary' : 'bg-border'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Process;
