"use client";

import { useRef } from "react";
import { Letter } from "../Logo";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion, useWebGL } from "@/lib/hooks";
import { useI18n } from "@/i18n/context";

/**
 * Stage 2 of the coffee journey: a tall section whose caption stays on screen (CSS sticky) while the
 * page-wide 3D object, centred below it, pours the finished brew into the MOKA cup and closes the lid.
 * The marker `#fincan-end` ends the finale (anchors in journey/chapters.ts).
 */
export function Finale() {
  const { t } = useI18n();
  const f = t.beans.final;
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const webgl = useWebGL();
  const still = webgl === false || reduced;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // the line under the title draws itself as the cup fills
        gsap.fromTo(
          ".f-line",
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 1 } },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      id="fincan"
      ref={root}
      aria-labelledby="fincan-title"
      className="relative bg-espresso text-paper motion-safe:h-[240svh]"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col items-center overflow-hidden px-5 pt-24 text-center md:pt-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_62%,rgb(var(--day-rgb)/0.2),transparent_58%)]"
        />
        <p className="eyebrow relative text-seher">05 · {t.beans.eyebrow}</p>
        <h2
          id="fincan-title"
          className="relative mt-3 font-[family-name:var(--font-display)] text-[clamp(44px,8vw,112px)] leading-[0.95] font-medium tracking-[-0.02em]"
        >
          {f.title}
        </h2>
        <span aria-hidden="true" className="relative mt-4 block h-[3px] w-[min(320px,60vw)] bg-paper/12">
          <span className="f-line absolute inset-0 origin-left bg-glow shadow-[0_0_14px_rgba(255,226,166,0.8)] motion-reduce:scale-x-100" />
        </span>
        <p className="relative mt-5 max-w-[44ch] text-[15px] leading-relaxed text-muted-dark sm:text-[17px]">{f.text}</p>
        {still && (
          <div aria-hidden="true" className="relative flex flex-1 items-center justify-center py-10">
            <Letter id="K" className="h-[min(40svh,320px)] w-auto text-paper/80" />
          </div>
        )}
      </div>
      <div id="fincan-stick" aria-hidden="true" className="absolute inset-x-0 top-[45svh] h-px" />
      <div id="fincan-end" aria-hidden="true" className="absolute inset-x-0 bottom-[70svh] h-px" />
    </section>
  );
}
