/**
 * ───────────────────────────────────────────────────────────────────────────
 *  PROLOGE — SITE CONTENT
 *  Every piece of copy on the one-page site lives in this file.
 *
 *  • Copy marked "LIVE" was taken word for word from https://prologe.ae
 *    (apostrophes normalised to ’).
 *  • Short UI labels (form fields, buttons, aria text) are new and marked "UI".
 *  • Anything that does not exist yet is marked [PLACEHOLDER].
 * ───────────────────────────────────────────────────────────────────────────
 */

export const site = {
  name: "Prologe",
  domain: "prologe.ae",
  url: "https://prologe.ae",
  descriptor: "HR Consulting UAE", // LIVE (footer)
  tagline: "Prologe.ae", // LIVE (footer)
  founder: "Maha Tafech",
  phone: {
    display: "+971 56 9710315", // LIVE
    tel: "+971569710315",
    whatsapp: "971569710315",
  },
  email: "connect@prologe.ae", // LIVE
  /**
   * [PLACEHOLDER] Path to the real white handwritten Prologe wordmark
   * (SVG or PNG, e.g. "/logo-white.svg" placed in /public).
   * While empty, a handwritten-font stand-in wordmark is rendered.
   */
  logoSrc: "",
  markets: ["UAE", "KSA", "Kuwait", "Oman"], // LIVE
};

/**
 * Nav labels are the live ones. Order follows the scroll order of the page
 * (Solutions comes before Story). Swap two lines here to reorder.
 */
export const nav = [
  { id: "home", label: "Home", href: "#home" },
  { id: "solutions", label: "Solutions", href: "#solutions" },
  { id: "story", label: "Story", href: "#story" },
  { id: "connect", label: "Connect", href: "#connect" },
];

export const hero = {
  eyebrow: "Prologe.ae — HR Consulting UAE", // LIVE footer text
  lines: ["Take One", "Step Today"], // LIVE: "Take One Step Today"
  sub: "Practical Solutions, Accelerated Pace, Real Results.", // LIVE
  cta: "Let’s talk about your HR Project", // LIVE
  scroll: "Scroll", // UI
};

export const markets = {
  label: "Markets served", // UI (screen reader)
  items: site.markets,
};

export type Solution = {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  region: string;
  interest: "Candidate Experience" | "Performance Management" | "Nationalization";
  art: "door" | "scales" | "steps";
  lead: string;
  body: string;
};

export const solutions: {
  eyebrow: string;
  title: string;
  cta: string;
  items: Solution[];
} = {
  eyebrow: "Focused Solutions", // LIVE
  title: "Focused Solutions", // LIVE
  cta: "Discuss this", // UI
  items: [
    {
      id: "candidate-experience",
      number: "01",
      title: "Candidate Experience", // LIVE
      region: "UAE, KSA, Kuwait, Oman", // LIVE
      interest: "Candidate Experience",
      art: "door",
      lead: "You want talent to stay – people who will grow your business. Talented candidates can discern nuances and quickly determine if they want to join your company or run to your competitors.",
      body: "Retaining top talent requires not only exceptional recruiters but also a thorough overhaul of the system and a commitment to enhancing the company culture—uplifting everyone involved so that excellence becomes second nature. Certain standards are non-negotiable!",
    },
    {
      id: "performance-management",
      number: "02",
      title: "Performance Management", // LIVE
      region: "UAE, KSA, Kuwait, Oman", // LIVE
      interest: "Performance Management",
      art: "scales",
      lead: "Most often, the main reason employees leave isn’t about pay - it’s about being mistreated or an unfair evaluation. You’re aware of this, but it’s not a top priority for you.",
      body: "Perhaps now’s the time to take your performance management to the next level by moving beyond just documentation. Even small steps can make a big difference in retaining talent, beyond just offering a competitive bonus.",
    },
    {
      id: "nationalization",
      number: "03",
      title: "Nationalization", // LIVE
      subtitle: "From Managing to Developing Talent", // LIVE
      region: "UAE, KSA, Kuwait, Oman", // LIVE
      interest: "Nationalization",
      art: "steps",
      lead: "If you’re finding it challenging to view nationalization as more than just a compliance measure or a few extra initiatives, it might be time to take a fresh look at it! This approach is the standard in every country. It’s where succession planning really shines and shows its impact.",
      body: "Having collaborated with national talent from their school days all the way into the corporate world, we’ve created a solid foundation for attracting and nurturing national talent. Let’s consider nationalization as a key strategic objective for the upcoming fiscal year.",
    },
  ],
};

export const story = {
  eyebrow: "Story Behind Prologe", // LIVE
  title: "I Never Planned to Work in HR but Something Kept Bothering Me", // LIVE
  paragraphs: [
    "Code doesn’t lie. That’s what I loved about my early career in application development – the clarity, the logic, the measurable outcomes. Write good code, get good results. But something kept bothering me.",
    "I watched talented people disengage. I saw innovative ideas suffocated before they could breathe. I witnessed potential wasted daily. The disconnect was glaring – and costly.",
    "This insight sparked my interest in HR, where I discovered that my technical background provided me with a unique perspective. I could see both sides: the need for efficient systems and processes, and the equally important need for human connection.",
    "As a professional who juggles being a mother, wife, daughter, and friend, I understand that work doesn’t exist in isolation from life.",
  ],
  pullQuote: "I founded Prologe because I believe workplaces can do better.",
  closing: "I’m excited to share how to do this with you!",
  signature: "Maha Tafech",
  role: "Founder",
  portrait: {
    /** [PLACEHOLDER] Founder portrait, e.g. "/images/maha-tafech.jpg" (4:5 works best). */
    src: "",
    alt: "Portrait of Maha Tafech, founder of Prologe",
    caption: "Maha Tafech, Founder",
    placeholderLabel: "[PLACEHOLDER] Founder portrait",
  },
};

export const way = {
  eyebrow: "How We Operate", // LIVE
  title: "The Prologe Way", // LIVE
  paragraphs: [
    "Take one step at a time to cut through the noise and enjoy working with people – The Prologe Way.",
    "We tackle things one sprint at a time, with each sprint lasting between two and four weeks. You’ll provide the data and desired outcome, and we’ll team up to analyze and refine it before rolling out the whole thing—fast and efficiently!",
  ],
  figure: {
    from: 2,
    to: 4,
    unit: "weeks",
    caption: "per sprint", // UI
  },
  /**
   * Step titles come from the brief. Each step's text is a slice of the live
   * sentence, so the four steps read as one sentence left to right.
   */
  steps: [
    { n: "01", title: "Data and outcome", text: "You’ll provide the data and desired outcome," },
    { n: "02", title: "Analyse", text: "and we’ll team up to analyze" },
    { n: "03", title: "Refine", text: "and refine it" },
    { n: "04", title: "Roll out", text: "before rolling out the whole thing—fast and efficiently!" },
  ],
  timelineLabel: "The four steps of a Prologe sprint", // UI
};

export const connect = {
  eyebrow: "Get in Touch", // LIVE
  title: "Got A Project Or A Partnership In Mind?", // LIVE
  phoneLabel: "Phone:", // LIVE
  emailLabel: "Email:", // LIVE
  whatsappLabel: "WhatsApp", // UI
  whatsappText: "Hello Prologe, I’d like to talk about an HR project.", // UI
  formTitle: "Send a Request", // LIVE
  regionsLabel: "Serving", // UI
  note: "Take one step today.", // brief positioning line
};

export const form = {
  labels: {
    name: "Name",
    company: "Company",
    email: "Email",
    phone: "Phone",
    dialCode: "Country code",
    country: "Country",
    interest: "Area of interest",
    message: "Message",
  },
  placeholders: {
    name: "Your full name",
    company: "Your company",
    email: "you@company.com",
    phone: "56 971 0315",
    message: "Tell us a little about your HR project or partnership idea.",
    select: "Select…",
  },
  consent:
    "I agree that Prologe may use these details to reply to my request.",
  consentLink: "Privacy policy",
  submit: "Send request",
  sending: "Sending…",
  successTitle: "Thank you",
  successBody:
    "Your request is on its way to connect@prologe.ae, and a confirmation is heading to your inbox.",
  successAgain: "Send another request",
  errorTitle: "We couldn’t send that automatically.",
  errorBody: "Please try again, or send it from your own email app instead:",
  errorMailto: "Email connect@prologe.ae",
  rateLimited: "You’ve just sent a request. Please wait a minute before sending another.",
};

export const footer = {
  nav: "Footer navigation", // UI
  privacy: "Privacy",
  rights: "All rights reserved.", // UI
};

export const seo = {
  title: "Prologe | HR Consulting in the UAE — Practical Solutions, Real Results",
  description:
    "Prologe is an HR consulting firm in the UAE serving the UAE, KSA, Kuwait and Oman. Focused solutions in candidate experience, performance management and nationalization, delivered in sprints of two to four weeks.",
};
