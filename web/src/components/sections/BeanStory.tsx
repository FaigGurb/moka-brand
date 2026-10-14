"use client";

import { CinemaStage, type Scene } from "../cinema/CinemaStage";
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

/**
 * "From bean to cup" as a cinema stage: photoreal chapters (bean, roast, grind, brew, the line on
 * MOKA's cup) as one film directed by the scroll, backwards when scrolling up: the camera rests on each
 * sharp still (grind, pour and Chemex as real video loops, the rest with 2D effects), then a Kling
 * start→end-frame transition carries it to the next (docs/tools/film/chain.sh). The cup's K is never
 * drawn by the generator: the film ends on a blank cup and dissolves into the still with the vector K.
 */
export function BeanStory() {
  const { t } = useI18n();
  const b = t.beans;
  const shots: Scene["shots"][] = [
    [{ still: STILLS.beanGreen, focus: "48% 50%" }],
    [
      { still: STILLS.beanDark, focus: "48% 50%", fx: FX.beanDark },
      { still: STILLS.beanCrack, focus: "50% 50%", fx: FX.beanCrack },
    ],
    [{ still: STILLS.grind, focus: "50% 60%", fx: FX.grind, loop: LOOPS.grind }],
    [
      { still: STILLS.pour, focus: "44% 60%", fx: FX.pour, loop: LOOPS.pour },
      { still: STILLS.chemex, focus: "48% 55%", fx: FX.chemex, loop: LOOPS.chemex },
    ],
    [{ still: STILLS.cup, focus: "50% 50%", fx: FX.cup }],
  ];
  const steps = [...b.steps, b.final];
  const scenes: Scene[] = steps.map((s, i) => ({
    shots: shots[i],
    kicker: String(i + 1).padStart(2, "0"),
    title: s.title,
    text: s.text,
  }));

  return (
    <CinemaStage
      id="proses"
      labelledBy="proses-title"
      eyebrow={b.eyebrow}
      heading={<h2 id="proses-title">{b.title}</h2>}
      scenes={scenes}
      perShot={0.95}
      film={CLIPS.journey}
    />
  );
}
