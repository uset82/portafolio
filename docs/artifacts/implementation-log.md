# Implementation log

Date: 2026-07-19  
Slice: semantic poster-first foundation

## Implemented

- Shared semantic shell with skip link, CC identity, desktop/mobile navigation, active routes, footer, and contact path.
- Approved home copy and layered Observatory poster composition.
- Real DOM Selected Systems links for ASTRAEA, PINÁCULO, and Future Energy.
- Responsive route shells for Work, Laboratory, Sound, Cosmos, Story, Contact, three named system pages, and 404 recovery.
- Locked natural palette and typography/layout/motion tokens.
- Motion root configured with `reducedMotion="user"`; adapted Animate UI button primitive; reading-order entrance.
- Honest CC AI panel and mobile sheet with disabled service state—no fake model response and no client key.
- Editorial Laboratory, Sound, Story/Cosmos, and footer continuation below the first viewport.
- Next.js image optimization and bundled font pipeline.
- Strict runtime schemas for projects, media, experience, education, trips, hobbies, links, sources, metadata, and the planning inventory.
- A 26-entry content inventory that names every known gap, fallback, rights state, owner, and launch impact without publishing unverified facts.
- Server-parsed homepage identity, actions, navigation, and Selected Systems records; reference projects remain unpublished concepts.
- Automated content and palette contract checks, including deliberate invalid fixtures and forbidden-color sentinels.
- Shared DOM/Three.js palette constants covering 30 approved colors and 11 future material roles.
- Responsive container, section, stack, cluster, 12/8/4-column grid, media-frame, prose, and visually-hidden layout primitives.
- Typed action link/button, editorial heading, status tag, optimized image frame, and editorial link-row primitives using the approved palette and interaction states.
- Homepage actions, Observatory poster, Selected Systems links, route headings, and concept status now exercise the shared UI primitives rather than duplicating markup.
- Native audio/video foundation with manual mute-first playback, no preload, required video posters, optional caption tracks, transcripts, visible credits/rights, and adjacent error recovery.
- External provider foundation that creates no iframe before explicit consent, then uses a lazy named sandboxed frame with a persistent privacy notice, load status, retry state, and approved external fallback.
- Sound route source-readiness ledger that truthfully shows the publication requirements while approved tracks, posters, captions, transcripts, and provider URLs remain unavailable.
- Four Node baseline tests covering the approved content set, video accessibility failures, autoplay embed rejection, and the Sound route's semantic no-media fallback.
- Pull-request verification workflow with pinned Node/pnpm, frozen-lockfile installation, pnpm download caching, concurrency cancellation, read-only repository permissions, and the complete `pnpm verify` gate.
- Exact `@openrouter/sdk` 0.13.65 dependency with a lazy `server-only` factory, required-key failure, normalized HTTP referrer, approved CC AI app title, unsafe-URL rejection, and no debug logger.
- Mockable OpenRouter construction plus four focused configuration/factory tests and an automated source-boundary check that rejects runtime/key use in client components.
- Disabled-by-default `POST /api/cc-ai` route with strict JSON/history/locale validation, server request IDs, no-store responses, explicit non-streaming behavior, disconnect/timeout aborts, provider token and response-character caps, and requested/responding model disclosure.
- Provider-neutral CC AI service and OpenRouter chat adapter with safe 402/429/configuration/timeout/abort/provider/invalid-response normalization; tests use only deterministic providers and no message bodies or raw SDK errors are logged.
- Server-configured CC AI model policy with a variable `openrouter/free` prototype default, named override, deduplicated ordered fallback sequence, actual responding-model metadata, and a fail-closed paid production switch.
- OpenRouter request routing constrained to zero-data-retention endpoints that deny provider data collection; provider fallback remains available only within those privacy filters.
- Same-origin CC AI request guard with Origin/Referer and Fetch Metadata validation, trusted hosting IP plus server-issued HttpOnly session limits, one-active-request-per-session and process concurrency ceilings, bounded state, `Retry-After`, and distinct forbidden/rate/busy responses.
- Provider work remains single-attempt: model/provider fallback occurs inside one bounded OpenRouter request, while visitor retries are explicit and pass through the local limit guard.
- Public-only CC AI knowledge builder over the validated content model: factual approval, publication, rights, and all-public-source gates exclude private/design-only/held records without reading provenance files.
- Deterministic whole-record JSON context capped at 8,000 characters, traceable public source IDs, response knowledge metadata, status-preservation rules, prompt-injection boundary, and an exact honest-unknown instruction. The current approved context correctly contains zero facts.
- Clean-checkout foundation proof for exact commit `71368ad`: frozen-lockfile install, all 40 tests and standard checks, 13-page production build, desktop/mobile production inspection, overflow/image/console checks, and the mobile navigation keyboard path.
- Exact compatible Three.js runtime set: Three.js 0.185.1, React Three Fiber 9.6.1, Drei 10.7.7, and matching Three.js types on React 19.2.4.
- Reusable `LazyThreeCanvas` project boundary with SSR disabled, an internal renderer owner, bounded DPR, demand rendering, transparent antialiasing, no preserved drawing buffer/default shadows, caller-owned accessible fallback, and a named `useGLTF`/`useKTX2`/`Preload`/`PerformanceMonitor` Drei allowlist.
- Three runtime contract tests bring the deterministic suite to 43; the full production build passes and its current initial client chunks contain no Three.js runtime markers because no scene is mounted yet.
- Typed Zod contract plus bundle-safe registry data for all 12 Observatory assets, including stable IDs, meter scale, planned nodes/clips, material roles, per-LOD triangle budgets and nullable URLs, poster/DOM fallbacks, interaction targets, explicit provenance/copyright gaps, and hero/deferred/on-demand priority.
- Registry-to-manifest tests prove ID and LOD parity, local fallback existence, palette-role integrity, and fail-closed behavior: no current candidate has a public GLB URL, and adding one before runtime/provenance approval is rejected.
- Self-hosted Three.js 0.185.1 Draco and Basis/KTX2 decoder files with pinned hashes and the upstream MIT license; no mutable decoder CDN or version mixing.
- Shared glTF loader configuration attaches one reusable Draco instance, meshopt, renderer-detected KTX2, and two-worker ceilings; each explicit attempt uses a fresh LoadingManager and a first-fatal-error latch so retry/progress state cannot drift.
- Scoped GLB cache eviction, abort support, permanent decoder teardown, and deduplicated cleanup for geometries, materials, textures, closable image bitmaps, and skeletons. Five focused loader tests and the tightened public-rights registry contract bring the deterministic suite to 53.
- Offline GLB gate using pinned glTF Transform, Khronos glTF Validator, Draco, and meshoptimizer tooling. It reports source hash/bytes, official validity, meter dimensions, transforms, required nodes/clips, materials, textures, visible triangles, draw calls, extensions, and per-registry/manifest budgets.
- Deterministic Meshopt variant generation preserves the contract, validates before writing, emits a pinned-toolchain/input/output hash sidecar, refuses implicit overwrite, and supports byte-for-byte regeneration checks. Five synthetic-fixture tests bring the deterministic suite to 58 while the public registry correctly remains empty.
- Typed Observatory scene configuration assigns all 12 registry assets exactly once across seven named groups and defines provisional storyboard camera views, a locked-palette no-shadow local light rig, a transparent sRGB environment with no external map, and explicit renderer/camera/scene/state/frame/DOM ownership.
- An external reducer/store owns quality, motion/pause/visibility, muted scene sound, real loading progress and safe failure/retry states, selected artifact, and monotonic cancellable camera requests. The R3F shell projects snapshots without `useFrame` or React state updates in the frame loop; eight focused tests bring the deterministic suite to 66 while the shell remains unmounted.
- The unmounted water group now owns a locked-palette procedural shader with shallow wave displacement, analytic reflected light, and demand invalidation capped at 30 updates per second. Reduced motion/quality uses one still two-triangle standard material and the static path renders nothing; four contract tests bring the suite to 70 without a browser or performance claim.

## Intentionally deferred

- Browser-compiled and measured water validation, mounted Three.js/R3F scene, capability/poster-first loading systems, and production 3D assets.
- Live CC AI activation, user-approved public knowledge records, optional normalized streaming, and a durable shared limiter if production uses multiple function instances.
- Unverified project, CV, music, video, travel, social, email, and metrics content.
- Expanded accessibility/end-to-end coverage, the first clean CI run, deployment, and release work.
