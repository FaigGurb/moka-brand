"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { stillSrc, type Still } from "@/lib/cinema";
import { FrameStore, drawCover, pickCoverWidth, type Clip } from "@/lib/film";
import { perfTier } from "@/lib/perf";
import { getLenis } from "@/lib/lenis";
import { Dust } from "./Dust";
import { CoverFrame, focusOf, type Shot } from "./Shot";

export type Caption = { kicker: string; title: string; text: string; /** short facts shown as pills under the text */ tags?: string[]; /** label for the chapter index */ label?: string };

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

/** scroll (in screen heights) from one stop to the next: short, so one flick carries a whole transition */
const SPAN = 1;
/** height of a stop's own part: a chapter with a title, or a passing shot */
const REST_CAPTION = 0.6;
const REST_PASS = 0.25;
/** runway when the film resumes after a content section (it was holding underneath) */
const RESUME = 0.75;
/**
 * Damping of the film behind the scroll, per 60 Hz frame (framerate independent): the film glides on
 * after the wheel or finger stops, like a camera with weight (awwwards-3d's lerp loop: ~0.08).
 */
const FOLLOW = 0.075;
const CAM = 0.06;
/** while a gesture carries it from stop to stop the scroll itself is eased: the film follows it almost directly */
const FOLLOW_STEP = 0.45;
/** dolly push: the camera leans in with the film's speed (stops per second → extra zoom), then settles */
const PUSH = 0.028;
/** time a gesture takes to carry the film one stop (seconds): close to the clips' own slow-motion pace */
const STEP_BASE = 1.5;
const STEP_PER_SCREEN = 0.7;
const STEP_MIN = 1.8;
const STEP_MAX = 2.8;
const PUSH_MAX = 0.07;
/** zigzag: how far (in % of the screen) the picture slides away from its title, and the zoom that hides the edges */
const ZIG = 6;
const ZOOM = 1.15;
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
  const runway = stops.map((_, k) => (k === 0 ? 0 : stops[k - 1].after ? RESUME : Math.max(0.4, SPAN - rest[k - 1])));

  // zigzag: chapter titles alternate left (-1) and right (1); passing shots sit in the middle (0)
  let chapterNo = 0;
  const side = stops.map((s) => (s.caption ? (chapterNo++ % 2 === 0 ? -1 : 1) : 0));

  useEffect(() => setLite(perfTier() === "low"), []);

  useEffect(() => {
    const el = root.current;
    const c = canvas.current;
    if (!el || !c || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const g = c.getContext("2d", { alpha: false });
    if (!g) return;
    const low = perfTier() === "low";
    const width = pickCoverWidth(film, low ? 0.42 : 0.55);
    const store = new FrameStore(film, width, low);
    const stopEls = Array.from(el.querySelectorAll<HTMLElement>("[data-film-stop]"));
    const restEls = Array.from(el.querySelectorAll<HTMLElement>("[data-film-rest]"));
    const afterEls = new Map(Array.from(el.querySelectorAll<HTMLElement>("[data-film-after]")).map((a) => [Number(a.dataset.filmAfter), a]));
    const caps = Array.from(el.querySelectorAll<HTMLElement>("[data-film-cap]"));
    const markEl = el.querySelector<HTMLElement>("[data-film-mark]");
    const shades = Array.from(el.querySelectorAll<HTMLElement>("[data-film-shade]"));
    const bigs = Array.from(el.querySelectorAll<HTMLElement>("[data-film-big]"));
    const index = el.querySelector<HTMLElement>("[data-film-index]");
    const dots = Array.from(el.querySelectorAll<HTMLElement>("[data-film-dot]"));
    const focus = stops.map((s) => focusOf(s.shot));

    // keyframes (scrollY → film position), linear between them: the film sits on the first stop
    // while the opening lifts, reaches each stop as its caption part fills the screen, and holds
    // under a content section until that section's end is back on screen
    let keys: [number, number][] = [];
    // the stretches the film plays through by itself, one per gesture: opening → first stop,
    // stop → stop, end of a content section → next stop (content sections scroll freely)
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
    let prevF = 0;
    let push = 0;
    let wide = false;
    const capOp: number[] = [];
    const bigSt: string[] = [];
    let indexOn = -1;
    let active = -1;
    let filmTop = 0;
    let markOp = -1;
    const shadeOp = [-1, -1];
    const size = () => {
      // no more canvas pixels than the frames carry
      const cover = Math.max(c.clientWidth / width, c.clientHeight / (width / film.aspect));
      const k = Math.min(window.devicePixelRatio || 1, 2, Math.max(0.5, 1.15 / cover));
      c.width = Math.max(1, Math.round(c.clientWidth * k));
      c.height = Math.max(1, Math.round(c.clientHeight * k));
      wide = window.innerWidth >= 768;
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = "high";
      drawn = "";
      measure();
      filmTop = stopEls[0].getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.5;
    };

    let last = performance.now();
    const frame = (now: number) => {
      raf = near ? requestAnimationFrame(frame) : 0;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const target = at(window.scrollY);
      // one damping layer on top of Lenis: the film eases in and out of every move
      pos += (target - pos) * (1 - Math.pow(1 - (goal === null ? FOLLOW : FOLLOW_STEP), dt * 60));
      if (Math.abs(target - pos) < 2e-4) pos = target;
      const f = pos;
      // the camera leans in while the film moves and settles when it rests
      const speed = dt > 0 ? Math.abs(f - prevF) / dt : 0;
      prevF = f;
      push += (Math.min(PUSH_MAX, speed * PUSH) - push) * (1 - Math.pow(1 - 0.12, dt * 60));
      // zigzag: on wide screens the picture slides away from the side its title is on; the
      // pointer adds a slight drift (damped slower still)
      const sf = Math.min(n - 2, Math.floor(f));
      const sv = side[sf] + (side[sf + 1] - side[sf]) * smooth(f - sf);
      if (cam) {
        const k = 1 - Math.pow(1 - CAM, dt * 60);
        cx += (mx - cx) * k;
        cy += (my - cy) * k;
        const zig = wide ? -sv * ZIG : 0;
        const zoom = (wide ? ZOOM : 1) * (1 + push);
        const tr = `translate3d(${zig.toFixed(2)}%,0,0) translate3d(${(cx * -14).toFixed(1)}px,${(cy * -9).toFixed(1)}px,0) scale(${zoom.toFixed(4)})`;
        if (tr !== camTr) {
          camTr = tr;
          cam.style.transform = tr;
        }
      }
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
      const near0 = exact ? null : store.nearest(i0);
      const base = exact ?? near0?.frame;
      // read by the QA scripts: how many frames the picture on screen lags behind the wanted one
      (window as Window & { __mokaLag?: number }).__mokaLag = near0 ? Math.abs(near0.index - i0) : 0;
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

      // chapter titles follow the film: they rise as it nears their stop and sink as it moves on
      caps.forEach((e, k) => {
        const d = Math.abs(f - Number(e.dataset.filmCap));
        const o = Math.round((1 - smooth(clamp01((d - 0.06) / 0.34))) * 100) / 100;
        if (o !== capOp[k]) {
          capOp[k] = o;
          // the words of the title rise out of depth one after another (CSS reads --o)
          e.style.setProperty("--o", String(o));
        }
      });
      // the giant scene words: the chapter's word set into the picture, drifting past as the film moves
      bigs.forEach((e, k) => {
        const d = f - Number(e.dataset.filmBig);
        const o = 1 - smooth(clamp01((Math.abs(d) - 0.06) / 0.44));
        const st = `${o.toFixed(2)}|${d.toFixed(3)}`;
        if (st !== bigSt[k]) {
          bigSt[k] = st;
          e.style.setProperty("--o", o.toFixed(2));
          e.style.setProperty("--d", d.toFixed(3));
        }
      });
      // the chapter index: shown while the film is the picture (not over the opening or a content section)
      if (index) {
        const frac = f - Math.floor(f);
        const capMax = capOp.length ? Math.max(...capOp) : 0;
        const on = window.scrollY > filmTop && (capMax > 0.05 || (frac > 0.02 && frac < 0.98)) ? 1 : 0;
        if (on !== indexOn) {
          indexOn = on;
          index.dataset.on = String(on);
        }
        // the chapter whose stop is nearest
        let best = 0;
        dots.forEach((d, k) => {
          if (Math.abs(f - Number(d.dataset.filmDot)) < Math.abs(f - Number(dots[best].dataset.filmDot))) best = k;
        });
        if (best !== active) {
          if (dots[active]) dots[active].removeAttribute("aria-current");
          dots[best]?.setAttribute("aria-current", "step");
          active = best;
        }
      }
      if (markEl) {
        const o = Math.round(smooth(clamp01((f - (n - 1) + 0.06) / 0.06)) * 100) / 100;
        if (o !== markOp) {
          markOp = o;
          markEl.style.opacity = String(o);
        }
      }
      // a soft shade on the side the title is on, so it reads over any frame
      if (wide) {
        [Math.max(0, -sv), Math.max(0, sv)].forEach((v, k) => {
          const o = Math.round(v * 100) / 100;
          if (o !== shadeOp[k] && shades[k]) {
            shadeOp[k] = o;
            shades[k].style.opacity = String(o);
          }
        });
      }
    };

    const cam = el.querySelector<HTMLElement>("[data-film-cam]");
    // the pointer drift only where it is cheap and has a mouse; the zigzag slide everywhere wide
    const fine = !low && matchMedia("(pointer: fine)").matches;
    let mx = 0;
    let my = 0;
    let cx = 0;
    let cy = 0;
    let camTr = "";
    const onPointer = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };
    if (cam && fine) window.addEventListener("pointermove", onPointer, { passive: true });

    // one gesture = one stop: every wheel gesture, swipe or arrow key inside the film moves the
    // goal one stop on; gestures during a move add stops (two scrolls, two stops) instead of being
    // swallowed, and the scroll is never locked. A trackpad's inertia tail is part of its gesture.
    const TOL = 4;
    let goal: number | null = null;
    let goalTimer = 0;
    const next = (from: number, dir: 1 | -1) => {
      for (const [a0, b0] of segs) {
        if (dir > 0 && from >= a0 - TOL && from < b0 - TOL) return b0;
        if (dir < 0 && from > a0 + TOL && from <= b0 + TOL) return a0;
      }
      return null;
    };
    // gentle in and out with an almost even middle, so the clip plays at its own (slow-motion) pace
    const easeInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
    const easeOut = (t: number) => Math.sin((t * Math.PI) / 2);
    const here = () => getLenis()?.scroll ?? window.scrollY;
    /** true when the gesture was taken by the film */
    const step = (dir: 1 | -1) => {
      const moving = goal !== null;
      const to = next(goal ?? here(), dir);
      if (to === null) return moving; // a move to the end of the film is running: hold the rest
      const lenis = getLenis();
      if (!lenis) return false;
      goal = to;
      const vh = window.innerHeight;
      const duration = Math.min(STEP_MAX, Math.max(STEP_MIN, STEP_BASE + (Math.abs(to - here()) / vh) * STEP_PER_SCREEN));
      // a new gesture mid-move carries on at speed instead of starting again from rest
      lenis.scrollTo(to, { duration, easing: moving ? easeOut : easeInOut, force: true, onComplete: () => (goal = null) });
      // if something else takes the scroll over (a nav link), forget the goal anyway
      window.clearTimeout(goalTimer);
      goalTimer = window.setTimeout(() => (goal = null), duration * 1000 + 400);
      return true;
    };
    let lastWheel = 0;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX) || Math.abs(e.deltaY) < 1) return;
      const now = performance.now();
      const fresh = now - lastWheel > 200;
      lastWheel = now;
      const dir = e.deltaY > 0 ? 1 : -1;
      if (goal === null && next(here(), dir) === null) return; // content: the wheel scrolls as usual
      e.preventDefault();
      e.stopPropagation();
      if (fresh) step(dir);
    };
    let touchY = 0;
    let touchDir: 0 | 1 | -1 = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
      touchDir = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dy = touchY - e.touches[0].clientY;
      if (Math.abs(dy) < 8 && goal === null) return;
      const dir = dy > 0 ? 1 : -1;
      if (goal !== null || next(here(), dir) !== null) {
        e.preventDefault();
        if (Math.abs(dy) >= 20) touchDir = dir;
      }
    };
    const onTouchEnd = () => {
      // a frame later: Lenis resets its own animation on touchend, after this listener
      const dir = touchDir;
      if (dir) requestAnimationFrame(() => step(dir));
      touchDir = 0;
    };
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON" || e.altKey || e.metaKey || e.ctrlKey) return;
      const down = ["ArrowDown", "PageDown"].includes(e.key) || (e.key === " " && !e.shiftKey);
      const up = ["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey);
      if ((down || up) && step(down ? 1 : -1)) e.preventDefault();
    };
    const onIndex = (e: MouseEvent) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>("[data-film-dot]");
      const lenis = getLenis();
      if (!b) return;
      const r = restEls[Number(b.dataset.filmDot)];
      const to = r.getBoundingClientRect().top + window.scrollY;
      if (!lenis) return window.scrollTo({ top: to });
      const duration = Math.min(STEP_MAX + 0.6, Math.max(STEP_MIN, STEP_BASE + (Math.abs(to - here()) / window.innerHeight) * 0.25));
      goal = to;
      lenis.scrollTo(to, { duration, easing: easeInOut, force: true, onComplete: () => (goal = null) });
      window.clearTimeout(goalTimer);
      goalTimer = window.setTimeout(() => (goal = null), duration * 1000 + 400);
    };
    index?.addEventListener("click", onIndex);
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
    prevF = pos;
    const ro = new ResizeObserver(size);
    ro.observe(el);
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => {
      near = e.isIntersecting;
      if (near && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
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
      window.removeEventListener("pointermove", onPointer);
      index?.removeEventListener("click", onIndex);
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(goalTimer);
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
        <div data-film-cam className="absolute inset-0 will-change-transform">
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
        </div>
        {/* giant scene words, set into the picture (wide, capable screens; the frame loop drives --o/--d) */}
        {/* never on the last stop: the cup carries MOKA's K, and nothing may show through the logo */}
        {chapters.filter(({ k }) => k < n - 1).map(({ k, c }) => (
          <div key={k} data-film-big={k} className={`film-big pointer-events-none absolute inset-0 hidden items-end justify-center pb-[3vh] ${lite ? "" : "md:flex"}`}>
            <span>{c.title}</span>
          </div>
        ))}
        {!lite && <Dust />}
        {/* grade: vignette, a floor for the captions, a soft top for the nav */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_45%,transparent_35%,rgba(0,0,0,0.6)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(to_top,rgba(0,0,0,0.85),rgba(0,0,0,0.35)_55%,transparent)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.7),transparent)]" />
        {/* side shades for the zigzag titles (wide screens; the frame loop sets their opacity) */}
        <div data-film-shade className="pointer-events-none absolute inset-y-0 left-0 hidden w-[60%] bg-[linear-gradient(to_right,rgba(0,0,0,0.78),rgba(0,0,0,0.35)_55%,transparent)] opacity-0 md:block" />
        <div data-film-shade className="pointer-events-none absolute inset-y-0 right-0 hidden w-[60%] bg-[linear-gradient(to_left,rgba(0,0,0,0.78),rgba(0,0,0,0.35)_55%,transparent)] opacity-0 md:block" />
      </div>

      {/* chapter index (wide screens): where you are in the film, and a way to jump */}
      <nav data-film-index data-on="0" aria-label={eyebrow} className="film-index fixed top-1/2 right-5 z-30 hidden -translate-y-1/2 md:block motion-reduce:!hidden">
        <ol className="flex flex-col items-end gap-3">
          {chapters.map(({ k, c }) => (
            <li key={k}>
              <button type="button" data-film-dot={k} className="film-dot group flex items-center gap-3 py-1 text-right font-[family-name:var(--font-display)] text-[11px] tracking-[0.25em] text-paper/45 uppercase transition-colors hover:text-paper aria-[current=step]:text-paper">
                <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-500 group-hover:max-w-40 group-hover:opacity-100 group-focus-visible:max-w-40 group-focus-visible:opacity-100">{c.label ?? c.title}</span>
                <span>{c.kicker}</span>
                <span aria-hidden="true" className="h-px w-5 bg-current transition-all duration-500 group-aria-[current=step]:w-10 group-aria-[current=step]:bg-glow" />
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="relative z-10">{lead}</div>

      {stops.map((s, k) => (
        <Fragment key={k}>
          <section id={k === 0 ? id : undefined} aria-labelledby={k === 0 ? `${id}-title` : undefined} data-film-stop={k} className="relative z-10 text-paper">
            {/* the section heading comes first in the document (h2 before the chapter h3s), laid over the top of the rest */}
            {k === 0 && (
              <div className="mx-auto w-full max-w-[1320px] px-5 pt-24 md:px-12 md:pt-28 motion-safe:absolute motion-safe:inset-x-0 motion-safe:top-0">
                <p className="eyebrow text-seher">{eyebrow}</p>
                <div className="mt-2 max-w-[16ch] font-[family-name:var(--font-display)] text-[clamp(28px,4.2vw,56px)] leading-[1.02] font-medium tracking-[-0.015em]">
                  {heading}
                </div>
              </div>
            )}
            {/* the chapter title, pinned to the foot of the screen for the whole section; the film sets its visibility */}
            {s.caption && (
              <div className="pointer-events-none motion-safe:sticky motion-safe:top-0 motion-safe:-mb-[100svh] motion-safe:flex motion-safe:h-[100svh] motion-safe:flex-col motion-safe:justify-end md:motion-safe:justify-center">
                <div
                  data-film-cap={k}
                  className={`film-cap pointer-events-auto mx-auto w-full max-w-[1320px] px-5 pb-16 md:px-12 md:pb-0 motion-reduce:pb-14 ${side[k] > 0 ? "md:flex md:flex-col md:items-end md:text-right" : ""}`}
                >
                  <p className="film-cap-fade font-[family-name:var(--font-display)] text-sm tracking-[0.3em] text-glow">
                    {s.caption.kicker} <span className="text-paper/35">/ {String(chapters.length).padStart(2, "0")}</span>
                  </p>
                  <h3 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(48px,7.5vw,112px)] leading-[0.9] font-medium tracking-[-0.03em] [perspective:600px]">
                    {s.caption.title.split(" ").map((w, i) => (
                      <span key={i} className="film-word inline-block" style={{ ["--i" as string]: i }}>
                        {w}
                        {"\u00a0"}
                      </span>
                    ))}
                  </h3>
                  <p className="film-cap-fade mt-4 max-w-[44ch] text-[15px] leading-relaxed text-paper/75 sm:text-[17px]">{s.caption.text}</p>
                  {s.caption.tags && (
                    <ul className={`film-cap-fade mt-5 flex flex-wrap gap-2 ${side[k] > 0 ? "md:justify-end" : ""}`}>
                      {s.caption.tags.map((t) => (
                        <li key={t} className="rounded-full border border-paper/25 bg-black/25 px-3.5 py-1.5 font-[family-name:var(--font-display)] text-[11px] tracking-[0.2em] text-paper/85 uppercase backdrop-blur-[2px]">
                          {t}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
            {/* the runway: the film moves while this scrolls by */}
            {k > 0 && <div aria-hidden="true" className="motion-reduce:hidden" style={{ height: `${runway[k] * 100}svh` }} />}
            <div
              data-film-rest
              className="relative mx-auto flex w-full max-w-[1320px] flex-col px-5 md:px-12 motion-reduce:!h-auto motion-reduce:py-14"
              style={{ height: `${rest[k] * 100}svh` }}
            >
              {/* reduced motion: the still in flow */}
              <StillFallback still={s.shot.still} focus={s.shot.focus} />
            </div>
          </section>
          {s.after && (
            <div data-film-after={k} className="relative z-10">
              {/* the film dissolves into the section and the section back into the film */}
              <div
                aria-hidden="true"
                className="h-[28svh] motion-reduce:hidden"
                style={{ background: `linear-gradient(to bottom, transparent, ${s.tone ?? "#000"})` }}
              />
              {s.after}
              {k < n - 1 && (
                <div
                  aria-hidden="true"
                  className="h-[28svh] motion-reduce:hidden"
                  style={{ background: `linear-gradient(to top, transparent, ${s.tone ?? "#000"})` }}
                />
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
