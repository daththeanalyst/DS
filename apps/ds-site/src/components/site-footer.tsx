export function SiteFooter() {
  return (
    <footer className="border-t border-ink-800/60 mt-24">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-semibold tracking-tight text-lg">DS</p>
          <p className="text-sm text-ink-500 mt-2 max-w-sm">
            Digital Solutions Consultancy. We advise, design, and build — honestly, and from the start.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-ink-500 mb-3">Company</p>
          <ul className="space-y-2 text-sm text-ink-300">
            <li><a href="#about" className="hover:text-ink-100 transition-colors">About</a></li>
            <li><a href="#work" className="hover:text-ink-100 transition-colors">Work</a></li>
            <li><a href="#how-we-work" className="hover:text-ink-100 transition-colors">How we work</a></li>
            <li><a href="#contact" className="hover:text-ink-100 transition-colors">Contact</a></li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-ink-500 mb-3">Locations</p>
          <ul className="space-y-2 text-sm text-ink-300">
            <li>Athens</li>
            <li>London</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-800/60">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-ink-500">
          <span>© {new Date().getFullYear()} DS — Digital Solutions Consultancy</span>
          <span>Athens · London</span>
        </div>
      </div>
    </footer>
  );
}
