# BGOS

BGOS is the shared backend/core platform for the Nexa apps, including Blizzway. It owns auth, Prisma data, wallet/payment flows, Blizzway admin operations, and legacy `/api/career7/*` endpoints used by the Blizzway frontend.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Environment

Copy `.env.example` to `.env.local` for local development. Use safe placeholders in committed examples only.

Required production values include:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL` / `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` if Google login is enabled
- Payment provider values such as `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`
- Blizzway payment flags: `BLIZZWAY_PAYMENT_GATEWAYS`, `BLIZZWAY_DEFAULT_PAYMENT_GATEWAY`, `BLIZZWAY_PAYMENT_CURRENCY`, `BLIZZWAY_PAYMENT_LIVE_GATEWAYS`

## Deployment

Build command:

```bash
npm run build
```

Start command:

```bash
npm run start
```

Run production migrations before promoting a deployment:

```bash
npx prisma migrate deploy
npx prisma validate
```

## Blizzway Production Notes

- Blizzway admin APIs live under `/api/internal/blizzway/*` and require the existing BGOS internal owner guard.
- Public Blizzway user APIs still live under legacy `/api/career7/*`; callers must send `x-business-model: blizzway`.
- Wallet ledger, payments, companion runs, quests, achievements, and rewards have idempotency keys or unique constraints where repeat submissions are expected.
- Security headers are configured in `next.config.mjs`.
- Avoid raw onboarding/BDP answer dumps in frontend responses unless a route is explicitly user-scoped.

## Monitoring Readiness

- Add Sentry or a Logtail-compatible logger before broad public launch.
- Keep payment webhook/event logs queryable by provider event ID.
- Keep admin wallet actions tied to reason metadata and admin user ID.
- Review production logs for `career7:*`, `internal:blizzway:*`, auth, and payment webhook errors after each deployment.
