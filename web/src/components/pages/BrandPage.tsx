"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Letter, Lockup, Logo } from "../Logo";
import { PACKS } from "../packs/Packs";
import { HANDLE_PATH, LETTERS, pts } from "@/lib/logo";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/i18n/context";
import { BRAND } from "@/i18n/brand";
import { cmyk, contrast, hexRgb } from "@/lib/color";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const KIT = `${BASE}/brand-kit`;
const IDS = ["base", "platform", "logo", "color", "type", "grid", "photo", "voice", "motion", "sound", "downloads"] as const;

// The official grey scale from MOKA's brand book (14 steps, white → black; HEX approximated).
const MONO = ["#FFFFFF", "#EDEDED", "#DCDCDC", "#CBCBCB", "#BABABA", "#A9A9A9", "#989898", "#878787", "#6E6E6E", "#575757", "#414141", "#2C2C2C", "#181818", "#000000"];

const BASE_COLORS = [
  { key: "espresso", hex: "#1B1714" },
  { key: "paper", hex: "#F5F1EA" },
  { key: "kraft", hex: "#C9A882" },
] as const;
const DAY_COLORS = [
  { key: "seher", hex: "#C89B6D" },
  { key: "gunorta", hex: "#D9B56A" },
  { key: "axsam", hex: "#A8643A" },
  { key: "sheher", hex: "#8E8A84" },
  { key: "nar", hex: "#8E2F22" },
  { key: "glow", hex: "#FFE2A6" },
] as const;
const ROAST = ["#8C9A5B", "#C08A55", "#8A5A3B", "#5E3B26", "#2B1D15"];

function Section({ id, title, note, dark, children }: { id: string; title: string; note?: string; dark?: boolean; children: ReactNode }) {
  return (
    <section id={`b-${id}`} aria-labelledby={`b-${id}-t`} className={`b-sec scroll-mt-32 border-t lg:scroll-mt-24 py-16 md:py-24 ${dark ? "border-paper/10" : "border-espresso/10"}`}>
      <div className="mb-10 flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <span className="h-[3px] w-10 self-center bg-axsam" aria-hidden="true" />
        <h2 id={`b-${id}-t`} className="text-[clamp(30px,4.4vw,56px)] leading-none font-medium tracking-[-0.015em]">
          {title}
        </h2>
        {note && <span className="border border-axsam px-2 py-0.5 text-[11px] font-bold tracking-[0.14em] text-axsam-ink uppercase">{note}</span>}
      </div>
      {children}
    </section>
  );
}

/** The wordmark with the gap filled in — used only to illustrate a misuse. */
function SolidMark({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 675 155" className={className} style={style} aria-hidden="true">
      {LETTERS.map((l) => (
        <polygon key={l.id} points={pts(l.poly)} fill="currentColor" />
      ))}
      <path d={HANDLE_PATH} fill="none" stroke="currentColor" strokeWidth={8} />
    </svg>
  );
}

function ColoredMark() {
  const cols = ["#C89B6D", "#8E2F22", "#D9B56A", "#5E8F6B"];
  return (
    <svg viewBox="0 0 675 155" className="w-full" aria-hidden="true">
      <defs>
        <clipPath id="dont-cut">
          <rect x="0" y="0" width="675" height="74.5" />
          <rect x="0" y="79.5" width="675" height="76" />
        </clipPath>
      </defs>
      <g clipPath="url(#dont-cut)">
        {LETTERS.map((l, i) => (
          <polygon key={l.id} points={pts(l.poly)} fill={cols[i]} />
        ))}
      </g>
    </svg>
  );
}

function Swatch({ hex, name, usage }: { hex: string; name: string; usage: string }) {
  const [r, g, b] = hexRgb(hex);
  const [c, m, y, k] = cmyk(hex);
  const ink = contrast(hex, "#1B1714") > contrast(hex, "#F5F1EA") ? "#1B1714" : "#F5F1EA";
  return (
    <li className="b-item flex flex-col overflow-hidden border border-espresso/10 bg-white">
      <div className="flex aspect-[4/3] items-end p-4" style={{ background: hex, color: ink }}>
        <span className="font-[family-name:var(--font-display)] text-2xl">{name}</span>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 p-4 text-[12px] tabular-nums">
        <dt className="font-bold">HEX</dt>
        <dd>{hex}</dd>
        <dt className="font-bold">RGB</dt>
        <dd>
          {r} {g} {b}
        </dd>
        <dt className="font-bold">CMYK</dt>
        <dd>
          {c} {m} {y} {k}
        </dd>
        <dd className="col-span-2 mt-2 text-muted">{usage}</dd>
      </dl>
    </li>
  );
}

function SoundPlayer({ label, stop }: { label: string; stop: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    let raf = 0;
    const tick = () => {
      setT(a.currentTime);
      if (!a.paused) raf = requestAnimationFrame(tick);
    };
    const on = () => {
      setPlaying(true);
      raf = requestAnimationFrame(tick);
    };
    const off = () => {
      setPlaying(false);
      cancelAnimationFrame(raf);
    };
    a.addEventListener("play", on);
    a.addEventListener("pause", off);
    a.addEventListener("ended", () => {
      off();
      setT(0);
    });
    return () => {
      a.removeEventListener("play", on);
      a.removeEventListener("pause", off);
      cancelAnimationFrame(raf);
    };
  }, []);
  // the cup fills during the pour (0–0.9 s) and the line lights at the "tink"
  const fill = Math.min(1, t / 0.9);
  const lit = playing && t > 0.88 && t < 1.8;
  return (
    <div className="flex flex-wrap items-center gap-8">
      <svg viewBox="0 0 100 120" className="h-32 w-auto" aria-hidden="true">
        <defs>
          <clipPath id="snd-cup">
            <path d="M10 10 H90 L78 112 H22 Z" />
          </clipPath>
        </defs>
        <rect x="0" y={112 - 70 * fill} width="100" height={70 * fill} fill="#5E3B26" clipPath="url(#snd-cup)" />
        <path d="M10 10 H90 L78 112 H22 Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <rect x="2" y="40" width="96" height="3" fill={lit ? "#FFE2A6" : "currentColor"} style={{ filter: lit ? "drop-shadow(0 0 6px #FFE2A6)" : undefined, transition: "fill .2s" }} />
      </svg>
      <button
        type="button"
        onClick={() => {
          const a = audio.current;
          if (!a) return;
          if (a.paused) {
            a.currentTime = 0;
            void a.play();
          } else a.pause();
        }}
        className="bg-paper px-6 py-4 text-[13px] font-bold tracking-[0.14em] text-espresso uppercase transition-colors hover:bg-glow"
      >
        {playing ? `■ ${stop}` : `▶ ${label}`}
      </button>
      <audio ref={audio} src={`${KIT}/moka-sound-logo.wav`} preload="none" />
    </div>
  );
}

export function BrandPage() {
  const { locale, t: site } = useI18n();
  const b = BRAND[locale];
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string>(IDS[0]);
  const video = useRef<HTMLVideoElement>(null);
  const hero = useRef<HTMLElement>(null);
  const toc = useRef<HTMLOListElement>(null);
  // phones: the section bar appears once the hero has scrolled away
  const [bar, setBar] = useState(false);

  useEffect(() => {
    const el = hero.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBar(!e.isIntersecting), { rootMargin: "-64px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // keep the active chip visible in the horizontal bar
  useEffect(() => {
    const ol = toc.current;
    if (!ol || ol.scrollWidth <= ol.clientWidth) return;
    const li = ol.querySelector<HTMLElement>(`a[href="#b-${active}"]`)?.parentElement;
    if (li) ol.scrollTo({ left: li.offsetLeft - 12, behavior: "smooth" });
  }, [active]);

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id.slice(2))), { rootMargin: "-35% 0px -60% 0px" });
    IDS.forEach((id) => {
      const el = document.getElementById(`b-${id}`);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".b-sec").forEach((sec) => {
          gsap.from(sec.querySelectorAll(".b-item"), {
            y: 24,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.04,
            scrollTrigger: { trigger: sec, start: "top 80%" },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const colors = b.color;
  const textOn = [...BASE_COLORS, ...DAY_COLORS.filter((c) => c.key !== "glow")];

  return (
    <div ref={root} className="brand-book">
      {/* hero */}
      <header ref={hero} className="relative isolate overflow-hidden bg-espresso pt-28 pb-16 text-paper md:pt-36 md:pb-24">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-6 px-5 md:px-10">
          <p className="eyebrow text-seher">{b.hero.eyebrow}</p>
          <h1 className="max-w-[14ch] text-[clamp(44px,8vw,112px)] leading-[0.95] font-medium tracking-[-0.02em]">{b.hero.title}</h1>
          <div className="h-[3px] w-full max-w-[640px] bg-glow shadow-[0_0_16px_rgba(255,226,166,0.7)]" aria-hidden="true" />
          <p className="max-w-[60ch] text-[17px] leading-relaxed text-muted-dark">{b.hero.text}</p>
          <p className="max-w-[60ch] text-[13px] text-muted-dark">{b.hero.note}</p>
          <div className="no-print flex flex-wrap gap-3">
            <a href={`${KIT}/moka-brand-book-${locale}.pdf`} download className="bg-paper px-5 py-3.5 text-[13px] font-bold tracking-[0.14em] text-espresso uppercase transition-colors hover:bg-glow">
              ↓ {b.hero.pdf}
            </a>
            <a href="#b-downloads" className="border border-paper/40 px-5 py-3.5 text-[13px] font-bold tracking-[0.14em] uppercase transition-colors hover:border-paper">
              {b.hero.kit}
            </a>
          </div>
        </div>
      </header>

      <div className="bg-paper text-espresso">
        <div className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)] gap-10 px-5 md:px-10 lg:grid-cols-[200px_minmax(0,1fr)]">
          {/* table of contents */}
          <nav
            aria-label={b.nav}
            className={`no-print fixed inset-x-0 top-16 z-30 min-w-0 border-b border-espresso/10 bg-paper/95 px-3 text-espresso transition-transform duration-300 lg:sticky lg:top-24 lg:z-20 lg:h-max lg:translate-y-0 lg:border-0 lg:bg-transparent lg:px-0 lg:pt-16 ${bar ? "translate-y-0" : "pointer-events-none -translate-y-[200%]"}`}
          >
            <ol ref={toc} className="no-scrollbar flex gap-1 overflow-x-auto py-3 lg:flex-col lg:gap-0 lg:py-0">
              {IDS.map((id, i) => (
                <li key={id} className="shrink-0">
                  <a
                    href={`#b-${id}`}
                    aria-current={active === id ? "true" : undefined}
                    className="flex items-center gap-3 px-2 py-2 text-[13px] font-bold whitespace-nowrap text-muted transition-colors hover:text-espresso aria-[current]:text-espresso lg:px-0"
                  >
                    <span className="w-5 text-[11px] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    {b.toc[i]}
                    <span className={`hidden h-[2px] bg-axsam transition-all duration-500 lg:block ${active === id ? "w-8" : "w-0"}`} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="min-w-0">
            {/* 0 foundation: MOKA's official brand book, unchanged */}
            <Section id="base" title={b.base.title} note={b.base.note}>
              <p className="max-w-[68ch] text-[17px] leading-relaxed">{b.base.text}</p>
              <ul className="mt-8 grid gap-4 md:grid-cols-2">
                {b.base.layers.map((l, i) => (
                  <li key={l.name} className={`b-item flex flex-col gap-2 p-6 ${i === 0 ? "bg-white" : "bg-espresso text-paper"}`}>
                    <span className={`eyebrow ${i === 0 ? "text-axsam-ink" : "text-seher"}`}>
                      {String(i + 1).padStart(2, "0")} · {l.by}
                    </span>
                    <b className="font-[family-name:var(--font-display)] text-3xl font-medium">{l.name}</b>
                    <span className={`text-[15px] leading-relaxed ${i === 0 ? "text-muted" : "text-muted-dark"}`}>{l.items}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-14 grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
                <div className="b-item flex items-center justify-center bg-white px-[10%] py-14">
                  <Lockup className="w-full max-w-[420px] text-[#111]" />
                </div>
                <div className="b-item">
                  <p className="eyebrow text-axsam-ink">{b.base.lockupT}</p>
                  <p className="mt-3 text-[16px] leading-relaxed text-muted">{b.base.lockup}</p>
                </div>
              </div>

              <p className="eyebrow mt-14 text-axsam-ink">{b.base.monoT}</p>
              <div className="b-item mt-5 grid grid-cols-7 gap-2 sm:grid-cols-14">
                {MONO.map((hex) => (
                  <span key={hex} className="flex flex-col gap-1.5">
                    <span className="block aspect-square rounded-full border border-espresso/15" style={{ background: hex }} aria-hidden="true" />
                    <span className="text-center text-[10px] tabular-nums text-muted">{hex}</span>
                  </span>
                ))}
              </div>
              <div className="b-item mt-3 h-6 bg-[linear-gradient(90deg,#fff,#000)]" aria-hidden="true" />
              <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed text-muted">{b.base.mono}</p>
              <p className="mt-1 text-[12px] text-muted">{b.base.monoNote}</p>

              <p className="eyebrow mt-14 text-axsam-ink">{b.base.fontsT}</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="b-item flex flex-col gap-3 bg-[#111] p-6 text-white">
                  <span className="font-[family-name:var(--font-display)] text-[clamp(40px,5vw,64px)] leading-none font-black uppercase">Abcde</span>
                  <b className="text-lg">{b.base.fonts[0].name}</b>
                  <span className="text-[14px] text-white/70">{b.base.fonts[0].use}</span>
                </div>
                <div className="b-item flex flex-col gap-3 bg-white p-6">
                  <span className="text-[clamp(30px,3.6vw,46px)] leading-none">Abcdefgğhiİjk</span>
                  <b className="text-lg">{b.base.fonts[1].name}</b>
                  <span className="text-[14px] text-muted">{b.base.fonts[1].use}</span>
                </div>
              </div>
              <p className="mt-4 max-w-[68ch] text-[14px] leading-relaxed text-muted">{b.base.fontsNote}</p>

              <p className="eyebrow mt-14 text-axsam-ink">{b.base.slogansT}</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {b.base.slogans.map((sl) => (
                  <p key={sl} className="b-item bg-[#111] px-6 py-8 font-[family-name:var(--font-display)] text-[clamp(28px,3.4vw,44px)] leading-[1.02] font-black text-white uppercase">
                    {sl}
                  </p>
                ))}
              </div>
              <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed text-muted">{b.base.slogansNote}</p>

              <p className="eyebrow mt-14 text-axsam-ink">{b.base.packT}</p>
              <ul className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {PACKS.map((Pack, i) => (
                  <li key={i} className="b-item bg-white p-3">
                    <Pack title={site.tiers.items[i].name} className="h-auto w-full" />
                    <span className="mt-1 block text-center text-[13px] font-bold">{site.tiers.items[i].name}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed text-muted">{b.base.pack}</p>
            </Section>

            {/* 1 platform */}
            <Section id="platform" title={b.platform.title} note={b.platform.note}>
              <div className="grid gap-10 md:grid-cols-2">
                <div className="b-item">
                  <p className="eyebrow text-axsam-ink">{b.platform.purposeT}</p>
                  <p className="mt-3 font-[family-name:var(--font-display)] text-[clamp(24px,2.6vw,34px)] leading-tight">{b.platform.purpose}</p>
                </div>
                <div className="b-item">
                  <p className="eyebrow text-axsam-ink">{b.platform.positionT}</p>
                  <p className="mt-3 text-[18px] leading-relaxed">{b.platform.position}</p>
                  <p className="eyebrow mt-8 text-axsam-ink">{b.platform.ideaT}</p>
                  <p className="mt-3 font-[family-name:var(--font-display)] text-3xl">{b.platform.idea}</p>
                </div>
              </div>
              <p className="eyebrow mt-14 text-axsam-ink">{b.platform.valuesT}</p>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {b.platform.values.map((v, i) => (
                  <li key={v.name} className="b-item flex flex-col gap-3 bg-white p-5">
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center bg-espresso p-2 text-paper" aria-hidden="true">
                        <Letter id={(["M", "O", "K", "A"] as const)[i]} className="h-full w-auto" />
                      </span>
                      <b className="font-[family-name:var(--font-display)] text-xl font-medium">{v.name}</b>
                    </span>
                    <span className="text-[15px] leading-relaxed text-muted">{v.text}</span>
                  </li>
                ))}
              </ul>
              <p className="eyebrow mt-14 text-axsam-ink">{b.platform.audienceT}</p>
              <p className="mt-2 text-[13px] text-muted">{b.platform.audienceNote}</p>
              <ul className="mt-5 grid gap-4 md:grid-cols-3">
                {b.platform.audience.map((a) => (
                  <li key={a.name} className="b-item border-t-[3px] border-espresso pt-4">
                    <b className="font-[family-name:var(--font-display)] text-xl font-medium">{a.name}</b>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted">{a.text}</p>
                  </li>
                ))}
              </ul>
            </Section>

            {/* 2 logo */}
            <Section id="logo" title={b.logo.title}>
              <p className="max-w-[62ch] text-[17px] leading-relaxed text-muted">{b.logo.text}</p>
              <p className="eyebrow mt-10 text-axsam-ink">{b.logo.constructionT}</p>
              <figure className="b-item relative mt-5 bg-white p-6 md:p-12">
                <div className="relative">
                  <Logo className="w-full text-espresso" />
                  {/* the gap, highlighted */}
                  <span className="absolute inset-x-[-2%] top-[48.06%] h-[3.23%] bg-glow/80" aria-hidden="true" />
                </div>
                <ol className="mt-6 grid grid-cols-4 gap-2 text-center text-[12px] font-bold tracking-[0.06em] sm:text-[14px]">
                  {b.logo.tools.map((tool, i) => (
                    <li key={tool}>
                      <span className="font-[family-name:var(--font-display)] text-2xl">{LETTERS[i].id}</span>
                      <span className="block text-muted">{tool}</span>
                    </li>
                  ))}
                </ol>
                <figcaption className="mt-4 flex items-center gap-3 text-[13px] text-muted">
                  <span className="h-[3px] w-8 bg-glow" aria-hidden="true" />
                  {b.logo.line}
                </figcaption>
              </figure>

              <p className="eyebrow mt-14 text-axsam-ink">{b.logo.versionsT}</p>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { bg: "#F5F1EA", fg: "#1B1714", el: <Logo className="w-[78%]" /> },
                  { bg: "#1B1714", fg: "#F5F1EA", el: <Logo className="w-[78%]" /> },
                  { bg: "var(--day, #C89B6D)", fg: "#1B1714", el: <Logo className="w-[78%]" /> },
                  { bg: "#1B1714", fg: "#F5F1EA", el: <Letter id="K" className="h-[46%] w-auto" /> },
                ].map((v, i) => (
                  <li key={i} className="b-item">
                    <div className="flex aspect-[4/3] items-center justify-center border border-espresso/10 transition-colors duration-700" style={{ background: v.bg, color: v.fg }}>
                      {v.el}
                    </div>
                    <p className="mt-2 text-[13px] text-muted">{b.logo.versions[i]}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-14 grid gap-10 md:grid-cols-2">
                <div className="b-item">
                  <p className="eyebrow text-axsam-ink">{b.logo.clearT}</p>
                  <div className="mt-5 bg-white p-6">
                    <div className="relative mx-auto w-[80%] p-[6.4%] outline-2 outline-offset-0 outline-axsam outline-dashed">
                      <Logo className="w-full" />
                      <span className="absolute top-0 left-1/2 h-[6.4%] w-px -translate-x-1/2 bg-axsam" aria-hidden="true" />
                      <span className="absolute top-[1%] left-[calc(50%+6px)] text-[11px] font-bold text-axsam-ink">½ H</span>
                    </div>
                  </div>
                  <p className="mt-4 text-[15px] leading-relaxed text-muted">{b.logo.clear}</p>
                </div>
                <div className="b-item">
                  <p className="eyebrow text-axsam-ink">{b.logo.minT}</p>
                  <p className="mt-5 text-[15px] leading-relaxed text-muted">{b.logo.min}</p>
                  <dl className="mt-4 grid gap-2">
                    {b.logo.minRows.map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 border-b border-espresso/10 pb-2 text-[15px]">
                        <dt className="font-bold">{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-6 flex items-end gap-8">
                    <Logo className="w-[140px]" />
                    <Letter id="K" className="h-8 w-auto" />
                  </div>
                </div>
              </div>

              <p className="eyebrow mt-14 text-axsam-ink">{b.logo.dontT}</p>
              <ul className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
                {b.logo.donts.map((d, i) => (
                  <li key={d} className="b-item">
                    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-white p-6">
                      {i === 0 && (
                        <div className="w-[70%]" style={{ transform: "scaleX(1.35) scaleY(0.7)" }}>
                          <Logo className="w-full" />
                        </div>
                      )}
                      {i === 1 && <Logo className="w-[70%] -rotate-12" />}
                      {i === 2 && <ColoredMark />}
                      {i === 3 && <SolidMark className="w-[70%]" />}
                      {i === 4 && <Logo className="w-[70%] text-paper [filter:drop-shadow(4px_4px_0_#1B1714)_drop-shadow(-1px_-1px_0_#1B1714)]" />}
                      {i === 5 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[repeating-linear-gradient(45deg,#C89B6D_0_14px,#8E8A84_14px_28px)]">
                          <Logo className="w-[70%] text-[#A8643A]" />
                        </div>
                      )}
                      <span className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-nar text-[15px] font-bold text-paper" aria-hidden="true">
                        ✕
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] font-bold">{d}</p>
                  </li>
                ))}
              </ul>
            </Section>

            {/* 3 colour */}
            <Section id="color" title={colors.title}>
              <p className="max-w-[62ch] text-[17px] leading-relaxed text-muted">{colors.text}</p>
              <p className="eyebrow mt-10 text-axsam-ink">{colors.baseT}</p>
              <ul className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
                {BASE_COLORS.map((c) => (
                  <Swatch key={c.key} hex={c.hex} name={colors.names[c.key]} usage={colors.usage[c.key]} />
                ))}
              </ul>
              <p className="eyebrow mt-10 text-axsam-ink">{colors.dayT}</p>
              <ul className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                {DAY_COLORS.map((c) => (
                  <Swatch key={c.key} hex={c.hex} name={colors.names[c.key]} usage={colors.usage[c.key]} />
                ))}
              </ul>
              <p className="eyebrow mt-10 text-axsam-ink">{colors.roastT}</p>
              <div className="b-item mt-5 flex h-16" role="img" aria-label={colors.roastT}>
                {ROAST.map((c) => (
                  <span
                    key={c}
                    className="flex flex-1 items-end p-2 text-[10px] font-bold"
                    style={{ background: c, color: contrast(c, "#1B1714") > contrast(c, "#F5F1EA") ? "#1B1714" : "#F5F1EA" }}
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-10 grid gap-10 md:grid-cols-2">
                <div className="b-item">
                  <p className="eyebrow text-axsam-ink">{colors.ratioT}</p>
                  <div className="mt-5 flex h-10 overflow-hidden" aria-hidden="true">
                    <span className="w-[60%] bg-espresso" />
                    <span className="w-[30%] bg-kraft" />
                    <span className="w-[10%] bg-nar" />
                  </div>
                  <p className="mt-4 text-[15px] leading-relaxed text-muted">{colors.ratio}</p>
                </div>
                <div className="b-item">
                  <p className="eyebrow text-axsam-ink">{colors.contrastT}</p>
                  <p className="mt-3 text-[13px] text-muted">{colors.contrastText}</p>
                  <table className="mt-4 w-full text-left text-[13px] tabular-nums">
                    <tbody>
                      {textOn.map((bg) =>
                        (["#1B1714", "#F5F1EA"] as const)
                          .filter((fg) => fg !== bg.hex)
                          .map((fg) => {
                            const r = contrast(fg, bg.hex);
                            const verdict = r >= 4.5 ? colors.pass : r >= 3 ? colors.large : colors.fail;
                            return (
                              <tr key={bg.key + fg} className="border-b border-espresso/10">
                                <td className="py-1.5 pr-2">
                                  {/* drawn as an image: some pairs fail on purpose, to show what not to do */}
                                  <svg viewBox="0 0 36 22" className="h-[22px] w-9" role="img" aria-label={`${fg} / ${bg.hex}`}>
                                    <rect width="36" height="22" fill={bg.hex} />
                                    <text x="18" y="15.5" textAnchor="middle" fontSize="12" fontWeight="700" fill={fg} fontFamily="Mulish, sans-serif">
                                      Aa
                                    </text>
                                  </svg>
                                </td>
                                <td className="pr-2">
                                  {fg === "#1B1714" ? colors.names.espresso : colors.names.paper} {colors.on} {colors.names[bg.key]}
                                </td>
                                <td className="pr-2 font-bold">{r.toFixed(1)}:1</td>
                                <td className="whitespace-nowrap">
                                  <span
                                    className={`mr-1.5 inline-block h-2 w-2 rounded-full ${r >= 4.5 ? "bg-[#2f6b3a]" : r >= 3 ? "bg-axsam" : "bg-nar"}`}
                                    aria-hidden="true"
                                  />
                                  {verdict}
                                </td>
                              </tr>
                            );
                          }),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="mt-6 text-[13px] text-muted">{colors.cmykNote}</p>
            </Section>

            {/* 4 typography */}
            <Section id="type" title={b.type.title}>
              <p className="max-w-[62ch] text-[17px] leading-relaxed text-muted">{b.type.text}</p>
              <div className="mt-10 grid gap-4 md:grid-cols-3">
                <div className="b-item bg-white p-6">
                  <p className="eyebrow text-axsam-ink">{b.type.displayT} · League Spartan</p>
                  <p className="mt-4 font-[family-name:var(--font-display)] text-6xl leading-none">Aa Əə</p>
                </div>
                <div className="b-item bg-white p-6">
                  <p className="eyebrow text-axsam-ink">{b.type.textT} · Mulish</p>
                  <p className="mt-4 text-6xl leading-none">Aa Əə</p>
                </div>
                <div className="b-item bg-white p-6">
                  <p className="eyebrow text-axsam-ink">{b.type.cyrT} · Montserrat</p>
                  <p className="mt-4 font-[family-name:var(--font-display)] text-6xl leading-none" lang="ru">
                    Аа Жж
                  </p>
                </div>
              </div>
              <p className="b-item mt-6 bg-white p-6 font-[family-name:var(--font-display)] text-[clamp(20px,2.6vw,30px)] leading-snug break-words">
                Aa Bb Cc Çç Dd Ee Əə Ff Gg Ğğ Hh Xx Iı İi Jj Kk Qq Ll Mm Nn Oo Öö Pp Rr Ss Şş Tt Uu Üü Vv Yy Zz 0123456789 ₼
              </p>
              <p className="eyebrow mt-10 text-axsam-ink">{b.type.scaleT}</p>
              <ol className="mt-5 flex flex-col">
                {[
                  ["text-[clamp(40px,6vw,96px)] font-[family-name:var(--font-display)] leading-none", "96 / 0.95"],
                  ["text-[clamp(32px,4.4vw,56px)] font-[family-name:var(--font-display)] leading-none", "56 / 1.0"],
                  ["text-[28px] font-[family-name:var(--font-display)]", "28 / 1.1"],
                  ["text-[17px]", "17 / 1.6"],
                  ["text-[13px]", "13 / 1.5"],
                  ["text-[12px] font-bold tracking-[0.24em] uppercase", "12 · 0.24em"],
                ].map(([cls, spec], i) => (
                  <li key={spec} className="b-item flex flex-col gap-1 border-b border-espresso/10 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                    <span className={`min-w-0 break-words sm:truncate ${cls}`}>{i < 3 ? b.type.sample : b.type.scale[i]}</span>
                    <span className="shrink-0 text-[12px] text-muted tabular-nums">
                      {b.type.scale[i]} · {spec}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 border-l-[3px] border-axsam pl-4 text-[15px] leading-relaxed">{b.type.rule}</p>
            </Section>

            {/* 5 grid */}
            <Section id="grid" title={b.grid.title}>
              <p className="max-w-[62ch] text-[17px] leading-relaxed text-muted">{b.grid.text}</p>
              <div className="b-item mt-8 grid h-28 grid-cols-12 gap-2 bg-white p-4 md:gap-4" aria-hidden="true">
                {Array.from({ length: 12 }, (_, i) => (
                  <span key={i} className="bg-axsam/15" />
                ))}
              </div>
              <ul className="mt-6 grid gap-2 md:grid-cols-2">
                {b.grid.items.map((it) => (
                  <li key={it} className="b-item flex items-center gap-3 border-b border-espresso/10 py-2 text-[15px]">
                    <span className="h-[3px] w-5 bg-espresso" aria-hidden="true" />
                    {it}
                  </li>
                ))}
              </ul>
            </Section>

            {/* 6 photography */}
            <Section id="photo" title={b.photo.title}>
              <p className="max-w-[62ch] text-[17px] leading-relaxed text-muted">{b.photo.text}</p>
              <div className="mt-10 grid gap-10 md:grid-cols-[1fr_1.1fr]">
                <figure className="b-item">
                  <svg viewBox="0 0 400 300" className="w-full bg-[#2a221d]" role="img" aria-label={b.photo.diagram}>
                    <defs>
                      <linearGradient id="ph-light" x1="0" x2="1">
                        <stop offset="0" stopColor="#FFE2A6" stopOpacity=".45" />
                        <stop offset="1" stopColor="#FFE2A6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <rect width="400" height="300" fill="url(#ph-light)" />
                    <rect x="0" y="200" width="400" height="100" fill="#8a5a3b" />
                    <path d="M165 120 h70 l-8 80 h-54 z" fill="#F5F1EA" />
                    <rect x="167" y="150" width="66" height="22" fill="#1B1714" />
                    <rect x="167" y="160" width="66" height="2.5" fill="#FFE2A6" />
                    <g stroke="rgba(255,255,255,.35)" strokeWidth="1" strokeDasharray="4 4">
                      <line x1="133" y1="0" x2="133" y2="300" />
                      <line x1="267" y1="0" x2="267" y2="300" />
                      <line x1="0" y1="100" x2="400" y2="100" />
                    </g>
                    <line x1="0" y1="200" x2="400" y2="200" stroke="#FFE2A6" strokeWidth="3" />
                    <text x="12" y="192" fill="#FFE2A6" fontSize="12" fontWeight="700" fontFamily="Mulish, sans-serif">
                      {b.photo.diagram}
                    </text>
                  </svg>
                  <figcaption className="mt-3 text-[13px] text-muted">{b.photo.diagram}</figcaption>
                </figure>
                <ul className="flex flex-col">
                  {b.photo.rules.map((r) => (
                    <li key={r.h} className="b-item grid grid-cols-[110px_1fr] gap-4 border-b border-espresso/10 py-3">
                      <b className="font-[family-name:var(--font-display)] text-lg font-medium">{r.h}</b>
                      <span className="text-[15px] leading-relaxed text-muted">{r.p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 grid gap-10 md:grid-cols-2">
                <div className="b-item">
                  <p className="eyebrow text-axsam-ink">{b.photo.phoneT}</p>
                  <ol className="mt-4 flex flex-col gap-2">
                    {b.photo.phone.map((s, i) => (
                      <li key={s} className="flex gap-4 text-[15px]">
                        <span className="font-[family-name:var(--font-display)] text-axsam-ink">{i + 1}</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="b-item">
                  <p className="eyebrow text-axsam-ink">{b.photo.dontT}</p>
                  <ul className="mt-4 flex flex-col gap-2">
                    {b.photo.donts.map((d) => (
                      <li key={d} className="flex items-center gap-3 text-[15px]">
                        <span className="text-nar" aria-hidden="true">
                          ✕
                        </span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>

            {/* 7 voice */}
            <Section id="voice" title={b.voice.title} note={b.voice.note}>
              <p className="max-w-[62ch] font-[family-name:var(--font-display)] text-[clamp(22px,2.6vw,32px)] leading-snug">{b.voice.text}</p>
              <ul className="mt-10 grid gap-4 md:grid-cols-2">
                {b.voice.traits.map((tr) => (
                  <li key={tr.name} className="b-item flex flex-col gap-4 bg-white p-6">
                    <div>
                      <b className="font-[family-name:var(--font-display)] text-2xl font-medium">{tr.name}</b>
                      <p className="mt-1 text-[14px] text-muted">{tr.desc}</p>
                    </div>
                    <p className="border-l-[3px] border-[#2f6b3a] pl-3 text-[15px]">
                      <span className="block text-[11px] font-bold tracking-[0.14em] text-[#2f6b3a] uppercase">{b.voice.yes}</span>
                      {tr.yes}
                    </p>
                    <p className="border-l-[3px] border-nar pl-3 text-[15px] text-muted line-through decoration-nar/50">
                      <span className="block text-[11px] font-bold tracking-[0.14em] text-nar uppercase no-underline">{b.voice.no}</span>
                      {tr.no}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="b-item mt-12 bg-espresso p-8 text-paper md:p-12">
                <p className="eyebrow text-seher">{b.voice.taglineT}</p>
                <p className="mt-4 font-[family-name:var(--font-display)] text-[clamp(40px,7vw,96px)] leading-none">{b.voice.tagline}</p>
                <div className="my-6 h-[3px] w-full bg-glow" aria-hidden="true" />
                <ul className="grid gap-3 sm:grid-cols-2">
                  {b.voice.taglines.map((x) => (
                    <li key={x.where} className="text-[15px]">
                      <span className="mr-2 text-[11px] font-bold tracking-[0.14em] text-seher uppercase">{x.where}</span>
                      {x.line}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 grid gap-10 md:grid-cols-2">
                <div className="b-item">
                  <p className="eyebrow text-axsam-ink">{b.voice.namingT}</p>
                  <ul className="mt-4 flex flex-col gap-3 text-[15px] leading-relaxed">
                    {b.voice.naming.map((x) => (
                      <li key={x} className="border-b border-espresso/10 pb-3">
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="b-item">
                  <p className="eyebrow text-axsam-ink">{b.voice.writingT}</p>
                  <ul className="mt-4 flex flex-col gap-3 text-[15px] leading-relaxed">
                    {b.voice.writing.map((x) => (
                      <li key={x} className="border-b border-espresso/10 pb-3">
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="eyebrow mt-12 text-axsam-ink">{b.voice.samplesT}</p>
              <ul className="mt-4 grid gap-4 md:grid-cols-3">
                {b.voice.samples.map((s) => (
                  <li key={s.where} className="b-item bg-white p-5">
                    <span className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">{s.where}</span>
                    <p className="mt-2 text-[15px] leading-relaxed">{s.text}</p>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        </div>
      </div>

      {/* motion + sound on espresso */}
      <div className="bg-espresso text-paper">
        <div className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)] gap-10 px-5 md:px-10 lg:grid-cols-[200px_minmax(0,1fr)]">
          <div aria-hidden="true" className="hidden lg:block" />
          <div className="min-w-0">
            <Section id="motion" title={b.motion.title} dark>
              <p className="max-w-[62ch] text-[17px] leading-relaxed text-muted-dark">{b.motion.text}</p>
              <ul className="mt-10 grid gap-4 md:grid-cols-3">
                {b.motion.principles.map((p, i) => (
                  <li key={p.name} className="b-item border border-paper/15 p-6">
                    <div className="relative h-24 overflow-hidden" aria-hidden="true">
                      <span className={`motion-demo motion-demo-${i} absolute bg-glow`} />
                    </div>
                    <b className="mt-4 block font-[family-name:var(--font-display)] text-2xl font-medium">{p.name}</b>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted-dark">{p.text}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-12 grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-start">
                <div className="b-item">
                  <p className="eyebrow text-seher">{b.motion.logoT}</p>
                  <video
                    ref={video}
                    className="mt-4 aspect-square w-full bg-espresso-2"
                    src={`${KIT}/moka-logo-animation-1x1.mp4`}
                    poster={`${KIT}/moka-logo-poster.jpg`}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={b.motion.logoT}
                  />
                  <p className="mt-3 text-[14px] text-muted-dark">{b.motion.logo}</p>
                </div>
                <div className="b-item">
                  <p className="eyebrow text-seher">{b.motion.tokensT}</p>
                  <dl className="mt-4 grid gap-2 text-[15px]">
                    {b.motion.tokens.map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 border-b border-paper/10 pb-2">
                        <dt className="shrink-0 text-muted-dark">{k}</dt>
                        <dd className="min-w-0 text-right font-mono text-[13px] break-words">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </Section>

            <Section id="sound" title={b.sound.title} dark>
              <p className="max-w-[62ch] text-[17px] leading-relaxed text-muted-dark">{b.sound.text}</p>
              <div className="b-item mt-8">
                <SoundPlayer label={b.sound.play} stop={b.sound.stop} />
              </div>
              <ul className="mt-8 flex flex-col gap-2">
                {b.sound.rules.map((r) => (
                  <li key={r} className="b-item flex items-center gap-3 text-[15px]">
                    <span className="h-[3px] w-5 bg-glow" aria-hidden="true" />
                    {r}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="downloads" title={b.downloads.title} dark>
              <p className="max-w-[62ch] text-[15px] leading-relaxed text-muted-dark">{b.downloads.text}</p>
              <ul className="mt-8 grid gap-2 md:grid-cols-2">
                {(
                  [
                    ["pdf", `moka-brand-book-${locale}.pdf`],
                    ["wordmarkDark", "moka-wordmark-espresso.svg"],
                    ["wordmarkLight", "moka-wordmark-paper.svg"],
                    ["symbol", "moka-symbol-k.svg"],
                    ["tokens", "moka-tokens.json"],
                    ["sound", "moka-sound-logo.wav"],
                    ["video1", "moka-logo-animation-1x1.mp4"],
                    ["video916", "moka-logo-animation-9x16.mp4"],
                    ["gif", "moka-logo-animation-1x1.gif"],
                    ["card", "print/moka-business-card-90x50.pdf"],
                    ["beanCard", "print/moka-bean-card-55x85.pdf"],
                    ["menuA3", "print/moka-menu-a3.pdf"],
                    ["storyBean", "social/moka-story-bean.png"],
                    ["storyPoll", "social/moka-story-poll.png"],
                    ["storyDay", "social/moka-story-day.png"],
                    ["reelsCover", "social/moka-reels-cover.png"],
                    ["safeAreas", "social/moka-social-safe-areas.png"],
                  ] as const
                ).map(([k, file]) => (
                  <li key={k} className="b-item">
                    <a
                      href={`${KIT}/${file}`}
                      download
                      className="flex items-center justify-between gap-4 border border-paper/15 px-4 py-3.5 text-[15px] transition-colors hover:border-glow hover:text-glow"
                    >
                      {b.downloads.items[k]}
                      <span aria-hidden="true">↓</span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-6 max-w-[62ch] text-[13px] leading-relaxed text-muted-dark">{b.downloads.printNote}</p>
              <a href={`${BASE}${locale === "az" ? "" : `/${locale}`}/`} className="no-print mt-12 inline-block text-[13px] font-bold tracking-[0.14em] text-glow uppercase">
                ← {b.back}
              </a>
              <p className="mt-6 text-[12px] text-muted-dark">{site.footer.disclaimer}</p>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
