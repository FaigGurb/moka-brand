"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { createBeanGeometry, roastColor, seeded } from "@/lib/bean";
import { PHASES } from "./phases";

/**
 * "From bean to cup": beans float, roast (green → dark), spiral into a Chemex and turn into
 * grounds, then coffee drips into the lower chamber until it reaches the brand's signature line.
 * Everything is driven by one scroll progress value (0..1); time only adds idle motion.
 */

type Props = {
  progress: MutableRefObject<number>;
  reducedMotion: boolean;
  touch: boolean;
  active: boolean;
  onReady?: () => void;
};

const clamp = THREE.MathUtils.clamp;
const sstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

const DRY = new THREE.Color("#6b442b");
const WET = new THREE.Color("#2b1d15");

// Chemex silhouette (radius, height) from the base up. The waist sits at y = 1.36.
const PROFILE: [number, number][] = [
  [0, 0], [0.78, 0], [0.9, 0.04], [0.95, 0.14], [0.93, 0.3], [0.76, 0.62], [0.52, 0.98],
  [0.31, 1.26], [0.25, 1.36], [0.3, 1.46], [0.55, 1.78], [0.84, 2.16], [1.0, 2.42], [1.05, 2.5],
];
const WAIST = 1.36;
const TOP = 2.5;
/** The signature line: where the finished brew stops (about 60% of the lower chamber). */
const LINE_Y = 0.82;
const FILTER_APEX = 1.42;
const FILTER_SLOPE = 1.15;
const PILE_H = 0.4;

function radiusAt(y: number) {
  for (let i = 1; i < PROFILE.length; i++) {
    const [r1, y1] = PROFILE[i];
    const [r0, y0] = PROFILE[i - 1];
    if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / Math.max(1e-6, y1 - y0);
  }
  return PROFILE[PROFILE.length - 1][0];
}

function dotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#fff";
  g.beginPath();
  g.arc(32, 32, 28, 0, Math.PI * 2);
  g.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function softTexture(rgb: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, `rgba(${rgb},0.9)`);
  grad.addColorStop(0.4, `rgba(${rgb},0.3)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

type Bean = {
  pos: THREE.Vector3; // normalised -1..1 spawn position
  rot: THREE.Euler;
  spin: THREE.Vector3;
  scale: number;
  phase: number;
  roastJitter: number;
  grindAt: number; // 0..1 order inside the grind phase; > 1 = keeps floating
  angle: number;
};

function Story({ progress, reducedMotion, touch }: Omit<Props, "active" | "onReady">) {
  const root = useRef<THREE.Group>(null);
  const beans = useRef<THREE.InstancedMesh>(null);
  const grounds = useRef<THREE.Points>(null);
  const liquid = useRef<THREE.Mesh>(null);
  const surface = useRef<THREE.Mesh>(null);
  const pour = useRef<THREE.Mesh>(null);
  const drip = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ringGlow = useRef<THREE.Sprite>(null);
  const heat = useRef<THREE.PointLight>(null);
  const steam = useRef<(THREE.Sprite | null)[]>([]);
  const smooth = useRef(reducedMotion ? 1 : 0);
  const lastGrind = useRef(-1);
  const lastRoast = useRef(-1);
  const { viewport, camera, pointer } = useThree();

  const BEANS = touch ? 42 : 90;
  const GROUNDS = touch ? 700 : 1800;

  const beanGeo = useMemo(() => createBeanGeometry(touch ? "low" : "high"), [touch]);
  const beanMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0.05 }), []);

  const data = useMemo<Bean[]>(() => {
    const rnd = seeded(11);
    return Array.from({ length: BEANS }, (_, i) => {
      let x = rnd() * 2 - 1;
      const z = rnd() * 2 - 1;
      // keep the centre (the Chemex) clear
      if (Math.abs(x) < 0.38 && z > -0.3) x = Math.sign(x || 1) * (0.38 + rnd() * 0.5);
      return {
        pos: new THREE.Vector3(x, rnd() * 2 - 1, z),
        rot: new THREE.Euler(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28),
        spin: new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.9),
        scale: 0.12 + rnd() * 0.06,
        phase: rnd() * 6.28,
        roastJitter: (rnd() - 0.5) * 0.14,
        // about 70% of the beans get ground; the rest keep the scene alive
        grindAt: i % 10 < 7 ? rnd() * 0.55 : 2,
        angle: rnd() * 6.28,
      };
    });
  }, [BEANS]);

  // Grounds: start just above the rim, land in a cone-shaped pile inside the paper filter.
  const groundsData = useMemo(() => {
    const rnd = seeded(23);
    const start = new Float32Array(GROUNDS * 3);
    const end = new Float32Array(GROUNDS * 3);
    for (let i = 0; i < GROUNDS; i++) {
      const h = PILE_H * Math.cbrt(rnd());
      const r = FILTER_SLOPE * h * Math.sqrt(rnd()) * 0.88;
      const a = rnd() * Math.PI * 2;
      end.set([Math.cos(a) * r, FILTER_APEX + h, Math.sin(a) * r], i * 3);
      start.set([Math.cos(a) * r * 0.25, TOP + 0.25 + rnd() * 0.3, Math.sin(a) * r * 0.25], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(end), 3));
    geo.setDrawRange(0, 0);
    return { start, end, geo };
  }, [GROUNDS]);

  const tex = useMemo(() => ({ dot: dotTexture(), steam: softTexture("245,241,234"), glow: softTexture("255,226,166") }), []);
  const groundsMat = useMemo(
    () => new THREE.PointsMaterial({ size: touch ? 0.06 : 0.05, map: tex.dot, alphaTest: 0.5, color: "#6b442b" }),
    [tex, touch],
  );

  const clip = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []);
  const geos = useMemo(() => {
    const outline = PROFILE.map(([r, y]) => new THREE.Vector2(r, y));
    const lower = PROFILE.filter(([, y]) => y <= WAIST).map(([r, y]) => new THREE.Vector2(r * 0.93, Math.max(0.03, y)));
    const filter = [
      new THREE.Vector2(0.001, FILTER_APEX),
      new THREE.Vector2(FILTER_SLOPE * 0.4, FILTER_APEX + 0.4),
      new THREE.Vector2(FILTER_SLOPE * 0.8, FILTER_APEX + 0.8),
      new THREE.Vector2(0.98, TOP + 0.12),
    ];
    const pourGeo = new THREE.CylinderGeometry(0.016, 0.016, 1, 8, 1, true);
    pourGeo.translate(0, -0.5, 0); // pivot at the top so scaling grows the stream downwards
    const dripGeo = new THREE.CylinderGeometry(0.01, 0.01, 1, 6, 1, true);
    dripGeo.translate(0, -0.5, 0);
    return {
      glass: new THREE.LatheGeometry(outline, touch ? 40 : 72),
      liquid: new THREE.LatheGeometry(lower, touch ? 40 : 72),
      filter: new THREE.LatheGeometry(filter, touch ? 32 : 56),
      surface: new THREE.CircleGeometry(1, touch ? 40 : 72),
      ring: new THREE.TorusGeometry(radiusAt(LINE_Y) + 0.012, 0.012, 8, 96),
      pour: pourGeo,
      drip: dripGeo,
    };
  }, [touch]);

  const mats = useMemo(
    () => ({
      glass: new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        roughness: 0.06,
        metalness: 0,
        clearcoat: 1,
        transparent: true,
        opacity: 0.13,
        side: THREE.DoubleSide,
        depthWrite: false,
        envMapIntensity: 1.6,
      }),
      liquid: new THREE.MeshPhysicalMaterial({ color: "#2e180c", roughness: 0.18, clearcoat: 1, clippingPlanes: [clip] }),
      surface: new THREE.MeshPhysicalMaterial({ color: "#4a2a17", roughness: 0.12, clearcoat: 1, emissive: "#3b1f10", emissiveIntensity: 0.3 }),
      filter: new THREE.MeshStandardMaterial({ color: "#f5f1ea", roughness: 0.9, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false }),
      wood: new THREE.MeshStandardMaterial({ color: "#a8643a", roughness: 0.62, side: THREE.DoubleSide }),
      tie: new THREE.MeshStandardMaterial({ color: "#c9a882", roughness: 0.8 }),
      water: new THREE.MeshBasicMaterial({ color: "#e9e4dc", transparent: true, opacity: 0, depthWrite: false }),
      dripM: new THREE.MeshBasicMaterial({ color: "#3b2416", transparent: true, opacity: 0 }),
      ring: new THREE.MeshBasicMaterial({ color: "#ffe2a6", transparent: true, opacity: 0, toneMapped: false }),
    }),
    [clip],
  );

  useEffect(
    () => () => {
      beanGeo.dispose();
      beanMat.dispose();
      groundsData.geo.dispose();
      groundsMat.dispose();
      Object.values(geos).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
      Object.values(tex).forEach((t) => t.dispose());
    },
    [beanGeo, beanMat, groundsData, groundsMat, geos, mats, tex],
  );

  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const e = useMemo(() => new THREE.Euler(), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const s3 = useMemo(() => new THREE.Vector3(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const spiral = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const t = reducedMotion ? 0 : state.clock.elapsedTime;
    const target = reducedMotion ? 1 : progress.current;
    smooth.current += (target - smooth.current) * (1 - Math.pow(0.002, delta));
    const p = smooth.current;

    // ---- layout: landscape puts the Chemex in the right column, portrait below the captions
    const landscape = viewport.aspect > 1.05;
    const scale = landscape ? Math.min(0.95, viewport.height / 5.6) : Math.min(1, viewport.width / 3.4, (viewport.height * 0.44) / 2.5);
    const spreadX = landscape ? Math.min(2.9, viewport.width / 2 / scale) : (viewport.width / 2 / scale) * 0.95;
    if (root.current) {
      root.current.scale.setScalar(scale);
      root.current.position.set(
        landscape && viewport.width > 7 ? viewport.width * 0.24 : 0,
        landscape ? 0.05 * scale : -viewport.height * 0.1,
        0,
      );
    }
    // gentle camera drift: mouse on desktop, slow sway on touch
    const cx = reducedMotion ? 0 : touch ? Math.sin(t * 0.25) * 0.35 : pointer.x * 0.5;
    const cy = reducedMotion ? 0 : touch ? Math.cos(t * 0.2) * 0.12 : pointer.y * 0.25;
    camera.position.x += (cx - camera.position.x) * 0.05;
    camera.position.y += (0.9 + cy - camera.position.y) * 0.05;
    camera.lookAt(root.current ? root.current.position.x * 0.6 : 0, 0.1, 0);

    const roast = sstep(PHASES.roast[0], PHASES.roast[1], p) * 0.92;
    const grind = clamp((p - PHASES.grind[0]) / (PHASES.grind[1] - PHASES.grind[0]), 0, 1);
    const brew = clamp((p - PHASES.brew[0]) / (PHASES.brew[1] - PHASES.brew[0]), 0, 1);

    // ---- beans
    const mesh = beans.current;
    if (mesh) {
      const roastChanged = Math.abs(roast - lastRoast.current) > 0.002;
      const topY = TOP + 0.15 - 1.3; // rim height in the root group's space (Chemex sits at y -1.3)
      data.forEach((b, i) => {
        const gi = b.grindAt > 1 ? 0 : clamp((grind - b.grindAt) / 0.42, 0, 1);
        // idle float
        const fx = b.pos.x * spreadX + Math.sin(t * 0.4 + b.phase) * 0.12;
        const fy = b.pos.y * 1.9 + 0.35 + Math.sin(t * 0.55 + b.phase * 1.7) * 0.18;
        const fz = b.pos.z * 2 - 0.6 + Math.cos(t * 0.35 + b.phase) * 0.1;
        v.set(fx, fy, fz);
        // roasting makes the beans tremble a little
        const shake = Math.sin(Math.PI * clamp((p - 0.2) / 0.22, 0, 1)) * 0.025;
        if (shake > 0) v.x += Math.sin(t * 40 + i) * shake;
        if (gi > 0) {
          const a = b.angle + gi * 9;
          const r = (1 - gi) * 1.15 + 0.04;
          spiral.set(Math.cos(a) * r, topY + 0.7 * (1 - gi) * (1 - gi), Math.sin(a) * r);
          v.lerp(spiral, sstep(0, 0.45, gi));
        }
        const spinBoost = 1 + gi * 6;
        e.set(b.rot.x + t * b.spin.x * spinBoost, b.rot.y + t * b.spin.y * spinBoost, b.rot.z + t * b.spin.z);
        q.setFromEuler(e);
        const sc = b.scale * (1 - sstep(0.72, 1, gi));
        s3.setScalar(Math.max(sc, 1e-4));
        m4.compose(v, q, s3);
        mesh.setMatrixAt(i, m4);
        if (roastChanged) mesh.setColorAt(i, roastColor(roast + b.roastJitter, col));
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (roastChanged && mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
        lastRoast.current = roast;
      }
    }

    // heat glow while roasting
    if (heat.current) heat.current.intensity = 6 * sstep(0.18, 0.3, p) * (1 - sstep(0.36, 0.46, p));

    // ---- grounds fall into the filter in the order they were "ground"
    const pts = grounds.current;
    if (pts && Math.abs(grind - lastGrind.current) > 1e-4) {
      lastGrind.current = grind;
      const attr = groundsData.geo.attributes.position as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      let visible = 0;
      for (let i = 0; i < GROUNDS; i++) {
        const a = 0.12 + (i / GROUNDS) * 0.72;
        const f = clamp((grind - a) / 0.14, 0, 1);
        if (f <= 0) break;
        visible = i + 1;
        const k = f * f;
        for (let c = 0; c < 3; c++) arr[i * 3 + c] = groundsData.start[i * 3 + c] + (groundsData.end[i * 3 + c] - groundsData.start[i * 3 + c]) * k;
      }
      groundsData.geo.setDrawRange(0, visible);
      attr.needsUpdate = true;
    }
    // wet grounds darken during the brew
    groundsMat.color.copy(DRY).lerp(WET, brew);

    // ---- brew: kettle stream, drip through the waist, rising coffee
    const pourOn = sstep(0, 0.08, brew) * (1 - sstep(0.75, 0.9, brew));
    if (pour.current) {
      mats.water.opacity = 0.55 * pourOn;
      pour.current.visible = pourOn > 0.01;
      // shorter kettle stream on portrait screens so it stays clear of the captions
      const from = TOP + (landscape ? 1.6 : 0.85);
      pour.current.position.y = from;
      pour.current.scale.y = (from - (FILTER_APEX + PILE_H)) * sstep(0, 0.1, brew) + 0.001;
    }
    const level = LINE_Y * sstep(0.1, 0.96, brew);
    const dripOn = sstep(0.06, 0.14, brew) * (1 - sstep(0.94, 1, brew));
    if (drip.current) {
      mats.dripM.opacity = dripOn;
      drip.current.visible = dripOn > 0.01;
      drip.current.scale.y = Math.max(0.001, WAIST - 0.05 - level);
    }
    if (liquid.current && surface.current) {
      liquid.current.visible = level > 0.005;
      surface.current.visible = level > 0.005;
      liquid.current.updateWorldMatrix(true, false);
      tmp.set(0, level, 0);
      liquid.current.localToWorld(tmp);
      clip.constant = tmp.y;
      const r = radiusAt(level) * 0.93 * (level < 0.05 ? level / 0.05 : 1);
      surface.current.position.y = level;
      surface.current.scale.setScalar(Math.max(r, 0.001));
    }

    // ---- final: the signature line lights up
    const fin = sstep(0.88, 0.98, p);
    mats.ring.opacity = fin;
    if (ringGlow.current) (ringGlow.current.material as THREE.SpriteMaterial).opacity = fin * (0.75 + Math.sin(t * 2) * 0.1);

    // steam once there is coffee
    steam.current.forEach((sp, i) => {
      if (!sp) return;
      const ph = (t * 0.18 + i / steam.current.length) % 1;
      sp.position.set(Math.sin(t * 0.6 + i * 2) * 0.18, TOP + 0.4 + ph * 1.3, 0.1);
      sp.scale.setScalar(0.5 + ph * 0.7);
      (sp.material as THREE.SpriteMaterial).opacity = sstep(0.8, 0.95, p) * Math.sin(Math.PI * ph) * 0.18;
    });
  });

  return (
    <group ref={root}>
      <instancedMesh ref={beans} args={[beanGeo, beanMat, BEANS]} frustumCulled={false} />
      <pointLight ref={heat} position={[0, 0.6, 1.4]} color="#ff8a3d" intensity={0} distance={8} />
      <group position={[0, -1.3, 0]}>
        <mesh ref={liquid} geometry={geos.liquid} material={mats.liquid} visible={false} />
        <mesh ref={surface} geometry={geos.surface} material={mats.surface} rotation-x={-Math.PI / 2} visible={false} />
        <points ref={grounds} geometry={groundsData.geo} material={groundsMat} frustumCulled={false} />
        <mesh geometry={geos.filter} material={mats.filter} renderOrder={2} />
        <mesh geometry={geos.glass} material={mats.glass} renderOrder={3} />
        {/* wooden collar with a leather tie */}
        <mesh position={[0, WAIST, 0]} material={mats.wood}>
          <cylinderGeometry args={[0.36, 0.31, 0.34, 40, 1, true]} />
        </mesh>
        <mesh position={[0, WAIST, 0]} rotation-x={Math.PI / 2} material={mats.tie}>
          <torusGeometry args={[0.345, 0.012, 8, 48]} />
        </mesh>
        <mesh position={[0.37, WAIST - 0.12, 0.05]} material={mats.wood}>
          <sphereGeometry args={[0.045, 16, 12]} />
        </mesh>
        {/* signature line */}
        <mesh ref={ring} geometry={geos.ring} material={mats.ring} position={[0, LINE_Y, 0]} rotation-x={Math.PI / 2} />
        <sprite ref={ringGlow} position={[0, LINE_Y, 0.3]} scale={[3.4, 0.5, 1]}>
          <spriteMaterial map={tex.glow} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
        <mesh ref={pour} geometry={geos.pour} material={mats.water} position={[0.05, TOP + 1.6, 0]} visible={false} />
        <mesh ref={drip} geometry={geos.drip} material={mats.dripM} position={[0, WAIST - 0.05, 0]} visible={false} />
        {Array.from({ length: 5 }, (_, i) => (
          <sprite
            key={i}
            ref={(el) => {
              steam.current[i] = el;
            }}
          >
            <spriteMaterial map={tex.steam} transparent opacity={0} depthWrite={false} />
          </sprite>
        ))}
      </group>
    </group>
  );
}

export default function BeanStoryScene({ progress, reducedMotion, touch, active, onReady }: Props) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={touch ? [1, 1.5] : [1, 1.75]}
      camera={{ position: [0, 0.9, 7.6], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
        onReady?.();
      }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 5, 4]} intensity={1.8} color="#fff4e6" />
      <directionalLight position={[-4, 1, -2]} intensity={0.8} color="#c89b6d" />
      <pointLight position={[0, 2, 3]} intensity={1.4} distance={9} color="#f2c76e" />
      <Environment resolution={touch ? 64 : 128}>
        <Lightformer intensity={2.2} position={[0, 4, 3]} scale={[8, 1.5, 1]} color="#fff6ea" />
        <Lightformer intensity={1.4} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[1, 5, 1]} color="#ffe2a6" />
        <Lightformer intensity={0.9} position={[5, 0, 1]} rotation-y={-Math.PI / 2} scale={[1, 5, 1]} color="#a8643a" />
      </Environment>
      <Story progress={progress} reducedMotion={reducedMotion} touch={touch} />
    </Canvas>
  );
}
