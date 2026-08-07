# NP Inc Website — QA Bug Fixes Report (Round 2)

**Report Date:** August 7, 2026  
**Tester:** Development Team  
**Environment:** Production (https://npinc.apztdg.com)

---

## Executive Summary

**5 issues reviewed. 5 resolved.**  
All outstanding items from the QA re-test were investigated, reproduced, and fixed. Every fix was verified against live production via automated Playwright tests, direct API validation, and full browser-flow reproduction. A previously unverified CSP font fix was confirmed working and now has automated test coverage.

**Test Results:** 24/24 automated tests passing (9 new + 15 existing).

---

## Issue 1 — Profile Picture Upload (All Roles)

**Status:** ✓ **RESOLVED**

**Reported Issue:** Users are still unable to upload a profile picture for all roles (both JPEG and PNG show an error message).

**Discovery / Root Cause:**

- Reproduced live: uploading a JPEG/PNG via Admin → People → Add Person showed the toast **"Could not process image. Please try another file."**
- Browser console revealed the actual failure:
  `Loading the image 'blob:https://npinc.apztdg.com/...' violates the following Content Security Policy directive: "img-src 'self' data: https:". The action has been blocked.`
- The photo upload converts images client-side using `URL.createObjectURL()`, which produces a `blob:` URL. The nginx CSP `img-src` directive did **not** include `blob:`, so the browser blocked the image from loading into the conversion canvas.
- The failure was identical for every role because the upload widget is shared by all roles in the people management modal.

**Fixes Implemented:**

- `deploy/nginx.conf` — added `blob:` to the CSP `img-src` directive:
  - Before: `img-src 'self' data: https:`
  - After: `img-src 'self' data: blob: https:`

**Verification:**

- Automated test: CSP header contains `img-src 'self' data: blob:` ✓
- Full browser flow on production: login → Add Person → upload photo → preview renders → save → person created with photo stored (`photoUrl` data URL persisted in DB) ✓
- Image loads into canvas under the new CSP with zero console errors ✓

---

## Issue 2 — Contact Us Form: Whitespace-Only Name and Message

**Status:** ✓ **RESOLVED**

**Reported Issue:** The Contact Us form accepts whitespace-only input in the Name and Message fields.

**Discovery / Root Cause:**

- Client-side guard used a truthiness check only (`if (!form.name || !form.email || !form.message)`), which passes for `"   "`.
- Server-side schema (`zod.string()` via OpenAPI spec) applied no trimming or minimum-length validation, so whitespace-only values were accepted and persisted to the database.

**Fixes Implemented:**

- `artifacts/website/src/pages/ContactPage.tsx` — fields are trimmed before validation; whitespace-only Name/Email/Message now shows toast **"Please complete all required fields."** and blocks submission.
- `artifacts/api-server/src/routes/contact.ts` — server trims all fields and rejects blank values with 400 **"Name, email, and message are required and cannot be blank."** (defense in depth).

**Verification:**

- Automated test: whitespace-only Name + Message shows validation toast and does NOT submit ✓
- Direct API: `POST /api/contact` with whitespace-only name → **400**; whitespace-only message → **400**; valid submission → **201** ✓

---

## Issue 3 — Careers "Submit an Application" Form

**Status:** ✓ **RESOLVED**

**Reported Issues:**

1. The Name field can be left blank.
2. The Name and Message fields accept whitespace-only input.
3. The form does not reset after a successful submission; users had to refresh the page to submit another application.

**Discovery / Root Cause:**

1. **Blank Name:** The client had an HTML `required` attribute and a truthiness guard, but the server schema (`SubmitCvBody`) used plain `zod.string()`, which accepts empty strings — a direct API call with a blank name succeeded.
2. **Whitespace-only:** No trimming or validation existed anywhere in the CV submission flow (client or server).
3. **No reset:** On success the form was unmounted and replaced with a static "Thank you" block; the form state and file list were never cleared and there was no way to submit another application (unlike the Contact form, which has a "Submit Another Enquiry" button).

**Fixes Implemented:**

- `artifacts/api-server/src/routes/cv-submissions.ts` — server now trims and rejects:
  - Blank/whitespace-only Name → 400 **"Name is required and cannot be blank."**
  - Blank/whitespace-only Email → 400 **"Email is required and cannot be blank."**
  - Whitespace-only Message → 400 **"Message cannot be blank."** (empty message remains allowed, as it is optional)
- `artifacts/website/src/pages/CareersPage.tsx` — client-side trimming + validation toasts ("Name and email are required." / "Message cannot be blank."); form state and attached files are cleared after a successful submission; added a **"Submit Another Application"** button so users can submit again without refreshing.

**Verification:**

- Automated tests (all pass): whitespace-only Name rejected ✓; blank Name blocked before submission (HTML5 `required`, zero network requests) ✓; whitespace-only Message rejected ✓; form resets after successful submission (fields empty after "Submit Another Application") ✓
- Direct API: blank name → 400; whitespace name → 400; whitespace message → 400; empty message → 201 (optional field); valid submission → 201 ✓

---

## Issue 4 — Candidate Attorney Flow: "Apply Now via CV Form"

**Status:** ✓ **RESOLVED**

**Reported Issue:** On the vacancy/job description page, clicking **Apply Now via CV Form** returns the user to the top of the Careers page instead of taking them directly to the Submit Your CV form.

**Discovery / Root Cause:**

- The button was a plain link to `/careers` with no hash anchor.
- The application form section had no `id` attribute to target.
- A global `ScrollToTop` component scrolled to the top of the page on every route change, ignoring any URL hash.

**Fixes Implemented:**

- `artifacts/website/src/pages/CareersPage.tsx` — added `id="submit-application"` to the application form section.
- `artifacts/website/src/pages/VacancyDetailPage.tsx` — **Apply Now via CV Form** now links to `/careers#submit-application`.
- `artifacts/website/src/App.tsx` — `ScrollToTop` now scrolls to the hash target when a valid hash is present (with smooth scrolling and navbar offset via existing `scroll-margin-top`), falling back to top-of-page otherwise.

**Verification:**

- Automated test: clicking Apply Now via CV Form from a vacancy detail page navigates to `/careers#submit-application` and the form section is scrolled into view (not the top of the page) ✓

---

## Issue 5 — CSP Font Issue (Verification)

**Status:** ✓ **VERIFIED — RESOLVED**

**Note:** Previously reported CSP blocking site fonts (Inter / Playfair Display from Google Fonts). Marked resolved in the previous fixes document, but not covered by an automated test.

**Discovery / Verification:**

- Confirmed the production CSP correctly allows Google Fonts:
  - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`
  - `font-src 'self' data: https://fonts.gstatic.com`
- Browser-level check on production: 4 font requests to Google Fonts, **0 blocked**, Inter and Playfair Display report `status: loaded`.
- Added automated tests so this stays verified: CSP header directive checks + a browser test asserting fonts actually load.

---

## Additional Fix — Admin Sessions over HTTP (X-Forwarded-Proto)

**Status:** ✓ **RESOLVED**

**Discovery:** `deploy/nginx.conf` forwarded the client-supplied `X-Forwarded-Proto` header (`$http_x_forwarded_proto`), which is empty when a client connects directly. This caused express-session to omit the `Set-Cookie` header when the site was accessed without an upstream proxy, breaking all admin sessions.

**Fix:** nginx now falls back to `$scheme` when no forwarded proto header is present:

```nginx
set $forwarded_proto $http_x_forwarded_proto;
if ($forwarded_proto = "") { set $forwarded_proto $scheme; }
proxy_set_header X-Forwarded-Proto $forwarded_proto;
```

**Verification:** Admin login + authenticated API calls verified working over HTTPS on production.

---

## Testing Methodology

### Automated Testing (Playwright, production environment)

New regression suite `tests/e2e/qa-round2.spec.ts` (9 tests):

| # | Test | Result |
|---|------|--------|
| 1 | CSP `img-src` allows `blob:` (photo upload) | ✅ PASS |
| 2 | CSP allows Google Fonts stylesheet + font files | ✅ PASS |
| 3 | Google Fonts (Inter / Playfair Display) load in browser | ✅ PASS |
| 4 | Contact form rejects whitespace-only Name/Message | ✅ PASS |
| 5 | Careers form rejects whitespace-only Name | ✅ PASS |
| 6 | Careers form blocks blank Name before submission | ✅ PASS |
| 7 | Careers form rejects whitespace-only Message | ✅ PASS |
| 8 | Careers form resets after successful submission | ✅ PASS |
| 9 | Apply Now via CV navigates to `#submit-application` | ✅ PASS |

Existing suite `tests/e2e/qa-fixes.spec.ts` (15 tests): **15/15 PASS** (no regressions).

**Total: 24/24 PASS**

### Direct API Validation (Production)

| Request | Result |
|---------|--------|
| `POST /api/contact` — whitespace-only name | 400 "Name, email, and message are required and cannot be blank." |
| `POST /api/contact` — whitespace-only message | 400 (same) |
| `POST /api/contact` — valid | 201 |
| `POST /api/careers/submit` — blank name | 400 "Name is required and cannot be blank." |
| `POST /api/careers/submit` — whitespace name | 400 (same) |
| `POST /api/careers/submit` — whitespace message | 400 "Message cannot be blank." |
| `POST /api/careers/submit` — empty message (optional) | 201 |
| `POST /api/careers/submit` — valid | 201 |

### Manual Browser Verification (Production)

- Full admin photo upload flow: login → Add Person → upload JPEG → preview renders → save → photo persisted and displayed ✓

---

## Deployment Information

**Deployment Date:** August 7, 2026  
**Deployment Method:** Docker containers rebuilt and redeployed (`npinc-api`, `npinc-web`)  
**Environment:** Production (https://npinc.apztdg.com) — deployed and live  
**Container Status:** `npinc-api` healthy, `npinc-web` healthy

**Files Modified:**

- `deploy/nginx.conf` — CSP `img-src` + `X-Forwarded-Proto` fallback
- `artifacts/api-server/src/routes/contact.ts` — trim/blank validation
- `artifacts/api-server/src/routes/cv-submissions.ts` — trim/blank validation
- `artifacts/website/src/pages/ContactPage.tsx` — client-side whitespace validation
- `artifacts/website/src/pages/CareersPage.tsx` — validation, form reset, anchor id
- `artifacts/website/src/pages/VacancyDetailPage.tsx` — "Apply Now" anchor link
- `artifacts/website/src/App.tsx` — hash-aware scroll-to-top
- `tests/e2e/qa-round2.spec.ts` — new regression tests (new file)

**Note:** Changes are in the working tree (uncommitted) and ready for commit.

---

## Conclusion

All five outstanding QA items are resolved and verified on production:

1. ✅ Profile picture upload works for all roles (CSP `blob:` fix)
2. ✅ Contact Us form rejects whitespace-only Name/Message
3. ✅ Careers form: Name cannot be blank, whitespace-only Name/Message rejected, form resets after submission with "Submit Another Application"
4. ✅ Apply Now via CV Form takes users directly to the submission form
5. ✅ CSP font issue verified resolved with automated coverage

**Status:** ✅ READY FOR QA RE-TESTING

---

**Report Prepared By:** Development Team  
**Next Steps:** QA team to re-test all previously failed cases and verify fixes
