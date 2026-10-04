import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import { SmoothScroll, useSmooth } from "./lib/smooth-scroll";
import { TopicProvider } from "./lib/topic";
import { ScrollTrigger } from "./lib/motion";
import { seo } from "./content/content";
import { Nav } from "./components/Nav";
import { Hero } from "./sections/Hero";
import { Solutions } from "./sections/Solutions";
import { Story } from "./sections/Story";
import { Way } from "./sections/Way";
import { Connect } from "./sections/Connect";
import { Footer } from "./sections/Footer";

// Non-critical pieces are split out of the main chunk.
const Cursor = lazy(() => import("./components/Cursor"));
const Privacy = lazy(() => import("./pages/Privacy"));

type Route = "home" | "privacy";

/** Hash routing keeps the site deployable on any static host. Section anchors are plain "#id". */
const getRoute = (): Route => (window.location.hash.startsWith("#/privacy") ? "privacy" : "home");

function Home() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Solutions />
        <Story />
        <Way />
        <Connect />
      </main>
      <Footer />
    </>
  );
}

function Router() {
  const [route, setRoute] = useState<Route>(getRoute);
  const { scrollTo } = useSmooth();
  const prevRoute = useRef<Route>(route);

  useEffect(() => {
    const onHash = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // In-page anchors scroll through Lenis; everything else is left to the browser.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (href === "#" || href.startsWith("#/")) return;
      const el = document.getElementById(href.slice(1));
      if (!el) return; // e.g. on the privacy page: let the hash change take us home
      e.preventDefault();
      if (href === "#home") scrollTo(0);
      else scrollTo(el);
      history.replaceState(null, "", href);
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [scrollTo]);

  // Title, scroll position and deep links on route change.
  useLayoutEffect(() => {
    const cameFromPrivacy = prevRoute.current === "privacy" && route === "home";
    prevRoute.current = route;

    if (route === "privacy") {
      document.title = "Privacy | Prologe";
      window.scrollTo(0, 0);
      return;
    }
    document.title = seo.title;

    const id = window.location.hash.slice(1);
    if (id && !id.startsWith("/")) {
      const t = window.setTimeout(() => {
        const el = document.getElementById(id);
        if (!el) return;
        ScrollTrigger.refresh();
        scrollTo(el, { immediate: true });
      }, 300);
      return () => window.clearTimeout(t);
    }
    if (cameFromPrivacy) window.scrollTo(0, 0);
  }, [route, scrollTo]);

  return route === "privacy" ? (
    <Suspense fallback={<div className="min-h-screen bg-brand-50" />}>
      <Privacy key="privacy" />
    </Suspense>
  ) : (
    <Home key="home" />
  );
}

export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <SmoothScroll>
          <TopicProvider>
            <Router />
            <Suspense fallback={null}>
              <Cursor />
            </Suspense>
          </TopicProvider>
        </SmoothScroll>
      </MotionConfig>
    </LazyMotion>
  );
}
