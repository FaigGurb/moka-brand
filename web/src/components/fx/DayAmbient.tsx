"use client";

import { useEffect } from "react";
import { bakuHour, daySlot } from "@/lib/day";

/**
 * Publishes the current day colour as CSS variables (--day, --day-rgb) and data-day on <html>.
 * Background glows and the crema shader read it, so the whole site shifts with the time in Baku.
 */
export function DayAmbient() {
  useEffect(() => {
    const apply = () => {
      const d = daySlot(bakuHour());
      const root = document.documentElement;
      root.style.setProperty("--day", d.hex);
      root.style.setProperty("--day-rgb", d.rgb);
      root.dataset.day = d.key;
      window.dispatchEvent(new Event("moka:day"));
    };
    apply();
    const id = window.setInterval(apply, 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, []);
  return null;
}
