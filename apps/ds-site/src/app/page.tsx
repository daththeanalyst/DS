import Image from "next/image";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[100svh] flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center w-full">
          {/* Logo with soft cool halo behind it */}
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

          {/* Glass horizon — thin gradient line where the logo meets its reflection */}
          <div
            aria-hidden
            className="mt-1 h-px w-[min(60vw,420px)] bg-gradient-to-r from-transparent via-white/22 to-transparent"
          />

          {/* Mirrored reflection — same wordmark, flipped, mask-faded */}
          <Image
            src="/logos/ds2-white.png"
            alt=""
            aria-hidden
            width={1536}
            height={1024}
            sizes="(min-width: 768px) 640px, 80vw"
            className="ds-reflection w-[min(82vw,640px)] h-auto"
          />

          {/* Caption — stacked, tracked-out, restrained */}
          <div className="mt-12 md:mt-16 text-center text-sm md:text-lg uppercase tracking-[0.42em] text-white/85 font-medium leading-[2]">
            <p>Digital Solutions</p>
            <p>Consulting</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
