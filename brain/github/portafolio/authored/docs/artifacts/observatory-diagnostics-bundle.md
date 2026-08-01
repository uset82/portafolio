<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/artifacts/observatory-diagnostics-bundle.md; checkedOn: 2026-07-31; redactions: 0 -->

# Observatory diagnostics bundle

Date: 2026-07-24  
Task: 5.35 immersive homepage MVP preflight  
Status: unified opt-in runtime evidence seam and deterministic contracts complete; production-browser journeys pending

## Purpose

The remaining immersive MVP review needs one coherent production-state record rather than ten unrelated captures. The Observatory bundle composes the existing renderer, camera, robot, ASTRAEA, PINÁCULO, Sound Lab, Future Energy, Electronics / AI, drone, and water diagnostic owners behind one optional facade without changing public UI, scene behavior, or demand-render scheduling.

## Snapshot contract

`capture()` returns one serializable versioned snapshot with:

- the last completed renderer frame, Canvas dimensions, GPU counters, and visible-scene counts;
- camera pose, requested view, transition phase, alignment, remaining deltas, and interruption counters;
- robot contract validity, phase, selection, normalized presentation, hand-water alignment, interaction/focus anchors, and idle state;
- ASTRAEA presentation, phase, selection/target progress, actual and target ring/pointer pose, and alignment errors;
- PINÁCULO presentation, phase, 24-position contract, selection/target progress, actual and target carrier/latch pose, and alignment errors;
- Sound Lab presentation, phase, selection/target progress, actual and target dial/slider/signal pose, alignment errors, and the mute-first source/player/amplitude hold;
- Future Energy presentation, phase, selection/target progress, actual and target pump/surface/latch pose, alignment errors, and two-circuit independence;
- Electronics / AI presentation, phase, selection/target progress, actual and target control/panel/indicator pose, alignment errors, and the concept-only claim boundary;
- drone phase, pose, world position, corridor/roof/robot-exclusion clearance, and attitude margin;
- water presentation, input state, shader time, robot/pointer ripple state, decay, and rejection counters.

The bundle also records an ordered `missingSources` list and reports `ready: false` whenever any owner is unavailable. It does not substitute estimates or invented placeholder state for an absent owner.

## Scenario evidence

`reportScenario(scenario, duration)` delegates the bounded demand-render activity sample and budget verdict to the renderer owner, then captures the nine companion owners in the same report. Evidence is ineligible when:

- renderer, camera, robot, ASTRAEA, PINÁCULO, Sound Lab, Future Energy, Electronics / AI, drone, or water diagnostics are unavailable;
- the renderer report is ineligible because the scenario is not a production build, has console errors, or exceeds an approved Full/Reduced scene budget.

This is a preflight interface, not proof that the MVP browser matrix has passed. A real report still requires the approved route, viewport, DPR, browser, device class, quality, motion, selection, and console context.

## Lifecycle and safety

- The public route requests no diagnostic facade.
- The existing progressive scene boundary forwards individual owners only when a legacy or unified consumer explicitly opts in.
- Canvas teardown clears renderer ownership; a replacement consumer receives the existing mounted renderer facade.
- Child camera, robot, ASTRAEA, PINÁCULO, Sound Lab, Future Energy, Electronics / AI, drone, and water owners clear their facades on teardown.
- The bundle publishes no `window` or `globalThis` value, mounts no debug UI, forces no invalidation, and creates no animation or polling loop.

## Verification

`pnpm verify` passes formatting, zero-warning lint, strict TypeScript, all 216 tests, content/palette/server/asset gates, the 13-route production build, and the immersive scan over 12 manifest assets, zero public GLBs, 26 client files, and one semantic poster fallback.

Task 5.35 remains unchecked because representative desktop/mobile Full, Reduced, Poster, no-WebGL, and reduced-motion journeys still require real rendered inspection, and the public Canvas remains correctly gated by the missing rights-cleared production robot.
