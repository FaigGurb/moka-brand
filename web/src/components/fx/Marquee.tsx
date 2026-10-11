"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/i18n/context";

/**
 * Two bands of the brand line ("4 letters · 4 brews · 1 line") drifting in opposite directions.
 * Scrolling pushes them faster and flips their direction with the scroll.
 */
export function Marquee() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);
  const phrase = [...t.hero.lines, "MOKA", "Bakı"].join("  ·  ") + "  ·  ";

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rows = gsap.utils.toArray<HTMLElement>(".mq-track");
        const tweens = rows.map((r, i) =>
          gsap.fromTo(r, { xPercent: i % 2 ? -50 : 0 }, { xPercent: i % 2 ? 0 : -50, duration: 38, ease: "none", repeat: -1 }),
        );
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const v = self.getVelocity() / 250;
            const dir = self.direction;
            tweens.forEach((tw) => {
              gsap.to(tw, { timeScale: dir * Math.max(1, Math.min(6, Math.abs(v))), duration: 0.2, overwrite: true });
              gsap.to(tw, { timeScale: dir, duration: 1.2, delay: 0.2, ease: "power2.out" });
            });
          },
        });
        return () => {
          st.kill();
          tweens.forEach((tw) => tw.kill());
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const row = (outline: boolean) => (
    <div className="overflow-hidden whitespace-nowrap">
      <div className="mq-track inline-flex will-change-transform">
        {[0, 1].map((k) => (
          <span
            key={k}
            className={`pr-4 font-[family-name:var(--font-display)] text-[clamp(44px,9vw,128px)] leading-[1.05] font-medium tracking-[-0.02em] ${
              outline ? "text-transparent [-webkit-text-stroke:1.5px_rgba(245,241,234,0.55)]" : "text-paper"
            }`}
          >
            {phrase.repeat(2)}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <section ref={root} aria-hidden="true" className="relative overflow-hidden border-y border-paper/10 bg-espresso py-10 md:py-14">
      {row(false)}
      <div className="my-3 h-[3px] w-full bg-gradient-to-r from-transparent via-glow to-transparent opacity-70" />
      {row(true)}
    </section>
  );
}
