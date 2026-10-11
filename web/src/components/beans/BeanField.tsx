"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { installPointer } from "@/lib/pointer";
import { useReducedMotion, useTouch, useWebGL } from "@/lib/hooks";

const BeanFieldScene = dynamic(() => import("./BeanFieldScene"), { ssr: false });

/** Page-wide bean layer. Steps aside where a section already has its own 3D beans. */
export function BeanField() {
  const reduced = useReducedMotion();
  const webgl = useWebGL();
  const touch = useTouch();
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    installPointer();
    // load after first paint so the hero gets the GPU first
    const id = window.setTimeout(() => setReady(true), 1200);
    const own = ["#top", "#proses"].map((s) => document.querySelector(s)).filter(Boolean) as Element[];
    const inView = new Map<Element, boolean>();
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => inView.set(e.target, e.intersectionRatio > 0.35));
        setShow(![...inView.values()].some(Boolean));
      },
      { threshold: [0, 0.35, 0.6] },
    );
    own.forEach((el) => io.observe(el));
    return () => {
      window.clearTimeout(id);
      io.disconnect();
    };
  }, []);

  if (reduced || webgl !== true || !ready) return null;
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-40 transition-opacity duration-700 ${show ? "opacity-100" : "opacity-0"}`}
    >
      <BeanFieldScene touch={touch} active={show} />
    </div>
  );
}
