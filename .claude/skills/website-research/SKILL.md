---
name: website-research
description: Decompose a single website into its information architecture and component blocks. Given a URL, fetches the sitemap, classifies pages by type, and for each page identifies the blocks (hero, nav, value-prop grid, testimonials, pricing, FAQ, footer, CTA sections) so we can map findings to DS's reusable component kit. Used early in any client engagement to understand the client's current site before proposing a rebuild.
---

## When to invoke

Trigger on:
- "analyze {URL}"
- "what's the structure of {X}"
- "decompose {site}"
- As **Step 2 (Technical & Digital Assessment)** of the DS delivery process (POSITIONING.md §5) — required on any rebuild engagement

## Inputs

1. **URL** (required) — usually the client's current site, sometimes a specific competitor page we want to dissect
2. **Depth** — "landing-only", "full-site" (default), or "specific-pages" (with a list)

## Flow

1. **Fetch the sitemap.** Try `/sitemap.xml`; if absent, fall back to Firecrawl's crawl with `depth=3`, `limit=40`.
2. **Classify each page.** By URL heuristics + content sampling:
   - `landing` (root, product, home variants)
   - `pricing`
   - `about`
   - `blog` / `resources`
   - `product` / `service` detail
   - `case-study` / `work`
   - `legal` (privacy, terms, cookie)
   - `auth` (login, signup)
   - `other`
3. **Decompose each classified page** into component blocks:
   - `hero` (main above-fold block)
   - `nav` (primary + secondary if present)
   - `value-prop-grid` (3–5-column "what we do" type sections)
   - `testimonials` / `social-proof`
   - `pricing-table`
   - `FAQ`
   - `footer`
   - `CTA-section` (large conversion blocks)
   - `feature-split` (alternating text-media rows)
   - `logo-wall`
   - `stats-bar`
   - `video-embed` / `media-hero`
4. **Emit outputs** under `apps/ds-site/public/research/{client-slug}/`:
   - `site-map.md` — tree view of classified pages with a one-line summary each
   - `components-inventory.md` — "this site uses X heroes, Y value-prop grids, Z…" and which pages each block appears on
   - `component-shopping-list.md` — the list of `@ds/ui` components we'd need to build or port from `frontendmaxxing-reference` to rebuild this client's site

## How this hands off

The `component-shopping-list.md` goes directly into the rebuild planning. If the list has a component that's not yet in `@ds/ui`, that's a port task against `packages/frontendmaxxing-reference/`. If neither has it, it's a new design decision — invoke the `frontend-design` skill.

## Anti-patterns

- **Don't treat every page as unique.** Client sites usually have strong templates — when you see 6 pages with the same hero shape, report it as one `hero-pattern-A used on [...]`, not as six separate findings.
- **Don't name blocks generically.** `hero-A`, `hero-B`, `hero-C` across a report loses signal. Give them descriptive shorthand: `dark-video-hero`, `text-left-image-right-hero`, `centered-serif-hero`.
- **Don't skip the footer.** Footer links often reveal hidden pages (legal, careers, small-print sales terms) that a crawl-only pass misses.
- **Respect robots.txt and rate limits.** Firecrawl handles this, but don't override its throttling.
