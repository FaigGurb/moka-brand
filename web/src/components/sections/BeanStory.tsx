"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Letter } from "../Logo";
import { CAPTIONS } from "../beans/phases";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion, useTouch, useWebGL } from "@/lib/hooks";
import { useI18n } from "@/i18n/context";

// Three.js only in the browser; the chunk is shared with the hero scene.
const BeanStoryScene = dynamic(() => import("../beans/BeanStoryScene"), { ssr: false });

export function BeanStory() {
  const { t } = useI18n();
  const b = t.beans;
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const reduced = useReducedMotion();
  const webgl = useWebGL();
  const touch = useTouch();
  const [near, setNear] = useState(false);
  const [active, setActive] = useState(false);

  // Mount the canvas shortly before it scrolls in; render frames only while visible.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const pre = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && setNear(true), { rootMargin: "150% 0px" });
    const vis = new IntersectionObserver((es) => es.forEach((e) => setActive(e.isIntersecting)));
    pre.observe(el);
    vis.observe(el);
    return () => {
      pre.disconnect();
      vis.disconnect();
    };
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const panels = gsap.utils.toArray<HTMLElement>(".b-panel");
        const ticks = gsap.utils.toArray<HTMLElement>(".b-tick");
        gsap.set(panels.slice(1), { autoAlpha: 0, y: 24 });
        gsap.set(ticks.slice(1), { opacity: 0.4 });
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: ".b-pin",
            start: "top top",
            end: "+=320%",
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
            onUpdate: (self) => {
              progress.current = self.progress;
            },
          },
        });
        // A one-second timeline maps 1:1 to scroll progress, matching the scene's phases.
        tl.to({}, { duration: 1 }, 0);
        tl.fromTo(".b-bar", { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "none" }, 0);
        CAPTIONS.forEach(([from, to], i) => {
          if (i > 0) {
            tl.fromTo(panels[i], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.035 }, from);
            if (ticks[i]) tl.to(ticks[i], { opacity: 1, duration: 0.03 }, from);
          }
          if (i < CAPTIONS.length - 1) tl.to(panels[i], { autoAlpha: 0, y: -24, duration: 0.035, ease: "power2.in" }, to - 0.035);
        });
        return () => tl.kill();
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        progress.current = 1;
        gsap.set(".b-bar", { scaleX: 1 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const panels = [...b.steps.map((s) => ({ title: s.title, text: s.text })), { title: b.final.title, text: b.final.text }];

  return (
    <section id="proses" ref={root} aria-labelledby="proses-title" className="bg-espresso text-paper">
      <div className="b-pin relative flex flex-col overflow-hidden motion-safe:h-[100svh]">
        {/* warm light behind the Chemex */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_75%,rgba(242,199,110,0.12),transparent_60%)] lg:bg-[radial-gradient(ellipse_at_70%_55%,rgba(242,199,110,0.14),transparent_55%)]"
        />

        <div
          aria-hidden="true"
          className="motion-safe:absolute motion-safe:inset-0 motion-reduce:relative motion-reduce:order-2 motion-reduce:h-[70svh]"
        >
          {webgl === true && near && (
            <BeanStoryScene progress={progress} reducedMotion={reduced} touch={touch} active={active || reduced} />
          )}
          {webgl === false && (
            <div className="flex h-full items-center justify-center lg:justify-end lg:pr-[14%]">
              <Letter id="K" className="h-[55%] w-auto text-paper/80" />
            </div>
          )}
        </div>

        {/* keeps the captions readable over the floating beans */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[5] bg-[linear-gradient(180deg,rgba(27,23,20,0.85)_0%,rgba(27,23,20,0.55)_26%,transparent_42%)] motion-reduce:hidden lg:bg-[linear-gradient(90deg,rgba(27,23,20,0.85)_0%,rgba(27,23,20,0.5)_34%,transparent_52%)]"
        />
        {/* captions */}
        <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-[1320px] flex-col px-5 pt-24 pb-8 motion-safe:h-full md:px-10 lg:justify-center lg:pt-16">
          <div className="lg:max-w-[42%]">
            <p className="eyebrow text-seher">{b.eyebrow}</p>
            <h2
              id="proses-title"
              className="mt-3 text-[clamp(32px,5vw,68px)] leading-[1.02] font-medium tracking-[-0.015em]"
            >
              {b.title}
            </h2>
            <div className="relative mt-5 grid gap-6 motion-safe:block motion-safe:h-[150px] sm:motion-safe:h-[130px] lg:mt-8">
              {panels.map((s, i) => (
                <div key={i} className="b-panel motion-safe:absolute motion-safe:inset-x-0 motion-safe:top-0">
                  <p className="font-[family-name:var(--font-display)] text-xl text-glow sm:text-2xl">
                    <span className="mr-2 text-paper/40">{String(i + 1).padStart(2, "0")}</span>
                    {s.title}
                  </p>
                  <p className="mt-2 max-w-[46ch] text-[15px] leading-relaxed text-muted-dark sm:text-[17px]">{s.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* progress, drawn as the signature line */}
          <div className="mt-auto lg:mt-10 lg:max-w-[42%]" aria-hidden="true">
            <div className="relative h-[3px] w-full bg-paper/15">
              <span className="b-bar absolute inset-0 origin-left scale-x-0 bg-glow" />
            </div>
            <ol className="mt-3 flex justify-between gap-2 text-[10px] font-bold tracking-[0.08em] uppercase sm:text-[12px] sm:tracking-[0.14em]">
              {b.steps.map((s) => (
                <li key={s.title} className="b-tick">
                  {s.title}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      <p className="sr-only">{b.alt}</p>
    </section>
  );
}
