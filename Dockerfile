FROM node:20-alpine AS deps

WORKDIR /app/7universe-frontend

COPY 7universe-frontend/package.json 7universe-frontend/package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder

WORKDIR /app/7universe-frontend

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/7universe-frontend/node_modules ./node_modules
COPY 7universe-frontend/ ./

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app/7universe-frontend

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY --from=builder /app/7universe-frontend/package.json ./package.json
COPY --from=builder /app/7universe-frontend/package-lock.json ./package-lock.json
COPY --from=builder /app/7universe-frontend/node_modules ./node_modules
COPY --from=builder /app/7universe-frontend/.next ./.next
COPY --from=builder /app/7universe-frontend/prisma ./prisma
COPY --from=builder /app/7universe-frontend/next.config.mjs ./next.config.mjs

EXPOSE 3000

CMD ["npm", "run", "start"]
