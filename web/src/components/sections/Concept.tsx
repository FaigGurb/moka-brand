"use client";

import { useRef } from "react";
import { Letter } from "../Logo";
import { gsap, useGSAP, scrubFor } from "@/lib/gsap";
import { useI18n } from "@/i18n/context";

const IDS = ["M", "O", "K", "A"] as const;

export function Concept() {
  const { t } = useI18n();
  const STEPS = IDS.map((id, i) => ({ id, ...t.concept.steps[i] }));
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Pinned storytelling on every screen size; reduced motion gets a plain list.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const letters = gsap.utils.toArray<HTMLElement>(".c-letter");
        // Dim the letter shapes, not the captions: inactive captions stay readable (WCAG contrast).
        const marks = letters.map((l) => l.querySelector("svg"));
        const caps = letters.map((l) => l.querySelector("figcaption"));
        const panels = gsap.utils.toArray<HTMLElement>(".c-panel");
        gsap.set(marks, { opacity: 0.16 });
        gsap.set(caps, { opacity: 0.7 });
        gsap.set(panels, { autoAlpha: 0, y: 30 });
        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          // no GSAP pin: the scene is CSS-sticky (smooth under touch momentum on phones); the timeline follows the section
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: scrubFor(0.5) },
        });
        tl.to(".c-line", { scaleX: 1, duration: 4, ease: "none" }, 0);
        STEPS.forEach((_, i) => {
          const at = i;
          tl.to(letters[i], { y: -10, duration: 0.4 }, at)
            .to([marks[i], caps[i]], { opacity: 1, duration: 0.4 }, at)
            .to(panels[i], { autoAlpha: 1, y: 0, duration: 0.4 }, at)

          if (i < STEPS.length - 1) {
            tl.to(letters[i], { y: 0, duration: 0.4 }, at + 0.8)
              .to(marks[i], { opacity: 0.45, duration: 0.4 }, at + 0.8)
              .to(caps[i], { opacity: 0.7, duration: 0.4 }, at + 0.8)
              .to(panels[i], { autoAlpha: 0, y: -30, duration: 0.4 }, at + 0.8);
          }
        });
        tl.to(letters, { y: 0, duration: 0.4 }, 3.6).to([...marks, ...caps], { opacity: 1, duration: 0.4 }, 3.6);
        return () => tl.kill();
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".c-line", { scaleX: 1 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="konsepsiya" ref={root} className="day-glow overflow-x-clip bg-black text-paper motion-safe:h-[260svh]">
      <div className="c-pin mx-auto flex max-w-[1320px] flex-col justify-center px-5 py-24 md:px-10 motion-safe:sticky motion-safe:top-0 motion-safe:h-[100svh] motion-safe:py-16">
        <div className="flex flex-col gap-5">
          <p className="eyebrow text-seher">{t.concept.eyebrow}</p>
          <h2 className="max-w-[16ch] text-[clamp(40px,6vw,96px)] leading-[0.98] font-medium tracking-[-0.025em]">
            {t.concept.title}
          </h2>
        </div>

        <div className="relative mt-10 grid grid-cols-4 gap-x-3 gap-y-10 md:gap-x-6 lg:mt-16">
          {STEPS.map((s) => (
            <figure key={s.id} className="c-letter flex flex-col gap-2 md:gap-4">
              <Letter id={s.id} className="h-[clamp(60px,17vw,170px)] w-auto max-w-full self-start text-paper" />
              <figcaption className="font-[family-name:var(--font-display)] text-[13px] leading-tight sm:text-lg md:text-2xl">
                <span className="hidden sm:inline">{s.id} · </span>{s.tool}
              </figcaption>
            </figure>
          ))}
          {/* the signature line, drawn as the story progresses */}
          <span
            aria-hidden="true"
            className="c-line pointer-events-none absolute top-[calc(clamp(60px,17vw,170px)*0.5_-_1px)] left-0 h-[3px] w-full origin-left scale-x-0 bg-glow shadow-[0_0_14px_rgba(255,226,166,0.6)]"
          />
        </div>

        <div className="relative mt-10 grid gap-6 motion-safe:block motion-safe:h-[150px] lg:mt-14 lg:motion-safe:h-[120px]">
          {STEPS.map((s) => (
            <p
              key={s.id}
              className="c-panel max-w-[52ch] text-[clamp(17px,1.6vw,22px)] leading-relaxed text-paper/65 motion-safe:absolute motion-safe:inset-x-0 motion-safe:top-0"
            >
              <b className="text-paper">{s.tool}.</b> {s.text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
