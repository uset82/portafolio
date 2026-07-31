<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/artifacts/immersive-ci-gate.md; checkedOn: 2026-07-31; redactions: 0 -->

# Immersive CI gate

Date: 2026-07-19
Task: 4.35
Status: complete

## Outcome

The pull-request workflow and local `pnpm verify` command now run the same explicit three-stage immersive gate:

1. formatting, lint, strict types, all deterministic tests, content/palette/server-boundary contracts, and the public GLB gate;
2. the Next.js production build;
3. validation of the emitted immersive production artifacts.

The hosted workflow remains read-only, uses the frozen lockfile, and keeps its existing concurrency cancellation.

## Hosted verification

On 2026-07-24, [GitHub Actions run 30120350422](https://github.com/uset82/portafolio/actions/runs/30120350422) passed on published `main` commit `8db4d2e`. Its `Format, test, and build` job completed the locked dependency installation, source/contracts/tests, production build, and immersive production-artifact fallback validation successfully. This is the hosted proof for task 4.17; preview and production deployment checks remain separate release work.

## Asset manifest and GLB validation

`validate-immersive-build.ts` parses the typed runtime registry and the provider-neutral manifest, then checks:

- version, units, coordinate system, asset count, IDs, status, scale, and LOD-count parity;
- non-negative full/reduced scene budgets and per-asset metadata budgets;
- equality between each manifest triangle budget and the registry's LOD0 limit;
- every currently published registry GLB through the existing Khronos/glTF Transform inspection pipeline.

The current result is truthful: 12 manifest assets and zero public GLBs because production model URLs remain rights-gated.

## Client-boundary validation

After `next build`, the gate recursively scans emitted text client files and fails on:

- the OpenRouter SDK name, server key variable, CC AI enable flag, or key prefix;
- the deterministic chat model ID;
- repository-only Observatory test URLs or generator markers.

The current build contains 24 scanned client files and no forbidden marker.

## Representative fallback validation

The gate reads the actual prerendered `.next/server/app/index.html` rather than a source approximation. It requires the semantic main landmark, identity headline, optimized Observatory poster and useful alt text, truthful poster-mode status, and a no-script motion override. It also requires the poster to precede the status and rejects any prerendered Canvas or Canvas layer while critical model URLs remain unavailable.

This check exposed that Motion's server output starts the scene and reading-order items at `opacity:0`. `RootLayout` now supplies a no-script-only style that restores opacity and neutral transforms. JavaScript-enabled visitors retain the approved restrained entrance, while no-script visitors receive the same visible hierarchy without a blank hero.

## Verification

- `pnpm verify`: passed.
- Formatting, zero-warning lint, strict TypeScript, and all 90 deterministic tests: passed.
- Content, palette, OpenRouter source-boundary, asset-manifest, and public-GLB checks: passed.
- Next.js 16.2.10 Turbopack build: passed with all 13 routes generated.
- Immersive build artifact gate: passed with 12 manifest assets, zero public GLBs, 24 client files, and one semantic poster fallback.
- GitHub Actions run 30120350422 passed the complete workflow on published `main`; its hosted proof is recorded under task 4.17.
