/**
 * DS design tokens. Placeholder values — swap when brand assets arrive.
 * Colors are dual-layer: a neutral canvas + one signal accent.
 * Philosophy: sentence-case typography, restrained motion, dark-first UI.
 */

export const color = {
  ink: {
    950: "#0a0a0a",
    900: "#111111",
    800: "#1c1c1c",
    700: "#2a2a2a",
    500: "#6b6b6b",
    300: "#c8c8c8",
    100: "#f5f5f5",
    50: "#fafafa",
  },
  accent: {
    default: "#0f62fe",
    soft: "#4d8dff",
    muted: "#1a3a7a",
  },
  signal: {
    danger: "#ef4444",
    warn: "#f59e0b",
    ok: "#22c55e",
  },
} as const;

export const typography = {
  family: {
    display: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
    body: "var(--font-body, ui-sans-serif, system-ui, sans-serif)",
    mono: "var(--font-mono, ui-monospace, SFMono-Regular, monospace)",
  },
  size: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
  },
  tracking: {
    tight: "-0.02em",
    normal: "0",
    wide: "0.02em",
  },
} as const;

export const space = {
  px: "1px",
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  6: "1.5rem",
  8: "2rem",
  12: "3rem",
  16: "4rem",
  24: "6rem",
  32: "8rem",
} as const;

export const motion = {
  duration: {
    fast: "120ms",
    base: "200ms",
    slow: "400ms",
    pageTransition: "600ms",
  },
  ease: {
    standard: "cubic-bezier(0.4, 0.0, 0.2, 1)",
    decelerate: "cubic-bezier(0.0, 0.0, 0.2, 1)",
    accelerate: "cubic-bezier(0.4, 0.0, 1, 1)",
  },
} as const;

export const radius = {
  none: "0",
  sm: "0.25rem",
  base: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px",
} as const;

export const tokens = { color, typography, space, motion, radius } as const;
export type DsTokens = typeof tokens;
