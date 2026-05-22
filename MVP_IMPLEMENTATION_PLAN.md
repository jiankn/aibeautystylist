# AI Beauty Stylist MVP Implementation Plan

## P0 - Full-stack MVP Core

Goal: make the current demo behave like a real MVP path: real AI when configured, upload lifecycle, production-grade quota, and persisted diagnosis jobs.

### P0.1 Real AI diagnosis

- [x] Make Gemini model configurable through `GEMINI_MODEL`.
- [x] Use `gemini-3.5-flash` as the default configured Flash model.
- [x] Prefer Cloudflare runtime secrets over build-time env values.
- [x] Keep Zod schema validation before returning AI output to the UI.
- [x] Keep mock fallback when Gemini is unavailable, invalid, or unconfigured.
- [ ] Test with a real `GEMINI_API_KEY` in Cloudflare and local `.dev.vars`.
- [ ] Add admin/debug logging for fallback rate and schema failures.

### P0.2 Upload and privacy lifecycle

- [x] Add `uploadService` with `mock` and `r2` provider modes.
- [x] Store uploaded try-on source photos in R2 when `UPLOAD_PROVIDER=r2`.
- [x] Add `DELETE /api/try-on-photo` for stored photo deletion.
- [x] Wire Try-On delete action to the server-side photo deletion endpoint when a stored key exists.
- [x] Avoid retaining R2 uploads when AI diagnosis falls back to mock.
- [ ] Add retention cleanup automation for stale anonymous uploads.
- [ ] Add signed access or tokenized deletion before public launch.

### P0.3 Quota and persistence

- [x] Replace API-local memory quota with `usageLimitService`.
- [x] Use `USAGE_LIMITS` KV first, `SESSION` KV fallback, D1 fallback, then memory only in local dev.
- [x] Record consumed diagnosis usage in D1 `usage_records` when DB is bound.
- [x] Save diagnosis jobs into D1 `tryon_jobs` when DB is bound.
- [ ] Add D1 migration command notes and production binding IDs.
- [ ] Add a job detail/read API after Auth exists.

## P1 - Monetization and Accounts

Goal: unlock paid MVP behavior without overbuilding a full account platform.

### P1.1 Minimal Auth

- [ ] Choose auth route: Cloudflare Access, Better Auth, or lightweight email magic link.
- [ ] Create login/logout/session helpers.
- [ ] Connect authenticated users to `users.id`.
- [ ] Allow signed-in users to save selected looks.
- [ ] Gate saved history behind login.

### P1.2 Membership entitlement

- [ ] Add `membershipService` to read free/pro/premium entitlement.
- [ ] Map entitlement to quota, tutorial depth, HD try-on, and saved looks.
- [ ] Add server-side checks for premium-only result data.
- [ ] Keep UI upgrade prompts aligned with actual gates.

### P1.3 Stripe

- [ ] Add Stripe Checkout session endpoint.
- [ ] Add Stripe webhook endpoint.
- [ ] Write customer/subscription status into `subscriptions`.
- [ ] Add cancellation/renewal status handling.
- [ ] Test webhook locally and on Cloudflare.

## P2 - Growth, SEO, and Revenue Expansion

Goal: turn the MVP into a crawlable and monetizable acquisition system.

### P2.1 SEO page system

- [x] Add first scenario pages: office, interview, date night, bridal.
- [x] Add `robots.txt` and `sitemap.xml`.
- [ ] Generate sitemap from route/page data instead of maintaining it manually.
- [ ] Add more scenario pages: graduation, party, passport photo, video call, mature skin.
- [ ] Add people/skin pages: olive skin, cool undertone, warm undertone, beginner makeup.
- [ ] Add style pages: clean girl, soft glam, quiet luxury, Korean makeup.

### P2.2 Affiliate SKU system

- [ ] Add SKU data source with brand, retailer, shade, price tier, affiliate URL, and region.
- [ ] Replace hardcoded product cards with SKU lookup.
- [ ] Add transparent affiliate disclosure.
- [ ] Track outbound click events.

### P2.3 Share and retention

- [ ] Generate real share cards as images.
- [ ] Add watermarked before/after or diagnosis card export.
- [ ] Add saved look history for signed-in users.
- [ ] Add email reminder or seasonal look update after Auth exists.
