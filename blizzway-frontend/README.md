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
```

The frontend proxies BGOS through `/api/bgos`. BGOS currently keeps several Blizzway-compatible endpoints under legacy `/api/career7/*` paths, so do not rename those API paths until BGOS exposes native `/api/blizzway/*` routes.

## Railway Deployment

This project is suitable for Railway deployment using Nixpacks. Railway can detect the Node/Next.js app from `package.json` and use:

- Build command: `npm run build`
- Start command: `npm run start`

Set `NEXT_PUBLIC_API_URL` in Railway project variables before deployment.
Set `BGOS_API_URL` to the deployed BGOS origin when the frontend and BGOS are hosted separately.
