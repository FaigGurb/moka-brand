"use client";

import { useEffect, useRef, useState } from "react";
import { Letter, Logo } from "../Logo";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/i18n/context";
import { bakuHour, daySlot, type DaySlot } from "@/lib/day";
import { CONTACT, LOCATIONS } from "@/lib/site";

type LetterId = "M" | "O" | "K" | "A";
// Section accents come from the day palette; brand names stay Azerbaijani.
const SECTIONS = [
  { id: "espresso", accent: "#A8643A", letters: ["O", "O", "O", "O", "O", "O"] as LetterId[], sizes: true },
  { id: "brew", accent: "#C89B6D", letters: ["A", "K", "M"] as LetterId[], sizes: false },
  { id: "cold", accent: "#8E8A84", letters: ["O", "O", "O"] as LetterId[], sizes: false },
  { id: "beans", accent: "#D9B56A", letters: [] as LetterId[], sizes: false },
  { id: "food", accent: "#8E2F22", letters: [] as LetterId[], sizes: false },
] as const;

// Bags in the beans section: the coloured part reaches the roast line (light = high, dark = low).
const BAGS = [
  // order follows the bag family: core (medium), single origin (light), limited (dark)
  { level: 2, color: "#8A5A3B", line: 0.46, ink: "#F5F1EA" },
  { level: 1, color: "#C08A55", line: 0.62, ink: "#1B1714" },
  { level: 3, color: "#5E3B26", line: 0.32, ink: "#F5F1EA" },
];

function Item({ name, desc, letter, price, sizes, sizeLabel }: { name: string; desc: string; letter?: LetterId; price: string; sizes?: boolean; sizeLabel: string }) {
  return (
    <li className="m-item grid grid-cols-[44px_1fr] gap-4 border-b border-espresso/10 py-5">
      <span className="flex h-11 w-11 items-center justify-center bg-espresso p-2 text-paper" aria-hidden="true">
        {letter ? <Letter id={letter} className="h-full w-auto" /> : <span className="block h-2 w-2 rounded-full bg-glow" />}
      </span>
      <div className="min-w-0">
        <div className="flex items-baseline gap-3">
          <h3 className="font-[family-name:var(--font-display)] text-xl md:text-2xl">{name}</h3>
          <span className="mb-1 flex-1 border-b border-dotted border-espresso/30" aria-hidden="true" />
          <span className="font-bold tabular-nums">{price}</span>
        </div>
        <p className="mt-1 text-[15px] leading-relaxed text-muted">{desc}</p>
        {sizes && (
          <p className="mt-2 flex items-center gap-1.5 text-[12px] font-bold tracking-[0.1em] text-muted uppercase">
            <span className="sr-only">{sizeLabel}:</span>
            {["S", "M", "L"].map((s) => (
              <span key={s} className="border border-espresso/20 px-2 py-0.5">
                {s}
              </span>
            ))}
          </p>
        )}
      </div>
    </li>
  );
}

export function MenuPage() {
  const { t } = useI18n();
  const m = t.menu;
  const root = useRef<HTMLDivElement>(null);
  const [day, setDay] = useState<DaySlot | null>(null);
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const h = bakuHour();
    setDay(daySlot(h));
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id.replace("m-", ""))), {
      rootMargin: "-40% 0px -55% 0px",
    });
    SECTIONS.forEach((s) => {
      const el = document.getElementById(`m-${s.id}`);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // slide in without fading from zero, so the text paints in the first frame (LCP)
        gsap.from(".m-hero > *", { y: 40, duration: 1, ease: "power3.out", stagger: 0.08, delay: 0.1 });
        gsap.utils.toArray<HTMLElement>(".m-sec").forEach((sec) => {
          gsap.from(sec.querySelectorAll(".m-item, .m-bag"), {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.06,
            scrollTrigger: { trigger: sec, start: "top 80%" },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const items = m.items as Record<string, { name: string; desc: string }[]>;
  const levels = t.roast.levels;

  return (
    <div ref={root}>
      {/* hero */}
      <section className="bg-espresso pt-28 pb-16 text-paper md:pt-36 md:pb-24">
        <div className="m-hero mx-auto flex max-w-[1320px] flex-col gap-5 px-5 md:px-10">
          <p className="eyebrow text-seher">{m.eyebrow}</p>
          <h1 className="max-w-[14ch] text-[clamp(40px,7vw,96px)] leading-[0.98] font-medium tracking-[-0.02em]">{m.title}</h1>
          <p className="max-w-[56ch] text-[17px] leading-relaxed text-muted-dark">{m.text}</p>
          {day && (
            <p className="mt-2 flex flex-wrap items-center gap-3 text-[14px] text-muted-dark">
              <span className="inline-flex items-center gap-2 border border-paper/20 px-3 py-1.5 font-bold text-paper">
                <span className="block h-3 w-3 rounded-full" style={{ background: day.hex }} aria-hidden="true" />
                {m.today}: {day.name}
              </span>
              {m.todayText}
            </p>
          )}
        </div>
      </section>

      {/* category bar */}
      <nav
        aria-label={m.nav}
        className="sticky top-16 z-30 border-b border-espresso/10 bg-paper/95 text-espresso [@media(hover:hover)]:backdrop-blur-md"
      >
        <ul className="no-scrollbar mx-auto flex max-w-[1320px] gap-1 overflow-x-auto px-3 md:px-8">
          {SECTIONS.map((s, i) => (
            <li key={s.id} className="shrink-0">
              <a
                href={`#m-${s.id}`}
                aria-current={active === s.id ? "true" : undefined}
                className="relative flex items-center gap-2 px-3 py-4 text-[13px] font-bold tracking-[0.06em] whitespace-nowrap text-muted transition-colors hover:text-espresso aria-[current]:text-espresso"
              >
                <span className="block h-2.5 w-2.5 rounded-full" style={{ background: s.accent }} aria-hidden="true" />
                {m.tabs[i]}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-3 bottom-0 h-[3px] transition-transform duration-500 ${active === s.id ? "scale-x-100" : "scale-x-0"}`}
                  style={{ background: s.accent }}
                />
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="bg-paper text-espresso">
        <div className="mx-auto max-w-[1320px] px-5 pb-10 md:px-10">
          {SECTIONS.map((s, si) => (
            <section key={s.id} id={`m-${s.id}`} aria-labelledby={`m-${s.id}-t`} className="m-sec scroll-mt-32 pt-16 md:pt-20">
              <div className="flex items-center gap-4">
                <span className="h-[3px] w-12" style={{ background: s.accent }} aria-hidden="true" />
                <h2 id={`m-${s.id}-t`} className="text-[clamp(28px,4vw,48px)] leading-none font-medium">
                  {m.tabs[si]}
                </h2>
              </div>

              {s.id === "beans" ? (
                <>
                  <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-muted">{m.beansText}</p>
                  <ul className="mt-8 grid gap-5 sm:grid-cols-3">
                    {BAGS.map((b) => (
                      <li key={b.level} className="m-bag">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-[10px] bg-white shadow-[0_24px_60px_-30px_rgba(27,23,20,0.45)]">
                          <span className="absolute top-4 right-4 block h-3.5 w-3.5 rounded-full bg-paper-2 shadow-[inset_0_1px_3px_rgba(0,0,0,0.25)]" aria-hidden="true" />
                          <div className="absolute inset-x-0 top-0 p-5">
                            <Logo className="h-5 w-auto" />
                            <p className="mt-1 text-[9px] font-bold tracking-[0.3em] text-muted uppercase">Roastery & Eatery</p>
                            <p className="mt-6 text-[11px] font-bold tracking-[0.18em] text-axsam-ink uppercase">{t.roast.house.card}</p>
                            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl">{levels[b.level].origin}</p>
                            <p className="text-[13px] text-muted">{levels[b.level].notes}</p>
                          </div>
                          <div className="absolute inset-x-0 bottom-0 flex flex-col justify-between p-5" style={{ height: `${b.line * 100}%`, background: b.color, color: b.ink }}>
                            <span className="text-[11px] font-bold tracking-[0.18em] uppercase">{levels[b.level].label}</span>
                            <span className="flex items-end justify-between text-[13px] font-bold">
                              <span>{m.weight}</span>
                              <span>{m.price}</span>
                            </span>
                          </div>
                          {/* the signature line where paper meets roast colour */}
                          <span className="absolute inset-x-0 h-[4px] bg-espresso" style={{ bottom: `calc(${b.line * 100}% - 2px)` }} aria-hidden="true" />
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <ul className="mt-4 grid gap-x-12 md:grid-cols-2">
                  {(items[s.id] ?? []).map((it, i) => (
                    <Item key={it.name} name={it.name} desc={it.desc} letter={s.letters[i]} price={m.price} sizes={s.sizes} sizeLabel={m.sizes} />
                  ))}
                </ul>
              )}
            </section>
          ))}
          <p className="mt-12 border-t border-espresso/10 pt-6 text-[13px] text-muted">{m.note}</p>
        </div>
      </div>

      {/* the café */}
      <section aria-labelledby="m-place-t" className="bg-espresso text-paper">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-20 md:grid-cols-2 md:items-center md:px-10 md:py-28">
          <div className="flex flex-col gap-6">
            <p className="eyebrow text-seher">{m.place.eyebrow}</p>
            <h2 id="m-place-t" className="text-[clamp(32px,5vw,64px)] leading-[1.02] font-medium">{m.place.title}</h2>
            <p className="max-w-[46ch] text-[17px] leading-relaxed text-muted-dark">{m.place.text}</p>
            <ul className="grid gap-4 sm:grid-cols-2">
              {LOCATIONS.map((loc, i) => {
                const pl = t.contact.places[i];
                return (
                  <li key={loc.id} className="flex flex-col gap-2 border border-paper/12 p-5">
                    <b className="font-[family-name:var(--font-display)] text-xl font-medium">MOKA · {pl.name}</b>
                    <span className="text-[15px] text-paper/90">{pl.address}</span>
                    <span className="text-[13px] text-muted-dark">{pl.near}</span>
                    <span className="mt-1 text-[13px]">
                      <span className="text-muted-dark">{m.place.hoursT}: </span>
                      <span className="tabular-nums">{pl.hours}</span>
                    </span>
                    <span className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-[13px] font-bold">
                      <a href={loc.map} target="_blank" rel="noopener noreferrer" className="border-b border-paper/25 pb-0.5 hover:border-glow hover:text-glow">
                        {m.place.map} ↗<span className="sr-only"> — MOKA {pl.name}</span>
                      </a>
                      <a href={`tel:${loc.tel}`} className="border-b border-paper/25 pb-0.5 tabular-nums hover:border-glow hover:text-glow">
                        {loc.phone}
                      </a>
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-paper px-5 py-3.5 text-[13px] font-bold tracking-[0.14em] text-espresso uppercase transition-colors hover:bg-glow"
              >
                {m.place.instagram}
              </a>
            </div>
          </div>
          {/* abstract map: streets as thin lines, the café marked with the Chemex letter */}
          <figure aria-hidden="true" className="relative aspect-[4/3] overflow-hidden border border-paper/10 bg-espresso-2">
            <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden="true">
              <g stroke="rgba(245,241,234,0.12)" strokeWidth="1.5" fill="none">
                <path d="M-10 60 L410 40" /><path d="M-10 140 L410 120" /><path d="M-10 220 L410 210" />
                <path d="M60 -10 L80 310" /><path d="M170 -10 L160 310" /><path d="M280 -10 L300 310" />
                <path d="M-10 300 C120 250 260 270 410 230" stroke="rgba(142,138,132,0.45)" strokeWidth="18" />
              </g>
              {/* two cafés, roughly where they sit relative to each other: Parkview is ~800 m north */}
              {[
                [215, 178],
                [248, 72],
              ].map(([x, y]) => (
                <g key={x}>
                  <circle cx={x} cy={y} r="40" fill="rgba(255,226,166,0.12)" />
                  <g transform={`translate(${x - 19} ${y - 24}) scale(0.24)`}>
                    <path d="M384,20 C364,20 352,36 352,54 C352,74 368,86 386,86 L393,94" transform="translate(-340 0)" fill="none" stroke="#FFE2A6" strokeWidth="9" />
                    <polygon points="381,7 508,7 467,77 508,149 385,149 407,77" transform="translate(-340 0)" fill="#FFE2A6" />
                  </g>
                </g>
              ))}
            </svg>
            <figcaption className="absolute bottom-3 left-3 text-[11px] font-bold tracking-[0.14em] text-muted-dark uppercase">MOKA × 2 · {t.contact.places.map((p) => p.name).join(" · ")}</figcaption>
          </figure>
        </div>
      </section>
    </div>
  );
}
