import { Sparkles } from 'lucide-react';

const CLIENTS = [
    'NOVA STUDIO',
    'ATLAS LABS',
    'KILOWATT',
    'BLACK ORBIT',
    'PRISMA',
    'VANTA RECORDS',
    'HELIX',
    'NEUROFORGE',
    'OBELISK',
    'GHOSTLINE',
];

export const Marquee = () => {
    return (
        <section className="relative py-16 sm:py-20 border-y border-border/40 bg-background/40 backdrop-blur-sm overflow-hidden">
            <div className="max-w-[1480px] mx-auto px-5 sm:px-8 mb-8">
                <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
                    <Sparkles size={12} className="text-primary" />
                    Trusted by ambitious teams · 2018 — Today
                </div>
            </div>
            <div className="relative flex overflow-hidden mask-fade">
                <div className="flex gap-16 sm:gap-20 px-8 animate-marquee whitespace-nowrap">
                    {[...CLIENTS, ...CLIENTS].map((c, i) => (
                        <span
                            key={i}
                            className="font-display text-3xl sm:text-5xl tracking-wider text-foreground/35 hover:text-foreground transition-colors duration-500"
                        >
                            {c}
                            <span className="text-primary/60">·</span>
                        </span>
                    ))}
                </div>
            </div>
            <style>{`
                .mask-fade {
                    -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%);
                    mask-image: linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%);
                }
            `}</style>
        </section>
    );
};

export default Marquee;
