"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { CUT_BOTTOM, CUT_TOP, HANDLE_PATH, LETTERS, VIEW_W, halves, pts } from "@/lib/logo";
import { useI18n } from "@/i18n/context";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Concept view of the café's main wall: the MOKA wordmark across the whole wall in MOKA's black and
 * white, and one lit LED line at the signature height running through every letter (the logo's own
 * cut, y 74.5–79.5), reflected faintly in a polished floor. The real café photos follow below.
 */
function Wall({ alt }: { alt: string }) {
  // wordmark units (viewBox 675 × 155) placed across the 1000 × 620 wall
  const k = 1.3;
  const tx = (1000 - VIEW_W * k) / 2;
  const ty = 150;
  const cut = ((CUT_TOP + CUT_BOTTOM) / 2) * k + ty;
  return (
    <svg viewBox="0 0 1000 620" className="block h-auto w-full" role="img" aria-label={alt}>
      <defs>
        <filter id="store-glow" x="-10%" y="-400%" width="120%" height="900%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <linearGradient id="store-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="store-wash" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.07" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1000" height="620" fill="#0b0b0b" />
      <rect width="1000" height="470" fill="url(#store-wash)" />
      <g fill="#F6F6F4" transform={`translate(${tx},${ty}) scale(${k})`}>
        {LETTERS.map((l) => {
          const h = halves(l.poly);
          return (
            <g key={l.id}>
              <polygon points={pts(h.top)} />
              <polygon points={pts(h.bottom)} />
            </g>
          );
        })}
        <path d={HANDLE_PATH} fill="none" stroke="#F6F6F4" strokeWidth={8} />
      </g>
      {/* the lit line at the signature height, through every letter */}
      <g className="s-led" style={{ transformOrigin: `0 ${cut}px` }}>
        <rect x="0" y={cut - 8} width="1000" height="16" fill="#FFFFFF" filter="url(#store-glow)" opacity=".6" />
        <rect x="0" y={cut - 2.5} width="1000" height="5" fill="#FFFFFF" />
      </g>
      {/* floor and a faint reflection of the letters */}
      <line x1="0" y1="470" x2="1000" y2="470" stroke="#3a3a3a" strokeWidth="1.5" />
      <g opacity="0.12" transform={`translate(${tx},${470 + (470 - ty)}) scale(${k},${-k})`}>
        {LETTERS.map((l) => (
          <polygon key={l.id} points={pts(l.poly)} fill="#F6F6F4" />
        ))}
      </g>
      <rect y="470" width="1000" height="150" fill="url(#store-floor)" opacity="0.5" />
      <rect y="470" width="1000" height="150" fill="#0b0b0b" opacity="0.55" />
    </svg>
  );
}

export function Store() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
        // The view opens like a window, then the LED line is drawn across the wall.
        gsap.fromTo(
          ".s-frame",
          { clipPath: "inset(18% 22% 18% 22%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: { trigger: ".s-frame", start: "top 85%", end: "top 25%", scrub: fine ? 1 : false, toggleActions: "play none none none" },
            // touch: one timed reveal (an animated clip-path repaints the whole picture every scroll frame on iOS)
            ...(fine ? {} : { duration: 1.2, ease: "power3.out" }),
          },
        );
        gsap.from(".s-led", {
          scaleX: 0,
          ease: "none",
          scrollTrigger: { trigger: ".s-frame", start: "top 55%", end: "top 15%", scrub: 1 },
        });
        gsap.from(".s-cup-fill", {
          scaleY: 0,
          transformOrigin: "50% 100%",
          duration: 1.6,
          ease: "power2.inOut",
          scrollTrigger: { trigger: ".s-ritual", start: "top 75%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="kafe" ref={root} className="day-glow overflow-hidden bg-espresso text-paper">
      <div className="mx-auto max-w-[1320px] px-5 py-24 md:px-10 md:py-32">
        <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-end md:gap-16">
          <div className="flex flex-col gap-5">
            <p className="eyebrow text-gunorta">{t.store.eyebrow}</p>
            <h2 className="text-[clamp(40px,6vw,96px)] leading-[0.98] font-medium tracking-[-0.025em]">{t.store.title}</h2>
          </div>
          <p className="max-w-[50ch] text-[18px] leading-relaxed text-paper/80">
            {t.store.text}
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.7fr_1fr] lg:items-stretch">
          <figure className="flex flex-col gap-3">
            <div className="s-frame overflow-hidden">
              <Wall alt={t.store.wallAlt} />
            </div>
            <figcaption className="text-xs font-semibold text-muted-dark">{t.store.caption}</figcaption>
          </figure>

          <div className="s-ritual flex flex-col gap-5 bg-paper p-8 text-espresso">
            <p className="eyebrow text-axsam-ink">{t.store.ritualEyebrow}</p>
            <svg viewBox="0 0 300 220" className="h-auto w-full max-w-[320px]" role="img" aria-label={t.store.cupAlt}>
              <path d="M40,30 L260,30 L238,190 L62,190 Z" fill="#000000" />
              <path d="M54,40 L246,40 L227,180 L73,180 Z" fill="#F6F6F4" />
              <path className="s-cup-fill" d="M63,108 L237,108 L227,180 L73,180 Z" fill="#3a3a3a" />
              <rect x="60" y="104" width="180" height="3" fill="#000000" />
              <path d="M260,62 C300,62 300,130 250,130" fill="none" stroke="#000000" strokeWidth="14" />
              <rect x="14" y="198" width="272" height="14" rx="7" fill="#000000" />
            </svg>
            <h3 className="text-[28px] leading-tight font-medium">{t.store.ritualTitle}</h3>
            <p className="text-[15px] leading-relaxed text-muted">
              {t.store.ritualText}
            </p>
          </div>
        </div>

        {/* the real café, in MOKA's own footage: the concept above grows out of what is already there */}
        <div className="mt-20 flex flex-col gap-6 md:mt-28">
          <h3 className="font-[family-name:var(--font-display)] text-[clamp(28px,3.2vw,44px)] leading-tight font-medium tracking-[-0.02em]">
            {t.store.real.title}
          </h3>
          <ul className="grid grid-cols-3 gap-2 md:gap-4">
            {t.store.real.shots.map((s) => (
              <li key={s.src}>
                <figure className="flex flex-col gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${BASE}/cinema/bar/${s.src}.webp`}
                    alt={s.alt}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[9/14] w-full bg-espresso-2 object-cover"
                  />
                  <figcaption className="font-[family-name:var(--font-display)] text-[13px] leading-snug md:text-[17px]">{s.title}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-muted-dark">{t.store.real.credit}</p>
        </div>
      </div>
    </section>
  );
}
