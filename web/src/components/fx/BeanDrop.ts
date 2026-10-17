/**
 * "Drop a bean": a small toy in the hero. Each call drops photoreal beans (the hero's own bean
 * sprites, public/cinema/beans-sprites.webp) from the top of the screen; they fall, bounce and
 * settle on the bottom edge, then fade. The full-screen canvas exists only while beans are on
 * screen and never takes pointer events. Nothing happens for reduced motion.
 */

import { sound } from "@/lib/sound";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const CELL = 160;
const GRAVITY = 2600; // px/s²
const LIFE = 4.2; // seconds before a settled bean fades
const FADE = 0.7;

type Bean = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; s: number; cell: number; age: number };

let canvas: HTMLCanvasElement | null = null;
let g: CanvasRenderingContext2D | null = null;
let img: HTMLImageElement | null = null;
let ready = false;
let raf = 0;
let last = 0;
const beans: Bean[] = [];

function setup() {
  if (canvas) return;
  img = new Image();
  img.src = `${BASE}/cinema/beans-sprites.webp`;
  img.decode().then(() => (ready = true), () => {});
  canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:45";
  g = canvas.getContext("2d");
}

function size() {
  if (!canvas) return;
  const k = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * k);
  canvas.height = Math.round(window.innerHeight * k);
  g?.setTransform(k, 0, 0, k, 0, 0);
}

function frame(now: number) {
  const dt = Math.min(0.033, (now - (last || now)) / 1000);
  last = now;
  if (!g || !canvas) return;
  const W = window.innerWidth;
  const floor = window.innerHeight - 6;
  g.clearRect(0, 0, W, window.innerHeight);
  for (let i = beans.length - 1; i >= 0; i--) {
    const b = beans[i];
    b.age += dt;
    b.vy += GRAVITY * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.rot += b.vr * dt;
    // the floor: bounce, lose energy, roll to a stop
    if (b.y + b.s * 0.32 > floor) {
      b.y = floor - b.s * 0.32;
      if (b.vy > 700) sound.tok(0.8 + Math.random() * 0.5);
      b.vy = Math.abs(b.vy) > 160 ? -b.vy * 0.38 : 0;
      b.vx *= 0.82;
      b.vr = b.vx / (b.s * 0.4);
    }
    if (b.x < b.s / 2 || b.x > W - b.s / 2) b.vx = -b.vx * 0.5;
    const fade = b.age > LIFE ? 1 - (b.age - LIFE) / FADE : 1;
    if (fade <= 0) {
      beans.splice(i, 1);
      continue;
    }
    if (!ready || !img) continue;
    g.globalAlpha = fade;
    g.save();
    g.translate(b.x, b.y);
    g.rotate(b.rot);
    g.drawImage(img, b.cell * CELL, 0, CELL, CELL, -b.s / 2, -b.s / 2, b.s, b.s);
    g.restore();
  }
  g.globalAlpha = 1;
  if (beans.length) raf = requestAnimationFrame(frame);
  else {
    raf = 0;
    canvas.remove();
    window.removeEventListener("resize", size);
  }
}

/** Drops `n` beans, a few milliseconds apart, over the width of the screen. */
export function dropBeans(n = 1) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  setup();
  if (!canvas) return;
  if (!canvas.isConnected) {
    document.body.appendChild(canvas);
    size();
    window.addEventListener("resize", size);
  }
  const W = window.innerWidth;
  const small = W < 768;
  for (let i = 0; i < n; i++) {
    const s = (small ? 46 : 64) + Math.random() * (small ? 26 : 40);
    beans.push({
      x: n === 1 ? W * (0.35 + Math.random() * 0.3) : s + Math.random() * (W - 2 * s),
      y: -s - i * (small ? 26 : 34) - Math.random() * 40,
      vx: (Math.random() - 0.5) * 160,
      vy: 0,
      rot: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 8,
      s,
      cell: (Math.random() * 3) | 0,
      age: 0,
    });
  }
  // keep the toy light: at most 60 beans at once
  if (beans.length > 60) beans.splice(0, beans.length - 60);
  if (!raf) {
    last = 0;
    raf = requestAnimationFrame(frame);
  }
}
