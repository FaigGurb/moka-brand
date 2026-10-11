"use client";

import { useRef } from "react";
import { Letter } from "../Logo";
import { gsap, useGSAP } from "@/lib/gsap";

const STEPS = [
  { id: "M", tool: "Moka pot", text: "Trapesiya gövdə və çentikli qapaq. Ocaqda dəmlənən güclü, sıx qəhvə; evlərin klassik aləti." },
  { id: "O", tool: "Fincan", text: "Yuxarıdan baxılan fincan, eyni zamanda qəhvə dənəsi. Espresso barın simvolu." },
  { id: "K", tool: "Chemex", text: "Qum saatı forması və qulp. Təmiz, şəffaf fincan; stəkanlardakı ikon da budur." },
  { id: "A", tool: "V60", text: "Konus dripper. Dənin dad notlarını ən aydın göstərən damla üsulu." },
] as const;

export function Concept() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Pinned storytelling only on large screens with motion allowed; otherwise a plain list.
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const letters = gsap.utils.toArray<HTMLElement>(".c-letter");
        const panels = gsap.utils.toArray<HTMLElement>(".c-panel");
        gsap.set(letters, { opacity: 0.16 });
        gsap.set(panels, { autoAlpha: 0, y: 30 });
        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: { trigger: ".c-pin", start: "top top", end: "+=260%", pin: true, scrub: 0.6 },
        });
        tl.to(".c-line", { scaleX: 1, duration: 4, ease: "none" }, 0);
        STEPS.forEach((_, i) => {
          const at = i;
          tl.to(letters[i], { opacity: 1, y: -10, duration: 0.4 }, at)
            .to(panels[i], { autoAlpha: 1, y: 0, duration: 0.4 }, at);
          if (i < STEPS.length - 1) {
            tl.to(letters[i], { opacity: 0.45, y: 0, duration: 0.4 }, at + 0.8)
              .to(panels[i], { autoAlpha: 0, y: -30, duration: 0.4 }, at + 0.8);
          }
        });
        tl.to(letters, { opacity: 1, y: 0, duration: 0.4 }, 3.6);
        return () => tl.kill();
      });
      mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
        gsap.set(".c-line", { scaleX: 1 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="konsepsiya" ref={root} className="bg-paper text-espresso">
      <div className="c-pin mx-auto flex max-w-[1320px] flex-col justify-center px-5 py-24 md:px-10 lg:min-h-screen lg:py-16">
        <div className="flex flex-col gap-5">
          <p className="eyebrow text-axsam-ink">Konsepsiya</p>
          <h2 className="max-w-[16ch] text-[clamp(36px,5.4vw,72px)] leading-[1.02] font-medium tracking-[-0.015em]">
            Hər hərf bir dəmləmə alətidir
          </h2>
        </div>

        <div className="relative mt-14 grid grid-cols-2 gap-x-6 gap-y-10 lg:mt-16 lg:grid-cols-4">
          {STEPS.map((s) => (
            <figure key={s.id} className="c-letter flex flex-col gap-4">
              <Letter id={s.id} className="h-[clamp(96px,12vw,170px)] w-auto self-start text-espresso" />
              <figcaption className="font-[family-name:var(--font-display)] text-2xl">
                {s.id} · {s.tool}
              </figcaption>
            </figure>
          ))}
          {/* the signature line, drawn as the story progresses */}
          <span
            aria-hidden="true"
            className="c-line pointer-events-none absolute top-[calc(clamp(96px,12vw,170px)*0.5)] left-0 hidden h-[3px] w-full origin-left scale-x-0 bg-axsam lg:block"
          />
        </div>

        <div className="relative mt-12 grid gap-6 lg:mt-14 lg:block lg:h-[120px]">
          {STEPS.map((s) => (
            <p
              key={s.id}
              className="c-panel max-w-[52ch] text-[clamp(17px,1.6vw,22px)] leading-relaxed text-muted lg:absolute lg:inset-x-0 lg:top-0"
            >
              <b className="text-espresso">{s.tool}.</b> {s.text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
