import { Fragment, useLayoutEffect, useRef, type ElementType } from "react";
import { gsap, MQ_MOTION } from "../../lib/motion";
import { HandCircle, HandUnderline } from "./Hand";

type Deco = "circle" | "underline";

type Props = {
  text: string;
  as?: ElementType;
  id?: string;
  className?: string;
  /** Hand-drawn decoration by word index, e.g. { 2: "circle" }. */
  deco?: Record<number, Deco>;
  /** Animate on mount rather than on scroll. */
  onLoad?: boolean;
  delay?: number;
};

/**
 * Word-by-word masked reveal. The full text is exposed to assistive tech through
 * aria-label; the individual word spans are hidden from it.
 */
export function SplitHeading({
  text,
  as: Tag = "h2",
  id,
  className,
  deco,
  onLoad = false,
  delay = 0,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(" ");

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MQ_MOTION, () => {
      gsap.fromTo(
        el.querySelectorAll(".sw-in"),
        { yPercent: 118, rotate: 4, transformOrigin: "0% 100%" },
        {
          yPercent: 0,
          rotate: 0,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.07,
          delay,
          scrollTrigger: onLoad ? undefined : { trigger: el, start: "top 86%", once: true },
        },
      );
    });
    return () => mm.revert();
  }, [text, onLoad, delay]);

  return (
    <Tag ref={ref} id={id} className={className} aria-label={text}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="relative inline-block align-bottom" aria-hidden="true">
            <span className="inline-block overflow-hidden pb-[0.16em] -mb-[0.16em] align-bottom">
              <span className="sw-in inline-block will-change-transform">{word}</span>
            </span>
            {deco?.[i] === "circle" && (
              <HandCircle
                delay={0.9}
                className="-left-[8%] -top-[14%] h-[130%] w-[116%] text-brand-400"
              />
            )}
            {deco?.[i] === "underline" && (
              <HandUnderline delay={0.9} className="-bottom-[0.02em] h-[0.2em] text-brand-500" />
            )}
          </span>{" "}
        </Fragment>
      ))}
    </Tag>
  );
}
