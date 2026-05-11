# Blizzway Frontend

Blizzway is the standalone frontend for The Magical Career Pathway, powered by NEXA and integrated with BGOS for auth, workspace scoping, marketplace data, wallet data, and Soul Vault storage.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start the production server locally:

```bash
npm run start
```

Run lint checks:

```bash
npm run lint
```

## Environment

Copy `.env.example` to `.env.local` for local development and set values as needed.

```env
NEXT_PUBLIC_API_URL=/api/bgos
BGOS_API_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=https://blizzway.com
NEXT_PUBLIC_APP_URL=https://blizzway.com
ALLOWED_ORIGINS=https://blizzway.com,https://www.blizzway.com
```

The frontend proxies BGOS through `/api/bgos`. The proxy intentionally allows only Blizzway-required BGOS paths: `/api/auth/*`, `/api/register`, `/api/forgot-password`, `/api/reset-password`, and legacy internal `/api/career7/*` compatibility routes. BGOS currently keeps several Blizzway-compatible endpoints under those legacy internal paths, so do not rename them until BGOS exposes native `/api/blizzway/*` routes.

For production on `blizzway.com`, keep `NEXT_PUBLIC_API_URL=/api/bgos` and set `BGOS_API_URL` to the deployed BGOS origin. Configure DNS, metadata, and BGOS allowed origins for `https://blizzway.com` and `https://www.blizzway.com`.

BGOS must also include the frontend origins in `BLIZZWAY_ALLOWED_ORIGINS`, for example `https://blizzway.com,https://www.blizzway.com`.

## Railway Deployment

This project is suitable for Railway deployment using Nixpacks. Railway can detect the Node/Next.js app from `package.json` and use:

- Build command: `npm run build`
- Start command: `npm run start`

Set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, and `BGOS_API_URL` in Railway or Vercel project variables before deployment. Use HTTPS origins in production.

## Production Notes

- Security headers are configured in `next.config.ts`.
- `robots.txt`, `sitemap.xml`, Open Graph metadata, and Twitter card metadata are generated from the app directory.
- Do not expose BGOS secrets through `NEXT_PUBLIC_*` variables.
- Payment/live-mode configuration belongs in BGOS, not this frontend.
