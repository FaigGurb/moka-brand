"use client";

import { useRef } from "react";
import { gsap, useGSAP, scrubFor } from "@/lib/gsap";
import { useI18n } from "@/i18n/context";

// "Bakıda bir gün": the secondary palette, named after the hours of a day in the café.
// Brand colour names stay Azerbaijani in every language; the dictionary adds a translation.
const DAY_BASE = [
  { name: "Səhər", hex: "#C89B6D", ink: "#000000", time: "08:00" },
  { name: "Günorta", hex: "#D9B56A", ink: "#000000", time: "13:00" },
  { name: "Axşam", hex: "#A8643A", ink: "#000000", time: "19:00" },
  { name: "Şəhər", hex: "#8E8A84", ink: "#000000", time: "22:00" },
  { name: "Nar", hex: "#8E2F22", ink: "#F6F6F4", time: "" },
];
const BASE_HEX = ["#000000", "#FFFFFF", "#878787"];

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
      // the colour story with a mouse or trackpad; touch screens scroll the five colours as plain panels
      // (iOS tears a full-screen sticky scene that repaints on every scroll frame)
      mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
        const slides = gsap.utils.toArray<HTMLElement>(".d-slide");
        gsap.set(slides.slice(1), { autoAlpha: 0 });
        const tl = gsap.timeline({
          // CSS-sticky scene (no GSAP pin): the timeline follows the track the scene sticks in
          scrollTrigger: {
            trigger: ".d-track",
            start: "top top",
            end: "bottom bottom",
            scrub: scrubFor(0.6),
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
        className="d-track motion-reduce:hidden scene:h-[var(--track)]"
        style={{ ["--track" as string]: `${100 + DAY.length * 70}svh` }}
      >
        <div className="d-pin relative scene:sticky scene:top-0 scene:h-[100svh] scene:overflow-hidden">
          {DAY.map((d) => (
            <div
              key={d.name}
              className="d-slide relative flex min-h-[44svh] flex-col justify-between gap-10 overflow-hidden bg-black px-5 pt-16 pb-12 noscene:min-h-0 noscene:justify-start text-paper md:px-10 md:py-24 scene:absolute scene:inset-0 scene:min-h-0"
            >
              {/* black and white, as MOKA is: the hour's colour is only the lit line at the signature height */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-[46%] h-[6px] noscene:hidden"
                style={{ background: d.hex, boxShadow: `0 0 48px 6px ${d.hex}` }}
              />
              <div className="mx-auto flex w-full max-w-[1320px] items-start justify-between gap-8">
                <p className="eyebrow">{t.day.eyebrow}</p>
                <p className="eyebrow tabular-nums">
                  {d.time}
                </p>
              </div>
              <div className="mx-auto w-full max-w-[1320px]">
                {/* touch screens (plain panels): the line sits above the name, not through it */}
                <span aria-hidden="true" className="mb-6 block h-[4px] w-full scene:hidden" style={{ background: d.hex, boxShadow: `0 0 28px 3px ${d.hex}` }} />
                <h2 className="d-name text-[clamp(72px,19vw,260px)] leading-[0.85] font-medium tracking-[-0.03em]">
                  {d.name}
                </h2>
                <div className="d-meta mt-6 flex flex-wrap items-baseline gap-x-8 gap-y-2 text-lg font-semibold md:text-xl">
                  <span className="flex items-center gap-2 font-bold tabular-nums"><span aria-hidden="true" className="h-3 w-3 rounded-full" style={{ background: d.hex }} />{d.hex}</span>
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
            <p className="max-w-[46ch] text-[18px] leading-relaxed text-paper/80">
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
                      c.hex === "#000000"
                        ? "inset 0 0 0 1px #2e2e2e"
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
