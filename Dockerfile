FROM node:20-alpine AS deps

WORKDIR /app/BGOS

COPY BGOS/package.json BGOS/package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder

WORKDIR /app/BGOS

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/BGOS/node_modules ./node_modules
COPY BGOS/ ./

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app/BGOS

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY --from=builder /app/BGOS/package.json ./package.json
COPY --from=builder /app/BGOS/package-lock.json ./package-lock.json
COPY --from=builder /app/BGOS/node_modules ./node_modules
COPY --from=builder /app/BGOS/.next ./.next
COPY --from=builder /app/BGOS/prisma ./prisma
COPY --from=builder /app/BGOS/next.config.mjs ./next.config.mjs

EXPOSE 3000

CMD ["npm", "run", "start"]
