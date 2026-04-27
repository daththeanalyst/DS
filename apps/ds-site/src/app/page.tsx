import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/hero";
import { WhatWeDo } from "@/components/sections/what-we-do";
import { WhatMakesUsDifferent } from "@/components/sections/what-makes-us-different";
import { ProcessPreview } from "@/components/sections/process-preview";
import { Proof } from "@/components/sections/proof";
import { TrustSignals } from "@/components/sections/trust-signals";
import { EngageUs } from "@/components/sections/engage-us";
import { FinalCTA } from "@/components/sections/final-cta";
import { ScrollReveal } from "@/components/scroll-reveal";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">
        <Hero />
        <ScrollReveal><WhatWeDo /></ScrollReveal>
        <ScrollReveal><WhatMakesUsDifferent /></ScrollReveal>
        <ScrollReveal><ProcessPreview /></ScrollReveal>
        <ScrollReveal><Proof /></ScrollReveal>
        <ScrollReveal><TrustSignals /></ScrollReveal>
        <ScrollReveal><EngageUs /></ScrollReveal>
        <ScrollReveal><FinalCTA /></ScrollReveal>
      </main>
      <SiteFooter />
    </>
  );
}
