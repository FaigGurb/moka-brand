"use client";

import { useRef, useState } from "react";
import { PACKS } from "../packs/Packs";
import { gsap, ScrollTrigger, useGSAP, scrubFor } from "@/lib/gsap";
import { useI18n } from "@/i18n/context";

export function Tiers() {
  const { t } = useI18n();
  const [line, setLine] = useState(false);
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Horizontal gallery driven by vertical scroll with a mouse or trackpad; touch screens and reduced motion swipe it natively.
      mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
        const sec = root.current!;
        const track = sec.querySelector<HTMLElement>(".t-track")!;
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
        // no GSAP pin: the gallery is CSS-sticky (smooth under touch momentum on phones) and the section
        // is as tall as one screen plus the sideways distance, so vertical scroll maps 1:1 to the slide
        const fit = () => {
          sec.style.height = `${window.innerHeight + distance()}px`;
        };
        fit();
        ScrollTrigger.addEventListener("refreshInit", fit);
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          // its own GPU layer the whole time: iOS Safari otherwise repaints the wide strip in pieces mid-scroll
          force3D: true,
          scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: scrubFor(0.6), invalidateOnRefresh: true },
        });
        // the slogan behind the packs drifts slower than they do: depth without touching the packs
        const word = gsap.to(".t-word", {
          x: () => -distance() * 0.35,
          ease: "none",
          force3D: true,
          scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: scrubFor(0.6), invalidateOnRefresh: true },
        });
        return () => {
          tween.kill();
          word.kill();
          ScrollTrigger.removeEventListener("refreshInit", fit);
          sec.style.height = "";
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="paket" ref={root} className="day-glow overflow-x-clip bg-black text-paper">
      <div className="t-pin relative overflow-hidden scene:sticky scene:top-0 scene:flex scene:h-[100svh] scene:items-center">
        {/* MOKA's official slogan as a giant outline behind the gallery (never on the packs themselves) */}
        <p
          aria-hidden="true"
          className="t-word pointer-events-none absolute will-change-transform top-[52%] left-[46vw] -translate-y-1/2 font-[family-name:var(--font-display)] text-[clamp(120px,22vw,380px)] leading-none font-semibold tracking-[-0.04em] whitespace-nowrap text-transparent [-webkit-text-stroke:1.5px_rgb(255_255_255/0.18)] noscene:hidden"
        >
          In coffee we trust.
        </p>
        <div tabIndex={0} aria-label={t.tiers.title} className="t-track relative no-scrollbar will-change-transform focus-visible:outline-3 focus-visible:outline-paper flex gap-6 px-5 md:gap-8 md:px-10 noscene:snap-x noscene:snap-mandatory noscene:scroll-px-5 noscene:overflow-x-auto noscene:py-24 scene:pr-[10vw] lg:scene:pl-[max(40px,calc((100vw_-_1320px)/2_+_40px))]">
          <div className="flex w-[78vw] max-w-[440px] flex-none snap-start flex-col justify-center gap-6 lg:w-[36vw]">
            <p className="eyebrow text-seher">{t.tiers.eyebrow}</p>
            <h2 className="text-[clamp(40px,6vw,96px)] leading-[0.98] font-medium tracking-[-0.025em]">{t.tiers.title}</h2>
            <p className="max-w-[40ch] text-[18px] leading-relaxed text-paper/80">
              {t.tiers.text}
            </p>
            <button
              type="button"
              aria-pressed={line}
              onClick={() => setLine((v) => !v)}
              className="inline-flex items-center gap-3 self-start border border-paper/60 px-5 py-3 text-[13px] font-semibold transition-colors hover:border-glow hover:text-glow aria-pressed:border-glow aria-pressed:bg-glow aria-pressed:text-espresso"
            >
              <span className="h-[3px] w-6 bg-glow" aria-hidden="true" />
              {line ? t.tiers.hide : t.tiers.show}
            </button>
            <p className="text-sm font-bold tracking-[0.06em] text-muted-dark noscene:hidden">{t.tiers.hint}</p>
            <p className="max-w-[40ch] text-xs leading-relaxed text-muted-dark">{t.tiers.source}</p>
          </div>
          {t.tiers.items.map((it, i) => {
            const Pack = PACKS[i];
            return (
              <article key={it.name} className="flex w-[min(72vw,calc((100svh_-_300px)/1.53),360px)] flex-none snap-start flex-col gap-3 md:gap-4 lg:w-[min(24vw,calc((100svh_-_300px)/1.53))]">
                <div className="aspect-[300/460] w-full bg-paper transition-transform duration-500 ease-[var(--ease-brand)] hover:-translate-y-2">
                  <Pack line={line} title={it.name} className="h-full w-full" />
                </div>
                <h3 className="text-2xl font-medium">
                  <span className="mr-2 text-muted-dark">{i + 1}</span>
                  {it.name}
                </h3>
                <p className="max-w-[34ch] text-[15px] leading-relaxed text-muted-dark">{it.sub}</p>
                <p className={`flex max-w-[34ch] gap-2.5 text-[15px] leading-relaxed transition-opacity duration-500 ${line ? "opacity-100" : "opacity-60"}`}>
                  <span className="mt-[0.7em] h-[3px] w-5 flex-none bg-paper/50" aria-hidden="true" />
                  {it.idea}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
