/**
 * Small 2D-canvas effects that bring the photoreal stills to life: steam and smoke, falling
 * grounds, a pouring stream, drips with ripples and bursting shards. Each effect draws into its
 * own canvas over a region of the photo (coordinates in that region's pixels), so the cost stays
 * proportional to what moves. No libraries, no WebGL.
 */

export type FxKind = "steam" | "smoke" | "grains" | "stream" | "drip" | "shards";

export type FxSpec = {
  kind: FxKind;
  /** region of the photo the canvas covers: x, y, w, h as fractions of the image */
  region: [number, number, number, number];
  /** source point, as fractions of the region */
  from?: [number, number];
  /** end point (stream, drip, grains landing), as fractions of the region */
  to?: [number, number];
  /** width of the source as a fraction of the region (steam, grains) */
  spread?: number;
  intensity?: number;
};

export type Fx = { step: (g: CanvasRenderingContext2D, w: number, h: number, dt: number, t: number) => void };

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

function puff(rgb: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.45, `rgba(${rgb},0.45)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}

/** Rising, curling vapour (steam: warm white; smoke: thin and grey). */
function vapour(spec: FxSpec, lite: boolean, smoke: boolean): Fx {
  const tex = puff(smoke ? "200,190,180" : "255,244,230");
  const ps: { x: number; y: number; age: number; life: number; seed: number; drift: number }[] = [];
  const rate = (smoke ? 9 : 16) * (lite ? 0.6 : 1) * (spec.intensity ?? 1);
  let acc = 0;
  const [fx, fy] = spec.from ?? [0.5, 0.95];
  const spread = spec.spread ?? 0.15;
  return {
    step(g, w, h, dt, t) {
      acc += rate * dt;
      while (acc > 1) {
        acc--;
        ps.push({ x: (fx + rnd(-spread, spread) / 2) * w, y: fy * h, age: 0, life: rnd(2.6, 4.2), seed: rnd(0, 6.28), drift: rnd(-1, 1) });
      }
      g.clearRect(0, 0, w, h);
      g.globalCompositeOperation = "screen";
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.age += dt;
        if (p.age > p.life) {
          ps.splice(i, 1);
          continue;
        }
        const k = p.age / p.life;
        p.y -= h * (smoke ? 0.16 : 0.2) * dt * (1 - k * 0.5);
        p.x += (Math.sin(t * 0.9 + p.seed + k * 4) * 0.035 + p.drift * 0.01) * w * dt;
        const r = w * (smoke ? 0.04 + k * 0.16 : 0.05 + k * 0.22);
        const a = Math.min(1, p.age / 0.5) * (1 - k) * (smoke ? 0.1 : 0.13) * (spec.intensity ?? 1);
        g.globalAlpha = a;
        g.drawImage(tex, p.x - r, p.y - r, r * 2, r * 2);
      }
      g.globalAlpha = 1;
      g.globalCompositeOperation = "source-over";
    },
  };
}

/** A stream of grounds falling onto a pile; a few grains bounce off and scatter. */
function grains(spec: FxSpec, lite: boolean): Fx {
  const ps: { x: number; y: number; vx: number; vy: number; s: number; c: string; bounced: boolean; life: number }[] = [];
  const cols = ["#d08a45", "#a8622c", "#e8a35c", "#7a4220", "#f2b878"];
  const [fx, fy] = spec.from ?? [0.5, 0];
  const [, ty] = spec.to ?? [0.5, 0.75];
  const spread = spec.spread ?? 0.06;
  const rate = (lite ? 140 : 300) * (spec.intensity ?? 1);
  let acc = 0;
  return {
    step(g, w, h, dt) {
      acc += rate * dt;
      while (acc > 1 && ps.length < (lite ? 380 : 800)) {
        acc--;
        const off = (Math.random() + Math.random() - 1) * spread * w;
        ps.push({ x: fx * w + off, y: fy * h + rnd(-0.02, 0.04) * h, vx: rnd(-0.01, 0.01) * w, vy: rnd(0.25, 0.4) * h, s: rnd(0.8, 2.4), c: cols[(Math.random() * cols.length) | 0], bounced: false, life: 0 });
      }
      acc = Math.min(acc, 2);
      g.clearRect(0, 0, w, h);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life += dt;
        p.vy += h * 0.9 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const floor = ty * h + Math.abs(p.x - fx * w) * 0.35;
        if (p.y > floor) {
          if (!p.bounced && Math.random() < 0.18) {
            p.bounced = true;
            p.y = floor;
            p.vy = -p.vy * rnd(0.15, 0.3);
            p.vx = rnd(-1, 1) * w * 0.12;
          } else {
            ps.splice(i, 1);
            continue;
          }
        }
        g.globalAlpha = p.bounced ? Math.max(0, 1 - p.life) : 0.95;
        g.fillStyle = p.c;
        g.fillRect(p.x, p.y, p.s, p.s * (p.bounced ? 1 : 1.8));
      }
      g.globalAlpha = 1;
    },
  };
}

/** A thin pouring stream: a soft water column with highlights flowing down it, and splashes. */
function stream(spec: FxSpec, lite: boolean): Fx {
  const [ax, ay] = spec.from ?? [0.5, 0];
  const [bx, by] = spec.to ?? [0.5, 1];
  const drops: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
  return {
    step(g, w, h, dt, t) {
      g.clearRect(0, 0, w, h);
      const x0 = ax * w;
      const y0 = ay * h;
      const x1 = bx * w;
      const y1 = by * h;
      const path = () => {
        g.beginPath();
        g.moveTo(x0, y0);
        const n = 12;
        for (let i = 1; i <= n; i++) {
          const k = i / n;
          const wob = Math.sin(t * 9 + k * 14) * w * 0.004 * k;
          // a falling stream bends slightly as it accelerates
          g.lineTo(x0 + (x1 - x0) * k * k + wob, y0 + (y1 - y0) * k);
        }
      };
      g.lineCap = "round";
      path();
      g.strokeStyle = "rgba(255,236,210,0.16)";
      g.lineWidth = Math.max(2, w * 0.012);
      g.stroke();
      path();
      g.setLineDash([h * 0.02, h * 0.05]);
      g.lineDashOffset = -t * h * 0.9;
      g.strokeStyle = "rgba(255,250,240,0.55)";
      g.lineWidth = Math.max(1, w * 0.004);
      g.stroke();
      g.setLineDash([]);
      // splashes where it lands
      if (Math.random() < (lite ? 0.35 : 0.7)) drops.push({ x: x1, y: y1, vx: rnd(-1, 1) * w * 0.12, vy: -rnd(0.05, 0.16) * h, life: 0 });
      g.fillStyle = "rgba(255,240,220,0.7)";
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.life += dt;
        d.vy += h * 1.2 * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (d.life > 0.5) {
          drops.splice(i, 1);
          continue;
        }
        g.globalAlpha = 1 - d.life * 2;
        g.fillRect(d.x, d.y, 1.5, 1.5);
      }
      g.globalAlpha = 1;
    },
  };
}

/** Drops falling from the filter into the coffee, each leaving a ripple. */
function drip(spec: FxSpec): Fx {
  const [ax, ay] = spec.from ?? [0.5, 0];
  const [, by] = spec.to ?? [0.5, 1];
  let next = 0.3;
  const drops: { y: number; v: number }[] = [];
  const rings: { age: number }[] = [];
  return {
    step(g, w, h, dt) {
      g.clearRect(0, 0, w, h);
      next -= dt;
      if (next <= 0) {
        next = rnd(0.9, 1.6);
        drops.push({ y: ay * h, v: 0 });
      }
      const x = ax * w;
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.v += h * 1.6 * dt;
        d.y += d.v * dt;
        if (d.y >= by * h) {
          drops.splice(i, 1);
          rings.push({ age: 0 });
          continue;
        }
        const len = Math.min(h * 0.04, 2 + d.v * 0.02);
        const grad = g.createLinearGradient(x, d.y - len, x, d.y);
        grad.addColorStop(0, "rgba(120,50,20,0)");
        grad.addColorStop(1, "rgba(200,110,60,0.95)");
        g.fillStyle = grad;
        g.beginPath();
        g.ellipse(x, d.y - len / 2, Math.max(1.2, w * 0.006), len / 2, 0, 0, Math.PI * 2);
        g.fill();
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.age += dt;
        if (r.age > 1.4) {
          rings.splice(i, 1);
          continue;
        }
        const k = r.age / 1.4;
        g.strokeStyle = `rgba(255,190,140,${0.45 * (1 - k)})`;
        g.lineWidth = 1;
        g.beginPath();
        g.ellipse(x, by * h, w * (0.02 + k * 0.22), h * (0.004 + k * 0.03), 0, 0, Math.PI * 2);
        g.stroke();
      }
    },
  };
}

/** Fragments and chaff drifting out from the cracked bean. */
function shards(spec: FxSpec, lite: boolean): Fx {
  const [cx, cy] = spec.from ?? [0.5, 0.5];
  const ps: { x: number; y: number; vx: number; vy: number; r: number; rot: number; vr: number; s: number; age: number; life: number; chaff: boolean }[] = [];
  let acc = 0;
  return {
    step(g, w, h, dt) {
      acc += (lite ? 10 : 22) * dt;
      while (acc > 1) {
        acc--;
        const a = rnd(0, Math.PI * 2);
        const sp = rnd(0.04, 0.12);
        ps.push({ x: cx * w + Math.cos(a) * w * 0.08, y: cy * h + Math.sin(a) * h * 0.12, vx: Math.cos(a) * sp * w, vy: Math.sin(a) * sp * h, r: 0, rot: rnd(0, 6), vr: rnd(-2, 2), s: rnd(2, 6), age: 0, life: rnd(2.5, 4.5), chaff: Math.random() < 0.3 });
      }
      g.clearRect(0, 0, w, h);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.age += dt;
        if (p.age > p.life) {
          ps.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        const k = p.age / p.life;
        g.globalAlpha = Math.min(1, p.age * 2) * (1 - k);
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.rot);
        g.fillStyle = p.chaff ? "rgba(225,200,170,0.8)" : "#5a2d14";
        g.fillRect(-p.s / 2, -p.s / 3, p.s, (p.s * 2) / 3);
        if (!p.chaff) {
          g.fillStyle = "rgba(255,170,90,0.6)";
          g.fillRect(p.s / 4, -p.s / 3, p.s / 4, (p.s * 2) / 3);
        }
        g.restore();
      }
      g.globalAlpha = 1;
    },
  };
}

export function createFx(spec: FxSpec, lite: boolean): Fx {
  switch (spec.kind) {
    case "steam":
      return vapour(spec, lite, false);
    case "smoke":
      return vapour(spec, lite, true);
    case "grains":
      return grains(spec, lite);
    case "stream":
      return stream(spec, lite);
    case "drip":
      return drip(spec);
    case "shards":
      return shards(spec, lite);
  }
}
