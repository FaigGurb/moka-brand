import { HANDLE_PATH, LETTERS, halves, type Pt } from "./logo";

/** Draws the MOKA wordmark (with its signature gap) into a 2D canvas context. */
export function drawWordmark(g: CanvasRenderingContext2D, x: number, y: number, width: number, color: string) {
  const s = width / 675;
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  g.fillStyle = color;
  const poly = (p: Pt[]) => {
    g.beginPath();
    p.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
    g.closePath();
    g.fill();
  };
  LETTERS.forEach((l) => {
    const h = halves(l.poly);
    poly(h.top);
    poly(h.bottom);
  });
  g.strokeStyle = color;
  g.lineWidth = 8;
  g.stroke(new Path2D(HANDLE_PATH));
  g.restore();
}

/** Draws just the Chemex letter (K) with its handle — the cup icon. */
export function drawK(g: CanvasRenderingContext2D, cx: number, cy: number, height: number, color: string) {
  const k = LETTERS.find((l) => l.id === "K")!;
  const s = height / 155;
  g.save();
  g.translate(cx - 445 * s, cy - 77 * s);
  g.scale(s, s);
  g.fillStyle = color;
  const h = halves(k.poly);
  [h.top, h.bottom].forEach((p) => {
    g.beginPath();
    p.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
    g.closePath();
    g.fill();
  });
  g.strokeStyle = color;
  g.lineWidth = 8;
  g.stroke(new Path2D(HANDLE_PATH));
  g.restore();
}

export type CupSize = "S" | "M" | "L";

/**
 * MOKA's official takeaway cup (from the brand book), kept exactly as it is: a white paper cup
 * with the black Chemex letter (K) on the front and the back. u = around, v = bottom→top.
 */
export function paintCupWrap(c: HTMLCanvasElement) {
  const W = c.width;
  const H = c.height;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f7f6f3";
  g.fillRect(0, 0, W, H);
  // subtle paper fibre
  g.globalAlpha = 0.05;
  for (let i = 0; i < 900; i++) {
    g.fillStyle = i % 2 ? "#b8b0a6" : "#ffffff";
    g.fillRect((i * 997) % W, (i * 613) % H, 2, 1);
  }
  g.globalAlpha = 1;
  // centred on the front (u = 0.5) and the back (u = 0 / 1, wrapping)
  for (const cx of [0, W * 0.5, W]) drawK(g, cx, H * 0.55, H * 0.26, "#141414");
  // rim fold
  g.fillStyle = "rgba(0,0,0,0.08)";
  g.fillRect(0, 0, W, H * 0.02);
}
