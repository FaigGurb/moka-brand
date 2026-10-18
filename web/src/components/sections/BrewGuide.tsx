"use client";

import { useEffect, useRef, useState } from "react";
import { CUT_BOTTOM, CUT_TOP, HANDLE_PATH, LETTERS, pts } from "@/lib/logo";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/i18n/context";
import { CremaBackground } from "../fx/CremaBackground";

// General brewing guidance (not MOKA's recipes). Step times in seconds.
const RECIPES = [
  { id: "M", servings: [1, 3, 6], coffee: (n: number) => ({ 1: 7, 3: 16, 6: 30 })[n] ?? 16, water: (n: number) => ({ 1: 60, 3: 150, 6: 300 })[n] ?? 150, unit: "ml", steps: [0, 20, 180, 250], total: 270 },
  { id: "O", servings: [1, 2], coffee: (n: number) => 18 * n, water: (n: number) => 36 * n, unit: "g", steps: [0, 8, 26], total: 30 },
  { id: "K", servings: [1, 2, 3, 4], coffee: (n: number) => 16 * n, water: (n: number) => 250 * n, unit: "g", steps: [0, 45, 90, 150], total: 255 },
  { id: "A", servings: [1, 2], coffee: (n: number) => 15 * n, water: (n: number) => 250 * n, unit: "g", steps: [0, 40, 75, 105], total: 180 },
] as const;

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** The tool's letter fills with coffee up to the signature line as the timer runs. */
function FillLetter({ index, progress }: { index: number; progress: number }) {
  const l = LETTERS[index];
  const xs = l.poly.map((p) => p[0]);
  const minX = Math.min(...xs) - (l.id === "K" ? 36 : 4);
  const maxX = Math.max(...xs) + 4;
  const level = 155 - (155 - CUT_BOTTOM) * progress; // fills from the base up to the line
  const id = `brew-clip-${l.id}`;
  return (
    <svg viewBox={`${minX} 0 ${maxX - minX} 155`} className="h-full w-auto max-w-full" aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <polygon points={pts(l.poly)} />
        </clipPath>
      </defs>
      <polygon points={pts(l.poly)} fill="rgba(245,241,234,0.08)" stroke="rgba(245,241,234,0.35)" strokeWidth={1.5} />
      {l.id === "K" && <path d={HANDLE_PATH} fill="none" stroke="rgba(245,241,234,0.35)" strokeWidth={8} />}
      <g clipPath={`url(#${id})`}>
        <rect x={minX} y={level} width={maxX - minX} height={155 - level} fill="#5e3b26" />
        <rect x={minX} y={level} width={maxX - minX} height={3} fill="#a8643a" opacity={progress > 0 && progress < 1 ? 1 : 0} />
      </g>
      {/* the signature line */}
      <rect
        x={minX}
        y={CUT_TOP}
        width={maxX - minX}
        height={CUT_BOTTOM - CUT_TOP}
        fill={progress >= 1 ? "#FFFFFF" : "#000000"}
        style={{ transition: "fill 600ms", filter: progress >= 1 ? "drop-shadow(0 0 6px #FFFFFF)" : undefined }}
      />
    </svg>
  );
}

export function BrewGuide() {
  const { t } = useI18n();
  const b = t.brew;
  const root = useRef<HTMLElement>(null);
  const [tool, setTool] = useState(3);
  const r = RECIPES[tool];
  const [servings, setServings] = useState<number>(RECIPES[3].servings[0]);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const started = useRef<number | null>(null);

  // keep servings valid when the tool changes, and reset the timer
  useEffect(() => {
    setServings((s) => ((RECIPES[tool].servings as readonly number[]).includes(s) ? s : RECIPES[tool].servings[0]));
    setRunning(false);
    setElapsed(0);
  }, [tool]);

  useEffect(() => {
    if (!running) return;
    started.current = performance.now() - elapsed * 1000;
    let raf = 0;
    const loop = () => {
      const e = (performance.now() - (started.current ?? 0)) / 1000;
      if (e >= r.total) {
        setElapsed(r.total);
        setRunning(false);
        navigator.vibrate?.([60, 40, 120]);
        return;
      }
      setElapsed(e);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // elapsed is read once when (re)starting
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, r.total]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".bg-rise", { y: 40, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: root.current, start: "top 70%" } });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const coffee = r.coffee(servings);
  const water = r.water(servings);
  const fill = (s: string) => s.replace("{coffee}", String(coffee)).replace("{water}", String(water)).replace("{bloom}", String(coffee * 2));
  const progress = elapsed / r.total;
  const current = r.steps.reduce<number>((acc, at, i) => (elapsed >= at ? i : acc), 0);
  const done = elapsed >= r.total;
  const toolText = b.tools[tool];

  return (
    <section id="demleme" ref={root} className="relative isolate overflow-hidden bg-espresso text-paper">
      <CremaBackground className="-z-10" amp={0.45} />
      <div className="mx-auto max-w-[1320px] px-5 py-24 md:px-10 md:py-32">
        <div className="bg-rise grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-end md:gap-16">
          <div>
            <p className="eyebrow text-seher">{b.eyebrow}</p>
            <h2 className="mt-4 text-[clamp(40px,6vw,96px)] leading-[0.98] font-medium tracking-[-0.025em]">{b.title}</h2>
          </div>
          <p className="max-w-[52ch] text-[18px] leading-relaxed text-paper/80">{b.text}</p>
        </div>

        {/* tool picker: the four letters */}
        <div role="tablist" aria-label={b.eyebrow} className="bg-rise mt-12 grid grid-cols-4 gap-2 md:gap-4">
          {RECIPES.map((rc, i) => (
            <button
              key={rc.id}
              role="tab"
              type="button"
              aria-selected={tool === i}
              aria-controls="brew-panel"
              onClick={() => setTool(i)}
              className={`flex flex-col items-start gap-3 border px-3 py-3 text-left transition-colors md:px-5 md:py-4 ${
                tool === i ? "border-glow bg-paper/[0.06]" : "border-paper/15 hover:border-paper/40"
              }`}
            >
              <span className="font-[family-name:var(--font-display)] text-3xl leading-none md:text-5xl">{rc.id}</span>
              <span className="text-[11px] leading-tight font-bold tracking-[0.04em] sm:text-[12px] md:text-[14px]">{b.tools[i].name}</span>
            </button>
          ))}
        </div>

        <div id="brew-panel" role="tabpanel" className="bg-rise mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
          {/* letter that fills up + timer */}
          <div className="flex flex-col items-center justify-between gap-6 border border-paper/15 p-6 md:p-8">
            <div className="flex h-[180px] items-center justify-center md:h-[240px]">
              <FillLetter index={tool} progress={progress} />
            </div>
            <div className="w-full">
              <p className="text-center font-[family-name:var(--font-display)] text-6xl tabular-nums md:text-7xl" aria-live="off">
                {mmss(elapsed)}
              </p>
              <div className="relative mt-4 h-[3px] w-full bg-paper/15">
                <span className="absolute inset-y-0 left-0 bg-glow" style={{ width: `${progress * 100}%` }} />
                {r.steps.map((at) => (
                  <span key={at} className="absolute -top-1 h-[11px] w-[2px] bg-paper/40" style={{ left: `${(at / r.total) * 100}%` }} />
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => (done ? (setElapsed(0), setRunning(true)) : setRunning((x) => !x))}
                  className="flex-1 bg-paper py-3.5 text-[13px] font-semibold text-espresso transition-colors hover:bg-glow"
                >
                  {running ? b.pause : elapsed > 0 && !done ? b.resume : b.start}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRunning(false);
                    setElapsed(0);
                  }}
                  className="border border-paper/30 px-5 py-3.5 text-[13px] font-semibold"
                >
                  {b.reset}
                </button>
              </div>
              <p role="status" className={`mt-4 min-h-6 text-center text-[15px] text-glow transition-opacity ${done ? "opacity-100" : "opacity-0"}`}>
                {done ? b.done : ""}
              </p>
            </div>
          </div>

          {/* recipe numbers + steps */}
          <div className="flex flex-col gap-6">
            <fieldset>
              <legend className="eyebrow text-muted-dark">
                {b.servings} · {toolText.serving}
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {r.servings.map((n) => (
                  <label key={n} className="cursor-pointer">
                    <input type="radio" name="brew-servings" className="peer sr-only" checked={servings === n} onChange={() => setServings(n)} />
                    <span className="flex h-11 min-w-11 items-center justify-center border border-paper/25 px-4 font-bold tabular-nums transition-colors peer-checked:border-paper peer-checked:bg-paper peer-checked:text-espresso peer-focus-visible:outline-3 peer-focus-visible:outline-gunorta">
                      {n}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <dl className="grid grid-cols-2 gap-px bg-paper/15 sm:grid-cols-3">
              {[
                [b.coffee, `${coffee} ${b.units.g}`],
                [toolText.out, `${water} ${b.units[r.unit]}`],
                [b.grind, toolText.grind],
                [b.temp, toolText.temp],
                [b.time, mmss(r.total)],
                [b.ratio, r.id === "O" ? "1:2" : r.id === "M" ? "≈ 1:9" : `1:${Math.round(water / coffee)}`],
              ].map(([k, v]) => (
                <div key={k} className="bg-espresso p-4">
                  <dt className="text-[12px] font-semibold text-muted-dark">{k}</dt>
                  <dd className="mt-1 font-[family-name:var(--font-display)] text-2xl md:text-3xl">{v}</dd>
                </div>
              ))}
            </dl>

            <ol className="flex flex-col">
              {toolText.steps.map((s, i) => (
                <li
                  key={i}
                  className={`flex gap-4 border-t border-paper/15 py-3.5 transition-colors duration-500 ${
                    (running || elapsed > 0) && i === current && !done ? "text-paper" : elapsed > 0 && i < current ? "text-paper/40" : "text-muted-dark"
                  }`}
                >
                  <span className="w-12 shrink-0 font-bold tabular-nums">{mmss(r.steps[i])}</span>
                  <span className="flex-1 leading-relaxed">
                    {(running || elapsed > 0) && i === current && !done && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-glow align-middle" />}
                    {fill(s)}
                  </span>
                </li>
              ))}
            </ol>
            <p className="text-[13px] text-muted-dark">{b.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
