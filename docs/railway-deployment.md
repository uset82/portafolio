# Railway deployment

Railway is the user-selected target for the current hosted preview. The Next.js application remains under `site/`, while the Railway service intentionally builds from the repository root through the root `Dockerfile`.

## Required source state

Commit and push these files to the branch connected to Railway:

- `Dockerfile`;
- `.dockerignore`;
- `railway.json`;
- the current `site/` application.

Use **Deploy Latest Commit** after pushing. Redeploying failed deployment `c59b0098` only rebuilds its old source archive, which contains neither the root Dockerfile nor `railway.json`.

## Service settings

Keep **Root Directory** empty or `/`. The Dockerfile is at the repository root and copies only the `site/` application into the image. If a custom **Config File** path is present, set it to `/railway.json`.

Railway should report that it detected the Dockerfile instead of asking Railpack to infer a root language. The versioned configuration provides:

- Dockerfile builder with `Dockerfile` at the source root;
- Node 22 and exact pnpm 10.13.1 inside the image;
- frozen-lockfile install and Next.js production build from `site/`;
- `$PORT`-aware Next.js startup through the image command;
- `/` health check with a 300-second startup window;
- restart on failure, up to three retries.

The root `.dockerignore` limits the image context to `Dockerfile` and `site/`, while explicitly excluding local dependencies, build output, coverage, logs, and environment files.

## Environment

Set `NEXT_PUBLIC_SITE_URL` to the assigned HTTPS preview origin before the hosted acceptance review. Keep `CC_AI_ENABLED=false` until the public knowledge, privacy, abuse-control, provider-policy, and live evaluation gates are approved. The current semantic portfolio and video hero do not require `OPENROUTER_API_KEY`; if CC AI is enabled later, store that key only in Railway's secret-variable store.

The homepage video and poster are under `site/public/videos/robot-water-sequence.mp4` and `site/public/images/robot-water-poster.jpg`, so both are copied into the production image.

## Preview and rollback

Treat the first successful Railway deployment as a preview, not an authorized production launch. Complete the hosted route, media, accessibility, metadata, security-header, caching, and failure-path checks in `maintaskplan.md` before production approval.

If a later preview regresses, use the service deployment history to redeploy the last verified successful deployment. Record its deployment ID and public URL in the task-plan evidence before calling the rollback path tested.

## Build failures inside the image

`next build` in Next.js 16 uses Turbopack by default. Turbopack allocates compiler memory outside the V8 heap, so `NODE_OPTIONS=--max-old-space-size=3072` and `experimental.cpus: 1` in `site/next.config.ts` do not bound it. On a memory-limited image builder the step is OOM-killed (exit 137) with no error message, and the previous deployment stays live.

The Dockerfile therefore pins the image build to `pnpm build --webpack`, which honours both limits. Keep that flag when upgrading Next.js, and keep the default `pnpm build` for local and GitHub Actions builds. A silent "Build image" failure means the builder ran out of resources, not that the commit's content is broken: check the GitHub Actions verification run for the same commit first, then use **Deploy Latest Commit** to retry.
