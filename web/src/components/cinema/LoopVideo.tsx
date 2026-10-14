"use client";

import { useEffect, useRef, useState } from "react";
import { loopSrc, type Loop } from "@/lib/cinema";

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
  className = "",
}: {
  loop: Loop;
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
    // iOS autoplays only muted video; set the property too (the attribute alone is not enough in React)
    v.muted = true;

    let visible = false;
    let timer = 0;
    const sync = () => {
      const on = visible && !document.hidden && (activeRef.current ? activeRef.current() : true);
      if (on && v.paused) v.play().catch(() => {});
      else if (!on && !v.paused) v.pause();
    };
    const playing = () => {
      setShown(true);
      playingRef.current?.(true);
    };
    v.addEventListener("playing", playing);
    // load a screen ahead, play only in view
    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSrc((s) => s ?? loopSrc(loop));
          near.disconnect();
        }
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
      io.disconnect();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
      v.removeEventListener("playing", playing);
      v.pause();
    };
  }, [loop]);

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
