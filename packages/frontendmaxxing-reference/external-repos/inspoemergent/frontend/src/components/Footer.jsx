import { Twitter, Github, Instagram, Linkedin } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="relative pt-24 pb-10 px-5 sm:px-8 border-t border-border/50">
            <div className="max-w-[1480px] mx-auto">
                {/* Big DS2 wordmark */}
                <div className="relative mb-16">
                    <div className="font-display text-[28vw] sm:text-[20vw] leading-[0.85] tracking-tight text-center text-foreground select-none">
                        <span className="text-gradient-ember">DS</span>
                        <span className="text-secondary">2</span>
                    </div>
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
                    <div className="md:col-span-4 flex flex-col gap-4">
                        <h3 className="font-grotesk text-2xl text-foreground tracking-tight">DS2 Studio.</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            A motion-first design studio crafting cinematic identities, sites and product experiences.
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            {[Twitter, Instagram, Github, Linkedin].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    data-cursor="hover"
                                    className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary transition-colors"
                                >
                                    <Icon size={14} />
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-5">Studio</div>
                        <ul className="flex flex-col gap-3 text-sm text-foreground/80">
                            <li><a href="#" data-cursor="hover" className="hover:text-primary transition-colors">About</a></li>
                            <li><a href="#" data-cursor="hover" className="hover:text-primary transition-colors">Manifesto</a></li>
                            <li><a href="#" data-cursor="hover" className="hover:text-primary transition-colors">Press</a></li>
                            <li><a href="#" data-cursor="hover" className="hover:text-primary transition-colors">Careers</a></li>
                        </ul>
                    </div>
                    <div className="md:col-span-2">
                        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-5">Work</div>
                        <ul className="flex flex-col gap-3 text-sm text-foreground/80">
                            <li><a href="#showcase" data-cursor="hover" className="hover:text-primary transition-colors">Cases</a></li>
                            <li><a href="#capabilities" data-cursor="hover" className="hover:text-primary transition-colors">Capabilities</a></li>
                            <li><a href="#process" data-cursor="hover" className="hover:text-primary transition-colors">Process</a></li>
                            <li><a href="#" data-cursor="hover" className="hover:text-primary transition-colors">Reel 026</a></li>
                        </ul>
                    </div>
                    <div className="md:col-span-4">
                        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-5">Studio dispatch</div>
                        <p className="text-sm text-foreground/80 mb-4">
                            Quarterly notes, films, and behind the scenes. No spam, ever.
                        </p>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                            className="flex items-center gap-2 border border-border rounded-full p-1 pl-4"
                        >
                            <input
                                type="email"
                                placeholder="you@studio.com"
                                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                            />
                            <button
                                data-cursor="hover"
                                className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-glow transition-colors"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                    <div>© 2026 DS2 Studio · All Rights Reserved</div>
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse-glow" />
                        Available for select projects
                    </div>
                    <div>v.026 · motion build</div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
