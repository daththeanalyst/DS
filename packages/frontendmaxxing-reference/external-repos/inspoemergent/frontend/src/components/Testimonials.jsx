import { useEffect, useState } from 'react';
import { Star, ArrowLeft, ArrowRight } from 'lucide-react';

const T = [
    {
        quote:
            '“DS2 turned our launch into a cultural moment. The web reveal hit 4.2M views in 48 hours — their motion direction is in another league.”',
        name: 'Mira Chen',
        role: 'VP Marketing, Helix Industries',
        avatar: 'MC',
        accent: 'ember',
    },
    {
        quote:
            '“Their engineering and design speak the same language. Our SaaS site went from a deck to a real, kinetic, ridiculously fast experience in 9 weeks.”',
        name: 'Theo Park',
        role: 'CEO, Kilowatt',
        avatar: 'TP',
        accent: 'frost',
    },
    {
        quote:
            '“Working with the studio felt like co-directing a short film. Every frame, every sound, every micro-interaction felt deeply intentional.”',
        name: 'Ana Vidal',
        role: 'Creative Director, Vanta Records',
        avatar: 'AV',
        accent: 'ember',
    },
];

export const Testimonials = () => {
    const [i, setI] = useState(0);
    const next = () => setI((p) => (p + 1) % T.length);
    const prev = () => setI((p) => (p - 1 + T.length) % T.length);

    useEffect(() => {
        const id = setInterval(next, 7000);
        return () => clearInterval(id);
    }, []);

    const t = T[i];

    return (
        <section className="relative py-24 sm:py-32 px-5 sm:px-8 border-t border-border/50">
            <div className="max-w-[1480px] mx-auto">
                <div className="grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-4">
                        <div className="font-mono text-[11px] uppercase tracking-[0.4em] text-secondary flex items-center gap-3 mb-5">
                            <span className="h-px w-8 bg-secondary" />
                            Client Voices
                        </div>
                        <h2 className="font-grotesk text-5xl sm:text-6xl tracking-tight text-foreground leading-[0.95] mb-10">
                            Loved by the<br />
                            <span className="italic font-light text-gradient-ember">brave ones.</span>
                        </h2>
                        <div className="flex items-center gap-2">
                            {[0, 1, 2, 3, 4].map((s) => (
                                <Star
                                    key={s}
                                    size={16}
                                    className="fill-primary text-primary"
                                />
                            ))}
                            <span className="ml-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                                4.96 / 5 · 38 reviews
                            </span>
                        </div>
                    </div>
                    <div className="lg:col-span-8 lg:col-start-5">
                        <div
                            key={i}
                            className="relative rounded-3xl border border-border/60 bg-card/60 backdrop-blur-sm p-8 sm:p-12 overflow-hidden animate-fade-in-up"
                        >
                            <div
                                className="absolute -top-10 -left-2 font-display text-[14rem] leading-none text-primary/15 select-none pointer-events-none"
                            >
                                “
                            </div>
                            <blockquote className="relative font-grotesk text-2xl sm:text-3xl lg:text-4xl text-foreground leading-snug tracking-tight">
                                {t.quote}
                            </blockquote>
                            <div className="relative mt-10 flex items-center justify-between flex-wrap gap-6">
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`h-14 w-14 rounded-full flex items-center justify-center font-grotesk text-xl tracking-wide ${
                                            t.accent === 'ember'
                                                ? 'bg-gradient-ember text-primary-foreground shadow-ember'
                                                : 'bg-gradient-frost text-secondary-foreground shadow-frost'
                                        }`}
                                    >
                                        {t.avatar}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-base text-foreground">{t.name}</span>
                                        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">
                                            {t.role}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={prev}
                                        data-cursor="hover"
                                        className="h-11 w-11 rounded-full border border-border bg-background/50 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                                        aria-label="Previous"
                                    >
                                        <ArrowLeft size={16} />
                                    </button>
                                    <div className="flex items-center gap-1 px-2">
                                        {T.map((_, idx) => (
                                            <span
                                                key={idx}
                                                className={`h-1 rounded-full transition-all duration-500 ${
                                                    idx === i ? 'w-8 bg-primary' : 'w-2 bg-border'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={next}
                                        data-cursor="hover"
                                        className="h-11 w-11 rounded-full border border-border bg-background/50 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                                        aria-label="Next"
                                    >
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
