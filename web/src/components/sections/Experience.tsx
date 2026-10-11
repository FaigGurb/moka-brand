"use client";

import { useRef } from "react";
import { MagneticButton } from "../ui/MagneticButton";
import { ClubCard } from "../ClubCard";
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
    <section id="tecrube" ref={root} className="bg-paper-2 text-espresso">
      <div className="mx-auto max-w-[1320px] px-5 py-24 md:px-10 md:py-32">
        <div className="flex flex-col gap-5">
          <p className="eyebrow text-axsam-ink">{t.exp.eyebrow}</p>
          <h2 className="max-w-[18ch] text-[clamp(36px,5vw,68px)] leading-[1.02] font-medium tracking-[-0.015em]">
            {t.exp.title}
          </h2>
        </div>

        <div className="x-grid mt-14 grid gap-6 md:grid-cols-2">
          <div className="x-card group flex flex-col overflow-hidden bg-espresso text-paper">
            <a href={LINKS.ar} className="relative block aspect-[2/1] overflow-hidden bg-espresso-2" tabIndex={-1} aria-hidden="true">
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
              <a href={LINKS.ar} className="mt-auto inline-flex items-center gap-3 self-start text-[13px] font-bold tracking-[0.14em] uppercase">
                {t.exp.arCta} <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </a>
            </div>
          </div>

          <div className="x-card group flex flex-col overflow-hidden bg-seher text-espresso">
            <a href={LINKS.game} tabIndex={-1} aria-hidden="true" className="relative flex aspect-[2/1] items-end justify-center overflow-hidden bg-[#BE8F60]">
              <svg viewBox="0 0 400 200" className="h-full w-auto" aria-hidden="true">
                <polygon points="168,10 232,10 212,52 188,52" fill="#F5F1EA" />
                <rect x="186" y="46" width="28" height="10" fill="#1B1714" />
                <rect x="197" y="56" width="6" height="70" fill="#5E3B26" className="origin-top transition-transform duration-700 group-hover:scale-y-110" />
                <path d="M140,80 L260,80 L246,196 L154,196 Z" fill="none" stroke="#1B1714" strokeWidth="5" />
                <path d="M146,126 L254,126 L247,193 L153,193 Z" fill="#5E3B26" />
                <rect x="118" y="122" width="164" height="4" fill="#F5F1EA" />
              </svg>
            </a>
            <div className="flex flex-1 flex-col gap-4 p-8">
              <p className="eyebrow text-espresso/70">{t.exp.gameEyebrow}</p>
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
              <a href={LINKS.game} className="mt-auto inline-flex items-center gap-3 self-start text-[13px] font-bold tracking-[0.14em] uppercase">
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

export function FinalCta() {
  const { locale, t } = useI18n();
  const LINKS = links(locale);
  return (
    <section className="bg-espresso text-paper">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-10 px-5 py-24 md:px-10 md:py-32">
        <h2 className="max-w-[14ch] text-[clamp(40px,7vw,104px)] leading-[0.95] font-medium tracking-[-0.02em]">
          {t.final.title}
        </h2>
        <div className="h-[3px] w-full bg-gradient-to-r from-glow via-gunorta to-transparent" aria-hidden="true" />
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
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
