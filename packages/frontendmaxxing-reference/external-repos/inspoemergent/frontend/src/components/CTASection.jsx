import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export const CTASection = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [project, setProject] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const sectionRef = useRef(null);
    const blobRef = useRef(null);

    useEffect(() => {
        const onMove = (e) => {
            const rect = sectionRef.current?.getBoundingClientRect();
            if (!rect || !blobRef.current) return;
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            blobRef.current.style.transform = `translate3d(${x - 200}px, ${y - 200}px, 0)`;
        };
        const node = sectionRef.current;
        if (node) node.addEventListener('mousemove', onMove);
        return () => {
            if (node) node.removeEventListener('mousemove', onMove);
        };
    }, []);

    const onSubmit = (e) => {
        e.preventDefault();
        if (!name || !email || !project) {
            toast.error('Please fill in all fields');
            return;
        }
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            toast.success(`Thanks ${name.split(' ')[0]}! We'll be in touch within 48h.`);
            setName('');
            setEmail('');
            setProject('');
        }, 900);
    };

    return (
        <section
            id="cta"
            ref={sectionRef}
            className="relative py-24 sm:py-32 px-5 sm:px-8 overflow-hidden"
        >
            {/* Mouse-following blob */}
            <div
                ref={blobRef}
                className="absolute top-0 left-0 h-[400px] w-[400px] pointer-events-none rounded-full bg-primary/30 blur-[120px] transition-transform duration-300 ease-out"
            />
            <div
                className="absolute right-0 top-1/3 h-[400px] w-[400px] pointer-events-none rounded-full bg-secondary/20 blur-[120px]"
            />

            <div className="relative max-w-[1480px] mx-auto">
                <div className="rounded-[2rem] border border-border/60 bg-card/40 backdrop-blur-md overflow-hidden">
                    <div className="grid lg:grid-cols-12">
                        {/* Left content */}
                        <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-border/50 flex flex-col">
                            <div className="font-mono text-[11px] uppercase tracking-[0.4em] text-primary flex items-center gap-3 mb-5">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
                                Now booking · Q3 — 2026
                            </div>
                            <h2 className="font-grotesk text-5xl sm:text-6xl lg:text-7xl tracking-tight text-foreground leading-[0.95] mb-6">
                                <span className="glitch" data-text="Let's make">
                                    Let&apos;s make
                                </span>
                                <br />
                                <span className="italic font-light text-gradient-ember">
                                    something cinematic.
                                </span>
                            </h2>
                            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-md mb-10">
                                We take on a small number of projects each quarter. Tell us about yours — we read every brief.
                            </p>
                            <div className="mt-auto flex flex-col gap-4">
                                <a
                                    href="mailto:hello@ds2.studio"
                                    data-cursor="hover"
                                    className="group inline-flex items-center justify-between gap-2 border border-border rounded-full px-5 py-3 hover:border-primary transition-colors"
                                >
                                    <span className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Email</span>
                                    <span className="text-foreground group-hover:text-primary transition-colors">hello@ds2.studio</span>
                                    <ArrowUpRight size={16} className="text-foreground/60 group-hover:text-primary group-hover:rotate-45 transition-all" />
                                </a>
                                <a
                                    href="#"
                                    data-cursor="hover"
                                    className="group inline-flex items-center justify-between gap-2 border border-border rounded-full px-5 py-3 hover:border-secondary transition-colors"
                                >
                                    <span className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Studio</span>
                                    <span className="text-foreground group-hover:text-secondary transition-colors">Los Angeles · Berlin</span>
                                    <ArrowUpRight size={16} className="text-foreground/60 group-hover:text-secondary group-hover:rotate-45 transition-all" />
                                </a>
                            </div>
                        </div>

                        {/* Right form */}
                        <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 bg-background/30 flex flex-col">
                            <form onSubmit={onSubmit} className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                                        01 — Your name
                                    </label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Jane Doe"
                                        className="bg-transparent border-0 border-b border-border rounded-none px-0 h-12 text-lg focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/40"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                                        02 — Email
                                    </label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="jane@studio.com"
                                        className="bg-transparent border-0 border-b border-border rounded-none px-0 h-12 text-lg focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/40"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                                        03 — The project
                                    </label>
                                    <Textarea
                                        value={project}
                                        onChange={(e) => setProject(e.target.value)}
                                        rows={4}
                                        placeholder="Tell us about scope, timeline, and what's making your team excited…"
                                        className="bg-transparent border-0 border-b border-border rounded-none px-0 text-base focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/40 resize-none"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={submitting}
                                    data-cursor="hover"
                                    data-cursor-label="Send"
                                    className="liquid-btn group rounded-full bg-foreground text-background hover:bg-foreground hover:text-background h-14 px-8 font-medium gap-3 mt-2 self-start"
                                >
                                    {submitting ? 'Sending…' : 'Send the brief'}
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-110 group-hover:rotate-45">
                                        <Send size={12} />
                                    </span>
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
