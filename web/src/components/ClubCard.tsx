"use client";

import { useEffect, useState } from "react";
import { links } from "@/lib/site";
import { useI18n } from "@/i18n/context";

// Same storage and reward ladder as /club/club.js (the static games and AR pages write to it).
const KEY = "moka-club-v1";
const COSTS = [150, 300, 600];

function readPoints() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    return typeof s?.points === "number" ? s.points : 0;
  } catch {
    return 0;
  }
}

/** MOKA Club teaser: live points, the reward ladder drawn as the signature line. */
export function ClubCard() {
  const { locale, t } = useI18n();
  const c = t.exp.club;
  const [pts, setPts] = useState(0);

  useEffect(() => {
    const update = () => setPts(readPoints());
    update();
    window.addEventListener("storage", update);
    window.addEventListener("focus", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("focus", update);
    };
  }, []);

  const max = COSTS[COSTS.length - 1];
  const next = COSTS.find((x) => x > pts);
  return (
    <a
      href={links(locale).club}
      className="x-card group mt-6 grid gap-8 bg-espresso p-8 text-paper md:grid-cols-[1.1fr_1fr] md:items-center md:p-10"
    >
      <div className="flex flex-col gap-4">
        <p className="eyebrow text-glow">{c.eyebrow}</p>
        <h3 className="text-[clamp(26px,3.4vw,40px)] leading-[1.05] font-medium">{c.title}</h3>
        <p className="max-w-[54ch] text-[15px] leading-relaxed text-muted-dark">{c.text}</p>
        <span className="inline-flex items-center gap-3 text-[13px] font-bold tracking-normal">
          {c.cta} <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
        </span>
      </div>
      <div>
        <p className="flex items-baseline gap-3">
          <span className="font-[family-name:var(--font-display)] text-6xl text-glow tabular-nums">{pts}</span>
          <span className="text-[13px] font-bold tracking-normal text-muted-dark">{c.points}</span>
        </p>
        {next !== undefined && (
          <p className="mt-1 text-[14px] text-muted-dark">
            {next - pts} {c.points} {c.next}
          </p>
        )}
        {/* reward ladder on the signature line */}
        <div className="relative mt-8 mb-10 h-[3px] bg-paper/15" aria-hidden="true">
          <span className="absolute inset-y-0 left-0 bg-glow transition-[width] duration-700" style={{ width: `${Math.min(1, pts / max) * 100}%` }} />
          {COSTS.map((cost, i) => (
            <span key={cost} className="absolute -top-[7px] -translate-x-1/2" style={{ left: `${(cost / max) * 100}%` }}>
              <span className={`block h-4 w-4 rounded-full border-2 ${pts >= cost ? "border-glow bg-glow" : "border-paper/40 bg-espresso"}`} />
              <span
                className={`absolute top-6 text-[11px] leading-tight font-bold whitespace-nowrap text-muted-dark ${
                  i === COSTS.length - 1 ? "right-0 text-right" : "left-1/2 -translate-x-1/2 text-center"
                }`}
              >
                {cost}
                <br />
                <span className="font-normal">{c.rewards[i]}</span>
              </span>
            </span>
          ))}
        </div>
        <p className="text-[12px] text-muted-dark">{c.demo}</p>
      </div>
    </a>
  );
}
