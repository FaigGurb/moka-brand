"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { LETTERS, halves, pts } from "@/lib/logo";
import { useI18n } from "@/i18n/context";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Concept view of the café's main wall, drawn like an architect's elevation in MOKA's black and
 * white: the wordmark, the counter and the shelves in fine lines, and one lit LED line at the
 * signature height running through all of them.
 */
function Wall({ alt }: { alt: string }) {
  const line = "#5c5c5c";
  return (
    <svg viewBox="0 0 1000 620" className="block h-auto w-full" role="img" aria-label={alt}>
      <defs>
        <filter id="store-glow" x="-10%" y="-400%" width="120%" height="900%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <rect width="1000" height="620" fill="#0b0b0b" />
      {/* wall panels */}
      {[180, 360, 540, 720, 880].map((x) => (
        <line key={x} x1={x} y1="0" x2={x} y2="540" stroke="#1d1d1d" strokeWidth="1" />
      ))}
      <g fill="#F6F6F4" transform="translate(70,150) scale(0.86)">
        {LETTERS.map((l) => {
          const h = halves(l.poly);
          return (
            <g key={l.id}>
              <polygon points={pts(h.top)} />
              <polygon points={pts(h.bottom)} />
            </g>
          );
        })}
      </g>
      {/* shelves: outlines only, the packs as MOKA prints them (black bag, white cup, grey paper bag) */}
      <g fill="none" stroke={line} strokeWidth="1.5">
        <line x1="712" y1="219" x2="968" y2="219" />
        <line x1="712" y1="372" x2="968" y2="372" />
      </g>
      <g strokeWidth="1.5">
        <rect x="724" y="150" width="40" height="62" fill="#000" stroke="#8a8a8a" />
        <rect x="776" y="162" width="30" height="50" fill="#F6F6F4" />
        <rect x="776" y="158" width="30" height="7" fill="#000" stroke="#8a8a8a" />
        <rect x="818" y="150" width="40" height="62" fill="#000" stroke="#8a8a8a" />
        <rect x="870" y="160" width="40" height="52" fill="#878787" />
        <rect x="922" y="150" width="40" height="62" fill="#000" stroke="#8a8a8a" />
        <rect x="724" y="318" width="30" height="50" fill="#F6F6F4" />
        <rect x="724" y="314" width="30" height="7" fill="#000" stroke="#8a8a8a" />
        <rect x="766" y="306" width="40" height="62" fill="#000" stroke="#8a8a8a" />
        <rect x="818" y="316" width="40" height="52" fill="#878787" />
      </g>
      {/* counter */}
      <rect x="60" y="400" width="600" height="140" fill="#000" stroke={line} strokeWidth="1.5" />
      <line x1="60" y1="414" x2="660" y2="414" stroke="#2a2a2a" />
      <polygon points="344,446 376,446 366,464 376,482 345,482 351,464" fill="#F6F6F4" />
      <path d="M344,450 C336,450 334,456 334,459 C334,465 339,468 345,468" fill="none" stroke="#F6F6F4" strokeWidth="3" />
      <line x1="0" y1="540" x2="1000" y2="540" stroke={line} strokeWidth="1.5" />
      {/* the lit line at the signature height */}
      <g className="s-led" style={{ transformOrigin: "0 216px" }}>
        <rect x="0" y="210" width="1000" height="12" fill="#FFFFFF" filter="url(#store-glow)" opacity=".55" />
        <rect x="0" y="214" width="1000" height="4" fill="#FFFFFF" />
      </g>
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
