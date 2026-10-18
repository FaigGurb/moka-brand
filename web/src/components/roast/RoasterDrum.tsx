/**
 * A schematic drum roaster in the site's line style (not a drawing of a specific model): hopper,
 * drum with a front window, chimney, cooling tray. In the window the beans tumble and slowly roast
 * from green to dark; the cooling-tray arm turns and smoke rises. All motion is CSS (`.rd-*` in
 * globals.css) and only runs with `prefers-reduced-motion: no-preference`.
 */
const BEANS: [number, number, number][] = [
  [-6, -5, 20],
  [5, -7, -30],
  [8, 3, 60],
  [-2, 7, 10],
  [-9, 3, -50],
  [1, -1, 80],
  [4, 9, -15],
];

export function RoasterDrum({ label, className = "" }: { label: string; className?: string }) {
  return (
    <svg viewBox="0 0 190 160" role="img" aria-label={label} className={className}>
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
        {/* chimney + smoke */}
        <path d="M146 50 V14 H162" />
        <g className="rd-smoke" strokeWidth="1.6" opacity="0.5">
          <path d="M166 10 c4 -4 -2 -6 2 -10" />
          <path d="M172 12 c4 -4 -2 -6 2 -10" />
        </g>
        {/* hopper */}
        <path d="M96 50 L90 26 H122 L116 50" />
        {/* drum */}
        <rect x="62" y="50" width="96" height="44" rx="6" />
        <path d="M106 50 V94" opacity="0.35" />
        {/* cabinet + legs */}
        <path d="M70 94 V136 H152 V94" />
        <path d="M76 136 V146 M146 136 V146" />
        {/* chute to the cooling tray */}
        <path d="M66 86 L48 112" />
        {/* cooling tray */}
        <ellipse cx="34" cy="120" rx="28" ry="7" />
        <path d="M34 127 V146 M22 146 H46" />
      </g>
      {/* tray arm, turning (flattened circle) */}
      <g transform="translate(34 120) scale(1 0.25)">
        <g className="rd-arm">
          <path d="M-24 0 H24" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        </g>
      </g>
      {/* drum window with tumbling beans */}
      <circle cx="84" cy="72" r="15" fill="var(--color-espresso)" stroke="currentColor" strokeWidth="2.4" />
      <clipPath id="rd-win">
        <circle cx="84" cy="72" r="13" />
      </clipPath>
      <g clipPath="url(#rd-win)">
        <g className="rd-beans">
          {BEANS.map(([x, y, r], i) => (
            <ellipse key={i} cx={84 + x} cy={72 + y} rx="3.4" ry="2.4" transform={`rotate(${r} ${84 + x} ${72 + y})`} className="rd-bean" />
          ))}
        </g>
      </g>
      {/* the signature line runs through the drum at bean level */}
      <path d="M62 75.5 H158" stroke="var(--color-glow)" strokeWidth="2.5" className="rd-line" />
    </svg>
  );
}
