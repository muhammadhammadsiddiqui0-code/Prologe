import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./motion";

type ScrollTarget = string | number | HTMLElement;

type SmoothApi = {
  scrollTo: (target: ScrollTarget, opts?: { offset?: number; immediate?: boolean }) => void;
  stop: () => void;
  start: () => void;
};

const noop = () => {};
const SmoothContext = createContext<SmoothApi>({
  scrollTo: noop,
  stop: noop,
  start: noop,
});

export const useSmooth = () => useContext(SmoothContext);

/**
 * Lenis smooth scrolling wired into GSAP's ticker so ScrollTrigger stays in sync.
 * Disabled entirely for prefers-reduced-motion (native scrolling is used).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Fonts change layout height; recalculate triggers once they're in.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback<SmoothApi["scrollTo"]>((target, opts) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, {
        offset: opts?.offset ?? 0,
        duration: 1.4,
        immediate: opts?.immediate,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
      });
      return;
    }
    if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "auto" });
    } else {
      const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
      el?.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }, []);

  const api = useMemo<SmoothApi>(
    () => ({
      scrollTo,
      stop: () => lenisRef.current?.stop(),
      start: () => lenisRef.current?.start(),
    }),
    [scrollTo],
  );

  return <SmoothContext.Provider value={api}>{children}</SmoothContext.Provider>;
}
