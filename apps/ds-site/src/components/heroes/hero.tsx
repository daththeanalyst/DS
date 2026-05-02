// DS2 production hero. Animation = fisheye dot matrix sampling the DS2
// wordmark; copy = the brand voice from POSITIONING.md (sentence-case,
// candid, "we tell the truth early").

import { AnimFisheyeDots } from "./anim-fisheye-dots";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-[#06070a]">
      <div className="absolute inset-0">
        <AnimFisheyeDots />
      </div>

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-ink-950/50 via-ink-950/15 to-ink-950/70"
      />

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
