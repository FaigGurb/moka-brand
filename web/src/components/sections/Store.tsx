"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { LETTERS, halves, pts } from "@/lib/logo";
import { useI18n } from "@/i18n/context";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Concept view of the café's main wall: the wordmark lit by a warm LED line at the signature height. */
function Wall({ alt }: { alt: string }) {
  return (
    <svg viewBox="0 0 1000 620" className="block h-auto w-full" role="img" aria-label={alt}>
      <defs>
        <filter id="store-glow" x="-10%" y="-400%" width="120%" height="900%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <rect width="1000" height="620" fill="#77736C" />
      <rect width="1000" height="40" fill="#2B2420" />
      <rect x="700" y="40" width="300" height="500" fill="#C89B6D" />
      {[736, 812, 898, 962].map((x) => (
        <rect key={x} x={x} y="40" width="4" height="500" fill="#1B1714" opacity=".5" />
      ))}
      <g fill="#F5F1EA" transform="translate(70,150) scale(0.86)">
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
      <g className="s-led" style={{ transformOrigin: "0 216px" }}>
        <rect x="0" y="212" width="1000" height="8" fill="#F2C76E" filter="url(#store-glow)" opacity=".9" />
        <rect x="0" y="213" width="1000" height="6" fill="#FFE2A6" />
      </g>
      <rect x="700" y="219" width="300" height="8" fill="#5E3B26" />
      <rect x="716" y="150" width="40" height="63" fill="#FFFFFF" />
      <rect x="716" y="186" width="40" height="27" fill="#8A5A3B" />
      <rect x="768" y="150" width="40" height="63" fill="#C9A882" />
      <rect x="820" y="150" width="40" height="63" fill="#1B1714" />
      <rect x="820" y="186" width="40" height="3" fill="#8E2F22" />
      <rect x="872" y="150" width="40" height="63" fill="#FFFFFF" />
      <rect x="872" y="176" width="40" height="37" fill="#C08A55" />
      <rect x="924" y="150" width="40" height="63" fill="#C9A882" />
      <rect x="700" y="372" width="300" height="8" fill="#5E3B26" />
      <rect x="716" y="306" width="40" height="66" fill="#FFFFFF" />
      <rect x="716" y="346" width="40" height="26" fill="#5E3B26" />
      <rect x="768" y="306" width="40" height="66" fill="#C9A882" />
      <rect x="820" y="306" width="40" height="66" fill="#FFFFFF" />
      <rect x="820" y="336" width="40" height="36" fill="#8C9A5B" />
      <rect x="60" y="400" width="600" height="140" fill="#1B1714" />
      <rect x="60" y="400" width="600" height="10" fill="#3A3530" />
      <polygon points="344,440 376,440 366,458 376,476 345,476 351,458" fill="#F5F1EA" />
      <path d="M344,444 C336,444 334,450 334,453 C334,459 339,462 345,462" fill="none" stroke="#F5F1EA" strokeWidth="3" />
      <rect y="540" width="1000" height="80" fill="#5E3B26" />
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
          <p className="max-w-[50ch] text-[17px] leading-relaxed text-muted-dark">
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
              <path d="M40,30 L260,30 L238,190 L62,190 Z" fill="#1B1714" />
              <path d="M54,40 L246,40 L227,180 L73,180 Z" fill="#F5F1EA" />
              <path className="s-cup-fill" d="M63,108 L237,108 L227,180 L73,180 Z" fill="#5E3B26" />
              <rect x="60" y="104" width="180" height="3" fill="#1B1714" />
              <path d="M260,62 C300,62 300,130 250,130" fill="none" stroke="#1B1714" strokeWidth="14" />
              <rect x="14" y="198" width="272" height="14" rx="7" fill="#1B1714" />
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
