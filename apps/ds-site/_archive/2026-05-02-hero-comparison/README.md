# Archive — 2026-05-02 — Hero comparison scaffolding

This folder snapshots the six (then five, after raymarch was rejected) hero candidates that were stacked on the DS2 homepage during the hero-direction decision sprint, before the actual production hero was built.

## What's here

- `heroes/` — the five candidate animation components plus the shared `hero-shell.tsx` wrapper
- `page.tsx.bak` — `apps/ds-site/src/app/page.tsx` as it was when the candidates were live (5 `<HeroShell>` sections stacked above the content)

## Decision

After scrolling through the stack, **Dimitris picked V07 (Fisheye Dot Matrix)** from `apps/inspo-gallery` as the production hero direction. The five candidates here were dropped from the active build on 2026-05-02 to clear the way for the real DS2 hero.

## How to restore one

If we ever want to revive a candidate:

1. Copy the relevant `anim-*.tsx` back to `apps/ds-site/src/components/heroes/`
2. Copy `hero-shell.tsx` back if needed (it's standalone, no other dependencies inside `src/`)
3. Restore the imports + `<HeroShell>` block in `apps/ds-site/src/app/page.tsx`
4. The brightness sampler at `apps/ds-site/src/lib/logo-sampler.ts` is still live — needed by particle-assembly, iron-filings, ascii-rain
5. `MarchingCubes` (used by anim-isosurface) ships with `three/examples/jsm/objects/MarchingCubes.js` — still installed

## Why the candidates were dropped

- **Particle Assembly** — heavy WebGL, hold-state read as static after assembly completed
- **Isosurface (Mercury Chrome)** — premium look but the chrome readability of the wordmark was inconsistent
- **Iron Filings** — clean Canvas 2D field-line flow; viable fallback
- **ASCII Rain** — distinctive but read as gimmicky once the brand copy was overlaid
- **Strata (Depth Layers)** — additive blending blew out on bright displays
- **Raymarch (Etched Glass)** — explicitly rejected by Dimitris ("the 3d is terrible") on 2026-05-02

## Context

See the brainstorming + decision history in the inspo-gallery deployment at `daththeanalyst.github.io/DS/`, which carries 33 numbered animation variants. Dimitris's shortlist before this comparison: variants 55, 43, 40, 31 (if static), 30, 7 (chosen — "fixable"), 2.
