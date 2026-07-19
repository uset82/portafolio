# Observatory scene shell and state ownership

Date: 2026-07-19
Task: 4.30
Status: verified, intentionally unmounted

## Ownership

| Concern | Owner | Contract |
| --- | --- | --- |
| Renderer and WebGL context | `ThreeCanvas` | One client-only lazy Canvas, bounded DPR, demand rendering |
| Camera | `ObservatoryCamera` | One default perspective camera projects requested views and ignores stale completion IDs |
| Scene composition | `ObservatorySceneShell` | One root with named architecture, water, guide, artifact, context, environment, and camera groups |
| Application state | `ObservatorySceneStore` | External reducer/store observed through `useSyncExternalStore` |
| Frame scheduling | React Three Fiber | No React state writes or `useFrame` callback exist in this slice |
| Asset lifecycle | `gltf-runtime.ts` | Shared loading, cache, decoder, retry, and disposal boundary remains separate |
| Essential controls/status | Semantic DOM | Canvas selection will mirror, never replace, ordinary controls and content |

## State contract

The external state owns:

- `static`, `reduced`, and `full` quality plus automatic/manual source;
- no-preference/reduced motion, explicit pause, and document visibility;
- muted, playing, paused, and unavailable scene-sound projection;
- poster, preparing, ready, error, unsupported, and context-lost lifecycle states;
- real loaded/total counts, active loading group, retry attempt, and safe recoverable error metadata;
- selected artifact ID;
- camera view, request/settled phase, and monotonic request ID.

Defaults fail closed: static poster, fallback camera, no selection, muted sound, no error, and no renderable live scene. Sound Lab selection does not start audio. A play state requires an explicitly user-initiated action. Static quality, unsupported WebGL, context loss, and asset failure keep or return the experience to the poster path.

## Camera and composition

The eight camera views translate the approved storyboard into provisional meter-space positions, targets, lens values, clipping planes, and durations. New requests supersede old requests; stale completion IDs cannot settle the active camera. Actual interpolation belongs to task 5.32.

All 12 registry assets appear exactly once in seven named scene groups. The typed local light rig uses only locked Natural Observatory palette roles, disables shadows, and contains one hemisphere plus key/fill/rim directionals. The environment is explicitly transparent, sRGB, local-light-only, without fog or an HDR URL. Rights-approved geometry and environment media remain absent.

## Verification

Eight focused tests prove registry/group parity, interaction-target parity, camera/light/environment validity, fail-closed defaults, clamped real progress, selection without audio autoplay, stale-camera cancellation, motion/pause/visibility resolution, safe errors/retry/context loss, and the external-store/no-frame-loop boundary.

`pnpm verify` passes with 66 tests and the 13-page production build. The shell is not imported by a route, so no WebGL scene or unapproved model is mounted and no visual-quality claim is made.

Extended browser QA was not run because the shell is intentionally unmounted. The next optional desktop scope begins only after poster-first mounting has a real test journey. Mobile QA requires separate approval.
