"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import {
  FrameStore,
  drawCover,
  frameUrl,
  pickWidth,
  type Clip,
} from "@/lib/film";

/** A caption that fades in and out over a window of the film's progress (0..1). */
export type Beat = {
  from: number;
  to: number;
  node: ReactNode;
  className?: string;
};

type Props = {
  id?: string;
  clip: Clip;
  /** scroll length of the film in viewport heights */
  length?: number;
  beats?: Beat[];
  /** focal point of the frame on narrow screens (cover crop) */
  focus?: [number, number];
  /** frame shown for reduced motion */
  poster?: number;
  className?: string;
  children?: ReactNode;
  labelledBy?: string;
};

const FADE = 0.06;

/**
 * Scroll-driven film: a sticky full-screen canvas plays an image sequence as the section scrolls
 * (backwards when scrolling up). Frames come from FrameStore; drawing happens only when the frame
 * changes, only while the section is near the screen. Reduced motion shows one still frame.
 */
export function ScrollFilm({
  id,
  clip,
  length = 3,
  beats = [],
  focus = [0.5, 0.5],
  poster,
  className = "",
  children,
  labelledBy,
}: Props) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const beatEls = useRef<(HTMLDivElement | null)[]>([]);
  const target = useRef(0);
  const reduced = useReducedMotion();
  // read inside the frame loop, so inline props don't restart the film
  const beatsRef = useRef(beats);
  const focusRef = useRef(focus);
  beatsRef.current = beats;
  focusRef.current = focus;

  useGSAP(
    () => {
      if (reduced) return;
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          target.current = self.progress;
        },
      });
      return () => st.kill();
    },
    { scope: root, dependencies: [reduced] },
  );

  useEffect(() => {
    const c = canvas.current;
    const el = root.current;
    if (!c || !el) return;
    const g = c.getContext("2d", { alpha: false });
    if (!g) return;
    const width = pickWidth(clip);
    const store = new FrameStore(clip, width);
    const n = clip.frames;
    let p = reduced ? (poster ?? n - 1) / (n - 1) : target.current;
    let shown = -1;
    let shownExact = false;
    let dirty = true;
    let raf = 0;
    let near = false;
    let lastWant = -1;
    let dir: 1 | -1 = 1;
    const beatOp: number[] = [];

    const size = () => {
      // No more canvas pixels than the frames carry: a 720 px frame cropped to a tall phone screen is
      // upscaled anyway, so a backing store at screen resolution would only cost fill time.
      const cw = c.clientWidth;
      const ch = c.clientHeight;
      const iw = width;
      const ih = width / clip.aspect;
      const cover = Math.max(cw / iw, ch / ih); // CSS px per frame px
      const k = Math.min(window.devicePixelRatio || 1, 2, Math.max(0.5, 1.15 / cover));
      const w = Math.round(cw * k);
      const h = Math.round(ch * k);
      if (w && h && (w !== c.width || h !== c.height)) {
        c.width = w;
        c.height = h;
        g.imageSmoothingQuality = "high";
        dirty = true;
      }
    };
    const fx = () => (window.innerWidth < 768 ? focusRef.current[0] : 0.5);
    const fy = () => (window.innerWidth < 768 ? focusRef.current[1] : 0.5);

    const frame = () => {
      raf = near ? requestAnimationFrame(frame) : 0;
      if (!reduced) {
        const t = target.current;
        // light easing: smooth on wheels that jump, without lagging behind a finger
        p += (t - p) * 0.35;
        if (Math.abs(t - p) < 1e-4) p = t;
      }
      const i = Math.round(p * (n - 1));
      if (i !== lastWant) {
        dir = i >= lastWant ? 1 : -1;
        lastWant = i;
        store.want(i, dir);
      }
      if (i !== shown || !shownExact || dirty) {
        const got = store.nearest(i);
        if (got) {
          drawCover(g, got.frame, c.width, c.height, fx(), fy());
          shown = i;
          shownExact = got.index === i;
          dirty = false;
        }
      }
      // captions
      if (reduced) return;
      beatsRef.current.forEach((b, k) => {
        const e = beatEls.current[k];
        if (!e) return;
        const inA = Math.min(1, Math.max(0, (p - b.from) / FADE));
        const outA =
          b.to >= 1 ? 1 : Math.min(1, Math.max(0, (b.to - p) / FADE));
        const o = Math.round(Math.min(inA, outA) * 100) / 100;
        if (o !== beatOp[k]) {
          beatOp[k] = o;
          e.style.opacity = String(o);
          e.style.transform = `translate3d(0,${(1 - o) * 18}px,0)`;
          e.style.visibility = o > 0 ? "visible" : "hidden";
        }
      });
    };

    store.onReady = () => {
      if (!shownExact) dirty = true;
      if (!raf && near) raf = requestAnimationFrame(frame);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(c);
    const io = new IntersectionObserver(
      ([e]) => {
        near = e.isIntersecting;
        if (near && !raf) raf = requestAnimationFrame(frame);
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    // start fetching once the film is within two screens, so the page's first paint stays light
    const pre = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        pre.disconnect();
        store.want(Math.round(p * (n - 1)), 1);
        void store.load();
      },
      { rootMargin: "200% 0px" },
    );
    pre.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      pre.disconnect();
      store.dispose();
    };
  }, [clip, poster, reduced]);

  return (
    <section
      id={id}
      ref={root}
      aria-labelledby={labelledBy}
      className={`relative bg-black text-paper ${className}`}
      style={reduced ? undefined : { height: `${length * 100}svh` }}
    >
      <div
        className={
          reduced
            ? "relative h-[80svh] overflow-hidden"
            : "sticky top-0 h-[100svh] overflow-hidden"
        }
      >
        {/* the first frame as an image, so there is a picture before the canvas has decoded anything */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={frameUrl(clip, Math.min(...clip.widths), poster ?? 0)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          decoding="async"
        />
        <canvas
          ref={canvas}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        />
        {/* cinematic grade: vignette and a floor for the copy */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_40%,rgba(0,0,0,0.55)_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(0,0,0,0.75),transparent)]"
        />
        {!reduced &&
          beats.map((b, k) => (
            <div
              key={k}
              ref={(e) => {
                beatEls.current[k] = e;
              }}
              className={`absolute inset-0 flex ${b.className ?? "items-end px-5 pb-16 md:px-12 md:pb-20"}`}
              style={{ opacity: 0, visibility: "hidden" }}
            >
              {b.node}
            </div>
          ))}
        {children}
      </div>
      {/* reduced motion: one still frame, the captions as plain copy below it */}
      {reduced && beats.length > 0 && (
        <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-16 md:px-12">
          {beats.map((b, k) => (
            <div key={k}>{b.node}</div>
          ))}
        </div>
      )}
    </section>
  );
}
