/**
 * The page-wide coffee journey: one scroll progress (0..1) from the green bean to the cup.
 * Shared by the 3D scene and the DOM (keep it free of three imports).
 */

/** Phase windows on the journey progress. */
export const PHASES = { roast: [0.2, 0.42], grind: [0.42, 0.66], brew: [0.64, 0.9] } as const;

/** Where the object sits: x/y as a fraction of the viewport (0 = centre, +x right, +y up), s = size, o = opacity. */
export type Pose = { x: number; y: number; s: number; o: number };

export type Anchor = {
  /** section id; the anchor is reached when the section's top passes the middle of the screen */
  id: string;
  /** journey progress at that moment */
  p: number;
  /** use the element's centre instead of its top (for stage blocks) */
  centre?: boolean;
  /** wide screens */
  land: Pose;
  /** portrait screens (phones): a small companion at the edge, big only on the stage sections */
  port: Pose;
};

// Outside the stage the object travels as a companion at the screen edge, clear of the copy columns.
const SIDE_R: Pose = { x: 0.41, y: -0.16, s: 0.6, o: 1 };
const SIDE_L: Pose = { x: -0.41, y: -0.16, s: 0.6, o: 1 };
const CORNER: Pose = { x: 0.36, y: -0.32, s: 0.36, o: 0.92 };

export const ANCHORS: Anchor[] = [
  // green beans drift in beside the concept copy
  { id: "konsepsiya", p: 0, land: { x: 0.3, y: 0, s: 0.75, o: 1 }, port: CORNER },
  { id: "proses", p: 0.04, land: { x: 0.24, y: 0, s: 1, o: 1 }, port: CORNER },
  // the stage: the whole object at full size in the free column (phones: the gap below the steps)
  { id: "proses-stage", p: 0.1, centre: true, land: { x: 0.24, y: 0, s: 1.05, o: 1 }, port: { x: 0, y: -0.04, s: 0.95, o: 1 } },
  { id: "reng", p: 0.16, land: SIDE_L, port: CORNER },
  // roasting while the roast levels are on screen
  { id: "qovurma", p: 0.24, land: SIDE_L, port: CORNER },
  // grind and brew through the brew guide
  { id: "demleme", p: 0.44, land: SIDE_R, port: CORNER },
  { id: "terefdas", p: 0.88, land: SIDE_R, port: CORNER },
  // the finished cup and the signature line
  { id: "paket", p: 0.94, land: SIDE_R, port: CORNER },
  { id: "tecrube", p: 1, land: { ...SIDE_R, o: 0.85 }, port: { ...CORNER, o: 0.8 } },
];

export const lerpPose = (a: Pose, b: Pose, k: number, out: Pose): Pose => {
  out.x = a.x + (b.x - a.x) * k;
  out.y = a.y + (b.y - a.y) * k;
  out.s = a.s + (b.s - a.s) * k;
  out.o = a.o + (b.o - a.o) * k;
  return out;
};

/** Shared state written by the DOM side (scroll) and read by the scene every frame. */
export const journey = {
  /** target progress from the scroll position (the scene eases toward it) */
  p: 0,
  /** current pose for the screen's orientation */
  pose: { x: 0.3, y: 0, s: 0.75, o: 0 } as Pose,
  /** 0 over the hero and the footer, 1 in between */
  presence: 0,
};
