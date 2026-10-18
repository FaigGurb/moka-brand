"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/i18n/context";
import { LOOPS } from "@/lib/cinema";
import { LoopVideo } from "../cinema/LoopVideo";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * MOKA's own bar, in MOKA's own footage (their Instagram reel): after the generated film of the
 * journey, the real ritual — grind, tamp, espresso, latte art. One tall loop opens as it rises
 * into view; four stills from the same reel sit beside it.
 */
export function Bar() {
  const { t } = useI18n();
  const b = t.bar;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
        gsap.fromTo(
          ".b-frame",
          { clipPath: "inset(14% 12% 14% 12%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: { trigger: ".b-frame", start: "top 90%", end: "top 30%", scrub: fine ? 1 : false, toggleActions: "play none none none" },
            // touch: one timed reveal (an animated clip-path repaints the whole picture every scroll frame on iOS)
            ...(fine ? {} : { duration: 1.2, ease: "power3.out" }),
          },
        );
        // the right column of stills drifts against the left as the section passes (whole figures, so
        // captions travel with their photo and the rows never meet)
        gsap.fromTo(
          ".b-shot",
          { y: 28 },
          { y: -28, ease: "none", scrollTrigger: { trigger: ".b-shots", start: "top bottom", end: "bottom top", scrub: 1 } },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="bar" ref={root} aria-labelledby="bar-title" className="text-paper">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-24 md:px-10 md:py-36 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <figure className="flex flex-col gap-3">
          <div className="b-frame relative aspect-[9/16] w-full overflow-hidden bg-espresso-2 lg:max-h-[86svh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE}/cinema/bar/ritual-poster.webp`}
              alt={b.video}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <LoopVideo loop={LOOPS.bar} />
          </div>
          <figcaption className="text-[13px] text-muted-dark">{b.credit}</figcaption>
        </figure>

        <div className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-col gap-5">
            <p className="eyebrow text-seher">{b.eyebrow}</p>
            <h2 id="bar-title" className="max-w-[14ch] text-[clamp(44px,6.4vw,104px)] leading-[0.95] font-medium tracking-[-0.03em]">
              {b.title}
            </h2>
            <p className="max-w-[46ch] text-[18px] leading-relaxed text-paper/80 md:text-[19px]">{b.text}</p>
          </div>
          <ul className="b-shots grid grid-cols-2 gap-3 md:gap-4">
            {b.shots.map((s, i) => (
              <li key={s.src} className={i % 2 ? "b-shot" : undefined}>
                <figure className="flex flex-col gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${BASE}/cinema/bar/${s.src}.webp`}
                    alt={s.alt}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/5] w-full bg-espresso-2 object-cover"
                  />
                  <figcaption className="font-[family-name:var(--font-display)] text-[15px] md:text-[17px]">{s.title}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
