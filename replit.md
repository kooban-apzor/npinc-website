# Nike Pillay Inc — Law Firm Website

A premium, CMS-driven commercial law firm website for Nike Pillay Inc (NP Inc), combining visual storytelling with structured legal professionalism.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — Express session secret for admin auth

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite (`react-vite` artifact)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth for all endpoints)
- `lib/api-client-react/src/generated/` — generated React Query hooks and Zod schemas (do not edit)
- `lib/db/src/schema/` — Drizzle DB schema (source of truth for DB shape)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/<frontend-slug>/src/` — React frontend (TBD once created)
- `docs/design-brief.md` — full visual design brief and content specification

## Architecture decisions

- Admin access is hidden behind a keyboard shortcut (`Ctrl + Alt + A`) — the public nav must never expose an admin link, but the shortcut only opens the login modal; auth is still required.
- All visible content sections (hero, services, people, articles, events, etc.) are managed through a CMS-style admin panel backed by the database.
- OpenAPI-first: the spec in `lib/api-spec/openapi.yaml` is the single source of truth for all API contracts. Run codegen after any spec change.
- Conveyancing calculator rates are stored in the DB and editable from admin, not hardcoded.
- CV submissions are stored in the DB and reviewable from the admin panel.

## Product

Nike Pillay Inc is a South African commercial law firm. The website serves corporate clients, candidates, and event attendees. Key capabilities:

- **Public site**: Homepage with hero, practice areas, team preview, insights feed, calculator CTA, careers CTA, and contact strip
- **People directory**: Filterable by role (Partners, Directors, Associates, Candidate Attorneys, Consultants, Support) and practice area; each profile has qualifications, admissions, bio, expertise, contact button, and related content
- **Services pages**: Per-practice-area pages with hero, summary, "How we assist", typical matters, related team, related insights, and contact CTA
- **Insights / News**: Magazine-style editorial cards; categories: Legal Updates, Firm News, Staff Movements, Notices, Events, Awards, Careers
- **Conveyancing calculator**: Estimates transfer and bond registration costs using DB-managed rates
- **Careers**: Vacancy listings and CV submission form
- **Admin CMS** (hidden, keyboard-shortcut accessed): Manage all content — hero, services, people, articles, events, notices, awards, jobs, CV submissions, calculator rates, documents, navigation, footer, SEO

## Design Brief

See `docs/design-brief.md` for the full visual and content specification.

**Summary:**
- Premium, modern South African commercial law firm aesthetic
- Blend Paceline Law's visual/lifestyle storytelling with Cox Yeats' structured commercial-law-firm model
- Black/gold brand identity (existing NP Inc assets)
- Reference sites (inspiration only, do not copy): `pacelinelaw.com`, `coxyeats.co.za`, `npinc.co.za`

**Colour palette:**
- Deep charcoal: `#0E0E0E`
- Soft black: `#151515`
- Warm gold: `#C6A15B`
- Muted gold: `#9F7E3F`
- Ivory/off-white: `#F7F4EE`
- White: `#FFFFFF`
- Text grey: `#B8B8B8`
- Border grey: `#2A2A2A`

**Typography:**
- Headings: Playfair Display, Cormorant Garamond, or Libre Baskerville (premium serif)
- Body: Inter, Lato, or Source Sans 3 (clean sans-serif)

## User preferences

- Admin panel must be hidden from public navigation; accessible only via `Ctrl + Alt + A` shortcut (opens login, does not bypass auth)
- Mobile is a priority — stacked cards, large readable headings, thumb-friendly buttons, sticky contact CTA, clean hamburger menu
- Do not recreate the old NP Inc site layout (too narrow, too dark, too static, too plain)
- Use the existing logo, black/gold identity, and current content only as source material
- The final site must feel premium, spacious, visual, responsive, and modern

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after editing `lib/api-spec/openapi.yaml` before touching frontend code
- Admin shortcut (`Ctrl + Alt + A`) must open the login UI only — it must not grant access without credentials
- Calculator rates must be editable from admin (not hardcoded) so the firm can update them without a deployment
- `SESSION_SECRET` env var is required for the admin session; never hardcode it

## Pointers

- See `docs/design-brief.md` for the full visual design specification
- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Reference sites for inspiration: pacelinelaw.com (lifestyle/storytelling feel), coxyeats.co.za (structured commercial law firm model)
