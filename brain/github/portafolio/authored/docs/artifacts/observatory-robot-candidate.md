<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/artifacts/observatory-robot-candidate.md; checkedOn: 2026-07-31; redactions: 0 -->

# Observatory robot ? rights-safe procedural candidate

Date: 2026-07-26
Status: **ACTIVATED.** Carlos reviewed rendered previews and approved activation the same
day (maintaskplan U.17). The change set listed under "What activation would require" was
implemented in full: registry re-kind + manifest parity, `createObservatoryRobotGltfAsset`
GLTF-shaped mount through `ObservatoryLiveScene`, test updates preserving imported-model
path coverage, and a green `pnpm verify` (222 tests). The section below is retained as the
historical decision record.

## What exists

`site/src/lib/three/create-observatory-robot-model.ts` builds a fully runtime-authored,
provider-neutral kneeling ceramic guide for the Observatory. It follows the same approved
procedural route as the drone, ASTRAEA, PIN?CULO, Sound Lab, Future Energy, and
Electronics / AI conversions: authored code only, no external mesh, texture, HDR, scan, or
generated asset, and every color resolves through the locked natural palette
(`naturalPalette` / `threeMaterialPalette` roles: `ceramicRobot` off-white shell,
`ceramicRobotShadow` stone undershell, deep-wood armature joints, walnut fastener details).

The candidate satisfies the exact runtime contract that `inspectRobotAssetContract`
enforces for an imported GLTF:

| Contract requirement                                     | Candidate result |
| -------------------------------------------------------- | ---------------- |
| Nodes `RobotRoot`, `RobotBody`, `RobotHead`, `RobotHandContact`, `RobotInteraction` | all present, resolvable via `getObjectByName` |
| Clips `idle`, `head-acknowledgement`, `finger-water-contact` | all authored in code with those exact names |
| Finite non-empty bounds in all three axes                | ~0.71 ? 1.21 ? 1.02 m canonical |
| Hand-to-water target `[0.42, ?0.035, 0.92]`              | solver lands the `RobotHandContact` anchor exactly on target (`handAlignmentErrorMeters` = 0) |
| Size box `[1.2, 1.7, 1.1]` m                             | uniform scale 1.1008; every scaled axis inside the box |

## Measured budgets

| Tier    | Triangles | Budget  | Draw calls | Budget | Materials | Textures |
| ------- | --------: | ------: | ---------: | -----: | --------: | -------: |
| Full    | 7,696     | 45,000  | 25         | 30     | 4 (?5)    | 0        |
| Reduced | 2,448     | 12,000  | 25         | 28     | 4 (?5)    | 0        |

Zero shadow casters, zero render targets, zero post passes. Materials are
`MeshStandardMaterial` only with `map: null` asserted by test.

## Motion language compliance

- `idle` (12 s): chest breath ?0.6% scale (spec ?0.8%), head/shoulder corrections ?0.7?
  (spec <1.5?), authored at the approved 6?10 s correction cadence.
- `head-acknowledgement` (1.6 s): peaks at 55% of the ?18? yaw and 75% of the ?10? pitch
  bounds; returns to rest.
- `finger-water-contact` (2.6 s): one slow articulation inside the specified 2?3 s window;
  the runtime still plays only `idle` (24 FPS cap, Full quality + Full motion only).
- Test `src/tests/observatory-robot-candidate.test.ts` walks every quaternion/scale
  keyframe of every clip against the declared bounds.

## Rights basis

- Task 1.27 rejected Hunyuan for worldwide portfolio use; the plan names
  "original authored, procedural, user-owned, or permissively licensed assets" as the
  valid fallback route (maintaskplan.md, Approved experience architecture).
- The candidate is 100% authored TypeScript in this repository ? no third-party geometry,
  texture, or capture participates, so `rightsState: "not-applicable"`
  (`authoredRuntimeProvenance`) applies if activated, matching the other procedural assets.
- Fidelity claim is `stylized-approximation-only`; no claim of reference-image fidelity is
  made. The reference pack remains research-only input (its `prohibitedReuse` forbids
  publishing the sheet itself).
- Prohibited-detail constraints carried from the reference brief: no human skin, projected
  face, weapon, wings, extra limbs, military silhouette, glossy consumer finish,
  purposeless cables, blue emission, or neon trails.

## What activation would require (deliberately NOT done)

The public Canvas currently stays in poster mode because `robot-guide` is
`kind: "model"` with all LOD URLs null (`canMountCanvas === false`). Activating the
candidate is a user-owned decision (U.17 fallback approval; U.12 candidate approval) and
would require, in one change set:

1. Registry: `robot-guide` ? `kind: "procedural"`, `status: "specified"`, clips
   `source: "procedural"`, `authoredRuntimeProvenance` ? mirrored byte-parallel in
   `docs/assets/observatory-3d-manifest.json` (status, glbMb 0) per
   `validate-immersive-build.ts` parity checks.
2. A loading path: either mount `ObservatoryRobot` from a synthesized GLTF-shaped object
   (keeps `inspectRobotAssetContract`, `RobotDiagnostics`, and the MVP gate untouched) or
   add a procedural mount branch in `ObservatorySceneShell`.
3. Test updates: `observatory-progressive-loading.test.ts` pins
   `canMountCanvas === false` / `missingHeroCritical === ["robot-guide"]`; and
   `immersive-test-doubles.test.ts` pins one hero-critical model entry.
4. Rendered browser review (desktop Full/Reduced, mobile Reduced, poster, failure paths)
   before any checkbox in 5.25/5.35 is affected.

Until that decision, production behavior is unchanged: zero canvases on `/`, poster-first,
truthful "immersive assets awaiting approval" status.

## Verification evidence

- `pnpm exec tsx --test src/tests/observatory-robot-candidate.test.ts` ? 5/5 passing:
  contract satisfaction (both tiers), palette/texture/budget lock, presentation solve,
  motion-bound keyframe walk + diagnostics phase pairing, rights strategy + disposal.
- Full `pnpm verify` run recorded in the maintaskplan completion evidence.
