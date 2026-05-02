import Image from "next/image";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[100svh] flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center w-full">
          <div className="relative">
            <span aria-hidden className="ds-hero-halo" />
            <Image
              src="/logos/ds2-white.png"
              alt="DS2"
              width={1536}
              height={1024}
              priority
              sizes="(min-width: 768px) 640px, 80vw"
              className="relative w-[min(82vw,640px)] h-auto"
            />
          </div>

          <div className="mt-8 md:mt-10 text-center text-sm md:text-lg uppercase tracking-[0.42em] text-white/85 font-medium leading-[2]">
            <p>Digital Solutions</p>
            <p>Consulting</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
