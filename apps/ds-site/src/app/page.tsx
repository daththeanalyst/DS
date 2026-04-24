/**
 * DS landing page — placeholder scaffold.
 *
 * This page is intentionally minimal. The real scroll story (hero / what-we-do /
 * honesty / process / proof / engage-us / final CTA) is built in Phase 3 against
 * the sitemap in docs/brand/POSITIONING.md §9.
 */

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-8 py-6 flex items-center justify-between border-b border-ink-800">
        <span className="font-semibold tracking-tight">DS</span>
        <nav className="flex items-center gap-6 text-sm text-ink-300">
          <a href="#services" className="hover:text-ink-100">Services</a>
          <a href="#work" className="hover:text-ink-100">Work</a>
          <a href="#how-we-work" className="hover:text-ink-100">How we work</a>
          <a
            href="#contact"
            className="rounded-full bg-ink-100 text-ink-950 px-4 py-2 font-medium hover:bg-white transition-colors"
          >
            Contact
          </a>
        </nav>
      </header>

      <section className="flex-1 px-8 py-24 max-w-5xl mx-auto w-full">
        <p className="text-sm uppercase tracking-wide text-ink-500 mb-6">
          Athens · London
        </p>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-8">
          A digital solutions consultancy that tells the truth early.
        </h1>
        <p className="text-xl text-ink-300 max-w-2xl leading-relaxed">
          We help organizations design and deliver digital products — through consulting, design, and hands-on development. Clients engage us for advisory, delivery, or end-to-end support.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="#contact"
            className="rounded-full bg-ink-100 text-ink-950 px-6 py-3 font-medium hover:bg-white transition-colors"
          >
            Book a call
          </a>
          <a
            href="#work"
            className="rounded-full border border-ink-700 px-6 py-3 font-medium hover:border-ink-500 transition-colors"
          >
            See our work
          </a>
        </div>
      </section>

      <footer className="px-8 py-6 border-t border-ink-800 text-sm text-ink-500 flex justify-between">
        <span>DS · Digital Solutions Consultancy</span>
        <span>Athens · London</span>
      </footer>
    </main>
  );
}
