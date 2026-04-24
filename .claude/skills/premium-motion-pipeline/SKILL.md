---
name: premium-motion-pipeline
description: DS's cinematic-hero pipeline. Use when a client wants a scroll-scrubbed, "3D-feeling" hero animation without a real 3D runtime. Generates two AI keyframes with Flux 1.1 Pro, interpolates them into a video with Google Veo 3.1 (first-last-frame mode), extracts frames with ffmpeg, compresses to WebP + AVIF, and scrubs them on scroll with GSAP ScrollTrigger. Much cheaper and more performant than React Three Fiber for non-interactive heroes.
---

## When to invoke

Trigger on any of:
- "premium hero animation"
- "Apple-style scroll animation"
- "3D-feeling hero" (note: *feeling*, not actual 3D — for real-time 3D use the deferred Blender/R3F skill)
- "cinematic product reveal on scroll"
- "scroll-scrubbed video frames"

Do **not** invoke for real-time interactivity (rotatable 3D models, product configurators). Those need React Three Fiber — defer until DS adds the `3d-core` package.

## What this pipeline produces

A scroll-driven image-sequence hero that visually matches what viewers associate with real 3D. Industry examples: Apple MacBook / Vision Pro product pages, high-end SaaS landings.

Cost per finished hero: roughly **$5–20** in AI API calls + **2–4 hours** of curation/iteration. Compare to 20–80 hours of 3D artist time for comparable polish in R3F.

## The pipeline (7 steps)

### 1. Generate keyframe 1 (start state)
- Model: **Flux 1.1 Pro** via fal.ai or Replicate
- Prompt pattern (physics-first — this is the secret): specify **light source position and angle**, **camera distance and angle**, **material finish**. Avoid vague words like "cinematic" or "beautiful".
- Example prompt scaffold:
  > *"[Product], shot at [specific angle/distance], lit by [specific source: studio backlighting from upper-left / golden-hour through window / overhead softbox], with [material: brushed aluminum / matte ceramic / polished glass]. Camera position: [specific]. Depth of field: [shallow/deep]."*

### 2. Generate keyframe 2 (end state)
- Same model, same lighting physics, different camera angle OR different product state
- **Critical:** geometry and lighting must match keyframe 1. Mismatched lighting = muddy interpolation.
- Save both at **1024×1024 or 1920×1080** PNG.

### 3. Interpolate to video
- **Primary:** Google **Veo 3.1 "first-last-frame to video" mode** — native feature. Via Gemini API, Vertex AI, or fal.ai.
- **Fallback:** **Kling O1 dual-keyframe** mode via fal.ai (use if Veo 3 access is gated or quality is poor for a specific scene)
- Output: **8-second 720p–4K MP4**. Generation takes 11s–6min depending on load.

### 4. Extract frames
```bash
ffmpeg -i input.mp4 -r 15 frame_%04d.png
```
- **15 fps × 8 seconds = 120 frames** — the sweet spot for a 1.5MB WebP budget
- Output folder: `assets/motion-sequences/generated/{client-slug}/raw/`

### 5. Compress to WebP (+ AVIF fallback)
```bash
# Per frame (batch with a loop)
cwebp -q 85 raw/frame_0001.png -o webp/frame_0001.webp
avifenc --min 30 --max 40 raw/frame_0001.png avif/frame_0001.avif
```
- Target budget per sequence: **≤ 1.5 MB WebP** / **≤ 1 MB AVIF**
- Per-frame after compression: roughly 10–15 KB WebP / 8–12 KB AVIF at 1080p

### 6. Deliver on site
- Preload **all frames** in `<head>` with `<link rel="preload" as="image" fetchpriority="high">`
- Serve via `<picture>` with AVIF → WebP fallback
- Render into `<canvas>` via `requestAnimationFrame` (canvas-based sequence scrubbing has less jank than swapping `<img src>`)
- Mobile < 576px: serve a **static poster image**, skip the scroll scrub entirely

### 7. Scroll-scrub with GSAP ScrollTrigger
```js
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.create({
  trigger: "#hero",
  start: "top top",
  end: "+=3000",
  scrub: 1,
  pin: true,
  onUpdate: (self) => {
    const frameIndex = Math.round(self.progress * (frameCount - 1));
    drawFrame(frameIndex); // renders to <canvas>
  },
});
```
Optionally pair with **Lenis** for smooth-scroll feel.

## The lib that lives in the monorepo

Phase-2 deliverable: `packages/motion-sequences/` exports:
- `generate.ts` — orchestrates Flux + Veo 3 through fal.ai SDK
- `extract.ts` — shells out to ffmpeg
- `compress.ts` — WebP + AVIF
- `<ScrollFrameSequence client="acme" sequence="hero" />` React component (consumed from `@ds/ui`)

## Canonical references

- Google Veo 3.1 docs: https://ai.google.dev/gemini-api/docs/video
- Builder.io deep dive (GSAP + Veo 3 + canvas): https://www.builder.io/blog/3d-gsap
- Open-source: https://github.com/olivier3lanc/Scroll-Frames · https://github.com/emanuelefavero/apple-scroll-animation
- Full recipe + rationale: `docs/PREMIUM-MOTION-PIPELINE.md`

## Anti-patterns

- **Don't scrub `<video currentTime>` directly.** Async playhead updates jank on mobile — canvas image sequences don't.
- **Don't lazy-load the first frame.** Hero LCP must be present at FCP, preloaded.
- **Don't pre-generate sequences speculatively.** Real API money per sequence; generate on-demand per client, not as template filler.
- **Don't skip the mobile static fallback.** Scroll-scrub below 576px is a UX disaster on low-end Android.
- **Don't burn cycles in the wrong phase.** If a client doesn't have premium-hero positioning, a traditional static hero + one well-placed Framer Motion flourish outperforms a half-polished scroll sequence.
