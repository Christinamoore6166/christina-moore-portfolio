/**
 * Design tokens, TypeScript mirror.
 *
 * The runtime source of truth is src/app/globals.css (`@theme` + `:root`).
 * This file exists so the style guide and any tooling can list token
 * names, hex values and roles, and compute contrast at build time.
 * Keep the two in step; the hex values here must match the CSS exactly.
 */
import type { Hex } from "./contrast";

export type TokenOrigin = "sampled" | "added" | "derived";
export type TokenUse = "surface" | "fill" | "text" | "text + fill";

export interface ColorToken {
  key: string;
  name: string;
  cssVar: string;
  /** Tailwind colour name: bg-<utility>, text-<utility> */
  utility: string;
  hex: Hex;
  origin: TokenOrigin;
  use: TokenUse;
  role: string;
}

export const palette = {
  ground: {
    key: "ground",
    name: "Ground",
    cssVar: "--color-ground",
    utility: "ground",
    hex: "#EFE9E4",
    origin: "sampled",
    use: "surface",
    role: "Warm greige. The page ground.",
  },
  surface: {
    key: "surface",
    name: "Surface",
    cssVar: "--color-surface",
    utility: "surface",
    hex: "#F7F3EF",
    origin: "sampled",
    use: "surface",
    role: "Raised blocks, a half-step above the ground.",
  },
  rose: {
    key: "rose",
    name: "Rose",
    cssVar: "--color-rose",
    utility: "rose",
    hex: "#E3CFC5",
    origin: "sampled",
    use: "fill",
    role: "Section label bars and small blocks. Chestnut text on it, never white.",
  },
  tan: {
    key: "tan",
    name: "Tan",
    cssVar: "--color-tan",
    utility: "tan",
    hex: "#A08466",
    origin: "sampled",
    use: "fill",
    role: "Numeral blocks. A fill colour, never type.",
  },
  chestnut: {
    key: "chestnut",
    name: "Chestnut",
    cssVar: "--color-chestnut",
    utility: "chestnut",
    hex: "#6B2F22",
    origin: "sampled",
    use: "text + fill",
    role: "Headings, emphasis, the single accent.",
  },
  brown: {
    key: "brown",
    name: "Brown",
    cssVar: "--color-brown",
    utility: "brown",
    hex: "#4A2E24",
    origin: "sampled",
    use: "text",
    role: "Body text.",
  },
  espresso: {
    key: "espresso",
    name: "Espresso",
    cssVar: "--color-espresso",
    utility: "espresso",
    hex: "#2F211C",
    origin: "added",
    use: "surface",
    role: "The floor. Footer and one dark section in light; the page ground in dark.",
  },
  olive: {
    key: "olive",
    name: "Olive",
    cssVar: "--color-olive",
    utility: "olive",
    hex: "#7C7A5E",
    origin: "added",
    use: "fill",
    role: "The counterweight. One job: the hover underline and active-nav marker.",
  },
  clay: {
    key: "clay",
    name: "Clay",
    cssVar: "--color-clay",
    utility: "clay",
    hex: "#D9B9A5",
    origin: "added",
    use: "fill",
    role: "Hover fills and image placeholders.",
  },
  inkInvert: {
    key: "inkInvert",
    name: "Ink invert",
    cssVar: "--color-ink-invert",
    utility: "ink-invert",
    hex: "#EDE4DC",
    origin: "added",
    use: "text",
    role: "Text sitting on espresso.",
  },
  inkMuted: {
    key: "inkMuted",
    name: "Ink muted",
    cssVar: "--color-ink-muted",
    utility: "ink-muted",
    hex: "#74604F",
    origin: "derived",
    use: "text",
    role: "Secondary text on the ground: captions, meta, index detail. Brown pulled toward the ground until it just clears AA.",
  },
  inkInvertMuted: {
    key: "inkInvertMuted",
    name: "Ink invert muted",
    cssVar: "--color-ink-invert-muted",
    utility: "ink-invert-muted",
    hex: "#BFAFA3",
    origin: "derived",
    use: "text",
    role: "Secondary text on espresso.",
  },
  espressoRaised: {
    key: "espressoRaised",
    name: "Espresso raised",
    cssVar: "--color-espresso-raised",
    utility: "espresso-raised",
    hex: "#3A2A24",
    origin: "derived",
    use: "surface",
    role: "Dark-theme raised block. The same half-step that surface makes above ground.",
  },
  espressoLift: {
    key: "espressoLift",
    name: "Espresso lift",
    cssVar: "--color-espresso-lift",
    utility: "espresso-lift",
    hex: "#4A3630",
    origin: "derived",
    use: "fill",
    role: "Dark-theme hover fill and image placeholder. Clay, at night.",
  },
  espressoDeep: {
    key: "espressoDeep",
    name: "Espresso deep",
    cssVar: "--color-espresso-deep",
    utility: "espresso-deep",
    hex: "#231813",
    origin: "derived",
    use: "surface",
    role: "Dark-theme footer and dark section, so the floor still reads as a floor.",
  },
} as const satisfies Record<string, ColorToken>;

export type PaletteKey = keyof typeof palette;
export const paletteList: ColorToken[] = Object.values(palette);

/** Exists only so the style guide can show why the pairing is banned. */
export const offPalette = {
  white: { name: "White", hex: "#FFFFFF" as Hex },
} as const;

export interface SemanticToken {
  /** Tailwind colour name: bg-<utility>, text-<utility> */
  utility: string;
  light: PaletteKey;
  dark: PaletteKey;
  role: string;
  /** true when the value is an alpha mix rather than a flat swatch */
  mixed?: boolean;
}

export const semantic: SemanticToken[] = [
  { utility: "page", light: "ground", dark: "espresso", role: "Page ground" },
  { utility: "raised", light: "surface", dark: "espressoRaised", role: "Raised block, half-step up" },
  { utility: "ink", light: "brown", dark: "inkInvert", role: "Body text" },
  { utility: "ink-soft", light: "inkMuted", dark: "inkInvertMuted", role: "Secondary text" },
  { utility: "accent", light: "chestnut", dark: "rose", role: "Headings, emphasis" },
  { utility: "label", light: "rose", dark: "chestnut", role: "Label bar fill" },
  { utility: "on-label", light: "chestnut", dark: "inkInvert", role: "Text on a label bar" },
  { utility: "numeral", light: "chestnut", dark: "tan", role: "Numeral block fill" },
  { utility: "on-numeral", light: "espresso", dark: "espresso", role: "The numeral itself" },
  { utility: "hover", light: "clay", dark: "espressoLift", role: "Hover fill" },
  { utility: "on-hover", light: "espresso", dark: "clay", role: "Text on a hover fill" },
  { utility: "mark", light: "olive", dark: "olive", role: "Hover underline, active-nav marker" },
  { utility: "rule", light: "brown", dark: "inkInvert", role: "Hairline rules and borders, at low alpha", mixed: true },
  { utility: "placeholder", light: "clay", dark: "espressoLift", role: "Image placeholder" },
  { utility: "inverse", light: "espresso", dark: "espressoDeep", role: "Footer and the one dark section" },
  { utility: "on-inverse", light: "inkInvert", dark: "inkInvert", role: "Text on the inverse block" },
  { utility: "on-inverse-soft", light: "inkInvertMuted", dark: "inkInvertMuted", role: "Secondary text on inverse" },
  { utility: "primary", light: "chestnut", dark: "rose", role: "Primary button fill" },
  { utility: "primary-foreground", light: "inkInvert", dark: "chestnut", role: "Primary button text" },
  { utility: "primary-hover", light: "espresso", dark: "clay", role: "Primary button hover fill" },
];

export interface TypeStep {
  token: string;
  family: "display" | "body";
  size: string;
  lineHeight: string;
  tracking: string;
  role: string;
}

export const typeScale: TypeStep[] = [
  { token: "display-2xl", family: "display", size: "clamp(4.5rem, 2.25rem + 10vw, 12rem)", lineHeight: "0.88", tracking: "-0.025em", role: "The graphic object. Overlaps and crops against photography." },
  { token: "display-xl", family: "display", size: "clamp(3.25rem, 1.75rem + 6.5vw, 8rem)", lineHeight: "0.92", tracking: "-0.02em", role: "Hero name, section openers." },
  { token: "display-lg", family: "display", size: "clamp(2.5rem, 1.5rem + 4vw, 5.5rem)", lineHeight: "0.98", tracking: "-0.015em", role: "The large statement before an index block." },
  { token: "display", family: "display", size: "clamp(2rem, 1.4rem + 2.4vw, 3.75rem)", lineHeight: "1.05", tracking: "-0.01em", role: "Section titles." },
  { token: "h1", family: "display", size: "clamp(1.875rem, 1.5rem + 1.5vw, 2.75rem)", lineHeight: "1.1", tracking: "-0.01em", role: "Sub-section titles." },
  { token: "h2", family: "display", size: "clamp(1.5rem, 1.25rem + 1vw, 2rem)", lineHeight: "1.15", tracking: "0", role: "Gallery and index headings." },
  { token: "h3", family: "display", size: "clamp(1.25rem, 1.15rem + 0.4vw, 1.5rem)", lineHeight: "1.25", tracking: "0", role: "Item titles inside an index." },
  { token: "lead", family: "body", size: "clamp(1.125rem, 1.05rem + 0.35vw, 1.375rem)", lineHeight: "1.5", tracking: "0", role: "Intro paragraphs and blurbs." },
  { token: "body", family: "body", size: "1.0625rem", lineHeight: "1.6", tracking: "0", role: "Running text." },
  { token: "small", family: "body", size: "0.875rem", lineHeight: "1.5", tracking: "0", role: "Index detail, buttons." },
  { token: "caption", family: "body", size: "0.75rem", lineHeight: "1.4", tracking: "0", role: "Photo captions, footnotes." },
  { token: "eyebrow", family: "body", size: "0.6875rem", lineHeight: "1", tracking: "0.16em", role: "Letter-spaced caps above a heading." },
];

export interface ScaleEntry {
  token: string;
  value: string;
  role: string;
}

export const spacing: ScaleEntry[] = [
  { token: "gutter", value: "clamp(1.25rem, 4vw, 3.5rem)", role: "Page margin. Photography sits hard against it or bleeds through it." },
  { token: "stack", value: "clamp(1.25rem, 2vw, 2rem)", role: "Between related elements: eyebrow, heading, paragraph." },
  { token: "block", value: "clamp(2.5rem, 5vw, 5rem)", role: "Between blocks inside a section." },
  { token: "section", value: "clamp(5rem, 10vw, 10rem)", role: "Between sections." },
];

export const radii: ScaleEntry[] = [
  { token: "none", value: "0", role: "Images, panels, blocks. The default." },
  { token: "xs", value: "2px", role: "Buttons and chips. Enough to stop corners catching." },
  { token: "sm", value: "4px", role: "Form fields." },
  { token: "full", value: "9999px", role: "Dots and markers only." },
];

export const durations: ScaleEntry[] = [
  { token: "fast", value: "150ms", role: "Colour and opacity hovers." },
  { token: "base", value: "240ms", role: "Underlines and small moves." },
  { token: "slow", value: "480ms", role: "Image zoom." },
  { token: "reveal", value: "720ms", role: "Scroll reveal." },
];

export const easings: ScaleEntry[] = [
  { token: "standard", value: "cubic-bezier(0.2, 0, 0, 1)", role: "Default for state changes." },
  { token: "out", value: "cubic-bezier(0.22, 1, 0.36, 1)", role: "Entrances and reveals. Fast start, long settle." },
  { token: "in-out", value: "cubic-bezier(0.65, 0, 0.35, 1)", role: "Things that move and come back." },
];

export const fonts = {
  display: {
    name: "Newsreader",
    cssVar: "--font-display",
    utility: "font-display",
    detail: "Variable, 200 to 800, optical size 6 to 72, true italics.",
  },
  body: {
    name: "Work Sans",
    cssVar: "--font-body",
    utility: "font-body",
    detail: "Variable, 100 to 900, true italics.",
  },
} as const;
