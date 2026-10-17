"use client";

import { jumpTo } from "@/lib/lenis";
import { useRef, useState } from "react";
import { Lockup } from "../Logo";
import { MagneticButton } from "../ui/MagneticButton";
import { Dust } from "../cinema/Dust";
import { BeanRain } from "../cinema/BeanRain";
import { dropBeans } from "../fx/BeanDrop";
import { LoopVideo } from "../cinema/LoopVideo";
import { gsap, useGSAP } from "@/lib/gsap";
import { links } from "@/lib/site";
import { LOOPS, STILLS, stillSrc, stillSrcSet } from "@/lib/cinema";
import { useI18n } from "@/i18n/context";

/**
 * Hero: a photoreal studio still (beans falling through warm light) that comes alive as a seamless
 * video loop (Higgsfield / Kling from the same still), settles in on load and drifts away with the
 * scroll; MOKA's official lockup and the concept line on the dark side. Until the loop plays (or
 * without it: reduced data), beans cut from the photo fall over the still.
 */
export function Hero() {
  const { locale, t } = useI18n();
  const L = links(locale);
  const root = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // The intro plays when the preloader opens (or at once on repeat visits). The paragraph only
        // slides, it never starts invisible, so the largest text paints with the first frame.
        const tl = gsap.timeline({ paused: true });
        tl.fromTo(".hero-photo", { scale: 1.14, autoAlpha: 0.4 }, { scale: 1.04, autoAlpha: 1, duration: 2.6, ease: "power2.out" })
          .from(".hero-lockup", { y: 24, autoAlpha: 0, duration: 1.2, ease: "power3.out" }, 0.2)
          .from(".hero-word", { yPercent: 110, duration: 1.1, ease: "power4.out", stagger: 0.12 }, 0.35)
          .from(".hero-fade", { opacity: 0, y: 16, duration: 0.9, ease: "power2.out", stagger: 0.08 }, 0.6)
          .from(".hero-lead", { y: 16, duration: 0.9, ease: "power2.out" }, 0.65);
        const play = () => tl.play();
        if ((window as Window & { __mokaIntroDone?: boolean }).__mokaIntroDone) play();
        else window.addEventListener("moka:intro-done", play, { once: true });
        const failsafe = window.setTimeout(play, 2500);
        // scroll: the photo sinks and dims, the copy lifts a little faster (depth)
        gsap.to(".hero-photo-wrap", {
          yPercent: 14,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(".hero-dim", {
          opacity: 0.75,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(".hero-copy", {
          yPercent: -18,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        return () => {
          window.removeEventListener("moka:intro-done", play);
          window.clearTimeout(failsafe);
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="top" ref={root} className="relative flex min-h-[100svh] flex-col overflow-hidden bg-black text-paper">
      <div aria-hidden="true" className="hero-photo-wrap absolute inset-0">
        <div className="hero-photo absolute inset-0 will-change-transform">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={stillSrc(STILLS.hero, 1600)}
            srcSet={stillSrcSet(STILLS.hero)}
            sizes="100vw"
            alt=""
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-[78%_50%] md:object-[60%_50%]"
          />
          <LoopVideo loop={LOOPS.hero} onPlaying={setLive} sharpOnly className="object-[78%_50%] md:object-[60%_50%]" />
        </div>
      </div>
      {!live && <BeanRain />}
      <Dust />
      {/* grade: the copy side stays deep black; phones get a floor under the text */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.6)_38%,transparent_70%)]" />
      {/* wide screens: the pitch and buttons sit on the right, so that side gets its own shade */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(270deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.55)_38%,transparent_62%)] md:block" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] bg-[linear-gradient(to_top,#000_0%,rgba(0,0,0,0.75)_45%,transparent)] md:h-[35%]" />
      <div aria-hidden="true" className="hero-dim pointer-events-none absolute inset-0 bg-black opacity-0" />

      <div className="hero-copy relative mx-auto flex w-full max-w-[1320px] flex-1 flex-col justify-end px-5 pt-28 pb-12 md:px-12 md:pb-16">
        <p className="hero-fade eyebrow text-paper/60">{t.hero.eyebrow}</p>
        <Lockup className="hero-lockup mt-6 w-[min(78vw,420px)] text-paper" title={t.hero.logo} />
        <div className="mt-10 grid items-end gap-8 md:mt-14 md:grid-cols-[1.25fr_1fr] md:gap-16">
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(44px,7.6vw,104px)] leading-[0.92] font-medium tracking-[-0.025em]">
            {t.hero.lines.map((l) => (
              <span key={l} className="reveal-line block">
                <span className="hero-word">{l}</span>
              </span>
            ))}
          </h1>
          <div className="flex flex-col gap-7 md:pb-3">
            <p className="hero-lead max-w-[44ch] text-[16px] leading-relaxed text-paper/80 [text-shadow:0_1px_14px_rgb(0_0_0/0.9)] sm:text-[17px]">{t.hero.text}</p>
            <div className="hero-fade flex flex-wrap gap-3">
              <MagneticButton
                href="#proses"
                onClick={(e) => {
                  // the film plays itself, stop to stop (FilmJourney listens); without motion the link just jumps
                  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
                  e.preventDefault();
                  window.dispatchEvent(new Event("moka:tour"));
                }}
              >
                {t.hero.cta}
              </MagneticButton>
              <MagneticButton href={L.ar} variant="ghost">
                {t.hero.ar}
              </MagneticButton>
            </div>
            {/* where and when, for guests who came for a coffee rather than the story */}
            <a href="#kafeler" onClick={(e) => jumpTo("#kafeler") && e.preventDefault()} className="hero-fade group order-first flex flex-col gap-0.5 self-start text-[15px] text-paper/75 transition-colors hover:text-paper md:order-none">
              <span className="text-paper underline decoration-paper/30 underline-offset-4 group-hover:decoration-paper">{t.contact.title} ↓</span>
              {t.contact.places.map((p) => (
                <span key={p.name}>
                  {p.name} · {p.hours}
                </span>
              ))}
            </a>
            {/* a small toy: real beans fall, bounce and settle at the foot of the screen */}
            <p className="hero-fade flex items-center gap-2 text-[15px] text-paper/60 motion-reduce:hidden">
              <button type="button" onClick={() => dropBeans(1)} className="underline decoration-paper/30 underline-offset-4 transition-colors hover:text-paper">
                {t.hero.drop}
              </button>
              <button type="button" onClick={() => dropBeans(20)} className="underline decoration-paper/30 underline-offset-4 transition-colors hover:text-paper">
                {t.hero.dropMany}
              </button>
            </p>
          </div>
        </div>
      </div>
      {/* scroll cue: a drop runs down a thin golden line, into the film below */}
      <span aria-hidden="true" className="hero-fade pointer-events-none absolute bottom-6 left-1/2 hidden h-14 w-px -translate-x-1/2 overflow-hidden bg-paper/15 md:block">
        <span className="absolute inset-x-0 top-0 h-5 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.95))] motion-safe:animate-[scroll-cue_2.2s_cubic-bezier(0.6,0,0.3,1)_infinite]" />
      </span>
      {/* the signature line under the hero */}
      <span aria-hidden="true" className="relative block h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)]" />
    </section>
  );
}
