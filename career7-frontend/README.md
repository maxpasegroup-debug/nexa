# Blizzway Frontend

Blizzway is the standalone frontend for The Magical Career Pathway, powered by NEXA. It is kept separate from the BGOS application so it can be hosted, released, and configured independently.

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
NEXT_PUBLIC_API_URL=https://api.bgos.online
```

No authentication or backend API integration is wired yet. Those should be added in a later implementation phase.

## Railway Deployment

This project is suitable for Railway deployment using Nixpacks. Railway can detect the Node/Next.js app from `package.json` and use:

- Build command: `npm run build`
- Start command: `npm run start`

Set `NEXT_PUBLIC_API_URL` in Railway project variables before deployment.
