# Observatory PINÁCULO diagnostics

Date: 2026-07-24  
Tasks: 5.28 PINÁCULO artifact and 5.35 immersive homepage MVP gate  
Status: opt-in runtime mechanism contract complete; rendered browser evidence pending

## Purpose

PINÁCULO already owns one bounded carrier-and-latch response, but the unified Observatory report could not prove that the carrier retained 24 positions, advanced exactly one position, or settled its latch. The optional facade now reads the same progress and pose refs used by the real `applyPose()` owner.

## Snapshot contract

`capture()` returns one serializable versioned snapshot with:

- Full, Reduced, or Poster presentation and settled, animating, paused, reduced, or poster phase;
- current selection, normalized progress, and the mechanism's actual zero-or-one target;
- the 24-position contract and exact `2π / 24` one-position angle;
- current and target position offsets;
- last-applied and target carrier rotation plus latch lift;
- progress, carrier-angle, and latch-height errors with an explicit settled verdict.

Full and Reduced settled evidence permits at most `0.001` progress error, `0.001` radians of carrier error, and `0.0005` metres of latch error. Non-finite pose input becomes an explicit missing pose/alignment state. Poster captures retain the static 24-position contract but expose no invented runtime progress, position, or pose.

## Unified MVP behavior

The unified Observatory source order is now renderer, camera, robot, ASTRAEA, PINÁCULO, Sound Lab, Future Energy, Electronics / AI, drone, and water. Missing PINÁCULO ownership yields `pinaculo-unavailable` and makes interactive evidence ineligible.

The MVP assessor additionally rejects:

- the wrong Full/Reduced tier, animation state, or phase for the scenario;
- selection, target progress, or target position that disagrees with the captured scenario;
- a position count other than 24 or a one-position angle other than `2π / 24`;
- missing/non-finite applied pose or a current position offset that has not reached its target;
- missing, unsettled, or out-of-tolerance carrier/latch alignment.

The final scenario snapshot is expected to be settled after the reversible focus/reset journey and may correctly be back at position zero.

## Lifecycle and safety

- The facade is created only when an individual or unified diagnostics consumer requests it.
- It is forwarded through the existing scene shell and progressive boundary and clears on teardown.
- The applied pose ref is updated inside the existing `applyPose()` owner.
- No global, debug UI, polling, invalidation source, timer, or animation loop was added.
- Existing Full motion remains bounded to the authored 700 ms response and 24 demand invalidations per second; Reduced and compact states still settle immediately.

## Verification

Two PINÁCULO diagnostics contracts cover exact rest/one-position settlement and transition, pause, Reduced, Poster, and malformed states. Strengthened unified and MVP-gate contracts require PINÁCULO and reject invalid evidence. `pnpm verify` passes formatting, zero-warning lint, strict TypeScript, all 216 tests, content/palette/server/asset gates, the 13-route production build, and the immersive scan over 12 manifest assets, zero public GLBs, 26 client files, and one semantic poster fallback.

Task 5.28 remains unchecked because live desktop/mobile appearance, selection, framing, and overlap still require separately authorized rendered inspection. Task 5.35 still requires real scenario evidence plus a rights-cleared production robot.
