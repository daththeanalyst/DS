const PRINCIPLES = [
  { title: "Clear, direct communication", body: "Weekly updates. Decision logs. No performance reviews of an absent project." },
  { title: "Early risk flagging", body: "Concerns raised as they surface, not at the retrospective. Protective, not alarmist." },
  { title: "No scope inflation", body: "If something doesn't need building, we say so. Budgets aren't targets to hit." },
  { title: "Test what we ship", body: "Load behaviour, failure scenarios, data boundaries — validated on the product we deliver, not on your organisation." },
  { title: "Accountable handover", body: "Systems understandable and maintainable after we leave. Documentation written for the team who'll own it." },
  { title: "Optional continuity", body: "Stewardship is opt-in, month-to-month. Dependency is not the goal." },
];

const TESTIMONIALS = [
  {
    quote: "They told us what they'd do differently in the first hour of the first call. We hired them on the spot.",
    by: "Anonymous · Head of Product, scaleup SaaS",
  },
  {
    quote: "The only agency we've worked with that pushed back on scope rather than padding it.",
    by: "Anonymous · CTO, UK fintech",
  },
];

export function TrustSignals() {
  return (
    <section className="py-28 md:py-40 border-t border-ink-800/60">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-500 mb-4">
          <span className="inline-block w-8 align-middle border-t border-ink-700 mr-3" />
          What clients can expect
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl mb-16">
          Honesty early. Clarity throughout. Accountability to the outcome.
        </h2>

        <ul className="grid md:grid-cols-3 gap-6 mb-20">
          {PRINCIPLES.map((p) => (
            <li
              key={p.title}
              className="p-6 rounded-xl border border-ink-800/60 bg-ink-950 flex flex-col gap-2"
            >
              <h3 className="text-base md:text-lg font-semibold tracking-tight">{p.title}</h3>
              <p className="text-ink-300 text-sm leading-relaxed">{p.body}</p>
            </li>
          ))}
        </ul>

        <div className="grid md:grid-cols-2 gap-8">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.by}
              className="p-8 rounded-2xl border border-ink-800/60 bg-ink-900/30"
            >
              <blockquote className="text-lg md:text-xl font-medium tracking-tight leading-snug text-ink-100">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-sm text-ink-500">{t.by}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
