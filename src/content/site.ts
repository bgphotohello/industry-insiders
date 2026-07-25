/**
 * Every word of public-facing copy on the launch site lives here.
 *
 * Edit this file to change page copy — no component needs to be touched.
 * Components import from `siteContent` and render whatever they find.
 */

export const brand = {
  name: "Industry Insider",
  tagline: "Relationships First. Opportunity Follows.",
  location: "Dallas–Fort Worth, Texas",
  /** Letter-by-letter reveal in the intro uses this, so keep it uppercase. */
  wordmark: "INDUSTRY INSIDER",
  /** The display lockup sets the name on two lines, as in the design comp. */
  wordmarkLines: ["INDUSTRY", "INSIDER"],
  /** Set to "" to drop the trademark symbol everywhere it appears. */
  trademark: "\u2122",
} as const;

export const nav = {
  links: [
    { label: "VISION", href: "#vision" },
    { label: "COMMUNITY", href: "#community" },
    { label: "COMING SOON", href: "#coming-soon" },
  ],
  cta: { label: "REQUEST AN INVITATION", href: "#interest" },
} as const;

export const hero = {
  eyebrow: "BY PERSONAL INVITATION",
  /**
   * Split so the closing phrase can carry the gold italic accent from the
   * comp. Read together it is still "The right room changes everything."
   */
  heading: {
    line1: "The right room",
    line2: "changes",
    line2Accent: "everything.",
  },
  body: "Industry Insider is a private professional community built around meaningful relationships, exceptional experiences, and long-term collaboration.",
  secondary:
    "Created for trusted leaders who believe opportunity follows connection.",
  primaryCta: { label: "REQUEST AN INVITATION", href: "#interest" },
  secondaryCta: { label: "DISCOVER THE VISION", href: "#vision" },
  scrollHint: "Scroll",
} as const;

/** Plain-text heading, for the document outline and assistive technology. */
export const heroHeadingText =
  `${hero.heading.line1} ${hero.heading.line2} ${hero.heading.line2Accent}`;

export const idea = {
  id: "vision",
  label: "THE VISION",
  heading: "Not another networking group.",
  body: "Industry Insider is being created for professionals who value depth over volume, trust over transactions, and relationships that continue long after the introduction.",
  principles: [
    {
      index: "01",
      title: "Relationships Before Referrals",
      copy: "Real opportunity begins with knowing who is in the room—and why they belong there.",
    },
    {
      index: "02",
      title: "Curated, Not Crowded",
      copy: "A deliberately selected community of established professionals, trusted partners, and respected leaders.",
    },
    {
      index: "03",
      title: "Experiences Worth Attending",
      copy: "Private gatherings, thoughtful conversations, and opportunities designed to create genuine connection.",
    },
  ],
} as const;

export const community = {
  id: "community",
  label: "THE COMMUNITY",
  heading: "Built for people already making an impact.",
  body: "Industry Insider is intended for accomplished professionals across real estate and the industries that support it.",
  audience: [
    "Residential and luxury real estate professionals",
    "Brokers, team leaders, and industry executives",
    "Developers, builders, designers, and architects",
    "Lending, title, legal, insurance, and financial professionals",
    "Trusted service providers with an established reputation",
  ],
  note: "Membership details and selection criteria will be announced soon.",
} as const;

export const coming = {
  id: "coming-soon",
  label: "COMING SOON",
  heading: "A private ecosystem built around connection.",
  features: [
    {
      index: "01",
      title: "Curated Member Directory",
      copy: "A trusted resource for discovering and connecting with respected professionals inside the community.",
    },
    {
      index: "02",
      title: "Private Event Calendar",
      copy: "Invitations, gatherings, educational experiences, and member-only opportunities in one place.",
    },
    {
      index: "03",
      title: "Member Profiles",
      copy: "Thoughtfully presented profiles designed to highlight expertise, reputation, and meaningful ways to collaborate.",
    },
    {
      index: "04",
      title: "Invitation-Only Access",
      copy: "A secure member experience reserved for approved Industry Insider members.",
    },
  ],
} as const;

export const interest = {
  id: "interest",
  label: "BE AMONG THE FIRST",
  /** Same split treatment as the hero: the closing phrase carries the gold. */
  heading: { line1: "The room", accent: "is forming." },
  body: "Join the private interest list to receive founding announcements, event invitations, and membership information as it becomes available.",
  consent:
    "I would like to receive news, invitations, and membership information from Industry Insider.",
  submitLabel: "KEEP ME INFORMED",
  submittingLabel: "SENDING",
  privacyNote: "Private by design. Your information will never be sold.",
  success: {
    title: "YOU’RE ON THE LIST",
    body: "Thank you for raising your hand. We’ll be in touch as Industry Insider begins opening its doors.",
  },
  /** Shown when the server rejects a submission for an unexpected reason. */
  genericError:
    "We couldn’t submit your request just now. Please try again in a moment.",
  fields: {
    firstName: { label: "First name", autoComplete: "given-name" },
    lastName: { label: "Last name", autoComplete: "family-name" },
    email: { label: "Email address", autoComplete: "email" },
    company: { label: "Company", autoComplete: "organization" },
    role: { label: "Professional role", autoComplete: "organization-title" },
    referral: {
      // The design comp shortens this so it sits in the three-up row without
      // wrapping. "How did you hear about Industry Insider?" also works.
      label: "How did you hear about us?",
      optionalLabel: "Optional",
      autoComplete: "off",
    },
  },
} as const;

export const footer = {
  links: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export const seo = {
  title: "Industry Insider | Relationships First. Opportunity Follows.",
  shortTitle: "Industry Insider",
  description:
    "Industry Insider is a private professional community for trusted real estate leaders and industry partners, built around meaningful relationships, exceptional experiences, and long-term collaboration.",
  keywords: [
    "private professional community",
    "real estate community",
    "invitation only membership",
    "Dallas Fort Worth real estate",
    "industry partners",
  ],
} as const;

export const siteContent = {
  brand,
  nav,
  hero,
  idea,
  community,
  coming,
  interest,
  footer,
  seo,
} as const;
