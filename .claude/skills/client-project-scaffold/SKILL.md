---
name: client-project-scaffold
description: One-shot scaffolding for a new DS client project inside the monorepo. Creates apps/{client-slug}/ from templates/client-starter, seeds the research folder (with stubs for competitors.md and site-map.md), opens a delivery checklist, and wires the new app into turbo.json + pnpm-workspace.yaml. Run this skill every time a new client engagement starts — it's the structured "new client" one-shot.
---

## When to invoke

Trigger on:
- "new client project for {name}"
- "start a site for {client}"
- "scaffold {client}"

## What it produces

A ready-to-develop client app at `apps/{client-slug}/`:

```
apps/{client-slug}/
├── package.json                # name: "@ds/client-{slug}"
├── next.config.mjs
├── tsconfig.json               # extends @ds/tsconfig/nextjs
├── postcss.config.mjs
├── src/app/
│   ├── layout.tsx              # imports @ds/tokens/css
│   ├── page.tsx                # hero + honesty subhead scaffold from POSITIONING.md §9
│   └── globals.css             # Tailwind 4 + DS token mapping
├── public/
│   └── research/{client-slug}/
│       ├── competitors.md      # stub — populated by competitor-research skill
│       ├── site-map.md         # stub — populated by website-research skill
│       └── .gitkeep
└── DELIVERY.md                 # client-specific checklist (copy of docs/DELIVERY-CHECKLIST.md with client-slug interpolated)
```

## Inputs

1. **Client name** (required) — e.g. "Acme Coffee"
2. **Client slug** (optional) — auto-derived from the name if omitted (lowercase, dashes): "acme-coffee"
3. **Engagement type** — "consulting-only" (no `apps/` app, just `docs/engagements/{slug}/`), "build-only", "end-to-end" (default)
4. **Existing URL** (optional) — if the client has a current site, we immediately queue `website-research` against it

## Flow

1. **Create the client app directory** from `templates/client-starter/` (verbatim copy with slug-interpolation on name fields)
2. **Wire the new app into the monorepo:**
   - pnpm-workspace.yaml already globs `apps/*` — no change needed
   - Create a Vercel project placeholder (actual provisioning happens later via Vercel MCP when deploying)
3. **Seed research folder** under `apps/{slug}/public/research/{slug}/`
4. **If existing URL is provided:** invoke `website-research` skill against it and write results into the research folder
5. **Invoke `competitor-research` skill** in parallel if industry is known
6. **Create `apps/{slug}/DELIVERY.md`** — a client-specific copy of the DS delivery checklist with the slug interpolated
7. **Open the next-steps checklist** for the user (first four items: kickoff call scheduled? POSITIONING doc for this client written? research agents run? budget for motion pipeline confirmed?)

## Consulting-only variant

If engagement type = "consulting-only", **do not create `apps/{slug}/`**. Instead create:

```
docs/engagements/{slug}/
├── README.md                   # scope + independence statement
├── diagnosis.md                # to be filled from Step 2 of the delivery process
├── findings-and-options.md     # the proposed solution + alternatives
└── decision-log.md             # client's decisions + rationale
```

Consulting engagements explicitly state DS independence per POSITIONING.md §6: *"Our consulting can be completely standalone — some clients implement internally or with other vendors."*

## Naming conventions

- **Package name:** `@ds/client-{slug}` (e.g. `@ds/client-acme-coffee`)
- **Vercel project:** `ds-{slug}` (e.g. `ds-acme-coffee`)
- **Git branches for this client's work:** `client/{slug}/{feature}` (e.g. `client/acme-coffee/hero-redesign`)

## Anti-patterns

- **Don't start client work before research agents run.** If the competitor-research and website-research skills haven't produced output, the first site draft will be generic.
- **Don't copy more than the slug into the template.** Every client deserves a positioning conversation, not a cookie-cutter hero.
- **Don't commit client brand assets into the public monorepo** if the client's engagement predates a public announcement. Use `apps/{slug}/public/` and rely on `.gitignore` patterns for pre-announcement material if needed.
