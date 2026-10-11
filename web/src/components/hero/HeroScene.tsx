"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { CUT_BOTTOM, CUT_TOP, LETTERS, VIEW_W, halves, type Pt } from "@/lib/logo";

// 1 SVG unit = 0.01 world units; the wordmark is ~6.75 units wide, centred on the cut line.
const S = 0.01;
const CX = VIEW_W / 2;
const CY = (CUT_TOP + CUT_BOTTOM) / 2;
const DEPTH = 0.42;

function toShape(poly: Pt[]) {
  const shape = new THREE.Shape();
  poly.forEach(([x, y], i) => {
    const v = new THREE.Vector2((x - CX) * S, -(y - CY) * S);
    if (i === 0) shape.moveTo(v.x, v.y);
    else shape.lineTo(v.x, v.y);
  });
  shape.closePath();
  return shape;
}

const EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: DEPTH,
  bevelEnabled: true,
  bevelThickness: 0.035,
  bevelSize: 0.022,
  bevelSegments: 4,
  curveSegments: 48,
};

function handleCurve() {
  const p = (x: number, y: number) => new THREE.Vector3((x - CX) * S, -(y - CY) * S, DEPTH / 2);
  const path = new THREE.CurvePath<THREE.Vector3>();
  path.add(new THREE.CubicBezierCurve3(p(384, 20), p(364, 20), p(352, 36), p(352, 54)));
  path.add(new THREE.CubicBezierCurve3(p(352, 54), p(352, 74), p(368, 86), p(386, 86)));
  path.add(new THREE.LineCurve3(p(386, 86), p(393, 94)));
  return path;
}

/** Soft radial glow drawn on a canvas, used as an additive sprite behind the light line. */
function useGlowTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    // Square radial gradient; the plane's non-uniform scale stretches it into a soft ellipse.
    c.width = 256;
    c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, "rgba(255,226,166,0.9)");
    grad.addColorStop(0.35, "rgba(242,199,110,0.35)");
    grad.addColorStop(1, "rgba(242,199,110,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

type Props = {
  progress: MutableRefObject<number>;
  reducedMotion: boolean;
  /** Touch screens have no hover pointer: the wordmark sways on its own instead. */
  touch: boolean;
  onReady?: () => void;
};

function Wordmark({ progress, reducedMotion, touch }: Omit<Props, "onReady">) {
  const group = useRef<THREE.Group>(null);
  const tops = useRef<(THREE.Object3D | null)[]>([]);
  const bottoms = useRef<(THREE.Object3D | null)[]>([]);
  const line = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);
  const start = useRef<number | null>(null);
  const { viewport, size } = useThree();
  const glowTex = useGlowTexture();

  const geos = useMemo(
    () =>
      LETTERS.map((l) => {
        const h = halves(l.poly);
        return {
          id: l.id,
          top: new THREE.ExtrudeGeometry(toShape(h.top), EXTRUDE),
          bottom: new THREE.ExtrudeGeometry(toShape(h.bottom), EXTRUDE),
        };
      }),
    [],
  );
  const handleGeo = useMemo(() => new THREE.TubeGeometry(handleCurve(), 80, 0.04, 16, false), []);

  const ceramic = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#efe8dc",
        roughness: 0.38,
        metalness: 0,
        clearcoat: 0.55,
        clearcoatRoughness: 0.28,
        sheen: 0.2,
      }),
    [],
  );

  // Free GPU memory when the hero unmounts.
  useEffect(
    () => () => {
      geos.forEach((g) => {
        g.top.dispose();
        g.bottom.dispose();
      });
      handleGeo.dispose();
      ceramic.dispose();
      glowTex.dispose();
    },
    [geos, handleGeo, ceramic, glowTex],
  );

  // Fit the wordmark to the viewport width (phones get a smaller, closer composition).
  const fit = Math.min(1.12, (viewport.width * (size.width < 640 ? 0.9 : 0.78)) / 6.9);

  useFrame((state, delta) => {
    if (start.current === null) start.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime;
    const intro = reducedMotion ? 1 : THREE.MathUtils.clamp((t - start.current) / 1.8, 0, 1);
    const p = progress.current;
    const k = 1 - Math.pow(1 - intro, 3);
    const damp = 1 - Math.pow(0.0015, delta);

    // Pointer-driven tilt with eased follow; frozen for reduced motion.
    if (group.current) {
      // Desktop follows the mouse; touch screens get a slow, continuous sway plus a turn as you scroll.
      const tx = reducedMotion ? 0 : touch ? Math.sin(t * 0.5) * 0.08 + p * 0.35 : -state.pointer.y * 0.16 + p * 0.25;
      const ty = reducedMotion ? 0 : touch ? Math.sin(t * 0.35) * 0.32 + p * 0.5 : state.pointer.x * 0.28;
      group.current.rotation.x += (tx - group.current.rotation.x) * damp;
      group.current.rotation.y += (ty - group.current.rotation.y) * damp;
      group.current.position.y = -p * 0.35;
    }

    // Halves: rise in on load, then open along the brand line as the page scrolls.
    const open = p * 0.9;
    geos.forEach((_, i) => {
      const delay = i * 0.12;
      const local = reducedMotion ? 1 : THREE.MathUtils.clamp((t - (start.current ?? 0) - delay) / 1.2, 0, 1);
      const e = 1 - Math.pow(1 - local, 3);
      const float = reducedMotion ? 0 : Math.sin(t * 0.8 + i * 1.3) * 0.025;
      const top = tops.current[i];
      const bot = bottoms.current[i];
      if (top) top.position.y = (1 - e) * 0.9 + open * (0.5 + i * 0.06) + float;
      if (bot) bot.position.y = -(1 - e) * 0.9 - open * (0.5 + i * 0.06) + float;
    });

    // The light line brightens as it is revealed.
    if (line.current) {
      const m = line.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.55 + 0.45 * k + p * 0.3;
      line.current.scale.y = 1 + open * 6;
    }
    if (glow.current) {
      const m = glow.current.material as THREE.MeshBasicMaterial;
      m.opacity = (0.35 + p * 0.9) * k;
      glow.current.scale.set(1, 1 + open * 10, 1);
    }
  });

  return (
    <group ref={group} scale={fit}>
      {geos.map((g, i) => (
        <group key={g.id}>
          <group
            ref={(el) => {
              tops.current[i] = el;
            }}
          >
            <mesh geometry={g.top} material={ceramic} />
            {/* The Chemex handle travels with the upper half of the K. */}
            {g.id === "K" && <mesh geometry={handleGeo} material={ceramic} />}
          </group>
          <group
            ref={(el) => {
              bottoms.current[i] = el;
            }}
          >
            <mesh geometry={g.bottom} material={ceramic} />
          </group>
        </group>
      ))}
      <mesh ref={line} position={[0, 0, DEPTH / 2]}>
        <boxGeometry args={[7.4, 0.022, 0.05]} />
        <meshBasicMaterial color="#ffe2a6" transparent toneMapped={false} />
      </mesh>
      <mesh ref={glow} position={[0, 0, DEPTH / 2 - 0.25]}>
        <planeGeometry args={[9.5, 0.9]} />
        <meshBasicMaterial map={glowTex} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function HeroScene({ progress, reducedMotion, touch, onReady }: Props) {
  return (
    <Canvas
      dpr={touch ? [1, 1.5] : [1, 1.75]}
      camera={{ position: [0, 0.15, 7.2], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={() => onReady?.()}
      aria-hidden="true"
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} color="#fff4e6" />
      <directionalLight position={[-4, -1, 2]} intensity={0.5} color="#c89b6d" />
      <pointLight position={[0, 0, 2.2]} intensity={2.2} distance={6} color="#f2c76e" />
      {/* Studio reflections built from light panels: no external HDR files. */}
      <Environment resolution={touch ? 64 : 128}>
        <Lightformer intensity={2} position={[0, 3, 4]} scale={[8, 1.2, 1]} color="#fff6ea" />
        <Lightformer intensity={1.2} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[4, 3, 1]} color="#c89b6d" />
        <Lightformer intensity={0.8} position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[4, 2, 1]} color="#a8643a" />
      </Environment>
      <Wordmark progress={progress} reducedMotion={reducedMotion} touch={touch} />
    </Canvas>
  );
}
