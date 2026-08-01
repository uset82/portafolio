<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/artifacts/observatory-renderer-diagnostics.md; checkedOn: 2026-07-31; redactions: 0 -->

# Observatory renderer diagnostics

Date: 2026-07-23  
Task: 5.24 environment measurement support  
Status: opt-in runtime seam, deterministic contracts, and full automatic gate complete; production-browser measurements pending

## Purpose

The Observatory needs measured renderer evidence for each approved scenario rather than estimates derived only from authored geometry. The diagnostic owner supplies serializable evidence to a temporary QA harness without adding a visible production panel, a persistent global, or a second render loop.

## Capture contract

An opted-in Canvas consumer receives three operations:

- `capture()` records CSS and drawing-buffer dimensions, DPR, the most recently completed renderer frame, draw calls, triangles, points, lines, GPU geometry/texture/program counts, and unique visible scene geometry/material counts;
- `sampleActivity(duration)` compares the renderer frame counter across a bounded 250–5,000ms window without calling `invalidate()` or forcing a frame.
- `reportScenario(scenario, duration)` combines both results with the required build mode, browser, device class, route, viewport/DPR, Full or Reduced quality, motion state, selected artifact, and browser console counts.

The default activity window is 1,000ms. The result states `forcedFrames: false` so a settled demand-rendered scene can truthfully report zero observed frames.

## Budget verdict

The report compares the renderer's completed-frame calls and triangles plus unique visible-scene materials against the approved provider-neutral budgets:

| Tier    | Draw calls | Visible triangles | Materials |
| ------- | ---------- | ----------------- | --------- |
| Full    | 120        | 180,000           | 24        |
| Reduced | 70         | 90,000            | 16        |

Each check records actual, maximum, overage, and pass/fail values. Runtime thresholds are contract-tested against `docs/assets/observatory-3d-manifest.json`.

A capture is ineligible as production evidence when any of these conditions exists:

- the scenario reports a development build;
- the browser console reports an error;
- a scene budget is exceeded.

## Interpretation boundary

- Draw calls and triangles describe the renderer's most recently completed frame.
- GPU memory fields are the counters exposed by `WebGLRenderer.info`; they are not a browser-process memory total.
- Visible-scene counts describe unique renderable resources currently traversable through visible parents.
- Observed render rate is frame-counter activity during the requested window. It is not a CPU/GPU frame-time measurement and must not be reported as one.
- Browser performance evidence still needs an approved production-mode scenario with viewport, DPR, quality tier, selected artifact, motion state, and console status recorded beside the snapshot.

## Safety

The callback is optional and unused by the public route. No diagnostic object is assigned to `window`, no production UI is mounted, no renderer setting changes, and no frame is scheduled solely for measurement.

## Verification

`pnpm verify` passes formatting, zero-warning lint, strict TypeScript, all 177 tests, content/palette/server/asset gates, the 13-route production build, and the immersive scan over 12 manifest assets, zero public GLBs, 25 client files, and one semantic poster fallback.
