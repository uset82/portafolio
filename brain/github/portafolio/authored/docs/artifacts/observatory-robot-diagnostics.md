<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/artifacts/observatory-robot-diagnostics.md; checkedOn: 2026-07-31; redactions: 0 -->

# Observatory robot diagnostics

Date: 2026-07-24  
Task: 5.25 robot focal asset and task 5.35 immersive MVP preflight  
Status: opt-in runtime evidence seam and deterministic contracts complete; rights-cleared asset and browser inspection pending

## Purpose

The focal robot is the last external hero-critical asset and therefore the public Canvas activation gate. Its runtime evidence must distinguish a valid mounted guide from a missing, malformed, misplaced, or incorrectly animated model before an interactive scenario can pass.

## Capture contract

The robot facade returns one serializable snapshot with:

- active, paused, reduced, or poster phase;
- current selection state;
- required-node and required-clip coverage, contract issues, and canonical bounds;
- presentation position, yaw, uniform scale, and scaled dimensions;
- measured hand-contact and approved water-target positions plus alignment error;
- transformed interaction anchor and focus target;
- idle clip availability, active state, elapsed time, duration, normalized cycle, and the 24 FPS cap.

Invalid asset contracts expose their exact issues, return no presentation measurement, and never claim active idle animation.

## Runtime ownership

`ObservatoryRobot` remains the single presentation and mixer owner. It forwards the facade only when an individual or unified diagnostics consumer opts in, clears it on teardown, and publishes no production global or debug UI. Capturing state schedules no frame and creates no additional timer or loop.

The instrumentation exposed an existing tier mismatch: Reduced quality could still run the idle mixer because activation checked motion mode but not quality. Idle animation now requires both Full quality and Full motion. Reduced quality, reduced motion, pause/hidden state, poster state, and malformed assets all report inactive motion.

## Unified evidence

The Observatory bundle now requires five owners in interactive scenarios:

1. renderer;
2. camera;
3. robot;
4. drone;
5. water.

A missing robot facade produces `robot-unavailable`, keeps the unified snapshot unready, and makes the scenario report ineligible. Static and no-WebGL poster scenarios continue to reject runtime diagnostics as expected.

## Verification

Two new robot contracts cover valid contract/presentation/contact/selection/idle evidence and Reduced/Paused/Poster/malformed inactivity. Strengthened integration and unified-bundle contracts verify callback ownership, cleanup, five-source ordering, and fail-closed behavior. `pnpm verify` passes formatting, zero-warning lint, strict TypeScript, all 193 tests, content/palette/server/asset gates, the 13-route production build, and the immersive scan over 12 manifest assets, zero public GLBs, 25 client files, and one semantic poster fallback.

Tasks 5.25 and 5.35 remain unchecked because no rights-cleared optimized robot with approved materials/reflection is public, and production desktop/mobile visual, input, animation, hand-contact, focus, fallback, and renderer evidence still requires separately approved browser scopes.
