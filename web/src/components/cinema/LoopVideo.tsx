"use client";

import { useEffect, useRef, useState } from "react";
import { loopSrc, type Loop } from "@/lib/cinema";
import { perfTier } from "@/lib/perf";

/**
 * A silent seamless loop laid over its still (the clip starts from that still). It loads only when
 * near the screen, plays only while on screen and while `isActive()` says its shot is showing, and
 * fades in once frames are actually playing, so the still covers loading and stalls. Nothing for
 * reduced motion or "save data": the still (and its 2D effects) stay.
 */
export function LoopVideo({
  loop,
  focus,
  isActive,
  onPlaying,
  sharpOnly = false,
  className = "",
}: {
  loop: Loop;
  /** play only where the largest encode covers the screen without upscaling (else the sharper still stays) */
  sharpOnly?: boolean;
  focus?: string;
  isActive?: () => boolean;
  onPlaying?: (playing: boolean) => void;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const activeRef = useRef(isActive);
  activeRef.current = isActive;
  const playingRef = useRef(onPlaying);
  playingRef.current = onPlaying;

  useEffect(() => {
    const v = ref.current;
    if (!v || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) return;
    if (sharpOnly && v.clientWidth * Math.min(devicePixelRatio || 1, 2) > Math.max(...loop.widths) * 1.05) return;
    // iOS autoplays only muted video; set the property too (the attribute alone is not enough in React)
    v.muted = true;

    let visible = false;
    let timer = 0;
    // play only once enough is buffered to run through: a loop that starts on a thin buffer stutters on
    // its first seconds (iPhone, first visit), and the still below covers until then
    let ready = false;
    let fallback = 0;
    const canRun = () => {
      ready = true;
      sync();
    };
    v.addEventListener("canplaythrough", canRun);
    const sync = () => {
      const on = ready && visible && !document.hidden && (activeRef.current ? activeRef.current() : true);
      if (on && v.paused) v.play().catch(() => {});
      else if (!on && !v.paused) v.pause();
    };
    const playing = () => {
      setShown(true);
      playingRef.current?.(true);
    };
    v.addEventListener("playing", playing);
    // load a screen ahead, play only in view; never before the page has loaded and gone idle, so the
    // video doesn't compete with the first paint (the still covers until then)
    let idle = 0;
    let wait = 0;
    const start = () => {
      const go = () => {
        setSrc((s) => s ?? loopSrc(loop, perfTier() === "low"));
        // iOS may not buffer before play() (data saver, low power): don't wait for canplaythrough forever
        fallback = window.setTimeout(canRun, 3000);
      };
      // phones: give the film's first frames the line first (both at once made both stutter on a first visit)
      if (perfTier() === "low") {
        wait = window.setTimeout(go, 2500);
        return;
      }
      const ric = window.requestIdleCallback;
      if (ric) idle = ric(go, { timeout: 1500 });
      else wait = window.setTimeout(go, 300);
    };
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        near.disconnect();
        if (document.readyState === "complete") start();
        else window.addEventListener("load", start, { once: true });
      },
      { rootMargin: "100% 0px" },
    );
    near.observe(v);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      window.clearInterval(timer);
      // the active check reads the scrubbed stage progress, so poll it while in view
      if (visible) timer = window.setInterval(sync, 200);
      sync();
    });
    io.observe(v);
    document.addEventListener("visibilitychange", sync);
    return () => {
      near.disconnect();
      window.removeEventListener("load", start);
      if (idle) window.cancelIdleCallback(idle);
      window.clearTimeout(wait);
      io.disconnect();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
      v.removeEventListener("playing", playing);
      v.removeEventListener("canplaythrough", canRun);
      window.clearTimeout(fallback);
      v.pause();
    };
  }, [loop, sharpOnly]);

  // sources are added only when near the screen; the element has to re-read them
  useEffect(() => {
    if (src) ref.current?.load();
  }, [src]);

  return (
    <video
      ref={ref}
      aria-hidden="true"
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700 motion-reduce:hidden ${shown ? "opacity-100" : "opacity-0"} ${className}`}
      style={focus ? { objectPosition: focus } : undefined}
    >
      {/* H.264 first (hardware decode everywhere, Safari); VP9 for browsers without it */}
      {src && <source src={`${src}.mp4`} type="video/mp4" />}
      {src && <source src={`${src}.webm`} type="video/webm" />}
    </video>
  );
}
