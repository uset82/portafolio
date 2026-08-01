<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/artifacts/observatory-progressive-loading.md; checkedOn: 2026-07-31; redactions: 0 -->

# Observatory poster-first progressive loading

Date: 2026-07-19
Task: 4.33
Status: implementation and automatic contracts complete; browser no-blank verification remains open

## Outcome

The homepage now owns a real progressive Observatory boundary while preserving the approved poster as the first and permanent safety layer. Semantic hero content, navigation, calls to action, project links, CC AI access, the optimized priority image, and a polite scene-status message render without waiting for WebGL or a model request.

The current registry intentionally exposes no public model URL. The two hero-critical models, `observatory-shell` and `robot-guide`, therefore keep `canMountCanvas` false. This is the correct launch-safe behavior: the route performs no GLB request and does not create a Canvas until every critical model has passed the existing provenance, rights, and asset gates.

## Progressive plan

- Full quality selects the first available LOD; reduced quality selects the lightest available LOD; static quality selects none.
- Hero-critical assets are required before Canvas mounting and load sequentially with truthful asset-count progress.
- Deferred assets begin only after the critical group is ready, using `requestIdleCallback` with a bounded timeout fallback.
- On-demand assets load only when their matching DOM/scene interaction target becomes selected.
- A missing or failed critical asset leaves the poster in place and reports a safe status rather than exposing a blank viewport.

The plan is derived from the typed registry and scene-group ownership; it does not duplicate model URLs or silently bypass approval state.

## Runtime ownership and cleanup

`ObservatoryProgressiveExperience` owns the semantic poster-first boundary and the outside-Canvas scene store. `LazyThreeCanvas` remains an SSR-disabled dynamic boundary. `ObservatoryLiveScene` is a second dynamic boundary that owns model attempts, deferred scheduling, selection subscriptions, and the R3F shell.

Each model attempt is abortable. Unmounting cancels active work and idle timers, unsubscribes from selection state, disposes loaded geometry/material/texture resources through the shared glTF lifecycle utility, evicts only plan-owned cache URLs, and clears retained references. No React state is written from a frame loop.

## Verification

- Prettier check: passed.
- ESLint with zero warnings: passed.
- Strict TypeScript check: passed.
- Deterministic unit suite: 83 passed, including five progressive-loading tests.
- Content, palette, server-boundary, and public-3D-asset contract checks: passed.
- `git diff --check`: passed.
- Standard production build: passed with all 13 routes generated.

## Remaining acceptance evidence

Task 4.33 stays unchecked. A browser session must still prove the first viewport never blanks at representative desktop and mobile sizes, including slow/failing model requests and WebGL failure. That browser/WebGL work is approval-gated by the Three.js verification policy and was not inferred from the user's general continuation request. Current rights-gated URLs also prevent an honest real-model loading claim.
