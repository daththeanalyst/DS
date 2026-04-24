# assets/motion-inspiration/

Reference imagery for the premium motion pipeline (Flux 1.1 Pro → Veo 3.1 → ffmpeg → WebP sequence → GSAP ScrollTrigger).

## What's here

The images in this folder are the user's initial references for the DS hero-section motion style:

- **`Gemini_Generated_Image_9sucg9sucg9sucg9.png`** and **`Gemini_Generated_Image_azqecnazqecnazqe.png`** — AI-generated reference images, intended as candidate keyframes for the first Veo 3.1 first-last-frame interpolation test.
- **`MacBook *.jpeg`** — reference screenshots of the visual target (Apple-style product hero composition).
- **`WhatsApp Image 2026-04-24 at 12.28.57.jpeg`** — additional reference supplied by the user.

## Where these feed into

- [`docs/PREMIUM-MOTION-PIPELINE.md`](../../docs/PREMIUM-MOTION-PIPELINE.md) — the step-by-step recipe
- [`.claude/skills/premium-motion-pipeline/SKILL.md`](../../.claude/skills/premium-motion-pipeline/SKILL.md) — when to invoke + prompt patterns
- [`packages/motion-sequences/`](../../packages/motion-sequences/) — Phase 2 lib (not yet built)

## Rules

- **Don't commit generated frame sequences here.** Rendered output (120+ WebP frames per hero) is gitignored at `assets/motion-sequences/generated/` and lives on a CDN instead. Only curated references belong in this folder.
- **Don't delete user-supplied references** without asking — these are the ground truth for the DS visual target.
