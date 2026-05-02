import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-ink-950/70 border-b border-ink-800/60">
      <div className="max-w-6xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" aria-label="DS2 home" className="flex items-center">
          <Image
            src="/logos/logo-white.png"
            alt="DS2"
            width={120}
            height={48}
            priority
            className="h-7 md:h-8 w-auto"
          />
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-white/30 text-white px-4 py-1.5 text-sm font-medium hover:bg-white/10 transition-colors"
        >
          Contact
        </Link>
      </div>
    </header>
  );
}
