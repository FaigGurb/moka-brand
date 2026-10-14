"use client";

import type { ReactNode } from "react";
import { FilmJourney, type FilmStop } from "../cinema/FilmJourney";
import type { FxSpec } from "../cinema/fx";
import { LOOPS, STILLS } from "@/lib/cinema";
import { CLIPS } from "@/lib/clips";
import { useI18n } from "@/i18n/context";

/** Living details, in fractions of each photo (anchors measured on the stills). */
const FX: Record<string, FxSpec[]> = {
  beanDark: [{ kind: "smoke", region: [0.36, 0, 0.24, 0.4], from: [0.5, 0.85], spread: 0.5 }],
  beanCrack: [{ kind: "shards", region: [0.2, 0.1, 0.6, 0.8], from: [0.5, 0.5] }],
  grind: [{ kind: "grains", region: [0.38, 0, 0.18, 0.72], from: [0.47, 0], to: [0.47, 0.83], spread: 0.12 }],
  pour: [
    { kind: "stream", region: [0.4, 0.2, 0.1, 0.38], from: [0.5, 0.1], to: [0.4, 0.9] },
    { kind: "steam", region: [0.28, 0, 0.3, 0.55], from: [0.47, 0.9], spread: 0.5 },
  ],
  chemex: [
    { kind: "steam", region: [0.4, -0.25, 0.26, 0.36], from: [0.5, 0.92], spread: 0.6 },
    { kind: "drip", region: [0.47, 0.55, 0.06, 0.27], from: [0.5, 0.05], to: [0.5, 0.89] },
  ],
  cup: [{ kind: "steam", region: [0.4, -0.2, 0.2, 0.43], from: [0.5, 0.98], spread: 0.35, intensity: 0.8 }],
};

const ESPRESSO = "var(--color-espresso)";

/**
 * "From bean to cup" as one film that runs under the first part of the page (FilmJourney): the hero
 * lifts off it, then green bean → roast → crack → grind → pour → Chemex → MOKA's cup, each a section
 * of its own, with the roast, brewing and packaging sections scrolling over the held frames between.
 * The film is six Kling start→end-frame transitions between these stills (docs/tools/film/chain.sh).
 * The cup's K is never drawn by the generator: the film ends on a blank cup and dissolves into the
 * still with the vector K.
 */
export function BeanStory({ lead, roast, brew, packs }: { lead: ReactNode; roast: ReactNode; brew: ReactNode; packs: ReactNode }) {
  const { t } = useI18n();
  const b = t.beans;
  const [bean, roasting, grinding, brewing] = b.steps;
  const cap = (i: number, s: { title: string; text: string }) => ({ kicker: String(i).padStart(2, "0"), title: s.title, text: s.text });
  const stops: FilmStop[] = [
    { shot: { still: STILLS.beanGreen, focus: "48% 50%" }, caption: cap(1, bean) },
    { shot: { still: STILLS.beanDark, focus: "48% 50%", fx: FX.beanDark }, caption: cap(2, roasting) },
    { shot: { still: STILLS.beanCrack, focus: "50% 50%", fx: FX.beanCrack }, after: roast, tone: ESPRESSO },
    { shot: { still: STILLS.grind, focus: "50% 60%", fx: FX.grind, loop: LOOPS.grind }, caption: cap(3, grinding) },
    { shot: { still: STILLS.pour, focus: "44% 60%", fx: FX.pour, loop: LOOPS.pour }, caption: cap(4, brewing) },
    { shot: { still: STILLS.chemex, focus: "48% 55%", fx: FX.chemex, loop: LOOPS.chemex }, after: brew, tone: ESPRESSO },
    { shot: { still: STILLS.cup, focus: "50% 50%", fx: FX.cup }, caption: cap(5, b.final), after: packs, tone: "#000" },
  ];

  return (
    <FilmJourney
      lead={lead}
      id="proses"
      eyebrow={b.eyebrow}
      heading={<h2 id="proses-title">{b.title}</h2>}
      stops={stops}
      film={CLIPS.journey}
    />
  );
}
