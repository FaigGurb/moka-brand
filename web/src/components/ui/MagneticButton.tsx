"use client";

import { useRef, type ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "solid" | "ghost";
  tone?: "light" | "dark";
  external?: boolean;
};

/**
 * A link styled as a button that leans toward the pointer and slides its arrow on hover.
 * Movement is skipped on touch devices and for reduced motion.
 */
export function MagneticButton({ href, children, variant = "solid", tone = "light", external }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.22;
    const y = (e.clientY - r.top - r.height / 2) * 0.3;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  const solid =
    tone === "light"
      ? "bg-paper text-espresso hover:bg-glow"
      : "bg-espresso text-paper hover:bg-espresso-3";
  const ghost =
    tone === "light"
      ? "border border-paper/40 text-paper hover:border-paper"
      : "border border-espresso/30 text-espresso hover:border-espresso";

  return (
    <a
      ref={ref}
      href={href}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
      className={`group inline-flex min-h-[52px] items-center gap-3 px-6 text-[13px] font-bold tracking-[0.14em] uppercase transition-[transform,background-color,border-color] duration-300 ease-[var(--ease-brand)] ${
        variant === "solid" ? solid : ghost
      }`}
    >
      <span>{children}</span>
      <span aria-hidden="true" className="relative block h-[2px] w-6 overflow-hidden">
        <span className="absolute inset-0 bg-current transition-transform duration-300 group-hover:translate-x-full" />
        <span className="absolute inset-0 -translate-x-full bg-current transition-transform duration-300 group-hover:translate-x-0" />
      </span>
    </a>
  );
}
