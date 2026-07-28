# NP Inc - Security Hardening & Bug Fix Plan

## Context

NP Inc is a law firm website + CMS temporarily hosted at `npinc.apztdg.com` on a shared infrastructure server. It will migrate to its own server once hardened. This plan focuses exclusively on issues within the npinc application's control — not shared infrastructure (firewall, Caddy, Ollama, Prometheus are out of scope).

**Goal**: Make the site safe, secure, and bug-free before migration.

---

## 1. CREDENTIALS & AUTHENTICATION

### 1.1 Strengthen Admin Password Policy
- **Location**: `.env`, `artifacts/api-server/src/routes/auth.ts`
- **Current**: `@Test1234` — weak, guessable
- **New policy**: 10 characters minimum, case-sensitive, must contain uppercase + lowercase + number + symbol
- **Actions**:
  - Generate a new compliant password and update `.env` (`ADMIN_PASSWORD`)
  - Generate a new 20+ char random reset phrase and update `.env` (`ADMIN_RESET_PHRASE`)
  - Regenerate `SESSION_SECRET` (current one is fine but rotate for safety)
  - Add password validation in `auth.ts` for `change-password` and `reset-password` endpoints — enforce the 10-char, mixed-case, symbol+number rule via Zod schema
  - Add the same validation to `seedAdminUser()` so a weak `ADMIN_PASSWORD` in `.env` is rejected at startup

### 1.2 Password Reset Phrase Hardening
- **Location**: `artifacts/api-server/src/routes/auth.ts:243-277`
- **Current**: Reset phrase `nike` compared in plaintext
- **Actions**:
  - Hash the reset phrase with bcrypt (same as password) and store in DB or compare hashed
  - Alternatively: keep phrase in env but compare using `timingSafeEqual` to prevent timing attacks
  - Rate limit already in place (5/hour) — keep this

### 1.3 Session Store — Move to Redis
- **Location**: `artifacts/api-server/src/app.ts:35-47`
- **Current**: In-memory sessions (lost on container restart)
- **Actions**:
  - Install `connect-redis` and `redis` packages
  - Configure session store to use `infra-redis` (available on `infra_shared` network)
  - Set session TTL to match cookie `maxAge` (7 days)
  - Use Redis password from env (infra already has `REDIS_PASSWORD`)
  - Add `REDIS_URL` to `.env`

### 1.4 CSRF Protection
- **Location**: `artifacts/api-server/src/app.ts`
- **Current**: No CSRF protection; cookie is `SameSite=lax` which helps but is not sufficient for all attack vectors
- **Actions**:
  - Since the API is consumed by a same-origin SPA, `SameSite=lax` + restricted CORS (1.5) provides reasonable protection
  - Strengthen cookie to `SameSite=strict` for admin session cookie
  - Document that all admin state-changing requests must include `Content-Type: application/json` (browsers won't send this cross-origin in a simple request)

---

## 2. NETWORK & HTTP SECURITY

### 2.1 Restrict CORS
- **Location**: `artifacts/api-server/src/app.ts:31`
- **Current**: `cors({ origin: true, credentials: true })` — reflects ANY origin
- **Actions**:
  - Replace with explicit origin list: `cors({ origin: ['https://npinc.apztdg.com'], credentials: true })`
  - Make origin configurable via env var `ALLOWED_ORIGINS` for future migration

### 2.2 Security Headers (nginx.conf)
- **Location**: `deploy/nginx.conf`
- **Current**: Has `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`
- **Missing**:
  - `Content-Security-Policy` — prevent inline scripts, restrict resource origins
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- **Actions**:
  - Add CSP header appropriate for the SPA (allow self, inline styles from Tailwind, etc.)
  - Add Referrer-Policy and Permissions-Policy headers
  - Note: HSTS should be set at the Caddy level (out of scope) — but add it in nginx.conf as defense-in-depth

### 2.3 Rate Limiting on Public Endpoints
- **Location**: `artifacts/api-server/src/routes/contact.ts`, `artifacts/api-server/src/routes/cv-submissions.ts`
- **Current**: No rate limiting on `/contact` or `/careers/submit`
- **Actions**:
  - Add rate limiter to `POST /contact`: 5 requests per 15 minutes per IP
  - Add rate limiter to `POST /careers/submit`: 3 requests per 15 minutes per IP
  - Use `express-rate-limit` (already a dependency)

---

## 3. FILE UPLOAD SECURITY

### 3.1 CV Submission Upload Hardening
- **Location**: `artifacts/api-server/src/routes/cv-submissions.ts:13-27`
- **Current**:
  - No file type validation (only 10MB size limit)
  - 5 files max = 50MB per submission
  - Files stored as base64 in JSONB column
- **Actions**:
  - Validate file MIME types via multer `fileFilter` — whitelist: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - Validate file extensions match MIME types
  - Reduce limits: 5MB per file, 3 files max
  - Add `Content-Disposition: attachment` if files are ever served back (prevent browser rendering)
  - Note: Moving to MinIO is a larger refactor — defer to post-migration unless urgent

---

## 4. DATA PERSISTENCE & BACKUPS

### 4.1 Database Backup Script
- **Location**: New script at `scripts/backup.sh`
- **Current**: No backups exist for npinc database
- **Actions**:
  - Create backup script that runs `pg_dump` via `HOST_DATABASE_URL`
  - Output compressed dump to `/home/ubuntu/backups/npinc/` with timestamp
  - Retain last 7 daily + 4 weekly backups
  - Add cron job: `0 3 * * * /home/ubuntu/npinc/scripts/backup.sh`

### 4.2 Session Persistence
- Covered in 1.3 (Redis session store)

---

## 5. APPLICATION BUGS & IMPROVEMENTS

### 5.1 Contact Form — Missing Zod Validation on Insert
- **Location**: `artifacts/api-server/src/routes/contact.ts:14-22`
- **Issue**: `SubmitContactBody.safeParse` validates but the raw parsed data is inserted — check that the Zod schema matches the DB schema exactly (no extra fields injected)
- **Actions**: Audit the Zod schema to ensure it uses `.strict()` or explicitly picks only expected fields

### 5.2 CV Submission — No Zod Validation on Insert
- **Location**: `artifacts/api-server/src/routes/cv-submissions.ts:15-38`
- **Issue**: Body fields extracted via destructuring — no Zod validation on the insert data
- **Actions**:
  - Create a Zod schema for CV submission body
  - Validate `name`, `email`, `phone`, `position`, `coverLetter` through it
  - Validate email format

### 5.3 Admin Password Synced on Every Startup
- **Location**: `artifacts/api-server/src/routes/auth.ts:23-40`
- **Issue**: `seedAdminUser()` overwrites the password hash on EVERY container restart
- **Impact**: If admin changes password via the UI, it gets overwritten on next restart
- **Actions**:
  - Only insert if no admin exists (skip the update on subsequent starts)
  - OR: only update if `ADMIN_PASSWORD` env var has changed (track with a hash/version)
  - Recommended: Remove the update-on-restart behavior — seed only on first run

### 5.4 Logout Does Not Clear Cookie
- **Location**: `artifacts/api-server/src/routes/auth.ts:178-182`
- **Issue**: `req.session.destroy()` destroys the server session but doesn't clear the cookie
- **Actions**: Pass a callback to `destroy` and call `res.clearCookie('connect.sid')`

### 5.5 Error Messages Leak Internal Details
- **Location**: Various routes
- **Issue**: Some endpoints return `parsed.error.message` directly — this exposes Zod internals
- **Actions**: Return generic error messages; log the detailed error server-side

---

## 6. DOCKER & DEPLOYMENT

### 6.1 Docker Compose — Resource Limits
- **Location**: `deploy/docker-compose.yml`
- **Current**: No resource limits on npinc containers
- **Actions**: Add memory limits:
  - `npinc-api`: 256MB
  - `npinc-web`: 64MB

### 6.2 Docker Compose — Logging Driver
- **Location**: `deploy/docker-compose.yml`
- **Current**: Default JSON file logging (unbounded)
- **Actions**: Add log rotation:
  ```yaml
  logging:
    driver: json-file
    options:
      max-size: "10m"
      max-file: "3"
  ```

---

## 7. IMPLEMENTATION ORDER

| # | Task | Files Changed |
|---|------|---------------|
| 1 | Restrict CORS origin | `app.ts` |
| 2 | Add password validation rules (10 char, mixed case, symbol, number) | `auth.ts`, Zod schemas in `api-zod` |
| 3 | Harden reset phrase comparison (timing-safe) | `auth.ts` |
| 4 | Fix `seedAdminUser()` — don't overwrite password on restart | `auth.ts` |
| 5 | Fix logout cookie clearing | `auth.ts` |
| 6 | Sanitize error messages returned to client | All route files |
| 7 | Add security headers to nginx.conf | `deploy/nginx.conf` |
| 8 | Add rate limiting to contact + CV endpoints | `contact.ts`, `cv-submissions.ts` |
| 9 | Add file type validation to CV uploads | `cv-submissions.ts` |
| 10 | Add Zod validation to CV submission body | `cv-submissions.ts`, `api-zod` |
| 11 | Move session store to Redis | `app.ts`, `package.json`, `.env` |
| 12 | Strengthen session cookie to SameSite=strict | `app.ts` |
| 13 | Add Docker resource limits + log rotation | `deploy/docker-compose.yml` |
| 14 | Create database backup script + cron | `scripts/backup.sh` |
| 15 | Update `.env` with new credentials + regenerate secrets | `.env`, `.env.example` |
| 16 | Typecheck + build verification | Full workspace |

---

## 8. VALIDATION PLAN

After implementation:
- [ ] `pnpm run typecheck` passes
- [ ] `pnpm run build` succeeds
- [ ] Login with new credentials works
- [ ] Password change rejects weak passwords (< 10 chars, no symbol, etc.)
- [ ] Container restart does NOT overwrite admin password change
- [ ] Logout clears cookie
- [ ] Rate limiters return 429 after threshold
- [ ] CV upload rejects non-PDF/DOC/DOCX files
- [ ] CORS rejects requests from non-allowed origins
- [ ] Sessions survive container restart (Redis)
- [ ] Backup script produces valid pg_dump file
- [ ] Security headers present in response (curl -I)

---

## 9. OUT OF SCOPE (Temporary Hosting)

These are shared infrastructure concerns — not npinc's responsibility while temporarily hosted:
- Firewall (UFW) configuration
- Ollama/Prometheus public access
- Caddy HTTP fallback for Codexa
- Caddy TLS version hardening
- Server-level backup rotation for Docker volumes

These should be addressed on the destination server during migration.
