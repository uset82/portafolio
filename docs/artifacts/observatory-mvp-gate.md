# Observatory immersive MVP gate

Date: 2026-07-24  
Task: 5.35 immersive homepage MVP gate  
Status: deterministic scenario and evidence-completeness contract complete; approved production-browser evidence pending

## Required scenario matrix

The gate defines seven versioned scenarios so a partial desktop success cannot be presented as complete MVP evidence:

| Scenario               | Viewport | WebGL2      | Quality | Motion  | Expected presentation |
| ---------------------- | -------- | ----------- | ------- | ------- | --------------------- |
| Desktop Full           | 1440×900 | Supported   | Full    | Full    | Canvas                |
| Desktop Reduced        | 1440×900 | Supported   | Reduced | Full    | Canvas                |
| Desktop Static         | 1440×900 | Supported   | Static  | Full    | Poster                |
| Desktop no-WebGL       | 1440×900 | Unsupported | Static  | Full    | Poster                |
| Desktop reduced motion | 1440×900 | Supported   | Reduced | Reduced | Canvas                |
| Mobile Reduced         | 390×844  | Supported   | Reduced | Full    | Canvas                |
| Mobile Static          | 390×844  | Supported   | Static  | Full    | Poster                |

Static and unsupported-WebGL scenarios deliberately reject runtime diagnostics because no Canvas should be active. Interactive scenarios require the unified renderer, camera, robot, ASTRAEA, PINÁCULO, Sound Lab, Future Energy, Electronics / AI, drone, and water report.

## Shared semantic contract

Every scenario must expose and successfully exercise the same content routes:

- Work;
- Laboratory;
- Sound;
- Cosmos;
- Story;
- Contact;
- Selected Systems;
- CC AI.

The evidence record also requires visible identity, supporting copy, a nonblank primary visual, understandable status, no horizontal overflow, successful project/navigation/chat activation, and reversible Canvas focus where an interactive scene exists.

## Fail-closed assessment

`assessObservatoryMvpGate()` returns `incomplete` when it finds any of these conditions:

- an unknown, missing, or duplicate scenario;
- development-build or mismatched route/device/viewport/DPR/WebGL/quality/motion context;
- an incorrect Canvas/poster presentation;
- hidden semantic content, missing entrypoints, failed primary journeys, overflow, or console errors;
- missing diagnostics for an interactive scenario or unexpected diagnostics for a poster scenario;
- an ineligible or context-mismatched unified diagnostics report;
- an unmounted camera, wrong final overview/artifact view, active or unsettled transition, pose outside the authored position/target/FOV/clipping tolerances, or fewer than two completed focus/reset movements;
- missing/malformed robot state, absent presentation, wrong tier phase, hand alignment over 5 mm, or an incorrect idle-active state;
- missing/non-finite ASTRAEA state, wrong tier/phase/selection target, or unsettled ring/pointer alignment beyond the authored tolerances;
- invalid PINÁCULO 24-position/one-step state, wrong tier/phase/selection target, or unsettled carrier/latch alignment beyond the authored tolerances;
- missing/non-finite Sound Lab state, wrong tier/phase/selection target, unsettled dial/slider/signal alignment, or any source/player/sound/amplitude state that contradicts the current mute-first approval hold;
- missing/non-finite Future Energy state, wrong tier/phase/selection target, unsettled pump/surface/latch alignment, or a contradiction in the two closed independent circuit contract;
- missing/non-finite Electronics / AI state, wrong tier/phase/selection target, unsettled control/panel/indicator alignment, or any functioning-hardware, AI-inference, live-data, active-screen, unprotected-module, or rapid-flashing claim;
- a drone tier/phase mismatch, non-finite pose or world position, failed safety inspection, or corridor, roof, robot-exclusion, or attitude margin below its authored limit;
- a water tier/animation/input mismatch, missing or unexpected controller, non-finite shader/ripple state, an invalid robot slot, more than five active slots, or an out-of-bounds pointer impulse;
- zero-sized CSS or drawing-buffer Canvas dimensions.

The assessor is a pure serializable contract. It starts no server, browser, Canvas, polling, timer, animation frame, profiler, or screenshot workflow.

## Verification

Six deterministic MVP-gate contracts cover the matrix, a complete passing ten-owner evidence set, missing semantic/journey evidence, diagnostic, settled-camera, focal-robot, ASTRAEA, PINÁCULO, Sound Lab, Future Energy, Electronics / AI, safe-drone, and tier-correct-water requirements/context, zero-sized Canvas rejection, and unknown/duplicate reports. `pnpm verify` passes formatting, zero-warning lint, strict TypeScript, all 216 tests, content/palette/server/asset gates, the 13-route production build, and the immersive scan over 12 manifest assets, zero public GLBs, 26 client files, and one semantic poster fallback.

Task 5.35 remains unchecked. Extended browser, screenshot, Canvas-diagnostics, production-preview, and mobile work were not run in this pass because the Three.js verification policy requires approval for those exact scopes. The rights-cleared production robot also remains the public Canvas activation gate.
