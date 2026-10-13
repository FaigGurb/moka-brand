/**
 * Photoreal stills for the cinema stages (AI-generated product photography, MOKA's cup carries the
 * official K composited from the brand vector). Files: web/public/cinema/<name>-<w>.webp, cut with
 * docs/tools/film/stills.py, which prints the entry to paste here.
 */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type Still = { name: string; widths: number[]; aspect: number };

export const STILLS = {
  hero: { name: "hero", widths: [960, 1600], aspect: 1.7768 },
  beanGreen: { name: "bean-green", widths: [960, 1600, 2400], aspect: 1.7917 },
  beanLight: { name: "bean-light", widths: [960, 1600, 2400], aspect: 1.7917 },
  beanDark: { name: "bean-dark", widths: [960, 1600], aspect: 1.7797 },
  beanCrack: { name: "bean-crack", widths: [960, 1600], aspect: 1.7797 },
  grind: { name: "grind", widths: [960, 1600], aspect: 1.7797 },
  pour: { name: "pour", widths: [960, 1600], aspect: 1.7797 },
  chemex: { name: "chemex", widths: [960, 1600], aspect: 1.7797 },
  cup: { name: "cup", widths: [960, 1600], aspect: 1.7768 },
} satisfies Record<string, Still>;

export const stillSrc = (s: Still, w = s.widths[0]) => `${BASE}/cinema/${s.name}-${w}.webp`;

export const stillSrcSet = (s: Still) => s.widths.map((w) => `${stillSrc(s, w)} ${w}w`).join(", ");
