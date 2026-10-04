import { useLayoutEffect, useRef, useState } from "react";
import { way } from "../content/content";
import { gsap, MQ_MOTION, ScrollTrigger, prefersReducedMotion } from "../lib/motion";
import { DrawSvg } from "../components/ui/Hand";
import { Reveal } from "../components/ui/Reveal";
import { SplitHeading } from "../components/ui/SplitHeading";
import { cn } from "../utils/cn";

/* ───────────────────────── Sprint figure: "2–4 weeks" ───────────────────────── */

const ARC_R = 90;
const arcs = [0, 1, 2, 3].map((k) => {
  const a0 = ((-90 + k * 90 + 8) * Math.PI) / 180;
  const a1 = ((-90 + (k + 1) * 90 - 8) * Math.PI) / 180;
  const pt = (a: number) => `${(100 + ARC_R * Math.cos(a)).toFixed(2)} ${(100 + ARC_R * Math.sin(a)).toFixed(2)}`;
  return `M ${pt(a0)} A ${ARC_R} ${ARC_R} 0 0 1 ${pt(a1)}`;
});

function SprintFigure() {
  const ref = useRef<HTMLDivElement>(null);

  // Count the figures up when the ring scrolls into view.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MQ_MOTION, () => {
      el.querySelectorAll<HTMLElement>("[data-count]").forEach((node) => {
        const to = Number(node.dataset.count);
        const o = { v: 0 };
        node.textContent = "0";
        gsap.to(o, {
          v: to,
          duration: 1.8,
          ease: "power2.out",
          onUpdate: () => {
            node.textContent = String(Math.round(o.v));
          },
          scrollTrigger: { trigger: el, start: "top 80%", once: true },
        });
      });
    });
    return () => mm.revert();
  }, []);

  const { figure } = way;
  return (
    <div
      ref={ref}
      role="img"
      aria-label={`Two to four ${figure.unit} ${figure.caption}`}
      className="relative mx-auto aspect-square w-full max-w-[26rem]"
    >
      <DrawSvg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full -rotate-0" strokeWidth={5} duration={1.8}>
        {arcs.map((d, k) => (
          <path
            key={k}
            data-draw
            pathLength={1}
            d={d}
            stroke="var(--color-brand-500)"
            strokeOpacity={k < 2 ? 1 : 0.32}
          />
        ))}
      </DrawSvg>
      <div aria-hidden="true" className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="display flex items-baseline justify-center text-[clamp(4.5rem,11vw,7.5rem)] leading-none tracking-[-0.04em] tabular-nums">
            <span data-count={figure.from}>{figure.from}</span>
            <span className="mx-1 font-light text-brand-400">–</span>
            <span data-count={figure.to}>{figure.to}</span>
          </p>
          <p className="font-story mt-1 text-3xl italic text-brand-300">{figure.unit}</p>
          <p className="eyebrow mt-4 text-white/70">{figure.caption}</p>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── Interactive timeline ───────────────────────────── */

const TL_PATH =
  "M0 75 C 60 75, 70 45, 125 45 S 300 105, 375 105 S 560 45, 625 45 S 800 105, 875 105 S 960 75, 1000 75";
const NODES: Array<[number, number]> = [
  [125, 45],
  [375, 105],
  [625, 45],
  [875, 105],
];

function Timeline() {
  const root = useRef<HTMLDivElement>(null);
  const reduce = prefersReducedMotion();
  const lastStep = useRef(reduce ? 3 : -1);
  // reached = how far the scroll-drawn line has got; selected = what the user (or scroll) highlights
  const [reached, setReached] = useState(reduce ? 3 : -1);
  const [selected, setSelected] = useState(0);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MQ_MOTION, () => {
      const base = el.querySelector<SVGPathElement>("[data-base]");
      const prog = el.querySelector<SVGPathElement>("[data-prog]");
      const walker = el.querySelector<SVGCircleElement>("[data-walker]");
      const rail = el.querySelector<HTMLElement>("[data-rail]");

      // Where along the path each node sits (falls back to even spacing when the SVG isn't rendered)
      let len = 0;
      let nodeP = [0.125, 0.375, 0.625, 0.875];
      try {
        len = base?.getTotalLength() ?? 0;
        if (base && len > 0) {
          nodeP = NODES.map(([nx, ny]) => {
            let best = 0;
            let bd = Infinity;
            for (let l = 0; l <= len; l += 2) {
              const pt = base.getPointAtLength(l);
              const d = (pt.x - nx) ** 2 + (pt.y - ny) ** 2;
              if (d < bd) {
                bd = d;
                best = l;
              }
            }
            return best / len;
          });
        }
      } catch {
        len = 0;
      }

      const update = (p: number) => {
        if (prog) prog.style.strokeDashoffset = String(1.02 - p * 1.02);
        if (walker && base && len > 0) {
          const pt = base.getPointAtLength(len * p);
          walker.setAttribute("cx", String(pt.x));
          walker.setAttribute("cy", String(pt.y));
          walker.style.opacity = p > 0.004 && p < 0.996 ? "1" : "0";
        }
        if (rail) rail.style.transform = `scaleY(${p})`;
        const step = nodeP.filter((v) => p >= v - 0.004).length - 1;
        if (step !== lastStep.current) {
          lastStep.current = step;
          setReached(step);
          if (step >= 0) setSelected(step);
        }
      };

      const st = ScrollTrigger.create({
        trigger: el,
        start: "top 78%",
        end: "bottom 58%",
        onUpdate: (self) => update(self.progress),
      });
      update(st.progress);
    });
    return () => mm.revert();
  }, []);

  const steps = way.steps;

  return (
    <div ref={root} className="mt-24 md:mt-40" role="group" aria-label={way.timelineLabel}>
      {/* Desktop: curved path that draws itself */}
      <div className="hidden md:block">
        <svg viewBox="0 0 1000 150" className="w-full overflow-visible" fill="none" aria-hidden="true" focusable="false">
          <path
            data-base
            d={TL_PATH}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="2"
            strokeDasharray="2 11"
            strokeLinecap="round"
          />
          <path
            data-prog
            pathLength={1}
            d={TL_PATH}
            stroke="var(--color-brand-500)"
            strokeWidth="4"
            strokeLinecap="round"
            style={{ strokeDasharray: 1, strokeDashoffset: reduce ? 0 : 1.02 }}
          />
          {NODES.map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <circle
                r="30"
                fill="none"
                stroke="var(--color-brand-300)"
                strokeOpacity={selected === i ? 0.5 : 0}
                style={{ transition: "stroke-opacity .7s var(--ease-calm)" }}
              />
              <circle
                r="17"
                fill="var(--color-brand-950)"
                stroke={reached >= i ? "var(--color-brand-500)" : "rgba(255,255,255,0.35)"}
                strokeWidth="3"
                style={{ transition: "stroke .7s var(--ease-calm)" }}
              />
              <circle
                r="7"
                fill="var(--color-brand-500)"
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  transform: reached >= i ? "scale(1)" : "scale(0)",
                  transition: "transform .7s var(--ease-calm)",
                }}
              />
            </g>
          ))}
          <circle
            data-walker
            r="6"
            cx="0"
            cy="75"
            fill="var(--color-brand-300)"
            style={{ opacity: 0, transition: "opacity .4s" }}
          />
        </svg>

        <ol className="mt-5 grid grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.n}>
              <button
                type="button"
                aria-current={selected === i ? "step" : undefined}
                onClick={() => setSelected(i)}
                onFocus={() => setSelected(i)}
                onMouseEnter={() => setSelected(i)}
                className={cn(
                  "mx-auto block w-full max-w-[16rem] rounded-2xl px-3 py-4 text-center transition-opacity duration-700 ease-calm",
                  selected === i ? "opacity-100" : "opacity-60 hover:opacity-90",
                )}
              >
                <span className="font-hand text-3xl font-bold leading-none text-brand-400">{s.n}</span>
                <span className="display mt-2 block text-[clamp(1.5rem,2.3vw,2.2rem)] leading-tight">{s.title}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "mx-auto mt-3 block h-[3px] w-14 origin-center rounded bg-brand-500 transition-transform duration-700 ease-calm",
                    selected === i ? "scale-x-100" : "scale-x-0",
                  )}
                />
                <span className="font-story mt-4 block text-lg italic leading-snug text-white/85">{s.text}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* Mobile: vertical rail */}
      <ol className="relative ml-3 md:hidden">
        <span aria-hidden="true" className="absolute bottom-3 left-0 top-3 w-px bg-white/20" />
        <span
          data-rail
          aria-hidden="true"
          className="absolute bottom-3 left-0 top-3 w-[3px] origin-top -translate-x-px rounded bg-brand-500"
          style={{ transform: reduce ? "scaleY(1)" : "scaleY(0)" }}
        />
        {steps.map((s, i) => (
          <li key={s.n} className="relative pb-10 pl-9 last:pb-0">
            <span
              aria-hidden="true"
              className={cn(
                "absolute -left-[10px] top-2 h-5 w-5 rounded-full border-[3px] bg-brand-950 transition-colors duration-700",
                reached >= i ? "border-brand-500" : "border-white/35",
              )}
            >
              <span
                className={cn(
                  "absolute inset-[3px] rounded-full bg-brand-500 transition-transform duration-700",
                  reached >= i ? "scale-100" : "scale-0",
                )}
              />
            </span>
            <p className="font-hand text-3xl font-bold leading-none text-brand-400">{s.n}</p>
            <p className="display mt-1 text-3xl leading-tight">{s.title}</p>
            <p className="font-story mt-2 text-xl italic leading-snug text-white/85">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ──────────────────────────────────── Section ──────────────────────────────────── */

export function Way() {
  return (
    <section
      id="way"
      data-nav="story"
      data-theme="dark"
      aria-labelledby="way-title"
      className="relative z-40 -mt-10 overflow-hidden rounded-t-[2.5rem] bg-brand-950 pb-36 pt-24 text-white md:-mt-14 md:rounded-t-[3.5rem] md:pb-44 md:pt-36"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-20 h-[42rem] w-[42rem] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(27,176,206,0.2), rgba(27,176,206,0))" }}
      />
      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Reveal as="p" className="eyebrow text-brand-300">
              {way.eyebrow}
            </Reveal>
            <SplitHeading
              as="h2"
              id="way-title"
              text={way.title}
              deco={{ 2: "underline" }}
              className="display mt-6 text-[clamp(3.4rem,10.5vw,9.5rem)] leading-[0.92]"
            />
            <div className="mt-10 max-w-xl space-y-6 md:mt-14">
              {way.paragraphs.map((p, i) => (
                <Reveal
                  key={i}
                  as="p"
                  className={cn(
                    "leading-relaxed",
                    i === 0
                      ? "font-story text-2xl italic text-brand-200 md:text-[1.9rem] md:leading-snug"
                      : "text-lg text-white/80 md:text-xl",
                  )}
                >
                  {p}
                </Reveal>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5">
            <SprintFigure />
          </div>
        </div>

        <Timeline />
      </div>
    </section>
  );
}
