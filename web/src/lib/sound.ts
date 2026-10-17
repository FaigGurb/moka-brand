/**
 * Optional sound for the site, from the same palette as the games (game/shared/sound.js): Web Audio
 * synthesis plus the brand sound logo (brand-kit/moka-sound-logo.wav). Off until the visitor turns
 * it on; the choice is shared with the games through localStorage 'moka-sound' ('on' / 'off'), but
 * the site plays only on an explicit 'on'. Audio starts from that click, so browsers allow it.
 */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const KEY = "moka-sound";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let logoBuf: AudioBuffer | null = null;
let on = false;
let lastTok = 0;
let unlocking = false;
const listeners = new Set<(on: boolean) => void>();

function read() {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.8;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    master.connect(comp);
    comp.connect(ctx.destination);
    const n = ctx.sampleRate * 2;
    noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    let b = 0;
    for (let i = 0; i < n; i++) {
      b = 0.97 * b + 0.03 * (Math.random() * 2 - 1);
      d[i] = b * 6;
    }
    fetch(`${BASE}/brand-kit/moka-sound-logo.wav`)
      .then((r) => r.arrayBuffer())
      .then((a) => ctx!.decodeAudioData(a))
      .then((buf) => (logoBuf = buf))
      .catch(() => {});
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

const live = () => (on && !document.hidden ? ensure() : null);

export const sound = {
  init() {
    on = read();
    listeners.forEach((f) => f(on));
    // remembered "on" from an earlier visit: audio may only start after a tap or key press
    if (on && !unlocking) {
      unlocking = true;
      const unlock = () => on && ensure();
      for (const ev of ["pointerdown", "keydown", "touchend"]) window.addEventListener(ev, unlock, { passive: true, capture: true });
    }
  },
  get on() {
    return on;
  },
  set(v: boolean) {
    on = v;
    try {
      localStorage.setItem(KEY, v ? "on" : "off");
    } catch {}
    if (v) ensure();
    listeners.forEach((f) => f(on));
  },
  subscribe(f: (on: boolean) => void) {
    listeners.add(f);
    return () => void listeners.delete(f);
  },
  /** a soft pour: band-passed noise rising in pitch, for a film step */
  pour(dur = 1.8) {
    const c = live();
    if (!c || !master || !noiseBuf) return;
    const t = c.currentTime;
    const s = c.createBufferSource();
    const bp = c.createBiquadFilter();
    const g = c.createGain();
    s.buffer = noiseBuf;
    s.loop = true;
    bp.type = "bandpass";
    bp.Q.value = 7;
    bp.frequency.setValueAtTime(320, t);
    bp.frequency.exponentialRampToValueAtTime(900, t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.14, t + dur * 0.3);
    g.gain.linearRampToValueAtTime(0, t + dur);
    s.connect(bp);
    bp.connect(g);
    g.connect(master);
    s.start(t);
    s.stop(t + dur + 0.05);
  },
  /** a short wooden "tok" (a bean landing) */
  tok(pitch = 1) {
    const c = live();
    if (!c || !master) return;
    const t = c.currentTime;
    // twenty beans landing together stay a patter, not a roar
    if (t - lastTok < 0.045) return;
    lastTok = t;
    const f = 520 * pitch;
    const o = c.createOscillator();
    const g = c.createGain();
    o.frequency.setValueAtTime(f * 1.6, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.05);
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + 0.16);
  },
  /** the brand sound logo (pour + glass tink) */
  logo() {
    const c = live();
    if (!c || !master || !logoBuf) return;
    const s = c.createBufferSource();
    s.buffer = logoBuf;
    s.connect(master);
    s.start();
  },
};
