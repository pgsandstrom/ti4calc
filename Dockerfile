FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# --- Dependencies ---
FROM base AS deps
WORKDIR /app

# husky's prepare script has no .git to hook up inside the image
ENV HUSKY=0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM base AS builder
WORKDIR /app

# .git is not in the build context, so the commit is baked in from the outside.
# No default: a wrong-but-plausible hash is worse than a failed build.
ARG GIT_HASH
RUN test -n "$GIT_HASH" || { echo "GIT_HASH build arg is required"; exit 1; }
ENV GIT_HASH=$GIT_HASH

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm run build

# --- Runtime ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
