import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, m as motion } from "framer-motion";
import {
  COUNTRIES,
  DIAL_CODES,
  INTERESTS,
  contactSchema,
  type ContactInput,
} from "../lib/contact-schema";
import { form as copy, site } from "../content/content";
import { useTopic } from "../lib/topic";
import { Button } from "./ui/Button";
import { cn } from "../utils/cn";

const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || "/api/contact";
const COOLDOWN_KEY = "prologe:last-request";
const COOLDOWN_MS = 60_000;
const EASE = [0.22, 0.61, 0.36, 1] as const;

type Status = "idle" | "sending" | "success" | "error";

const DEFAULTS: Partial<ContactInput> = {
  name: "",
  company: "",
  email: "",
  dialCode: "+971",
  phone: "",
  message: "",
  consent: false,
  website: "",
};

function readCooldown() {
  try {
    return Number(localStorage.getItem(COOLDOWN_KEY) || 0);
  } catch {
    return 0;
  }
}
function writeCooldown() {
  try {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  } catch {
    /* private mode — server-side limiting still applies */
  }
}

function buildMailto(v: ContactInput) {
  const subject = `Request from ${v.name} — ${v.company} (${v.interest})`;
  const body = [
    `Name: ${v.name}`,
    `Company: ${v.company}`,
    `Email: ${v.email}`,
    `Phone: ${v.dialCode} ${v.phone}`,
    `Country: ${v.country}`,
    `Area of interest: ${v.interest}`,
    "",
    v.message,
  ].join("\n");
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function Field({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-0.5 block text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-brand-800"
      >
        {label}
      </label>
      {children}
      <div className="min-h-[1.65rem]">
        <AnimatePresence initial={false}>
          {error && (
            <motion.p
              id={`${id}-error`}
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="pt-1.5 text-sm font-medium text-[#b42318]"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function ContactForm() {
  const { topic, nonce } = useTopic();
  const startedAt = useRef(Date.now());
  const successRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const statusRef = useRef<Status>("idle");
  statusRef.current = status;
  const [errorNote, setErrorNote] = useState("");
  const [mailto, setMailto] = useState("");
  const [firstName, setFirstName] = useState("");
  const [pulse, setPulse] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: DEFAULTS,
    mode: "onTouched",
  });

  // "Discuss this" on a solution card pre-selects the area of interest.
  useEffect(() => {
    if (!topic || nonce === 0) return;
    if (!(INTERESTS as readonly string[]).includes(topic)) return;
    const interest = topic as ContactInput["interest"];
    if (statusRef.current === "success") {
      reset({ ...DEFAULTS, interest });
      setStatus("idle");
    } else {
      setValue("interest", interest, { shouldDirty: true, shouldValidate: true });
    }
    setPulse(true);
    const t = window.setTimeout(() => setPulse(false), 2600);
    return () => window.clearTimeout(t);
  }, [topic, nonce, setValue, reset]);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const onSubmit = async (values: ContactInput) => {
    // Honeypot: bots fill it, people never see it. Pretend it worked, send nothing.
    if (values.website) {
      setStatus("success");
      return;
    }
    if (Date.now() - readCooldown() < COOLDOWN_MS) {
      setErrorNote(copy.rateLimited);
      setMailto("");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setErrorNote("");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...values, ts: startedAt.current }),
      });
      // A static host may answer 200 with HTML for unknown routes — only a JSON {ok:true} counts.
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        fieldErrors?: Record<string, string>;
      } | null;

      if (res.ok && data?.ok === true) {
        writeCooldown();
        setFirstName(values.name.trim().split(/\s+/)[0] ?? "");
        setStatus("success");
        return;
      }
      if (res.status === 429) {
        setErrorNote(copy.rateLimited);
        setMailto("");
        setStatus("error");
        return;
      }
      if (res.status === 400 && data?.fieldErrors) {
        for (const [field, message] of Object.entries(data.fieldErrors)) {
          setError(field as keyof ContactInput, { message });
        }
        setStatus("idle");
        return;
      }
      throw new Error("send_failed");
    } catch {
      setErrorNote("");
      setMailto(buildMailto(values));
      setStatus("error");
    }
  };

  const sending = status === "sending";
  const err = (k: keyof ContactInput) => errors[k]?.message as string | undefined;
  const aria = (k: keyof ContactInput) => ({
    "aria-invalid": errors[k] ? (true as const) : undefined,
    "aria-describedby": errors[k] ? `${k}-error` : undefined,
  });

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === "success" ? (
        <motion.div
          key="success"
          ref={successRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="flex min-h-[26rem] flex-col items-start justify-center outline-none"
        >
          <svg
            viewBox="0 0 120 120"
            className="h-28 w-28 text-brand-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <motion.path
              d="M64 9 C 94 8, 114 32, 111 62 C 108 94, 82 114, 56 111 C 26 108, 8 86, 10 58 C 12 32, 34 10, 66 10"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: EASE }}
            />
            <motion.path
              d="M36 62 L54 80 L86 42"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, delay: 0.95, ease: EASE }}
            />
          </svg>
          <h3 className="display mt-7 text-[clamp(2.4rem,5vw,3.6rem)] leading-tight text-brand-950">
            {copy.successTitle}
            {firstName ? `, ${firstName}` : ""}.
          </h3>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-brand-950/80">{copy.successBody}</p>
          <button
            type="button"
            onClick={() => {
              reset(DEFAULTS);
              startedAt.current = Date.now();
              setStatus("idle");
            }}
            className="link-draw mt-9 text-base font-semibold text-brand-800"
          >
            {copy.successAgain}
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          aria-busy={sending}
        >
          <fieldset disabled={sending} className="grid gap-x-9 gap-y-1 md:grid-cols-2">
            <Field id="name" label={copy.labels.name} error={err("name")}>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder={copy.placeholders.name}
                className="field"
                {...aria("name")}
                {...register("name")}
              />
            </Field>

            <Field id="company" label={copy.labels.company} error={err("company")}>
              <input
                id="company"
                type="text"
                autoComplete="organization"
                placeholder={copy.placeholders.company}
                className="field"
                {...aria("company")}
                {...register("company")}
              />
            </Field>

            <Field id="email" label={copy.labels.email} error={err("email")}>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={copy.placeholders.email}
                className="field"
                {...aria("email")}
                {...register("email")}
              />
            </Field>

            <Field id="phone" label={copy.labels.phone} error={err("phone") ?? err("dialCode")}>
              <div className="flex gap-4">
                <select
                  aria-label={copy.labels.dialCode}
                  autoComplete="tel-country-code"
                  className="field w-[8.6rem] shrink-0"
                  {...register("dialCode")}
                >
                  {DIAL_CODES.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder={copy.placeholders.phone}
                  className="field min-w-0"
                  {...aria("phone")}
                  {...register("phone")}
                />
              </div>
            </Field>

            <Field id="country" label={copy.labels.country} error={err("country")}>
              <select id="country" defaultValue="" className="field" {...aria("country")} {...register("country")}>
                <option value="" disabled>
                  {copy.placeholders.select}
                </option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="interest" label={copy.labels.interest} error={err("interest")}>
              <select
                id="interest"
                defaultValue=""
                className={cn("field transition-shadow", pulse && "!border-b-brand-600 !shadow-[0_8px_0_-6px_var(--color-brand-500)]")}
                {...aria("interest")}
                {...register("interest")}
              >
                <option value="" disabled>
                  {copy.placeholders.select}
                </option>
                {INTERESTS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="message" label={copy.labels.message} error={err("message")} className="md:col-span-2">
              <textarea
                id="message"
                rows={4}
                placeholder={copy.placeholders.message}
                className="field resize-y"
                {...aria("message")}
                {...register("message")}
              />
            </Field>

            {/* Honeypot */}
            <div className="hp-field" aria-hidden="true">
              <label>
                Website
                <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="flex cursor-pointer items-start gap-3 text-[0.95rem] leading-snug text-brand-950/90">
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#0f7388]"
                  {...aria("consent")}
                  {...register("consent")}
                />
                <span>
                  {copy.consent}{" "}
                  <a href="#/privacy" className="link-draw font-semibold text-brand-800">
                    {copy.consentLink}
                  </a>
                  .
                </span>
              </label>
              <div className="min-h-[1.65rem]">
                <AnimatePresence initial={false}>
                  {errors.consent && (
                    <motion.p
                      id="consent-error"
                      role="alert"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="pt-1.5 text-sm font-medium text-[#b42318]"
                    >
                      {errors.consent.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-2 md:col-span-2">
              <Button type="submit" variant="dark" disabled={sending} arrow={!sending}>
                {sending ? (
                  <>
                    <Spinner />
                    {copy.sending}
                  </>
                ) : (
                  copy.submit
                )}
              </Button>
            </div>
          </fieldset>

          <AnimatePresence>
            {status === "error" && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="mt-6 rounded-2xl border border-[#b42318]/30 bg-[#fef3f2] p-5 text-[#7a271a]"
              >
                {errorNote ? (
                  <p className="font-medium">{errorNote}</p>
                ) : (
                  <>
                    <p className="font-semibold">{copy.errorTitle}</p>
                    <p className="mt-1">{copy.errorBody}</p>
                    <a href={mailto} className="link-draw mt-3 inline-block font-semibold">
                      {copy.errorMailto}
                    </a>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
