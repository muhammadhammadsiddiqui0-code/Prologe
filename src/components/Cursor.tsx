import { useEffect, useRef } from "react";
import { gsap, MQ_MOTION_FINE } from "../lib/motion";

/**
 * Soft trailing ring + dot. The native cursor stays visible (accessibility);
 * the ring grows over interactive elements. Mouse-only, off for reduced motion.
 */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ_MOTION_FINE, () => {
      const r = ring.current;
      const d = dot.current;
      if (!r || !d) return;
      gsap.set([r, d], { xPercent: -50, yPercent: -50, opacity: 0 });

      const rx = gsap.quickTo(r, "x", { duration: 0.6, ease: "power3.out" });
      const ry = gsap.quickTo(r, "y", { duration: 0.6, ease: "power3.out" });
      const dx = gsap.quickTo(d, "x", { duration: 0.12, ease: "power2.out" });
      const dy = gsap.quickTo(d, "y", { duration: 0.12, ease: "power2.out" });
      let shown = false;

      const move = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        if (!shown) {
          gsap.set([r, d], { x: e.clientX, y: e.clientY });
          gsap.to([r, d], { opacity: 1, duration: 0.5 });
          shown = true;
        }
        rx(e.clientX);
        ry(e.clientY);
        dx(e.clientX);
        dy(e.clientY);
      };
      const over = (e: PointerEvent) => {
        const t = e.target as Element | null;
        if (!t || !t.closest) return;
        const field = t.closest("input, textarea");
        const interactive = t.closest('a, button, [role="button"], label, select, [data-cursor]');
        gsap.to(r, {
          scale: field ? 0.5 : interactive ? 1.9 : 1,
          backgroundColor: interactive && !field ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0)",
          duration: 0.5,
          ease: "power3.out",
          overwrite: "auto",
        });
        gsap.to(d, { scale: interactive || field ? 0 : 1, duration: 0.3, overwrite: "auto" });
      };
      const leave = () => {
        gsap.to([r, d], { opacity: 0, duration: 0.3 });
        shown = false;
      };

      window.addEventListener("pointermove", move, { passive: true });
      document.addEventListener("pointerover", over);
      document.documentElement.addEventListener("pointerleave", leave);
      return () => {
        window.removeEventListener("pointermove", move);
        document.removeEventListener("pointerover", over);
        document.documentElement.removeEventListener("pointerleave", leave);
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <>
      <div
        ref={ring}
        aria-hidden="true"
        className="cursor-el pointer-events-none fixed left-0 top-0 z-[200] h-11 w-11 rounded-full border border-white opacity-0 mix-blend-difference"
      />
      <div
        ref={dot}
        aria-hidden="true"
        className="cursor-el pointer-events-none fixed left-0 top-0 z-[200] h-1.5 w-1.5 rounded-full bg-white opacity-0 mix-blend-difference"
      />
    </>
  );
}
