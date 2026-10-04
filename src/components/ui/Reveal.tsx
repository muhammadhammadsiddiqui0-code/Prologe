import { useLayoutEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, MQ_MOTION } from "../../lib/motion";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  y?: number;
  start?: string;
};

/** Calm fade-and-rise when scrolled into view. Visible by default (no-JS / reduced motion). */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  y = 36,
  start = "top 88%",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MQ_MOTION, () => {
      gsap.fromTo(
        el,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start, once: true },
        },
      );
    });
    return () => mm.revert();
  }, [delay, y, start]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
