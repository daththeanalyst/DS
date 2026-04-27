const PATHS = [
  {
    key: "consulting",
    label: "Consulting-only",
    blurb: "Advisory, discovery, architecture, feasibility. Standalone and independent — we don't tie advice to implementation revenue.",
    bullets: [
      "Digital strategy & roadmaps",
      "Architecture & feasibility reviews",
      "Vendor selection",
      "UX / product discovery",
    ],
  },
  {
    key: "build",
    label: "Build-only",
    blurb: "You have the spec. We deliver the site, app, or MVP. Clear scope, clear checkpoints, no upsell pressure.",
    bullets: [
      "Marketing sites & brochureware",
      "Web & mobile applications",
      "MVP builds",
      "Legacy redesigns & rebuilds",
    ],
    featured: true,
  },
  {
    key: "endtoend",
    label: "End-to-end",
    blurb: "Discovery through launch with one accountable partner. Our default for ambitious engagements.",
    bullets: [
      "Strategy → design → build → deploy",
      "Product and engineering leadership",
      "Integrated AI & data work",
      "Optional monthly Stewardship",
    ],
  },
];

export function EngageUs() {
  return (
    <section id="engage" className="py-28 md:py-40 border-t border-ink-800/60 bg-ink-950">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-500 mb-4">
          <span className="inline-block w-8 align-middle border-t border-ink-700 mr-3" />
          How to engage us
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl mb-4">
          Advisory, delivery, or both. Pick what fits.
        </h2>
        <p className="text-ink-300 text-base md:text-lg max-w-2xl leading-relaxed mb-16">
          Our consulting can be completely standalone. Some clients implement internally or with other vendors — that&apos;s fine, and sometimes it&apos;s the right call.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {PATHS.map((p) => (
            <article
              key={p.key}
              className={`p-8 rounded-2xl border flex flex-col gap-5 ${
                p.featured
                  ? "border-ink-100 bg-ink-900/60"
                  : "border-ink-800/60 bg-ink-950"
              }`}
            >
              <h3 className="text-xl md:text-2xl font-semibold tracking-tight">{p.label}</h3>
              <p className="text-ink-300 text-sm md:text-base leading-relaxed">{p.blurb}</p>
              <ul className="space-y-2 text-sm text-ink-300 mt-auto">
                {p.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="text-ink-500 mt-1">—</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
