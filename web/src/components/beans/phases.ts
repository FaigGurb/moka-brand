/** Scroll-progress boundaries of the bean story, shared by the 3D scene and the captions. */
export const PHASES = { roast: [0.2, 0.42], grind: [0.42, 0.66], brew: [0.64, 0.9] } as const;

/** Caption windows: bean, roast, grind, brew, final line. */
export const CAPTIONS: [number, number][] = [
  [0, 0.2],
  [0.2, 0.42],
  [0.42, 0.64],
  [0.64, 0.88],
  [0.88, 1],
];
