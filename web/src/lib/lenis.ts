import type Lenis from "lenis";

/** The page's Lenis instance (set by SmoothScroll), for components that steer the scroll. */
let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};

export const getLenis = () => instance;

/**
 * Jump straight to a far section (the cafés at the foot of the page): no long glide through the film,
 * and a second look once lazy images above it have settled, so the target ends up under the nav.
 */
export function jumpTo(hash: string, offset = -72) {
  const el = document.querySelector<HTMLElement>(hash);
  if (!el) return false;
  const go = () => {
    const y = el.getBoundingClientRect().top + window.scrollY + offset;
    if (instance) instance.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo({ top: y });
  };
  go();
  window.setTimeout(go, 350);
  window.setTimeout(go, 1000);
  history.replaceState(null, "", hash);
  return true;
}
