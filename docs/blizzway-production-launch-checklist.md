# Blizzway Production Launch Checklist

Last updated: 2026-05-11

## 1. Environment Setup

- BGOS has production `DATABASE_URL`.
- BGOS has `AUTH_SECRET`, `AUTH_URL`, `NEXTAUTH_URL`, and `NEXT_PUBLIC_APP_URL` set to HTTPS origins.
- Blizzway frontend has `NEXT_PUBLIC_API_URL=/api/bgos`.
- Blizzway frontend has `BGOS_API_URL` set to the deployed BGOS HTTPS origin.
- Blizzway frontend has `NEXT_PUBLIC_SITE_URL=https://career7.in` or the final Blizzway domain.
- No private keys, database URLs, webhook secrets, or provider secrets are committed.

## 2. DNS and SSL

- `career7.in` points to the Blizzway frontend deployment.
- `www.career7.in` either redirects to apex or is configured as an alias.
- BGOS API/admin deployment has its own HTTPS origin.
- SSL certificates are active for all production domains.

## 3. Database and Migrations

- Run `npx prisma validate` in BGOS.
- Run `npx prisma migrate status` against production before deploy.
- Run `npx prisma migrate deploy` during deployment.
- Confirm Phase 11/12 Blizzway migrations are applied.
- Do not run destructive reset or dev migration commands against production.

## 4. Seed and Admin Data

- Confirm BGOS internal owner account exists and can access `/internal/blizzway`.
- Seed or create required Blizzway companions, assessments, admission pathways, credit packages, subscription placeholders, content config, quests, and achievements.
- Verify admin wallet actions require a reason and create ledger entries.

## 5. Payments

- Confirm live payment gateway mode intentionally enabled or disabled.
- Set `BLIZZWAY_PAYMENT_GATEWAYS`, `BLIZZWAY_DEFAULT_PAYMENT_GATEWAY`, and `BLIZZWAY_PAYMENT_CURRENCY`.
- Configure Razorpay/Stripe live keys only in BGOS production env.
- Configure webhook endpoint, webhook secret, and provider dashboard event delivery.
- Test payment success, failure, duplicate webhook, and ledger idempotency.

## 6. Security Smoke

- Anonymous user cannot access Blizzway protected pages.
- Non-admin cannot access `/api/internal/blizzway/*`.
- BGOS internal owner can access Blizzway admin overview.
- Blizzway frontend `/api/bgos/*` proxy rejects internal BGOS paths.
- Blizzway user data stays scoped to `businessModel=blizzway` and the session business.
- No raw secrets or sensitive onboarding dumps are visible in browser responses.

## 7. Functional Smoke

- Public landing page loads.
- Login, signup, logout, and session health work.
- Onboarding saves and creates BDP/pathway starter data.
- Wallet summary, transactions, packages, and top-up order creation work.
- Companion list/detail/activate/run work with credit checks.
- My Pathway quests, streaks, achievements, XP, and rewards work.
- Admin companion, assessment, admission, wallet, request, user, and content sections load.

## 8. SEO and UX

- `robots.txt` and `sitemap.xml` return production URLs.
- Metadata, Open Graph image, Twitter card, favicon, and canonical URL render.
- Mobile landing, login, dashboard, wallet, companions, and pathway screens are usable.
- Broken links and console-breaking errors are checked in production browser smoke.

## 9. Monitoring

- Production logs are available for BGOS and Blizzway frontend.
- Payment webhook logs include provider IDs and idempotency keys.
- Admin actions include admin ID and reason where applicable.
- Sentry, Logtail, or equivalent error monitoring is queued before broad launch.

## 10. Rollback Plan

- Keep previous successful BGOS and Blizzway deployment IDs available.
- Roll back frontend first if public routing/SEO breaks.
- Roll back BGOS only after confirming no new migration dependency would break old code.
- If payment or wallet integrity is affected, disable live gateways and switch to manual mode while investigating.
- Preserve database snapshots/backups before migration deploys.
