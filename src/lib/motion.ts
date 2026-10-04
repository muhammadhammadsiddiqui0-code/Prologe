import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Media queries used with gsap.matchMedia() so nothing animates for users who opt out. */
export const MQ_MOTION = "(prefers-reduced-motion: no-preference)";
export const MQ_FINE_POINTER = "(hover: hover) and (pointer: fine)";
export const MQ_MOTION_FINE = `${MQ_MOTION} and ${MQ_FINE_POINTER}`;
export const MQ_MOTION_DESKTOP = `${MQ_MOTION} and (min-width: 1024px)`;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger };
