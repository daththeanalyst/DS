# DS — Digital Solutions Consultancy

> *Athens–London based. We help organizations design and deliver digital products — through consulting, design, and hands-on development. Clients engage us for advisory, delivery, or end-to-end support.*

**Founders:** Dath (Head of Engineering & Data) + Stelios (Head of Strategy & Consulting).

This is the DS monorepo — one repo holding the company site, all client projects, the shared component kit, the chatbot core, the research agents, and the premium motion pipeline.

---

## Get started

```bash
pnpm install        # from repo root
pnpm dev            # starts turbo dev for all apps
pnpm --filter @ds/site dev   # just the DS site
```

Node ≥ 20, pnpm 9+.

### First time? Read these, in order
1. [docs/brand/POSITIONING.md](docs/brand/POSITIONING.md) — who we are and how we work
2. [docs/ONBOARDING.md](docs/ONBOARDING.md) — setup + the first week
3. [CLAUDE.md](CLAUDE.md) — how Claude Code is configured for this repo
4. [docs/SKILLS-AND-REPOS.md](docs/SKILLS-AND-REPOS.md) — every skill / subagent / MCP / external repo we use

---

## What lives where

| Path | What |
|---|---|
| [apps/ds-site/](apps/ds-site/) | The DS company site (Next.js 15) |
| `apps/{client-slug}/` | One app per client engagement (created by `client-project-scaffold` skill) |
| [packages/ui/](packages/ui/) | Shared React component library (shadcn/Tailwind) |
| [packages/frontendmaxxing-reference/](packages/frontendmaxxing-reference/) | Read-only vanilla JS/CSS inspiration — port to `@ds/ui` on demand |
| [packages/ds-tokens/](packages/ds-tokens/) | Design tokens (colors, typography, motion) |
| [packages/eslint-config/](packages/eslint-config/) | Shared ESLint 9 flat config |
| [packages/tsconfig/](packages/tsconfig/) | Shared TypeScript configs |
| `packages/chatbot-core/` | *(Phase 2)* Anthropic SDK wrapper + RAG |
| `packages/research-agents/` | *(Phase 2)* Competitor + website research agents |
| `packages/motion-sequences/` | *(Phase 2)* Flux → Veo 3 → scroll-scrubbed frames |
| [docs/](docs/) | Brand, onboarding, delivery checklist, motion pipeline, skill index |
| [.claude/](.claude/) | Skills, subagents, commands, rules, hooks |
| [assets/motion-inspiration/](assets/motion-inspiration/) | User-supplied reference imagery for motion work |

---

## How we engage with clients

Three modes, per [docs/brand/POSITIONING.md §6](docs/brand/POSITIONING.md#6-engagement-modes):

1. **Consulting-only** — advisory, discovery, architecture. Standalone and independent.
2. **Build-only** — website / app / MVP from spec. Delivery-focused.
3. **End-to-end** — discovery → design → build → launch. One accountable partner.

Plus optional monthly **Stewardship** for 1–3. See the positioning doc.

---

## Plan of record

The foundation plan for this repo lives at `C:\Users\Dath\.claude\plans\before-we-do-anytihng-staged-hamming.md`. When reality diverges from the plan, update the plan.
