import { useLayoutEffect, useRef } from "react";
import { story } from "../content/content";
import { gsap, MQ_MOTION, ScrollTrigger } from "../lib/motion";
import { DrawSvg, HandFlourish } from "../components/ui/Hand";
import { Reveal } from "../components/ui/Reveal";
import { SplitHeading } from "../components/ui/SplitHeading";

/** Placeholder art for the portrait slot: code brackets + a heart (systems + human connection). */
function PortraitPlaceholder() {
  return (
    <div className="relative h-full w-full bg-linear-to-br from-brand-900 via-brand-800 to-brand-700">
      <DrawSvg
        viewBox="0 0 400 500"
        className="absolute inset-0 h-full w-full text-brand-300"
        strokeWidth={5}
        duration={2}
      >
        <path data-draw pathLength={1} d="M148 196 L92 240 L148 284" />
        <path data-draw pathLength={1} d="M252 196 L308 240 L252 284" />
        <path data-draw pathLength={1} d="M218 186 L182 294" />
        <path
          data-draw
          pathLength={1}
          d="M200 424 C 146 384 124 342 160 322 C 182 310 200 326 200 338 C 200 326 218 310 240 322 C 276 342 254 384 200 424 Z"
        />
      </DrawSvg>
    </div>
  );
}

export function Story() {
  const root = useRef<HTMLElement>(null);

  // Portrait parallax: the image moves slower than the frame it sits in.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MQ_MOTION, () => {
      const img = el.querySelector(".portrait-parallax");
      const frame = el.querySelector(".portrait-frame");
      if (!img || !frame) return;
      gsap.fromTo(
        img,
        { yPercent: -7 },
        {
          yPercent: 7,
          ease: "none",
          scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    });
    return () => mm.revert();
  }, []);

  // Layout above grows as fonts load; keep triggers honest.
  useLayoutEffect(() => {
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => window.clearTimeout(t);
  }, []);

  const { portrait } = story;

  return (
    <section
      ref={root}
      id="story"
      data-nav="story"
      data-theme="light"
      aria-labelledby="story-title"
      className="relative z-30 -mt-10 rounded-t-[2.5rem] bg-white pb-36 pt-24 text-ink md:-mt-14 md:rounded-t-[3.5rem] md:pb-44 md:pt-36"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <header className="max-w-5xl">
          <Reveal as="p" className="eyebrow text-brand-700">
            {story.eyebrow}
          </Reveal>
          <SplitHeading
            as="h2"
            id="story-title"
            text={story.title}
            deco={{ 10: "circle" }}
            className="display mt-6 text-[clamp(2.6rem,6.6vw,6.25rem)] leading-[1.02] text-brand-950"
          />
        </header>

        {/* Editorial split */}
        <div className="mt-16 grid gap-14 md:mt-24 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <figure>
                <div className="portrait-frame relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-brand-100">
                  <div className="portrait-parallax absolute -top-[9%] left-0 h-[118%] w-full">
                    {portrait.src ? (
                      <img
                        src={portrait.src}
                        alt={portrait.alt}
                        width={1000}
                        height={1250}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <PortraitPlaceholder />
                    )}
                  </div>
                  {!portrait.src && (
                    <p className="absolute inset-x-0 bottom-0 bg-linear-to-t from-brand-950/80 to-transparent px-6 pb-5 pt-12 text-sm font-medium text-white">
                      {portrait.placeholderLabel}
                    </p>
                  )}
                </div>
                <figcaption className="mt-5 font-hand text-3xl font-bold text-brand-700">
                  {portrait.caption}
                </figcaption>
              </figure>
            </div>
          </div>

          <div className="space-y-9 lg:col-span-7 lg:pt-6">
            {story.paragraphs.map((p, i) => (
              <Reveal
                key={i}
                as="p"
                y={44}
                className={
                  "font-story text-[1.3rem] leading-[1.6] text-brand-950/90 md:text-[1.6rem] md:leading-[1.55]" +
                  (i === 0 ? " drop-cap" : "")
                }
              >
                {p}
              </Reveal>
            ))}
          </div>
        </div>

        {/* Pull quote + sign-off */}
        <figure className="relative mt-32 md:mt-48">
          <span
            aria-hidden="true"
            className="display pointer-events-none absolute -left-2 -top-24 select-none text-[13rem] leading-none text-brand-100 md:-top-40 md:text-[24rem]"
          >
            “
          </span>
          <blockquote className="relative">
            <SplitHeading
              as="p"
              text={story.pullQuote}
              deco={{ 9: "underline" }}
              className="display text-[clamp(2.5rem,6.8vw,6.4rem)] font-light italic leading-[1.02] tracking-[-0.03em] text-brand-950"
            />
          </blockquote>

          <figcaption className="mt-14 flex flex-col gap-10 md:mt-20 md:flex-row md:items-end md:justify-between">
            <Reveal
              as="p"
              className="font-story max-w-md text-2xl italic leading-snug text-brand-950/90 md:text-[2rem]"
            >
              {story.closing}
            </Reveal>
            <div className="w-fit">
              <p className="-rotate-3 font-hand text-[4.5rem] font-bold leading-[0.9] text-brand-700 md:text-[6.5rem]">
                {story.signature}
              </p>
              <HandFlourish className="mt-1 h-7 w-full text-brand-500" />
              <p className="eyebrow mt-4 text-brand-700">{story.role}</p>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
