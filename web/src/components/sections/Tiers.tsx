"use client";

import { useRef } from "react";
import { Logo } from "../Logo";
import { gsap, useGSAP } from "@/lib/gsap";

function Dots({ n, ink }: { n: number; ink: string }) {
  return (
    <span className="flex gap-1.5" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <i key={i} className="block h-3 w-3 border-2" style={{ borderColor: ink, background: i < n ? ink : "transparent" }} />
      ))}
    </span>
  );
}

const TIERS = [
  {
    n: "Əsas",
    sub: "Ağ paket və qovurma xətti. Rəfin gündəlik çeşidi.",
    bag: (
      <div className="relative flex h-full flex-col overflow-hidden bg-white text-espresso">
        <div className="h-[5%] bg-[#ECE8E1]" />
        <div className="flex flex-col gap-2 p-[9%]">
          <Logo className="w-[58%]" />
          <span className="text-[9px] font-bold tracking-[0.3em]">ƏSAS ÇEŞİD</span>
          <span className="mt-5 flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-flavor-berry" aria-hidden="true" />
            <span className="font-[family-name:var(--font-display)] text-[26px] leading-[1.05]">Karamel, qırmızı alma</span>
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex h-[42%] flex-col justify-between bg-roast-2 px-[9%] py-4 text-paper">
          <span className="text-[11px] font-bold tracking-[0.18em]">ORTA QOVURMA</span>
          <Dots n={3} ink="#F5F1EA" />
        </div>
      </div>
    ),
  },
  {
    n: "Tək mənşə",
    sub: "Kraft paket. Fermerin adı, dad notları başlıqda, QR kodla mənşə və AR.",
    bag: (
      <div className="relative flex h-full flex-col overflow-hidden bg-kraft text-espresso">
        <div className="h-[5%] bg-[#B9976F]" />
        <div className="flex flex-col gap-2 p-[9%]">
          <Logo className="w-[58%]" />
          <span className="text-[9px] font-bold tracking-[0.3em]">TƏK MƏNŞƏ</span>
          <span className="mt-4 flex gap-1.5" aria-hidden="true">
            <span className="h-3.5 w-3.5 rounded-full bg-flavor-floral" />
            <span className="h-3.5 w-3.5 rounded-full bg-flavor-citrus" />
          </span>
          <span className="font-[family-name:var(--font-display)] text-[34px] leading-[1]">Jasmin.<br />Ərik. Bal.</span>
          <span className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] leading-snug">
            <span><b>Fermer</b><br />[ad]</span>
            <span><b>Region</b><br />[region]</span>
            <span><b>Hündürlük</b><br />[m]</span>
            <span><b>Emal</b><br />[üsul]</span>
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex h-[26%] items-end justify-between border-t-4 border-paper bg-roast-1 px-[9%] py-4">
          <span className="text-[11px] font-bold tracking-[0.18em]">AÇIQ QOVURMA</span>
          <span className="text-[11px] font-bold tracking-[0.12em]">QR → AR</span>
        </div>
      </div>
    ),
  },
  {
    n: "Limitli",
    sub: "Espresso paket, Nar xətt. Azərbaycan rəssamları ilə nömrəli tiraj, rəqəmsal çap.",
    bag: (
      <div className="relative flex h-full flex-col overflow-hidden bg-espresso text-paper">
        <div className="h-[5%] bg-espresso-2" />
        <div className="flex flex-col gap-2 p-[9%]">
          <Logo className="w-[58%]" />
          <span className="text-[9px] font-bold tracking-[0.3em] text-nar-light">LİMİTLİ · № [0001] / [500]</span>
        </div>
        <svg viewBox="0 0 300 200" className="mt-auto w-full" aria-hidden="true">
          <polygon points="20,30 80,72 140,30 166,196 0,196" fill="#8E2F22" />
          <circle cx="220" cy="90" r="56" fill="#F5F1EA" />
          <polygon points="110,110 200,110 176,152 200,200 112,200 134,152" fill="#C89B6D" />
          <rect x="0" y="128" width="300" height="5" fill="#1B1714" />
          <rect x="0" y="133" width="300" height="4" fill="#8E2F22" />
        </svg>
        <span className="absolute top-[22%] left-[9%] font-[family-name:var(--font-display)] text-[24px]">[Rəssam] × MOKA</span>
      </div>
    ),
  },
];

export function Tiers() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Horizontal gallery driven by vertical scroll on desktop; native swipe on touch screens.
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
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
            scrub: 0.6,
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
      <div className="t-pin overflow-hidden lg:flex lg:h-screen lg:items-center">
        <div className="t-track no-scrollbar flex snap-x snap-mandatory scroll-px-5 md:scroll-px-10 gap-8 overflow-x-auto px-5 py-24 md:px-10 lg:snap-none lg:overflow-visible lg:py-0 lg:pr-[10vw] lg:pl-[max(40px,calc((100vw-1320px)/2+40px))]">
          <div className="flex w-[82vw] max-w-[440px] flex-none snap-start flex-col justify-center gap-6 lg:w-[36vw]">
            <p className="eyebrow text-axsam-ink">Paket ailəsi</p>
            <h2 className="text-[clamp(36px,4.6vw,64px)] leading-[1.02] font-medium tracking-[-0.01em]">Bir ailə, üç pillə</h2>
            <p className="max-w-[40ch] text-[17px] leading-relaxed text-muted">
              Hər paketdə imza xətti, loqo yeri və etiket quruluşu eynidir. Dəyişən material və vurğudur.
            </p>
            <p className="hidden text-sm font-bold tracking-[0.06em] text-muted lg:block">Aşağı scroll edin →</p>
          </div>
          {TIERS.map((t, i) => (
            <article key={t.n} className="flex w-[74vw] max-w-[380px] flex-none snap-start flex-col gap-4 lg:w-[26vw]">
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
