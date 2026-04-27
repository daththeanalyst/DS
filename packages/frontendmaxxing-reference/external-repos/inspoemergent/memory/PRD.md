# DS2 — Animation Lab PRD

## Original Problem Statement
Design and write the code architecture for an insanely animated, highly immersive website for a motion design studio ("DS2"). The user later refined this into a request for **mouse-interactive, scroll-adaptive hero animations** of the supplied DS2 logo PNGs — first 10 variants, later expanded to **15** with the requirement that the new five use entirely different animation concepts, physics, and visual aesthetics.

## Current Product (Feb 2026)
A single-page React application that showcases **15 frame-by-frame, cursor-reactive variations** of the DS2 logo, stacked as full-viewport scroll sections.

## Key Features Implemented
- 4 supplied DS2 logo PNGs at `/app/frontend/public/logos/` (`ds2-a.png` is the canonical white-on-black source used by every variant).
- Shared `sampleLogo()` utility (`/app/frontend/src/lib/logoSampler.js`) — loads PNG, paints to offscreen canvas, returns normalized particle positions + brightness map (memoized).
- `useScrollProgress` hook returns per-section [0..1] progress and active flag based on `getBoundingClientRect`.
- `VariantShell` wrapper — full-viewport section, lazy-mounts canvas via `IntersectionObserver`, exposes scroll progress + active to children, displays "VARIANT / NN OF 15" indicator.
- Each Scene gates `renderer.render()` / canvas RAF body on `state.current.active`, keeping perf stable with 6 WebGL + 9 Canvas2D potential contexts.
- Right-edge `VariantNavRail` shows 15 dots; current variant highlighted; click-to-scroll.
- Updated Navbar (`Particles · Voxels · Fluid · Holo · Mesh` quick jumps) and `LabFooter` ("15 / 15 studies").

### The 15 Variants
| # | Title | Engine | Effect |
|---|-------|--------|--------|
| 01 | Particle Assembly | WebGL ShaderMaterial · Additive points | Particles fly in from a sphere; cursor radial repulsion; scroll drives assembly |
| 02 | Magnetic Dot Grid | WebGL · 200×80 lattice | Cursor pulls dots toward itself; brightness from logo sample |
| 03 | Liquid Ripple | Canvas 2D · 80 horizontal slices | Radial cursor displacement + click-to-drop wave |
| 04 | Polygon Shatter | Canvas 2D · 26×14 shard lattice | Shards repel from cursor; scroll explodes the lattice |
| 05 | Voxel Height Field | WebGL · InstancedMesh of ~5000 cubes | Brightness-mapped extrusion; cursor lifts columns |
| 06 | Smoke Trails | WebGL · per-particle trajectories | Each particle drifts upward with phase; cursor blows smoke |
| 07 | Fisheye Dot Matrix | Canvas 2D · 160-col grid | Lens bulge displacement around cursor |
| 08 | Echo Trail Ink | Canvas 2D · persistence buffer | Cursor paints gradient strokes that compose with logo |
| 09 | RGB Chromatic Glitch | Canvas 2D · channel split + scanlines | Cursor offsets R/G/B channels; scroll increases glitch |
| 10 | ASCII Character Rain | Canvas 2D · monospaced glyphs | Brightness → glyph; cursor scrambles nearby characters |
| **11** | **Fluid Ink Smear** | **WebGL · Ping-pong feedback** | **Cursor's velocity advects a feedback texture; logo is fresh ink injected each frame** |
| **12** | **Typographic Marquee Mask** | **CSS mask · 6 scrolling rows** | **DS2 silhouette clips bright multi-row marquees over a dim background** |
| **13** | **Iron-Filings Field** | **Canvas 2D · Brightness gradient flow** | **Field lines flow tangent to logo gradient — they wrap around the letters; cursor swirl pole** |
| **14** | **Holographic Tilt Card** | **Framer Motion · 3D rotateX/Y · Conic sheen** | **Trading-card 3D tilt; chromatic-split logo; iridescent conic gradient sheen follows light** |
| **15** | **Verlet Spring Mesh** | **Canvas 2D · Verlet integration · Spring constraints** | **Logo rendered as a connected node mesh; cursor drag stretches springs; mouse-down = stronger pull** |

## Architecture
```
/app/frontend/
├── public/logos/ds2-{a,b,c,d}.png     # source DS2 PNGs
└── src/
    ├── lib/logoSampler.js              # shared PNG → particle positions
    ├── hooks/useScrollProgress.js      # 0..1 scroll progress + active flag
    ├── App.js                          # composes navbar, intro, V01..V15, footer
    └── components/
        ├── IntroHero.jsx               # hero opener with 15-chip grid
        ├── VariantNavRail.jsx          # sticky 15-dot rail
        ├── LabFooter.jsx
        └── variants/
            ├── VariantShell.jsx
            └── V01Particles.jsx … V15VerletMesh.jsx
```

## Performance Strategy
- `IntersectionObserver` defers Scene mount until a section is within 200px of the viewport.
- Each Scene checks `state.current.active` before rendering; off-screen sections idle the rAF loop.
- 6 WebGL contexts (V01/V02/V05/V06/V11) + 9 Canvas2D — bounded acceptable count; tested 100% non-freezing end-to-end.
- Cached: `sampleLogo` memoizes per source/step; V09 channel canvases built once; V11 ping-pong RTs disposed in cleanup.

## Tech Stack
- React 19 + Tailwind + shadcn/ui (DS2 brand tokens preserved)
- three @0.184 (no `@react-three/drei` dependency)
- gsap, framer-motion (V14 uses Motion's springs and useTransform)

## Backlog / Roadmap
- P2 polish: replace `setInterval` rAIL polling in `VariantNavRail` with IntersectionObserver.
- P2: hysteresis IntersectionObserver in `VariantShell` to *unmount* canvases >2 screens away (frees GPU context).
- P2: `loading="lazy"` on V14 non-primary `<img>` layers.
- P3: Lenis smooth-scroll for inertia; 2×5×n compare-grid mosaic page; route-level Framer Motion `<AnimatePresence>` transitions.
