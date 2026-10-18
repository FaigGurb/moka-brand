"use client";

import { links } from "@/lib/site";
import { useI18n } from "@/i18n/context";

/** The rest of the concept lives on its own page: one big line and three large doors into it. */
export function SystemTeaser() {
  const { locale, t } = useI18n();
  const s = t.system;
  const base = links(locale).system;
  const doors = [
    ["#reng", s.items[0]],
    ["#tetbiq", s.items[1]],
    ["#tecrube", s.items[2]],
  ] as const;
  return (
    <section id="sistem" aria-labelledby="sistem-title" className="text-paper">
      <div className="mx-auto max-w-[1320px] px-5 py-24 md:px-10 md:py-36">
        <p className="eyebrow">{s.eyebrow}</p>
        <h2 id="sistem-title" className="mt-5 max-w-[14ch] text-[clamp(44px,7vw,112px)] leading-[0.94] font-medium tracking-[-0.03em]">
          {s.title}
        </h2>
        <p className="mt-6 max-w-[46ch] text-[18px] leading-relaxed text-paper/80 md:text-[21px]">{s.text}</p>
        <ul className="mt-12 border-t border-paper/15">
          {doors.map(([hash, label], i) => (
            <li key={hash} className="border-b border-paper/15">
              <a
                href={base + hash}
                className="group flex items-baseline justify-between gap-6 py-6 font-[family-name:var(--font-display)] text-[clamp(28px,4.4vw,64px)] leading-none tracking-[-0.02em] transition-colors hover:text-paper/70 md:py-8"
              >
                <span className="flex items-baseline gap-5">
                  <span className="text-[15px] tracking-normal text-muted-dark tabular-nums">0{i + 1}</span>
                  {label}
                </span>
                <span aria-hidden="true" className="text-[0.6em] transition-transform duration-300 group-hover:translate-x-2">→</span>
              </a>
            </li>
          ))}
        </ul>
        <a href={base} className="mt-10 inline-flex min-h-[48px] items-center bg-paper px-6 font-[family-name:var(--font-display)] text-[16px] font-medium text-black transition-colors hover:bg-paper/85">
          {s.cta} <span aria-hidden="true" className="ml-2">→</span>
        </a>
      </div>
    </section>
  );
}
