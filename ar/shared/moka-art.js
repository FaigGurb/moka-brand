// MOKA brand drawing helpers shared by the AR pages (no dependencies).
// Geometry mirrors web/src/lib/logo.ts: viewBox 675×155, every letter cut by the line y 74.5–79.5.

export const CUT_TOP = 74.5;
export const CUT_BOTTOM = 79.5;

function circle(cx, cy, r, n = 72) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
}

export const LETTERS = [
  { id: 'M', poly: [[32, 4], [87, 47], [145, 4], [172, 149], [2, 150]] },
  { id: 'O', poly: circle(266, 77, 76) },
  { id: 'K', poly: [[381, 7], [508, 7], [467, 77], [508, 149], [385, 149], [407, 77]] },
  { id: 'A', poly: [[597, 4], [671, 149], [522, 149]] },
];
export const HANDLE_PATH = 'M384,20 C364,20 352,36 352,54 C352,74 368,86 386,86 L393,94';

export function clipY(poly, limit, keep) {
  const inside = (p) => (keep === 'above' ? p[1] <= limit : p[1] >= limit);
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const cur = poly[i];
    const prev = poly[(i + poly.length - 1) % poly.length];
    if (inside(cur) !== inside(prev)) {
      const t = (limit - prev[1]) / (cur[1] - prev[1]);
      out.push([prev[0] + (cur[0] - prev[0]) * t, limit]);
    }
    if (inside(cur)) out.push(cur);
  }
  return out;
}
export const halves = (poly) => ({ top: clipY(poly, CUT_TOP, 'above'), bottom: clipY(poly, CUT_BOTTOM, 'below') });

function fillPoly(g, p) {
  g.beginPath();
  p.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  g.fill();
}

/** Wordmark with its signature gap. (x, y) = top-left, width in px. */
export function drawWordmark(g, x, y, width, color, only) {
  const s = width / 675;
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  g.fillStyle = color;
  g.strokeStyle = color;
  LETTERS.filter((l) => !only || l.id === only).forEach((l) => {
    const h = halves(l.poly);
    fillPoly(g, h.top);
    fillPoly(g, h.bottom);
  });
  if (!only || only === 'K') {
    g.lineWidth = 8;
    g.stroke(new Path2D(HANDLE_PATH));
  }
  g.restore();
}

/** One letter centred at (cx, cy) with the given height. */
export function drawLetter(g, id, cx, cy, height, color) {
  const l = LETTERS.find((x) => x.id === id);
  const xs = l.poly.map((p) => p[0]);
  const minX = Math.min(...xs) - (id === 'K' ? 36 : 0);
  const maxX = Math.max(...xs);
  const s = height / 155;
  drawWordmark(g, cx - ((minX + maxX) / 2) * s, cy - 77 * s, 675 * s, color, id);
}

/** Paper-cup sleeve wrap: colour band, signature line and the wordmark twice. */
export function paintSleeve(c, { bg, ink, line, lineAt = 0.55 }) {
  const W = c.width, H = c.height, g = c.getContext('2d');
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  g.fillStyle = line;
  g.fillRect(0, H * lineAt - H * 0.025, W, H * 0.05);
  for (const cx of [0, W * 0.5, W]) {
    const w = W * 0.24;
    drawWordmark(g, cx - w / 2, H * 0.14, w, ink);
  }
  return c;
}

/** Paper body of the cup with the Chemex icon front and back. */
export function paintCupBody(c) {
  const W = c.width, H = c.height, g = c.getContext('2d');
  g.fillStyle = '#F5F1EA';
  g.fillRect(0, 0, W, H);
  for (const cx of [0, W * 0.5, W]) drawLetter(g, 'K', cx, H * 0.8, H * 0.13, '#1B1714');
  return c;
}

/** MOKA's official takeaway cup (brand book): white paper, the black K front and back. Canvas top = cup top. */
export function paintOfficialCup(c) {
  const W = c.width, H = c.height, g = c.getContext('2d');
  g.fillStyle = '#F7F6F3';
  g.fillRect(0, 0, W, H);
  for (const cx of [0, W * 0.5, W]) drawLetter(g, 'K', cx, H * 0.45, H * 0.27, '#141414');
  return c;
}

export const DAY = [
  { name: 'Espresso', bg: '#1B1714', ink: '#F5F1EA', line: '#FFE2A6' },
  { name: 'Səhər', bg: '#C89B6D', ink: '#1B1714', line: '#F5F1EA' },
  { name: 'Günorta', bg: '#D9B56A', ink: '#1B1714', line: '#F5F1EA' },
  { name: 'Axşam', bg: '#A8643A', ink: '#1B1714', line: '#F5F1EA' },
  { name: 'Şəhər', bg: '#8E8A84', ink: '#1B1714', line: '#F5F1EA' },
  { name: 'Nar', bg: '#8E2F22', ink: '#F5F1EA', line: '#FFE2A6' },
];
