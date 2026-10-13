"use client";

import { useRef } from "react";
import { Letter } from "../Logo";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion, useWebGL } from "@/lib/hooks";
import { useI18n } from "@/i18n/context";
import { useJourneyOff } from "../journey/Journey";

/**
 * The map of the coffee journey. The 3D itself is the page-wide `journey/Journey`: at this section
 * the object comes to full size on the free side (right on wide screens, below the steps on phones),
 * then travels with the reader through the page.
 */
export function BeanStory() {
  const { t } = useI18n();
  const b = t.beans;
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const webgl = useWebGL();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".b-step", {
          opacity: 0,
          y: 24,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ".b-steps", start: "top 80%" },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const steps = [...b.steps.map((s) => ({ title: s.title, text: s.text })), { title: b.final.title, text: b.final.text }];
  // without the 3D (no WebGL or reduced motion) the stage shows the brand's K instead
  const journeyOff = useJourneyOff();
  const still = webgl === false || reduced || journeyOff;

  return (
    <section id="proses" ref={root} aria-labelledby="proses-title" className="relative overflow-hidden bg-espresso text-paper">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,rgb(var(--day-rgb)/0.14),transparent_60%)] lg:bg-[radial-gradient(ellipse_at_74%_50%,rgb(var(--day-rgb)/0.16),transparent_55%)]"
      />
      <div className="relative mx-auto grid w-full max-w-[1320px] gap-10 px-5 py-24 md:px-10 lg:min-h-[100svh] lg:grid-cols-[1fr_1fr] lg:items-center lg:py-32">
        <div>
          <p className="eyebrow text-seher">{b.eyebrow}</p>
          <h2 id="proses-title" className="mt-3 text-[clamp(32px,5vw,68px)] leading-[1.02] font-medium tracking-[-0.015em]">
            {b.title}
          </h2>
          <ol className="b-steps mt-8 grid gap-5 lg:mt-10">
            {steps.map((s, i) => (
              <li key={i} className="b-step grid grid-cols-[2.2rem_1fr] gap-x-3 border-t border-paper/12 pt-4">
                <span className="font-[family-name:var(--font-display)] text-lg text-paper/40">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-[family-name:var(--font-display)] text-xl text-glow">{s.title}</p>
                  <p className="mt-1 max-w-[46ch] text-[15px] leading-relaxed text-muted-dark">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        {/* the stage: empty space the page-wide 3D journey fills (phones: a tall gap below the steps) */}
        <div id="proses-stage" aria-hidden="true" className="flex h-[62svh] items-center justify-center lg:h-auto lg:self-stretch">
          {still && <Letter id="K" className="h-[55%] w-auto text-paper/80" />}
        </div>
      </div>
      <p className="sr-only">{b.alt}</p>
    </section>
  );
}
