"use client";

import { useRef } from "react";
import { MagneticButton } from "../ui/MagneticButton";
import { ClubCard } from "../ClubCard";
import { CremaBackground } from "../fx/CremaBackground";
import { Letter } from "../Logo";
import { gsap, useGSAP } from "@/lib/gsap";
import { links } from "@/lib/site";
import { useI18n } from "@/i18n/context";

export function Experience() {
  const { locale, t } = useI18n();
  const LINKS = links(locale);
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".x-card", {
          y: 60,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: ".x-grid", start: "top 80%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="tecrube" ref={root} className="day-glow overflow-hidden bg-black text-paper">
      <div className="mx-auto max-w-[1320px] px-5 py-24 md:px-10 md:py-32">
        <div className="flex flex-col gap-5">
          <p className="eyebrow text-seher">{t.exp.eyebrow}</p>
          <h2 className="max-w-[18ch] text-[clamp(40px,6vw,96px)] leading-[0.98] font-medium tracking-[-0.025em]">
            {t.exp.title}
          </h2>
        </div>

        <div className="x-grid mt-14 grid gap-6 md:grid-cols-2">
          <div className="x-card group flex flex-col overflow-hidden bg-espresso-2 text-paper">
            <a href={LINKS.ar} className="relative block aspect-[2/1] overflow-hidden bg-espresso-3" tabIndex={-1} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LINKS.arCard}
                alt=""
                className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-brand)] group-hover:scale-[1.04]"
                loading="lazy"
              />
            </a>
            <div className="flex flex-1 flex-col gap-4 p-8">
              <p className="eyebrow text-gunorta">{t.exp.arEyebrow}</p>
              <h3 className="text-[30px] leading-tight font-medium">{t.exp.arTitle}</h3>
              <p className="max-w-[44ch] text-[15px] leading-relaxed text-muted-dark">{t.exp.arText}</p>
              <ul className="grid gap-2 sm:grid-cols-3">
                {[LINKS.arScan, LINKS.arTable, LINKS.arSelfie].map((href, i) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="flex h-full min-h-12 items-center justify-between gap-2 border border-paper/20 px-3 py-2.5 text-[13px] font-bold transition-colors hover:border-glow hover:text-glow"
                    >
                      {t.exp.arModes[i]} <span aria-hidden="true">→</span>
                    </a>
                  </li>
                ))}
              </ul>
              <a href={LINKS.ar} className="mt-auto inline-flex items-center gap-3 self-start text-[13px] font-semibold">
                {t.exp.arCta} <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </a>
            </div>
          </div>

          <div className="x-card group flex flex-col overflow-hidden bg-paper text-black">
            <a href={LINKS.game} tabIndex={-1} aria-hidden="true" className="relative flex aspect-[2/1] items-end justify-center overflow-hidden bg-[#E6E6E3]">
              <svg viewBox="0 0 400 200" className="h-full w-auto" aria-hidden="true">
                <polygon points="168,10 232,10 212,52 188,52" fill="#F6F6F4" />
                <rect x="186" y="46" width="28" height="10" fill="#000000" />
                <rect x="197" y="56" width="6" height="70" fill="#000000" className="origin-top transition-transform duration-700 group-hover:scale-y-110" />
                <path d="M140,80 L260,80 L246,196 L154,196 Z" fill="none" stroke="#000000" strokeWidth="5" />
                <path d="M146,126 L254,126 L247,193 L153,193 Z" fill="#000000" />
                <rect x="118" y="122" width="164" height="4" fill="#878787" />
              </svg>
            </a>
            <div className="flex flex-1 flex-col gap-4 p-8">
              <p className="eyebrow text-espresso">{t.exp.gameEyebrow}</p>
              <h3 className="text-[30px] leading-tight font-medium">{t.exp.gameTitle}</h3>
              <p className="max-w-[44ch] text-[15px] leading-relaxed text-espresso/80">
                {t.exp.gameText}
              </p>
              <ul className="grid gap-2 sm:grid-cols-3">
                {[LINKS.gameLine, LINKS.gameRain, LINKS.gameMemory].map((href, i) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="flex h-full min-h-12 items-center justify-between gap-2 border border-espresso/25 px-3 py-2.5 text-[13px] font-bold transition-colors hover:border-espresso hover:bg-espresso hover:text-paper"
                    >
                      {t.exp.gameModes[i]} <span aria-hidden="true">→</span>
                    </a>
                  </li>
                ))}
              </ul>
              <a href={LINKS.game} className="mt-auto inline-flex items-center gap-3 self-start text-[13px] font-semibold">
                {t.exp.gameCta} <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </a>
            </div>
          </div>
        </div>
        <ClubCard />
      </div>
    </section>
  );
}

/** MOKA's two official slogans (brand book), set on a ring that turns as the page scrolls past. */
const RING = "In coffee we trust. \u00a0 Good to the last drop! \u00a0 ";

export function FinalCta() {
  const { locale, t } = useI18n();
  const LINKS = links(locale);
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tw = gsap.fromTo(
          ".f-ring",
          { rotate: -40 },
          { rotate: 140, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.8 } },
        );
        return () => tw.kill();
      });
      return () => mm.revert();
    },
    { scope: root },
  );
  return (
    <section ref={root} className="relative isolate overflow-hidden bg-espresso text-paper">
      <CremaBackground className="-z-10" amp={0.75} />
      {/* the slogan ring around the K, turned by the scroll */}
      <div aria-hidden="true" className="pointer-events-none absolute top-1/2 right-[-4vw] -z-10 hidden h-[min(46vw,620px)] w-[min(46vw,620px)] -translate-y-1/2 opacity-90 md:block">
        <svg viewBox="0 0 400 400" className="f-ring h-full w-full">
          <defs>
            <path id="f-ring-path" d="M200,200 m-170,0 a170,170 0 1,1 340,0 a170,170 0 1,1 -340,0" />
          </defs>
          <text className="fill-paper/55 font-[family-name:var(--font-display)] text-[21px] font-medium tracking-[0.02em]">
            <textPath href="#f-ring-path" textLength="1060" lengthAdjust="spacing">
              {RING}
              {RING}
            </textPath>
          </text>
        </svg>
        <Letter id="K" className="absolute top-1/2 left-1/2 h-[30%] w-auto -translate-x-1/2 -translate-y-1/2 text-paper/90" />
      </div>
      <div className="mx-auto flex max-w-[1320px] flex-col gap-10 px-5 py-24 md:px-10 md:py-32">
        <h2 className="max-w-[14ch] text-[clamp(40px,7vw,104px)] leading-[0.95] font-medium tracking-[-0.02em]">
          {t.final.title}
        </h2>
        <div className="h-[3px] w-full bg-gradient-to-r from-glow via-paper/30 to-transparent md:w-[56%]" aria-hidden="true" />
        {/* text and buttons stay in the left half: the slogan ring turns in the right one */}
        <div className="flex flex-col items-start gap-8 md:max-w-[52%]">
          <p className="max-w-[52ch] text-[17px] leading-relaxed text-muted-dark">
            {t.final.text}
          </p>
          <div className="flex flex-wrap gap-3">
            <MagneticButton href={LINKS.ar}>{t.final.ar}</MagneticButton>
            <MagneticButton href="#top" variant="ghost">{t.final.top}</MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
