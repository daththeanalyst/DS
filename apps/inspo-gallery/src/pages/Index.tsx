import { useEffect, useRef, useState } from "react";
import { Cursor } from "@/components/Cursor";
import { SectionIndicator } from "@/components/SectionIndicator";

// 30 sections from logo-showcase-supreme
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

// 20 variants from inspoemergent
// @ts-expect-error JSX import
import V01Particles from "@/components/variants/V01Particles.jsx";
// @ts-expect-error JSX import
import V02MagneticGrid from "@/components/variants/V02MagneticGrid.jsx";
// @ts-expect-error JSX import
import V03LiquidRipple from "@/components/variants/V03LiquidRipple.jsx";
// @ts-expect-error JSX import
import V04Shards from "@/components/variants/V04Shards.jsx";
// @ts-expect-error JSX import
import V05Voxels from "@/components/variants/V05Voxels.jsx";
// @ts-expect-error JSX import
import V06Smoke from "@/components/variants/V06Smoke.jsx";
// @ts-expect-error JSX import
import V07FisheyeDots from "@/components/variants/V07FisheyeDots.jsx";
// @ts-expect-error JSX import
import V08EchoTrail from "@/components/variants/V08EchoTrail.jsx";
// @ts-expect-error JSX import
import V09RGBGlitch from "@/components/variants/V09RGBGlitch.jsx";
// @ts-expect-error JSX import
import V10ASCII from "@/components/variants/V10ASCII.jsx";
// @ts-expect-error JSX import
import V11FluidSmear from "@/components/variants/V11FluidSmear.jsx";
// @ts-expect-error JSX import
import V12MarqueeMask from "@/components/variants/V12MarqueeMask.jsx";
// @ts-expect-error JSX import
import V13MagneticField from "@/components/variants/V13MagneticField.jsx";
// @ts-expect-error JSX import
import V14HoloCard from "@/components/variants/V14HoloCard.jsx";
// @ts-expect-error JSX import
import V15VerletMesh from "@/components/variants/V15VerletMesh.jsx";
// @ts-expect-error JSX import
import V16LiquidGlass from "@/components/variants/V16LiquidGlass.jsx";
// @ts-expect-error JSX import
import V17GravityOrbits from "@/components/variants/V17GravityOrbits.jsx";
// @ts-expect-error JSX import
import V18DepthDiorama from "@/components/variants/V18DepthDiorama.jsx";
// @ts-expect-error JSX import
import V19SpectrumBars from "@/components/variants/V19SpectrumBars.jsx";
// @ts-expect-error JSX import
import V20NeonRain from "@/components/variants/V20NeonRain.jsx";
// @ts-expect-error JSX import
import V21QuantumMorph from "@/components/variants/V21QuantumMorph.jsx";
// @ts-expect-error JSX import
import V22LaserForge from "@/components/variants/V22LaserForge.jsx";
// @ts-expect-error JSX import
import V23DepthStack from "@/components/variants/V23DepthStack.jsx";
const SECTIONS = [
  Section01, Section02, Section03, Section04, Section05,
  Section06, Section07, Section08, Section09, Section10,
  Section11, Section12, Section13, Section14, Section15,
  Section16, Section17, Section18, Section19, Section20,
  Section21, Section22, Section23, Section24, Section25,
  Section26, Section27, Section28, Section29, Section30,
  V01Particles, V02MagneticGrid, V03LiquidRipple, V04Shards, V05Voxels,
  V06Smoke, V07FisheyeDots, V08EchoTrail, V09RGBGlitch, V10ASCII,
  V11FluidSmear, V12MarqueeMask, V13MagneticField, V14HoloCard, V15VerletMesh,
  V16LiquidGlass, V17GravityOrbits, V18DepthDiorama, V19SpectrumBars, V20NeonRain,
  V21QuantumMorph, V22LaserForge, V23DepthStack,
];

const SECTION_TITLES = [
  // Showcase-supreme (1–30)
  "GENESIS",  "VOID",      "PRISM",        "FLUX",     "BRUTAL",
  "AURORA",   "PARTICLE",  "KINETIC",      "GLASS",    "INFINITY",
  "ASCII",    "MAGNETIC",  "FLUID",        "DEPTH",    "TYPO",
  "VORTEX",   "MORSE",     "TOPO",         "HOLO",     "SHATTER",
  "CONSTELLATION", "FERRO", "ORIGAMI",     "DATAMOSH", "TUNNEL",
  "RIBBONS",  "TYPEWRITER","RAIN",         "CARDS",    "FINALE",
  // Inspoemergent (31–50)
  "PARTICLE ASSEMBLY",     // V01
  "MAGNETIC DOT GRID",     // V02
  "LIQUID RIPPLE",         // V03
  "POLYGON SHATTER",       // V04
  "VOXEL FIELD",           // V05
  "SMOKE TRAILS",          // V06
  "FISHEYE DOTS",          // V07
  "ECHO TRAIL INK",        // V08
  "RGB GLITCH",            // V09
  "ASCII RAIN",            // V10
  "FLUID INK SMEAR",       // V11
  "MARQUEE MASK",          // V12
  "IRON FILINGS",          // V13
  "HOLOGRAPHIC CARD",      // V14
  "VERLET MESH",           // V15
  "LIQUID GLASS",          // V16
  "GRAVITY ORBITS",        // V17
  "DEPTH DIORAMA",         // V18
  "SPECTRUM BARS",         // V19
  "NEON RAIN",             // V20
  "QUANTUM MORPH",         // V21
  "LASER FORGE",           // V22
  "DEPTH STACK",           // V23
] as const;

// Render only the active section ± this many neighbours. Anything else is
// an empty placeholder, freeing canvas/WebGL/RAF resources.
const RENDER_RADIUS = 1;

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
    document.title = "DS — Inspo Gallery · 50 hero candidates";
    const desc = "Internal pitch-deck preview of 50 candidate hero animations for the DS site (30 from logo-showcase-supreme + 20 from inspoemergent).";
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); }
    m.setAttribute("content", desc);
  }, []);

  const titleLabel = SECTION_TITLES[current] ?? `Section ${current + 1}`;

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background">
      <h1 className="sr-only">DS — Inspo Gallery · {SECTIONS.length} candidate hero animations</h1>
      <Cursor />
      <SectionIndicator current={current} total={SECTIONS.length} onJump={jump} sectionNames={SECTION_TITLES} />

      {/* Section-name label, top centre */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs uppercase tracking-[0.18em] text-white/90 font-mono">
          <span className="text-white/50">{String(current + 1).padStart(2, "0")} / {SECTIONS.length}</span>
          <span className="mx-3 text-white/30">·</span>
          <span>{titleLabel}</span>
        </div>
      </div>

      <div ref={containerRef} className="snap-container scrollbar-hidden">
        {SECTIONS.map((Section, i) => {
          const inRange = Math.abs(i - current) <= RENDER_RADIUS;
          return inRange ? (
            <Section key={i} />
          ) : (
            // Placeholder — keeps scroll length / snap targets intact, but no
            // canvas, no RAF, no WebGL context.
            <section key={i} className="snap-section bg-background min-h-[100svh]" />
          );
        })}
      </div>
    </main>
  );
};

export default Index;
