const BEATS = [
  {
    n: "1",
    title: "We challenge assumptions early",
    body: "Before proposing solutions, we examine what's working, what isn't, and where current ideas may fall short. If something doesn't make sense technically, commercially, or from a user perspective, we raise it early — before time or budget is committed.",
  },
  {
    n: "2",
    title: "We explain why, not just what",
    body: "Every recommendation we make is backed by reasoning. We explain trade-offs, risks, and implications openly, so decisions are made with clarity rather than pressure.",
  },
  {
    n: "3",
    title: "We pair critique with constructive alternatives",
    body: "If we identify an issue, we never stop at criticism. We always propose practical alternatives, outlining what would change, why it's an improvement, and what the trade-offs are.",
  },
  {
    n: "4",
    title: "We separate advice from decision-making",
    body: "Our role is to advise, design, and build — not to force decisions. After presenting our recommendations, we give clients space to reflect and decide. Some move forward immediately. Others take time. All are valid.",
  },
];

export function WhatMakesUsDifferent() {
  return (
    <section
      id="how-we-work"
      className="py-28 md:py-40 border-t border-ink-800/60 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(77,141,255,0.06),_transparent_60%)]"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-500 mb-4">
          <span className="inline-block w-8 align-middle border-t border-ink-700 mr-3" />
          How we work
        </p>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight max-w-3xl mb-6">
          Challenge-first, transparent delivery.
        </h2>
        <p className="text-ink-300 text-base md:text-lg max-w-2xl leading-relaxed mb-16">
          The best digital outcomes start with honest conversations — even when they&apos;re uncomfortable. Rather than immediately agreeing to a brief, we take the time to understand the business context and say what we see.
        </p>

        <ol className="grid md:grid-cols-2 gap-6 md:gap-8">
          {BEATS.map((b) => (
            <li
              key={b.n}
              className="p-8 md:p-10 rounded-2xl border border-ink-800/60 bg-ink-900/40 flex flex-col gap-3"
            >
              <span className="text-sm text-accent-soft font-mono">— {b.n}</span>
              <h3 className="text-xl md:text-2xl font-semibold tracking-tight">{b.title}</h3>
              <p className="text-ink-300 text-sm md:text-base leading-relaxed">{b.body}</p>
            </li>
          ))}
        </ol>

        <p className="mt-16 text-sm md:text-base text-ink-500 italic max-w-xl">
          &ldquo;You don&apos;t need to decide now. Take time — we&apos;re happy to proceed either way.&rdquo;
        </p>
      </div>
    </section>
  );
}
