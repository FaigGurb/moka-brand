"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { stillSrc, type Still } from "@/lib/cinema";
import { FrameStore, drawCover, pickCoverWidth, type Clip } from "@/lib/film";
import { perfTier } from "@/lib/perf";
import { Dust } from "./Dust";
import { CoverFrame, ShotMedia, focusOf, type Shot } from "./Shot";

export type Caption = { kicker: string; title: string; text: string };

/** One stop of the film: a shot the camera rests on, its chapter caption, and the page content that follows it. */
export type FilmStop = {
  shot: Shot;
  caption?: Caption;
  /** sections that scroll over the film while it holds on this stop */
  after?: ReactNode;
  /** background colour of `after`, so the film fades into it and back out (CSS colour) */
  tone?: string;
};

type Props = {
  /** the opening section; it scrolls away like a curtain and the film is already there underneath */
  lead: ReactNode;
  id: string;
  eyebrow: string;
  heading: ReactNode;
  stops: FilmStop[];
  /** stop i is the film's frame at i / (stops - 1) (docs/tools/film/chain.sh) */
  film: Clip;
};

/** scroll (in screen heights) that carries the camera from one stop to the next */
const RUNWAY = 1.1;
const smooth = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * The coffee journey as one film that runs under the page. A sticky full-screen backdrop sits behind
 * the opening, the chapter sections and the content between them: the opening scrolls off and the
 * film is already there; each chapter section first scrolls a runway, over which the film carries the
 * camera to its stop, then rests there with its caption; content sections (roast, brewing, packaging)
 * scroll over the held frame and fade back into the film. The scroll position alone sets the frame,
 * so scrolling up plays it backwards. At rest the sharp still shows (with its loop and effects on
 * capable devices); phones keep only stills and film. Reduced motion: stills with captions in flow.
 */
export function FilmJourney({ lead, id, eyebrow, heading, stops, film }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pos = useRef(0); // smoothed film position, in stops
  const covered = useRef(false); // a content section fills the screen: the film is hidden
  const [lite, setLite] = useState(true);
  const n = stops.length;

  useEffect(() => setLite(perfTier() === "low"), []);

  useEffect(() => {
    const el = root.current;
    const c = canvas.current;
    if (!el || !c || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const g = c.getContext("2d", { alpha: false });
    if (!g) return;
    const low = perfTier() === "low";
    const width = pickCoverWidth(film, low ? 0.42 : 0.55);
    const store = new FrameStore(film, width);
    const shots = Array.from(el.querySelectorAll<HTMLElement>("[data-film-shot]"));
    const stopEls = Array.from(el.querySelectorAll<HTMLElement>("[data-film-stop]"));
    const caps = Array.from(el.querySelectorAll<HTMLElement>("[data-film-cap]"));
    const afters = Array.from(el.querySelectorAll<HTMLElement>("[data-film-after]"));
    const rail = el.querySelector<HTMLElement>("[data-film-rail]");
    const ticks = Array.from(el.querySelectorAll<HTMLElement>("[data-film-tick]"));
    const focus = stops.map((s) => focusOf(s.shot));

    // keyframes (scrollY → film position): a stop's section top arrives at the previous stop,
    // its runway's end at its own; between sections the film holds
    let keys: [number, number][] = [];
    const measure = () => {
      const vh = window.innerHeight;
      keys = [];
      stopEls.forEach((s, k) => {
        const top = s.getBoundingClientRect().top + window.scrollY;
        if (k === 0) keys.push([top - vh, 0]);
        else keys.push([top, k - 1], [top + RUNWAY * vh, k]);
      });
    };
    const at = (y: number) => {
      if (!keys.length || y <= keys[0][0]) return 0;
      for (let i = 1; i < keys.length; i++) {
        const [y1, f1] = keys[i];
        if (y < y1) {
          const [y0, f0] = keys[i - 1];
          return f0 === f1 ? f0 : f0 + (f1 - f0) * smooth(clamp01((y - y0) / (y1 - y0)));
        }
      }
      return n - 1;
    };

    let raf = 0;
    let near = false;
    let lastWant = -1;
    let drawn = "";
    const op: number[] = [];
    const capOp: number[] = [];
    let railFill = -1;
    const size = () => {
      // no more canvas pixels than the frames carry
      const cover = Math.max(c.clientWidth / width, c.clientHeight / (width / film.aspect));
      const k = Math.min(window.devicePixelRatio || 1, 2, Math.max(0.5, 1.15 / cover));
      c.width = Math.max(1, Math.round(c.clientWidth * k));
      c.height = Math.max(1, Math.round(c.clientHeight * k));
      drawn = "";
      measure();
    };
    pos.current = at(window.scrollY);

    const frame = () => {
      raf = near ? requestAnimationFrame(frame) : 0;
      const vh = window.innerHeight;
      const target = at(window.scrollY);
      // a light follow: fling and wheel jumps glide instead of skipping frames
      const p = pos.current + (target - pos.current) * 0.22;
      pos.current = Math.abs(target - p) < 1e-3 ? target : p;
      const f = pos.current;

      const idx = Math.round((f / (n - 1)) * (film.frames - 1));
      if (idx !== lastWant) {
        store.want(idx, idx >= lastWant ? 1 : -1);
        lastWant = idx;
      }
      const got = store.nearest(idx);
      const i = Math.min(n - 2, Math.floor(f));
      const t = f - i;
      const fx = focus[i][0] + (focus[i + 1][0] - focus[i][0]) * t;
      const fy = focus[i][1] + (focus[i + 1][1] - focus[i][1]) * t;
      const key = got ? `${got.index}|${c.width}|${c.height}|${fx.toFixed(3)}|${fy.toFixed(3)}` : "";
      if (got && key !== drawn) {
        drawCover(g, got.frame, c.width, c.height, fx, fy);
        drawn = key;
      }

      // reads first (caption boxes, content sections), then writes
      const rects = caps.map((e) => e.getBoundingClientRect());
      covered.current = afters.some((a) => {
        const r = a.getBoundingClientRect();
        // past its fade-in gradient and not yet at its fade-out
        return r.top <= -0.28 * vh && r.bottom >= 1.28 * vh;
      });
      // the sharp still covers the film while the scroll rests on its stop
      shots.forEach((s, k) => {
        const d = Math.abs(f - k);
        const o = Math.round((1 - smooth(clamp01((d - 0.03) / 0.12))) * 100) / 100;
        if (o !== op[k]) {
          op[k] = o;
          s.style.opacity = String(o);
          s.style.visibility = o > 0 ? "visible" : "hidden";
        }
        // stills far from the camera are not even loaded until it gets close
        const show = d < 1.2 ? "block" : "none";
        if (s.style.display !== show) s.style.display = show;
      });
      // captions rise in from the bottom and leave towards the top
      caps.forEach((e, k) => {
        const r = rects[k];
        const o = Math.round(Math.min(clamp01((vh * 0.98 - r.top) / (vh * 0.3)), clamp01((r.bottom - vh * 0.1) / (vh * 0.25))) * 100) / 100;
        if (o !== capOp[k]) {
          capOp[k] = o;
          e.style.opacity = String(o);
          e.style.transform = `translate3d(0,${Math.round((1 - o) * 24)}px,0)`;
        }
      });
      const fill = Math.round((f / (n - 1)) * 1000) / 1000;
      if (rail && fill !== railFill) {
        railFill = fill;
        rail.style.transform = `scaleY(${fill})`;
        ticks.forEach((tk) => tk.classList.toggle("text-glow", Number(tk.dataset.filmTick) <= f + 0.05));
      }
    };

    store.onReady = () => {
      drawn = "";
      if (!raf && near) raf = requestAnimationFrame(frame);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => {
      near = e.isIntersecting;
      if (near && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(el);
    // the frames load once the visitor starts to scroll (or after a moment), not with the hero
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      window.removeEventListener("scroll", start);
      void store.load();
    };
    window.addEventListener("scroll", start, { passive: true });
    const idle = window.setTimeout(start, 2500);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(idle);
      window.removeEventListener("scroll", start);
      ro.disconnect();
      io.disconnect();
      store.dispose();
    };
    // stops and film are static for the page's life
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [film]);

  const isActive = (k: number) => () => !covered.current && Math.abs(pos.current - k) < 0.14;
  const chapters = stops.map((s, k) => ({ k, c: s.caption })).filter((x): x is { k: number; c: Caption } => !!x.c);

  return (
    <div ref={root} className="relative">
      {/* the film: sticky behind everything in this wrapper (motion only) */}
      <div aria-hidden="true" className="sticky top-0 z-0 -mb-[100svh] h-[100svh] overflow-hidden bg-black motion-reduce:hidden">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
        {stops.map((s, k) => (
          <div
            key={k}
            data-film-shot
            className="absolute inset-0 overflow-hidden will-change-[opacity]"
            style={k > 0 ? { opacity: 0, visibility: "hidden", display: "none" } : undefined}
          >
            <CoverFrame still={s.shot.still} focus={s.shot.focus}>
              <ShotMedia shot={s.shot} eager={k === 0} lite={lite} isActive={isActive(k)} />
            </CoverFrame>
          </div>
        ))}
        {!lite && <Dust />}
        {/* grade: vignette, a floor for the captions, a soft top for the nav */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_45%,transparent_35%,rgba(0,0,0,0.6)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(to_top,rgba(0,0,0,0.85),rgba(0,0,0,0.35)_55%,transparent)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.7),transparent)]" />
        {/* progress rail with chapter ticks (wide screens) */}
        <div className="absolute top-1/2 right-6 hidden -translate-y-1/2 items-stretch gap-4 md:flex lg:right-10">
          <ol className="relative w-24 text-right text-[10px] font-bold tracking-[0.2em] text-paper/40 uppercase">
            {chapters.map(({ k, c }) => (
              <li
                key={k}
                data-film-tick={k}
                className="absolute right-0 -translate-y-1/2 transition-colors duration-500"
                style={{ top: `${(k / (n - 1)) * 100}%` }}
              >
                {c.title}
              </li>
            ))}
          </ol>
          <span className="relative block h-[38svh] w-px bg-paper/15">
            <span data-film-rail className="absolute inset-0 origin-top scale-y-0 bg-glow shadow-[0_0_10px_rgba(255,226,166,0.7)]" />
          </span>
        </div>
      </div>

      <div className="relative z-10">{lead}</div>

      {stops.map((s, k) => (
        <Fragment key={k}>
          <section
            id={k === 0 ? id : undefined}
            aria-labelledby={k === 0 ? `${id}-title` : undefined}
            data-film-stop={k}
            className="relative z-10 text-paper"
          >
            {/* the runway: the film moves while this scrolls by */}
            {k > 0 && <div aria-hidden="true" className="motion-reduce:hidden" style={{ height: `${RUNWAY * 100}svh` }} />}
            <div className={`relative mx-auto flex w-full max-w-[1320px] flex-col px-5 md:px-12 ${s.caption ? "motion-safe:h-[100svh]" : "motion-safe:h-[45svh]"} motion-reduce:py-14`}>
              {k === 0 && (
                <div className="pt-24 md:pt-28">
                  <p className="eyebrow text-seher">{eyebrow}</p>
                  <div className="mt-2 max-w-[16ch] font-[family-name:var(--font-display)] text-[clamp(28px,4.2vw,56px)] leading-[1.02] font-medium tracking-[-0.015em]">
                    {heading}
                  </div>
                </div>
              )}
              {/* reduced motion: the still in flow */}
              <StillFallback still={s.shot.still} focus={s.shot.focus} />
              {s.caption && (
                <div data-film-cap className="mt-auto pb-16 will-change-[opacity,transform] md:pb-20 motion-reduce:mt-6 motion-reduce:pb-0">
                  <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.3em] text-glow">
                    {s.caption.kicker} <span className="text-paper/35">/ {String(chapters.length).padStart(2, "0")}</span>
                  </p>
                  <h3 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(48px,9vw,128px)] leading-[0.9] font-medium tracking-[-0.03em]">
                    {s.caption.title}
                  </h3>
                  <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-paper/75 sm:text-[17px]">{s.caption.text}</p>
                </div>
              )}
            </div>
          </section>
          {s.after && (
            <div data-film-after className="relative z-10">
              {/* the film dissolves into the section and the section back into the film */}
              <div aria-hidden="true" className="h-[28svh] motion-reduce:hidden" style={{ background: `linear-gradient(to bottom, transparent, ${s.tone ?? "#000"})` }} />
              {s.after}
              {k < n - 1 && (
                <div aria-hidden="true" className="h-[28svh] motion-reduce:hidden" style={{ background: `linear-gradient(to top, transparent, ${s.tone ?? "#000"})` }} />
              )}
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}

function StillFallback({ still, focus }: { still: Still; focus?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={stillSrc(still, still.widths[1] ?? still.widths[0])}
      alt=""
      loading="lazy"
      className="mt-10 hidden aspect-video w-full rounded-sm object-cover motion-reduce:block"
      style={{ objectPosition: focus ?? "50% 50%" }}
    />
  );
}
