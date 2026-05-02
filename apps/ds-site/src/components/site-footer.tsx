export function SiteFooter() {
  return (
    <footer className="border-t border-ink-800/60">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-500">
        <span>© {new Date().getFullYear()} DS2 — Digital Solutions</span>
        <span>Athens · London</span>
      </div>
    </footer>
  );
}
