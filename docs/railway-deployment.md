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
