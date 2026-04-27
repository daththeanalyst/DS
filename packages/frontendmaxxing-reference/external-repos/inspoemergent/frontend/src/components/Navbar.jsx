import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV = [
    { label: 'Particles', href: '#variant-01' },
    { label: 'Voxels', href: '#variant-05' },
    { label: 'Fluid', href: '#variant-11' },
    { label: 'Holo', href: '#variant-14' },
    { label: 'Glass', href: '#variant-16' },
    { label: 'Orbits', href: '#variant-17' },
    { label: 'Neon', href: '#variant-20' },
];

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const [time, setTime] = useState('');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        const updateTime = () => {
            const opts = { hour: '2-digit', minute: '2-digit', timeZone: 'America/Los_Angeles', hour12: false };
            setTime(new Date().toLocaleTimeString('en-US', opts));
        };
        updateTime();
        const id = setInterval(updateTime, 30000);
        return () => {
            window.removeEventListener('scroll', onScroll);
            clearInterval(id);
        };
    }, []);

    return (
        <header
            className={`fixed top-0 inset-x-0 z-[60] transition-all duration-500 ${
                scrolled ? 'py-3' : 'py-6'
            }`}
        >
            <div
                className={`mx-auto max-w-[1480px] px-5 sm:px-8 transition-all duration-500 ${
                    scrolled ? 'opacity-100' : 'opacity-100'
                }`}
            >
                <div
                    className={`flex items-center justify-between rounded-2xl border border-border/40 backdrop-blur-xl px-4 sm:px-6 py-3 transition-all ${
                        scrolled ? 'bg-background/70 shadow-deep' : 'bg-background/30'
                    }`}
                >
                    {/* Logo */}
                    <a href="#top" data-cursor="hover" className="flex items-center gap-2 group">
                        <div className="relative h-9 w-9 rounded-lg overflow-hidden bg-gradient-ember flex items-center justify-center shadow-ember">
                            <span className="font-display text-xl text-primary-foreground leading-none mt-0.5">D</span>
                            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-secondary glow-frost" />
                        </div>
                        <div className="hidden sm:flex flex-col leading-none">
                            <span className="font-display text-lg tracking-wide text-foreground">DS2 STUDIO</span>
                            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-0.5">est. 2026</span>
                        </div>
                    </a>

                    {/* Nav links */}
                    <nav className="hidden md:flex items-center gap-1">
                        {NAV.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                data-cursor="hover"
                                className="relative px-4 py-2 text-sm text-foreground/80 hover:text-foreground transition-colors group"
                            >
                                <span>{item.label}</span>
                                <span className="absolute left-4 right-4 -bottom-0.5 h-px bg-primary scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500" />
                            </a>
                        ))}
                    </nav>

                    {/* Right */}
                    <div className="flex items-center gap-3">
                        <div className="hidden lg:flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground border-l border-border/60 pl-4">
                            <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse-glow" />
                            LA · {time}
                        </div>
                        <Button
                            variant="default"
                            size="sm"
                            data-cursor="hover"
                            data-cursor-label="Hi"
                            data-testid="navbar-cta"
                            className="hidden md:inline-flex bg-primary text-primary-foreground hover:bg-primary-glow rounded-full font-medium tracking-wide"
                            onClick={() => {
                                const el = document.querySelector('[data-testid="lab-footer"]');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            Contact
                        </Button>
                        <button
                            className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-lg border border-border bg-card/50"
                            onClick={() => setOpen((v) => !v)}
                            aria-label="Toggle menu"
                        >
                            {open ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>

                {/* Mobile drawer */}
                {open && (
                    <div className="md:hidden mt-2 rounded-2xl border border-border/60 bg-background/85 backdrop-blur-xl p-4 animate-fade-in-up">
                        <div className="flex flex-col">
                            {NAV.map((n) => (
                                <a
                                    key={n.href}
                                    href={n.href}
                                    onClick={() => setOpen(false)}
                                    className="px-3 py-3 text-base text-foreground border-b border-border/40 last:border-none"
                                >
                                    {n.label}
                                </a>
                            ))}
                            <Button
                                className="mt-3 bg-primary text-primary-foreground hover:bg-primary-glow rounded-full"
                                onClick={() => {
                                    setOpen(false);
                                    const el = document.querySelector('[data-testid="lab-footer"]');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                Contact
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
