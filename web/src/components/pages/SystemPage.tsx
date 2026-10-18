"use client";

import { DayPalette } from "@/components/sections/DayPalette";
import { Apps } from "@/components/sections/Apps";
import { Experience } from "@/components/sections/Experience";
import { ToneBand } from "@/components/fx/ToneShift";
import { HeadingReveal } from "@/components/fx/HeadingReveal";
import { ScrollRefresh } from "@/components/ScrollRefresh";
import { useI18n } from "@/i18n/context";
import { Letter } from "@/components/Logo";

// the five hours of the day palette, as segments of one signature line
const DAY_HEX = ["#C89B6D", "#D9B56A", "#A8643A", "#8E8A84", "#8E2F22"];

/**
 * The concept's system on its own page (the home page keeps the film, the bar, the idea, the partners
 * and the cafés): the day colours, the applications from the cup to Instagram, AR, games and the Club.
 */
export function SystemPage() {
  const { t } = useI18n();
  const s = t.system;
  return (
    <>
      <ToneBand tone="ink">
        <section aria-labelledby="system-title">
          <div className="mx-auto grid max-w-[1320px] items-center gap-12 px-5 pt-36 pb-16 md:grid-cols-[1.15fr_1fr] md:px-10 md:pt-44 md:pb-24">
          <div className="flex flex-col gap-6">
            <p className="eyebrow">{s.eyebrow}</p>
            <h1 id="system-title" className="max-w-[14ch] font-[family-name:var(--font-display)] text-[clamp(48px,8vw,128px)] leading-[0.92] font-medium tracking-[-0.03em]">
              {s.title}
            </h1>
            <p className="max-w-[48ch] text-[18px] leading-relaxed text-paper/80 md:text-[21px]">{s.text}</p>
            <ul className="mt-4 flex flex-wrap gap-3">
              {[
                ["#reng", s.items[0]],
                ["#tetbiq", s.items[1]],
                ["#tecrube", s.items[2]],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="inline-flex min-h-[44px] items-center border border-paper/35 px-5 font-[family-name:var(--font-display)] text-[16px] transition-colors hover:border-paper">
                    {label} <span aria-hidden="true" className="ml-2">↓</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {/* the K of the logo, cut by its signature line, here lit in the five hours of the day */}
          <div aria-hidden="true" className="relative mx-auto flex h-[clamp(220px,34vw,440px)] w-full items-center justify-center">
            <Letter id="K" className="h-full w-auto text-paper" />
            <span className="absolute inset-x-0 top-1/2 flex h-[6px] -translate-y-1/2">
              {DAY_HEX.map((c) => (
                <span key={c} className="flex-1" style={{ background: c, boxShadow: `0 0 28px 4px ${c}` }} />
              ))}
            </span>
          </div>
          </div>
        </section>
        <DayPalette />
      </ToneBand>
      <ToneBand tone="paper">
        <Apps />
      </ToneBand>
      <ToneBand tone="ink">
        <Experience />
      </ToneBand>
      <HeadingReveal />
      <ScrollRefresh />
    </>
  );
}
