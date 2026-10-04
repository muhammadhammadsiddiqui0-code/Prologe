import { useEffect, useRef, type ReactNode } from "react";
import { gsap, MQ_MOTION_FINE } from "../../lib/motion";
import { cn } from "../../utils/cn";

type Props = { children: ReactNode; strength?: number; className?: string };

/** Pulls its child gently toward the pointer. Mouse-only; off for touch and reduced motion. */
export function Magnetic({ children, strength = 0.32, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MQ_MOTION_FINE, () => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    });
    return () => mm.revert();
  }, [strength]);

  return (
    <div ref={ref} className={cn("inline-block p-3 -m-3", className)}>
      {children}
    </div>
  );
}
