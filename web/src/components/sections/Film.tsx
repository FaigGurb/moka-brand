"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/i18n/context";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Footage in public/film/: free Pexels clips (Pexels licence), trimmed to ~6 s, graded to one warm
 * muted tone and encoded with a keyframe every 4 frames so scroll-scrubbing seeks smoothly. Sources:
 * beans 12926088 · moka 14754577 · espresso 12594426 · filter 5556420 · v60 4794521. Each has a
 * poster (its last frame) for reduced motion and for the moment before the clip loads, and a VP9 WebM twin.
 */
const CLIPS = [
  { id: "beans", w: 1280, h: 720 },
  { id: "moka", w: 1280, h: 720 },
  { id: "espresso", w: 720, h: 1280 },
  { id: "filter", w: 1280, h: 720 },
  { id: "v60", w: 1280, h: 720 },
] as const;
const N = CLIPS.length;
const DUR = 6;

/**
 * The coffee journey as a short film driven by the scroll: one pinned stage, five chapters. Each clip
 * plays forward as you scroll through its chapter and cross-fades into the next; the signature line
 * under the copy fills chapter by chapter and runs through all five at the end. Clips load only
 * around the active chapter. Reduced motion: no pin, chapters stacked with still frames.
 */
export function Film() {
  const { t } = useI18n();
  const f = t.film;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const videos = gsap.utils.toArray<HTMLVideoElement>(".fm-video", el);
      const frames = gsap.utils.toArray<HTMLElement>(".fm-frame", el);
      const texts = gsap.utils.toArray<HTMLElement>(".fm-text", el);
      const fills = gsap.utils.toArray<HTMLElement>(".fm-fill", el);
      const counter = el.querySelector<HTMLElement>(".fm-count")!;
      let active = -1;
      let raf = 0;
      const want = new Array(N).fill(0);

      const load = (i: number) => {
        const v = videos[i];
        if (!v || v.dataset.loaded) return;
        v.dataset.loaded = "1";
        // H.264 where the browser has it (Safari, Chrome), VP9 WebM otherwise (e.g. Chromium builds without it)
        const mp4 = v.canPlayType('video/mp4; codecs="avc1.640028"') !== "";
        v.src = `${v.dataset.src}.${mp4 ? "mp4" : "webm"}`;
        v.preload = "auto";
        v.load();
      };

      // Seek toward the wanted time once per frame, never while a seek is still pending.
      const tick = () => {
        videos.forEach((v, i) => {
          if (!v.dataset.loaded || v.readyState < 1 || v.seeking) return;
          if (Math.abs(v.currentTime - want[i]) > 1 / 48) v.currentTime = want[i];
        });
        raf = requestAnimationFrame(tick);
      };

      const render = (p: number) => {
        const x = p * (N + 0.6); // the last 0.6 is the finale
        const i = Math.min(N - 1, Math.floor(x));
        const local = Math.min(1, x - i);
        for (let k = 0; k < N; k++) want[k] = k < i ? DUR - 0.05 : k > i ? 0 : Math.min(DUR - 0.05, local * DUR);
        fills.forEach((fl, k) => (fl.style.transform = `scaleX(${k < i ? 1 : k > i ? 0 : local})`));
        const idx = x >= N ? N : i;
        if (idx !== active) {
          [i - 1, i, i + 1].forEach((k) => k >= 0 && k < N && load(k));
          frames.forEach((fr, k) => fr.classList.toggle("is-on", k === Math.min(i, N - 1)));
          texts.forEach((tx, k) => {
            const on = k === idx;
            gsap.to(tx, { autoAlpha: on ? 1 : 0, y: on ? 0 : k < idx ? -20 : 20, duration: 0.5, ease: "power2.out", overwrite: true });
          });
          counter.textContent = idx < N ? `0${idx + 1} / 0${N}` : "MOKA";
          el.classList.toggle("is-final", idx === N);
          active = idx;
        }
      };

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(texts, { autoAlpha: 0 });
        render(0);
        raf = requestAnimationFrame(tick);
        // load the first clip a little before the section arrives
        const io = new IntersectionObserver(([e]) => e.isIntersecting && load(0), { rootMargin: "100% 0px" });
        io.observe(el);
        const proxy = { p: 0 };
        const tween = gsap.to(proxy, {
          p: 1,
          ease: "none",
          onUpdate: () => render(proxy.p),
          scrollTrigger: { trigger: ".fm-pin", start: "top top", end: "+=460%", pin: true, scrub: 0.6, anticipatePin: 1 },
        });
        return () => {
          cancelAnimationFrame(raf);
          io.disconnect();
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(texts, { clearProps: "all" });
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const chapters = f.chapters;

  return (
    <section id="proses" ref={root} aria-labelledby="proses-title" className="fm bg-paper text-espresso">
      <h2 id="proses-title" className="sr-only">
        {f.eyebrow}
      </h2>
      <div className="fm-pin relative motion-safe:h-[100svh] motion-safe:overflow-hidden">
        <div className="mx-auto grid h-full max-w-[1440px] gap-6 px-5 pt-20 pb-6 motion-safe:grid-rows-[minmax(0,1fr)_auto] md:px-10 md:pt-24 md:pb-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-1 lg:gap-14 motion-reduce:py-24">
          {/* copy column (below the footage on phones) */}
          <div className="relative order-2 flex flex-col justify-between gap-6 lg:order-1 lg:py-6 motion-reduce:hidden">
            <div className="flex items-center justify-between gap-4">
              <p className="eyebrow text-axsam-ink">{f.eyebrow}</p>
              <span className="fm-count text-[12px] font-bold tracking-[0.2em] text-muted tabular-nums" aria-hidden="true">
                01 / 05
              </span>
            </div>
            <div className="relative min-h-[150px] flex-1 lg:min-h-0">
              {[...chapters.map((c) => ({ k: c.kicker, title: c.title, text: c.text })), { k: "MOKA", title: f.final.title, text: f.final.text }].map((c, i) => (
                <div key={i} className="fm-text absolute inset-x-0 bottom-0 lg:top-1/2 lg:bottom-auto lg:-translate-y-1/2">
                  <p className="text-[12px] font-bold tracking-[0.22em] text-axsam-ink uppercase">{c.k}</p>
                  <p className="mt-3 font-[family-name:var(--font-display)] text-[clamp(34px,4.8vw,76px)] leading-[0.94] font-semibold tracking-[-0.025em]">{c.title}</p>
                  <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-muted md:text-[17px]">{c.text}</p>
                </div>
              ))}
            </div>
            {/* the signature line: one segment per chapter, filling as the clip plays */}
            <div aria-hidden="true" className="flex gap-1.5">
              {chapters.map((c) => (
                <span key={c.kicker} className="relative h-[3px] flex-1 overflow-hidden bg-espresso/12">
                  <span className="fm-fill absolute inset-0 origin-left bg-axsam" style={{ transform: "scaleX(0)" }} />
                </span>
              ))}
            </div>
          </div>

          {/* footage */}
          <div className="relative order-1 min-h-0 overflow-hidden bg-espresso lg:order-2 motion-reduce:hidden">
            {CLIPS.map((c, i) => (
              <figure key={c.id} className="fm-frame absolute inset-0 m-0 opacity-0 transition-opacity duration-700 ease-out [&.is-on]:opacity-100">
                <video
                  className="fm-video h-full w-full scale-[1.04] object-cover transition-transform duration-[1600ms] ease-out [.is-on>&]:scale-100"
                  data-src={`${BASE}/film/${c.id}`}
                  poster={`${BASE}/film/${c.id}.webp`}
                  width={c.w}
                  height={c.h}
                  muted
                  playsInline
                  preload="none"
                  aria-label={chapters[i].alt}
                />
              </figure>
            ))}
            {/* warm vignette so the frame sits in the cream page */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(27,23,20,0.35))]" />
            <p className="absolute right-3 bottom-2 left-3 text-right text-[10px] tracking-[0.06em] text-paper/70">{f.credit}</p>
          </div>

          {/* reduced motion: the chapters as a plain sequence of stills */}
          <ol className="hidden gap-14 motion-reduce:grid lg:col-span-2">
            <li>
              <p className="eyebrow text-axsam-ink">{f.eyebrow}</p>
            </li>
            {chapters.map((c, i) => (
              <li key={c.kicker} className="grid gap-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-center">
                {/* eslint-disable-next-line @next/next/no-img-element -- static export, posters are pre-sized */}
                <img src={`${BASE}/film/${CLIPS[i].id}.webp`} alt={c.alt} width={CLIPS[i].w} height={CLIPS[i].h} loading="lazy" className="aspect-[16/10] w-full object-cover" />
                <div>
                  <p className="text-[12px] font-bold tracking-[0.22em] text-axsam-ink uppercase">{c.kicker}</p>
                  <h3 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(30px,4vw,56px)] leading-[0.95] font-semibold">{c.title}</h3>
                  <p className="mt-3 max-w-[42ch] text-[16px] leading-relaxed text-muted">{c.text}</p>
                </div>
              </li>
            ))}
            <li>
              <p className="font-[family-name:var(--font-display)] text-[clamp(34px,5vw,72px)] font-semibold">{f.final.title}</p>
              <p className="mt-3 max-w-[50ch] text-[16px] text-muted">{f.final.text}</p>
              <p className="mt-6 text-[11px] text-muted">{f.credit}</p>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
