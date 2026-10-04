# Prologe — one-page site

Editorial, interactive one-pager for Prologe.ae (HR consulting, UAE).

**Stack:** React 19 · Vite · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis · Framer Motion · React Hook Form + Zod.
(The brief asked for Next.js; this project is a static Vite build, so the server-side form handler lives in `api/contact.ts` as a portable serverless function instead of a Next route.)

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/index.html (single file) + public assets
```

## Where things are

| What | Where |
| --- | --- |
| **All copy** (live-site text, UI labels, SEO) | `src/content/content.ts` |
| Colours, fonts, easing tokens | `src/index.css` (`@theme`) |
| Sections | `src/sections/*` (Hero, Markets, Solutions, Story, Way, Connect, Footer) |
| Hand-drawn strokes, split text, magnetic buttons, cursor | `src/components/ui/*`, `src/components/Cursor.tsx` |
| Form + shared validation schema | `src/components/ContactForm.tsx`, `src/lib/contact-schema.ts` |
| Serverless handler (Resend + Supabase) | `api/contact.ts` |
| Lead table | `supabase/schema.sql` |
| Privacy page | `src/pages/Privacy.tsx` (route: `/#/privacy`, `/privacy/` redirects there) |

## Make the form live

1. Run `supabase/schema.sql` in a Supabase project.
2. In Resend, verify the `prologe.ae` domain.
3. Deploy to Vercel (build `npm run build`, output `dist`; `api/` is picked up automatically) and set the variables from `.env.example`.

Until `/api/contact` exists the form **does not pretend to succeed**: it shows an error with a pre-filled "Email connect@prologe.ae" fallback link. Rate limiting is client-side (60 s cool-down) and server-side (5 requests / 10 min / IP, in-memory — use Upstash/KV for strict limits). A honeypot field and a minimum-fill-time check drop bots silently.

## Open items — marked [PLACEHOLDER]

- **Logo** — set `site.logoSrc` in `content.ts` to the real white handwritten wordmark (SVG/PNG in `public/`). A handwritten-font stand-in is shown until then.
- **Founder portrait** — set `story.portrait.src`. A code-brackets-and-heart illustration holds the slot.
- **Privacy page** — company name, providers/region, retention period, last-updated date. Have it reviewed legally.
- **Colours** — `#1BB0CE` is from the brief; the rest of the scale is derived from it (see the contrast notes at the top of `index.css`) because the live site's other colour tokens could not be read.
- **WhatsApp** — links to `wa.me/971569710315`; confirm that number is on WhatsApp.

## Notes

- `prefers-reduced-motion`: Lenis is off, GSAP animations don't run (content and drawn strokes are simply visible), marquee is static.
- Nav order follows scroll order (Home, Solutions, Story, Connect); reorder in `content.ts`.
- Brand teal carries ink text, never white (white on `#1BB0CE` is 2.6:1).
