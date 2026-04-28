// VariantShell.jsx
// Provides: full-viewport section, scroll progress, in-view detection (lazy mount),
// glass info card, and labels. Children receive { progress, active, inView }.
//
// Visual language: Apple Silicon — deep neutral background, restrained chrome,
// frosted-glass info pill, Apple SF blue (#5AC8FA) as the single accent.

import { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from '@/hooks/useScrollProgress';

export const VariantShell = ({
    index,
    title,
    technique,
    hint,
    children,
}) => {
    const { ref, progress, active } = useScrollProgress();
    // Index.tsx already controls which sections are mounted via RENDER_RADIUS.
    // The old VariantShell-level lazy-mount via IntersectionObserver was leaving
    // some sections stuck on "preparing canvas…" forever (intersection event
    // never fired reliably inside the scroll container). Mount immediately;
    // the parent already gates whether this VariantShell exists at all.
    const hasMounted = true;
    const inView = true;
    const sectionRef = useRef(null);

    // Combine refs (sectionRef for IntersectionObserver, ref from
    // useScrollProgress so the hook tracks the same DOM node).
    const setRefs = (node) => {
        sectionRef.current = node;
        ref.current = node;
    };

    return (
        <section
            ref={setRefs}
            data-testid={`variant-${String(index).padStart(2, '0')}`}
            id={`variant-${String(index).padStart(2, '0')}`}
            className="snap-section relative min-h-[100svh] w-full overflow-hidden bg-[#06070a]"
        >
            {/* Canvas area — only mounted after first intersection */}
            <div className="absolute inset-0">
                {hasMounted && (typeof children === 'function'
                    ? children({ progress, active, inView })
                    : children)}
                {!hasMounted && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/30">
                            preparing canvas…
                        </div>
                    </div>
                )}
            </div>

            {/* Top-left: glass info card */}
            <div className="absolute top-5 left-4 sm:left-6 z-10 pointer-events-none">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl backdrop-saturate-150 px-4 py-3 max-w-[240px] sm:max-w-xs shadow-[0_4px_24px_-8px_rgba(0,0,0,0.6)]">
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#5ac8fa] shadow-[0_0_8px_rgba(90,200,250,0.55)]" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
                            Variant / {String(index).padStart(2, '0')}
                        </span>
                    </div>
                    <h2 className="mt-1.5 text-[15px] sm:text-base font-semibold tracking-tight text-white/95 leading-tight">
                        {title}
                    </h2>
                    <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.22em] text-white/40 leading-relaxed">
                        {technique}
                    </span>
                </div>
            </div>

            {/* Bottom hint — glass capsule */}
            {hint && (
                <div className="absolute bottom-5 left-4 sm:left-6 z-10 pointer-events-none">
                    <div className="inline-flex items-center rounded-full border border-white/[0.06] bg-white/[0.03] backdrop-blur-md px-3 py-1.5">
                        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">
                            {hint}
                        </span>
                    </div>
                </div>
            )}
            {/*
             * Right-edge scroll progress removed: it was reading useScrollProgress
             * (a time-based auto-play timer, not real scroll position), so the
             * 0-100 readout was misleading. Top-left glass card already shows
             * variant number; SectionIndicator on the right edge already shows
             * gallery-wide position. No need for a third progress UI.
             */}
        </section>
    );
};

export default VariantShell;
