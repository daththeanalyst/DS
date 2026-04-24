---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

---

## DS-Specific Overlay (when working inside the DS monorepo)

When this skill runs against code inside the DS monorepo (`apps/*` or `packages/ui`), the universal guidance above still applies — but layer these DS-specific constraints on top. When they conflict, DS rules win for client work; creative freedom still reigns for internal prototypes.

### 1. DS brand voice (from `docs/brand/POSITIONING.md`)
- **Sentence-case headlines.** Not Title Case. Reads more modern, consulting-grade.
- **"You/we" language.** Candid, collaborative, truth-teller — never performative.
- **Avoid fluff words.** "innovation", "synergy", "transformation" (unqualified), "guru", "ninja", "hybrid innovation studio" — these read as corporate fluff to procurement buyers. Prefer concrete verbs and nouns.
- **The honesty rhythm.** Don't write "this is wrong" / "we don't like this". Write "this creates risk because…", "this may not scale due to…", "from experience this usually leads to…". This protective framing is the DS voice.

### 2. Default stack for DS and client sites
- **Next.js 15 App Router** + **TypeScript** + **Tailwind 4** + **shadcn/ui** (primary)
- **React 19** (current default)
- **Tailwind 4 CSS-first config** (`@import "tailwindcss"` + `@theme` block in `globals.css`, not a `tailwind.config.ts` file)
- Tokens come from **`@ds/tokens`** (css + ts). Do not hardcode colors or motion values — reference tokens.
- Motion library: **Framer Motion** for general interactions, **GSAP ScrollTrigger** for scroll-driven frame sequences (see `premium-motion-pipeline` skill).

### 3. Dark-first, restrained
- DS defaults to **dark theme** (`--ds-ink-950` canvas, `--ds-ink-100` text). Light mode is a follow-on, not the default.
- **Restrained motion.** Motion serves meaning — don't scatter micro-interactions. One orchestrated entrance, one scroll-scrubbed hero (when appropriate), and meaningful hover states. That's enough.
- **Glassmorphism / bento grids / parallax** are available in the kit, but use them with intent. A DS client-site landing page might use a bento grid for "What we do"; a consulting-heavy B2B site often doesn't need any of it.

### 4. Hero / scroll story for client landing pages
For a consulting-style client landing page, default to the DS homepage scroll story from POSITIONING.md §9:
1. Hero (value prop + honesty subhead + two CTAs)
2. What we do (3–5 capability cards)
3. What makes us different (the client's differentiator, in honesty-model form)
4. Process preview
5. Proof (2–4 case studies, *Problem → Approach → Outcome*)
6. Trust signals
7. Engage us (three-pathway split)
8. Final CTA

For non-consulting clients (e-commerce, SaaS, portfolio), adapt. Start from the client's positioning doc, not this template.

### 5. Where to import components from
- **First choice:** `@ds/ui` (the React shadcn-based shared library)
- **Second choice:** shadcn/ui MCP — install straight into `packages/ui` or the client app
- **Inspiration only:** `packages/frontendmaxxing-reference/` — vanilla JS/CSS, read-only. When you want a component pattern that's there, port it into `@ds/ui` as a proper React component; do **not** import from the reference package directly.
- **Third-party:** Fine to bring in `@radix-ui/*`, `framer-motion`, `@react-three/fiber` (if a client pays for 3D), `gsap`. Avoid introducing a second UI system (no Chakra/Mantine/MUI alongside shadcn).

### 6. Case-study page rule: "Transformation Story", not "Before & After"
When building a `/work/{client}` page that shows a rebuild, use the Transformation Story format (POSITIONING.md §10): Snapshot → Challenge → What we changed (**decisions, not features**) → Solution → Outcome. Never a naked before/after slider. Same viewport and crop in paired images.

### 7. Accessibility and performance are non-negotiable
- Lighthouse ≥ 90 on perf + a11y + SEO + best-practices for every client site before delivery
- Hero LCP image preloaded; no layout shift
- Motion respects `prefers-reduced-motion`
- Every interactive element keyboard-reachable; focus rings visible
- See `docs/DELIVERY-CHECKLIST.md` for the full handoff gate
