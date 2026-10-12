"use client";

import { useRef, useState } from "react";
import { Logo } from "../Logo";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/i18n/context";

// Sample origins and notes for the concept (text in the dictionary); real assortment to be supplied by MOKA.
const LEVEL_STYLE = [
  { line: 58, color: "#8C9A5B", ink: "#1B1714", flavor: null },
  { line: 50, color: "#C08A55", ink: "#1B1714", flavor: "#D9C7E6" },
  { line: 42, color: "#8A5A3B", ink: "#F5F1EA", flavor: "#E9B8C0" },
  { line: 34, color: "#5E3B26", ink: "#F5F1EA", flavor: "#A88A78" },
  { line: 26, color: "#2B1D15", ink: "#F5F1EA", flavor: "#A88A78" },
];
const FLAVOR_HEX = ["#E9B8C0", "#EBD27A", "#D9C7E6", "#A88A78"];

export function Roast() {
  const { t } = useI18n();
  const LEVELS = LEVEL_STYLE.map((s, i) => ({ ...s, ...t.roast.levels[i] }));
  const FLAVORS = FLAVOR_HEX.map((hex, i) => ({ hex, name: t.roast.flavors[i] }));
  const root = useRef<HTMLElement>(null);
  const [lvl, setLvl] = useState(2);
  const L = LEVELS[lvl];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // The coffee "pours" into the bag the first time the section comes into view.
        gsap.from(".r-fill", {
          scaleY: 0,
          transformOrigin: "bottom",
          duration: 1.4,
          ease: "power3.inOut",
          scrollTrigger: { trigger: ".r-bag", start: "top 75%", once: true },
        });
        gsap.from(".r-copy > *", {
          y: 24,
          opacity: 0,
          stagger: 0.08,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: ".r-copy", start: "top 80%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="qovurma" ref={root} className="day-wash overflow-hidden bg-paper text-espresso">
      <div className="mx-auto grid max-w-[1320px] items-center gap-14 px-5 py-24 md:grid-cols-2 md:gap-20 md:px-10 md:py-32">
        {/* the bean card: given with every bag, so the official bag itself stays unchanged */}
        <div className="r-bag relative mx-auto aspect-[3/5] w-full max-w-[320px] overflow-hidden rounded-[10px] bg-white text-espresso shadow-[0_40px_80px_-40px_rgba(27,23,20,0.55)]">
          <span className="absolute top-[4.5%] right-[8%] block h-4 w-4 rounded-full bg-paper-2 shadow-[inset_0_1px_3px_rgba(0,0,0,0.25)]" aria-hidden="true" />
          <div className="flex flex-col gap-2 p-[9%] pt-[11%]">
            <span className="text-[10px] font-bold tracking-[0.28em] text-axsam-ink">{t.roast.house.card}</span>
            <Logo className="mt-2 w-[56%]" />
            <span className="text-[8px] font-bold tracking-[0.3em]">ROASTERY & EATERY</span>
            <span className="mt-4 font-[family-name:var(--font-display)] text-[28px] leading-none">{L.origin}</span>
            <span className="flex items-center gap-2">
              <span
                className="h-3.5 w-3.5 flex-none rounded-full transition-colors duration-500"
                style={{ background: L.flavor ?? "transparent" }}
                aria-hidden="true"
              />
              <span className="font-[family-name:var(--font-display)] text-[17px] leading-tight">{L.notes}</span>
            </span>
          </div>
          <div
            className="r-fill absolute inset-x-0 bottom-0 flex flex-col justify-between px-[9%] py-4 transition-[height,background-color,color] duration-700 ease-[var(--ease-brand)]"
            style={{ height: `${L.line}%`, background: L.color, color: L.ink }}
          >
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase">{L.label}</span>
            <span className="flex gap-1.5" aria-hidden="true">
              {LEVELS.map((_, i) => (
                <i key={i} className="block h-3 w-3 border-2 border-current" style={{ background: i <= lvl ? "currentColor" : "transparent" }} />
              ))}
            </span>
          </div>
        </div>

        <div className="r-copy flex flex-col gap-6">
          <p className="eyebrow text-axsam-ink">{t.roast.eyebrow}</p>
          <h2 className="text-[clamp(34px,4.6vw,60px)] leading-[1.03] font-medium tracking-[-0.01em]">
            {t.roast.title}
          </h2>
          <p className="max-w-[48ch] text-[17px] leading-relaxed text-muted">
            {t.roast.text}
          </p>
          <div className="flex max-w-[48ch] flex-col gap-1.5 border-l-[3px] border-axsam bg-paper-2/70 px-5 py-4">
            <b className="font-[family-name:var(--font-display)] text-xl font-medium">{t.roast.house.title}</b>
            <p className="text-[15px] leading-relaxed text-muted">{t.roast.house.text}</p>
            <p className="text-[13px] font-bold tracking-[0.04em]">
              {t.roast.house.roaster}: <span className="font-normal text-muted">{t.roast.house.roasterName}</span>
            </p>
          </div>
          <fieldset className="mt-2 flex flex-col gap-3">
            <legend className="mb-3 text-sm font-bold tracking-[0.06em]">{t.roast.legend}</legend>
            <input
              id="roast-level"
              aria-label={t.roast.legend}
              type="range"
              min={0}
              max={4}
              step={1}
              value={lvl}
              onChange={(e) => setLvl(Number(e.target.value))}
              aria-valuetext={`${L.label}, ${t.roast.line} ${L.line}%`}
              className="w-full accent-[#A8643A]"
            />
            <div className="flex justify-between text-xs font-bold tracking-[0.04em] text-muted" aria-hidden="true">
              {LEVELS.map((l, i) => (
                <button key={l.short} type="button" tabIndex={-1} onClick={() => setLvl(i)} className={i === lvl ? "text-espresso" : ""}>
                  {l.short}
                </button>
              ))}
            </div>
          </fieldset>
          <p className="eyebrow text-espresso" aria-live="polite">
            {L.label} · {t.roast.line} {L.line}%
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted" aria-label={t.roast.flavorsLabel}>
            {FLAVORS.map((f) => (
              <li key={f.name} className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: f.hex }} aria-hidden="true" />
                {f.name}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted">{t.roast.sample}</p>
        </div>
      </div>
    </section>
  );
}
