# Observatory Sound Lab diagnostics

Date: 2026-07-24  
Tasks: 5.29 Sound Lab artifact and 5.35 immersive homepage MVP gate  
Status: opt-in mechanism and audio-hold contract complete; approved media and rendered browser evidence pending

## Purpose

Sound Lab already owns one bounded dial-and-slider response and an intentionally empty audio catalog. The unified Observatory report could not previously prove either the applied mechanism state or that the runtime remained mute, player-free, and amplitude-free while sources are unapproved. The optional facade now reads the same progress, pose, scene-sound, and approved-amplitude values used by the real mechanism owner.

## Snapshot contract

`capture()` returns one serializable versioned snapshot with:

- Full, Reduced, or Poster presentation and settled, animating, paused, reduced, or poster phase;
- current selection, normalized progress, and the mechanism's actual zero-or-one target;
- last-applied and target dial rotation, dial lift, slider offset, and signal lift;
- progress, dial-angle, dial-height, slider, and signal errors with an explicit settled verdict;
- source-readiness, catalog count, player availability, autoplay/preload/default-mute policy, actual scene-sound state, approved amplitude, and response-active state.

Full and Reduced settled evidence permits at most `0.001` progress error, `0.001` radians of dial error, and `0.0005` metres of dial, slider, or signal displacement error. Non-finite progress, amplitude, or pose input becomes an explicit missing state. Poster captures expose no invented runtime pose while retaining the truthful audio-hold contract.

## Audio integrity

The current launch contract is deliberately strict:

- source status is `awaiting-approved-sources`;
- the catalog contains zero tracks and no player is available;
- sound is muted, autoplay is disabled, and preload is `none`;
- approved amplitude is zero and mechanical audio response is inactive.

The diagnostics do not make playback possible. A fabricated playing/unmuted amplitude can be represented as invalid evidence, but the MVP assessor rejects it. Real audio work remains blocked on task 2.29 and user approval U.15 for sources, rights, credits, duration, notes, and waveform policy.

## Unified MVP behavior

The unified source order is renderer, camera, robot, ASTRAEA, PINÁCULO, Sound Lab, Future Energy, Electronics / AI, drone, and water. Missing Sound Lab ownership yields `sound-lab-unavailable` and makes interactive evidence ineligible.

The MVP assessor additionally rejects:

- the wrong Full/Reduced tier, animation state, phase, selection, or target;
- missing/non-finite applied pose or unsettled/out-of-tolerance dial, slider, or signal alignment;
- a source, catalog, player, mute, autoplay, or preload state that disagrees with the launch contract;
- any playing/unmuted runtime state, approved amplitude, or active audio response while sources remain unapproved.

## Lifecycle and safety

- The facade is created only when an individual or unified diagnostics consumer requests it.
- It is forwarded through the existing scene shell and progressive boundary and clears on teardown.
- The applied pose ref is updated inside the existing `applyPose()` owner.
- No audio element, source, provider request, global, debug UI, polling, invalidation source, timer, or animation loop was added.
- Existing Full motion remains bounded to the authored 700 ms response and 24 demand invalidations per second; Reduced and compact states still settle immediately.

## Verification

Two Sound Lab diagnostics contracts cover exact rest/focus settlement, transition, pause, Reduced, Poster, malformed state, and fabricated audio response. Strengthened unified and MVP-gate contracts require Sound Lab and reject invalid evidence. `pnpm verify` passes formatting, zero-warning lint, strict TypeScript, all 216 tests, content/palette/server/asset gates, the 13-route production build, and the immersive scan over 12 manifest assets, zero public GLBs, 26 client files, and one semantic poster fallback.

Task 5.29 remains unchecked because approved tracks, rights metadata, real playback, and live keyboard/touch/failure behavior are still unavailable. Task 5.35 remains unchecked because representative rendered scenarios and a rights-cleared production robot are still pending.
