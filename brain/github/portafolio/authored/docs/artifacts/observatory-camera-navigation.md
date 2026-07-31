<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/artifacts/observatory-camera-navigation.md; checkedOn: 2026-07-31; redactions: 0 -->

# Observatory camera and navigation

Date: 2026-07-23
Task: 5.32
Status: runtime implementation and automatic diagnostics complete; representative browser journeys pending

## Runtime contract

One external scene store owns monotonic camera requests and the `requested → transitioning → settled` lifecycle. One React Three Fiber camera owner applies position, look target, FOV, near plane, and far plane. Full and Reduced use bounded demand invalidation; frame deltas are capped at 50ms. Hidden documents pause an active transition, while reduced motion, static quality, and the global pause settle immediately. A new request begins from the current pose and supersedes the previous request ID.

Artifact focus remains separate from navigation links. A native semantic focus control selects or returns to the overview, Escape clears selection outside editable controls, and a validated `focus` query parameter uses native history so Back/Forward and shareable deep links can restore state. Primary site destinations remain ordinary Next.js links.

## Diagnostic contract

An optional callback exposes one serializable `capture()` facade from the existing camera owner. It records:

- camera-mounted state, requested view, external-store phase, transition mode, and request ID;
- current and requested position, target, FOV, near, and far values;
- position, target, FOV, and clipping-plane deltas remaining before alignment;
- active transition request identity, request/scene match, elapsed and remaining milliseconds, raw and eased progress, source/destination poses, and completion state;
- animated starts/completions, immediate completions, and interrupted request totals.

The facade is forwarded only when a QA consumer requests it. It publishes no production global, mounts no debug interface, calls no invalidation function, and creates no second animation loop. Near and far clipping planes now participate in approximate pose equality, preventing an otherwise aligned camera from hiding a clipping mismatch.

The MVP assessor now corroborates the final reversible journey against this facade. An interactive scenario is incomplete unless the camera is mounted, points at the expected final overview or selected-artifact view, has no active transition, is settled within the authored position/target/FOV/clipping tolerances, uses the correct animated or reduced-motion immediate mode, and records at least two completed focus/reset movements.

## Verification and remaining evidence

Two focused camera contracts cover deterministic progress, pause, stale-request mismatch, settled alignment, clipping mismatch, serialization, counter ownership, scene-boundary forwarding, and the absence of a global or second loop. The strengthened MVP contract rejects invalid final camera evidence. The complete `pnpm verify` gate passes 216 tests, formatting, zero-warning lint, strict TypeScript, content/palette/server/asset checks, the 13-route production build, and the 12-manifest/0-public-GLB/26-client-file immersive scan.

Task 5.32 remains unchecked until representative desktop and mobile browser journeys observe focus/reset, repeated interruption, invalid and valid deep-link loading, Escape, Back/Forward, native route entry, scroll restoration, visual camera framing, touch behavior, and console state.
