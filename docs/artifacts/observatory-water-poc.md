# Observatory water proof of concept

Date: 2026-07-19
Task: 4.31
Status: implemented and automatically verified; approval-gated visual/performance QA pending

## Design contract

Visual thesis: a shallow slate basin catches muted sage and ivory light like a quiet geological instrument. The water supports the Observatory composition rather than becoming a glossy special-effect layer.

Scene plan:

1. The basin is one support surface inside the existing named water group.
2. The full tier uses shallow wave displacement, basin-depth variation, Fresnel reflection, and one warm directional glint from the locked Natural Observatory palette.
3. Reduced and static paths preserve the poster-first hierarchy rather than adding alternate visual chrome.

Interaction thesis: ambient ripples run only when the scene is ready, visible, full quality, and motion-enabled. Pause freezes the shader at its current state. Reduced motion or reduced quality uses a still lit material. Static, loading, failed, and unsupported states create no WebGL water, leaving the semantic poster authoritative.

## Technical-art contract

The surface is procedural and uses no generated or imported asset, texture, environment map, reflection render target, shadow, or post-processing pass. This is the appropriate procedural route for a bounded support material; no Mint asset was required.

| Tier | Geometry | Motion | Structural surface cost |
| --- | --- | --- | --- |
| Full shader | 72 × 48 segments, 6,912 triangles | Demand-render invalidation capped at 30 updates/second | 1 draw, 1 geometry, 1 material, 0 textures, 0 render targets, 0 post passes, 0 shadow casters |
| Reduced/simple | 1 × 1 segment, 2 triangles | None | 1 draw, 1 geometry, 1 material, 0 textures, 0 render targets, 0 post passes, 0 shadow casters |
| Static/poster | No WebGL surface | None | Zero WebGL work |

The full vertex shader combines two low-amplitude directional waves with one decaying radial ripple. It derives a displaced normal from two neighboring height samples. The fragment shader uses that normal for a bounded Fresnel mix and analytic directional-light reflection, then applies the renderer's tone mapping and color-space chunks. It does not sample the scene, a cubemap, or a texture, so the word “reflection” refers to stylized reflected light rather than mirror-like scene geometry.

React Three Fiber remains demand-rendered. A cleaned-up interval asks for at most 30 renders per second only while animation is active; `useFrame` mutates one shader time uniform and never writes React or scene-store state. Paused, reduced, hidden, and unmounted paths schedule no water animation work. Fiber owns geometry/material disposal when the tier or scene unmounts.

## Automatic verification

Four deterministic tests verify:

- triangle arithmetic and every declared structural budget;
- locked-palette color membership;
- full, frozen, reduced, and poster tier resolution;
- ripple, Fresnel, reflection, tone-mapping, and color-space shader contracts;
- absence of samplers, render targets, Reflector utilities, React frame state, and store dispatch from the frame loop;
- integration under the scene's one named water group.

All 70 unit tests, lint, and strict type-check pass. The component remains absent from application routes, so it adds no current critical-route Three.js work and does not replace the approved poster.

## Pending approval-gated evidence

No browser, screenshot, WebGL compile, canvas diagnostic, FPS/frame-time profile, or desktop/mobile viewport test was run. The Three.js verification policy requires explicit approval for those scopes.

Task 4.31 remains unchecked until both acceptance scopes are observed:

- desktop: compile the real shader, inspect ripple/reflection readability and pause behavior, confirm a nonblank canvas with no console errors, and capture renderer calls/triangles/geometries/materials/textures plus FPS/frame time at one approved viewport;
- mobile, under separate approval: exercise the simple tier at a narrow viewport and record the same diagnostics, poster fallback, touch-safe layout, and nonblank/error behavior.
