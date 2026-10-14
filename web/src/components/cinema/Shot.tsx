"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { stillSrc, stillSrcSet, type Loop, type Still } from "@/lib/cinema";
import { FxCanvas } from "./FxCanvas";
import { LoopVideo } from "./LoopVideo";
import type { FxSpec } from "./fx";

export type Shot = {
  still: Still;
  /** object-position of the crop, e.g. "62% 50%" (keeps the subject in frame on phones) */
  focus?: string;
  alt?: string;
  /** living details over the photo (steam, falling grounds, drips …), placed in image coordinates */
  fx?: FxSpec[];
  /** a seamless video loop that starts from this still; once it plays, the 2D effects step aside */
  loop?: Loop;
};

/** "48% 60%" → [0.48, 0.6] */
export const focusOf = (s: Shot) => (s.focus ?? "50% 50%").split(" ").map((v) => parseFloat(v) / 100) as [number, number];

/**
 * The photo's own frame, sized like CSS `object-fit: cover` with a focal point, so effects placed in
 * image fractions sit exactly on the picture (and on the film frames, which are cropped the same way).
 */
export function CoverFrame({ still, focus, children }: { still: Still; focus?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const [fx, fy] = (focus ?? "50% 50%").split(" ").map((v) => parseFloat(v) / 100);
    const fit = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      const width = Math.max(cw, ch * still.aspect);
      const height = width / still.aspect;
      setBox({ left: (cw - width) * fx, top: (ch - height) * fy, width, height });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [still, focus]);
  return (
    <div ref={ref} className="absolute" style={box ?? { left: 0, top: 0, width: "100%", height: "100%" }}>
      {children}
    </div>
  );
}

/**
 * Still + optional loop + effects; the effects stay only while the loop is not playing. `lite`
 * (phones, weak devices) keeps just the sharp still, so the film has the device to itself.
 */
export function ShotMedia({
  shot,
  eager,
  lite,
  isActive,
}: {
  shot: Shot;
  eager: boolean;
  lite: boolean;
  isActive: () => boolean;
}) {
  const [live, setLive] = useState(false);
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={stillSrc(shot.still, shot.still.widths[shot.still.widths.length - 1])}
        srcSet={stillSrcSet(shot.still)}
        sizes="100vw"
        alt={shot.alt ?? ""}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? undefined : "low"}
        decoding="async"
        className="h-full w-full object-cover"
        style={{ objectPosition: shot.focus ?? "50% 50%" }}
      />
      {!lite && shot.loop && <LoopVideo loop={shot.loop} focus={shot.focus} isActive={isActive} onPlaying={setLive} />}
      {!lite && !live && shot.fx?.map((spec, k) => <FxCanvas key={k} spec={spec} isActive={isActive} />)}
    </>
  );
}
