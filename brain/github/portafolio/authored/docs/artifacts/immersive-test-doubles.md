<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/artifacts/immersive-test-doubles.md; checkedOn: 2026-07-31; redactions: 0 -->

# Deterministic immersive test doubles

Date: 2026-07-19
Task: 4.34
Status: complete

## Outcome

The repository now has shared, deterministic Three.js and CC AI test doubles for route, component, and later end-to-end coverage. They use the same typed contracts and dependency seams as production while performing no model download and no OpenRouter request.

## Observatory double

`createObservatoryTestRegistry()` derives a fresh registry from the production registry, supplies schema-valid repository-test URLs only for model LODs, and explicitly labels their provenance as a repository-only synthetic fixture. It does not change or bypass the production registry, whose URLs remain rights-gated and `null`.

`createObservatoryGltfAttemptDouble()` implements the production `GltfLoadingAttemptFactory` contract. It returns minimal in-memory Three.js groups, records requested URLs and attempt/abort counts, publishes deterministic loading snapshots, and can reproduce an exact URL failure or a pre-load abort. It imports no production `GLTFLoader`, calls no `loadAsync`, and calls no `fetch`.

The progressive component exposes a client-to-client content seam for test assets and the loading-attempt factory. The public server-to-client homepage API remains poster-only, so production callers cannot pass a test loader accidentally.

## CC AI double

`createCcAiProviderDouble()` scripts ordered success or normalized provider-error replies, records the provider messages/model policy/token limit, and defaults to the stable model ID `test/deterministic-model`.

`createCcAiRouteDouble()` composes that provider with the real request handler, a deterministic request ID, and the real prototype model-policy contract. It supplies:

- a JSON `Request` factory for route tests;
- the real handler response for service/component integration tests;
- a serializable `{ status, headers, body }` fulfill payload for later browser route interception.

The double imports no OpenRouter SDK and performs no network request.

## Production isolation

All test helpers live under `site/src/testing/` and are imported only by the deterministic test suite. The production homepage continues to use `createGltfLoadingAttempt`; the production CC AI route continues to use its server-only OpenRouter provider. A post-build scan of `.next/static` found no test model ID, `/three/test/` URL, or synthetic Observatory generator marker.

## Verification

- Seven focused test-double contracts passed.
- All 90 deterministic tests passed.
- Formatting, zero-warning lint, strict TypeScript, content, palette, server-boundary, and public-asset checks passed.
- The Next.js 16.2.10 Turbopack production build passed and generated all 13 routes.
- Production client-chunk test-double marker scan passed.
- `git diff --check` is required again before the scoped commit.
