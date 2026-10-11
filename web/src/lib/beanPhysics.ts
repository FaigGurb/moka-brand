import * as THREE from "three";

/**
 * Springy "push" offsets for a set of beans. Each bean has an offset that is kicked away by the
 * pointer (and by taps) and eases back to zero, plus extra spin from the hits.
 */
export class BeanPush {
  readonly off: Float32Array;
  readonly vel: Float32Array;
  readonly spin: Float32Array;
  private lastTap = 0;

  constructor(readonly count: number) {
    this.off = new Float32Array(count * 3);
    this.vel = new Float32Array(count * 3);
    this.spin = new Float32Array(count);
  }

  /** Call once per frame before `apply`; returns true when a new tap happened. */
  tapped(tap: number) {
    if (tap > this.lastTap) {
      const fresh = performance.now() - tap < 120;
      this.lastTap = tap;
      return fresh;
    }
    return false;
  }

  /**
   * @param i bean index
   * @param pos bean position (without offset), same space as `p`
   * @param p pointer position projected to the bean's depth, or null
   * @param pv pointer velocity in the same units per second
   * @param radius influence radius
   * @param burst a tap happened this frame
   */
  apply(i: number, pos: THREE.Vector3, p: THREE.Vector3 | null, pv: THREE.Vector3 | null, radius: number, dt: number, burst = false) {
    const k = i * 3;
    const o = this.off;
    const v = this.vel;
    if (p) {
      const dx = pos.x + o[k] - p.x;
      const dy = pos.y + o[k + 1] - p.y;
      const d = Math.hypot(dx, dy) || 1e-4;
      const r = burst ? radius * 1.8 : radius;
      if (d < r) {
        const fall = 1 - d / r;
        const speed = pv ? Math.min(Math.hypot(pv.x, pv.y), 40) : 0;
        const f = fall * fall * ((burst ? 26 : 2.2) + speed * 0.9);
        v[k] += (dx / d) * f * dt * 10;
        v[k + 1] += (dy / d) * f * dt * 10;
        v[k + 2] += f * dt * (burst ? 6 : 1.5);
        if (pv && !burst) {
          // drag along with the pointer's motion
          v[k] += pv.x * fall * dt * 2.2;
          v[k + 1] += pv.y * fall * dt * 2.2;
        }
        this.spin[i] += f * dt * 3;
      }
    }
    // spring back + damping
    const spring = 2.4;
    const damp = Math.exp(-2.6 * dt);
    for (let c = 0; c < 3; c++) {
      v[k + c] = (v[k + c] - o[k + c] * spring * dt) * damp;
      o[k + c] += v[k + c] * dt;
    }
    this.spin[i] *= Math.exp(-1.2 * dt);
  }

  offset(i: number, out: THREE.Vector3) {
    return out.set(this.off[i * 3], this.off[i * 3 + 1], this.off[i * 3 + 2]);
  }
}

const ray = new THREE.Vector3();

/** Projects NDC onto the plane z = planeZ (world space) for the given camera. */
export function ndcToPlane(ndc: { x: number; y: number }, camera: THREE.Camera, planeZ: number, out: THREE.Vector3) {
  ray.set(ndc.x, ndc.y, 0.5).unproject(camera).sub(camera.position).normalize();
  const t = (planeZ - camera.position.z) / (ray.z || -1e-4);
  return out.copy(camera.position).addScaledVector(ray, t);
}
