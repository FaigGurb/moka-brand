"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { stillSrc, stillSrcSet, type Loop, type Still } from "@/lib/cinema";
import { Dust } from "./Dust";
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

/**
 * The photo's own frame, sized like CSS `object-fit: cover` with a focal point, so effects placed in
 * image fractions sit exactly on the picture; the scroll push-in scales this frame, effects included.
 */
function CoverFrame({ still, focus, children }: { still: Still; focus?: string; children: ReactNode }) {
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
    <div ref={ref} className="c-frame absolute will-change-transform" style={box ?? { left: 0, top: 0, width: "100%", height: "100%" }}>
      {children}
    </div>
  );
}

/** Still + optional loop + effects; the effects stay only while the loop is not playing. */
function ShotMedia({ shot, eager, isActive }: { shot: Shot; eager: boolean; isActive: () => boolean }) {
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
        decoding="async"
        className="h-full w-full object-cover"
        style={{ objectPosition: shot.focus ?? "50% 50%" }}
      />
      {shot.loop && <LoopVideo loop={shot.loop} focus={shot.focus} isActive={isActive} onPlaying={setLive} />}
      {!live && shot.fx?.map((spec, k) => <FxCanvas key={k} spec={spec} isActive={isActive} />)}
    </>
  );
}

export type Scene = { shots: Shot[]; kicker: string; title: string; text: string };

type Props = {
  id?: string;
  labelledBy?: string;
  eyebrow: string;
  heading: ReactNode;
  scenes: Scene[];
  /** scroll length per shot, in viewport heights */
  perShot?: number;
};

/**
 * A cinema stage: the section scrolls under a sticky full-screen frame; photoreal shots cross-dissolve
 * with a slow push-in (Ken Burns) tied to the scroll, chapter captions rise in and out, and a golden
 * rail tracks the progress. Everything is opacity/transform on composited layers, scrubbed by GSAP,
 * so it stays smooth on phones; it plays backwards when scrolling up. Reduced motion gets the shots
 * as a still sequence with their captions.
 */
export function CinemaStage({ id, labelledBy, eyebrow, heading, scenes, perShot = 0.9 }: Props) {
  const root = useRef<HTMLElement>(null);
  const shots = scenes.flatMap((s, si) => s.shots.map((shot, k) => ({ ...shot, scene: si, first: k === 0 })));
  const n = shots.length;
  // scrubbed progress of the stage, read by the effects so only the shot on screen animates
  const stage = useRef({ p: 0 });
  const seg = 1 / n;
  const near = (i: number) => () => {
    const p = stage.current.p;
    return p > i * seg - seg * 0.5 && p < (i + 1) * seg + seg * 0.5;
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const imgs = gsap.utils.toArray<HTMLElement>(".c-shot");
        const caps = gsap.utils.toArray<HTMLElement>(".c-cap");
        const ticks = gsap.utils.toArray<HTMLElement>(".c-tick");
        gsap.set(imgs.slice(1), { autoAlpha: 0 });
        gsap.set(caps.slice(1), { autoAlpha: 0, y: 40 });
        gsap.set(ticks.slice(1), { opacity: 0.35 });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 1 },
          onUpdate: () => {
            stage.current.p = tl.progress();
          },
        });
        tl.to({}, { duration: 1 }, 0);
        const fade = seg * 0.42;
        imgs.forEach((el, i) => {
          const s = i * seg;
          // slow push-in across the shot's whole life, slightly offset per shot for variety
          tl.fromTo(
            el.querySelector(".c-frame"),
            { scale: 1.16, xPercent: i % 2 ? 1.5 : -1.5 },
            { scale: 1.0, xPercent: 0, duration: seg + fade },
            Math.max(0, s - fade / 2),
          );
          if (i > 0) tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: fade, ease: "sine.inOut" }, s - fade / 2);
        });
        // chapter captions
        let at = 0;
        scenes.forEach((sc, si) => {
          const len = sc.shots.length * seg;
          const cap = caps[si];
          // captions arrive with the shot's dissolve and leave just before the next chapter's,
          // so even a one-shot chapter reads for most of its scroll
          if (si > 0) {
            tl.fromTo(cap, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: seg * 0.2, ease: "power2.out" }, at - seg * 0.08);
            if (ticks[si]) tl.to(ticks[si], { opacity: 1, duration: seg * 0.1 }, at);
          }
          if (si < scenes.length - 1) tl.to(cap, { autoAlpha: 0, y: -30, duration: seg * 0.14, ease: "power2.in" }, at + len - seg * 0.2);
          at += len;
        });
        tl.fromTo(".c-rail", { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0);
        tl.fromTo(".c-rail-x", { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);
        return () => tl.kill();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      id={id}
      ref={root}
      aria-labelledby={labelledBy}
      className="relative bg-black text-paper"
      style={{ ["--c-len" as string]: `${Math.max(2, n * perShot + 1) * 100}svh` }}
    >
      {/* scroll runway (motion only) */}
      <div className="motion-safe:h-[var(--c-len)]">
        <div className="motion-safe:sticky motion-safe:top-0 motion-safe:h-[100svh] motion-safe:overflow-hidden">
          {/* shots */}
          <div className="motion-reduce:hidden">
            {shots.map((s, i) => (
              <div key={i} className="c-shot absolute inset-0 overflow-hidden will-change-[opacity]">
                <CoverFrame still={s.still} focus={s.focus}>
                  <ShotMedia shot={s} eager={i < 2} isActive={near(i)} />
                </CoverFrame>
              </div>
            ))}
            <Dust className="motion-reduce:hidden" />
            {/* grade: vignette, a floor for the copy, a soft top for the nav */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_45%,transparent_35%,rgba(0,0,0,0.6)_100%)]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(to_top,rgba(0,0,0,0.88),rgba(0,0,0,0.4)_55%,transparent)]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.7),transparent)]" />
          </div>

          {/* heading */}
          <div className="relative mx-auto w-full max-w-[1320px] px-5 pt-24 md:px-12 md:pt-28 motion-safe:absolute motion-safe:inset-x-0 motion-safe:top-0">
            <p className="eyebrow text-seher">{eyebrow}</p>
            <div className="mt-2 max-w-[16ch] font-[family-name:var(--font-display)] text-[clamp(28px,4.2vw,56px)] leading-[1.02] font-medium tracking-[-0.015em]">
              {heading}
            </div>
          </div>

          {/* captions */}
          <div className="relative mx-auto w-full max-w-[1320px] px-5 pb-14 md:px-12 md:pb-16 motion-safe:absolute motion-safe:inset-x-0 motion-safe:bottom-0">
            <div className="relative motion-safe:min-h-[220px] md:motion-safe:min-h-[240px]">
              {scenes.map((sc, si) => (
                <div key={si} className="c-cap motion-safe:absolute motion-safe:inset-x-0 motion-safe:bottom-0 motion-reduce:mt-16">
                  {/* reduced motion: each chapter shows its first shot as a still */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={stillSrc(sc.shots[0].still, sc.shots[0].still.widths[1] ?? sc.shots[0].still.widths[0])}
                    alt=""
                    loading="lazy"
                    className="mb-6 hidden aspect-video w-full rounded-sm object-cover motion-reduce:block"
                  />
                  <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.3em] text-glow">
                    {sc.kicker} <span className="text-paper/35">/ {String(scenes.length).padStart(2, "0")}</span>
                  </p>
                  <h3 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(48px,9vw,128px)] leading-[0.9] font-medium tracking-[-0.03em]">
                    {sc.title}
                  </h3>
                  <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-paper/75 sm:text-[17px]">{sc.text}</p>
                </div>
              ))}
            </div>
            {/* progress, horizontal on phones */}
            <div aria-hidden="true" className="mt-8 h-px w-full bg-paper/15 motion-reduce:hidden md:hidden">
              <span className="c-rail-x block h-full origin-left bg-glow" />
            </div>
          </div>

          {/* progress rail with chapter ticks (wide screens) */}
          <div aria-hidden="true" className="absolute top-1/2 right-6 hidden -translate-y-1/2 items-stretch gap-4 motion-reduce:hidden md:flex lg:right-10">
            <ol className="flex flex-col justify-between py-1 text-right text-[10px] font-bold tracking-[0.2em] uppercase">
              {scenes.map((sc) => (
                <li key={sc.title} className="c-tick">
                  {sc.title}
                </li>
              ))}
            </ol>
            <span className="relative block h-[38svh] w-px bg-paper/15">
              <span className="c-rail absolute inset-0 origin-top bg-glow shadow-[0_0_10px_rgba(255,226,166,0.7)]" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
