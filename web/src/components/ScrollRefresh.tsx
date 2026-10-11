"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/** Re-measure pinned sections once web fonts and images have loaded (they change section heights). */
export function ScrollRefresh() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);
  return null;
}
