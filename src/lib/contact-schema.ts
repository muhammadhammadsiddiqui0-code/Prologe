import { z } from "zod";

/**
 * Single source of truth for the request form.
 * Imported by the React form (client) AND by api/contact.ts (server).
 */

export const COUNTRIES = ["UAE", "KSA", "Kuwait", "Oman", "Other"] as const;

export const INTERESTS = [
  "Candidate Experience",
  "Performance Management",
  "Nationalization",
  "Partnership",
  "Other",
] as const;

export const DIAL_CODES = [
  { code: "+971", label: "UAE +971" },
  { code: "+966", label: "KSA +966" },
  { code: "+965", label: "Kuwait +965" },
  { code: "+968", label: "Oman +968" },
  { code: "+973", label: "Bahrain +973" },
  { code: "+974", label: "Qatar +974" },
  { code: "+962", label: "Jordan +962" },
  { code: "+961", label: "Lebanon +961" },
  { code: "+20", label: "Egypt +20" },
  { code: "+44", label: "UK +44" },
  { code: "+1", label: "US / Canada +1" },
  { code: "+91", label: "India +91" },
  { code: "+92", label: "Pakistan +92" },
] as const;

const digitsOnly = (v: string) => v.replace(/\D/g, "");

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(100, "That name is a little long — please shorten it."),
  company: z
    .string()
    .trim()
    .min(2, "Please enter your company.")
    .max(120, "That company name is a little long — please shorten it."),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .max(160, "That email address is too long.")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Please enter a valid email address."),
  dialCode: z.string().regex(/^\+\d{1,4}$/, "Please choose a country code."),
  phone: z
    .string()
    .trim()
    .min(1, "Please enter your phone number.")
    .regex(/^[0-9\s-]+$/, "Use digits only, e.g. 56 971 0315.")
    .refine((v) => {
      const n = digitsOnly(v).length;
      return n >= 6 && n <= 14;
    }, "That phone number looks the wrong length."),
  country: z.enum(COUNTRIES, { message: "Please choose your country." }),
  interest: z.enum(INTERESTS, { message: "Please choose an area of interest." }),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (at least 10 characters).")
    .max(2000, "Please keep your message under 2000 characters."),
  consent: z.boolean().refine((v) => v === true, {
    message: "Please agree so we can reply to your request.",
  }),
  /** Honeypot — real people never see or fill this. */
  website: z.string().max(200).optional(),
  /** Timestamp (ms) when the form was rendered — used for a simple time-trap. */
  ts: z.number().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
