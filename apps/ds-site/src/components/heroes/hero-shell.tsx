// Shared shell for the hero-candidate sections. Wraps an animation child
// (the canvas/3D scene) with the standard DS hero copy overlay + a small
// candidate-number indicator so the user can identify each option as they
// scroll. Once a candidate is chosen, the shell is removed and the picked
// animation goes into the real Hero component.

import type { ReactNode } from "react";

type Props = {
  candidate: number;
  total: number;
  name: string;
  technique: string;
  children: ReactNode; // the animation canvas
};

export function HeroShell({ candidate, total, name, technique, children }: Props) {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-[#06070a]">
      {/* Animation layer */}
      <div className="absolute inset-0">{children}</div>

      {/* Darkening veil so text reads on top of any animation */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-ink-950/55 via-ink-950/20 to-ink-950/65"
      />

      {/* Candidate badge — top right */}
      <div className="absolute top-5 right-5 md:top-6 md:right-6 z-20 pointer-events-none">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl px-4 py-3 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5ac8fa] shadow-[0_0_8px_rgba(90,200,250,0.55)]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
              Candidate {String(candidate).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>
          <h2 className="mt-1.5 text-sm sm:text-base font-semibold tracking-tight text-white/95 leading-tight">
            {name}
          </h2>
          <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">
            {technique}
          </span>
        </div>
      </div>

      {/* DS copy — same on every candidate so the user can compare how the
          actual brand copy reads against each animation. */}
      <div className="absolute inset-0 z-10 flex items-center px-6 md:px-8 pointer-events-none">
        <div className="max-w-3xl mx-auto md:mx-0 md:ml-[8vw] w-full">
          <p className="text-xs uppercase tracking-[0.2em] text-white/55 mb-6">
            <span className="inline-block w-8 align-middle border-t border-white/30 mr-3" />
            Athens · London · Est. 2026
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.04] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]">
            A digital solutions consultancy that tells the truth early.
          </h1>
          <p className="mt-6 text-base md:text-lg text-white/80 max-w-2xl leading-relaxed">
            Consulting, design, and hands-on development — advisory, delivery, or end-to-end.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 pointer-events-auto">
            <a
              href="#contact"
              className="rounded-full bg-white text-ink-950 px-5 py-2.5 font-medium hover:bg-ink-100 transition-colors text-sm"
            >
              Book a call
            </a>
            <a
              href="#work"
              className="rounded-full border border-white/40 text-white px-5 py-2.5 font-medium hover:bg-white/10 transition-colors backdrop-blur-sm text-sm"
            >
              See our work
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
