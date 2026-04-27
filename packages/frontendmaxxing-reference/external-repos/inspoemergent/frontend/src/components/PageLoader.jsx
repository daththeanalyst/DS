import { useEffect, useState } from 'react';

export const PageLoader = () => {
    const [progress, setProgress] = useState(0);
    const [done, setDone] = useState(false);

    useEffect(() => {
        let raf;
        const start = performance.now();
        const total = 1600;
        const tick = () => {
            const elapsed = performance.now() - start;
            const p = Math.min(100, (elapsed / total) * 100);
            setProgress(p);
            if (p < 100) raf = requestAnimationFrame(tick);
            else setTimeout(() => setDone(true), 350);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <div
            className="fixed inset-0 z-[10000] pointer-events-none"
            style={{
                opacity: done ? 0 : 1,
                transition: 'opacity 0.6s var(--ease-out-expo)',
            }}
        >
            {/* Top wipe */}
            <div
                className="absolute inset-x-0 top-0 bg-background"
                style={{
                    height: '50%',
                    transform: done ? 'translateY(-100%)' : 'translateY(0)',
                    transition: 'transform 1s var(--ease-out-expo)',
                }}
            />
            <div
                className="absolute inset-x-0 bottom-0 bg-background"
                style={{
                    height: '50%',
                    transform: done ? 'translateY(100%)' : 'translateY(0)',
                    transition: 'transform 1s var(--ease-out-expo)',
                }}
            />
            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="font-display text-7xl text-foreground tracking-tight">
                        <span className="text-gradient-ember">DS</span>
                        <span className="text-secondary">2</span>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        <span>Loading</span>
                        <div className="relative h-px w-40 bg-border overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 bg-primary"
                                style={{
                                    width: `${progress}%`,
                                    transition: 'width 0.1s linear',
                                }}
                            />
                        </div>
                        <span>{Math.floor(progress).toString().padStart(2, '0')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageLoader;
