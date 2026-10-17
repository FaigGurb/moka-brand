"use client";

import { useEffect, useState } from "react";
import { sound } from "@/lib/sound";

/** Sound on/off for the whole site (off by default); remembered with the games' choice. */
export function SoundToggle({ labelOn, labelOff, className = "" }: { labelOn: string; labelOff: string; className?: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const off = sound.subscribe(setOn);
    sound.init();
    return off;
  }, []);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? labelOff : labelOn}
      title={on ? labelOff : labelOn}
      onClick={() => sound.set(!on)}
      className={`flex h-11 w-11 items-center justify-center text-paper/70 transition-colors hover:text-paper aria-pressed:text-glow ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z" fill="currentColor" stroke="none" />
        {on ? (
          <>
            <path d="M15.5 9a4 4 0 0 1 0 6" />
            <path d="M18.2 6.5a7.5 7.5 0 0 1 0 11" />
          </>
        ) : (
          <path d="M16 9.5l5 5M21 9.5l-5 5" />
        )}
      </svg>
    </button>
  );
}
