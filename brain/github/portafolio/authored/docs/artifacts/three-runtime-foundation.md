<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/artifacts/three-runtime-foundation.md; checkedOn: 2026-07-31; redactions: 0 -->

# Three.js runtime foundation

Date: 2026-07-19
Scope: task 4.20 only; no production scene or generated asset

## Pinned compatibility set

| Package              | Exact version | Compatibility evidence                                                                            |
| -------------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| `three`              | `0.185.1`     | Satisfies Fiber `>=0.156` and Drei `>=0.159` peer ranges                                          |
| `@types/three`       | `0.185.1`     | Matches the Three.js runtime revision                                                             |
| `@react-three/fiber` | `9.6.1`       | Fiber v9 is the React 19 compatibility line; its current peers allow React/React DOM `>=19 <19.3` |
| `@react-three/drei`  | `10.7.7`      | Current peers allow React 19, Fiber `^9`, and Three.js `>=0.159`                                  |

The application remains on exact React and React DOM `19.2.4`, inside Fiber's supported range. Production 3D versions are exact so the future asset/runtime tests do not drift independently of this compatibility decision.

## Boundary and ownership contract

- `LazyThreeCanvas` is the only application-facing Canvas export. It is a Client Component and dynamically imports the internal Canvas with `ssr: false`.
- Server route files may import the project boundary later, but may not import `three`, Fiber, or Drei directly.
- The semantic poster remains outside this boundary and visible until a later scene shell proves required assets are ready. Dynamic loading therefore renders no blank replacement.
- The internal Canvas owns the renderer and uses a `1?1.5` DPR range, demand rendering, transparent antialiased output, no preserved drawing buffer, no default shadows, a useful accessible label, and an explicit unsupported-WebGL fallback supplied by its caller.
- DOM headings, navigation, project actions, chat, loading/error messages, and alternate descriptions remain outside WebGL.

## Drei and tree-shaking policy

The initial named allowlist is `useGLTF`, `useKTX2`, `Preload`, and `PerformanceMonitor`. Application scene modules import these through `components/three/drei-tools.ts`; wildcard imports and route-level package imports are rejected by tests. DOM-oriented Drei helpers such as `Html`, `Text`, `ScrollControls`, and loader UI are intentionally excluded because they would duplicate the semantic interface.

No Three.js module is mounted on the homepage in this task. The current critical route therefore remains poster-first while the runtime, type, lazy-loading, and SSR contracts are compiled and tested before task 4.30 introduces a scene owner.

## Provider-neutral asset registry

`site/src/lib/three/asset-registry.ts` mirrors all 12 stable IDs in the specification manifest without importing control-plane JSON into the browser. Each record carries its expected nodes, authored/procedural clips, approved palette roles, meter scale, LOD triangle ceilings and nullable URLs, poster/DOM fallback, interaction target, provenance/copyright review state, and loading priority.

Every current LOD URL is intentionally `null`. A Zod validation contract rejects any URL while `approvedForPublicRuntime` is false, and approval of an external asset additionally requires copyright and license metadata. The registry data uses type-only schema imports so future scene chunks do not ship Zod merely to consume already-verified metadata.

## glTF decoder and lifecycle runtime

`site/src/lib/three/gltf-runtime.ts` is the only GLB loader configuration owner. It reuses one Draco decoder, attaches the bundled meshopt decoder, and reuses one KTX2 loader per renderer after hardware support detection. Draco and Basis/KTX2 files come from the exact installed Three.js 0.185.1 package, are self-hosted under `public/three/decoders/`, include their upstream MIT license, and have test-pinned SHA-256 hashes.

Each load or retry creates a fresh progress manager so counters do not accumulate across attempts. The first fatal URL is latched; late progress or completion callbacks cannot replace the error. Loaded assets have scoped cache eviction and an explicit disposer that deduplicates shared geometries, materials, textures, closable image bitmaps, and skeletons. Shared decoder workers are disposed only during permanent runtime teardown.

No real compressed-model decode is claimed yet: the registry deliberately contains no approved GLB URL. The first rights-cleared candidate must be inspected for required extensions and decoded in the approved browser QA scope before it can pass the later asset/scene gate.
