import type { Clip } from "./film";

/**
 * Frame sequences cut with docs/tools/film/extract.sh (or chain.sh for joined transitions);
 * files in web/public/film/<id>/<width>/.
 *
 * journey: six Kling 3.0 start→end-frame transitions between the BeanStory stills
 * (green → dark → crack → grind → pour → Chemex → blank cup), joined end to end, then every frame
 * upscaled 4× with Real-ESRGAN (realesr-general-x4v3, docs/tools/film/upscale.py) and cut to 960/1280/1920.
 */
export const CLIPS = {
  journey: { id: "journey", frames: 541, widths: [960, 1280, 1920], aspect: 1.7778 },
} satisfies Record<string, Clip>;
