FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# ── deps ──────────────────────────────────────────────────────────────────────
FROM base AS deps
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
RUN npm ci --workspace=@anouanze/api --include-workspace-root

# ── build ─────────────────────────────────────────────────────────────────────
FROM deps AS builder
COPY apps/api ./apps/api
RUN cd apps/api && npx prisma generate
RUN cd apps/api && npm run build

# ── runner ────────────────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
