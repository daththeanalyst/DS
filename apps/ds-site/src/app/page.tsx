import Image from "next/image";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[100svh] flex flex-col items-center justify-center px-6">
        <Image
          src="/logos/logo-white.png"
          alt="DS2"
          width={520}
          height={208}
          priority
          className="w-[min(80vw,520px)] h-auto"
        />
        <p className="mt-8 text-sm md:text-base uppercase tracking-[0.32em] text-white/60">
          Digital Solutions
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
