"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { createBeanGeometry, roastColor, seeded } from "@/lib/bean";
import { paintCupWrap } from "@/lib/cupArt";
import { PHASES, journey } from "./chapters";
import { BeanPush, ndcToPlane } from "@/lib/beanPhysics";
import { installPointer, pointer as sharedPointer, pointerNDC } from "@/lib/pointer";

/**
 * The page-wide journey "from bean to cup": beans float, roast (green → dark), spiral into a Chemex
 * and turn into grounds, then coffee drips into the lower chamber until it reaches the signature line.
 * Everything follows one scroll progress (`journey.p`, written by Journey.tsx); the object's place on
 * screen follows `journey.pose`. Time only adds idle motion.
 */

type Props = {
  /** the fixed element holding the canvas: sized and moved here to cover only the object */
  frame: RefObject<HTMLDivElement | null>;
  touch: boolean;
  active: boolean;
  /** light path for phones and weak machines */
  lite?: boolean;
  /** economy: the device struggled, so even fewer frames */
  eco?: boolean;
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
/** MOKA's takeaway cup (same model and wrap as apps/CupScene, size M), scaled beside the Chemex. */
const CUP_H = 2.3;
const CUP_S = 0.6;
/** Chemex tilt while pouring, and its rim spout in the Chemex's own space. */
const TILT = 0.95;
const SPOUT = new THREE.Vector3(1.05, 2.5, 0);

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

/** Vertical size of the view at the object's depth (camera z 7.6, fov 35). */
const VIEW_H = 2 * Math.tan(THREE.MathUtils.degToRad(17.5)) * 7.6;

function Story({ frame, touch, lite = false }: Omit<Props, "active" | "onReady" | "eco">) {
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
  const chemex = useRef<THREE.Group>(null);
  const cup = useRef<THREE.Group>(null);
  const cupFill = useRef<THREE.Mesh>(null);
  const lid = useRef<THREE.Group>(null);
  const stream = useRef<THREE.Mesh>(null);
  const cupRing = useRef<THREE.Mesh>(null);
  const cupGlow = useRef<THREE.Sprite>(null);
  const smooth = useRef(journey.p);
  const lastGrind = useRef(-1);
  const lastRoast = useRef(-1);
  const { camera, pointer, gl } = useThree();
  // The canvas covers only a box around the object (companion mode) or the whole screen (stages);
  // the camera keeps the full-screen projection through a view offset, so nothing jumps.
  const box = useRef({ mode: "", w: 0, h: 0, fx: 1, fy: 1 });
  const fullCam = useMemo(() => new THREE.PerspectiveCamera(35, 1, 0.1, 100), []);
  const centre = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => installPointer(), []);

  // page-wide, so fewer beans than a single full-screen stage would carry
  const BEANS = lite ? 26 : 64;
  const GROUNDS = lite ? 450 : 1800;

  // the beans are small on a page-wide layer: the low-poly bean is enough everywhere
  const beanGeo = useMemo(() => createBeanGeometry("low"), []);
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
      glass: new (lite ? THREE.MeshStandardMaterial : THREE.MeshPhysicalMaterial)({
        color: "#ffffff",
        roughness: 0.06,
        metalness: 0,
        ...(lite ? {} : { clearcoat: 1 }),
        transparent: true,
        opacity: 0.13,
        side: THREE.DoubleSide,
        depthWrite: false,
        envMapIntensity: 1.6,
      }),
      liquid: lite
        ? new THREE.MeshStandardMaterial({ color: "#2e180c", roughness: 0.15, clippingPlanes: [clip] })
        : new THREE.MeshPhysicalMaterial({ color: "#2e180c", roughness: 0.18, clearcoat: 1, clippingPlanes: [clip] }),
      surface: lite
        ? new THREE.MeshStandardMaterial({ color: "#4a2a17", roughness: 0.12, emissive: "#3b1f10", emissiveIntensity: 0.3 })
        : new THREE.MeshPhysicalMaterial({ color: "#4a2a17", roughness: 0.12, clearcoat: 1, emissive: "#3b1f10", emissiveIntensity: 0.3 }),
      filter: new THREE.MeshStandardMaterial({ color: "#f5f1ea", roughness: 0.9, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false }),
      wood: new THREE.MeshStandardMaterial({ color: "#a8643a", roughness: 0.62, side: THREE.DoubleSide }),
      tie: new THREE.MeshStandardMaterial({ color: "#c9a882", roughness: 0.8 }),
      water: new THREE.MeshBasicMaterial({ color: "#e9e4dc", transparent: true, opacity: 0, depthWrite: false }),
      dripM: new THREE.MeshBasicMaterial({ color: "#3b2416", transparent: true, opacity: 0 }),
      ring: new THREE.MeshBasicMaterial({ color: "#ffe2a6", transparent: true, opacity: 0, toneMapped: false }),
    }),
    [clip, lite],
  );

  // ---- the MOKA cup (finale)
  const cupRes = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = lite ? 1024 : 2048;
    c.height = lite ? 512 : 1024;
    paintCupWrap(c);
    const wrap = new THREE.CanvasTexture(c);
    wrap.colorSpace = THREE.SRGBColorSpace;
    wrap.anisotropy = 4;
    const seg = lite ? 48 : 96;
    const streamGeo = new THREE.CylinderGeometry(0.024, 0.02, 1, 10, 1, true);
    streamGeo.translate(0, -0.5, 0);
    return {
      wrap,
      geo: {
        body: new THREE.LatheGeometry([new THREE.Vector2(0.6, 0), new THREE.Vector2(0.84, 1)], seg),
        bottom: new THREE.CircleGeometry(0.6, 48).rotateX(Math.PI / 2),
        lid: new THREE.LatheGeometry(
          [[0, 0.16], [0.5, 0.16], [0.62, 0.12], [0.7, 0.1], [0.74, 0.06], [0.86, 0.05], [0.9, 0.02], [0.9, -0.04], [0.85, -0.06]].map(
            ([r, y]) => new THREE.Vector2(r, y),
          ),
          seg,
        ),
        rim: new THREE.TorusGeometry(0.85, 0.025, 10, seg).rotateX(Math.PI / 2),
        fill: new THREE.CircleGeometry(1, 48).rotateX(-Math.PI / 2),
        // the signature line around the cup at 60% of its height
        ring: new THREE.TorusGeometry(0.6 + 0.24 * 0.6 + 0.012, 0.014, 8, seg).rotateX(Math.PI / 2),
        stream: streamGeo,
      },
      mat: {
        paper: new THREE.MeshStandardMaterial({ map: wrap, roughness: 0.62, side: THREE.DoubleSide }),
        plain: new THREE.MeshStandardMaterial({ color: "#f2f1ee", roughness: 0.7 }),
        lid: new THREE.MeshStandardMaterial({ color: "#141414", roughness: 0.32 }),
        coffee: new THREE.MeshStandardMaterial({ color: "#3a2112", roughness: 0.15, emissive: "#2a160b", emissiveIntensity: 0.25 }),
        stream: new THREE.MeshStandardMaterial({ color: "#3b2416", roughness: 0.2, transparent: true, opacity: 0 }),
        ring: new THREE.MeshBasicMaterial({ color: "#ffe2a6", transparent: true, opacity: 0, toneMapped: false }),
      },
    };
  }, [lite]);

  useEffect(
    () => () => {
      cupRes.wrap.dispose();
      Object.values(cupRes.geo).forEach((g) => g.dispose());
      Object.values(cupRes.mat).forEach((m) => m.dispose());
    },
    [cupRes],
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
  const pw = useMemo(() => new THREE.Vector3(), []);
  const pvel = useMemo(() => new THREE.Vector3(), []);
  const poff = useMemo(() => new THREE.Vector3(), []);
  const push = useMemo(() => new BeanPush(BEANS), [BEANS]);
  const spout = useMemo(() => new THREE.Vector3(), []);
  const mouth = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const DOWN = useMemo(() => new THREE.Vector3(0, -1, 0), []);
  const tiltE = useMemo(() => new THREE.Euler(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    // ease toward the scroll target: scrubbed, and it plays backwards when scrolling up
    smooth.current += (journey.p - smooth.current) * (1 - Math.pow(0.02, delta));
    const p = smooth.current;

    // ---- layout: the pose (from the section on screen) places and sizes the whole object
    const fw = window.innerWidth;
    const fh = window.innerHeight;
    const viewport = { width: (VIEW_H * fw) / fh, height: VIEW_H, aspect: fw / fh };
    const landscape = viewport.aspect > 1.05;
    const base = landscape ? Math.min(0.95, viewport.height / 5.6) : Math.min(1, viewport.width / 3.4, (viewport.height * 0.44) / 2.5);
    const pose = journey.pose;
    const scale = base * pose.s;
    // beans stay in a cloud around the Chemex so the copy beside it stays clear
    const spreadX = landscape ? 1.9 : 1.5;
    if (root.current) {
      const k = 1 - Math.pow(0.004, delta);
      const r = root.current;
      r.scale.setScalar(r.scale.x + (scale - r.scale.x) * k);
      r.position.x += (pose.x * viewport.width - r.position.x) * k;
      r.position.y += (pose.y * viewport.height + 0.05 * scale - r.position.y) * k;
      // a slow turn while travelling, so it reads as one object moving through the page
      r.rotation.y = Math.sin(p * Math.PI * 2) * 0.25;
      journey.moving =
        Math.abs(journey.p - p) > 4e-4 ||
        Math.abs(pose.x * viewport.width - r.position.x) > 2e-3 ||
        Math.abs(scale - r.scale.x) > 2e-3;
    }
    // gentle camera drift: mouse on desktop, slow sway on touch
    const cx = touch ? Math.sin(t * 0.25) * 0.25 : pointer.x * 0.4;
    const cy = touch ? Math.cos(t * 0.2) * 0.1 : pointer.y * 0.2;
    camera.position.x += (cx - camera.position.x) * 0.05;
    camera.position.y += (0.9 + cy - camera.position.y) * 0.05;
    camera.lookAt(camera.position.x * 0.8, 0.1, 0);

    // ---- canvas box: full screen on the stages, a moving box around the companion elsewhere
    const cam = camera as THREE.PerspectiveCamera;
    cam.aspect = fw / fh;
    const el = frame.current;
    const b = box.current;
    const r0 = root.current;
    const big = !r0 || Math.max(pose.s, r0.scale.x / base) > 0.8;
    if (big) {
      if (b.mode !== "full" || b.w !== fw || b.h !== fh) {
        Object.assign(b, { mode: "full", w: fw, h: fh, fx: 1, fy: 1 });
        if (el) {
          el.style.width = `${fw}px`;
          el.style.height = `${fh}px`;
          el.style.transform = "none";
        }
      }
      cam.clearViewOffset();
    } else {
      // sized for the largest companion (0.8 × base): local x ±(cloud + Chemex), y −1.8 … 3.2
      const px = (fh / VIEW_H) * base * 0.8 * 1.12;
      const bw = Math.min(fw, Math.ceil(2 * ((landscape ? 1.9 : 1.5) + 0.7) * px));
      const bh = Math.min(fh, Math.ceil(5 * px));
      if (b.mode !== "box" || b.w !== bw || b.h !== bh) {
        Object.assign(b, { mode: "box", w: bw, h: bh, fx: bw / fw, fy: bh / fh });
        if (el) {
          el.style.width = `${bw}px`;
          el.style.height = `${bh}px`;
        }
      }
      fullCam.position.copy(cam.position);
      fullCam.quaternion.copy(cam.quaternion);
      fullCam.aspect = fw / fh;
      fullCam.updateProjectionMatrix();
      fullCam.updateMatrixWorld();
      r0.updateMatrixWorld();
      centre.set(0, 0.7, 0);
      r0.localToWorld(centre).project(fullCam);
      const ox = Math.round((centre.x * 0.5 + 0.5) * fw - bw / 2);
      const oy = Math.round((-centre.y * 0.5 + 0.5) * fh - bh / 2);
      if (el) el.style.transform = `translate3d(${ox}px,${oy}px,0)`;
      cam.setViewOffset(fw, fh, ox, oy, bw, bh);
    }
    cam.updateProjectionMatrix();

    const roast = sstep(PHASES.roast[0], PHASES.roast[1], p) * 0.92;
    const grind = clamp((p - PHASES.grind[0]) / (PHASES.grind[1] - PHASES.grind[0]), 0, 1);
    const brew = clamp((p - PHASES.brew[0]) / (PHASES.brew[1] - PHASES.brew[0]), 0, 1);
    // finale: the cup rises in, the Chemex lifts and pours, the lid closes, the Chemex steps away
    const cupIn = sstep(PHASES.cupIn[0], PHASES.cupIn[1], p);
    const pourT = clamp((p - PHASES.pour[0]) / (PHASES.pour[1] - PHASES.pour[0]), 0, 1);
    const finT = clamp((p - PHASES.finish[0]) / (PHASES.finish[1] - PHASES.finish[0]), 0, 1);
    const tilt = sstep(0, 0.3, pourT) * (1 - sstep(0.8, 1, pourT));
    const flow = sstep(0.22, 0.36, pourT) * (1 - sstep(0.78, 0.9, pourT));
    const drained = sstep(0.3, 0.85, pourT);
    const lidK = sstep(0.05, 0.45, finT);
    const away = sstep(0.15, 0.75, finT);

    // ---- beans
    const mesh = beans.current;
    const dt = Math.min(delta, 1 / 20);
    const ndc = pointerNDC(gl.domElement);
    const burst = push.tapped(sharedPointer.tapped);
    const rp = root.current;
    if (mesh) {
      const roastChanged = Math.abs(roast - lastRoast.current) > 0.002;
      const topY = TOP + 0.15 - 1.3; // rim height in the root group's space (Chemex sits at y -1.3)
      data.forEach((b, i) => {
        const gi = b.grindAt > 1 ? 0 : clamp((grind - b.grindAt) / 0.42, 0, 1);
        // idle float
        const fx = b.pos.x * spreadX + Math.sin(t * 0.4 + b.phase) * 0.12;
        const fy = b.pos.y * 1.5 + 0.35 + Math.sin(t * 0.55 + b.phase * 1.7) * 0.18;
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
        // pointer / finger pushes floating beans; beans already spiralling into the grinder ignore it
        let hit = false;
        if (ndc && rp && gi < 0.25) {
          const sc0 = rp.scale.x;
          ndcToPlane(ndc, camera, rp.position.z + v.z * sc0, pw);
          pw.sub(rp.position).divideScalar(sc0);
          pvel.set((ndc.vx * viewport.width * box.current.fx) / 2 / sc0, (ndc.vy * viewport.height * box.current.fy) / 2 / sc0, 0);
          hit = true;
        }
        push.apply(i, v, hit ? pw : null, hit ? pvel : null, touch ? 1.1 : 0.9, dt, burst && hit);
        v.addScaledVector(push.offset(i, poff), 1 - gi);
        const spinBoost = 1 + gi * 6;
        e.set(b.rot.x + t * b.spin.x * spinBoost + push.spin[i], b.rot.y + t * b.spin.y * spinBoost, b.rot.z + t * b.spin.z + push.off[i * 3 + 2]);
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
    const level = LINE_Y * sstep(0.1, 0.96, brew) * (1 - drained);
    const dripOn = sstep(0.06, 0.14, brew) * (1 - sstep(0.94, 1, brew));
    if (drip.current) {
      mats.dripM.opacity = dripOn;
      drip.current.visible = dripOn > 0.01;
      drip.current.scale.y = Math.max(0.001, WAIST - 0.05 - level);
    }
    if (liquid.current && surface.current) {
      liquid.current.visible = level > 0.005;
      surface.current.visible = level > 0.005 && tilt < 0.04;
      liquid.current.updateWorldMatrix(true, false);
      tmp.set(0, level, 0);
      liquid.current.localToWorld(tmp);
      clip.constant = tmp.y;
      const r = radiusAt(level) * 0.93 * (level < 0.05 ? level / 0.05 : 1);
      surface.current.position.y = level;
      surface.current.scale.setScalar(Math.max(r, 0.001));
    }

    // ---- the signature line lights up on the full Chemex, then on the cup once the lid is on
    const fin = sstep(PHASES.line[0], PHASES.line[1], p) * (1 - tilt) * (1 - drained);
    mats.ring.opacity = fin;
    if (ringGlow.current) (ringGlow.current.material as THREE.SpriteMaterial).opacity = fin * (0.75 + Math.sin(t * 2) * 0.1);

    // steam once there is coffee
    steam.current.forEach((sp, i) => {
      if (!sp) return;
      const ph = (t * 0.18 + i / steam.current.length) % 1;
      sp.position.set(Math.sin(t * 0.6 + i * 2) * 0.18, TOP + 0.4 + ph * 1.3, 0.1);
      sp.scale.setScalar(0.5 + ph * 0.7);
      (sp.material as THREE.SpriteMaterial).opacity = sstep(0.78, 0.84, p) * (1 - tilt) * (1 - drained) * Math.sin(Math.PI * ph) * 0.18;
    });

    // ---- cup and pour (all in the root group's space; the Chemex base sits at y -1.3)
    const cg = cup.current;
    const ch = chemex.current;
    if (cg && ch) {
      const cupX = (1.0 + 0.35 * tilt) * (1 - away);
      const cupY = -1.3 - 0.9 * (1 - cupIn);
      cg.visible = cupIn > 0.002;
      cg.position.set(cupX, cupY, 0.1);
      cg.scale.setScalar(CUP_S * Math.max(cupIn, 0.001));
      // the logo faces the viewer during the pour, then the cup turns slowly with the scroll
      cg.rotation.y = Math.PI - 0.5 + (p - PHASES.cupIn[0]) * 6;
      const mouthY = cupY + CUP_H * CUP_S;
      // Chemex: rest (shifted left for the cup) → lifted and tilted so its spout sits over the cup
      const a = TILT;
      const sx = SPOUT.x * Math.cos(a) + SPOUT.y * Math.sin(a);
      const sy = -SPOUT.x * Math.sin(a) + SPOUT.y * Math.cos(a);
      const restX = -0.85 * cupIn;
      const pourX = cupX - sx + 0.05;
      const pourY = mouthY + 0.45 - sy;
      ch.position.set(restX + (pourX - restX) * tilt - 1.8 * away, -1.3 + (pourY + 1.3) * tilt, -0.6 * away);
      ch.rotation.z = -a * tilt;
      ch.scale.setScalar(Math.max(1 - away, 0.001));
      ch.visible = away < 0.999;
      // the stream from the spout into the cup
      const sm = stream.current;
      if (sm) {
        cupRes.mat.stream.opacity = flow;
        sm.visible = flow > 0.01;
        if (sm.visible) {
          tiltE.set(0, 0, ch.rotation.z);
          spout.copy(SPOUT).applyEuler(tiltE).multiplyScalar(ch.scale.x).add(ch.position);
          const fillY = 0.62 * drained;
          mouth.set(cupX, cupY + CUP_H * CUP_S * Math.max(fillY, 0.08), 0.1);
          dir.subVectors(mouth, spout);
          const len = dir.length();
          sm.position.copy(spout);
          sm.quaternion.setFromUnitVectors(DOWN, dir.divideScalar(Math.max(len, 1e-4)));
          sm.scale.set(1, Math.max(len, 0.001), 1);
        }
      }
      // coffee rising in the cup
      const cf = cupFill.current;
      if (cf) {
        const f = 0.62 * drained;
        cf.visible = drained > 0.01;
        cf.position.y = f * CUP_H;
        cf.scale.setScalar((0.6 + 0.24 * f) * 0.97);
      }
      // lid drops on
      const ld = lid.current;
      if (ld) {
        ld.visible = lidK > 0.01;
        ld.position.y = CUP_H + (1 - lidK) * 0.7;
        ld.rotation.x = (1 - lidK) * 0.35;
        ld.scale.setScalar(0.7 + 0.3 * lidK);
      }
      const ringOn = sstep(0.5, 0.95, finT);
      cupRes.mat.ring.opacity = ringOn;
      if (cupRing.current) cupRing.current.visible = ringOn > 0.01;
      if (cupGlow.current) (cupGlow.current.material as THREE.SpriteMaterial).opacity = ringOn * (0.6 + Math.sin(t * 2) * 0.1);
    }
  });

  return (
    <group ref={root}>
      <instancedMesh ref={beans} args={[beanGeo, beanMat, BEANS]} frustumCulled={false} />
      <pointLight ref={heat} position={[0, 0.6, 1.4]} color="#ff8a3d" intensity={0} distance={8} />
      <group ref={chemex} position={[0, -1.3, 0]}>
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
      <mesh ref={stream} geometry={cupRes.geo.stream} material={cupRes.mat.stream} visible={false} />
      <group ref={cup} visible={false}>
        <mesh geometry={cupRes.geo.body} material={cupRes.mat.paper} scale={[1, CUP_H, 1]} />
        <mesh geometry={cupRes.geo.bottom} material={cupRes.mat.plain} />
        <mesh ref={cupFill} geometry={cupRes.geo.fill} material={cupRes.mat.coffee} visible={false} />
        <mesh ref={cupRing} geometry={cupRes.geo.ring} material={cupRes.mat.ring} position={[0, CUP_H * 0.6, 0]} visible={false} />
        <sprite ref={cupGlow} position={[0, CUP_H * 0.6, 0.5]} scale={[3.2, 0.55, 1]}>
          <spriteMaterial map={tex.glow} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
        <group ref={lid} visible={false}>
          <mesh geometry={cupRes.geo.rim} material={cupRes.mat.plain} />
          <mesh geometry={cupRes.geo.lid} material={cupRes.mat.lid} />
          <mesh position={[0, 0.165, -0.42]} rotation-x={-Math.PI / 2} material={cupRes.mat.lid}>
            <planeGeometry args={[0.22, 0.07]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/**
 * Compiles every shader once at start (hidden parts included), so the cup, the stream and the
 * line don't stall the scroll with a shader compile the first time they appear.
 */
function Precompile() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const hidden: THREE.Object3D[] = [];
      scene.traverse((o) => {
        if (!o.visible) {
          hidden.push(o);
          o.visible = true;
        }
      });
      gl.compile(scene, camera);
      hidden.forEach((o) => (o.visible = false));
    });
    return () => cancelAnimationFrame(id);
  }, [gl, scene, camera]);
  return null;
}

/**
 * Frames on demand: full rate while the journey is still easing or the pointer is moving, otherwise
 * a slow idle rate for the floating beans. A page-wide layer must not cost a frame every vsync.
 */
function FrameDriver({ lite, eco }: { lite: boolean; eco: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const busyMs = eco ? 1000 / 24 : lite ? 1000 / 30 : 1000 / 60;
    const idleMs = eco ? 1000 / 8 : lite ? 1000 / 12 : 1000 / 24;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const busy = journey.moving || now - sharedPointer.moved < 700;
      if (now - last >= (busy ? busyMs : idleMs) - 2) {
        last = now;
        invalidate();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [invalidate, lite, eco]);
  return null;
}

export default function JourneyScene({ frame, touch, active, lite = false, eco = false, onReady }: Props) {
  return (
    <Canvas
      frameloop={active ? "demand" : "never"}
      dpr={lite ? 1 : [1, 1.5]}
      // aspect given = the camera is ours (R3F won't reset it on resize); Story sets it every frame
      camera={{ position: [0, 0.9, 7.6], fov: 35, aspect: 1 }}
      gl={{ antialias: !lite, alpha: true, powerPreference: "high-performance" }}
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
      <Environment resolution={lite ? 32 : 128}>
        <Lightformer intensity={2.2} position={[0, 4, 3]} scale={[8, 1.5, 1]} color="#fff6ea" />
        <Lightformer intensity={1.4} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[1, 5, 1]} color="#ffe2a6" />
        <Lightformer intensity={0.9} position={[5, 0, 1]} rotation-y={-Math.PI / 2} scale={[1, 5, 1]} color="#a8643a" />
      </Environment>
      {active && <FrameDriver lite={lite} eco={eco} />}
      <Precompile />
      <Story frame={frame} touch={touch} lite={lite} />
    </Canvas>
  );
}
