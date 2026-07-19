# Carlos Carpio — Submerged Earth Observatory

This directory is the generated website workspace for Carlos Carpio's portfolio. The repository root remains the control plane for research, decisions, design specifications, asset records, and the living task ledger.

## Prerequisites

- Node.js 22.x (see `.nvmrc`)
- pnpm 10.13.1 through Corepack or a compatible local installation

## Setup

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open the local address printed by Next.js. The initial implementation is semantic and poster-first: the approved Observatory reference is visible immediately, while future WebGL assets remain an optional lazy enhancement.

## Commands

| Command                      | Purpose                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `pnpm dev`                   | Start local development                                                      |
| `pnpm build`                 | Create the production build                                                  |
| `pnpm start`                 | Run a completed production build                                             |
| `pnpm preview`               | Preview a completed production build                                         |
| `pnpm lint`                  | Run the Next.js ESLint rules with zero warnings                              |
| `pnpm typecheck`             | Run strict TypeScript checks without emitting files                          |
| `pnpm content:check`         | Validate runtime content, inventory, provenance references, and failures     |
| `pnpm palette:check`         | Reject colors outside the approved Natural Observatory palette               |
| `pnpm boundary:check`        | Reject OpenRouter runtime/key use outside the server-only boundary           |
| `pnpm assets:check`          | Validate every public registry GLB or one explicit candidate against budgets |
| `pnpm assets:optimize`       | Generate a deterministic Meshopt GLB and provenance sidecar                  |
| `pnpm assets:verify-variant` | Rebuild a variant and verify its input, output, toolchain, and byte hashes   |
| `pnpm test:unit`             | Run schema, service, GLB-pipeline, and critical static-render tests          |
| `pnpm test`                  | Run unit, content, palette, boundary, and published-3D-asset checks          |
| `pnpm format`                | Apply Prettier formatting                                                    |
| `pnpm format:check`          | Verify formatting without changing files                                     |
| `pnpm verify`                | Run every formatting, lint, type, contract, test, asset, and build check     |

Pull requests and pushes to `main` use `.github/workflows/verify.yml` to install from the frozen lockfile and run the complete verification gate in a clean Linux checkout. Dependency caching accelerates downloads but never replaces the locked install.

## Source ownership

- `src/app/` — routes, metadata, route-level composition, and global styles
- `src/components/` — shared semantic UI and selected adapted Animate UI primitives
- `src/content/` — typed local content used by routes
- `src/styles/` — locked implementation tokens
- `src/lib/` — pure utilities, validation, and server-only service helpers when introduced
- `src/tests/` or colocated `*.test.ts(x)` — focused schema, component, route, and fallback tests
- `public/images/` — optimized/public image sources and poster fallbacks
- `../docs/` — decisions, design contract, content verification, rights, and asset specifications

Content must follow `../AGENTS.md` and `../maintaskplan.md`. Do not add invented projects, employers, dates, metrics, collaborators, outcomes, links, or rights claims. The approved hero strings are recorded in `../docs/content/v1-design-content.md`.

## Content workflow

- `src/content/schemas.ts` is the executable content contract. Its fields and evidence boundaries are documented in `../docs/content/content-schema.md`.
- `../docs/content/content-inventory.json` tracks planned and missing material without making it visible on the site.
- `src/content/records.ts` contains only approved display records. Routes load these through the real runtime schema in `src/content/site.ts`.
- A valid record is not automatically launch-ready. `publication: "hold"` keeps concepts and incomplete projects out of evidence-backed case studies.
- Run `pnpm content:check` after every content edit. Failures name the exact record path that needs correction.

The natural palette follows the same boundary: CSS tokens live in `src/styles/tokens.css`, while `src/styles/palette.ts` supplies the matching constants for future Three.js materials. Add a color only through the approved design contract; `pnpm palette:check` rejects arbitrary hex values in application source.

## Media workflow

- Use `src/components/media/native-media.tsx` for approved audio and video. It is manual-play, mute-first, `preload="none"`, poster-first for video, caption-aware, transcript-aware, and preserves an external recovery link when playback fails.
- Use `src/components/media/consent-embed.tsx` for approved third-party players. It does not create an iframe until the visitor explicitly loads the provider; the iframe is lazy, named, sandboxed, and accompanied by privacy and fallback information.
- Every published media record still needs verified ownership/rights, a useful accessible name, credits, and a working source. Video also needs a poster plus captions or a transcript. Do not use a placeholder provider, invented media, autoplay, or audible first load.
- Reduced-motion visitors receive the same static poster and manual controls. Media playback never starts as an entrance animation or as a side effect of scrolling.

## Motion and immersive work

The root uses Motion with the visitor's reduced-motion preference. The small animated button primitive is adapted from Animate UI's MIT-licensed copy-first registry; visual styling stays within this project's natural token system.

Three.js, React Three Fiber, Drei, and matching Three.js types are exact-version dependencies. `src/components/three/lazy-three-canvas.tsx` is the only application-facing Canvas boundary: it is client-only, disables SSR, bounds DPR, renders on demand, and requires its caller to preserve the semantic poster plus a useful unsupported-WebGL fallback. The approved Drei allowlist is named explicitly in `drei-tools.ts`; route files do not import WebGL packages directly. No scene is mounted yet, so the homepage remains entirely poster-first until its later scene-state and progressive-loading tasks are verified.

The provider-neutral runtime registry lives in `src/lib/three/asset-registry.ts`. It covers all 12 planned scene assets and keeps every GLB/LOD URL `null` until provenance, rights, optimization, and runtime approval are complete. The adjacent Zod schema is used by tests and authoring checks; registry data imports it as types only, so validation code is not added to a future scene bundle. Never bypass the registry with an ad hoc model URL.

`src/lib/three/gltf-runtime.ts` owns every future GLB loading path. It uses self-hosted Three.js-version-matched Draco and Basis/KTX2 files, bundled meshopt, renderer capability detection, bounded decoder workers, a fresh progress/error manager for each explicit attempt, scoped cache eviction, and shared-resource-safe disposal. Do not instantiate `GLTFLoader`, `DRACOLoader`, or `KTX2Loader` elsewhere. A real decoder smoke test waits for the first rights-approved registry URL; build/tests do not pretend that an absent model was decoded.

## 3D asset gate

`pnpm assets:check` validates every non-null registry URL. Today it reports zero public variants because all production models remain rights-gated. To inspect an unpublished candidate without adding it to the registry:

```bash
pnpm assets:check -- --asset robot-guide --file ../candidate-assets/robot.glb --lod 0 --json
```

The timestamp-free report records the source hash, official Khronos glTF validation result, scene dimensions, visible triangles, draw calls, transforms, stable nodes, authored clips, materials, texture dimensions/estimated memory, extensions, and the exact manifest/LOD budget. Specification errors, missing required nodes or clips, negative/zero scale, or file/triangle/material/texture/dimension overruns fail the command.

Generate and then independently verify a Meshopt variant with explicit paths:

```bash
pnpm assets:optimize -- --asset robot-guide --input ../candidate-assets/robot.glb --output ../candidate-assets/robot-lod0.meshopt.glb --lod 0
pnpm assets:verify-variant -- --asset robot-guide --input ../candidate-assets/robot.glb --output ../candidate-assets/robot-lod0.meshopt.glb --lod 0
```

The optimizer preserves named contract nodes and clips, applies deterministic resampling/deduplication/pruning plus medium Meshopt compression, validates the result before writing, and creates a `.pipeline.json` sidecar with pinned tool versions and input/output hashes. It refuses to overwrite either output without `--force` and never permits input and output to be the same file. The gate inspects existing KTX2/Basis textures but deliberately does not re-encode textures: ETC1S versus UASTC is chosen later from measured visual quality for each approved asset.

`src/lib/three/scene-state.ts` is the single application-state owner for the future live scene. Its external store controls quality, motion/pause/visibility, muted scene sound, lifecycle/progress/errors, selected artifact, and cancellable camera requests; React observes snapshots but does not update state from the frame loop. `ObservatorySceneShell` projects that state into one perspective camera, a locked-palette local light rig, and seven named groups covering all 12 registry assets. The environment has no external HDR or asset URL. The shell remains unmounted until the later capability and poster-first loading tasks are complete.

The water-group proof of concept is also intentionally unmounted. Its full tier uses one procedural ripple/reflected-light shader with 6,912 triangles and at most 30 demand invalidations per second; it allocates no textures, reflection targets, shadows, or post passes. Reduced motion/quality uses a still two-triangle standard material, while static or not-ready state renders no water so the existing poster remains visible. These are deterministic structural limits, not measured FPS claims; browser and mobile diagnostics remain approval-gated.

## Environment

The current semantic/poster shell requires no secrets. CC AI will use a server-only OpenRouter key after its public knowledge, privacy, abuse, and cost controls are ready. Never place a real key in a browser-visible variable or commit it to the repository.

Copy `.env.example` to `.env.local` only when the corresponding integration task begins:

| Variable                                | Visibility                | Required                           | Purpose                                                                                                             |
| --------------------------------------- | ------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `OPENROUTER_API_KEY`                    | Server only               | Later, for CC AI integration tests | Authenticates the server route; set it in `.env.local` locally and the hosting secret store for previews/production |
| `CC_AI_MODE`                            | Server only               | Optional; defaults to `prototype`  | Selects the isolated prototype or production model policy                                                           |
| `OPENROUTER_MODEL`                      | Server only               | Optional in prototype mode         | Overrides the `openrouter/free` prototype default with a named model                                                |
| `OPENROUTER_FALLBACK_MODELS`            | Server only               | Optional in prototype mode         | Supplies up to four ordered, comma-separated fallback model IDs                                                     |
| `OPENROUTER_PRODUCTION_MODEL`           | Server only               | Required when mode is `production` | Selects the paid named production model; free model routes are rejected                                             |
| `OPENROUTER_PRODUCTION_FALLBACK_MODELS` | Server only               | Optional in production mode        | Supplies the production-only ordered paid fallback sequence                                                         |
| `CC_AI_ENABLED`                         | Server only               | Required to enable chat later      | Explicit kill switch; keep `false` until knowledge, provider-policy, privacy, and abuse-control gates pass          |
| `CC_AI_RATE_LIMIT`                      | Server only               | Optional; defaults to `6`          | Sets accepted requests per IP and server-issued session in each window                                              |
| `CC_AI_RATE_WINDOW_SECONDS`             | Server only               | Optional; defaults to `60`         | Sets the fixed-window duration and local `Retry-After` value                                                        |
| `CC_AI_MAX_CONCURRENT`                  | Server only               | Optional; defaults to `4`          | Caps active requests per server process; each session is also limited to one                                        |
| `NEXT_PUBLIC_SITE_URL`                  | Browser-visible by design | Required before deployment         | Supplies the approved canonical preview/production origin for metadata; it contains no secret                       |

## CC AI service boundary

`@openrouter/sdk` is an exact production dependency used only by `src/lib/ai/openrouter-client.ts`, which is guarded by Next.js `server-only`. The client is created lazily, so builds and ordinary page requests do not need a key. Tests pass an explicit environment and deterministic factory; they never call OpenRouter.

The factory sends the approved application title `Carlos Carpio — CC AI`. When `NEXT_PUBLIC_SITE_URL` is configured, its normalized HTTP(S) origin is supplied as OpenRouter's `httpReferer`; embedded credentials and non-HTTP URLs are rejected. SDK debug logging is not enabled because it can expose authorization headers. The package's optional type-checking postinstall script is deliberately ignored—the published ESM and declarations are already present and the project runs its own strict type check.

`POST /api/cc-ai` is currently an intentionally non-streaming JSON boundary. It validates a bounded message/history payload, issues a server request ID, propagates disconnect/timeout aborts, caps provider tokens and returned characters, discloses the primary, fallback, selection type, variability, and actual responding model IDs, sets `Cache-Control: no-store`, and maps provider failures to safe public errors without logging message bodies or raw SDK errors.

Prototype mode defaults to the variable `openrouter/free` router, supports a named-model override, and sends configured fallback models in order. Production mode fails closed unless an explicit paid named primary model is configured, uses a separate paid fallback list, and rejects free routes. Every request requires zero-data-retention endpoints, denies providers that collect data, and allows provider fallback only inside those constraints. If no compliant provider can serve the request, the route returns a safe unavailable state instead of weakening the policy. Payment exhaustion, rate limiting, and provider failure are normalized into distinct 402/429/unavailable service states for the later chat UI.

When enabled, the route accepts only verifiable same-origin JSON POSTs, rejects cross-site and unverifiable sources, and sets a server-generated HttpOnly `SameSite=Strict` visitor cookie. It applies fixed-window limits to both the trusted hosting IP header and that session, permits one active request per session, enforces a configurable process-wide concurrency ceiling, bounds its tracking map, returns `Retry-After` with clear limit/busy states, and never automatically repeats a provider request. Request/body/history/output limits remain enforced before provider work.

The included limiter is deliberately per process, which is suitable for a disabled local/preview foundation but is not a global multi-instance quota. Task 8.19 must configure a shared durable limiter if the selected production topology has more than one function instance.

The knowledge builder reads the already-validated structured content only; it never opens provenance files. A record is eligible only when its factual verification is `verified` or `user-approved`, every source is explicitly public, and any applicable publication/rights gates are ready. It serializes whole records and traceable public source IDs into a maximum 8,000-character JSON evidence block, marks truncation, places an anti-invention/unknown-answer instruction before conversation history, and returns only the included public source IDs in response metadata. Design-only `reference-approved` records, held concepts, pending rights, mixed public/private provenance, and private source paths are excluded.

The current repository has no records that pass all public-knowledge gates, so the built context contains zero facts and explicitly requires “I don't know based on the approved public portfolio information.” Task 2.30 must supply the approved public knowledge ledger. `CC_AI_ENABLED=false` keeps the route unavailable until that content and the release gates are complete.

## Deployment

The selected output is Vercel-compatible, but no deployment project has been linked and no production deployment is authorized. Use a preview deployment for review when the release phase begins.
