import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-ink-950/40 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 md:px-8 h-20 md:h-24 flex items-center justify-between">
        <Link href="/" aria-label="DS2 home" className="flex items-center">
          <Image
            src="/logos/ds2-white.png"
            alt="DS2"
            width={384}
            height={256}
            priority
            className="h-12 md:h-14 w-auto"
          />
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-white/40 text-white px-5 py-2 text-sm md:text-base font-medium hover:bg-white/10 transition-colors"
        >
          Contact
        </Link>
      </div>
    </header>
  );
}
