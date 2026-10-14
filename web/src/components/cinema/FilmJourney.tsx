"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { stillSrc, type Still } from "@/lib/cinema";
import { FrameStore, drawCover, pickCoverWidth, type Clip } from "@/lib/film";
import { perfTier } from "@/lib/perf";
import { getLenis } from "@/lib/lenis";
import { Dust } from "./Dust";
import { CoverFrame, focusOf, type Shot } from "./Shot";

export type Caption = { kicker: string; title: string; text: string };

/** One stop of the film: the shot it passes through, its chapter caption, and the page content that follows it. */
export type FilmStop = {
  shot: Shot;
  caption?: Caption;
  /** sections that scroll over the film while it holds on this stop */
  after?: ReactNode;
  /** background colour of `after`, so the film fades into it and back out (CSS colour) */
  tone?: string;
};

/** A brand mark laid over the last stop in image fractions [x, y, w, h] (the generator never draws it). */
export type Mark = { src: string; region: [number, number, number, number] };

type Props = {
  /** the opening section; it scrolls away like a curtain and the film is already there underneath */
  lead: ReactNode;
  id: string;
  eyebrow: string;
  heading: ReactNode;
  stops: FilmStop[];
  /** stop i is the film's frame at i / (stops - 1) (docs/tools/film/chain.sh) */
  film: Clip;
  mark?: Mark;
};

/** scroll (in screen heights) from one stop to the next, so the film keeps one speed */
const SPAN = 2;
/** height of a stop's own part: a chapter with a caption, or a passing shot */
const REST_CAPTION = 1;
const REST_PASS = 0.45;
/** runway when the film resumes after a content section (it was holding underneath) */
const RESUME = 1.25;
const smooth = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * The coffee journey as one continuous film that runs under the first part of the page. A sticky
 * full-screen backdrop sits behind the opening, the chapter sections and the content between them:
 * the opening lifts off and the film is already there; from then on the film moves at one steady
 * speed with the scroll, through every stop, captions passing over it like titles; content sections
 * (roast, brewing, packaging) scroll over a held frame and dissolve back into the film, which picks
 * up where it stopped. Neighbouring frames are blended, so even a short frame set moves smoothly,
 * forwards and backwards. Inside the film one wheel step, swipe or arrow key plays it to the next
 * stop (an eased scroll through Lenis); content sections scroll freely. Reduced motion: stills with
 * captions in flow.
 */
export function FilmJourney({ lead, id, eyebrow, heading, stops, film, mark }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [lite, setLite] = useState(true);
  const n = stops.length;

  // each stop's runway, chosen so every stop-to-stop stretch is about SPAN screens long
  const rest = stops.map((s) => (s.caption ? REST_CAPTION : REST_PASS));
  const runway = stops.map((_, k) => (k === 0 ? 0 : stops[k - 1].after ? RESUME : Math.max(0.8, SPAN - rest[k - 1])));

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
    const stopEls = Array.from(el.querySelectorAll<HTMLElement>("[data-film-stop]"));
    const restEls = Array.from(el.querySelectorAll<HTMLElement>("[data-film-rest]"));
    const afterEls = new Map(Array.from(el.querySelectorAll<HTMLElement>("[data-film-after]")).map((a) => [Number(a.dataset.filmAfter), a]));
    const caps = Array.from(el.querySelectorAll<HTMLElement>("[data-film-cap]"));
    const markEl = el.querySelector<HTMLElement>("[data-film-mark]");
    const rail = el.querySelector<HTMLElement>("[data-film-rail]");
    const ticks = Array.from(el.querySelectorAll<HTMLElement>("[data-film-tick]"));
    const focus = stops.map((s) => focusOf(s.shot));

    // keyframes (scrollY → film position), linear between them: the film sits on the first stop
    // while the opening lifts, reaches each stop as its caption part fills the screen, and holds
    // under a content section until that section's end is back on screen
    let keys: [number, number][] = [];
    // stretches of scroll the film plays through on its own: one gesture carries it to the next
    // stop (opening → first stop, stop → stop, end of a content section → next stop)
    let segs: [number, number][] = [];
    const measure = () => {
      const vh = window.innerHeight;
      const y = (e: Element) => e.getBoundingClientRect().top + window.scrollY;
      keys = [];
      segs = [];
      let from = y(el);
      restEls.forEach((r, k) => {
        if (k === 0) keys.push([y(stopEls[0]) - vh, 0]);
        const ry = y(r);
        keys.push([ry, k]);
        segs.push([from, ry]);
        from = ry;
        const a = afterEls.get(k);
        if (a && k < n - 1) {
          from = y(a) + a.offsetHeight - vh;
          keys.push([from, k]);
        }
      });
    };
    const at = (sy: number) => {
      if (!keys.length || sy <= keys[0][0]) return 0;
      for (let i = 1; i < keys.length; i++) {
        const [y1, f1] = keys[i];
        if (sy < y1) {
          const [y0, f0] = keys[i - 1];
          return f0 + (f1 - f0) * clamp01((sy - y0) / Math.max(1, y1 - y0));
        }
      }
      return n - 1;
    };

    let raf = 0;
    let near = false;
    let lastWant = -1;
    let drawn = "";
    let pos = 0;
    const capOp: number[] = [];
    let markOp = -1;
    let railFill = -1;
    const size = () => {
      // no more canvas pixels than the frames carry
      const cover = Math.max(c.clientWidth / width, c.clientHeight / (width / film.aspect));
      const k = Math.min(window.devicePixelRatio || 1, 2, Math.max(0.5, 1.15 / cover));
      c.width = Math.max(1, Math.round(c.clientWidth * k));
      c.height = Math.max(1, Math.round(c.clientHeight * k));
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = "high";
      drawn = "";
      measure();
    };

    const frame = () => {
      raf = near ? requestAnimationFrame(frame) : 0;
      const vh = window.innerHeight;
      const target = at(window.scrollY);
      // a light follow on top of the smooth scroll: wheel steps and flings glide
      pos += (target - pos) * 0.2;
      if (Math.abs(target - pos) < 2e-4) pos = target;
      const f = pos;
      // read by the QA scripts (docs/tools/qa)
      (window as Window & { __mokaFilm?: number }).__mokaFilm = f;

      // the frame under the scroll, blended with its neighbour by the fraction in between
      const x = (f / (n - 1)) * (film.frames - 1);
      const i0 = low ? Math.round(x) : Math.floor(x);
      // phones step through the (dense) frames; larger screens blend in quarter steps
      const a = low ? 0 : Math.round((x - i0) * 4) / 4;
      const want = Math.round(x);
      if (want !== lastWant) {
        store.want(want, want >= lastWant ? 1 : -1);
        lastWant = want;
      }
      const s = Math.min(n - 2, Math.floor(f));
      const t = f - s;
      const fx = focus[s][0] + (focus[s + 1][0] - focus[s][0]) * t;
      const fy = focus[s][1] + (focus[s + 1][1] - focus[s][1]) * t;
      const exact = store.get(i0);
      const base = exact ?? store.nearest(i0)?.frame;
      const next = a > 0 ? store.get(i0 + 1) : undefined;
      const key = `${i0}|${next ? a : 0}|${c.width}|${c.height}|${fx.toFixed(3)}|${fy.toFixed(3)}`;
      if (base && key !== drawn) {
        drawCover(g, base, c.width, c.height, fx, fy);
        if (next) {
          g.globalAlpha = a;
          drawCover(g, next, c.width, c.height, fx, fy);
          g.globalAlpha = 1;
        }
        // keep redrawing until the exact pair is decoded
        drawn = exact && (a === 0 || next) ? key : "";
      }

      // reads first (caption boxes), then writes
      const rects = caps.map((e) => e.getBoundingClientRect());
      caps.forEach((e, k) => {
        const r = rects[k];
        const o = Math.round(Math.min(clamp01((vh * 0.98 - r.top) / (vh * 0.3)), clamp01((r.bottom - vh * 0.1) / (vh * 0.25))) * 100) / 100;
        if (o !== capOp[k]) {
          capOp[k] = o;
          e.style.opacity = String(o);
          e.style.transform = `translate3d(0,${Math.round((1 - o) * 24)}px,0)`;
        }
      });
      if (markEl) {
        const o = Math.round(smooth(clamp01((f - (n - 1) + 0.06) / 0.06)) * 100) / 100;
        if (o !== markOp) {
          markOp = o;
          markEl.style.opacity = String(o);
        }
      }
      const fill = Math.round((f / (n - 1)) * 1000) / 1000;
      if (rail && fill !== railFill) {
        railFill = fill;
        rail.style.transform = `scaleY(${fill})`;
        ticks.forEach((tk) => tk.classList.toggle("text-glow", Number(tk.dataset.filmTick) <= f + 0.05));
      }
    };

    // one wheel step, swipe or key press inside the film plays it to the next stop
    const TOL = 4;
    const snapTarget = (y: number, dir: 1 | -1) => {
      for (const [a0, b0] of segs) {
        if (dir > 0 && y >= a0 - TOL && y < b0 - TOL) return b0;
        if (dir < 0 && y > a0 + TOL && y <= b0 + TOL) return a0;
      }
      return null;
    };
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let busy = false;
    let lastInput = 0;
    let doneAt = 0;
    const here = () => getLenis()?.scroll ?? window.scrollY;
    const go = (dir: 1 | -1) => {
      const y = here();
      const to = snapTarget(y, dir);
      if (to === null) return false;
      busy = true;
      const vh = window.innerHeight;
      const duration = Math.min(2.1, Math.max(1.1, 0.8 + (Math.abs(to - y) / vh) * 0.5));
      const done = () => {
        busy = false;
        doneAt = performance.now();
      };
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(to, { duration, easing: ease, lock: true, force: true, onComplete: done });
      else {
        window.scrollTo({ top: to, behavior: "smooth" });
        window.setTimeout(done, duration * 1000);
      }
      return true;
    };
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX) || Math.abs(e.deltaY) < 1) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      const now = performance.now();
      // a new gesture (not the tail of a trackpad fling), or a steady wheel after a pause on a stop
      const fresh = now - lastInput > 180 || now - doneAt > 700;
      lastInput = now;
      if (!busy && snapTarget(here(), dir) === null) return; // content: scroll freely
      e.preventDefault();
      e.stopPropagation();
      if (!busy && fresh) go(dir);
    };
    let touchY = 0;
    let touchDir: 0 | 1 | -1 = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
      touchDir = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dy = touchY - e.touches[0].clientY;
      if (Math.abs(dy) < 6 && !busy) return;
      const dir = dy > 0 ? 1 : -1;
      if (busy || snapTarget(here(), dir) !== null) {
        e.preventDefault();
        touchDir = dir;
      }
    };
    const onTouchEnd = () => {
      if (touchDir && !busy) go(touchDir);
      touchDir = 0;
    };
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.altKey || e.metaKey || e.ctrlKey) return;
      const dir = ["ArrowDown", "PageDown", " "].includes(e.key) && !e.shiftKey ? 1 : ["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey) ? -1 : 0;
      if (!dir) return;
      if (busy) return e.preventDefault();
      if (go(dir)) e.preventDefault();
    };
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);

    store.onReady = () => {
      drawn = "";
      if (!raf && near) raf = requestAnimationFrame(frame);
    };
    size();
    pos = at(window.scrollY);
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
    const idle = window.setTimeout(start, 2000);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(idle);
      window.removeEventListener("scroll", start);
      ro.disconnect();
      io.disconnect();
      store.dispose();
    };
    // stops and film are static for the page's life
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [film]);

  const chapters = stops.map((s, k) => ({ k, c: s.caption })).filter((x): x is { k: number; c: Caption } => !!x.c);
  const first = stops[0].shot;
  const last = stops[n - 1].shot;

  return (
    <div ref={root} className="relative">
      {/* the film: sticky behind everything in this wrapper (motion only) */}
      <div aria-hidden="true" className="sticky top-0 z-0 -mb-[100svh] h-[100svh] overflow-hidden bg-black motion-reduce:hidden">
        {/* the first frame as a picture, so there is an image before the canvas has decoded anything */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={stillSrc(first.still, first.still.widths[1] ?? first.still.widths[0])}
          alt=""
          fetchPriority="low"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: first.focus ?? "50% 50%" }}
        />
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
        {mark && (
          <div className="absolute inset-0 overflow-hidden">
            <CoverFrame still={last.still} focus={last.focus}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-film-mark
                src={mark.src}
                alt=""
                className="absolute opacity-0"
                style={{
                  left: `${mark.region[0] * 100}%`,
                  top: `${mark.region[1] * 100}%`,
                  width: `${mark.region[2] * 100}%`,
                  height: `${mark.region[3] * 100}%`,
                }}
              />
            </CoverFrame>
          </div>
        )}
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
            {k > 0 && <div aria-hidden="true" className="motion-reduce:hidden" style={{ height: `${runway[k] * 100}svh` }} />}
            <div
              data-film-rest
              className="relative mx-auto flex w-full max-w-[1320px] flex-col px-5 md:px-12 motion-reduce:!h-auto motion-reduce:py-14"
              style={{ height: `${rest[k] * 100}svh` }}
            >
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
            <div data-film-after={k} className="relative z-10">
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
