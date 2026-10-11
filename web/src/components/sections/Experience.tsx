"use client";

import { useRef } from "react";
import { MagneticButton } from "../ui/MagneticButton";
import { gsap, useGSAP } from "@/lib/gsap";
import { LINKS } from "@/lib/site";

export function Experience() {
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
    <section id="tecrube" ref={root} className="bg-paper text-espresso">
      <div className="mx-auto max-w-[1320px] px-5 py-24 md:px-10 md:py-32">
        <div className="flex flex-col gap-5">
          <p className="eyebrow text-axsam-ink">Təcrübə</p>
          <h2 className="max-w-[18ch] text-[clamp(36px,5vw,68px)] leading-[1.02] font-medium tracking-[-0.015em]">
            Brendi telefonda da toxun
          </h2>
        </div>

        <div className="x-grid mt-14 grid gap-6 md:grid-cols-2">
          <a href={LINKS.ar} className="x-card group flex flex-col overflow-hidden bg-espresso text-paper">
            <div className="relative aspect-[2/1] overflow-hidden bg-espresso-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LINKS.arCard}
                alt="AR kartı: palıd fonda Chemex, MOKA loqosu və pattern"
                className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-brand)] group-hover:scale-[1.04]"
                loading="lazy"
              />
            </div>
            <div className="flex flex-1 flex-col gap-4 p-8">
              <p className="eyebrow text-gunorta">WebAR · tətbiq lazım deyil</p>
              <h3 className="text-[30px] leading-tight font-medium">Stəkanı skan et, qəhvə tökülsün</h3>
              <p className="max-w-[44ch] text-[15px] leading-relaxed text-muted-dark">
                Kameranı AR kartına tut: üzərində şüşə Chemex peyda olur və qəhvə imza xəttinə qədər dolur. Kartı başqa ekranda açıb sına.
              </p>
              <span className="mt-auto inline-flex items-center gap-3 text-[13px] font-bold tracking-[0.14em] uppercase">
                AR demonu aç <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </span>
            </div>
          </a>

          <a href={LINKS.game} className="x-card group flex flex-col overflow-hidden bg-seher text-espresso">
            <div className="relative flex aspect-[2/1] items-end justify-center overflow-hidden bg-[#BE8F60]">
              <svg viewBox="0 0 400 200" className="h-full w-auto" aria-hidden="true">
                <polygon points="168,10 232,10 212,52 188,52" fill="#F5F1EA" />
                <rect x="186" y="46" width="28" height="10" fill="#1B1714" />
                <rect x="197" y="56" width="6" height="70" fill="#5E3B26" className="origin-top transition-transform duration-700 group-hover:scale-y-110" />
                <path d="M140,80 L260,80 L246,196 L154,196 Z" fill="none" stroke="#1B1714" strokeWidth="5" />
                <path d="M146,126 L254,126 L247,193 L153,193 Z" fill="#5E3B26" />
                <rect x="118" y="122" width="164" height="4" fill="#F5F1EA" />
              </svg>
            </div>
            <div className="flex flex-1 flex-col gap-4 p-8">
              <p className="eyebrow text-espresso/70">Mini oyun</p>
              <h3 className="text-[30px] leading-tight font-medium">Xətti tut</h3>
              <p className="max-w-[44ch] text-[15px] leading-relaxed text-espresso/80">
                Barmağını saxla, qəhvə tökülsün; burax, dayansın. Fincanı düz xəttə qədər doldur. 5 raund, hər raundda qovurma tündləşir.
              </p>
              <span className="mt-auto inline-flex items-center gap-3 text-[13px] font-bold tracking-[0.14em] uppercase">
                Oyna <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="bg-espresso text-paper">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-10 px-5 py-24 md:px-10 md:py-32">
        <h2 className="max-w-[14ch] text-[clamp(40px,7vw,104px)] leading-[0.95] font-medium tracking-[-0.02em]">
          Hər fincan düz xəttə qədər.
        </h2>
        <div className="h-[3px] w-full bg-gradient-to-r from-glow via-gunorta to-transparent" aria-hidden="true" />
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <p className="max-w-[52ch] text-[17px] leading-relaxed text-muted-dark">
            Bu konsept MOKA-nın mövcud loqosunu dəyişmədən onu loqo, rəng, qablaşdırma, kafe və rəqəmsal təcrübədən ibarət vahid sistemə çevirir.
            Növbəti addım: real menyu, dən çeşidi və orijinal loqo faylı ilə çap fayllarına keçmək.
          </p>
          <div className="flex flex-wrap gap-3">
            <MagneticButton href={LINKS.ar}>AR demonu aç</MagneticButton>
            <MagneticButton href="#top" variant="ghost">Yuxarı qayıt</MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
