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
export function pickCoverWidth(clip: Clip, factor = 0.55) {
  const cover = Math.max(window.innerWidth, window.innerHeight * clip.aspect);
  const need = Math.min(cover, 1600) * Math.min(window.devicePixelRatio || 1, 1.5) * factor;
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
  private at = 0;
  private dir: 1 | -1 = 1;
  /** called when a frame near the current one becomes drawable */
  onReady: (() => void) | null = null;
  loaded = 0;

  constructor(
    private clip: Clip,
    private width: number,
    /** phones and weak devices: a smaller window and fewer decodes at once */
    private light = false,
  ) {
    this.blobs = new Array(clip.frames).fill(null);
  }

  private requested: boolean[] = [];

  /**
   * The next frame to fetch, by what the visitor will see next: first a skeleton of every 16th frame
   * (nearest first), so any scroll lands near something; then every frame just ahead in the scroll
   * direction (a little behind too), the stretch the film is about to play; then every 4th frame,
   * then the rest, always nearest to where the film is first. On a slow line the frames come in
   * where they are needed instead of evenly across the whole film.
   */
  private nextToFetch(): number {
    const n = this.clip.frames;
    const at = Math.min(n - 1, Math.max(0, this.at));
    const dir = this.dir;
    const free = (i: number) => i >= 0 && i < n && !this.requested[i];
    const nearest = (ok: (i: number) => boolean, reach = n, back = n) => {
      for (let r = 0; r < reach; r++) {
        const a = at + r * dir;
        if (free(a) && ok(a)) return a;
        const b = at - r * dir;
        if (r <= back && free(b) && ok(b)) return b;
      }
      return -1;
    };
    let i = nearest((k) => k % 16 === 0 || k === n - 1);
    if (i < 0) i = nearest(() => true, this.light ? 110 : 150, 20);
    if (i < 0) i = nearest((k) => k % 4 === 0);
    if (i < 0) i = nearest(() => true);
    return i;
  }

  /** Fetches every frame, in the order nextToFetch picks, a few requests at a time. */
  async load() {
    this.requested = new Array(this.clip.frames).fill(false);
    const worker = async () => {
      while (!this.disposed) {
        const i = this.nextToFetch();
        if (i < 0) return;
        this.requested[i] = true;
        try {
          const res = await fetch(frameUrl(this.clip, this.width, i), { signal: this.aborter.signal });
          if (!res.ok) continue;
          this.blobs[i] = await res.blob();
          this.loaded++;
          this.onReady?.();
          // a frame the window wants may have just arrived
          if (Math.abs(i - this.at) <= 96) this.want(this.at, this.dir);
        } catch {
          return;
        }
      }
    };
    await Promise.all(Array.from({ length: this.light ? 4 : 6 }, worker));
  }

  /**
   * Keeps frames around `at` decoded: every frame close by (more ahead in the scroll direction), and
   * further out every 4th, then every 8th, so a fast flick always lands near a ready frame instead of
   * stalling on an old one. Everything else is freed.
   */
  want(at: number, dir: 1 | -1) {
    this.at = at;
    this.dir = dir;
    const n = this.clip.frames;
    const keep = new Set<number>();
    const add = (from: number, to: number, step: number) => {
      for (let r = from; r <= to; r += step) {
        const a = at + r * dir;
        const b = at - r * dir;
        if (a >= 0 && a < n) keep.add(a - (a % step));
        if (r <= to / 3 && b >= 0 && b < n) keep.add(b - (b % step));
      }
    };
    if (this.light) {
      add(0, 8, 1);
      add(12, 40, 4);
      add(48, 80, 8);
    } else {
      add(0, 12, 1);
      add(16, 48, 4);
      add(56, 96, 8);
    }
    for (const [i, d] of this.ready)
      if (!keep.has(i)) {
        release(d);
        this.ready.delete(i);
      }
    // nearest first
    const order = [...keep].sort((x, y) => Math.abs(x - at) - Math.abs(y - at));
    for (const i of order) {
      if (this.ready.has(i) || this.decoding.has(i)) continue;
      const blob = this.blobs[i];
      if (!blob) continue;
      if (this.decoding.size >= (this.light ? 2 : 4)) break;
      this.decoding.add(i);
      decode(blob)
        .then((d) => {
          this.decoding.delete(i);
          if (this.disposed) return release(d);
          this.ready.set(i, d);
          this.onReady?.();
          // keep filling the window while the scroll rests
          this.want(this.at, this.dir);
        })
        .catch(() => this.decoding.delete(i));
    }
  }

  /** The decoded frame at `i` if it is ready. */
  get(i: number): Drawable | undefined {
    return this.ready.get(i);
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
