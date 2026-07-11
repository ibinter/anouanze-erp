FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# ── deps (prod only) ─────────────────────────────────────────────────────────
FROM base AS deps
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
RUN npm ci --workspace=@anouanze/api --include-workspace-root --omit=dev

# ── builder ───────────────────────────────────────────────────────────────────
FROM base AS builder
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
RUN npm ci --workspace=@anouanze/api --include-workspace-root
COPY apps/api ./apps/api
RUN cd apps/api && npx prisma generate
RUN cd apps/api && npm run build

# ── runner ────────────────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

# node_modules are at root in npm workspaces
COPY --from=deps    /app/node_modules          ./node_modules
# Copy prisma client generated in builder (includes generated files)
COPY --from=builder /app/node_modules/.prisma  ./node_modules/.prisma
# Compiled dist
COPY --from=builder /app/apps/api/dist         ./dist
# Prisma schema + migrations
COPY --from=builder /app/apps/api/prisma       ./prisma

EXPOSE 4000
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main"]
