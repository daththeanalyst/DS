export function FinalCTA() {
  return (
    <section
      id="contact"
      className="py-32 md:py-56 border-t border-ink-800/60 relative overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(77,141,255,0.08),_transparent_60%)]"
      />
      <div className="relative max-w-4xl mx-auto px-6 md:px-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-500 mb-8">
          — Let&apos;s talk
        </p>
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-10">
          Tell us what you&apos;re building, or thinking about building.
        </h2>
        <p className="text-lg text-ink-300 max-w-2xl mx-auto mb-12 leading-relaxed">
          We&apos;ll read it properly, come back with what we think, and leave the decision with you. If it&apos;s not a fit, we&apos;ll say so — and point you somewhere that is.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href="mailto:hello@ds.example"
            className="rounded-full bg-ink-100 text-ink-950 px-8 py-4 font-medium hover:bg-white transition-colors"
          >
            Book a call
          </a>
          <a
            href="mailto:hello@ds.example"
            className="rounded-full border border-ink-700 px-8 py-4 font-medium hover:border-ink-500 hover:bg-ink-900/40 transition-colors"
          >
            Send us a brief
          </a>
        </div>
        <p className="mt-16 text-sm text-ink-500 italic max-w-lg mx-auto">
          &ldquo;Projects end; responsibility doesn&apos;t.&rdquo;
        </p>
      </div>
    </section>
  );
}
