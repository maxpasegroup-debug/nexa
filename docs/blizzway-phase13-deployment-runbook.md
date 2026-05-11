# Blizzway Phase 13 Deployment Runbook

Last updated: 2026-05-11

## Status

- Target production domain: `https://blizzway.com`
- Deployment target: Railway
- Frontend service root: `blizzway-frontend`
- BGOS backend: already hosted and running
- Schema changes for Phase 13: none planned
- Production readiness gate: deploy frontend only after BGOS production env, migrations, seeds, and smoke tests are confirmed
- Beta payment posture: `BLIZZWAY_PAYMENT_LIVE_GATEWAYS=false` and `BLIZZWAY_PAYMENT_GATEWAYS=MANUAL`

## Railway Frontend Service

Create a new Railway service from this repository.

- Root directory: `blizzway-frontend`
- Builder: Nixpacks / Node autodetect
- Build command: `npm run build`
- Start command: `npm run start`
- Required Node version: `>=20.9.0` from `blizzway-frontend/package.json#engines`
- Health check path: `/`
- Expected runtime: Next.js standalone production server on Railway-provided `PORT`
- Repo config: `blizzway-frontend/railway.json`

Do not deploy from the repo root for Blizzway. The root package currently targets `7universe-frontend`.

## Blizzway Frontend Environment

Use safe public values only. Do not add BGOS secrets to the frontend service.

```env
NEXT_PUBLIC_API_URL=/api/bgos
BGOS_API_URL=https://YOUR_BGOS_PRODUCTION_DOMAIN
NEXT_PUBLIC_SITE_URL=https://blizzway.com
NEXT_PUBLIC_APP_URL=https://blizzway.com
ALLOWED_ORIGINS=https://blizzway.com,https://www.blizzway.com
```

Notes:

- `NEXT_PUBLIC_API_URL=/api/bgos` keeps browser calls same-origin through the Blizzway proxy.
- `BGOS_API_URL` is server-side and must point to the deployed BGOS HTTPS origin.
- `NEXT_PUBLIC_SITE_URL` drives metadata, canonical URLs, robots, and sitemap.
- `ALLOWED_ORIGINS` is documented for platform consistency; BGOS currently enforces `BLIZZWAY_ALLOWED_ORIGINS`.

## BGOS Production Environment Checklist

Confirm these exist in the BGOS Railway service or hosting provider before Blizzway launch:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL=https://YOUR_BGOS_PRODUCTION_DOMAIN`
- `NEXTAUTH_URL=https://YOUR_BGOS_PRODUCTION_DOMAIN`
- `NEXT_PUBLIC_APP_URL=https://YOUR_BGOS_PRODUCTION_DOMAIN`
- `BLIZZWAY_ALLOWED_ORIGINS=https://blizzway.com,https://www.blizzway.com`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` if Google login is enabled
- `FROM_EMAIL` or `BREVO_FROM_EMAIL` if email flows are enabled
- `BREVO_SMTP_HOST`, `BREVO_SMTP_PORT`, `BREVO_SMTP_USER`, `BREVO_SMTP_PASS` if SMTP is enabled
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` if Razorpay is live
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` if Stripe is live
- `BLIZZWAY_PAYMENT_GATEWAYS`
- `BLIZZWAY_DEFAULT_PAYMENT_GATEWAY`
- `BLIZZWAY_PAYMENT_CURRENCY=INR`
- `BLIZZWAY_PAYMENT_LIVE_GATEWAYS=false` for beta/test mode unless live payments are intentionally approved
- `CAREER7_CREDIT_PAYMENT_ENABLED=true`

Never place database URLs, payment secrets, SMTP passwords, auth secrets, or provider webhook secrets in `NEXT_PUBLIC_*` variables.

## Beta Payment And Wallet Gate

For controlled beta:

```env
BLIZZWAY_PAYMENT_LIVE_GATEWAYS=false
BLIZZWAY_PAYMENT_GATEWAYS=MANUAL
```

Verify before inviting beta users:

- Wallet packages load.
- Payment order creation works in manual/test mode.
- Duplicate payment verification does not double-credit.
- Failed payment verification does not credit.
- Admin manual credit requires `businessId`, `userId`, non-zero amount, reason, and admin ID metadata.
- Ledger entries include source, user, business, amount, balanceAfter, and metadata.
- Razorpay live checklist exists but live mode remains disabled until explicitly approved.
- Stripe is not live-ready until signed webhook verification and production callback handling are fully tested.

## Migration Plan

Current migration order:

1. `20260504123000_add_career7_marketplace_fields`
2. `20260504131500_add_career7_growth_board`
3. `20260504134500_add_career7_credit_wallet`
4. `20260504150000_add_bgos_payment_abstraction`
5. `20260511103000_add_blizzway_wallet_payments`
6. `20260511113000_add_blizzway_nexa_onboarding`
7. `20260511124500_add_blizzway_companion_system`
8. `20260511160000_add_blizzway_pathway_gamification`
9. `20260511170000_add_blizzway_admin_content_ops`

Production commands from `BGOS`:

```bash
npx prisma validate
npx prisma migrate status
npx prisma migrate deploy
npx prisma generate
```

Rollback note:

- Take a database snapshot before `migrate deploy`.
- Roll back the frontend first for UI/proxy issues.
- Roll back BGOS only after confirming the previous deployment can run against the migrated schema.
- If wallet/payment integrity is in doubt, set `BLIZZWAY_PAYMENT_LIVE_GATEWAYS=false` and `BLIZZWAY_PAYMENT_GATEWAYS=MANUAL` while investigating.

## Seed Plan

Confirm production has:

- Blizzway companions from `BGOS/prisma/seed-marketplace.ts`
- Credit packages and subscription plans from `ensureBlizzwayPricingDefaults`
- Pathway quests and achievements from `ensureBlizzwayGamificationDefaults`
- Starter assessments and admissions data available through current BGOS data helpers
- Admin content config through `/api/internal/blizzway/content`
- BGOS internal owner/admin account for `/internal/blizzway`

Safe seed commands from `BGOS` when approved for the target database:

```bash
npm run seed-marketplace
```

Avoid reset/dev migration commands in production.

## Domain Setup

1. In Railway, open the Blizzway frontend service.
2. Add custom domain `blizzway.com`.
3. Add `www.blizzway.com` if the launch should support `www`.
4. Copy the DNS values Railway provides for each domain.
5. In the DNS provider for `blizzway.com`, add Railway's recommended records:
   - Apex `blizzway.com`: use Railway's recommended `A`, `ALIAS`, `ANAME`, or `CNAME flattening` record.
   - `www.blizzway.com`: usually a `CNAME` to the Railway-provided target.
6. Wait for DNS propagation.
7. Confirm Railway marks SSL as issued/active.
8. Confirm final URL: `https://blizzway.com`.
9. Decide redirect direction:
   - Recommended: `www.blizzway.com` redirects to `blizzway.com`.
   - Keep both in `BLIZZWAY_ALLOWED_ORIGINS` either way.

## Production Smoke Checklist

Run these in production after DNS/SSL is active:

- Landing page: `GET https://blizzway.com/` returns `200`.
- Robots: `GET https://blizzway.com/robots.txt` returns `200`.
- Sitemap: `GET https://blizzway.com/sitemap.xml` returns `200`.
- Signup creates a Blizzway business/user and welcome credits once.
- Login creates a BGOS session and redirects to dashboard.
- Logout clears session and protected pages redirect to login.
- Onboarding saves profile and generates BDP/pathway starter data.
- Dashboard loads real BGOS-backed data.
- BDP loads only the signed-in user's profile.
- Assessments load and do not expose other businesses.
- Admissions load and show starter data.
- My Pathway loads quests, levels, streaks, and rewards.
- Learning Garden loads user-scoped recommendations.
- Earning Universe loads user-scoped data.
- Magic Market loads without BGOS internal data exposure.
- Companions list/detail loads.
- Companion run before activation returns a friendly blocked state.
- Companion activation works once and duplicate activation does not double-charge.
- Companion run after activation creates one run for one idempotency key.
- Quick Boosts load.
- Soul Vault loads and remains user-scoped.
- Wallet summary, packages, plans, transactions, and invoices load.
- Payment order creation works in test/manual mode.
- Duplicate payment verification cannot double-credit.
- NEXA chat/recommendations work without exposing raw secrets or other users' data.
- Gamification quest completion, streak check-in, and reward claim are idempotent.
- BGOS `/api/internal/blizzway/overview` returns `401` anonymous, `403` non-owner, and `200` internal owner.
- Wrong business context returns `403`.
- Mobile smoke passes for landing, signup/login, dashboard, wallet, companions, and pathway.

## Monitoring Readiness

Minimum beta monitoring:

- Configure Sentry, Logtail, Railway drains, or equivalent before opening beta beyond internal users.
- Alert on repeated BGOS API `5xx` errors.
- Alert on legacy internal Blizzway compatibility logs, `internal:blizzway:*`, payment verification, and auth failures.
- Review payment failure logs and webhook logs daily during beta.
- Review admin manual wallet adjustments daily during beta.
- Keep a support issue tracker for `support@blizzway.com` and the approved WhatsApp/support number.

Suggested alert labels:

- `bgos-api-error`
- `blizzway-auth-failure`
- `blizzway-payment-failure`
- `blizzway-wallet-ledger-risk`
- `blizzway-admin-action`

## Safety Checks

Before launch:

```bash
git status --short --untracked-files=all
git ls-files node_modules .next BGOS/.next blizzway-frontend/.next
rg -n "(sk_live|sk_test|rzp_live|rzp_test|whsec_|BEGIN .*PRIVATE|DATABASE_URL=postgresql://[^U]|OPENAI_API_KEY=sk-)" -g "!*node_modules*" -g "!checked.txt" -g "!objects.txt"
```

Expected:

- No secrets are committed.
- `node_modules` is not tracked.
- `.next` is not tracked.
- Browser smoke profiles are not tracked.
- Legacy `/api/career7/*` route naming appears only where intentionally documenting BGOS internal compatibility.

## Beta Launch Plan

- Start with 20 beta users across students, professionals, and aspirants.
- Create a feedback channel before inviting users.
- Support contact: `support@blizzway.com` or the approved WhatsApp support number.
- Keep payments in manual/test mode for beta unless live mode has been explicitly approved.
- Public trust pages on `blizzway.com`: `/privacy`, `/terms`, `/refund`.
- Known limitations to disclose:
  - Some endpoints still use legacy internal `/api/career7/*` compatibility paths.
  - Stripe is disabled for live use until webhook verification is fully wired and tested.
  - Soul Vault is private/user-scoped; users should not store passwords, payment details, or official identity numbers.
  - NEXA v1 companion outputs are rule-based where provider orchestration is not enabled.

First 20-user flow:

1. Invite 5 students, 5 early-career professionals, 5 exam/admissions aspirants, and 5 internal testers.
2. Ask each user to complete signup, onboarding, dashboard review, one BDP action, one assessment, one companion activation/run, one wallet package view, and one logout/login cycle.
3. Capture feedback on clarity, trust, mobile usability, payment confidence, and NEXA usefulness.
4. Review BGOS logs and wallet ledgers after every 5 users.
5. Pause invites if auth, wallet, payment, or data-isolation issues appear.

Public launch gate:

- Zero known data leakage.
- Zero wallet double-credit issue.
- Zero broken protected route.
- SSL stable on `blizzway.com`.
- Monitoring active.
- Support ready.
- Payments intentionally configured.
- Rollback plan ready.

## Exact Command Set

Local verification from `blizzway-frontend`:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

BGOS verification from `BGOS`:

```bash
npm run lint
npx tsc --noEmit
npm run build
npx prisma validate
npx prisma migrate status
```

Production BGOS migration from `BGOS` after backup:

```bash
npx prisma migrate deploy
npx prisma generate
```

Railway frontend deploy settings:

```text
Root directory: blizzway-frontend
Build command: npm run build
Start command: npm run start
Config file: blizzway-frontend/railway.json
```
