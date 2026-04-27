import { useEffect, useRef, useState } from "react";
import { Cursor } from "@/components/Cursor";
import { SectionIndicator } from "@/components/SectionIndicator";
import {
  Section01, Section02, Section03, Section04, Section05,
  Section06, Section07, Section08, Section09, Section10,
} from "@/components/sections/Sections";
import {
  Section11, Section12, Section13, Section14, Section15,
} from "@/components/sections/SectionsExtra";
import {
  Section16, Section17, Section18, Section19, Section20,
} from "@/components/sections/SectionsExtra2";
import {
  Section21, Section22, Section23, Section24, Section25,
} from "@/components/sections/SectionsExtra3";
import {
  Section26, Section27, Section28, Section29, Section30,
} from "@/components/sections/SectionsExtra4";

const SECTIONS = [
  Section01, Section02, Section03, Section04, Section05,
  Section06, Section07, Section08, Section09, Section10,
  Section11, Section12, Section13, Section14, Section15,
  Section16, Section17, Section18, Section19, Section20,
  Section21, Section22, Section23, Section24, Section25,
  Section26, Section27, Section28, Section29, Section30,
];

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const el = containerRef.current!;
    const onScroll = () => {
      const i = Math.round(el.scrollTop / window.innerHeight);
      setCurrent(Math.max(0, Math.min(SECTIONS.length - 1, i)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const jump = (i: number) => {
    containerRef.current?.scrollTo({ top: i * window.innerHeight, behavior: "smooth" });
  };

  // SEO
  useEffect(() => {
    document.title = "DS2 — Logo Showcase | 10 Distinct Universes";
    const desc = "An immersive single-page showcase of the DS2 logo across 10 distinct visual aesthetics — from particle fields and liquid glass to brutalism and aurora.";
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); }
    m.setAttribute("content", desc);
    let c = document.querySelector('link[rel="canonical"]');
    if (!c) { c = document.createElement("link"); c.setAttribute("rel", "canonical"); document.head.appendChild(c); }
    c.setAttribute("href", window.location.origin + "/");
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background">
      <h1 className="sr-only">DS2 — Logo Showcase across 10 visual universes</h1>
      <Cursor />
      <SectionIndicator current={current} total={SECTIONS.length} onJump={jump} />
      <div ref={containerRef} className="snap-container scrollbar-hidden">
        {SECTIONS.map((S, i) => <S key={i} />)}
      </div>
    </main>
  );
};

export default Index;
