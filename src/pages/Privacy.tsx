import type { ReactNode } from "react";
import { Footer } from "../sections/Footer";
import { Wordmark } from "../components/ui/Wordmark";
import { site } from "../content/content";

const sections: Array<{ title: string; body: ReactNode }> = [
  {
    title: "Who we are",
    body: (
      <p>
        Prologe.ae is an HR consulting business based in the UAE, serving the UAE, KSA, Kuwait and Oman. You can reach
        us at <a href={`mailto:${site.email}`} className="link-draw font-semibold text-brand-800">{site.email}</a> or on{" "}
        <a href={`tel:${site.phone.tel}`} className="link-draw font-semibold text-brand-800">{site.phone.display}</a>.{" "}
        [PLACEHOLDER: registered company name, licence number and registered address]
      </p>
    ),
  },
  {
    title: "What we collect",
    body: (
      <>
        <p>When you send a request through the contact form we collect the details you enter:</p>
        <ul className="mt-3 list-disc space-y-1 pl-6">
          <li>name, company, email address and phone number (with country code)</li>
          <li>your country and the area you’re interested in</li>
          <li>your message, and your consent to us replying</li>
        </ul>
        <p className="mt-3">
          To protect the form from automated spam we use a hidden field and a timer, and our server briefly uses your IP
          address for rate limiting. We don’t use advertising or analytics trackers on this site.
        </p>
      </>
    ),
  },
  {
    title: "How we use it",
    body: (
      <p>
        We use your details to read and reply to your request and to follow up on the project or partnership you
        asked about. We don’t sell your personal data.
      </p>
    ),
  },
  {
    title: "Who handles it for us",
    body: (
      <p>
        Your request is emailed to {site.email}, a confirmation is emailed to you, and the request is stored so we
        don’t lose it. This uses an email delivery provider and a database provider acting on our behalf.{" "}
        [PLACEHOLDER: confirm the providers in use (e.g. Resend, Supabase) and the region where data is stored]
      </p>
    ),
  },
  {
    title: "How long we keep it",
    body: <p>[PLACEHOLDER: retention period for enquiries, e.g. 12 months after the last contact]</p>,
  },
  {
    title: "Your choices",
    body: (
      <p>
        You can ask to see, correct or delete the personal data we hold about you at any time by emailing{" "}
        {site.email}.
      </p>
    ),
  },
  {
    title: "Cookies, local storage and fonts",
    body: (
      <p>
        This site doesn’t set cookies. After you send a request it stores a timestamp in your browser’s local
        storage so the form isn’t submitted twice by accident. Fonts are loaded from Google Fonts, which means your
        browser contacts Google’s servers to download them.
      </p>
    ),
  },
  {
    title: "Changes",
    body: <p>Last updated: [PLACEHOLDER: date]</p>,
  },
];

export default function Privacy() {
  return (
    <>
      <a href="#privacy-main" className="skip-link">
        Skip to content
      </a>
      <header data-theme="light" className="absolute inset-x-0 top-0 z-20 text-brand-950">
        <div className="mx-auto flex h-[72px] max-w-[1100px] items-center justify-between px-5 md:px-10">
          <a href="#home" aria-label="Prologe — back to the home page">
            <Wordmark tone="dark" className="text-[2.1rem] md:text-[2.4rem]" />
          </a>
          <a href="#home" className="link-draw text-[0.95rem] font-medium">
            Back to site
          </a>
        </div>
      </header>

      <main
        id="privacy-main"
        data-theme="light"
        className="relative z-50 bg-brand-50 pb-40 pt-36 text-ink md:pb-52 md:pt-48"
      >
        <div className="mx-auto max-w-[1100px] px-5 md:px-10">
          <p className="eyebrow text-brand-700">{site.tagline}</p>
          <h1 className="display mt-5 text-[clamp(3rem,8vw,6.5rem)] leading-none text-brand-950">Privacy</h1>
          <p className="font-story mt-8 max-w-2xl text-2xl italic leading-snug text-brand-950/90">
            A short, plain-language note on what this website collects and why.
          </p>

          <p className="mt-10 max-w-2xl rounded-2xl border border-brand-700/25 bg-white p-5 text-[0.95rem] text-brand-900">
            <strong className="font-semibold">Draft:</strong> this is a simple starting point, not legal advice. Please
            have it reviewed and complete the [PLACEHOLDER] items before publishing.
          </p>

          <div className="mt-16 space-y-12">
            {sections.map((s) => (
              <section key={s.title} className="grid gap-4 md:grid-cols-12 md:gap-10">
                <h2 className="display text-3xl leading-tight text-brand-950 md:col-span-4">{s.title}</h2>
                <div className="text-lg leading-relaxed text-brand-950/90 md:col-span-8">{s.body}</div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
