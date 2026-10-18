"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { paintCupWrap, type CupSize } from "@/lib/cupArt";

type Props = { size: CupSize; reducedMotion: boolean; touch: boolean; active: boolean };

const HEIGHT: Record<CupSize, number> = { S: 1.9, M: 2.3, L: 2.7 };

function Cup({ size, reducedMotion }: Omit<Props, "touch" | "active">) {
  const group = useRef<THREE.Group>(null);
  const scaleY = useRef(HEIGHT[size]);
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 2048;
    c.height = 1024;
    return c;
  }, []);
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [canvas]);

  useEffect(() => {
    paintCupWrap(canvas);
    tex.needsUpdate = true;
  }, [canvas, tex]);

  const geo = useMemo(() => {
    // unit-height straight cone; scaled on Y per size
    const body = new THREE.LatheGeometry([new THREE.Vector2(0.6, 0), new THREE.Vector2(0.84, 1)], 96);
    const bottom = new THREE.CircleGeometry(0.6, 64).rotateX(Math.PI / 2);
    const lid = new THREE.LatheGeometry(
      [
        [0, 0.16], [0.5, 0.16], [0.62, 0.12], [0.7, 0.1], [0.74, 0.06], [0.86, 0.05], [0.9, 0.02], [0.9, -0.04], [0.85, -0.06],
      ].map(([r, y]) => new THREE.Vector2(r, y)),
      96,
    );
    const rim = new THREE.TorusGeometry(0.85, 0.025, 12, 96).rotateX(Math.PI / 2);
    return { body, bottom, lid, rim };
  }, []);
  const mats = useMemo(
    () => ({
      paper: new THREE.MeshStandardMaterial({ map: tex, roughness: 0.62, side: THREE.DoubleSide }),
      plain: new THREE.MeshStandardMaterial({ color: "#f2f1ee", roughness: 0.7 }),
      lid: new THREE.MeshStandardMaterial({ color: "#141414", roughness: 0.32 }),
      hole: new THREE.MeshBasicMaterial({ color: "#000000" }),
    }),
    [tex],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
      tex.dispose();
    },
    [geo, mats, tex],
  );

  // Drag to turn the cup. Only horizontal drags are captured (touch-action: pan-y keeps page scroll).
  const { gl } = useThree();
  const spin = useRef({ angle: 0.4, vel: 0, dragging: false, lastX: 0, idle: 0 });
  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = "pan-y";
    el.style.cursor = "grab";
    const down = (e: PointerEvent) => {
      spin.current.dragging = true;
      spin.current.lastX = e.clientX;
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      const s = spin.current;
      if (!s.dragging) return;
      const dx = e.clientX - s.lastX;
      s.lastX = e.clientX;
      s.angle += dx * 0.012;
      s.vel = dx * 0.012 * 60;
      s.idle = 0;
    };
    const up = () => {
      spin.current.dragging = false;
      el.style.cursor = "grab";
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [gl]);

  const body = useRef<THREE.Mesh>(null);
  const lid = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    // ease the height change between sizes
    scaleY.current += (HEIGHT[size] - scaleY.current) * (1 - Math.pow(0.002, delta));
    const h = scaleY.current;
    if (body.current) body.current.scale.set(1, h, 1);
    if (lid.current) lid.current.position.y = h;
    const sp = spin.current;
    if (!sp.dragging) {
      sp.idle += delta;
      sp.angle += sp.vel * delta;
      sp.vel *= Math.exp(-3 * delta);
      // drift back into a slow showroom turn after a moment
      if (!reducedMotion && sp.idle > 1.2) sp.angle += delta * 0.35 * Math.min(1, sp.idle - 1.2);
    }
    if (group.current) {
      group.current.rotation.y = sp.angle;
      group.current.position.y = -h / 2 - 0.1 + (reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.8) * 0.04);
    }
  });

  return (
    <group ref={group}>
      <mesh ref={body} geometry={geo.body} material={mats.paper} />
      <mesh geometry={geo.bottom} material={mats.plain} />
      <group ref={lid}>
        <mesh geometry={geo.rim} material={mats.plain} />
        <mesh geometry={geo.lid} material={mats.lid} />
        {/* sip opening */}
        <mesh position={[0, 0.165, 0.42]} rotation-x={-Math.PI / 2} material={mats.hole}>
          <planeGeometry args={[0.22, 0.07]} />
        </mesh>
      </group>
    </group>
  );
}

export default function CupScene(props: Props) {
  return (
    <Canvas
      frameloop={props.active ? "always" : "never"}
      dpr={props.touch ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0.9, 6.4], fov: 32 }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.8} color="#fff4e6" />
      <directionalLight position={[-4, 2, -3]} intensity={0.6} color="#ffffff" />
      <Environment resolution={64}>
        <Lightformer intensity={2} position={[0, 3, 4]} scale={[6, 1, 1]} color="#fff6ea" />
        <Lightformer intensity={1} position={[-4, 0, 2]} rotation-y={Math.PI / 2} scale={[3, 3, 1]} color="#FFFFFF" />
      </Environment>
      <Cup {...props} />
      {/* the shadow is rotationally symmetric: render it for a moment after each size change, then freeze it */}
      <ContactShadows key={props.size} frames={45} position={[0, -1.6, 0]} opacity={0.45} scale={6} blur={2.6} far={3} resolution={props.touch ? 256 : 512} />
    </Canvas>
  );
}
