const CASE_STUDIES = [
  {
    industry: "SaaS / B2B",
    client: "Northwind Analytics",
    challenge: "A 4-year-old dashboard with 3 re-designs nobody fully rolled out. Customers complained the tool 'felt slow' but the real issue was unclear information architecture.",
    approach: "We challenged the brief. Rather than rebuild the UI, we restructured the IA around user intent, introduced a component system for maintainability, and cut page weight by 68%.",
    outcome: "Single rebuild. Internal team can now evolve the product without our involvement.",
    tag: "Rebuild — Strategy + Delivery",
  },
  {
    industry: "Hospitality",
    client: "Halepi",
    challenge: "A Greek restaurant group running on a static-HTML brochure site with no way to update daily menus. Manual edits were bottlenecking the team.",
    approach: "Kept the visual style — we liked it. Moved content to a headless CMS, automated menu syndication, and wired a bilingual chatbot for reservation enquiries.",
    outcome: "Daily updates in under a minute. Reservation enquiries handled outside hours without staff intervention.",
    tag: "End-to-end delivery",
  },
  {
    industry: "Fintech (consulting only)",
    client: "Meridian Capital",
    challenge: "Evaluating whether to rebuild an internal compliance tool in-house or buy a commercial product. Team had a preferred vendor but the CTO had doubts.",
    approach: "Three-week advisory. Architecture review, vendor stress-test, total cost of ownership modelling. We recommended the opposite of the initial plan.",
    outcome: "Client bought the commercial product after validating our alternative. We did not build it. Still partners on advisory retainer.",
    tag: "Consulting-only",
  },
];

export function Proof() {
  return (
    <section id="work" className="py-28 md:py-40 border-t border-ink-800/60 bg-ink-950">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="flex items-baseline justify-between mb-16 flex-wrap gap-4">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
            <span className="inline-block w-8 align-middle border-t border-ink-700 mr-3" />
            Selected work
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl">
            Transformations, not before-and-afters.
          </h2>
        </div>

        <div className="grid gap-10 md:gap-12">
          {CASE_STUDIES.map((cs) => (
            <article
              key={cs.client}
              className="group grid md:grid-cols-[1fr_2fr] gap-8 md:gap-12 p-8 md:p-10 rounded-2xl border border-ink-800/60 hover:border-ink-700 transition-colors"
            >
              <header>
                <p className="text-xs text-accent-soft uppercase tracking-wide mb-2">{cs.tag}</p>
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">{cs.client}</h3>
                <p className="text-sm text-ink-500 mt-1">{cs.industry}</p>
              </header>
              <div className="space-y-5 text-ink-300 text-sm md:text-base leading-relaxed">
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-500 mb-2">Challenge</p>
                  <p>{cs.challenge}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-500 mb-2">What we changed</p>
                  <p>{cs.approach}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-500 mb-2">Outcome</p>
                  <p>{cs.outcome}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-12 text-sm text-ink-500 max-w-xl">
          Names and details anonymised until clients publicly confirm. Real case studies land here once each engagement allows disclosure.
        </p>
      </div>
    </section>
  );
}
