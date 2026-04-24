# frontendmaxxing-reference — DS rules

This package is a verbatim copy of the upstream `frontendmaxxing` library (vanilla JS + CSS, 36+ components across animations, backgrounds, blocks, components, effects, layout, micro, responsive, svg, typography, utils, demo).

## Hard rule

**Do not import anything in this package from app code.**

This package is a read-only **reference library** for pattern inspiration only. When you want to use a component in a DS app:

1. Pick the component here
2. Port it into [`@ds/ui`](../ui/) as a proper React + Tailwind + shadcn-conventions component
3. Wire it through DS design tokens (`@ds/tokens`)
4. Import the `@ds/ui` version in your app

## First port targets (when a client project needs them)
`hero` · `nav` · `pricing` · `testimonials` · `FAQ` · `footer` · `card` · `modal` · `form` · `marquee` — the 10 sections almost every SMB site needs.

## Do not edit files in place

Treat this package as immutable. If you find a bug in a reference component, fix it in the ported `@ds/ui` version instead.
