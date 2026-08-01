<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/artifacts/observatory-astraea-diagnostics.md; checkedOn: 2026-07-31; redactions: 0 -->

# Observatory ASTRAEA diagnostics

Date: 2026-07-24  
Tasks: 5.27 ASTRAEA artifact and 5.35 immersive homepage MVP gate  
Status: opt-in runtime state contract complete; rendered browser evidence pending

## Purpose

ASTRAEA is the artifact used by the existing Canvas focus/reset journey, but its ring alignment and pointer response were previously absent from the unified Observatory report. The new optional facade reads the same refs used by the single bounded mechanism owner, so evidence describes the applied pose rather than running a parallel simulation.

## Snapshot contract

`capture()` returns one serializable versioned snapshot with:

- Full, Reduced, or Poster presentation and settled, animating, paused, reduced, or poster phase;
- current selection, normalized progress, and the mechanism's actual zero-or-one target;
- the last applied outer, middle, and inner ring angles plus pointer lift;
- the exact target pose;
- progress error, per-ring angular errors, maximum ring error, pointer error, and a settled verdict.

Full and Reduced settled evidence permits at most `0.001` progress error, `0.001` radians of ring error, and `0.0005` metres of pointer error. Non-finite pose input becomes an explicit missing pose/alignment state instead of leaking non-serializable values. Poster captures expose no invented mechanism pose.

## Unified MVP behavior

The unified Observatory source order is now renderer, camera, robot, ASTRAEA, PINÁCULO, Sound Lab, Future Energy, Electronics / AI, drone, and water. Missing ASTRAEA ownership yields `astraea-unavailable` and makes interactive evidence ineligible.

The MVP assessor additionally rejects:

- the wrong Full/Reduced tier, animation state, or phase for the scenario;
- selection or target progress that disagrees with the captured scenario;
- missing or non-finite applied pose;
- missing, unsettled, or out-of-tolerance ring/pointer alignment.

The final scenario snapshot is expected to be settled after the reversible focus/reset journey; it does not require ASTRAEA to remain selected.

## Lifecycle and safety

- The facade is created only when an individual or unified diagnostics consumer requests it.
- It is forwarded through the existing scene shell and progressive boundary and clears on teardown.
- The applied pose ref is updated inside the existing `applyPose()` owner.
- No global, debug UI, polling, invalidation source, timer, or animation loop was added.
- Existing Full motion remains bounded to the authored 760 ms response and 24 demand invalidations per second; Reduced and compact states still settle immediately.

## Verification

Two ASTRAEA diagnostics contracts cover exact rest/focus settlement and transition, pause, Reduced, Poster, and malformed states. Strengthened unified and MVP-gate contracts require ASTRAEA and reject invalid evidence. `pnpm verify` passes formatting, zero-warning lint, strict TypeScript, all 216 tests, content/palette/server/asset gates, the 13-route production build, and the immersive scan over 12 manifest assets, zero public GLBs, 26 client files, and one semantic poster fallback.

Task 5.27 remains unchecked because its live desktop/mobile appearance and interaction still require separately authorized rendered inspection, and task 5.35 still requires real scenario evidence plus a rights-cleared production robot.
