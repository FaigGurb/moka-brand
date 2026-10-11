import * as THREE from "three";

/**
 * A coffee bean built procedurally from a sphere: flattened into an oval and given the
 * centre crease on its flat side. Length is 2 units along Y; scale per instance.
 */
export function createBeanGeometry(detail: "high" | "low" = "high") {
  const g = new THREE.SphereGeometry(1, detail === "high" ? 32 : 18, detail === "high" ? 20 : 12);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const { x, y, z } = v;
    let nx = x * 0.66;
    let nz = z * 0.48;
    // flat side + crease
    if (z > 0) {
      nz *= 0.72;
      const along = Math.sqrt(Math.max(0, 1 - y * y));
      nz -= 0.2 * Math.exp(-Math.pow(x / 0.11, 2)) * along;
      // slight S-curve of the crease
      nx += 0.03 * Math.sin(y * 3) * along;
    }
    pos.setXYZ(i, nx, y, nz);
  }
  g.computeVertexNormals();
  return g;
}

/** Roast colour for t in 0..1: green bean → light → medium → dark. */
const STOPS = ["#8c9a5b", "#c08a55", "#8a5a3b", "#4a2e1d"].map((c) => new THREE.Color(c));
export function roastColor(t: number, out = new THREE.Color()) {
  const x = THREE.MathUtils.clamp(t, 0, 1) * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(x));
  return out.copy(STOPS[i]).lerp(STOPS[i + 1], x - i);
}

/** Small deterministic random generator so every visit looks the same. */
export function seeded(seed = 7) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
