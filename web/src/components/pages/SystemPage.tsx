"use client";

import { DayPalette } from "@/components/sections/DayPalette";
import { Apps } from "@/components/sections/Apps";
import { Experience } from "@/components/sections/Experience";
import { ToneBand } from "@/components/fx/ToneShift";
import { HeadingReveal } from "@/components/fx/HeadingReveal";
import { ScrollRefresh } from "@/components/ScrollRefresh";
import { useI18n } from "@/i18n/context";

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
          <div className="mx-auto flex max-w-[1320px] flex-col gap-6 px-5 pt-36 pb-16 md:px-10 md:pt-44 md:pb-24">
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
