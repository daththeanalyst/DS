// LabFooter.jsx — closing strip for the lab
export const LabFooter = () => {
    return (
        <footer
            data-testid="lab-footer"
            className="relative border-t border-border/40 mt-0"
        >
            <div className="max-w-[1480px] mx-auto px-5 sm:px-12 py-16 grid md:grid-cols-3 gap-10">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-display text-base">
                            D
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="font-grotesk font-semibold tracking-tight">DS2 Studio</span>
                            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                                Est. 2026
                            </span>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                        A motion-first design studio crafting cinematic identities & immersive web experiences.
                    </p>
                </div>

                <div className="flex flex-col gap-2 font-mono text-[11px] uppercase tracking-[0.25em]">
                    <span className="text-muted-foreground/70">Lab</span>
                    <a href="#variant-05" className="hover:text-primary transition-colors" data-cursor="hover">
                        05 / Voxel Height Field
                    </a>
                    <a href="#variant-11" className="hover:text-primary transition-colors" data-cursor="hover">
                        11 / Fluid Ink Smear
                    </a>
                    <a href="#variant-14" className="hover:text-primary transition-colors" data-cursor="hover">
                        14 / Holographic Tilt Card
                    </a>
                    <a href="#variant-16" className="hover:text-primary transition-colors" data-cursor="hover">
                        16 / Liquid Glass Refraction
                    </a>
                    <a href="#variant-17" className="hover:text-primary transition-colors" data-cursor="hover">
                        17 / Gravity Orbit Dance
                    </a>
                    <a href="#variant-20" className="hover:text-primary transition-colors" data-cursor="hover">
                        20 / Neon Wire · Digital Rain
                    </a>
                </div>

                <div className="flex flex-col gap-2 font-mono text-[11px] uppercase tracking-[0.25em]">
                    <span className="text-muted-foreground/70">Tech</span>
                    <span>WebGL · Three.js · ShaderMaterial</span>
                    <span>Canvas 2D · ImageData · Compositing</span>
                    <span>React · GSAP · Framer Motion</span>
                </div>
            </div>
            <div className="border-t border-border/40">
                <div className="max-w-[1480px] mx-auto px-5 sm:px-12 py-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    <span>© 2026 DS2 Studio — built with intent</span>
                    <span>20 / 20 studies</span>
                </div>
            </div>
        </footer>
    );
};

export default LabFooter;
