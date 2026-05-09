# 7Universe Frontend

7Universe is the standalone frontend and business-model layer for the 7-slot onboarding journey. It is separate from BGOS and Blizzway/Career7 so it can be hosted independently on `7universe.online`.

## Local Development

```bash
npm install
npm run prisma:generate
npm run dev
```

## Production

Set these Railway variables:

```env
DATABASE_URL=
UNIVERSE_JWT_SECRET=
ADMIN_PASSWORD=
```

Railway build command:

```bash
npx prisma generate && npx prisma migrate deploy && npm run build
```

Railway start command:

```bash
npm run start -- -p $PORT
```

For local builds:

```bash
npm run build
```

Important: because this app uses the same Railway PostgreSQL database as BGOS, do not run `prisma db push --accept-data-loss` from this minimal standalone schema. Use the included additive migration with:

```bash
npx prisma migrate deploy
```

Attach the custom domain `7universe.online` to this standalone service in Railway, then point DNS to Railway using the CNAME/value Railway provides.
