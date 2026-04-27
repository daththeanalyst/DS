const CAPABILITIES = [
  {
    n: "01",
    title: "Strategy & discovery",
    body: "We assess where you are, challenge the plan, and agree on what's actually worth building. Advisory can end here.",
  },
  {
    n: "02",
    title: "Web & application development",
    body: "Production sites, internal tools, and custom applications — built with current, boring-on-purpose stacks.",
  },
  {
    n: "03",
    title: "Data, ML & AI integration",
    body: "From a single Supabase schema to RAG-grounded chatbots. We integrate AI where it earns its keep, not everywhere.",
  },
  {
    n: "04",
    title: "Delivery & implementation",
    body: "Side-by-side builds with visible checkpoints. We flag problems early — never delivery-and-hope.",
  },
  {
    n: "05",
    title: "Ongoing Stewardship",
    body: "Optional monthly continuity after launch — care, oversight, advisory. No invented work. Start, pause, or stop at any time.",
  },
];

export function WhatWeDo() {
  return (
    <section id="services" className="py-28 md:py-40 border-t border-ink-800/60">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="flex items-baseline justify-between mb-16 flex-wrap gap-4">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
            <span className="inline-block w-8 align-middle border-t border-ink-700 mr-3" />
            What we do
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl">
            Five things. Any one on its own, or stitched together end-to-end.
          </h2>
        </div>

        <ul className="grid md:grid-cols-2 gap-px bg-ink-800/60 border border-ink-800/60 rounded-2xl overflow-hidden">
          {CAPABILITIES.map((c) => (
            <li
              key={c.n}
              className="bg-ink-950 p-8 md:p-10 flex flex-col gap-3 hover:bg-ink-900/60 transition-colors"
            >
              <span className="text-xs text-ink-500 font-mono">{c.n}</span>
              <h3 className="text-xl md:text-2xl font-semibold tracking-tight">{c.title}</h3>
              <p className="text-ink-300 text-sm md:text-base leading-relaxed">{c.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
