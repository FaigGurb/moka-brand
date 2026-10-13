"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { installPointer } from "@/lib/pointer";
import { useReducedMotion, useTouch, useWebGL } from "@/lib/hooks";
import { useIdle, usePerfTier } from "@/lib/perf";
import { ANCHORS, journey, lerpPose } from "./chapters";

const JourneyScene = dynamic(() => import("./JourneyScene"), { ssr: false });

const sstep = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * The page-wide coffee journey: one fixed canvas above the sections (pointer-events none).
 * The scroll position, measured against the section anchors in chapters.ts, sets the journey
 * progress and where the object sits; scrolling up plays it backwards. Hidden over the hero
 * (it has its own scene) and the footer. Phones get the light path (perfTier) and still see it.
 */
export function Journey() {
  const reduced = useReducedMotion();
  const webgl = useWebGL();
  const touch = useTouch();
  const tier = usePerfTier();
  const idle = useIdle(1600);
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  const enabled = webgl === true && !reduced && idle;

  useEffect(() => {
    if (!enabled) return;
    installPointer();
    let marks: { y: number; i: number }[] = [];
    let fadeIn = [0, 1];
    let fadeOut = [Infinity, Infinity];
    let on = false;

    const measure = () => {
      const vh = innerHeight;
      const sy = scrollY;
      marks = ANCHORS.flatMap((a, i) => {
        const el = document.getElementById(a.id);
        if (!el) return [];
        const r = el.getBoundingClientRect();
        return [{ y: (a.centre ? r.top + r.height / 2 : r.top) + sy - vh * 0.5, i }];
      });
      const hero = document.getElementById("top");
      const heroEnd = hero ? hero.getBoundingClientRect().bottom + sy : vh;
      fadeIn = [heroEnd - vh * 0.75, heroEnd - vh * 0.3];
      const foot = document.querySelector("footer");
      const footTop = foot ? foot.getBoundingClientRect().top + sy : document.documentElement.scrollHeight;
      fadeOut = [footTop - vh, footTop - vh * 0.45];
    };

    const pose = { x: 0, y: 0, s: 1, o: 1 };
    const update = () => {
      if (!marks.length) return;
      const y = scrollY;
      const land = innerWidth / innerHeight > 1.05;
      const P = (i: number) => (land ? ANCHORS[i].land : ANCHORS[i].port);
      let p: number;
      if (y <= marks[0].y) {
        p = ANCHORS[marks[0].i].p;
        Object.assign(pose, P(marks[0].i));
      } else if (y >= marks[marks.length - 1].y) {
        const last = marks[marks.length - 1].i;
        p = ANCHORS[last].p;
        Object.assign(pose, P(last));
      } else {
        let j = 0;
        while (j < marks.length - 2 && y > marks[j + 1].y) j++;
        const a = marks[j];
        const b = marks[j + 1];
        const k = clamp01((y - a.y) / Math.max(1, b.y - a.y));
        p = ANCHORS[a.i].p + (ANCHORS[b.i].p - ANCHORS[a.i].p) * k;
        // the object moves between its places in the middle of the stretch and rests near the anchors
        lerpPose(P(a.i), P(b.i), sstep(clamp01((k - 0.2) / 0.6)), pose);
      }
      journey.p = p;
      Object.assign(journey.pose, pose);
      const presence =
        sstep(clamp01((y - fadeIn[0]) / (fadeIn[1] - fadeIn[0]))) * (1 - sstep(clamp01((y - fadeOut[0]) / (fadeOut[1] - fadeOut[0]))));
      journey.presence = presence;
      if (box.current) box.current.style.opacity = String(presence * pose.o);
      const nowOn = presence > 0.01;
      if (nowOn !== on) {
        on = nowOn;
        setActive(nowOn);
      }
    };

    measure();
    update();
    const onRefresh = () => {
      measure();
      update();
    };
    ScrollTrigger.addEventListener("refresh", onRefresh);
    window.addEventListener("resize", onRefresh);
    gsap.ticker.add(update);
    return () => {
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      window.removeEventListener("resize", onRefresh);
      gsap.ticker.remove(update);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={box} aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 opacity-0">
      <JourneyScene touch={touch} lite={tier === "low"} active={active} />
    </div>
  );
}
