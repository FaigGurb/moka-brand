"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/i18n/context";
import { FLOW } from "@/i18n/flow";
import { CUT_BOTTOM, CUT_TOP, HANDLE_PATH, LETTERS, halves, pts } from "@/lib/logo";
import { HOME, LOCATIONS, links } from "@/lib/site";
import { LOCALES } from "@/i18n/dict";
import { Letter, Logo } from "@/components/Logo";

/* ------------------------------------------------------------------------------------------------
 * Light "flow" trial page. One pinned scroll story: a camera moves along the MOKA wordmark; a stream
 * of coffee pours into each letter (M moka pot, O cup, K Chemex, A V60) and fills it to the signature
 * line; the camera pulls back to the whole wordmark and one copper line runs through it. A single
 * scroll progress drives every phase (render(p)). Reduced motion: no pin, the finished state.
 * ---------------------------------------------------------------------------------------------- */

const COFFEE = "#3a2418";
const INK = "#1b1714";
const PAPER = "#f5f1ea";
const LINE = "#a8643a";

/** Where each letter takes the pour (x) and how far its body reaches (bottom y). */
const POUR = [
  { x: 87, bottom: 150 },
  { x: 266, bottom: 153 },
  { x: 444, bottom: 149 },
  { x: 597, bottom: 149 },
];
const FOCUS = (cx: number) => [cx - 160, -150, 320, 330];
const VIEW_INTRO = [-73, -250, 320, 330];
const VIEW_ALL = [-20, -40, 715, 230];

/** Phase boundaries over the pinned scroll (0–1). */
const P = { intro: [0, 0.12], letters: [0.12, 0.88], finale: [0.88, 1] } as const;
const SEG = (P.letters[1] - P.letters[0]) / 4;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpBox = (a: number[], b: number[], t: number) => a.map((v, i) => lerp(v, b[i], t));

const BEANS = [
  [-30, 0, 20],
  [-6, -40, -30],
  [18, -16, 50],
  [36, -64, -10],
  [-44, -78, 70],
  [6, -104, 15],
];

export function FlowPage() {
  const { locale } = useI18n();
  const c = FLOW[locale];
  const L = links(locale);
  const root = useRef<HTMLDivElement>(null);
  const deck = useRef<HTMLUListElement>(null);

  // the deck fans out when it comes into view (CSS transition in globals.css, desktop + motion only)
  useEffect(() => {
    const list = deck.current;
    if (!list) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          list.classList.add("is-in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -25% 0px" },
    );
    io.observe(list);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const el = root.current!;
      const svg = el.querySelector<SVGSVGElement>(".fl-stage")!;
      const fills = gsap.utils.toArray<SVGRectElement>(".fl-fill", el);
      const streams = gsap.utils.toArray<SVGRectElement>(".fl-stream", el);
      const beans = gsap.utils.toArray<SVGGElement>(".fl-bean", el);
      const line = el.querySelector<SVGRectElement>(".fl-line")!;
      const texts = gsap.utils.toArray<HTMLElement>(".fl-text", el);
      let active = -1;

      /** Paint the whole scene for a scroll progress p (0–1). */
      const render = (p: number, animateText = true) => {
        // camera
        let box: number[];
        const ti = seg(p, P.intro[0], P.intro[1]);
        if (p < P.letters[0]) box = VIEW_INTRO;
        else if (p < P.finale[0]) {
          const i = Math.min(3, Math.floor((p - P.letters[0]) / SEG));
          const t = (p - P.letters[0] - i * SEG) / SEG;
          const from = i === 0 ? VIEW_INTRO : FOCUS(POUR[i - 1].x);
          box = lerpBox(from, FOCUS(POUR[i].x), ease(seg(t, 0, 0.22)));
        } else box = lerpBox(FOCUS(POUR[3].x), VIEW_ALL, ease(seg(p, P.finale[0], P.finale[0] + 0.07)));
        svg.setAttribute("viewBox", box.map((v) => v.toFixed(2)).join(" "));

        // beans fall into the M's notch during the intro
        beans.forEach((b, i) => {
          const [dx, dy] = BEANS[i];
          const t = clamp(ti * 1.35 - i * 0.06);
          b.setAttribute("transform", `translate(${POUR[0].x + dx * (1 - t)} ${lerp(-260 + dy, 40, ease(t))})`);
          b.style.opacity = String(t > 0.92 ? (1 - t) / 0.08 : 1);
        });

        // each letter: the stream reaches the vessel, the coffee rises to the line, the stream runs out
        POUR.forEach((pp, i) => {
          const a = P.letters[0] + i * SEG;
          const t = (p - a) / SEG;
          const down = ease(seg(t, 0.12, 0.34));
          const rise = ease(seg(t, 0.3, 0.84));
          const tail = ease(seg(t, 0.8, 0.96));
          const surface = lerp(pp.bottom + 2, CUT_TOP, rise);
          const top = lerp(-420, surface, tail);
          const bottom = Math.min(lerp(-420, pp.bottom, down), surface);
          streams[i].setAttribute("y", String(top));
          streams[i].setAttribute("height", String(Math.max(0, bottom - top)));
          fills[i].setAttribute("y", String(surface));
        });

        // finale: one line through all four letters
        line.style.transform = `scaleX(${ease(seg(p, P.finale[0] + 0.04, 0.99))})`;

        // copy: one chapter at a time (intro, M, O, K, A, finale)
        const idx = p < P.letters[0] ? 0 : p < P.finale[0] ? 1 + Math.min(3, Math.floor((p - P.letters[0]) / SEG)) : 5;
        if (idx !== active) {
          texts.forEach((tx, k) => {
            const on = k === idx;
            if (animateText) gsap.to(tx, { autoAlpha: on ? 1 : 0, y: on ? 0 : k < idx ? -18 : 18, duration: 0.45, ease: "power2.out", overwrite: true });
            else gsap.set(tx, { autoAlpha: on ? 1 : 0, y: 0 });
          });
          active = idx;
        }
      };

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        render(0, false);
        const proxy = { p: 0 };
        const tween = gsap.to(proxy, {
          p: 1,
          ease: "none",
          onUpdate: () => render(proxy.p),
          scrollTrigger: { trigger: ".fl-pin", start: "top top", end: "+=520%", pin: true, scrub: 1, anticipatePin: 1 },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        active = -1;
        render(1, false);
        texts.forEach((tx) => gsap.set(tx, { clearProps: "all" }));
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const fan = [
    { rot: -11, tx: -330, ty: 46 },
    { rot: -4, tx: -110, ty: 8 },
    { rot: 4, tx: 110, ty: 8 },
    { rot: 11, tx: 330, ty: 46 },
  ];
  const cardLinks = [L.menu, L.partners, L.brand, L.ar];

  return (
    <div ref={root} className="bg-paper text-espresso">
      {/* floating pill nav */}
      <header className="fixed inset-x-3 top-3 z-50 md:inset-x-6 md:top-5">
        <nav className="mx-auto flex max-w-[1180px] items-center gap-3 rounded-full border border-espresso/10 bg-white/92 py-2 pr-2 pl-5 shadow-[0_8px_30px_-12px_rgba(27,23,20,0.25)] md:gap-6 md:bg-white/80 md:backdrop-blur">
          <a href={HOME[locale]} aria-label="MOKA" className="shrink-0">
            <Logo className="h-5 w-auto text-espresso" />
          </a>
          <span className="hidden rounded-full bg-paper-2 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-muted uppercase sm:inline">{c.trial}</span>
          <ul className="ml-auto hidden items-center gap-6 text-[14px] font-semibold md:flex">
            <li><a className="hover:text-axsam-ink" href={L.menu}>{c.nav.menu}</a></li>
            <li><a className="hover:text-axsam-ink" href={L.partners}>{c.nav.partners}</a></li>
            <li><a className="hover:text-axsam-ink" href={L.brand}>{c.nav.brand}</a></li>
          </ul>
          <ul className="ml-auto flex items-center gap-1 text-[12px] font-bold md:ml-0" aria-label="Language">
            {LOCALES.map((l) => (
              <li key={l}>
                <a
                  href={`${HOME[l]}flow/`}
                  aria-current={l === locale ? "page" : undefined}
                  className={`block rounded-full px-2.5 py-1.5 uppercase ${l === locale ? "bg-espresso text-paper" : "text-muted hover:text-espresso"}`}
                >
                  {l}
                </a>
              </li>
            ))}
          </ul>
          <a href={HOME[locale]} className="hidden rounded-full bg-espresso px-4 py-2.5 text-[13px] font-bold text-paper transition-colors hover:bg-axsam-ink lg:block">
            {c.nav.home}
          </a>
        </nav>
      </header>

      {/* hero */}
      <section className="relative flex min-h-[92svh] flex-col justify-end px-5 pt-32 pb-14 md:px-10 md:pb-20">
        <div className="mx-auto w-full max-w-[1320px]">
          <p className="eyebrow text-axsam-ink">{c.hero.eyebrow}</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(64px,13vw,210px)] leading-[0.86] font-semibold tracking-[-0.035em]">{c.hero.title}</h1>
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="max-w-[46ch] text-[17px] leading-relaxed text-muted">{c.hero.text}</p>
            <span className="flex items-center gap-3 text-[12px] font-bold tracking-[0.2em] text-muted uppercase">
              <span aria-hidden="true" className="fl-hint block h-10 w-[2px] origin-top bg-axsam" />
              {c.hero.scroll}
            </span>
          </div>
        </div>
      </section>

      {/* pinned story */}
      <section className="fl-pin relative overflow-hidden motion-safe:h-[100svh]">
        <div className="mx-auto grid h-full max-w-[1320px] grid-rows-[auto_minmax(0,1fr)] gap-4 px-5 pt-24 pb-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:grid-rows-1 md:items-center md:gap-10 md:px-10 md:py-0">
          {/* copy: stacked and cross-faded with motion; a plain list without */}
          <div className="relative min-h-[150px] motion-reduce:flex motion-reduce:flex-col motion-reduce:gap-8 md:min-h-[260px]">
            {[
              { n: c.intro.n, title: c.intro.title, text: c.intro.text },
              ...c.chapters.map((ch, i) => ({ n: `0${i + 1} · ${LETTERS[i].id}`, title: ch.title, text: ch.text })),
              { n: "MOKA", title: c.finale.title, text: c.finale.text },
            ].map((ch, i) => (
              <div key={i} className="fl-text motion-safe:invisible motion-safe:absolute motion-safe:inset-x-0 motion-safe:top-0 motion-safe:opacity-0">
                <p className="text-[12px] font-bold tracking-[0.22em] text-axsam-ink uppercase">{ch.n}</p>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(38px,6vw,92px)] leading-[0.9] font-semibold tracking-[-0.03em]">{ch.title}</h2>
                <p className="mt-4 max-w-[40ch] text-[16px] leading-relaxed text-muted md:text-[17px]">{ch.text}</p>
              </div>
            ))}
          </div>

          {/* the stage */}
          <div className="relative h-full min-h-0 motion-reduce:h-[46vw] motion-reduce:max-h-[420px]">
            <svg className="fl-stage absolute inset-0 h-full w-full" viewBox={VIEW_ALL.join(" ")} preserveAspectRatio="xMidYMid meet" role="img" aria-label={c.finale.title}>
              <defs>
                {LETTERS.map((l) => (
                  <clipPath key={l.id} id={`fl-clip-${l.id}`}>
                    <polygon points={pts(l.poly)} />
                  </clipPath>
                ))}
              </defs>
              {/* coffee inside each letter, rising to the line */}
              {LETTERS.map((l) => (
                <rect key={l.id} className="fl-fill" clipPath={`url(#fl-clip-${l.id})`} x="0" y={CUT_TOP} width="675" height="240" fill={COFFEE} />
              ))}
              {/* the stream into each letter */}
              {POUR.map((pp, i) => (
                <rect key={i} className="fl-stream" x={pp.x - 1.7} y="0" width="3.4" height="0" rx="1.7" fill={COFFEE} />
              ))}
              {/* the letters, split by the signature line like the wordmark */}
              <g fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round">
                {LETTERS.map((l) => {
                  const h = halves(l.poly);
                  return (
                    <g key={l.id}>
                      <polygon points={pts(h.top)} />
                      <polygon points={pts(h.bottom)} />
                    </g>
                  );
                })}
                <path d={HANDLE_PATH} strokeWidth="8" strokeLinecap="round" />
              </g>
              {/* keep the cut open */}
              <rect x="-40" y={CUT_TOP} width="760" height={CUT_BOTTOM - CUT_TOP} fill={PAPER} />
              <rect className="fl-line" x="0" y={CUT_TOP} width="675" height={CUT_BOTTOM - CUT_TOP} fill={LINE} style={{ transformOrigin: "0 0", transformBox: "fill-box", transform: "scaleX(1)" }} />
              {/* beans */}
              {BEANS.map(([, , r], i) => (
                <g key={i} className="fl-bean" transform={`translate(${POUR[0].x} 40)`} style={{ opacity: 0 }}>
                  <g transform={`rotate(${r})`}>
                    <ellipse rx="13" ry="9" fill={COFFEE} />
                    <path d="M-10 0 C-4 -3.5 4 3.5 10 0" stroke={PAPER} strokeWidth="1.8" fill="none" />
                  </g>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </section>

      {/* fanned card deck */}
      <section className="fl-deck overflow-hidden px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1320px]">
          <p className="eyebrow text-axsam-ink">{c.deck.eyebrow}</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(38px,6vw,84px)] leading-[0.92] font-semibold tracking-[-0.03em]">{c.deck.title}</h2>
          <ul ref={deck} className="fl-cards mt-12 grid grid-cols-2 gap-4 md:relative md:mt-16 md:block md:h-[440px]">
            {c.deck.cards.map((card, i) => (
              <li
                key={card.title}
                className="fl-card md:absolute md:top-0 md:left-1/2 md:w-[250px] md:[transform:translateX(calc(-50%_+_var(--tx)*1px))_translateY(calc(var(--ty)*1px))_rotate(calc(var(--rot)*1deg))]"
                style={{ "--tx": fan[i].tx, "--ty": fan[i].ty, "--rot": fan[i].rot, "--i": i, zIndex: i === 1 || i === 2 ? 2 : 1 } as React.CSSProperties}
              >
                <a
                  href={cardLinks[i]}
                  className="group block overflow-hidden rounded-[26px] bg-white shadow-[0_24px_50px_-28px_rgba(27,23,20,0.45)] transition-transform duration-300 ease-out hover:-translate-y-2 motion-reduce:transition-none"
                >
                  <span className="grid aspect-[4/3] place-items-center bg-espresso p-8 text-paper">
                    <Letter id={LETTERS[i].id} className="h-[70%] w-auto transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
                  </span>
                  <span className="flex flex-col gap-1 px-5 py-4">
                    <b className="text-[17px] font-semibold">{card.title}</b>
                    <span className="text-[13px] text-muted">{card.text}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* visit */}
      <section className="px-5 pb-24 md:px-10 md:pb-32">
        <div className="mx-auto max-w-[1320px] rounded-[32px] bg-white p-6 md:p-12">
          <p className="eyebrow text-axsam-ink">{c.visit.eyebrow}</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(30px,4vw,56px)] leading-[1] font-semibold tracking-[-0.02em]">{c.visit.title}</h2>
          <VisitCards map={c.visit.map} />
        </div>
      </section>
    </div>
  );
}

function VisitCards({ map }: { map: string }) {
  const { t } = useI18n();
  return (
    <ul className="mt-8 grid gap-4 md:grid-cols-2">
      {LOCATIONS.map((loc, i) => {
        const pl = t.contact.places[i];
        return (
          <li key={loc.id} className="flex flex-col gap-2 rounded-[22px] bg-paper p-6">
            <b className="font-[family-name:var(--font-display)] text-2xl font-semibold">MOKA · {pl.name}</b>
            <span className="text-[15px]">{pl.address}</span>
            <span className="text-[13px] text-muted">{pl.near}</span>
            <span className="text-[13px] font-bold tabular-nums">{pl.hours}</span>
            <span className="mt-3 flex flex-wrap gap-2">
              <a href={loc.map} target="_blank" rel="noopener noreferrer" className="rounded-full bg-espresso px-4 py-2.5 text-[13px] font-bold text-paper hover:bg-axsam-ink">
                {map} ↗
              </a>
              <a href={`tel:${loc.tel}`} className="rounded-full border border-espresso/20 px-4 py-2.5 text-[13px] font-bold tabular-nums hover:border-espresso">
                {loc.phone}
              </a>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
