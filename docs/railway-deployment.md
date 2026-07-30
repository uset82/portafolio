# Railway deployment

Railway is the user-selected target for the current hosted preview. The deployable workspace is `site/`; the repository root contains project-management and source-material files and is not an application root.

## Required service setting

In the Railway service, open **Settings > Source** and set:

```text
Root Directory: /site
```

This setting is required. Without it, Railpack scans the repository root, cannot see `site/package.json`, and reports that it cannot determine how to build the app. Do not add a root `start.sh` or wrapper `package.json` to work around the incorrect build context.

After the root directory is saved, redeploy the service. Railpack will detect the Node 22/pnpm Next.js application from `site/package.json` and `site/pnpm-lock.yaml`. The versioned `site/railway.json` then provides these deployment settings:

- builder: Railpack;
- build command: `pnpm build`;
- start command: `pnpm exec next start --hostname 0.0.0.0 --port $PORT`;
- health check: `/`, with a 300-second startup window;
- restart policy: on failure, up to three retries.

## Environment

Set `NEXT_PUBLIC_SITE_URL` to the assigned HTTPS preview origin before the hosted acceptance review. Keep `CC_AI_ENABLED=false` until the public knowledge, privacy, abuse-control, provider-policy, and live evaluation gates are approved. The current semantic portfolio and video hero do not require `OPENROUTER_API_KEY`; if CC AI is enabled later, store that key only in Railway's secret-variable store.

The homepage video and poster are under `site/public/videos/robot-water-sequence.mp4` and `site/public/images/robot-water-poster.jpg`, so both remain inside the `/site` deployment context.

## Preview and rollback

Treat the first successful Railway deployment as a preview, not an authorized production launch. Complete the hosted route, media, accessibility, metadata, security-header, caching, and failure-path checks in `maintaskplan.md` before production approval.

If a later preview regresses, use the service deployment history to redeploy the last verified successful deployment. Record its deployment ID and public URL in the task-plan evidence before calling the rollback path tested.
