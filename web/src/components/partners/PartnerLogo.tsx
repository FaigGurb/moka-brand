import type { PARTNERS } from "@/lib/site";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type PartnerId = (typeof PARTNERS)[number]["id"];

/**
 * Logo files in `public/partner-logos/`, taken from each partner's official website (October 2026) and
 * kept untouched apart from trimming empty margins (ODK) and resizing (Pitti, Elektra). They are
 * stand-ins until MOKA sends the official files. Width/height are the files' intrinsic sizes (no
 * layout shift); `fit` balances the optical size of very different shapes inside equal plates.
 * ISA has no asset yet (its site was under maintenance), so it gets a clearly marked placeholder.
 * Never redraw or recolour these logos.
 */
export const LOGOS: Partial<Record<PartnerId, { src: string; w: number; h: number; fit: string }>> = {
  pitti: { src: "pitti.webp", w: 400, h: 329, fit: "h-[74%] w-auto" },
  mazzer: { src: "mazzer.svg", w: 150, h: 16, fit: "w-[70%] h-auto" },
  elektra: { src: "elektra.png", w: 640, h: 65, fit: "w-[84%] h-auto" },
  odk: { src: "odk.svg", w: 762, h: 503, fit: "h-[60%] w-auto" },
};

/** Plate background for a partner: paper behind real logos, a dashed dark frame for the placeholder. */
export const plateTone = (id: PartnerId) => (LOGOS[id] ? "bg-paper" : "border border-dashed border-paper/35 bg-espresso-2");

/** What goes inside a plate: the partner's own logo, or the typeset name with a "logo pending" label. */
export function PartnerLogo({ id, name, pending }: { id: PartnerId; name: string; pending: string }) {
  const logo = LOGOS[id];
  if (logo)
    return (
      // eslint-disable-next-line @next/next/no-img-element -- static export, files are already sized
      <img
        src={`${BASE}/partner-logos/${logo.src}`}
        width={logo.w}
        height={logo.h}
        alt={name}
        decoding="async"
        className={`${logo.fit} max-h-[74%] max-w-[86%] object-contain transition-transform duration-300 ease-out group-hover/plate:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover/plate:scale-100`}
      />
    );
  return (
    <span className="flex flex-col items-center gap-2 text-center">
      <span className="font-[family-name:var(--font-display)] text-[clamp(30px,2.6vw,40px)] leading-none font-medium tracking-[0.04em] text-paper">{name}</span>
      <span className="text-[11px] font-bold tracking-[0.18em] text-muted-dark uppercase">{pending}</span>
    </span>
  );
}
