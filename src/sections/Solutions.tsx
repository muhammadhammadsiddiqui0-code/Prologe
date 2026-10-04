import { useLayoutEffect, useRef, type PointerEvent } from "react";
import { solutions, type Solution } from "../content/content";
import { gsap, MQ_MOTION_DESKTOP } from "../lib/motion";
import { useTopic } from "../lib/topic";
import { DrawSvg } from "../components/ui/Hand";
import { SplitHeading } from "../components/ui/SplitHeading";
import { Reveal } from "../components/ui/Reveal";
import { cn } from "../utils/cn";

/* Simple hand-drawn illustrations, one per solution. */
function SolutionArt({ kind }: { kind: Solution["art"] }) {
  return (
    <DrawSvg viewBox="0 0 200 200" className="h-full w-full" strokeWidth={3} duration={1.6}>
      {kind === "door" && (
        <>
          <path data-draw pathLength={1} d="M16 176 H184" />
          <path data-draw pathLength={1} d="M44 176 V86 C44 44 156 44 156 86 V176" />
          <path data-draw pathLength={1} d="M74 176 V112 C74 94 126 94 126 112 V176" />
          <path data-draw pathLength={1} d="M100 14 V28 M62 24 L70 36 M138 24 L130 36" />
        </>
      )}
      {kind === "scales" && (
        <>
          <path data-draw pathLength={1} d="M64 174 H136 M100 36 V174" />
          <path data-draw pathLength={1} d="M36 64 C70 50 130 50 164 64" />
          <path data-draw pathLength={1} d="M36 64 L18 120 H54 Z" />
          <path data-draw pathLength={1} d="M164 64 L146 120 H182 Z" />
          <path data-draw pathLength={1} d="M95 30 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0" />
        </>
      )}
      {kind === "steps" && (
        <>
          <path data-draw pathLength={1} d="M14 180 H62 V144 H102 V108 H142 V72 H186" />
          <path data-draw pathLength={1} d="M146 40 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0" />
          <path data-draw pathLength={1} d="M30 150 C 44 126 70 120 86 98" />
          <path data-draw pathLength={1} d="M70 96 H88 V114" />
        </>
      )}
    </DrawSvg>
  );
}

const PANEL_BG = [
  "from-[#093c4c] to-[#0a4859]",
  "from-[#0a4659] to-[#0c566a]",
  "from-[#0b5063] to-[#0f6178]",
];

function Arrow() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Card({ s, index }: { s: Solution; index: number }) {
  const { selectTopic } = useTopic();

  // Colour wash grows from where the pointer enters and retreats toward where it leaves.
  const setOrigin = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--wx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--wy", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <article
      data-card
      aria-labelledby={`${s.id}-title`}
      style={{ top: `calc(5.75rem + ${index * 1.1}rem)` }}
      className={cn(
        "group/card origin-top lg:sticky",
        index < solutions.items.length - 1 && "mb-6 lg:mb-8",
      )}
      onPointerEnter={setOrigin}
      onPointerLeave={setOrigin}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[2rem] border border-white/10 bg-linear-to-br shadow-[0_30px_70px_-40px_rgba(0,0,0,0.8)]",
          "transition-[transform,box-shadow] duration-[800ms] ease-calm hover:-translate-y-2 hover:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] lg:min-h-[min(35rem,calc(100svh-10rem))]",
          PANEL_BG[index],
        )}
      >
        {/* Brand colour wash */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-brand-500 transition-[clip-path] duration-[1000ms] ease-calm [clip-path:circle(0%_at_var(--wx,50%)_var(--wy,100%))] group-hover/card:[clip-path:circle(150%_at_var(--wx,50%)_var(--wy,100%))] group-focus-within/card:[clip-path:circle(150%_at_var(--wx,50%)_var(--wy,100%))]"
        />
        {/* Ghost number */}
        <span
          aria-hidden="true"
          className="display pointer-events-none absolute -bottom-12 -right-4 select-none text-[16rem] leading-none text-white/[0.045] transition-colors duration-700 group-hover/card:text-brand-950/10 md:text-[22rem]"
        >
          {s.number}
        </span>

        <div className="relative z-10 grid gap-8 p-7 text-white transition-colors duration-700 group-hover/card:text-brand-950 group-focus-within/card:text-brand-950 md:p-10 lg:grid-cols-12 lg:gap-10 lg:p-14">
          <div className="flex flex-col lg:col-span-8">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-hand text-4xl font-bold leading-none text-brand-300 transition-colors duration-700 group-hover/card:text-brand-950 group-focus-within/card:text-brand-950">
                {s.number}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-current/40 px-4 py-1.5 text-[0.78rem] font-semibold uppercase tracking-[0.14em]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
                  <circle cx="12" cy="9.5" r="2.4" />
                </svg>
                <span className="sr-only">Regions: </span>
                {s.region}
              </span>
            </div>

            <h3
              id={`${s.id}-title`}
              className="display mt-6 text-[clamp(2.4rem,5.2vw,4.75rem)] leading-[0.98]"
            >
              {s.title}
            </h3>
            {s.subtitle && (
              <p className="font-story mt-3 text-xl italic text-brand-200 transition-colors duration-700 group-hover/card:text-brand-950 group-focus-within/card:text-brand-950 md:text-2xl">
                {s.subtitle}
              </p>
            )}

            <p className="mt-7 max-w-2xl text-[1.08rem] leading-relaxed md:text-xl">{s.lead}</p>
            <p className="mt-4 max-w-2xl text-[0.98rem] leading-relaxed text-white/75 transition-colors duration-700 group-hover/card:text-brand-950/90 group-focus-within/card:text-brand-950/90 md:text-[1.05rem]">
              {s.body}
            </p>

            <a
              href="#connect"
              onClick={() => selectTopic(s.interest)}
              className="group/link mt-9 inline-flex w-fit items-center gap-4 text-lg font-semibold lg:mt-auto lg:pt-9"
            >
              <span className="link-draw">
                {solutions.cta}
                <span className="sr-only">: {s.title}</span>
              </span>
              <span className="grid h-12 w-12 place-items-center rounded-full border border-current transition-transform duration-500 ease-calm group-hover/link:translate-x-2">
                <Arrow />
              </span>
            </a>
          </div>

          <div
            aria-hidden="true"
            className="hidden h-60 w-60 self-start justify-self-end text-brand-300 transition-colors duration-700 group-hover/card:text-brand-950 group-focus-within/card:text-brand-950 lg:col-span-4 lg:block xl:h-72 xl:w-72"
          >
            <SolutionArt kind={s.art} />
          </div>
        </div>

        {/* Dims as the next card slides over it (driven by GSAP on desktop) */}
        <span
          data-dim
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 bg-brand-950 opacity-0"
        />
      </div>
    </article>
  );
}

export function Solutions() {
  const root = useRef<HTMLElement>(null);

  // Stacking: each card scales back and dims as the next one slides over it.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MQ_MOTION_DESKTOP, () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", el);
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        const dim = card.querySelector("[data-dim]");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: next, start: "top 90%", end: "top 24%", scrub: true },
        });
        tl.to(card, { scale: 0.93, ease: "none" }, 0);
        if (dim) tl.to(dim, { opacity: 0.6, ease: "none" }, 0);
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={root}
      id="solutions"
      data-nav="solutions"
      data-theme="dark"
      aria-labelledby="solutions-title"
      className="relative z-20 -mt-10 rounded-t-[2.5rem] bg-brand-950 pb-32 pt-24 text-white md:-mt-14 md:rounded-t-[3.5rem] md:pb-40 md:pt-36"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <header className="mb-14 grid items-end gap-6 md:mb-24 md:grid-cols-12">
          <Reveal as="p" className="eyebrow text-brand-300 md:col-span-3 md:pb-5">
            {solutions.eyebrow}
          </Reveal>
          <SplitHeading
            as="h2"
            id="solutions-title"
            text={solutions.title}
            deco={{ 1: "underline" }}
            className="display text-[clamp(3.2rem,9.5vw,8.5rem)] leading-[0.95] md:col-span-9"
          />
        </header>

        <div className="relative">
          {solutions.items.map((s, i) => (
            <Card key={s.id} s={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
