import type Lenis from "lenis";

/** The page's Lenis instance (set by SmoothScroll), for components that steer the scroll. */
let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};

export const getLenis = () => instance;
