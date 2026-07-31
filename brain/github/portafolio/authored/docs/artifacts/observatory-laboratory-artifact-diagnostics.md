<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/artifacts/observatory-laboratory-artifact-diagnostics.md; checkedOn: 2026-07-31; redactions: 0 -->

# Observatory Laboratory artifact diagnostics

Date: 2026-07-24  
Tasks: 5.30 Future Energy and Electronics / AI artifacts, and 5.35 immersive homepage MVP gate  
Status: opt-in mechanism and concept-boundary contracts complete; rendered browser evidence pending

## Purpose

Future Energy and Electronics / AI already own bounded selection mechanisms, but the unified Observatory report could not prove the applied poses or the conceptual boundaries that prevent these visual studies from reading as functioning products. Each optional facade now reads the same progress, target, and last-applied pose refs used by its existing `applyPose()` owner.

## Future Energy contract

The versioned snapshot reports:

- Full, Reduced, or Poster presentation and settled, animating, paused, reduced, or poster phase;
- selection, actual and target progress, actual and target pump/surface/latch pose;
- per-pump, per-surface, service-latch, and progress errors with an explicit settled verdict;
- two closed independent circuits, zero cross-connections, and distinct reservoir, pump, and stack-port ownership for each loop.

Settled evidence permits at most `0.001` progress error, `0.001` radians for pump/surface rotation, and `0.0005` metres for service-latch displacement. Poster and non-finite states expose no invented runtime pose.

## Electronics / AI contract

The versioned snapshot reports:

- Full, Reduced, or Poster presentation and settled, animating, paused, reduced, or poster phase;
- selection, actual and target progress, actual and target control/panel/indicator pose;
- control-angle, panel-height, indicator-height, and progress errors with an explicit settled verdict;
- the immutable concept boundary: no functioning hardware, AI inference, or live data claim; protected modules; a blank non-emissive mechanical indicator; and no rapid flashing.

Settled evidence permits at most `0.001` progress error, `0.001` radians for the control, and `0.0005` metres for panel or indicator displacement. Poster and non-finite states preserve the concept boundary without inventing runtime pose.

## Unified MVP behavior

The unified source order is renderer, camera, robot, ASTRAEA, PIN?CULO, Sound Lab, Future Energy, Electronics / AI, drone, and water. Missing owners yield `future-energy-unavailable` or `electronics-ai-unavailable` and make interactive evidence ineligible.

The MVP assessor additionally rejects:

- the wrong Full/Reduced tier, animation state, phase, selection, or target;
- missing/non-finite applied pose or unsettled/out-of-tolerance mechanism alignment;
- a Future Energy circuit count, closure, independence, connection, or node-ownership contradiction;
- any Electronics / AI snapshot that implies functioning hardware, AI inference, live data, an active status screen, unprotected modules, or rapid flashing.

## Lifecycle and safety

- Both facades are created only when individual or unified diagnostics consumers request them.
- They are forwarded through the existing shell and progressive boundary and clear on teardown.
- Applied pose refs update inside the existing bounded mechanism owners.
- No global, debug UI, provider request, generated asset, timer, invalidation source, or animation loop was added.
- Existing Full responses remain bounded to 760 ms and 700 ms at no more than 24 demand invalidations per second; Reduced and compact states still settle immediately.

## Verification

Four new contracts cover exact rest/focus settlement, transition, pause, Reduced, Poster, malformed state, circuit independence, and the concept-only electronics boundary. Strengthened unified and MVP-gate contracts require both owners and reject invalid evidence. `pnpm verify` passes formatting, zero-warning lint, strict TypeScript, all 216 tests, content/palette/server/asset gates, the 13-route production build, and the immersive scan over 12 manifest assets, zero public GLBs, 26 client files, and one semantic poster fallback.

Task 5.30 remains unchecked because transparent-material sorting, circuit readability, selection, framing, and mobile/touch behavior still require separately authorized rendered inspection. Task 5.35 remains unchecked because representative real scenarios and a rights-cleared production robot remain pending.
