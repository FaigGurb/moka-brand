"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/i18n/context";

// "Bakıda bir gün": the secondary palette, named after the hours of a day in the café.
// Brand colour names stay Azerbaijani in every language; the dictionary adds a translation.
const DAY_BASE = [
  { name: "Səhər", hex: "#C89B6D", ink: "#1B1714", time: "08:00" },
  { name: "Günorta", hex: "#D9B56A", ink: "#1B1714", time: "13:00" },
  { name: "Axşam", hex: "#A8643A", ink: "#1B1714", time: "19:00" },
  { name: "Şəhər", hex: "#8E8A84", ink: "#1B1714", time: "22:00" },
  { name: "Nar", hex: "#8E2F22", ink: "#F5F1EA", time: "" },
];
const BASE_HEX = ["#1B1714", "#F5F1EA", "#C9A882"];

export function DayPalette() {
  const { t } = useI18n();
  const DAY = DAY_BASE.map((d, i) => ({
    ...d,
    ...t.day.slides[i],
    time: d.time || t.day.seasonal,
  }));
  const BASE = BASE_HEX.map((hex, i) => ({ hex, ...t.day.base[i], sub: "" }));
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const slides = gsap.utils.toArray<HTMLElement>(".d-slide");
        gsap.set(slides.slice(1), { autoAlpha: 0 });
        const tl = gsap.timeline({
          // CSS-sticky scene (no GSAP pin): the timeline follows the track the scene sticks in
          scrollTrigger: {
            trigger: ".d-track",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });
        slides.forEach((s, i) => {
          if (i === 0) return;
          // Outgoing words leave first; the next hour's colour and name arrive only after they are gone.
          const prev = slides[i - 1];
          tl.to(
            prev.querySelectorAll(".d-name, .d-meta"),
            { yPercent: -30, autoAlpha: 0, duration: 0.25 },
            i - 0.6,
          )
            .to(s, { autoAlpha: 1, duration: 0.35 }, i - 0.35)
            .from(
              s.querySelector(".d-name"),
              { yPercent: 30, duration: 0.35 },
              i - 0.35,
            );
        });
        tl.to({}, { duration: 0.4 });
        return () => tl.kill();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="reng" ref={root} className="bg-espresso text-paper">
      {/* Pinned colour story; hidden for reduced motion, where the swatch grid below says the same. */}
      <div
        className="d-track motion-reduce:hidden"
        style={{ height: `${100 + DAY.length * 70}svh` }}
      >
        <div className="d-pin sticky top-0 h-[100svh] overflow-hidden">
          {DAY.map((d) => (
            <div
              key={d.name}
              className="d-slide absolute inset-0 flex flex-col justify-between px-5 pt-24 pb-16 md:px-10 md:py-24"
              style={{ background: d.hex, color: d.ink }}
            >
              <div className="mx-auto flex w-full max-w-[1320px] items-start justify-between gap-8">
                <p className="eyebrow eyebrow-on-colour">{t.day.eyebrow}</p>
                <p className="eyebrow eyebrow-on-colour tabular-nums">
                  {d.time}
                </p>
              </div>
              <div className="mx-auto w-full max-w-[1320px]">
                <h2 className="d-name text-[clamp(72px,19vw,260px)] leading-[0.85] font-medium tracking-[-0.03em]">
                  {d.name}
                </h2>
                <div className="d-meta mt-6 flex flex-wrap items-baseline gap-x-8 gap-y-2 text-lg font-semibold md:text-xl">
                  <span className="font-bold tabular-nums">{d.hex}</span>
                  {d.sub && <span>{d.sub}</span>}
                  <span>{d.src}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1320px] px-5 py-20 md:px-10 md:py-24">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <div className="flex flex-col gap-5">
            <p className="eyebrow text-gunorta motion-safe:hidden">
              {t.day.eyebrow}
            </p>
            <h2 className="text-[clamp(40px,6vw,96px)] leading-[0.98] font-medium">
              {t.day.title}
            </h2>
            <p className="max-w-[46ch] text-[17px] leading-relaxed text-muted-dark">
              {t.day.text}
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[...BASE, ...DAY].map((c) => (
              <li key={c.name} className="flex flex-col bg-espresso-2">
                <span
                  className="aspect-[4/3] w-full"
                  style={{
                    background: c.hex,
                    boxShadow:
                      c.hex === "#1B1714"
                        ? "inset 0 0 0 1px #3a3530"
                        : undefined,
                  }}
                />
                <span className="flex flex-col gap-0.5 p-3">
                  <b className="font-[family-name:var(--font-display)] text-lg font-medium">
                    {c.name}
                    {c.sub && (
                      <span className="ml-1.5 font-[family-name:var(--font-sans)] text-xs font-normal text-muted-dark">
                        {c.sub}
                      </span>
                    )}
                  </b>
                  <span className="text-xs text-muted-dark tabular-nums">
                    {c.hex}
                  </span>
                  <span className="text-xs text-muted-dark">{c.src}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
