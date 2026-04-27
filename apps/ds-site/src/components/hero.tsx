export function Hero() {
  return (
    <section className="relative min-h-[88vh] md:min-h-[92vh] flex items-center px-6 md:px-8 pt-32 md:pt-40 pb-24 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_at_top,_rgba(77,141,255,0.08),_transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(0deg,_transparent_0px,_transparent_39px,_rgba(200,200,200,0.6)_40px)]" />
      </div>

      <div className="max-w-6xl mx-auto w-full">
        <p className="ds-rise text-xs uppercase tracking-[0.2em] text-ink-500 mb-8">
          <span className="inline-block w-8 align-middle border-t border-ink-700 mr-3" />
          Athens · London · Est. 2026
        </p>

        <h1 className="ds-rise ds-delay-1 text-5xl md:text-7xl font-semibold tracking-tight leading-[1.02] max-w-4xl">
          A digital solutions consultancy that tells the truth early.
        </h1>

        <p className="ds-rise ds-delay-2 mt-8 text-lg md:text-xl text-ink-300 max-w-2xl leading-relaxed">
          We help organizations design and deliver digital products — through consulting, design, and hands-on development. Engage us for advisory, delivery, or end-to-end support.
        </p>

        <div className="ds-rise ds-delay-3 mt-12 flex flex-wrap gap-3">
          <a
            href="#contact"
            className="rounded-full bg-ink-100 text-ink-950 px-6 py-3 font-medium hover:bg-white transition-colors"
          >
            Book a call
          </a>
          <a
            href="#work"
            className="rounded-full border border-ink-700 text-ink-100 px-6 py-3 font-medium hover:border-ink-500 hover:bg-ink-900/40 transition-colors"
          >
            See our work
          </a>
        </div>

        <p className="ds-rise ds-delay-4 mt-16 text-sm text-ink-500 max-w-xl italic">
          &ldquo;We work best when we can be honest early — even if that means challenging the initial idea.&rdquo;
        </p>
      </div>
    </section>
  );
}
