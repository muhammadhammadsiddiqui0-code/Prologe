import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, MQ_MOTION } from "../lib/motion";

const NS = "http://www.w3.org/2000/svg";

/** Generative flowing line motif: a handful of offset, drifting curves. */
const flowLines = (w: number, h: number, n: number) =>
  Array.from({ length: n }, (_, k) => {
    const y = h * 0.22 + k * h * 0.08;
    return `M ${-w * 0.1} ${y + 80} C ${w * 0.2} ${y - 120}, ${w * 0.45} ${y + 200}, ${w * 0.7} ${y + 20} S ${w} ${y - 140}, ${w * 1.15} ${y - 60}`;
  });

const VARIANTS = {
  desktop: {
    viewBox: "0 0 1440 900",
    d: "M -40 830 C 240 790, 300 520, 540 560 S 900 770, 1050 520 S 1290 230, 1500 130",
    flow: flowLines(1440, 900, 7),
    gap: 78,
  },
  mobile: {
    viewBox: "0 0 400 900",
    d: "M -20 880 C 120 840, 40 650, 180 610 S 340 570, 300 410 S 190 230, 430 110",
    flow: flowLines(400, 900, 6),
    gap: 60,
  },
} as const;

function useIsDesktop() {
  const [desktop, setDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const on = () => setDesktop(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return desktop;
}

/**
 * "One step" motif. A path winds across the hero; alternating footprints are placed
 * along it and light up one after another, then settle — like someone walking it.
 */
export function HeroPaths() {
  const desktop = useIsDesktop();
  const v = desktop ? VARIANTS.desktop : VARIANTS.mobile;
  const ref = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const path = svg.querySelector<SVGPathElement>("path[data-path]");
    const group = svg.querySelector<SVGGElement>("g[data-steps]");
    if (!path || !group) return;

    const len = path.getTotalLength();
    const steps: SVGGElement[] = [];
    for (let dist = 40, i = 0; dist < len - 24; dist += v.gap, i++) {
      const p = path.getPointAtLength(dist);
      const q = path.getPointAtLength(dist + 2);
      const ang = Math.atan2(q.y - p.y, q.x - p.x);
      const side = i % 2 ? 1 : -1;
      const cx = p.x + -Math.sin(ang) * side * 13;
      const cy = p.y + Math.cos(ang) * side * 13;

      const g = document.createElementNS(NS, "g");
      g.setAttribute("transform", `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${((ang * 180) / Math.PI).toFixed(1)})`);
      g.setAttribute("opacity", "0.3");
      const sole = document.createElementNS(NS, "ellipse");
      sole.setAttribute("rx", "10");
      sole.setAttribute("ry", "5.6");
      sole.setAttribute("cx", "3");
      const heel = document.createElementNS(NS, "ellipse");
      heel.setAttribute("rx", "4.6");
      heel.setAttribute("ry", "3.8");
      heel.setAttribute("cx", "-12");
      g.append(sole, heel);
      group.appendChild(g);
      steps.push(g);
    }

    const mm = gsap.matchMedia();
    mm.add(MQ_MOTION, () => {
      gsap.fromTo(
        steps,
        { opacity: 0 },
        {
          keyframes: { opacity: [0, 0.95, 0.3] },
          duration: 1.8,
          stagger: 0.17,
          delay: 1.1,
          ease: "power1.inOut",
        },
      );
    });

    return () => {
      mm.revert();
      group.replaceChildren();
    };
  }, [v]);

  return (
    <svg
      key={desktop ? "d" : "m"}
      ref={ref}
      className="absolute inset-0 h-full w-full text-brand-400"
      viewBox={v.viewBox}
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="currentColor" strokeWidth="1" opacity="0.13">
        {v.flow.map((d, i) => (
          <path
            key={i}
            d={d}
            className="flow-line"
            style={{ animationDelay: `${-i * 2.6}s`, animationDuration: `${16 + i * 3}s` }}
          />
        ))}
      </g>
      <path data-path d={v.d} stroke="none" />
      <g data-steps fill="currentColor" />
    </svg>
  );
}
