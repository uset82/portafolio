FROM node:22-bookworm-slim AS build
LABEL cacm.guide="railway-2026-08-13-site-brain"

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=3072"

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

COPY site/package.json site/pnpm-lock.yaml site/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY site/ ./

ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL}"

# Next 16 defaults `next build` to Turbopack. Its native compiler allocates
# outside the V8 heap, so the 3 GB cap and the single-worker throttle in
# site/next.config.ts do not bound it; Railway's image builder OOM-kills the
# step with no error output and keeps the previous deployment live. Webpack
# stays inside the capped heap and honours that throttle.
RUN pnpm build --webpack
RUN pnpm prune --prod

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

WORKDIR /app

COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public

USER node

EXPOSE 3000

CMD ["sh", "-c", "exec ./node_modules/.bin/next start --hostname 0.0.0.0 --port \"${PORT:-3000}\""]
