<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/artifacts/observatory-water-poc.md; checkedOn: 2026-07-31; redactions: 0 -->

# Observatory water system

Date: 2026-07-22
Tasks: 4.31 foundation; 5.26 interaction integration
Status: implementation, automatic interaction diagnostics, desktop shader/fallback compile pass, and mobile Reduced/poster/failure presentation pass; real water input and performance QA pending

## Design contract

Visual thesis: a shallow slate basin catches muted sage and ivory light like a quiet geological instrument. The water supports the Observatory composition rather than becoming a glossy special-effect layer.

Scene plan:

1. The basin is one support surface inside the existing named water group.
2. The full tier uses shallow wave displacement, basin-depth variation, Fresnel reflection, and one warm directional glint from the locked Natural Observatory palette.
3. Reduced and static paths preserve the poster-first hierarchy rather than adding alternate visual chrome.

Interaction thesis: one repeating robot-contact impulse and deliberate primary pointer/touch presses share a bounded ripple field only when the scene is ready, visible, full quality, and motion-enabled. Pause freezes the shader at its current state and declines new impulses. Reduced motion or reduced quality uses a still lit material. Static, loading, failed, and unsupported states create no WebGL water, leaving the semantic poster authoritative.

## Technical-art contract

The surface is procedural and uses no generated or imported asset, texture, environment map, reflection render target, shadow, or post-processing pass. This is the appropriate procedural route for a bounded support material; no Mint asset was required.

| Tier           | Geometry                          | Motion                                                 | Structural surface cost                                                                       |
| -------------- | --------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Full shader    | 72 ? 48 segments, 6,912 triangles | Demand-render invalidation capped at 30 updates/second | 1 draw, 1 geometry, 1 material, 0 textures, 0 render targets, 0 post passes, 0 shadow casters |
| Reduced/simple | 1 ? 1 segment, 2 triangles        | None                                                   | 1 draw, 1 geometry, 1 material, 0 textures, 0 render targets, 0 post passes, 0 shadow casters |
| Static/poster  | No WebGL surface                  | None                                                   | Zero WebGL work                                                                               |

The full vertex shader combines two low-amplitude directional waves with a fixed five-slot ripple loop. Slot zero repeats every 1.2 seconds at the robot-hand contact derived from the shared robot spatial contract. Four transient slots accept primary pointer/touch presses, decay within 1.2 seconds, enforce a 140ms cooldown, and reject the feathered edge. One world-to-water transform boundary maps both authored and real hit positions; a rotating fixed-slot policy prevents allocation or unbounded impulse growth.

The vertex shader derives a displaced normal from two neighboring height samples. The fragment shader uses that normal for a bounded Fresnel mix, analytic directional-light reflection, and a `refract`-derived depth tint, then applies the renderer's tone mapping and color-space chunks. It does not sample the scene, a cubemap, or a texture, so ?reflection? and ?refraction? describe stylized lighting/depth cues rather than mirrored or transmitted scene geometry.

Desktop WebGL QA on 2026-07-23 exposed that `active` is reserved by the target GLSL compiler. The ripple envelope now uses `rippleActive`, and the deterministic shader contract rejects a future `float active` declaration.

React Three Fiber remains demand-rendered. A cleaned-up interval asks for at most 30 renders per second only while animation is active; `useFrame` mutates one shader time uniform and never writes React or scene-store state. Accepted pointer events update the fixed uniforms directly and request one render. Paused and hidden paths freeze time, reject input, and schedule no animation work; reduced motion/quality replaces the shader with the static surface. Fiber owns geometry/material disposal when the tier or scene unmounts.

An opt-in diagnostics facade now follows the existing progressive scene boundary without mounting debug UI or publishing a browser global. Its serializable capture identifies the active presentation tier, shader time, whether pointer input is enabled, robot ripple origin/age/cycle, every active pointer slot's origin/age/normalized decay/remaining lifetime/envelope, and controller acceptance/rejection totals. Rejections distinguish non-finite input, feathered-edge hits, and cooldown. Simple and poster captures deliberately expose no shader controller or synthetic time. The facade observes the existing controller and render clock; it does not trigger input, invalidate the Canvas, or add a frame loop.

## Automatic verification

Nine deterministic tests verify:

- triangle arithmetic and every declared structural budget;
- locked-palette color membership;
- robot world-to-water contact alignment, repeating-slot ownership, pointer cooldown, transient decay, inset rejection, and the four-pointer cap;
- accepted slot identity, explicit input-rejection reasons and totals, robot cycle, pointer age/remaining lifetime/envelope, and expiration;
- full, frozen, reduced, and poster tier resolution;
- shader/frozen diagnostic capture plus zero-controller reduced and poster capture;
- fixed-loop ripple, Fresnel reflection, analytic refraction-depth, tone-mapping, and color-space shader contracts;
- absence of samplers, render targets, Reflector utilities, React frame state, and store dispatch from the frame loop;
- primary pointer-down, local hit conversion, direct uniform projection, integration under the scene's one named water group, and opt-in facade forwarding with no production global.

The complete gate passed: 179 unit tests, formatting, zero-warning lint, strict type-check, content/palette/server/asset checks, the 13-route production build, and the post-build immersive boundary. The current rights-gated robot still prevents a public Canvas/model request, so this code adds no current critical-route WebGL work and does not replace the approved poster.

The later MVP assessor now also rejects water evidence unless Full quality uses the animated Shader tier with its bounded five-slot controller and Reduced quality or reduced motion uses the still Simple tier without a controller. Shader time, ripple values, robot-slot ownership, pointer-slot count, and normalized pointer origins must all be finite and within contract. The complete automatic gate now passes 216 tests.

## Browser evidence and remaining approval gates

Explicitly approved desktop-only QA at 1440?900 compiled the production Full shader through a repository-only in-memory GLTF harness. After the reserved-identifier correction, a fresh browser tab rendered the 1425?900 DPR-1 Canvas without a page or shader error; Reduced retained its still surface, and exact critical-load failure retained the complete poster with the Canvas layer hidden. The temporary harness was removed before the final build. The only browser warning was the already tracked upstream `THREE.Clock` deprecation in task 8.25.

Separately approved mobile QA at 390?844 rendered the still Reduced tier in a 375?212 DPR-1 Canvas, removed Canvas in Poster mode, and retained the exposed poster over a hidden Canvas on exact critical failure. The compact scene intentionally omits the focus control and moving water input, so this pass does not claim a real touch ripple.

Task 5.26 remains unchecked until the remaining acceptance scopes are observed:

- desktop remainder: use the opt-in water and renderer facades to inspect real robot/pointer ripple origin, decay, reflection/refraction readability, pause/freeze/resume, calls/triangles/geometries/materials/textures, and bounded demand-render activity; CPU/GPU frame time remains a separate profiler measurement;
- mobile remainder: use an explicitly interactive narrow-screen tier to exercise real touch input and capture its origin/decay diagnostics; Reduced/static presentation, poster fallback, touch-safe layout, and nonblank/error behavior already pass.
