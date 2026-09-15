/**
 * WCAG 2.x contrast maths. Pure functions, safe in server components.
 */
export type Hex = `#${string}`;

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function hexToRgb(hex: Hex): [number, number, number] {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ];
}

export function relativeLuminance(hex: Hex): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Contrast ratio between two colours, 1 to 21. Order does not matter. */
export function contrastRatio(a: Hex, b: Hex): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return (hi + 0.05) / (lo + 0.05);
}

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(ratio >= 10 ? 1 : 2)}:1`;
}

export type WcagGrade = "AAA" | "AA" | "AA large" | "fill only";

/** Grade for text use. 3:1 is also the floor for non-text UI marks. */
export function wcagGrade(ratio: number): WcagGrade {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA large";
  return "fill only";
}
