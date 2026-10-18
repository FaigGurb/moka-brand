"use client";

import { useI18n } from "@/i18n/context";
import { HOME } from "@/lib/site";

export function PrivacyPage() {
  const { locale, t } = useI18n();
  const p = t.privacy;
  return (
    <section className="bg-paper text-espresso">
      <div className="mx-auto max-w-[820px] px-5 pt-32 pb-24 md:px-10 md:pt-40">
        <h1 className="text-[clamp(40px,7vw,80px)] leading-none font-medium tracking-[-0.02em]">{p.title}</h1>
        <div className="mt-6 h-[3px] w-24 bg-black" aria-hidden="true" />
        <p className="mt-6 text-[13px] text-muted">{p.updated}</p>
        <p className="mt-6 text-[18px] leading-relaxed">{p.intro}</p>
        {p.sections.map((s) => (
          <div key={s.h} className="mt-10">
            <h2 className="text-2xl font-medium">{s.h}</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-muted">{s.p}</p>
          </div>
        ))}
        <a href={HOME[locale]} className="mt-14 inline-block bg-espresso px-5 py-3.5 text-[13px] font-bold tracking-normal text-paper">
          ← {p.back}
        </a>
      </div>
    </section>
  );
}
