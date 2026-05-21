# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/aura-web/package.json ./apps/aura-web/
COPY packages/db/package.json ./packages/db/

RUN npm ci --workspace=apps/aura-web --workspace=packages/db

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/aura-web/node_modules ./apps/aura-web/node_modules

COPY packages/db ./packages/db
COPY apps/aura-web ./apps/aura-web

WORKDIR /app/apps/aura-web

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/aura-web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/aura-web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/aura-web/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
