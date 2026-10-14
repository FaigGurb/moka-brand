"use client";

import { useRef, useState } from "react";
import { PACKS } from "../packs/Packs";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/i18n/context";

export function Tiers() {
  const { t } = useI18n();
  const [line, setLine] = useState(false);
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Horizontal gallery driven by vertical scroll on every screen size; native swipe only for reduced motion.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const track = root.current!.querySelector<HTMLElement>(".t-track")!;
        const distance = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: ".t-pin",
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        return () => tween.kill();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="paket" ref={root} className="day-glow overflow-x-clip bg-black text-paper">
      <div className="t-pin overflow-hidden motion-safe:flex motion-safe:h-[100svh] motion-safe:items-center">
        <div tabIndex={0} aria-label={t.tiers.title} className="t-track no-scrollbar focus-visible:outline-3 focus-visible:outline-gunorta flex gap-6 px-5 md:gap-8 md:px-10 motion-reduce:snap-x motion-reduce:snap-mandatory motion-reduce:scroll-px-5 motion-reduce:overflow-x-auto motion-reduce:py-24 motion-safe:pr-[10vw] lg:motion-safe:pl-[max(40px,calc((100vw_-_1320px)/2_+_40px))]">
          <div className="flex w-[78vw] max-w-[440px] flex-none snap-start flex-col justify-center gap-6 lg:w-[36vw]">
            <p className="eyebrow text-seher">{t.tiers.eyebrow}</p>
            <h2 className="text-[clamp(36px,4.6vw,64px)] leading-[1.02] font-medium tracking-[-0.01em]">{t.tiers.title}</h2>
            <p className="max-w-[40ch] text-[17px] leading-relaxed text-muted-dark">
              {t.tiers.text}
            </p>
            <button
              type="button"
              aria-pressed={line}
              onClick={() => setLine((v) => !v)}
              className="inline-flex items-center gap-3 self-start border border-paper/60 px-5 py-3 text-[13px] font-bold tracking-[0.14em] uppercase transition-colors hover:border-glow hover:text-glow aria-pressed:border-glow aria-pressed:bg-glow aria-pressed:text-espresso"
            >
              <span className="h-[3px] w-6 bg-glow" aria-hidden="true" />
              {line ? t.tiers.hide : t.tiers.show}
            </button>
            <p className="text-sm font-bold tracking-[0.06em] text-muted-dark motion-reduce:hidden">{t.tiers.hint}</p>
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
                  <span className="mt-[0.7em] h-[3px] w-5 flex-none bg-axsam" aria-hidden="true" />
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
