"use client";

import { useRef } from "react";
import { Logo } from "../Logo";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/i18n/context";
import type { Dict } from "@/i18n/dict";

function Dots({ n, ink }: { n: number; ink: string }) {
  return (
    <span className="flex gap-1.5" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <i key={i} className="block h-3 w-3 border-2" style={{ borderColor: ink, background: i < n ? ink : "transparent" }} />
      ))}
    </span>
  );
}

type BagText = Dict["tiers"]["bag"];

function bags(b: BagText) {
  return [
    (
      <div key="core" className="relative flex h-full flex-col overflow-hidden bg-white text-espresso">
        <div className="h-[5%] bg-[#ECE8E1]" />
        <div className="flex flex-col gap-2 p-[9%]">
          <Logo className="w-[58%]" />
          <span className="text-[9px] font-bold tracking-[0.3em]">{b.core}</span>
          <span className="mt-5 flex items-center gap-2">
            <span className="h-3.5 w-3.5 flex-none rounded-full bg-flavor-berry" aria-hidden="true" />
            <span className="font-[family-name:var(--font-display)] text-[26px] leading-[1.05]">{b.coreNotes}</span>
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex h-[42%] flex-col justify-between bg-roast-2 px-[9%] py-4 text-paper">
          <span className="text-[11px] font-bold tracking-[0.18em]">{b.medium}</span>
          <Dots n={3} ink="#F5F1EA" />
        </div>
      </div>
    ),
    (
      <div key="single" className="relative flex h-full flex-col overflow-hidden bg-kraft text-espresso">
        <div className="h-[5%] bg-[#B9976F]" />
        <div className="flex flex-col gap-2 p-[9%]">
          <Logo className="w-[58%]" />
          <span className="text-[9px] font-bold tracking-[0.3em]">{b.single}</span>
          <span className="mt-4 flex gap-1.5" aria-hidden="true">
            <span className="h-3.5 w-3.5 rounded-full bg-flavor-floral" />
            <span className="h-3.5 w-3.5 rounded-full bg-flavor-citrus" />
          </span>
          <span className="font-[family-name:var(--font-display)] text-[32px] leading-[1]">
            {b.singleNotes[0]}
            <br />
            {b.singleNotes[1]}
          </span>
          <span className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] leading-snug">
            <span><b>{b.farmer}</b><br />{b.ph.farmer}</span>
            <span><b>{b.region}</b><br />{b.ph.region}</span>
            <span><b>{b.altitude}</b><br />{b.ph.altitude}</span>
            <span><b>{b.process}</b><br />{b.ph.process}</span>
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex h-[24%] items-end justify-between border-t-4 border-paper bg-roast-1 px-[9%] py-4">
          <span className="text-[11px] font-bold tracking-[0.18em]">{b.light}</span>
          <span className="text-[11px] font-bold tracking-[0.12em]">QR → AR</span>
        </div>
      </div>
    ),
    (
      <div key="limited" className="relative flex h-full flex-col overflow-hidden bg-espresso text-paper">
        <div className="h-[5%] bg-espresso-2" />
        <div className="flex flex-col gap-2 p-[9%]">
          <Logo className="w-[58%]" />
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#e07a62]">{b.limited}</span>
          <span className="mt-3 font-[family-name:var(--font-display)] text-[24px] leading-tight">{b.artist}</span>
        </div>
        <svg viewBox="0 0 300 200" className="mt-auto w-full" aria-hidden="true">
          <polygon points="20,30 80,72 140,30 166,196 0,196" fill="#8E2F22" />
          <circle cx="220" cy="90" r="56" fill="#F5F1EA" />
          <polygon points="110,110 200,110 176,152 200,200 112,200 134,152" fill="#C89B6D" />
          <rect x="0" y="128" width="300" height="5" fill="#1B1714" />
          <rect x="0" y="133" width="300" height="4" fill="#8E2F22" />
        </svg>
      </div>
    ),
  ];
}

export function Tiers() {
  const { t } = useI18n();
  const bagEls = bags(t.tiers.bag);
  const TIERS = t.tiers.items.map((it, i) => ({ n: it.name, sub: it.sub, bag: bagEls[i] }));
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Horizontal gallery driven by vertical scroll on every screen size; native swipe only for reduced motion.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const track = root.current!.querySelector<HTMLElement>(".t-track")!;
        const distance = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: ".t-pin",
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        return () => tween.kill();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="paket" ref={root} className="bg-paper-2 text-espresso">
      <div className="t-pin overflow-hidden motion-safe:flex motion-safe:h-[100svh] motion-safe:items-center">
        <div tabIndex={0} aria-label={t.tiers.title} className="t-track no-scrollbar focus-visible:outline-3 focus-visible:outline-gunorta flex gap-6 px-5 md:gap-8 md:px-10 motion-reduce:snap-x motion-reduce:snap-mandatory motion-reduce:scroll-px-5 motion-reduce:overflow-x-auto motion-reduce:py-24 motion-safe:pr-[10vw] lg:motion-safe:pl-[max(40px,calc((100vw_-_1320px)/2_+_40px))]">
          <div className="flex w-[78vw] max-w-[440px] flex-none snap-start flex-col justify-center gap-6 lg:w-[36vw]">
            <p className="eyebrow text-axsam-ink">{t.tiers.eyebrow}</p>
            <h2 className="text-[clamp(36px,4.6vw,64px)] leading-[1.02] font-medium tracking-[-0.01em]">{t.tiers.title}</h2>
            <p className="max-w-[40ch] text-[17px] leading-relaxed text-muted">
              {t.tiers.text}
            </p>
            <p className="text-sm font-bold tracking-[0.06em] text-muted motion-reduce:hidden">{t.tiers.hint}</p>
          </div>
          {TIERS.map((t, i) => (
            <article key={t.n} className="flex w-[min(72vw,calc((100svh_-_250px)/1.53),380px)] flex-none snap-start flex-col gap-3 md:gap-4 lg:w-[min(26vw,calc((100svh_-_250px)/1.53))]">
              <div className="aspect-[3/4.6] w-full shadow-[0_40px_70px_-40px_rgba(27,23,20,0.55)] transition-transform duration-500 ease-[var(--ease-brand)] hover:-translate-y-2">
                {t.bag}
              </div>
              <h3 className="text-2xl font-medium">
                <span className="mr-2 text-muted">{i + 1}</span>
                {t.n}
              </h3>
              <p className="max-w-[34ch] text-[15px] leading-relaxed text-muted">{t.sub}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
