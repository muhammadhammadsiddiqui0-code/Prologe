import { markets, site } from "../content/content";
import { cn } from "../utils/cn";

const REPEAT = 3;

function Group({ hidden }: { hidden?: boolean }) {
  const items = Array.from({ length: REPEAT }).flatMap(() => markets.items);
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((m, i) => (
        <li key={i} className="flex items-center">
          <span
            className={cn(
              "display whitespace-nowrap text-[clamp(3rem,8.5vw,7.5rem)] leading-none tracking-[-0.035em]",
              i % 2 ? "italic font-light" : "font-normal",
            )}
          >
            {m}
          </span>
          {/* little pair of footsteps as the separator */}
          <svg
            width="52"
            height="40"
            viewBox="0 0 52 40"
            className="mx-7 shrink-0 md:mx-12"
            fill="currentColor"
            aria-hidden="true"
          >
            <g transform="translate(14 27) rotate(-18)">
              <ellipse cx="2" rx="8.5" ry="4.8" />
              <ellipse cx="-10" rx="3.8" ry="3.2" />
            </g>
            <g transform="translate(36 13) rotate(-18)">
              <ellipse cx="2" rx="8.5" ry="4.8" />
              <ellipse cx="-10" rx="3.8" ry="3.2" />
            </g>
          </svg>
        </li>
      ))}
    </ul>
  );
}

/** Slow marquee of the four markets. Pauses on hover; static for reduced motion. */
export function Markets() {
  return (
    <section
      aria-label={markets.label}
      data-nav="home"
      data-theme="brand"
      className="relative z-10 rounded-t-[2.5rem] bg-brand-500 pb-20 pt-9 text-brand-950 md:rounded-t-[3.5rem] md:pb-28 md:pt-12"
    >
      <p className="sr-only">Serving {site.markets.join(", ")}.</p>
      <div className="marquee overflow-hidden">
        <div className="marquee-track">
          <Group />
          <Group hidden />
        </div>
      </div>
    </section>
  );
}
