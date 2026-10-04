import { useLayoutEffect, useRef } from "react";
import { hero } from "../content/content";
import { gsap, MQ_MOTION } from "../lib/motion";
import { Button } from "../components/ui/Button";
import { HandArrow, HandUnderline } from "../components/ui/Hand";
import { HeroPaths } from "./HeroPaths";
import { Markets } from "./Markets";

/**
 * Hero is "pinned" with CSS sticky inside this wrapper, so the markets strip
 * (rounded top edge) slides over it — an overlap transition with no JS pinning.
 */
export function Hero() {
  const wrap = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = wrap.current;
    if (!root) return;
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    mm.add(MQ_MOTION, () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.2 });
      tl.from(q(".hero-line-in"), { yPercent: 118, duration: 1.3, stagger: 0.16 })
        .from(q(".hero-fade"), { y: 26, opacity: 0, duration: 1.1, stagger: 0.12 }, "-=0.75");

      gsap.to(q(".hero-content"), {
        opacity: 0.25,
        y: -40,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: true },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={wrap} className="relative">
      <section
        id="home"
        data-nav="home"
        data-theme="dark"
        aria-label="Introduction"
        className="grain sticky top-0 isolate h-[100svh] min-h-[640px] overflow-hidden bg-brand-950 text-white"
      >
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
          <div className="hero-glow hero-glow-a" />
          <div className="hero-glow hero-glow-b" />
          <div className="hero-glow hero-glow-c" />
          <HeroPaths />
        </div>

        <div className="hero-content relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-12 pt-28 md:px-10 md:pb-16">
          <p className="hero-fade eyebrow mb-7 text-brand-300 md:mb-9">{hero.eyebrow}</p>

          <h1
            className="display text-[clamp(3.7rem,15vw,14rem)] leading-[0.88] tracking-[-0.04em]"
            aria-label={hero.lines.join(" ")}
          >
            {hero.lines.map((line, i) => (
              <span
                key={line}
                aria-hidden="true"
                className="block overflow-hidden pb-[0.2em] -mb-[0.2em]"
              >
                <span className="hero-line-in relative inline-block will-change-transform">
                  {i === hero.lines.length - 1 ? (
                    <>
                      <em className="font-light text-brand-400">Step</em>{" "}
                      <span className="relative inline-block">
                        Today
                        <HandUnderline
                          onLoad
                          delay={1.7}
                          className="-bottom-[0.02em] h-[0.17em] text-brand-500"
                        />
                      </span>
                    </>
                  ) : (
                    line
                  )}
                </span>
              </span>
            ))}
          </h1>

          <div className="mt-9 grid gap-8 md:mt-14 md:grid-cols-12 md:items-end">
            <p className="hero-fade max-w-md text-lg leading-snug text-white/80 md:col-span-5 md:text-xl">
              {hero.sub}
            </p>
            <div className="hero-fade md:col-span-5">
              <div className="relative inline-block">
                <HandArrow
                  onLoad
                  delay={2.2}
                  className="absolute -left-28 -top-9 hidden h-16 w-24 text-brand-400 lg:block"
                />
                <Button href="#connect" variant="primary">
                  {hero.cta}
                </Button>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="hero-fade hidden items-center justify-end gap-4 text-white/70 md:col-span-2 md:flex"
            >
              <span className="eyebrow [writing-mode:vertical-rl]">{hero.scroll}</span>
              <span className="cue-line" />
            </div>
          </div>
        </div>
      </section>

      <Markets />
    </div>
  );
}
