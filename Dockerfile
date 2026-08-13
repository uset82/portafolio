FROM node:22-bookworm-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

COPY site/package.json site/pnpm-lock.yaml site/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY site/ ./
COPY brain/repositories ./brain/repositories

ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL}"

RUN pnpm build
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
COPY --from=build --chown=node:node /app/brain/repositories ./brain/repositories

USER node

EXPOSE 3000

CMD ["sh", "-c", "exec ./node_modules/.bin/next start --hostname 0.0.0.0 --port \"${PORT:-3000}\""]
