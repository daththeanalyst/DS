import Image from "next/image";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[100svh] flex flex-col items-center justify-center px-6">
        <Image
          src="/logos/ds2-white.png"
          alt="DS2"
          width={1536}
          height={1024}
          priority
          sizes="(min-width: 768px) 640px, 80vw"
          className="w-[min(80vw,640px)] h-auto drop-shadow-[0_2px_30px_rgba(90,200,250,0.18)]"
        />
        <p className="mt-6 md:mt-8 flex items-center gap-3 md:gap-5 text-base md:text-xl uppercase tracking-[0.42em] text-white/85 font-medium">
          <span>Digital Solutions</span>
          <span aria-hidden className="h-3 md:h-4 w-px bg-white/35" />
          <span>Consulting</span>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
