import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap, MQ_MOTION } from "../../lib/motion";
import { cn } from "../../utils/cn";

type DrawProps = {
  children: ReactNode;
  className?: string;
  viewBox: string;
  preserveAspectRatio?: string;
  delay?: number;
  duration?: number;
  /** Draw immediately on load instead of when scrolled into view. */
  onLoad?: boolean;
  start?: string;
  strokeWidth?: number;
};

/**
 * Wrapper for hand-drawn SVG strokes. Every <path data-draw pathLength={1}> inside
 * is drawn (stroke-dashoffset 1 → 0) when it scrolls into view.
 * With prefers-reduced-motion the strokes simply appear, fully drawn.
 */
export function DrawSvg({
  children,
  className,
  viewBox,
  preserveAspectRatio,
  delay = 0,
  duration = 1.2,
  onLoad = false,
  start = "top 90%",
  strokeWidth = 3,
}: DrawProps) {
  const ref = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const mm = gsap.matchMedia();
    mm.add(MQ_MOTION, () => {
      const parts = svg.querySelectorAll<SVGElement>("[data-draw]");
      gsap.fromTo(
        parts,
        { strokeDashoffset: 1.05 },
        {
          strokeDashoffset: 0,
          duration,
          delay,
          ease: "power2.inOut",
          stagger: 0.18,
          scrollTrigger: onLoad ? undefined : { trigger: svg, start, once: true },
        },
      );
    });
    return () => mm.revert();
  }, [delay, duration, onLoad, start]);

  return (
    <svg
      ref={ref}
      viewBox={viewBox}
      preserveAspectRatio={preserveAspectRatio}
      className={cn("hand overflow-visible", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

type StrokeProps = {
  className?: string;
  delay?: number;
  onLoad?: boolean;
  strokeWidth?: number;
};

/** Marker-style double underline. Stretches to the width of its parent. */
export function HandUnderline({ className, delay, onLoad, strokeWidth = 5 }: StrokeProps) {
  return (
    <DrawSvg
      viewBox="0 0 300 26"
      preserveAspectRatio="none"
      strokeWidth={strokeWidth}
      delay={delay}
      onLoad={onLoad}
      className={cn("pointer-events-none absolute left-0 w-full", className)}
    >
      <path data-draw pathLength={1} d="M4 13 C 52 5, 96 19, 152 11 S 252 7, 296 12" />
      <path data-draw pathLength={1} d="M26 21 C 96 16, 188 20, 268 17" strokeWidth={strokeWidth * 0.55} />
    </DrawSvg>
  );
}

/** Loose, overshooting hand-drawn circle. */
export function HandCircle({ className, delay, onLoad, strokeWidth = 3 }: StrokeProps) {
  return (
    <DrawSvg
      viewBox="0 0 200 90"
      preserveAspectRatio="none"
      strokeWidth={strokeWidth}
      delay={delay}
      onLoad={onLoad}
      duration={1.5}
      className={cn("pointer-events-none absolute", className)}
    >
      <path
        data-draw
        pathLength={1}
        d="M178 26 C 150 4, 52 -2, 20 28 C -4 52, 34 84, 104 84 C 172 84, 204 56, 188 28 C 180 14, 156 8, 132 6"
      />
    </DrawSvg>
  );
}

/** Curvy hand-drawn arrow, points right and slightly down. */
export function HandArrow({ className, delay, onLoad, strokeWidth = 3 }: StrokeProps) {
  return (
    <DrawSvg
      viewBox="0 0 140 90"
      strokeWidth={strokeWidth}
      delay={delay}
      onLoad={onLoad}
      className={cn("pointer-events-none", className)}
    >
      <path data-draw pathLength={1} d="M6 70 C 20 20, 80 4, 124 44" />
      <path data-draw pathLength={1} d="M100 36 L126 46 L110 70" />
    </DrawSvg>
  );
}

/** A single flowing flourish — used under the signature. */
export function HandFlourish({ className, delay, strokeWidth = 4 }: StrokeProps) {
  return (
    <DrawSvg
      viewBox="0 0 300 30"
      preserveAspectRatio="none"
      strokeWidth={strokeWidth}
      delay={delay}
      duration={1.6}
      className={cn("pointer-events-none", className)}
    >
      <path data-draw pathLength={1} d="M6 22 C 60 4, 118 28, 190 12 S 276 6, 294 14" />
    </DrawSvg>
  );
}
