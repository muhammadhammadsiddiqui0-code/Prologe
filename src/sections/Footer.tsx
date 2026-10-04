import { useLayoutEffect, useRef } from "react";
import { connect, footer, nav, site } from "../content/content";
import { gsap, MQ_MOTION } from "../lib/motion";
import { HandFlourish } from "../components/ui/Hand";
import { Wordmark } from "../components/ui/Wordmark";

export function Footer() {
  const mark = useRef<HTMLDivElement>(null);

  // The oversized wordmark rises into place as the footer comes into view.
  useLayoutEffect(() => {
    const el = mark.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MQ_MOTION, () => {
      gsap.fromTo(
        el.querySelector(".mark-in"),
        { yPercent: 45, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        },
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <footer
      data-theme="dark"
      className="relative z-[60] -mt-10 overflow-hidden rounded-t-[2.5rem] bg-brand-950 pt-20 text-white md:-mt-14 md:rounded-t-[3.5rem] md:pt-28"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="display text-4xl leading-none">{site.tagline}</p>
            <p className="mt-3 text-lg text-white/75">{site.descriptor}</p>
            <p className="mt-8 font-hand text-4xl font-bold leading-none text-brand-300">
              {connect.note}
            </p>
          </div>

          <nav aria-label={footer.nav} className="md:col-span-3">
            <ul className="space-y-3 text-lg">
              {nav.map((item) => (
                <li key={item.id}>
                  <a href={item.href} className="link-draw">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-3 text-lg md:col-span-4">
            <a href={`tel:${site.phone.tel}`} className="link-draw block w-fit">
              {site.phone.display}
            </a>
            <a href={`mailto:${site.email}`} className="link-draw block w-fit">
              {site.email}
            </a>
            <p className="pt-2 text-white/75">{site.markets.join(", ")}</p>
          </div>
        </div>

        <div ref={mark} className="mt-20 overflow-hidden md:mt-28" aria-hidden="true">
          <div className="mark-in">
            <Wordmark
              className="block w-full text-center text-[clamp(7rem,31vw,29rem)] leading-[0.82] text-white"
            />
            <HandFlourish className="mx-auto -mt-2 h-8 w-[70%] text-brand-500 md:h-12" />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/15 py-7 text-sm text-white/75 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {site.tagline} {footer.rights}
          </p>
          <a href="#/privacy" className="link-draw">
            {footer.privacy}
          </a>
        </div>
      </div>
    </footer>
  );
}
