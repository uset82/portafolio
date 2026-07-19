# Self-hosted Three.js decoders

Source package: `three@0.185.1`
Source directories: `examples/jsm/libs/draco/gltf/` and `examples/jsm/libs/basis/`
License: Three.js MIT license, copied to `THREE-LICENSE.txt`

These files are served only when an optional compressed Observatory asset needs them. They are version-matched and must be replaced together when Three.js changes.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `draco/draco_decoder.js` | 512465 | `8625489DA79A805F4F2A7D511C3E52D8B4085608A9D2A4D5F4F9DE5DB0AEA04F` |
| `draco/draco_decoder.wasm` | 192420 | `A680D927BED9CB864DDBD63521868891AF2BFBE755092761B4837487618DF8AC` |
| `draco/draco_wasm_wrapper.js` | 58456 | `8BB2952D2BA7D67E1414F8DF819410CB0434A666BE53F671FFF75F68843D76F6` |
| `basis/basis_transcoder.js` | 57529 | `8478B5B6D6B74E7D3082B89F6417321D8D1DC0307F2B30D4484BB11B441696A1` |
| `basis/basis_transcoder.wasm` | 527333 | `6CF17DC889352C42E9ACF8897107978D127005FE3386C36A0E3845E27967630A` |

Do not mix decoder files from different releases or point runtime code at an unversioned third-party CDN. `src/lib/three/gltf-runtime.ts` is the single configuration owner.
