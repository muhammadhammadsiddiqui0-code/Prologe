/**
 * POST /api/contact
 *
 * Serverless handler for the "Send a Request" form (Web Request/Response signature —
 * works as-is on Vercel `api/` functions and ports easily to Netlify / Cloudflare).
 *
 *   1. rate-limits per IP
 *   2. validates with the SAME Zod schema the browser uses (src/lib/contact-schema.ts)
 *   3. silently drops honeypot / too-fast submissions
 *   4. stores the lead in Supabase            (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
 *   5. emails connect@prologe.ae via Resend   (RESEND_API_KEY)
 *   6. sends the sender a branded confirmation
 *
 * It answers { ok: true } if the lead was stored OR the team email went out, so a
 * single provider outage never loses a request. See .env.example and README.md.
 *
 * NOTE: the in-memory rate limiter resets on cold starts and isn't shared between
 * instances. For strict limits, swap `rateLimited()` for Upstash Redis / Vercel KV.
 */
import { contactSchema, type ContactInput } from "../src/lib/contact-schema";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const MIN_FILL_MS = 2500;
const hits = new Map<string, number[]>();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  return (forwarded?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown").trim();
}

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  const limited = recent.length >= MAX_PER_WINDOW;
  if (!limited) recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  }
  return limited;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

/* ───────────────────────────── Supabase ───────────────────────────── */

async function storeLead(d: ContactInput, userAgent: string): Promise<"ok" | "skipped"> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return "skipped";

  const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/leads`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      name: d.name,
      company: d.company,
      email: d.email,
      phone: `${d.dialCode} ${d.phone}`,
      country: d.country,
      interest: d.interest,
      message: d.message,
      consent: d.consent,
      user_agent: userAgent.slice(0, 300),
      source: "prologe.ae",
    }),
  });
  if (!res.ok) throw new Error(`supabase ${res.status}: ${await res.text()}`);
  return "ok";
}

/* ───────────────────────────── Resend ───────────────────────────── */

async function resend(
  key: string,
  payload: { from: string; to: string[]; reply_to?: string; subject: string; html: string; text: string },
) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`);
}

const BRAND = { primary: "#1BB0CE", ink: "#052630", pale: "#EEFAFD", text: "#0A1A1F" };

function rows(d: ContactInput) {
  return [
    ["Name", d.name],
    ["Company", d.company],
    ["Email", d.email],
    ["Phone", `${d.dialCode} ${d.phone}`],
    ["Country", d.country],
    ["Area of interest", d.interest],
  ] as const;
}

function internalHtml(d: ContactInput) {
  const table = rows(d)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#3b5863;font-size:13px;text-transform:uppercase;letter-spacing:.08em;vertical-align:top">${k}</td><td style="padding:6px 0;font-size:16px;color:${BRAND.text}">${esc(v)}</td></tr>`,
    )
    .join("");
  return `<div style="font-family:Inter,Arial,sans-serif;background:${BRAND.pale};padding:24px">
  <div style="max-width:600px;margin:auto;background:#fff;border-radius:16px;padding:32px;border-top:6px solid ${BRAND.primary}">
    <h1 style="margin:0 0 16px;font-size:22px;color:${BRAND.ink}">New request from prologe.ae</h1>
    <table style="border-collapse:collapse;width:100%">${table}</table>
    <p style="margin:24px 0 6px;color:#3b5863;font-size:13px;text-transform:uppercase;letter-spacing:.08em">Message</p>
    <p style="margin:0;font-size:16px;line-height:1.6;white-space:pre-wrap;color:${BRAND.text}">${esc(d.message)}</p>
    <p style="margin:24px 0 0;font-size:13px;color:#3b5863">Reply to this email to answer ${esc(d.name)} directly.</p>
  </div></div>`;
}

function confirmationHtml(d: ContactInput) {
  const first = esc(d.name.trim().split(/\s+/)[0] ?? "there");
  return `<div style="margin:0;padding:32px 16px;background:${BRAND.ink};font-family:Inter,Arial,sans-serif">
  <div style="max-width:560px;margin:auto">
    <p style="margin:0 0 28px;font-family:'Segoe Script','Bradley Hand','Comic Sans MS',cursive;font-size:38px;color:#fff;letter-spacing:-.5px">Prologe</p>
    <div style="background:#fff;border-radius:20px;padding:36px;border-top:6px solid ${BRAND.primary}">
      <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-weight:400;font-size:30px;line-height:1.15;color:${BRAND.ink}">Thank you, ${first}.</h1>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:${BRAND.text}">We’ve received your request about <strong>${esc(d.interest)}</strong> and will be in touch.</p>
      <p style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#3b5863">Your message</p>
      <p style="margin:0 0 24px;padding:14px 16px;background:${BRAND.pale};border-radius:12px;font-size:15px;line-height:1.6;white-space:pre-wrap;color:${BRAND.text}">${esc(d.message)}</p>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.65;color:${BRAND.text}">Take one step today — we’ll take the next one with you.</p>
      <a href="https://prologe.ae" style="display:inline-block;background:${BRAND.primary};color:${BRAND.ink};text-decoration:none;font-weight:600;padding:14px 26px;border-radius:999px">Visit prologe.ae</a>
    </div>
    <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#a9c3cb">Prologe.ae · HR Consulting UAE<br/>+971 56 9710315 · connect@prologe.ae<br/>You’re receiving this because you sent a request at prologe.ae.</p>
  </div></div>`;
}

async function sendEmails(d: ContactInput): Promise<"ok" | "skipped"> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return "skipped";
  const from = process.env.RESEND_FROM || "Prologe <connect@prologe.ae>";
  const to = process.env.CONTACT_TO || "connect@prologe.ae";

  const plain = rows(d).map(([k, v]) => `${k}: ${v}`).join("\n");
  await resend(key, {
    from,
    to: [to],
    reply_to: d.email,
    subject: `New request — ${d.interest} — ${oneLine(d.name)}`,
    html: internalHtml(d),
    text: `${plain}\n\nMessage:\n${d.message}`,
  });

  // The sender's confirmation must never fail the whole request.
  try {
    await resend(key, {
      from,
      to: [d.email],
      reply_to: to,
      subject: "We’ve received your request — Prologe",
      html: confirmationHtml(d),
      text: `Thank you, ${oneLine(d.name)}.\n\nWe’ve received your request about ${d.interest} and will be in touch.\n\nProloge.ae · HR Consulting UAE\n+971 56 9710315 · connect@prologe.ae`,
    });
  } catch (err) {
    console.error("[contact] confirmation email failed", err);
  }
  return "ok";
}

/* ───────────────────────────── Handler ───────────────────────────── */

export async function POST(req: Request): Promise<Response> {
  if (rateLimited(clientIp(req))) return json({ ok: false, error: "rate_limited" }, 429);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ ok: false, error: "bad_json" }, 400);
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return json({ ok: false, fieldErrors }, 400);
  }
  const data = parsed.data;

  // Bots: honeypot filled, or submitted faster than a human can type. Say "ok", do nothing.
  if (data.website) return json({ ok: true });
  if (data.ts && Date.now() - data.ts < MIN_FILL_MS) return json({ ok: true });

  if (!process.env.RESEND_API_KEY && !process.env.SUPABASE_URL) {
    console.error("[contact] neither RESEND_API_KEY nor SUPABASE_URL is configured");
    return json({ ok: false, error: "not_configured" }, 503);
  }

  const [stored, emailed] = await Promise.allSettled([
    storeLead(data, req.headers.get("user-agent") ?? ""),
    sendEmails(data),
  ]);
  const storedOk = stored.status === "fulfilled" && stored.value === "ok";
  const emailedOk = emailed.status === "fulfilled" && emailed.value === "ok";
  if (stored.status === "rejected") console.error("[contact] store failed", stored.reason);
  if (emailed.status === "rejected") console.error("[contact] email failed", emailed.reason);

  if (!storedOk && !emailedOk) return json({ ok: false, error: "delivery_failed" }, 502);
  return json({ ok: true });
}

export function GET() {
  return json({ ok: false, error: "method_not_allowed" }, 405);
}
