import type { Clip } from "./film";

/**
 * Frame sequences cut with docs/tools/film/extract.sh (or chain.sh for joined transitions);
 * files in web/public/film/<id>/<width>/.
 *
 * journey: six Kling 3.0 start→end-frame transitions between the BeanStory stills
 * (green → dark → crack → grind → pour → Chemex → blank cup), joined end to end.
 */
export const CLIPS = {
  journey: { id: "journey", frames: 361, widths: [960, 1280], aspect: 1.7778 },
} satisfies Record<string, Clip>;
