import { useEffect, useRef } from 'react';
import { Box, Boxes, Layers, Wand2, Workflow, Zap } from 'lucide-react';

const CAPABILITIES = [
    {
        icon: Box,
        title: '3D & WebGL',
        desc: 'Real-time scenes, shader work and interactive Three.js experiences engineered for performance.',
        meta: '01',
        accent: 'ember',
        big: true,
    },
    {
        icon: Wand2,
        title: 'Brand Systems',
        desc: 'Identity, motion guidelines, type & sound design — built to scale across mediums.',
        meta: '02',
        accent: 'frost',
    },
    {
        icon: Layers,
        title: 'Site Design',
        desc: 'Cinematic, content-led websites with a focus on choreography and rhythm.',
        meta: '03',
        accent: 'ember',
    },
    {
        icon: Workflow,
        title: 'Product UI',
        desc: 'Beautiful, dense, kinetic dashboards & SaaS interfaces — design + engineering in one room.',
        meta: '04',
        accent: 'frost',
    },
    {
        icon: Boxes,
        title: 'Motion Reels',
        desc: 'Direction, animation, sound — high-energy reels for product launches and brand films.',
        meta: '05',
        accent: 'ember',
    },
    {
        icon: Zap,
        title: 'Live & AV',
        desc: 'Stage visuals, generative video and event experiences for tours and showcases.',
        meta: '06',
        accent: 'frost',
        big: true,
    },
];

export const Capabilities = () => {
    const ref = useRef(null);
    useEffect(() => {
        const els = ref.current?.querySelectorAll('[data-cap]');
        if (!els) return;
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-in');
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2 }
        );
        els.forEach((e) => obs.observe(e));
        return () => obs.disconnect();
    }, []);

    return (
        <section
            id="capabilities"
            ref={ref}
            className="relative py-24 sm:py-32 px-5 sm:px-8"
        >
            <div className="max-w-[1480px] mx-auto">
                <div className="grid lg:grid-cols-12 gap-8 mb-12 sm:mb-16">
                    <div className="lg:col-span-5">
                        <div className="font-mono text-[11px] uppercase tracking-[0.4em] text-primary mb-5 flex items-center gap-3">
                            <span className="h-px w-8 bg-primary" />
                            What we do
                        </div>
                        <h2 className="font-grotesk text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-foreground">
                            Six disciplines.<br />
                            <span className="italic font-light text-gradient-ember">One studio.</span>
                        </h2>
                    </div>
                    <div className="lg:col-span-6 lg:col-start-7 self-end">
                        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                            We work as a single integrated team — designers, animators, and engineers building from concept to ship. No hand-offs, no compromises in motion or fidelity.
                        </p>
                    </div>
                </div>

                {/* Bento grid */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {CAPABILITIES.map((c, i) => {
                        const Icon = c.icon;
                        const span = c.big ? 'md:col-span-3' : 'md:col-span-2';
                        return (
                            <article
                                key={c.title}
                                data-cap
                                data-cursor="hover"
                                className={`group relative flex flex-col ${span} rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-7 sm:p-8 overflow-hidden transition-all duration-700 hover:border-${c.accent === 'ember' ? 'primary' : 'secondary'}/60`}
                                style={{ '--delay': `${i * 90}ms` }}
                            >
                                {/* Hover gradient bg */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                    style={{
                                        background:
                                            c.accent === 'ember'
                                                ? 'radial-gradient(circle at 0% 100%, hsl(22 95% 30% / 0.5), transparent 60%)'
                                                : 'radial-gradient(circle at 100% 0%, hsl(175 85% 30% / 0.45), transparent 60%)',
                                    }}
                                />
                                <div className="relative flex items-start justify-between mb-8">
                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                                            c.accent === 'ember'
                                                ? 'group-hover:border-primary group-hover:text-primary group-hover:shadow-ember'
                                                : 'group-hover:border-secondary group-hover:text-secondary group-hover:shadow-frost'
                                        }`}
                                    >
                                        <Icon size={20} />
                                    </div>
                                    <span className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground">
                                        {c.meta}
                                    </span>
                                </div>
                                <h3 className="relative font-grotesk text-2xl sm:text-3xl text-foreground tracking-tight mb-3">
                                    {c.title}
                                </h3>
                                <p className="relative text-sm sm:text-base text-muted-foreground leading-relaxed">
                                    {c.desc}
                                </p>
                                <div className="relative mt-auto pt-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/60 group-hover:text-foreground transition-colors">
                                    <span>Explore</span>
                                    <span className="h-px flex-1 bg-border group-hover:bg-foreground transition-colors" />
                                    <span>→</span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>

            <style>{`
                [data-cap] { opacity: 0; transform: translateY(48px); transition: opacity 1s var(--ease-out-expo), transform 1s var(--ease-out-expo); transition-delay: var(--delay, 0ms); }
                [data-cap].is-in { opacity: 1; transform: translateY(0); }
            `}</style>
        </section>
    );
};

export default Capabilities;
