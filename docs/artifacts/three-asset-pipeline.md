# Three.js asset validation and optimization pipeline

Date: 2026-07-19
Task: 4.29
Status: verified without production model files

## Purpose

No GLB reaches the public Observatory merely because it loads. The offline command boundary checks every future registry URL against the provider-neutral manifest, the typed runtime registry, the official glTF validator, and the declared LOD budget.

## Pinned toolchain

- `@gltf-transform/core`, `extensions`, and `functions` 4.4.1
- `gltf-validator` 2.0.0-dev.3.10
- `draco3dgltf` 1.5.7
- `meshoptimizer` 1.2.0

These are development-only dependencies. They do not enter a browser bundle.

## Commands

- `pnpm assets:check` scans every non-null URL in the typed registry and is part of `pnpm test`.
- `pnpm assets:check -- --asset <id> --file <candidate.glb> --lod <n> --json` inspects an unpublished candidate without approving or publishing it.
- `pnpm assets:optimize -- --asset <id> --input <source.glb> --output <variant.glb> --lod <n>` creates a validated Meshopt variant and a timestamp-free `.pipeline.json` sidecar.
- `pnpm assets:verify-variant -- ...` regenerates the variant and requires matching toolchain, identity, byte counts, input/output hashes, and byte-for-byte output.

Generation refuses an existing output or sidecar unless `--force` is explicit. Input, output, and metadata paths must be distinct.

## Gate coverage

The report records and enforces:

- Khronos glTF 2.0 errors and warnings;
- stable required node names and required authored animation clips;
- scene dimensions in meters, visible triangle count, and draw calls;
- translated, rotated, scaled, negative-scale, and zero-scale node counts;
- material count and names;
- texture MIME type, pixel dimensions, encoded bytes, and estimated GPU bytes;
- used extensions, source SHA-256, GLB bytes, and the exact LOD/manifest limits.

Meshopt output preserves named leaves, attributes, extras, and solid textures while applying deterministic animation resampling, name-aware deduplication, pruning, quantization, reordering, and `EXT_meshopt_compression`. Any helper node introduced by the transform receives a deterministic name before export.

## Evidence and limits

Five focused tests generate a tiny GLB in memory. They prove the complete inspection report, deliberate contract/budget failures, Meshopt output, repeatable output hashing, sidecar verification, and the current zero-public-URL registry state. The test asset exists only in a temporary directory and is deleted after the test.

The full gate passes with 58 tests and a 13-page production build. `pnpm assets:check` reports zero public GLB variants because all registry URLs remain `null`; this work does not claim a real production model decode or visual-quality approval.

KTX2/Basis files can be read and measured through the registered extensions. Texture re-encoding is intentionally deferred to task 6.21, where ETC1S versus UASTC must be chosen from measured quality and runtime cost for each rights-approved asset rather than applied blindly.
