import { connect, site } from "../content/content";
import { ContactForm } from "../components/ContactForm";
import { Button } from "../components/ui/Button";
import { HandArrow } from "../components/ui/Hand";
import { Reveal } from "../components/ui/Reveal";
import { SplitHeading } from "../components/ui/SplitHeading";

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.7-5.4A8.5 8.5 0 1 1 21 11.5z" />
      <path d="M9 9.5c.4 2.2 2.3 4.1 4.5 4.5l1.3-1.3-1.9-1-.8.7c-.8-.4-1.5-1.1-1.9-1.9l.7-.8-1-1.9z" />
    </svg>
  );
}

export function Connect() {
  const wa = `https://wa.me/${site.phone.whatsapp}?text=${encodeURIComponent(connect.whatsappText)}`;

  return (
    <section
      id="connect"
      data-nav="connect"
      data-theme="light"
      aria-labelledby="connect-title"
      className="relative z-50 -mt-10 rounded-t-[2.5rem] bg-brand-50 pb-36 pt-24 text-ink md:-mt-14 md:rounded-t-[3.5rem] md:pb-48 md:pt-36"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <header className="max-w-5xl">
          <Reveal as="p" className="eyebrow text-brand-700">
            {connect.eyebrow}
          </Reveal>
          <SplitHeading
            as="h2"
            id="connect-title"
            text={connect.title}
            deco={{ 5: "circle" }}
            className="display mt-6 text-[clamp(2.8rem,7.4vw,6.75rem)] leading-[1.02] text-brand-950"
          />
        </header>

        <div className="mt-16 grid gap-14 md:mt-24 lg:grid-cols-12 lg:gap-16">
          {/* Contact details */}
          <div className="lg:col-span-5">
            <Reveal as="div" className="space-y-10">
              <dl className="space-y-10">
                <div>
                  <dt className="eyebrow text-brand-700">{connect.phoneLabel}</dt>
                  <dd className="mt-3">
                    <a
                      href={`tel:${site.phone.tel}`}
                      className="link-draw display text-[clamp(2rem,3.6vw,3rem)] leading-tight text-brand-950"
                    >
                      {site.phone.display}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-brand-700">{connect.emailLabel}</dt>
                  <dd className="mt-3">
                    <a
                      href={`mailto:${site.email}`}
                      className="link-draw display break-all text-[clamp(1.6rem,3.1vw,2.7rem)] leading-tight text-brand-950"
                    >
                      {site.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-brand-700">{connect.whatsappLabel}</dt>
                  <dd className="mt-4">
                    <Button href={wa} variant="dark" target="_blank" rel="noopener noreferrer" arrow={false}>
                      <ChatIcon />
                      {connect.whatsappLabel}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </Button>
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-brand-700">{connect.regionsLabel}</dt>
                  <dd className="mt-3 text-xl text-brand-950">{site.markets.join(", ")}</dd>
                </div>
              </dl>
            </Reveal>

            <div className="relative mt-14 hidden lg:block">
              <p className="font-hand text-5xl font-bold leading-none text-brand-700">{connect.note}</p>
              <HandArrow className="ml-24 mt-3 h-20 w-32 text-brand-600" />
            </div>
          </div>

          {/* Request form */}
          <div className="lg:col-span-7">
            <Reveal
              as="div"
              className="rounded-[2rem] bg-white p-6 shadow-[0_40px_90px_-40px_rgba(5,38,48,0.45)] md:p-12"
            >
              <h3 className="display mb-8 text-[clamp(2rem,3.4vw,2.9rem)] leading-tight text-brand-950">
                {connect.formTitle}
              </h3>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
