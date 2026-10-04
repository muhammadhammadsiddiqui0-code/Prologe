import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, m as motion } from "framer-motion";
import { nav, site } from "../content/content";
import { Wordmark } from "./ui/Wordmark";
import { useSmooth } from "../lib/smooth-scroll";
import { cn } from "../utils/cn";

type Theme = "dark" | "light" | "brand";

/**
 * Sticky nav:
 *  – hides on scroll down, returns on scroll up
 *  – highlights the section under 40% of the viewport
 *  – inverts (white ↔ ink) depending on the section sitting under the bar
 *  – full-screen mobile menu with focus trap, Esc to close and scroll lock
 */
export function Nav() {
  const { stop, start } = useSmooth();
  const [theme, setTheme] = useState<Theme>("dark");
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /* Scroll behaviour --------------------------------------------------- */
  useEffect(() => {
    let raf = 0;
    let lastY = window.scrollY;

    const probe = () => {
      const x = window.innerWidth / 2;
      // Theme: the top-most themed section under the bar (works with overlapping/sticky sections)
      for (const el of document.elementsFromPoint(x, 44)) {
        if (el.closest("header")) continue;
        const host = el.closest<HTMLElement>("[data-theme]");
        if (host) {
          setTheme(host.dataset.theme as Theme);
          break;
        }
      }
      // Active link: section under 40% of the viewport
      for (const el of document.elementsFromPoint(x, window.innerHeight * 0.4)) {
        const host = el.closest<HTMLElement>("[data-nav]");
        if (host) {
          setActive(host.dataset.nav!);
          break;
        }
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        setScrolled(y > 24);
        const dy = y - lastY;
        if (Math.abs(dy) > 8) {
          setHidden(dy > 0 && y > 140);
          lastY = y;
        }
        if (y < 140) setHidden(false);
        probe();
      });
    };

    probe();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* Mobile menu: scroll lock, Esc, focus trap ---------------------------- */
  const closeMenu = useCallback(() => {
    setOpen(false);
    document.documentElement.style.overflow = "";
    start();
  }, [start]);

  useEffect(() => {
    if (!open) return;
    stop();
    document.documentElement.style.overflow = "hidden";
    const t = window.setTimeout(() => menuRef.current?.querySelector<HTMLElement>("a")?.focus(), 350);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const items = [
        toggleRef.current,
        ...Array.from(menuRef.current?.querySelectorAll<HTMLElement>("a, button") ?? []),
      ].filter(Boolean) as HTMLElement[];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, stop, closeMenu]);

  /* Visual state ---------------------------------------------------------- */
  const onDark = theme === "dark" || open;
  const bar = !scrolled || open
    ? "bg-transparent border-transparent"
    : theme === "dark"
      ? "bg-brand-950/70 backdrop-blur-md border-white/10"
      : theme === "brand"
        ? "bg-brand-500/80 backdrop-blur-md border-brand-950/10"
        : "bg-white/75 backdrop-blur-md border-brand-950/10";

  const focusColor = onDark ? "#78d5e8" : theme === "brand" ? "#052630" : "#0f7388";

  return (
    <>
      <header
        style={{ "--focus": focusColor } as CSSProperties}
        className={cn(
          "fixed inset-x-0 top-0 z-[100] border-b transition-[transform,background-color,border-color,color] duration-700 ease-calm",
          hidden && !open ? "-translate-y-full" : "translate-y-0",
          onDark ? "text-white" : "text-brand-950",
          bar,
        )}
      >
        <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between px-5 md:px-10">
          <a href="#home" aria-label="Prologe — back to top" className="inline-flex items-center">
            <Wordmark tone={onDark ? "light" : "dark"} className="text-[2.1rem] md:text-[2.4rem]" />
          </a>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-10">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    aria-current={active === item.id ? "location" : undefined}
                    className={cn(
                      "link-draw text-[0.95rem] font-medium tracking-tight",
                      active === item.id && "is-active",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <button
            ref={toggleRef}
            type="button"
            className="relative -mr-2 grid h-11 w-11 place-items-center md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => (open ? closeMenu() : setOpen(true))}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute h-[2px] w-6 rounded bg-current transition-transform duration-500 ease-calm",
                open ? "rotate-45" : "-translate-y-[5px]",
              )}
            />
            <span
              aria-hidden="true"
              className={cn(
                "absolute h-[2px] w-6 rounded bg-current transition-transform duration-500 ease-calm",
                open ? "-rotate-45" : "translate-y-[5px]",
              )}
            />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            data-theme="dark"
            className="fixed inset-0 z-[90] flex flex-col justify-between overflow-hidden bg-brand-950 px-6 pb-10 pt-28 text-white"
            initial={{ clipPath: "circle(0vmax at calc(100% - 42px) 36px)" }}
            animate={{ clipPath: "circle(150vmax at calc(100% - 42px) 36px)" }}
            exit={{ clipPath: "circle(0vmax at calc(100% - 42px) 36px)" }}
            transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full"
              style={{
                background: "radial-gradient(closest-side, rgba(27,176,206,0.32), rgba(27,176,206,0))",
              }}
            />
            <ul className="relative space-y-1">
              {nav.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, delay: 0.28 + i * 0.08, ease: [0.22, 0.61, 0.36, 1] }}
                >
                  <a
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={active === item.id ? "location" : undefined}
                    className="flex items-baseline gap-4 py-2"
                  >
                    <span className="font-hand text-2xl text-brand-400">0{i + 1}</span>
                    <span
                      className={cn(
                        "display text-[clamp(2.8rem,13vw,4.5rem)] leading-[1.05]",
                        active === item.id ? "text-brand-400" : "text-white",
                      )}
                    >
                      {item.label}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>

            <motion.div
              className="relative space-y-3 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <a href={`tel:${site.phone.tel}`} className="link-draw block w-fit">
                {site.phone.display}
              </a>
              <a href={`mailto:${site.email}`} className="link-draw block w-fit">
                {site.email}
              </a>
              <p className="pt-2 text-sm text-white/70">{site.markets.join(", ")}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
