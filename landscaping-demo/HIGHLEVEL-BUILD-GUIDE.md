# Building the Landscaping Site in HighLevel

This guide recreates `index.html` (the design preview in this folder) inside
GoHighLevel, wired up so a quote request books the prospect straight onto the
company's calendar. Follow the sections in order — calendar and form first,
page last, since the page embeds both.

The client is **Peak Green Landscaping** (peakgreentx.com · Instagram
[@peakgreenlandscape](https://www.instagram.com/peakgreenlandscape/)),
serving Dallas–Fort Worth. Real details already in the demo: phone
**(972) 357-5781**, email **info@peakgreentx.com**, tagline *"Elevated
Landscaping. Exceptional Results. — Design · Build · Maintain."* Still
placeholders: project photos, reviews, license number, and their actual
logo file (the demo redraws the mountain mark as SVG — get the original
from the client).

---

## 1. Sub-account & business profile

1. Create (or open) the client's **sub-account** in your agency dashboard.
2. **Settings → Business Profile**: business name, address, phone, logo,
   time zone. The time zone here drives calendar availability, so set it first.
3. **Settings → Phone Numbers**: buy/assign an SMS-capable number (needed for
   the confirmation and reminder texts).

## 2. The calendar ("Free On-Site Walkthrough")

**Calendars → Calendars → + New Calendar** (Simple/Round Robin — Simple if one
estimator, Round Robin if multiple crews quote).

- **Name:** Free On-Site Walkthrough
- **Duration:** 45 min · **Buffer:** 15–30 min (drive time between properties)
- **Availability:** e.g. Mon–Fri 8:00am–4:00pm, Sat by request, Sundays off
  (the demo calendar mirrors this — Sundays are greyed out)
- **Booking window:** minimum notice 24h, book up to ~30 days out
- **Slots per day:** cap it (e.g. 4–6) so quoting doesn't eat whole days
- **Team member:** the owner/estimator, with their **Google or Outlook
  calendar synced two-way** (Settings → My Profile → Calendar Settings) so
  personal events block booking slots automatically.
- **Forms & Payment tab:** you can add custom questions directly on the
  calendar widget — but we'll use a separate form first (section 3) so you
  capture the lead *even if they never pick a time*.

## 3. Custom fields & the quote form

**Settings → Custom Fields** — create these (Contact type):

| Field | Type |
|---|---|
| Property Address | Text (or use the built-in Address field) |
| Services Needed | Checkbox — Lawn care, Design & build, Turf / sod, Hardscape / retaining wall, Irrigation install / repair, Cleanup / mulch, Lighting |
| Project Details | Multi-line text |

**Sites → Forms → Builder → + Add Form**, name it "Quote Request":

1. Fields, in order (matching the demo): First Name, Last Name, Phone, Email,
   Property Address, Services Needed (checkbox group), Project Details.
2. Mark name/phone/email/address **required**.
2a. **SMS consent (A2P):** add two checkbox elements at the bottom of the
   form, copied verbatim from the demo — a **required** transactional
   consent ("I agree to receive appointment and account text messages…
   Reply STOP to opt out or HELP for help.") and an **optional** marketing
   consent. Neither may be pre-checked. Below them, a text element linking
   the Privacy Policy and Terms of Service. Store the marketing checkbox in
   a custom field (e.g. "SMS Marketing Consent") — section 7 explains why.
3. **Styling:** rounded inputs, off-white field background, and a full-width
   submit button. Demo palette if you want to match exactly:
   - Deep olive `#39442F` (headers, primary button)
   - Sage `#75875A` (accents)
   - Bronze `#A6885E` (call-to-action button)
   - Taupe `#8C7A63` (their logo circle)
   - Paper background `#F5F2EA`
4. **On Submit → Redirect to URL** → the URL of the funnel's calendar step
   (you'll have this after section 4). This is what turns "quote request"
   into "on the calendar" in one motion.

## 4. The page (funnel)

**Sites → Funnels → + New Funnel** → "Landscaping Home". Two steps:

- **Step 1 — Home** (path `/`): the scrolling page
- **Step 2 — Book Your Walkthrough** (path `/book`): calendar page

### Step 1 — Home page sections

Build top to bottom with GHL's page builder, mirroring the demo:

| Demo section | GHL builder element |
|---|---|
| Sticky nav with "Get a Free Quote" button | Navigation menu section, button links to `#quote` |
| Hero (headline, sub, two buttons, trust chips) | 1-column section, H1 + paragraph + button row |
| Services (6 cards) | 3-column row × 2, icon + heading + text each |
| How it works (3 numbered steps, dark band) | 3-column section, background `#262D20` |
| Recent projects (3 photo cards) | 3-column row with Image elements — **use the client's real before/after photos** |
| Reviews (3 quotes) | 3-column row; or embed the GHL Reviews widget if Reputation is active |
| Quote section | **Form element** → select "Quote Request" (give the section ID `quote` so nav buttons anchor to it) |
| Footer | Section with hours, service area, phone, license # |

Typography to match the demo: **Bricolage Grotesque** (headings) and
**Karla** (body) — both are in the builder's Google Fonts picker.

For SEO/mobile: set page title ("Peak Green Landscaping — Landscape Design,
Build & Maintenance in Dallas–Fort Worth"), meta description, favicon, and
check every section in the builder's mobile preview.

### Step 2 — Booking page

Sparse on purpose: short headline ("Pick a time for your free walkthrough"),
one line of reassurance, then a **Calendar element** → select "Free On-Site
Walkthrough". Copy this step's URL into the form's redirect (section 3.4).

Because the contact was just created by the form, HighLevel pre-fills their
info on the booking widget — they only pick a date and time, exactly like the
demo's step 2.

## 5. Pipeline & opportunities

This is what turns the site from "a contact form" into a sales process the
owner can watch. **Opportunities → Pipelines → + New Pipeline**, name it
**"Quote Requests"**, with these stages:

1. **New Lead** — quote form submitted, walkthrough not yet booked
2. **Walkthrough Booked**
3. **Walkthrough Done**
4. **Quote Sent**
5. **Job Won**

Notes:

- The workflows in section 6 create the opportunity card and move it
  between stages automatically — the owner only drags a card by hand when
  they send the quote (or you automate that too, on the estimate email).
- Use the opportunity **status** (Won / Lost / Abandoned), not extra
  stages, for closed outcomes — that's what feeds GHL's conversion
  reporting. Dragging to Job Won + marking Won when a quote is accepted;
  mark Lost with a reason when it dies.
- Set the **opportunity value** after the walkthrough (or seed it from a
  ballpark-budget question if you add one to the form). Once values are
  in, the pipeline header shows total dollars at every stage.
- **Show the client the board view** (Opportunities tab): every lead as a
  card, stage by stage, with dollar totals — this one screen usually sells
  the whole system. The demo page previews this exact flow in its "Behind
  the scenes" panel (New Lead › Walkthrough Booked › Walkthrough Done ›
  Quote Sent › Job Won).

## 6. Automations (Workflows)

**Automation → Workflows** — three workflows make the whole thing run itself:

**A. "Quote Request — New Lead"** — Trigger: Form Submitted (Quote Request)
1. Add tag `quote-request`
2. **Create an opportunity** in the "Quote Requests" pipeline, stage
   **New Lead**
3. Assign to owner + internal notification (email/SMS to the client's phone)
4. **Wait 30 min → If/Else: has an appointment?**
   - **No →** SMS: "Hi {{contact.first_name}}, thanks for your quote request!
     Grab a time for your free walkthrough here: {booking link}" — then a
     second nudge next day if still unbooked.
   - **Yes →** end (workflow B has it covered).

**B. "Walkthrough — Confirm & Remind"** — Trigger: Customer Booked Appointment
(Free On-Site Walkthrough)
1. **Move the opportunity** to stage **Walkthrough Booked**
2. Confirmation SMS + email (date, time, what to expect, reschedule link)
3. Reminder 24 hours before
4. Reminder 1 hour before ("we're on the way" tone)

**C. "After the Walkthrough"** — Trigger: Appointment Status = Showed
1. **Move the opportunity** to stage **Walkthrough Done**
2. Same-day thank-you + "your written quote is coming within 48 hours"
3. Task for the owner: send the quote — when it goes out, the card moves
   to **Quote Sent** (drag it, or automate on the estimate email/invoice)
4. Optional: 3-day and 7-day follow-ups if the quote isn't accepted; review
   request once the job completes. When they accept, drag to **Job Won**
   and mark the opportunity **Won**.

Also handle **No-show**: trigger on status No Show → friendly re-book SMS.

**Seasonal revenue hook:** since they do winterization and irrigation
tune-ups, add a yearly campaign — every October, message contacts tagged
`irrigation` with a "book your winterization" SMS/email linking to the
calendar, and every March with a spring start-up offer. **Gate these on the
marketing-consent custom field** (section 7) — seasonal offers are
marketing texts, and only contacts who checked the optional box may get
them. Recurring revenue from the contact list HighLevel is already
building.

## 7. A2P 10DLC / SMS compliance (do this before launch)

US carriers require A2P 10DLC registration before any business SMS —
including the confirmation and reminder texts in section 5 — will actually
deliver. HighLevel wraps registration in **Settings → Phone Numbers →
Trust Center** in the sub-account. Approval takes days to a few weeks, so
start it early.

1. **Brand registration:** legal business name, address, and **EIN**. If
   Peak Green has no EIN, use the Sole Proprietor path (lower throughput,
   fine for this volume).
2. **Campaign registration:** use case "Low Volume Mixed" (or Mixed) fits
   this build. For sample messages, paste the actual workflow texts —
   booking confirmation, 24h reminder, review request. Include opt-out
   language ("Reply STOP to opt out") in at least one sample and in the
   real messages.
3. **Opt-in evidence:** the quote form *is* the opt-in method. Give the
   campaign the live form URL (and a screenshot). Reviewers check that:
   - consent language sits with the phone field on the same form,
   - the checkbox is **not pre-checked**,
   - the disclosure names the business, says "Message frequency varies"
     and "Message & data rates may apply", and gives STOP/HELP
     instructions — the demo's consent block already reads exactly this
     way, so keep it verbatim in the GHL form,
   - marketing consent is separate, optional, and "not a condition of
     purchase."
4. **Privacy Policy & Terms pages:** must be live and linked next to the
   consent checkboxes. Both are drafted in this folder — `privacy.html`
   and `terms.html` — already containing the carrier-required clause
   (*"No mobile information will be shared with third parties or
   affiliates for marketing or promotional purposes"*) and the full SMS
   terms. Recreate them as funnel steps at `/privacy` and `/terms`
   (paste the text into simple one-column pages) and link them from the
   form's fine print and the footer. Have the client's attorney review
   them before launch — they're a solid starting draft, not legal advice.
5. **Ongoing hygiene:** STOP/HELP replies are handled automatically by
   GHL's LC Phone. Transactional texts (confirmations, reminders) go to
   everyone who submitted the form; marketing texts (seasonal campaigns,
   offers) only to contacts whose marketing-consent field is checked.
   Never import cold lists into the SMS workflows.

## 8. Domain & launch

1. **Settings → Domains** → add `peakgreentx.com` (and `www.peakgreentx.com`),
   then update the DNS records at the domain's registrar per GHL's
   instructions (A record for the root, CNAME for `www`). If a site is
   already live on the domain, do this last — DNS is the cutover switch.
2. Set funnel Step 1 as the default page for `peakgreentx.com`, and the
   booking step resolves at `peakgreentx.com/book`.
3. Test end-to-end **on your phone**: submit the form → land on the calendar →
   book → confirm the appointment appears on the synced Google/Outlook
   calendar and both texts arrive.

## 9. What to collect from the client

- [ ] Original logo file (SVG/PNG — the taupe mountain mark from Instagram)
- [ ] Business hours and license # (if applicable)
- [ ] 6–9 project photos (before/after pairs are gold — their IG is mostly
      infographics so far, so ask for job-site photos directly)
- [ ] 3+ real reviews (or pull via GHL Reputation from their Google profile)
- [ ] Services list confirmed (the demo's six: lawn care & maintenance,
      design-build, turf & sod, irrigation install/repair/winterization,
      retaining walls & hardscapes, outdoor living & lighting)
- [ ] Who gets lead notifications, and estimator availability for the calendar
- [ ] Confirm exact service area within DFW
- [ ] Legal business name + EIN for A2P 10DLC brand registration (section 7)
- [ ] Privacy Policy & Terms content — both pages must be live before the
      A2P campaign is submitted

## Using the demo file itself

`index.html` is the **design preview** — open it in any browser to walk the
client through the look and the booking flow (the form → calendar → confirmed
sequence is interactive; nothing is actually sent). Build the production page
natively with GHL elements per section 4 rather than pasting the whole file
into a custom-code block, so the client can edit copy themselves and the
form/calendar are real GHL objects that trigger the workflows.
