import { HANDLE_PATH, LETTERS, halves, pts } from "@/lib/logo";

/** The MOKA wordmark as clean SVG: each letter drawn as two halves with the signature gap. */
export function Logo({ className, title = "MOKA" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 675 155" className={className} role="img" aria-label={title} fill="currentColor">
      {LETTERS.map((l) => {
        const h = halves(l.poly);
        return (
          <g key={l.id}>
            <polygon points={pts(h.top)} />
            <polygon points={pts(h.bottom)} />
          </g>
        );
      })}
      <path d={HANDLE_PATH} fill="none" stroke="currentColor" strokeWidth={8} />
    </svg>
  );
}

/** One letter on its own, cropped to its bounds (for the concept section). */
export function Letter({ id, className }: { id: "M" | "O" | "K" | "A"; className?: string }) {
  const l = LETTERS.find((x) => x.id === id)!;
  const xs = l.poly.map((p) => p[0]);
  const minX = Math.min(...xs) - (id === "K" ? 36 : 4);
  const maxX = Math.max(...xs) + 4;
  const h = halves(l.poly);
  return (
    <svg viewBox={`${minX} 0 ${maxX - minX} 155`} className={className} aria-hidden="true" fill="currentColor">
      <polygon points={pts(h.top)} />
      <polygon points={pts(h.bottom)} />
      {id === "K" && <path d={HANDLE_PATH} fill="none" stroke="currentColor" strokeWidth={8} />}
    </svg>
  );
}

/** The official lockup from the brand book: the wordmark over "ROASTERY & EATERY", set to the same width. */
export function Lockup({ className, title = "MOKA Roastery & Eatery" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 675 205" className={className} role="img" aria-label={title} fill="currentColor">
      {LETTERS.map((l) => {
        const h = halves(l.poly);
        return (
          <g key={l.id}>
            <polygon points={pts(h.top)} />
            <polygon points={pts(h.bottom)} />
          </g>
        );
      })}
      <path d={HANDLE_PATH} fill="none" stroke="currentColor" strokeWidth={8} />
      <text x="2" y="200" textLength="671" lengthAdjust="spacing" fontSize="34" fontWeight="600" fontFamily="var(--font-sans)" aria-hidden="true">
        ROASTERY &amp; EATERY
      </text>
    </svg>
  );
}
