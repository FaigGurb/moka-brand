"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { Logo } from "../Logo";
import { MagneticButton } from "../ui/MagneticButton";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion, useTouch, useWebGL } from "@/lib/hooks";
import { links } from "@/lib/site";
import { useIdle, useInView, usePerfTier } from "@/lib/perf";
import { useI18n } from "@/i18n/context";

// Three.js loads only in the browser and only for the hero.
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export function Hero() {
  const { locale, t } = useI18n();
  const L = links(locale);
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [ready, setReady] = useState(false);
  const reduced = useReducedMotion();
  const webgl = useWebGL();
  const touch = useTouch();
  const tier = usePerfTier();
  const idle = useIdle();
  // render the 3D only while the hero is (nearly) on screen
  const inView = useInView(root, "100px");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-word", { yPercent: 110, duration: 1.1, ease: "power4.out", stagger: 0.12, delay: 0.5 });
        gsap.from(".hero-fade", { opacity: 0, y: 16, duration: 0.9, ease: "power2.out", stagger: 0.08, delay: 1.1 });
      });
      // Scroll progress drives the 3D halves apart along the brand line.
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress;
        },
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // the three.js chunk loads once the browser is idle, so first paint and input stay fast
  const show3D = webgl === true && idle;

  return (
    <section
      id="top"
      ref={root}
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-espresso text-paper"
    >
      {/* warm wash behind the wordmark, echoing the café's LED line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[34%] h-[38%] bg-[radial-gradient(ellipse_at_center,rgba(242,199,110,0.16),transparent_65%)]"
      />
      <div className="relative mx-auto flex w-full max-w-[1320px] flex-1 flex-col px-5 pt-24 pb-10 md:px-10 md:pt-28">
        <p className="hero-fade eyebrow text-muted-dark">{t.hero.eyebrow}</p>

        <div className="relative my-6 flex flex-1 items-center justify-center md:my-4">
          <div className="relative aspect-[675/330] w-full max-w-[1100px] sm:aspect-[675/240]">
            {/* SVG wordmark: visible until the 3D scene is ready, and the permanent fallback without WebGL. */}
            <Logo
              className={`absolute inset-x-[6%] top-1/2 w-[88%] -translate-y-1/2 text-paper transition-opacity duration-700 ${
                show3D && ready ? "opacity-0" : "opacity-100"
              }`}
              title={t.hero.logo}
            />
            {show3D && (
              <div className="absolute inset-[-12%_-4%] sm:inset-[-12%_-8%]">
                <HeroScene progress={progress} reducedMotion={reduced} touch={touch} lite={tier === "low"} active={inView} onReady={() => setReady(true)} />
              </div>
            )}
          </div>
        </div>

        <div className="grid items-end gap-8 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(44px,8.4vw,112px)] leading-[0.92] font-medium tracking-[-0.02em]">
            {t.hero.lines.map((l) => (
              <span key={l} className="reveal-line block">
                <span className="hero-word">{l}</span>
              </span>
            ))}
          </h1>
          <div className="flex flex-col gap-7 md:pb-3">
            <p className="hero-fade max-w-[46ch] text-[17px] leading-relaxed text-muted-dark">
              {t.hero.text}
            </p>
            <div className="hero-fade flex flex-wrap gap-3">
              <MagneticButton href="#konsepsiya">{t.hero.cta}</MagneticButton>
              <MagneticButton href={L.ar} variant="ghost">
                {t.hero.ar}
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
