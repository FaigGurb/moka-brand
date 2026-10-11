"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { createBeanGeometry, roastColor, seeded } from "@/lib/bean";
import { BeanPush } from "@/lib/beanPhysics";
import { pointer, pointerNDC } from "@/lib/pointer";

/**
 * A light layer of roasted beans over the whole page. They drift, follow the scroll with
 * depth parallax, lean gently towards the pointer and get pushed away by it (finger on phones).
 */
type Props = { touch: boolean; active: boolean };

const CAM_Z = 10;
const FOV = 30;
const HALF = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

function Field({ touch }: { touch: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { size, gl } = useThree();
  const COUNT = touch ? 7 : 12;
  const geo = useMemo(() => createBeanGeometry("low"), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.38, metalness: 0.05 }), []);
  const push = useMemo(() => new BeanPush(COUNT), [COUNT]);

  const beans = useMemo(() => {
    const rnd = seeded(41);
    return Array.from({ length: COUNT }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const z = -2.5 + rnd() * 4.5;
      return {
        // keep to the margins: 0.8..1.1 of the half-width (partly off-screen), mirrored left/right
        u: side * (0.8 + rnd() * 0.3),
        y: (rnd() * 2 - 1) * 1.1, // in half-heights; wraps
        z,
        depth: (z + 2.5) / 4.5, // 0 far … 1 near
        rot: new THREE.Euler(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28),
        spin: new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.7),
        s: 0.075 + rnd() * 0.05,
        ph: rnd() * 6.28,
        roast: 0.5 + rnd() * 0.45,
        a: 0,
      };
    });
  }, [COUNT]);

  useEffect(() => {
    const c = new THREE.Color();
    beans.forEach((b, i) => mesh.current?.setColorAt(i, roastColor(b.roast, c)));
    if (mesh.current?.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [beans]);
  useEffect(() => () => (geo.dispose(), mat.dispose()), [geo, mat]);

  const lastScroll = useRef<number | null>(null);
  const scrollVel = useRef(0);
  const lean = useRef(new THREE.Vector2());
  const tmp = useMemo(() => ({ v: new THREE.Vector3(), p: new THREE.Vector3(), pv: new THREE.Vector3(), o: new THREE.Vector3(), e: new THREE.Euler(), q: new THREE.Quaternion(), s: new THREE.Vector3(), m: new THREE.Matrix4(), n: new THREE.Vector2() }), []);

  useFrame((state, rawDelta) => {
    const m = mesh.current;
    if (!m) return;
    const dt = Math.min(rawDelta, 1 / 20);
    const t = state.clock.elapsedTime;
    const aspect = size.width / size.height;

    // scroll delta in "half-heights" (screen units); beans travel with parallax by depth
    const sy = window.scrollY;
    let dScroll = lastScroll.current === null ? 0 : (sy - lastScroll.current) / (size.height / 2);
    // after the layer was paused (or an anchor jump) skip the jump instead of teleporting beans
    if (Math.abs(dScroll) > 1.2) dScroll = 0;
    lastScroll.current = sy;
    scrollVel.current += (dScroll / Math.max(dt, 1e-3) - scrollVel.current) * 0.2;

    const ndc = pointerNDC(gl.domElement);
    // soft follow: the whole field leans towards the pointer
    lean.current.lerp(ndc ? tmp.n.set(ndc.x, ndc.y) : tmp.n.set(0, 0), 0.04);
    const burst = push.tapped(pointer.tapped);

    beans.forEach((b, i) => {
      const hh = HALF * (CAM_Z - b.z);
      const hw = hh * aspect;
      b.y += dScroll * (0.35 + b.depth * 0.9);
      // wrap vertically with a margin so beans re-enter off-screen
      if (b.y > 1.25) b.y -= 2.5;
      if (b.y < -1.25) b.y += 2.5;
      tmp.v.set(
        b.u * hw + Math.sin(t * 0.3 + b.ph) * 0.12 + lean.current.x * (0.1 + b.depth * 0.25),
        b.y * hh + Math.sin(t * 0.42 + b.ph * 1.7) * 0.15 + lean.current.y * (0.06 + b.depth * 0.15),
        b.z,
      );
      if (ndc) {
        tmp.p.set(ndc.x * hw, ndc.y * hh, b.z);
        tmp.pv.set(ndc.vx * hw, ndc.vy * hh, 0);
      }
      push.apply(i, tmp.v, ndc ? tmp.p : null, ndc ? tmp.pv : null, touch ? 1.1 : 0.95, dt, burst);
      tmp.v.add(push.offset(i, tmp.o));

      b.a += dt * (1 + Math.abs(scrollVel.current) * 0.6 + push.spin[i] * 4);
      tmp.e.set(b.rot.x + b.a * b.spin.x, b.rot.y + b.a * b.spin.y, b.rot.z + b.a * b.spin.z + push.off[i * 3 + 2]);
      tmp.q.setFromEuler(tmp.e);
      tmp.s.setScalar(b.s);
      m.setMatrixAt(i, tmp.m.compose(tmp.v, tmp.q, tmp.s));
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[geo, mat, COUNT]} frustumCulled={false} />;
}

export default function BeanFieldScene({ touch, active }: Props) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={touch ? 1 : [1, 1.5]}
      camera={{ position: [0, 0, CAM_Z], fov: FOV }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 6]} intensity={2} color="#fff4e6" />
      <directionalLight position={[-5, -2, 3]} intensity={0.7} color="#c89b6d" />
      <Field touch={touch} />
    </Canvas>
  );
}
