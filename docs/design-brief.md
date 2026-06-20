# Nike Pillay Inc — Full Design & Content Brief

## Project Overview

**Client:** Nike Pillay Inc (NP Inc)
**Current site:** npinc.co.za
**Project type:** Full website rebuild — CMS-driven, premium commercial law firm

### Goal

Rebuild the NP Inc website from scratch. The old site is too narrow, too dark, too static, and too plain. The new site must feel premium, spacious, visual, responsive, and modern — targeting corporate clients, candidates, and event attendees.

### Design Philosophy

Blend two reference styles (do not copy either directly):

- **Paceline Law** (`pacelinelaw.com`) — lifestyle/visual storytelling, large imagery, warm human messaging, strong CTAs, personality
- **Cox Yeats** (`coxyeats.co.za`) — polished South African commercial law firm, strong practice-area structure, people pages, careers, awards, offices, professional credibility

The result must feel like: _A modern South African commercial law firm website with strong visual storytelling, strong content management, premium black/gold brand identity, and enough marketing polish to attract corporate clients, candidates, and event attendees._

---

## Brand Identity

Use the existing NP Inc logo and black/gold identity. Do not invent new branding — modernise what exists.

### Colour Palette

| Role           | Hex       |
|----------------|-----------|
| Deep charcoal  | `#0E0E0E` |
| Soft black     | `#151515` |
| Warm gold      | `#C6A15B` |
| Muted gold     | `#9F7E3F` |
| Ivory/off-white| `#F7F4EE` |
| White          | `#FFFFFF` |
| Text grey      | `#B8B8B8` |
| Border grey    | `#2A2A2A` |

### Typography

| Role     | Options                                                  |
|----------|----------------------------------------------------------|
| Headings | Playfair Display, Cormorant Garamond, or Libre Baskerville (premium serif) |
| Body     | Inter, Lato, or Source Sans 3 (clean sans-serif)         |

---

## Visual Style Requirements

- Premium, modern law firm aesthetic
- Strong use of photography (legal/corporate imagery, people portraits)
- Large cinematic hero sections
- Dark charcoal / black base with warm gold accents
- Clean white/ivory content sections for readability
- Elegant editorial typography
- Subtle scroll animations and micro-interactions
- Strong mobile layout (mobile is a priority — not just a shrunk desktop)
- Editorial-style article cards
- Premium attorney profile cards
- Modern service/capability cards

---

## Site Structure

### Public Navigation

```
Home
Our People
Our Services
Insights
Tools & Calculators
  └── Conveyancing Calculator
Events
Awards
Firm Documents
Careers
Contact
```

Admin is **never** in the public navigation. Access is via `Ctrl + Alt + A` keyboard shortcut (opens login modal; does not bypass authentication).

---

## Page Specifications

### Homepage

The homepage must not look flat or text-heavy. Sections (in order):

#### 1. Full-width Cinematic Hero
- Full-viewport-height hero image (legal/corporate/law theme)
- Dark overlay
- Large heading (firm name + positioning line)
- Short positioning statement / tagline
- Two CTA buttons (e.g. "Meet Our Team" and "Our Services")

#### 2. Visual Intro Section
- "Who We Are" — firm overview with image alongside text
- "What We Do" — capabilities summary with image alongside text
- Side-by-side layout (image + text, alternating)

#### 3. Capabilities / Practice Areas
- Large modern grid layout
- Each card: icon or image, title, short summary, link to service page
- All cards managed from admin CMS

#### 4. Core Team Preview
- Professional attorney cards (image, name, role, practice area)
- CTA to full People directory

#### 5. Insights / Legal Updates
- Editorial card layout
- Featured/lead article displayed larger than supporting cards
- Categories: Legal Updates, Firm News, Staff Movements, Notices, Events, Awards, Careers

#### 6. Conveyancing Calculator CTA
- Separate strong visual block (dark background + gold accent)
- Heading: "Estimate your transfer and bond costs"
- CTA button: "Use the Calculator"

#### 7. Careers / CV CTA
- Heading: "Build your career with us"
- Button: "View Vacancies"
- Button: "Submit CV"

#### 8. Contact Strip
- Phone, email, physical address
- CTA: "Book a Consultation" / "Contact Us"

---

### People Directory

Cox Yeats-style structured directory, visually modernised.

**Filters:**
- Partners
- Directors
- Associates
- Candidate Attorneys
- Consultants
- Support Team
- Practice Area

**Each profile card:** portrait photo, name, title/role, practice area tag.

**Individual Profile Page:**
- Large portrait
- Name and title
- Qualifications
- Admission details
- Areas of expertise
- Bio
- Contact button (mailto or form)
- Related articles / related services

---

### Services Pages

One page per practice area. Structure:

1. Strong hero image with dark overlay and service title
2. Clear summary paragraph
3. "How We Assist" — structured list or expandable items
4. "Typical Matters" — bullet list or card grid
5. Related team members (cards linking to profiles)
6. Related insights (editorial cards)
7. Contact CTA strip

---

### Insights / News

Magazine/editorial style layout.

**Categories:**
- Legal Updates
- Firm News
- Staff Movements
- Notices
- Events
- Awards
- Careers

**List view:** filterable by category; featured article displayed prominently at top.

**Article page:** full editorial layout — large hero image, author, date, category tag, rich body content, related articles.

---

### Conveyancing Calculator

- User inputs: property purchase price, bond amount
- Outputs: estimated transfer duty, conveyancing fees, bond registration costs, total
- Rates managed from admin (not hardcoded)
- Disclaimer text (editable from admin)

---

### Careers

- Vacancy listings (title, location, closing date, brief description)
- Each vacancy links to a detail page
- "Submit CV" form: name, email, phone, position of interest, CV file upload
- Submissions stored in DB and visible in admin

---

### Events

- Event listing (title, date, location, short description, featured image)
- Individual event detail page
- Past events archive

---

### Awards

- Awards listing with year, award name, awarding body, short description
- Optional: featured image per award

---

### Firm Documents

- Document library (title, category, download link)
- Categories managed from admin
- Public or restricted access per document (managed from admin)

---

### Contact

- Full contact form (name, email, phone, matter type, message)
- Google Maps embed (office location)
- Office address, phone, email
- Office hours

---

## Admin CMS

**Access:** Hidden from public. Triggered by `Ctrl + Alt + A` — opens admin login modal. Credentials required; shortcut does not bypass authentication.

**Managed sections:**

| Section               | What admin can manage                                         |
|-----------------------|---------------------------------------------------------------|
| Hero                  | Heading, subheading, background image, CTA button text/links  |
| Homepage sections     | Toggle visibility, edit content, reorder blocks               |
| Services              | Create/edit/delete practice areas, content, images            |
| People                | Create/edit/delete profiles, photo, bio, qualifications, role |
| Articles / Insights   | Create/edit/delete articles, categories, featured image       |
| Events                | Create/edit/delete events, dates, images                      |
| Notices               | Create/edit/delete notices                                    |
| Awards                | Create/edit/delete awards                                     |
| Jobs / Vacancies      | Create/edit/delete job listings                               |
| CV Submissions        | View/download submitted CVs                                   |
| Calculator rates      | Edit transfer duty brackets, fee scales, bond registration rates |
| Documents             | Upload/manage downloadable firm documents                     |
| Navigation            | Manage menu items and order                                   |
| Footer                | Edit footer text, links, social links                         |
| SEO                   | Page-level meta title, meta description, OG image             |

---

## Mobile Requirements

Mobile is a first-class priority, not an afterthought.

- Large readable headings
- Stacked card layouts (no side-scrolling tables)
- Thumb-friendly tap targets (buttons, links)
- Sticky contact CTA (bottom bar or floating button)
- Clean hamburger/drawer navigation
- Fast-loading images (use responsive sizes)
- No content hidden or broken on small screens

---

## Data Models (DB Schema Reference)

These are the core entities needed. See `lib/db/src/schema/` for the authoritative schema once built.

- `people` — attorneys and staff profiles
- `services` — practice area pages
- `articles` — insights/news posts
- `categories` — for articles and documents
- `events` — firm events
- `awards` — firm awards
- `vacancies` — job listings
- `cv_submissions` — submitted CVs
- `documents` — downloadable firm documents
- `calculator_rates` — conveyancing calculator rate tables
- `site_settings` — global CMS settings (hero content, footer, SEO defaults, nav)
- `admin_users` — admin login credentials (hashed)

---

## Security Notes

- Admin shortcut (`Ctrl + Alt + A`) opens the login UI only — it never grants access without valid credentials
- Admin passwords must be hashed (bcrypt or argon2)
- CV file uploads must be validated and stored securely (type/size limits enforced)
- All admin routes must be protected by session middleware
- `SESSION_SECRET` must be set via environment variable — never hardcoded
