import Link from "next/link";
import { AnimatedLogo3D } from "./animated-logo-3d";

const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#work", label: "Work" },
  { href: "#how-we-work", label: "How we work" },
] as const;

export function SiteHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-ink-950/70 border-b border-ink-800/60">
      <div className="max-w-6xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <Link href="/">
          <AnimatedLogo3D />
        </Link>
        <nav className="flex items-center gap-2 md:gap-6">
          <ul className="hidden md:flex items-center gap-6 text-sm text-ink-300">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="hover:text-ink-100 transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#contact"
            className="rounded-full bg-ink-100 text-ink-950 px-4 py-2 text-sm font-medium hover:bg-white transition-colors"
          >
            Book a call
          </a>
        </nav>
      </div>
    </header>
  );
}
