"use client";

/**
 * Phone tilt (DeviceOrientation) for the hero. Readings are taken relative to how the phone was held
 * when tilt started, clamped and smoothed, and kept in a plain object the 3D scene reads every frame
 * (no React re-renders). iOS asks for permission, so `requestTilt()` must run inside a tap; Android
 * and others start without asking. Callers skip all of this for reduced motion.
 */

export const tilt = { active: false, x: 0, y: 0 };

let base: { b: number; g: number } | null = null;
let listening = false;

type IOSOrientation = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));

function onOrientation(e: DeviceOrientationEvent) {
  if (e.beta == null || e.gamma == null) return;
  if (!base) base = { b: e.beta, g: e.gamma };
  // degrees → a small range; x = front/back, y = left/right
  tilt.x = clamp((e.beta - base.b) / 35, 1);
  tilt.y = clamp((e.gamma - base.g) / 30, 1);
  tilt.active = true;
}

function listen() {
  if (listening) return;
  listening = true;
  base = null;
  window.addEventListener("deviceorientation", onOrientation);
}

/** True when the device can report orientation at all. */
export const tiltSupported = () => typeof window !== "undefined" && "DeviceOrientationEvent" in window;

/** True when the browser will ask for permission first (iOS Safari). */
export const tiltNeedsPermission = () =>
  tiltSupported() && typeof (window.DeviceOrientationEvent as IOSOrientation).requestPermission === "function";

/** Start listening; on iOS this shows the permission prompt, so call it from a tap. */
export async function requestTilt(): Promise<boolean> {
  if (!tiltSupported()) return false;
  const DOE = window.DeviceOrientationEvent as IOSOrientation;
  if (typeof DOE.requestPermission === "function") {
    try {
      if ((await DOE.requestPermission()) !== "granted") return false;
    } catch {
      return false;
    }
  }
  listen();
  return true;
}

/** Re-centre on the current way the phone is held. */
export const recentreTilt = () => {
  base = null;
};

export function stopTilt() {
  if (!listening) return;
  window.removeEventListener("deviceorientation", onOrientation);
  listening = false;
  tilt.active = false;
  tilt.x = tilt.y = 0;
}
