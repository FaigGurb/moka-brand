import { HANDLE_PATH, LETTERS, halves, pts } from "@/lib/logo";

/**
 * MOKA's official packaging, redrawn as vector from the brand book and kept as it is.
 * The brand texts on the packs stay in English, as printed. `line` adds the concept layer:
 * a glow line through the gap of the mark — the coffee level — without touching the design.
 * Display type stands in for the brand book's Yume (League Spartan, heavy); text for Avenir (Mulish).
 */

const DISPLAY = "var(--font-display)";
const TEXT = "var(--font-sans)";
const GAP_MID = 77 / 155; // the signature gap, as a share of the letter height

/** The whole wordmark (675 × 155 units) placed at x, y with width w. */
function Mark({ x, y, w, fill }: { x: number; y: number; w: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${w / 675})`} fill={fill}>
      {LETTERS.map((l) => {
        const h = halves(l.poly);
        return (
          <g key={l.id}>
            <polygon points={pts(h.top)} />
            <polygon points={pts(h.bottom)} />
          </g>
        );
      })}
      <path d={HANDLE_PATH} fill="none" stroke={fill} strokeWidth={8} />
    </g>
  );
}

/** The Chemex letter (K) centred on cx with height h; top at y. */
function KMark({ cx, y, h, fill }: { cx: number; y: number; h: number; fill: string }) {
  const k = LETTERS.find((l) => l.id === "K")!;
  const s = h / 155;
  const hv = halves(k.poly);
  return (
    <g transform={`translate(${cx - 430 * s} ${y}) scale(${s})`} fill={fill}>
      <polygon points={pts(hv.top)} />
      <polygon points={pts(hv.bottom)} />
      <path d={HANDLE_PATH} fill="none" stroke={fill} strokeWidth={8} />
    </g>
  );
}

/** The concept layer: a glow line at height y, drawn in from the left when shown. */
function Level({ y, x1 = 0, x2 = 300, show }: { y: number; x1?: number; x2?: number; show?: boolean }) {
  return (
    <g className="pack-line" data-on={show ? "true" : "false"} aria-hidden="true">
      <rect x={x1} y={y - 1.6} width={x2 - x1} height={3.2} fill="#FFFFFF" />
      <rect x={x1} y={y - 5} width={x2 - x1} height={10} fill="#FFFFFF" opacity={0.18} />
    </g>
  );
}

type PackProps = { line?: boolean; className?: string; title: string };

export function Pouch({ line, className, title }: PackProps) {
  const kY = 120;
  const kH = 150;
  return (
    <svg viewBox="0 0 300 460" className={className} role="img" aria-label={title}>
      <defs>
        <linearGradient id="pouch-sheen" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <rect x="14" y="10" width="272" height="440" rx="10" fill="#141414" />
      <rect x="14" y="10" width="272" height="34" rx="10" fill="#1d1d1d" />
      <rect x="14" y="44" width="272" height="2" fill="#000" opacity="0.5" />
      <rect x="14" y="10" width="272" height="440" rx="10" fill="url(#pouch-sheen)" />
      <text x="40" y="78" fill="#6f6f6f" fontFamily={TEXT} fontWeight={700} fontSize="13" letterSpacing="0.4">
        <tspan x="40">Freshly</tspan>
        <tspan x="40" dy="15">Roasted</tspan>
        <tspan x="40" dy="15">Coffee</tspan>
      </text>
      <KMark cx={150} y={kY} h={kH} fill="#d9d9d6" />
      <text x="40" y="372" fill="#2c2c2c" fontFamily={DISPLAY} fontWeight={900} fontSize="44" letterSpacing="-0.5">ESPRESSO</text>
      <text x="40" y="346" fill="#e8e8e6" fontFamily={DISPLAY} fontWeight={900} fontSize="27" letterSpacing="0.3">ESPRESSO BLEND</text>
      <text x="40" y="392" fill="#bdbdbd" fontFamily={TEXT} fontWeight={600} fontSize="12">Colombia · El Salvador · Brazil</text>
      <text x="260" y="424" fill="#e8e8e6" fontFamily={TEXT} fontWeight={800} fontSize="14" textAnchor="end">250gr.</text>
      <Level y={kY + kH * GAP_MID} x1={14} x2={286} show={line} />
    </svg>
  );
}

export function Cup({ line, className, title }: PackProps) {
  const kY = 206;
  const kH = 124;
  return (
    <svg viewBox="0 0 300 460" className={className} role="img" aria-label={title}>
      <ellipse cx="150" cy="430" rx="92" ry="10" fill="#000" opacity="0.12" />
      <polygon points="52,118 248,118 222,426 78,426" fill="#f7f6f3" />
      <polygon points="52,118 92,118 104,426 78,426" fill="#000" opacity="0.04" />
      <polygon points="208,118 248,118 222,426 196,426" fill="#000" opacity="0.06" />
      <rect x="44" y="104" width="212" height="18" rx="4" fill="#141414" />
      <path d="M58 104 Q60 78 96 74 L204 74 Q240 78 242 104 Z" fill="#1c1c1c" />
      <rect x="120" y="80" width="60" height="6" rx="3" fill="#0a0a0a" />
      <KMark cx={150} y={kY} h={kH} fill="#141414" />
      <Level y={kY + kH * GAP_MID} x1={70} x2={232} show={line} />
    </svg>
  );
}

export function ColdBrew({ line, className, title }: PackProps) {
  const labelTop = 196;
  const markY = labelTop + 16;
  const markW = 96;
  return (
    <svg viewBox="0 0 300 460" className={className} role="img" aria-label={title}>
      <ellipse cx="150" cy="440" rx="80" ry="9" fill="#000" opacity="0.12" />
      <rect x="118" y="20" width="64" height="34" rx="5" fill="#c9c9c6" />
      <rect x="118" y="44" width="64" height="4" fill="#9a9a96" />
      <path d="M124 54 L176 54 L178 92 Q232 112 232 170 L232 412 Q232 438 206 438 L94 438 Q68 438 68 412 L68 170 Q68 112 122 92 Z" fill="#1b120c" />
      <path d="M80 160 Q82 118 120 104 L118 410 L92 410 Q80 410 80 396 Z" fill="#ffffff" opacity="0.06" />
      <rect x="68" y={labelTop} width="164" height="168" fill="#f7f6f3" />
      <Mark x={150 - markW / 2} y={markY} w={markW} fill="#141414" />
      <text x="150" y={markY + 30} fill="#141414" fontFamily={TEXT} fontWeight={700} fontSize="5.6" letterSpacing="1.4" textAnchor="middle">ROASTERY &amp; EATERY</text>
      <text x="150" y={labelTop + 92} fill="#dadad7" fontFamily={DISPLAY} fontWeight={900} fontSize="46" textAnchor="middle">COLD</text>
      <text x="150" y={labelTop + 84} fill="#141414" fontFamily={DISPLAY} fontWeight={900} fontSize="38" textAnchor="middle">COLD</text>
      <text x="150" y={labelTop + 118} fill="#141414" fontFamily={DISPLAY} fontWeight={900} fontSize="38" textAnchor="middle">BREW</text>
      <text x="150" y={labelTop + 134} fill="#141414" fontFamily={TEXT} fontWeight={800} fontSize="8.5" letterSpacing="0.8" textAnchor="middle">COLD DRIP COFFEE</text>
      <text x="150" y={labelTop + 148} fill="#7a7a77" fontFamily={TEXT} fontWeight={600} fontSize="7" textAnchor="middle">Sugar Free | Dairy Free</text>
      <text x="150" y={labelTop + 160} fill="#141414" fontFamily={TEXT} fontWeight={800} fontSize="7.5" textAnchor="middle">350 ml.</text>
      <Level y={markY + (markW * 155) / 675 * GAP_MID} x1={68} x2={232} show={line} />
    </svg>
  );
}

export function PaperBag({ line, className, title }: PackProps) {
  const markW = 108;
  const markY = 372;
  return (
    <svg viewBox="0 0 300 460" className={className} role="img" aria-label={title}>
      <ellipse cx="150" cy="446" rx="118" ry="9" fill="#000" opacity="0.12" />
      <path d="M104 96 Q104 24 150 24 Q196 24 196 96" fill="none" stroke="#bdbdba" strokeWidth="6" strokeLinecap="round" />
      <polygon points="40,96 260,96 270,440 30,440" fill="#d6d6d3" />
      <polygon points="40,96 70,96 66,440 30,440" fill="#000" opacity="0.05" />
      <rect x="40" y="96" width="220" height="6" fill="#000" opacity="0.06" />
      <g fill="#a8a8a5" fontFamily={DISPLAY} fontWeight={900} textAnchor="end">
        <text x="246" y="170" fontSize="34">IN</text>
        <text x="246" y="210" fontSize="34">COFFEE</text>
        <text x="246" y="250" fontSize="34">WE</text>
        <text x="246" y="290" fontSize="34">TRUST</text>
      </g>
      <Mark x={246 - markW} y={markY} w={markW} fill="#141414" />
      <text x="246" y={markY + 33} fill="#141414" fontFamily={TEXT} fontWeight={700} fontSize="6" letterSpacing="1.5" textAnchor="end">ROASTERY &amp; EATERY</text>
      <Level y={markY + (markW * 155) / 675 * GAP_MID} x1={36} x2={268} show={line} />
    </svg>
  );
}

export const PACKS = [Pouch, Cup, ColdBrew, PaperBag] as const;
