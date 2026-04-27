const STEPS = [
  { n: "01", title: "Context & external analysis", summary: "Understand why the problem exists — market, users, constraints." },
  { n: "02", title: "Technical & digital assessment", summary: "The honesty checkpoint. What's working. What isn't. What creates risk." },
  { n: "03", title: "Challenge & alignment", summary: "Two-way conversation on findings. Pause if we can't align." },
  { n: "04", title: "Proposed solution & options", summary: "Recommended direction, alternatives, trade-offs. Mockups when useful." },
  { n: "05", title: "Decision pause", summary: "Space to decide. No pressure. Move forward, adjust, or stop." },
  { n: "06", title: "Side-by-side build", summary: "Visible checkpoints, early flagging. Never delivery-and-hope." },
  { n: "07", title: "Launch & handover", summary: "Deploy, document, train. Systems understandable and defensible." },
];

export function ProcessPreview() {
  return (
    <section id="process" className="py-28 md:py-40 border-t border-ink-800/60">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="flex items-baseline justify-between mb-16 flex-wrap gap-4">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
            <span className="inline-block w-8 align-middle border-t border-ink-700 mr-3" />
            Our process
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl">
            Structure we follow, openly, from first call to handover.
          </h2>
        </div>

        <ol className="space-y-px bg-ink-800/40 border border-ink-800/60 rounded-2xl overflow-hidden">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="grid grid-cols-[auto_1fr_2fr] gap-6 md:gap-12 bg-ink-950 p-6 md:p-8 hover:bg-ink-900/50 transition-colors items-center"
            >
              <span className="text-sm text-ink-500 font-mono">{s.n}</span>
              <h3 className="text-base md:text-lg font-semibold tracking-tight">{s.title}</h3>
              <p className="text-ink-300 text-sm md:text-base leading-relaxed">{s.summary}</p>
            </li>
          ))}
        </ol>

        <p className="mt-8 text-sm text-ink-500 max-w-2xl">
          After launch, some clients opt into a monthly Stewardship engagement — continuity, care, and advisory, with full freedom to start, pause, or stop.
        </p>
      </div>
    </section>
  );
}
