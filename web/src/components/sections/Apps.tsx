"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "../Logo";
import { Cup as PackCup } from "../packs/Packs";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion, useTouch, useWebGL } from "@/lib/hooks";
import type { CupSize } from "@/lib/cupArt";
import { useI18n } from "@/i18n/context";
import { links } from "@/lib/site";

const CupScene = dynamic(() => import("../apps/CupScene"), { ssr: false });

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const img = (id: string, small = false) => `${BASE}/brand/${id}${small ? "-sm" : ""}.webp`;

const SIZES: CupSize[] = ["S", "M", "L"];

// Board images rendered from the design canvas; cats index into insta.filters (0 = all).
const POSTS = [
  { id: "main", cats: [2], w: 1600, h: 900 },
  { id: "icons", cats: [2, 3], w: 1280, h: 640 },
  { id: "menu", cats: [3], w: 840, h: 1188 },
  { id: "instagram", cats: [2], w: 1600, h: 900 },
  { id: "merch", cats: [1, 3], w: 1600, h: 900 },
  { id: "store", cats: [3], w: 1600, h: 900 },
];

function CupConfigurator() {
  const { t } = useI18n();
  const c = t.apps.cup;
  const reduced = useReducedMotion();
  const webgl = useWebGL();
  const touch = useTouch();
  const [size, setSize] = useState<CupSize>("M");
  const [active, setActive] = useState(false);
  // the 3D scene loads only when wanted: with a mouse once the cup comes near, on touch screens on a tap
  // (three.js loading and compiling mid-scroll cost phones ~1.7 s of blocked main thread)
  const [load3d, setLoad3d] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => setActive(e.isIntersecting)), { rootMargin: "100px" });
    io.observe(el);
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || touch) return;
        setLoad3d(true);
        near.disconnect();
      },
      { rootMargin: "600px" },
    );
    near.observe(el);
    return () => {
      io.disconnect();
      near.disconnect();
    };
  }, [touch]);

  return (
    <div className="flex flex-col bg-paper-2 p-5 text-espresso md:p-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <h3 className="text-2xl font-medium md:text-3xl">{c.title}</h3>
        <span className="text-[11px] font-semibold text-muted sm:text-[12px]">↔ {c.drag}</span>
      </div>
      <div ref={box} data-cursor="↔" className="relative mx-auto my-4 aspect-square w-full max-w-[460px]">
        {webgl === true && load3d ? (
          <CupScene size={size} reducedMotion={reduced} touch={touch} active={active} />
        ) : (
          <>
            <PackCup title={c.fallback} className="h-full w-full" />
            {webgl === true && (
              <button
                type="button"
                onClick={() => setLoad3d(true)}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 border border-espresso/30 bg-paper px-4 py-2.5 font-[family-name:var(--font-display)] text-[15px] font-medium text-espresso transition-colors hover:border-espresso"
              >
                {c.open3d}
              </button>
            )}
          </>
        )}
      </div>

      <fieldset className="mt-2">
        <legend className="eyebrow text-muted">{c.size}</legend>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {SIZES.map((s, i) => (
            <label key={s} className="cursor-pointer">
              <input type="radio" name="cup-size" className="peer sr-only" checked={size === s} onChange={() => setSize(s)} />
              <span className="block border border-espresso/25 px-2 py-2.5 text-center text-[13px] font-bold transition-colors peer-checked:border-espresso peer-checked:bg-espresso peer-checked:text-paper peer-focus-visible:outline-3 peer-focus-visible:outline-gunorta">
                {c.sizes[i]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-muted">{c.hint}</p>
    </div>
  );
}

function Profile() {
  const { t, locale } = useI18n();
  const ig = t.apps.insta;
  const [filter, setFilter] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const visible = POSTS.map((p, i) => ({ ...p, i })).filter((p) => filter === 0 || p.cats.includes(filter));

  const show = useCallback((i: number | null) => {
    setOpen(i);
    const d = dialog.current;
    if (!d) return;
    if (i === null) d.close();
    else if (!d.open) d.showModal();
  }, []);
  const step = useCallback(
    (dir: number) => {
      if (open === null) return;
      const idx = visible.findIndex((p) => p.i === open);
      const next = visible[(idx + dir + visible.length) % visible.length];
      setOpen(next.i);
    },
    [open, visible],
  );
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open === null) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  const cur = open !== null ? POSTS[open] : null;
  return (
    <div className="bg-white p-5 text-espresso shadow-[0_30px_80px_-40px_rgba(0,0,0,0.45)] md:p-8">
      {/* profile header */}
      <div className="flex items-center gap-4 md:gap-6">
        <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-espresso p-1 ring-2 ring-black/30 ring-offset-2 md:h-[88px] md:w-[88px]">
          <Logo className="w-[80%] text-paper" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold">mokacoffeebaku</p>
          <ul className="mt-1 flex gap-4 text-[14px]">
            {[POSTS.length, 6, 3].map((n, i) => (
              <li key={i}>
                <b>{n}</b> <span className="text-muted">{ig.stats[i]}</span>
              </li>
            ))}
          </ul>
        </div>
        <a
          href="https://www.instagram.com/mokacoffeebaku/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden shrink-0 bg-espresso px-4 py-2.5 text-[12px] font-semibold text-paper transition-colors hover:bg-espresso-3 sm:inline-block"
        >
          {ig.follow}
        </a>
      </div>
      <div className="mt-4 text-[14px] leading-relaxed">
        <p className="font-bold">{ig.name}</p>
        <p>{ig.bio}</p>
        <p className="text-muted">{ig.city}</p>
      </div>

      {/* highlights double as filters */}
      <div role="tablist" aria-label={ig.name} className="no-scrollbar -mx-1 mt-5 flex gap-4 overflow-x-auto px-1 pb-1">
        {ig.filters.map((f, i) => (
          <button
            key={f}
            role="tab"
            type="button"
            aria-selected={filter === i}
            onClick={() => setFilter(i)}
            className="group flex shrink-0 flex-col items-center gap-1.5"
          >
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition-colors ${
                filter === i ? "border-black" : "border-espresso/15 group-hover:border-espresso/40"
              }`}
            >
              <span
                className="block h-[46px] w-[46px] rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url(${img(["main", "packaging", "instagram", "store"][i], true)})` }}
              />
            </span>
            <span className={`text-[12px] ${filter === i ? "font-bold" : "text-muted"}`}>{f}</span>
          </button>
        ))}
      </div>

      {/* grid */}
      <ul className="mt-4 grid grid-cols-3 gap-[3px]">
        {visible.map((p) => (
          <li key={p.id} className="ig-post">
            <button
              type="button"
              onClick={() => show(p.i)}
              data-cursor="+"
              className="group relative block aspect-[3/4] w-full overflow-hidden bg-paper-2"
              aria-label={`${ig.open}: ${ig.posts[p.i]}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img(p.id, true)}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-brand)] group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-espresso/85 to-transparent p-2 pt-8 text-left text-[11px] leading-tight font-bold text-paper opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 md:text-[12px]">
                {ig.posts[p.i]}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[12px] leading-relaxed text-muted">
        {ig.note} {ig.samples}
      </p>

      <dialog
        ref={dialog}
        lang={locale}
        data-lenis-prevent
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialog.current && show(null)}
        className="m-auto max-h-[94svh] w-[min(1200px,94vw)] bg-espresso p-0 text-paper backdrop:bg-espresso/85 backdrop:backdrop-blur-sm"
        aria-label={cur ? ig.posts[POSTS.indexOf(cur)] : ig.name}
      >
        {cur && (
          <figure className="flex flex-col">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img(cur.id)}
              alt={ig.posts[POSTS.indexOf(cur)]}
              width={cur.w}
              height={cur.h}
              className="max-h-[80svh] w-full bg-paper object-contain"
            />
            <figcaption className="flex items-center gap-2 p-3 md:p-4">
              <span className="min-w-0 flex-1 truncate font-[family-name:var(--font-display)] text-lg md:text-xl">
                {ig.posts[POSTS.indexOf(cur)]}
              </span>
              <button type="button" onClick={() => step(-1)} className="h-11 min-w-11 border border-paper/30 px-3 text-sm font-bold" aria-label={ig.prev}>
                ←
              </button>
              <button type="button" onClick={() => step(1)} className="h-11 min-w-11 border border-paper/30 px-3 text-sm font-bold" aria-label={ig.next}>
                →
              </button>
              <button type="button" onClick={() => show(null)} className="h-11 bg-paper px-4 text-[12px] font-semibold text-espresso">
                {ig.close}
              </button>
            </figcaption>
          </figure>
        )}
      </dialog>
    </div>
  );
}

export function Apps() {
  const { locale, t } = useI18n();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".a-rise", {
          y: 50,
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: root.current, start: "top 70%" },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="tetbiq" ref={root} className="day-glow overflow-hidden bg-espresso text-paper">
      <div className="mx-auto max-w-[1320px] px-5 py-24 md:px-10 md:py-32">
        <div className="a-rise grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-end md:gap-16">
          <div>
            <p className="eyebrow text-seher">{t.apps.eyebrow}</p>
            <h2 className="mt-4 text-[clamp(40px,6vw,96px)] leading-[0.98] font-medium tracking-[-0.025em]">{t.apps.title}</h2>
          </div>
          <div className="flex flex-col items-start gap-5">
            <p className="max-w-[52ch] text-[18px] leading-relaxed text-paper/80">{t.apps.text}</p>
            <a
              href={links(locale).brand}
              className="inline-flex items-center gap-3 border-b-2 border-paper pb-1 text-[13px] font-semibold transition-colors hover:border-glow hover:text-glow"
            >
              {t.apps.insta.book} <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-10">
          <div className="a-rise lg:sticky lg:top-24">
            <CupConfigurator />
          </div>
          <div className="a-rise">
            <Profile />
          </div>
        </div>
      </div>
    </section>
  );
}
