// Geometry of the MOKA wordmark, traced from the client's logo.
// Coordinates follow the SVG viewBox 0 0 675 155 (y grows downward).
// Every letter is cut by the brand's signature line between y = 74.5 and y = 79.5.

export type Pt = [number, number];

export const VIEW_W = 675;
export const VIEW_H = 155;
export const CUT_TOP = 74.5;
export const CUT_BOTTOM = 79.5;

function circle(cx: number, cy: number, r: number, n = 72): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
}

export const LETTERS: { id: "M" | "O" | "K" | "A"; tool: string; poly: Pt[] }[] = [
  { id: "M", tool: "Moka pot", poly: [[32, 4], [87, 47], [145, 4], [172, 149], [2, 150]] },
  { id: "O", tool: "Fincan", poly: circle(266, 77, 76) },
  { id: "K", tool: "Chemex", poly: [[381, 7], [508, 7], [467, 77], [508, 149], [385, 149], [407, 77]] },
  { id: "A", tool: "V60", poly: [[597, 4], [671, 149], [522, 149]] },
];

/** The Chemex handle as a cubic path (SVG units), drawn as a stroke. */
export const HANDLE_PATH = "M384,20 C364,20 352,36 352,54 C352,74 368,86 386,86 L393,94";

/**
 * Sutherland–Hodgman clip of a polygon against a horizontal half-plane.
 * keep = "above" keeps y <= limit (upper half in SVG space), "below" keeps y >= limit.
 */
export function clipY(poly: Pt[], limit: number, keep: "above" | "below"): Pt[] {
  const inside = (p: Pt) => (keep === "above" ? p[1] <= limit : p[1] >= limit);
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const cur = poly[i];
    const prev = poly[(i + poly.length - 1) % poly.length];
    const curIn = inside(cur);
    const prevIn = inside(prev);
    if (curIn !== prevIn) {
      const t = (limit - prev[1]) / (cur[1] - prev[1]);
      out.push([prev[0] + (cur[0] - prev[0]) * t, limit]);
    }
    if (curIn) out.push(cur);
  }
  return out;
}

export function halves(poly: Pt[]) {
  return { top: clipY(poly, CUT_TOP, "above"), bottom: clipY(poly, CUT_BOTTOM, "below") };
}

/** SVG polygon points string. */
export const pts = (poly: Pt[]) => poly.map((p) => p.join(",")).join(" ");
