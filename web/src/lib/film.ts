/**
 * Frame store for scroll-driven films (image sequences cut from a video with docs/tools/film/extract.sh).
 *
 * Every frame is fetched once as a small encoded WebP blob (key frames first, so scrubbing works
 * before the rest arrives); only a window around the current frame is decoded into ImageBitmaps,
 * off the main thread, and frames far behind are closed again. Drawing never waits on a network
 * request or a decode: it takes the nearest frame that is ready.
 */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type Clip = {
  id: string;
  /** number of frames (files 0001.webp …) */
  frames: number;
  /** frame sets by width; `public/film/<id>/<width>/` */
  widths: number[];
  /** frame aspect ratio (width / height) */
  aspect: number;
};

/** Picks the frame set for this screen: the smallest width that still covers it sharply. */
export function pickWidth(clip: Clip) {
  const need = Math.min(window.innerWidth, 1600) * Math.min(window.devicePixelRatio || 1, 1.5);
  const sorted = [...clip.widths].sort((a, b) => a - b);
  return sorted.find((w) => w >= need * 0.9) ?? sorted[sorted.length - 1];
}

/**
 * Like pickWidth, for a film shown full-bleed with object-fit: cover: a tall phone crops a wide frame
 * hard, so the width it needs comes from the screen height too.
 */
export function pickCoverWidth(clip: Clip) {
  const cover = Math.max(window.innerWidth, window.innerHeight * clip.aspect);
  const need = Math.min(cover, 1600) * Math.min(window.devicePixelRatio || 1, 1.5) * 0.55;
  const sorted = [...clip.widths].sort((a, b) => a - b);
  return sorted.find((w) => w >= need) ?? sorted[sorted.length - 1];
}

export function frameUrl(clip: Clip, width: number, i: number) {
  return `${BASE}/film/${clip.id}/${width}/${String(i + 1).padStart(4, "0")}.webp`;
}

type Drawable = ImageBitmap | HTMLImageElement;

const canBitmap = typeof createImageBitmap === "function";

async function decode(blob: Blob): Promise<Drawable> {
  if (canBitmap) return createImageBitmap(blob);
  const img = new Image();
  img.src = URL.createObjectURL(blob);
  await img.decode();
  return img;
}

function release(d: Drawable) {
  if ("close" in d) d.close();
  else URL.revokeObjectURL(d.src);
}

export class FrameStore {
  private blobs: (Blob | null)[];
  private ready = new Map<number, Drawable>();
  private decoding = new Set<number>();
  private aborter = new AbortController();
  private disposed = false;
  /** called when a frame near the current one becomes drawable */
  onReady: (() => void) | null = null;
  loaded = 0;

  constructor(
    private clip: Clip,
    private width: number,
  ) {
    this.blobs = new Array(clip.frames).fill(null);
  }

  /** Fetches every frame: every 8th first, then 4th, 2nd, then the rest (6 requests at a time). */
  async load() {
    const n = this.clip.frames;
    const order: number[] = [];
    const seen = new Set<number>();
    for (const step of [8, 4, 2, 1])
      for (let i = 0; i < n; i += step)
        if (!seen.has(i)) {
          seen.add(i);
          order.push(i);
        }
    if (!seen.has(n - 1)) order.splice(1, 0, n - 1);
    let k = 0;
    const worker = async () => {
      while (k < order.length && !this.disposed) {
        const i = order[k++];
        try {
          const res = await fetch(frameUrl(this.clip, this.width, i), { signal: this.aborter.signal });
          if (!res.ok) continue;
          this.blobs[i] = await res.blob();
          this.loaded++;
          this.onReady?.();
        } catch {
          return;
        }
      }
    };
    await Promise.all(Array.from({ length: 6 }, worker));
  }

  /** Keeps frames around `at` decoded (more ahead in the scroll direction), frees the rest. */
  want(at: number, dir: 1 | -1) {
    const n = this.clip.frames;
    const ahead = 14;
    const behind = 5;
    const lo = Math.max(0, dir > 0 ? at - behind : at - ahead);
    const hi = Math.min(n - 1, dir > 0 ? at + ahead : at + behind);
    for (const [i, d] of this.ready)
      if (i < lo - 6 || i > hi + 6) {
        release(d);
        this.ready.delete(i);
      }
    // nearest first
    for (let r = 0; r <= ahead; r++)
      for (const i of [at + r * dir, at - r * dir]) {
        if (i < lo || i > hi || this.ready.has(i) || this.decoding.has(i)) continue;
        const blob = this.blobs[i];
        if (!blob || this.decoding.size >= 4) continue;
        this.decoding.add(i);
        decode(blob)
          .then((d) => {
            this.decoding.delete(i);
            if (this.disposed) return release(d);
            this.ready.set(i, d);
            this.onReady?.();
          })
          .catch(() => this.decoding.delete(i));
      }
  }

  /** The decoded frame at `i`, or the nearest decoded one (never blank once anything is ready). */
  nearest(i: number): { frame: Drawable; index: number } | null {
    if (this.ready.has(i)) return { frame: this.ready.get(i)!, index: i };
    for (let r = 1; r < this.clip.frames; r++) {
      const a = this.ready.get(i - r);
      if (a) return { frame: a, index: i - r };
      const b = this.ready.get(i + r);
      if (b) return { frame: b, index: i + r };
    }
    return null;
  }

  dispose() {
    this.disposed = true;
    this.aborter.abort();
    this.ready.forEach(release);
    this.ready.clear();
    this.blobs = [];
  }
}

/** Draws a frame like CSS `object-fit: cover`, with a focal point (0..1) to keep the subject in view. */
export function drawCover(g: CanvasRenderingContext2D, img: Drawable, cw: number, ch: number, fx = 0.5, fy = 0.5) {
  const iw = img.width;
  const ih = img.height;
  const s = Math.max(cw / iw, ch / ih);
  const w = iw * s;
  const h = ih * s;
  g.drawImage(img, (cw - w) * fx, (ch - h) * fy, w, h);
}
