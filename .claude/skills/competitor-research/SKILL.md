---
name: competitor-research
description: Run a structured competitive-intelligence pass before any DS client engagement. Given a client name, industry, and optional known competitors, this skill crawls competitor sites with Firecrawl, extracts positioning + pricing + persona + design language, synthesizes cross-site patterns, and writes a grounded Markdown + JSON report under apps/ds-site/public/research/{client-slug}/competitors. Output feeds the pitch deck and the initial site draft.
---

## When to invoke

Trigger on any of:
- "research competitors for {client}"
- "competitive analysis for {industry}"
- "what are {X}'s competitors doing"
- "start a new client engagement" (as a preliminary pass, before site work)

**Do not skip this step on new client engagements.** It's a hard prerequisite in the DS delivery process — Step 1 (Context & External Analysis) in `docs/brand/POSITIONING.md` §5.

## Inputs

1. **Client name** (required)
2. **Industry / vertical** (required)
3. **Known competitors** (optional — 3–5 URLs if the user has them; otherwise we discover via Exa/web search)
4. **Research depth** — "quick" (landing + pricing only), "standard" (landing + pricing + about + one blog), or "deep" (full site crawl) — default *standard*

## Flow

1. **Resolve competitor URLs.** If none given, use Exa / web search to find 3–5 direct competitors in the same vertical + region. Prefer competitors that match the client's rough scale (startup vs SME vs enterprise).
2. **Batch crawl** with Firecrawl MCP. Scrape, per competitor: landing, pricing, about, and one blog or resources page.
3. **Structured extraction.** For each competitor, capture:
   - Positioning line (the one-sentence value prop)
   - Top 3–5 value props
   - Pricing tiers (names, prices, inclusions)
   - Target persona (inferred from copy)
   - Tech signals (stack fingerprinting — look for `<meta name="generator">`, common framework footprints, script URLs)
   - Design language (typography family, dominant color, motion style, notable components)
4. **Cross-site synthesis.**
   - What 3–5 patterns are common across competitors? (eg "all three use a 3-tier pricing grid")
   - What does each uniquely do?
   - Where are the white spaces this client can own?
5. **Grounding verification.** Pick 2 random extracted claims and verify them against live DOM via Chrome DevTools MCP. Flag any that don't match. If more than one fails, redo the extraction — it means the scrape was stale.
6. **Emit outputs** under `apps/ds-site/public/research/{client-slug}/`:
   - `competitors.md` — the narrative report, Challenge → Approach → Recommendations format
   - `competitors.json` — structured data (one `{competitor}` object per site, schema in `packages/research-agents/src/types.ts` once that package exists)

## Confidence scoring

Compute and include in the report header. Weights (modeled on AEGIS's pattern):
- 40% — extraction success rate (how many of the expected fields came out non-empty per competitor)
- 30% — freshness (last-modified headers + scrape recency)
- 30% — coverage (how many of the planned pages returned content)

Threshold: report confidence < 0.6 → ship the report but flag "preliminary" in the header and list the gaps explicitly.

## How to read the report (for the user)

The report isn't a research product; it's a **design brief**. Every finding should map to a decision the DS site draft can make:
- "All three competitors use a 3-tier pricing grid" → decide whether to mirror or differentiate
- "No competitor shows real case studies" → that's a white space, consider a `Transformations` section
- "Competitor X is winning on motion polish" → raise the bar with `premium-motion-pipeline`

## Outputs location

```
apps/ds-site/public/research/{client-slug}/
├── competitors.md       # narrative report
├── competitors.json     # structured data
└── scrape-cache/        # gitignored; raw Firecrawl output
```

## Anti-patterns

- **Don't skip grounding verification.** An LLM-summarized pricing page that doesn't match the actual DOM will embarrass us when the client reads it.
- **Don't boil the ocean.** If the user asks "quick", respect it — 2 pages per competitor is often enough for initial pitch context.
- **Don't rely on landing-page hero copy alone.** It's carefully written marketing; `/pricing` and `/about` reveal actual positioning more faithfully.
- **Don't publish research reports to the public site accidentally.** They live under `apps/ds-site/public/research/` for convenience but must not be linked from nav. Add `noindex` at the route level if this ever becomes a concern.
