# Industry Insider

Launch site for **Industry Insider** — a private, invitation-led professional
community for real estate leaders and trusted industry partners.

_Relationships First. Opportunity Follows._

One polished scrolling page at `/`, a particle logo reveal, and a
production-ready interest-list form with a swappable lead destination. The
project is structured so the authenticated member area can be added later
without rework.

The visual design follows the approved comp: a centred gold lockup over a
drifting dust cloud, champagne carrying the hierarchy (mark, display wordmark,
tagline, the closing phrase of each headline, numerals and labels), a four-up
feature band, and boxed form fields under a solid champagne submit button.
Palette values were sampled from the comp rather than eyeballed.

---

## Contents

1. [File structure](#1-file-structure)
2. [Installation](#2-installation)
3. [Development](#3-development)
4. [Production build](#4-production-build)
5. [Deploying to Vercel](#5-deploying-to-vercel)
6. [Where the final logo files go](#6-where-the-final-logo-files-go)
7. [Changing colours and typography](#7-changing-colours-and-typography)
8. [Updating page copy](#8-updating-page-copy)
9. [Connecting the lead form](#9-connecting-the-lead-form)
10. [Adding the member area](#10-adding-the-member-area)
11. [QA checklist](#11-qa-checklist)

---

## 1. File structure

```
industry-insider/
├── public/
│   ├── brand/
│   │   ├── industry-insider-mark.svg          ← monogram (REPLACE)
│   │   ├── industry-insider-logo.svg          ← stacked lockup, dark bg (REPLACE)
│   │   ├── industry-insider-logo-light.svg    ← stacked lockup, light bg (REPLACE)
│   │   └── apple-touch-icon.png               180×180, generated
│   ├── og/
│   │   └── industry-insider-og.png            1200×630 share card, generated
│   ├── favicon.svg
│   └── favicon.ico
│
├── scripts/
│   └── build-brand-assets.py                  regenerates the PNG/ICO assets
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                         fonts, metadata, no-JS fallbacks
│   │   ├── page.tsx                           the one-page site
│   │   ├── globals.css                        ALL design tokens live here
│   │   ├── robots.ts  ·  sitemap.ts
│   │   ├── privacy/  ·  terms/  ·  contact/   secondary pages
│   │   └── actions/
│   │       └── submit-lead.ts                 server action behind the form
│   │
│   ├── components/
│   │   ├── brand/      Monogram, BrandLogo (with fallback), TexasMark
│   │   ├── hero/       HeroDust + hero-dust.ts (ambient gold cloud)
│   │   ├── intro/      IntroProvider, IntroSequence, particle-field.ts
│   │   ├── motion/     Reveal, MaskedHeading, RuleLine
│   │   ├── nav/        SiteNav (desktop bar + mobile panel)
│   │   ├── sections/   Hero, TheIdea, WhoItIsFor, WhatIsComing,
│   │   │               LeadCapture, LeadForm, SiteFooter
│   │   ├── layout/     PageShell (secondary pages)
│   │   └── ui/         CtaLink, MicroLabel, DiamondRule, TurnstileWidget
│   │
│   ├── content/
│   │   └── site.ts                            ALL page copy lives here
│   │
│   └── lib/
│       ├── brand/monogram.ts                  shared mark geometry
│       ├── forms/zod-resolver.ts              tiny RHF ↔ Zod bridge
│       ├── hooks/usePrefersReducedMotion.ts
│       ├── leads/
│       │   ├── schema.ts                      validation + normalisation
│       │   ├── types.ts                       LeadRecord + LeadProvider contract
│       │   ├── index.ts                       provider resolution + delivery
│       │   └── providers/                     console · file · webhook ·
│       │                                      resend · supabase
│       ├── security/                          rate-limit.ts · turnstile.ts
│       └── seo/                               site-url.ts · structured-data.ts
│
├── .env.example                               every environment variable
└── next.config.ts · tsconfig.json · eslint.config.mjs · postcss.config.mjs
```

**Dependencies:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4,
Motion for React, React Hook Form, Zod. Nothing else — no UI kit, no icon
package, no animation library beyond Motion, and no Supabase or Resend SDK
(both integrations are plain `fetch` calls).

---

## 2. Installation

Requires **Node.js 20+**.

```bash
git clone <repo-url>
cd industry-insider
npm install
cp .env.example .env.local
```

Out of the box `.env.local` needs no edits: the lead form runs in `console`
mode and logs a redacted summary server-side.

---

## 3. Development

```bash
npm run dev        # http://localhost:3000
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

To inspect real submissions locally with the full payload, set
`LEAD_CAPTURE_PROVIDER=file` in `.env.local`. Submissions are appended to
`.leads/leads.jsonl`, which is git-ignored. That provider refuses to run in
production.

**Seeing the intro again:** the full particle reveal runs once per browser
session. To replay it, open a new tab, use a private window, or run
`sessionStorage.clear()` in the console and reload.

---

## 4. Production build

```bash
npm run build      # optimised build
npm start          # serve the build locally on :3000
```

Every route is statically prerendered; the only server work is the lead-form
action.

Run all three before shipping:

```bash
npm run lint && npm run typecheck && npm run build
```

---

## 5. Deploying to Vercel

1. Push the repository to GitHub.
2. In Vercel, **Add New → Project**, and import the repo. The framework preset,
   build command (`next build`) and output are detected automatically — no
   configuration needed.
3. Add environment variables under **Settings → Environment Variables**. At
   minimum, for Production:

   | Variable                | Value                                    |
   | ----------------------- | ---------------------------------------- |
   | `NEXT_PUBLIC_SITE_URL`  | `https://yourdomain.com` (no trailing /) |
   | `LEAD_CAPTURE_PROVIDER` | e.g. `supabase,resend` or `webhook`      |

   …plus the keys for whichever providers you chose (see `.env.example`).

4. Deploy, then attach the custom domain under **Settings → Domains**.
5. Once the domain is live, confirm `NEXT_PUBLIC_SITE_URL` matches it exactly
   and redeploy — canonical tags, Open Graph URLs, `robots.txt` and
   `sitemap.xml` all derive from it.

Until `NEXT_PUBLIC_SITE_URL` is set, the site falls back to Vercel's generated
production URL, and then to `localhost:3000`.

---

## 6. Where the final logo files go

Replace these three files, keeping the exact filenames:

| File                                           | Used by                                  |
| ---------------------------------------------- | ---------------------------------------- |
| `public/brand/industry-insider-mark.svg`       | nav, intro, footer, favicons, share card |
| `public/brand/industry-insider-logo.svg`       | stacked lockup for dark backgrounds      |
| `public/brand/industry-insider-logo-light.svg` | stacked lockup for light backgrounds     |

Guidance for the final vectors: paths only (convert any text to outlines), no
embedded raster, a tight `viewBox` with no stray padding, and a solid fill
colour rather than `currentColor`.

**The intro animation updates itself.** The particle field loads
`industry-insider-mark.svg`, rasterises it, and uses the opaque pixels as the
dust's resting positions — so the particles assemble into whatever artwork is
in that file, at whatever aspect ratio, with no code change.

Then regenerate the raster assets:

```bash
npm run brand:assets
```

That rewrites `public/og/industry-insider-og.png`,
`public/brand/apple-touch-icon.png` and `public/favicon.ico` from the new mark.
It needs Python 3.9+ and a Chrome/Chromium binary (set `CHROME_PATH` if it
isn't found automatically); it never runs during `npm run build`.

Two files still want a human eye afterwards:

- `public/favicon.svg` — a deliberately tighter crop, for legibility at 16px.
- `src/lib/brand/monogram.ts` — the inline SVG fallback, drawn when the brand
  files are missing or fail to load, and the shape the intro falls back to.
  Paste the new path data here to keep the fallback on-brand. Everything keeps
  working if you skip this; the fallback simply still shows the placeholder.

If a brand file is missing entirely, `BrandLogo` catches the load error and
renders the inline monogram at identical dimensions — no broken image, no
layout shift.

---

## 7. Changing colours and typography

**Colours** — `src/app/globals.css`, the `:root` block. Every brand colour is
declared once there and mapped to Tailwind utilities in the `@theme inline`
block directly below. Change a hex value and the whole site follows.

```css
:root {
  --navy-950: #010816; /* page background — sampled from the design comp */
  --navy-900: #030d1f; /* banded sections, which sit ABOVE the ground */
  --champagne-500: #c8a15a; /* primary accent; the comp's solid button fill */
  --ivory-50: #f8f5ef; /* primary text */
  /* …semantic aliases: --text-muted, --rule, --surface, … */
}
```

Prefer editing the **semantic** variables (`--text-muted`, `--rule`,
`--surface-raised`) over the raw scale — they are what the components use.

**Typography** — `src/app/layout.tsx` holds the two `next/font/google`
imports. Swap them there, keep the `variable:` names, and the `--font-display`
/ `--font-sans` stacks in `globals.css` pick them up. Both stacks end in system
fallbacks, so nothing breaks if a font fails to load.

Sizes use `clamp()` inline in the components. Shared type patterns live in
`globals.css` under `@layer components`: `.u-label` (uppercase micro-labels),
`.measure` (line length), `.shell` (page gutter), `.hairline`.

---

## 8. Updating page copy

**All of it is in `src/content/site.ts`.** Every heading, paragraph, label,
list item, field label, button and error message. No component holds a string
of user-facing copy.

The file is organised section by section — `hero`, `idea`, `community`,
`coming`, `interest`, `footer`, `nav`, `seo`. Change the text and the page
follows; add an item to `idea.principles` or `coming.features` and a new
editorial row renders with the right numbering and rules.

Two headings are split into parts (`hero.heading`, `interest.heading`) so the
closing phrase can carry the comp's gold italic. They are still one sentence
to a screen reader. `brand.trademark` sets the ™ that follows the wordmark and
tagline — set it to `""` to remove it everywhere at once. The "How did you
hear about us?" field label is the comp's shorter wording; the longer
"How did you hear about Industry Insider?" is noted beside it.

Two things intentionally live elsewhere: the legal wording on `/privacy` and
`/terms` (in their own page files, where counsel can review them in context),
and the copyright year, which is computed at render time.

---

## 9. Connecting the lead form

The form posts to a server action (`src/app/actions/submit-lead.ts`) which
validates, then hands a `LeadRecord` to one or more **providers**. Choose the
destination with `LEAD_CAPTURE_PROVIDER`; no code changes required.

| Value      | Behaviour                                            | Needs                                                    |
| ---------- | ---------------------------------------------------- | -------------------------------------------------------- |
| `console`  | Logs a redacted summary server-side (default)        | —                                                        |
| `file`     | Appends to `.leads/leads.jsonl`; development only    | —                                                        |
| `webhook`  | `POST`s flat JSON — GoHighLevel, Zapier, any CRM     | `LEAD_WEBHOOK_URL`, optional `LEAD_WEBHOOK_SECRET`       |
| `resend`   | Emails an internal notification                      | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_TO_EMAIL` |
| `supabase` | Inserts a row via PostgREST                          | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`              |

Comma-separate to fan out: `LEAD_CAPTURE_PROVIDER=supabase,resend` stores the
lead **and** emails the team. A provider whose credentials are missing is
skipped with a server warning rather than taking the form down, and the
submission succeeds as long as one destination accepts it.

**Adding a new destination** — create `src/lib/leads/providers/your-crm.ts`
exporting something that satisfies `LeadProvider` (a `name`, and an async
`deliver(lead)` that throws on failure), then add a `case` to
`resolveProviders()` in `src/lib/leads/index.ts`. Nothing in the form, the
action or the UI changes.

**Supabase table**, if you use that provider:

```sql
create table public.leads (
  id         uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name  text not null,
  email      text not null,
  company    text,
  role       text,
  referral   text,
  consent    boolean not null default false,
  source     text,
  created_at timestamptz not null default now()
);
alter table public.leads enable row level security;
-- No policies: writes arrive via the service role key, which bypasses RLS,
-- so anonymous clients cannot read the table.
```

**Protections, all on by default:**

- **Honeypot** — a hidden field; anything in it means a bot. The submission is
  dropped and success is reported, so the script learns nothing. Enforced on
  the server only, so an over-eager password manager can never lock out a real
  person.
- **Rate limiting** — per IP + email: no two submissions within 2s, max 5 per
  minute (`src/lib/security/rate-limit.ts`). In-memory and per-instance; swap
  the body of `checkRate` for Redis if you ever need a hard global limit.
- **Client-side resubmit guard** — repeat clicks inside 1.5s are ignored.
- **Turnstile** — optional. Set **both** `TURNSTILE_SITE_KEY` and
  `TURNSTILE_SECRET_KEY` and the widget appears and is verified server-side.
  Leave them blank and no third-party script is ever requested.

Email addresses are trimmed and lower-cased before storage or delivery.
Failures show the visitor one calm message; the real cause — provider name,
status code — stays in the server logs.

---

## 10. Adding the member area

The launch site is deliberately public-only, but the structure anticipates
these routes:

```
/login              sign in
/member             member home
/member/directory   curated member directory
/member/events      private event calendar
/admin              approval queue
```

Suggested path when you build them:

1. **Route groups.** Move the current page into `src/app/(public)/` and add
   `src/app/(member)/` with its own `layout.tsx`. The public site keeps its
   intro and marketing chrome; the member area gets an app shell. No URLs
   change.
2. **Supabase Auth.** `npm i @supabase/supabase-js @supabase/ssr`, then create
   `src/lib/supabase/{client,server}.ts`. `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` are already reserved in `.env.example`. The
   **service role key stays server-only** — it is never prefixed
   `NEXT_PUBLIC_` and must never be imported into a client component.
3. **Gate in middleware.** Add `src/middleware.ts` matching `/member/:path*`
   and `/admin/:path*`, refresh the session, and redirect unauthenticated
   visitors to `/login`. `robots.ts` already disallows `/member` and `/admin`.
4. **Approval model.** Add a `profiles` table keyed to `auth.users` with a
   `status` column (`pending` / `approved` / `declined`). Enforce
   `status = 'approved'` in row-level security so the directory cannot leak
   even if a query is wrong; `/admin` becomes a list of pending profiles. A row
   in `leads` becomes a `profile` on approval.
5. **Reuse what exists.** The tokens in `globals.css`, `Reveal`,
   `MaskedHeading`, `RuleLine`, `CtaLink`, `MicroLabel`, `PageShell` and
   `BrandLogo` are all route-agnostic and carry the brand into the portal.

Nothing in the current code needs refactoring first.

---

## 11. QA checklist

Verified on this build, and worth re-running after any significant change.

**Build**

- [x] `npm run lint` — clean
- [x] `npm run typecheck` — clean
- [x] `npm run build` — succeeds, all routes prerendered
- [x] No browser console errors or warnings on any route
- [x] No hydration mismatches

**Intro**

- [x] Full particle reveal runs on the first visit of a browser session
- [x] Dust converges into the actual monogram, then hands off to the crisp SVG
- [x] Repeat visits in the same session get the fast reveal (~1.3s), no canvas
- [x] "Skip Intro" dismisses it; so does the Escape key
- [x] `prefers-reduced-motion`: no particles, simple fade, hierarchy intact
- [x] Cumulative Layout Shift caused by the intro: **0**
- [x] Animation pauses when the tab is hidden
- [x] The hero dust runs at ~30fps and stops when scrolled out of view

**Responsive** — checked at 375 / 768 / 1440 and wide

- [x] No horizontal overflow at any width
- [x] Mobile body copy stays at a comfortable size; no tiny text
- [x] Mobile menu opens, traps focus, closes on Escape, restores focus
- [x] Fully opaque mobile panel — no bleed-through

**Form**

- [x] Field-level validation with accessible, always-visible labels
- [x] Email normalised (trimmed + lower-cased) before delivery
- [x] Submit disabled while sending, with a restrained loading state
- [x] Five rapid clicks produce exactly one delivery
- [x] Success state replaces the form, takes focus, and is announced
- [x] Failure keeps the form, re-enables submit, leaks no backend detail
- [x] Honeypot submission is dropped; the bot sees success

**Accessibility**

- [x] "Skip to content" is the first tab stop
- [x] Visible champagne focus ring on every interactive control
- [x] Navigation is `inert` and unfocusable until the intro finishes
- [x] Semantic landmarks; sections labelled by their headings
- [x] No information conveyed by animation alone
- [x] Content fully legible with JavaScript disabled

**Before launch**

- [ ] Replace the three brand SVGs and run `npm run brand:assets`
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production domain
- [ ] Choose and configure `LEAD_CAPTURE_PROVIDER`, then submit a real test lead
- [ ] Have counsel review `/privacy` and `/terms`
- [ ] Add the real contact address to `/contact` and the Privacy page
- [ ] Replace the placeholder share card if final artwork exists
- [ ] Add social links to the footer only once the accounts are real
