# Implementation Plan: CAM² 3D Nucleus for Repository Atom

Build the **CAM² 3D Nucleus** as a precision-engineered scientific instrument (luxury chronometer / astrolabe medallion) in Three.js and integrate it cleanly into the 4-ring **Repository Atom** scene.

---

## User Review Required

> [!IMPORTANT]
> **Identity Lock**: The central nucleus will preserve the exact, original Carlos Alfredo Carpio Meza CAM² monogram emblem (`site/public/images/brand/ca2m-logo.glb` and `site/public/images/brand/ca2m-mark.png` / `imagesandvideo/logo.png`) with strict geometric fidelity: stylized A, integrated M, background crescent, centered Taurus symbol, and superscript ². The logo will remain perfectly stationary, front-facing, and crisp.

---

## Task Plan Checklist

- [ ] **Audit & Setup**: Verify Three.js / R3F runtime stack, logo assets, and palette contract.
- [ ] **Data & Config (`atomConfig.ts`, `atomTypes.ts`)**: Define nucleus dimensions, layer radii, rotation speeds, and 4-orbit parameters.
- [ ] **3D Geometry & Material System (`CAM2Nucleus.tsx`)**:
  - [ ] Outer housing with stepped beveled brass rim
  - [ ] Outer bezel with engraved radial tick marks
  - [ ] Precision Ring A (slow clockwise rotation `+0.018` rad/s)
  - [ ] Precision Ring B (slow counter-clockwise rotation `-0.011` rad/s)
  - [ ] Engraved mechanical scale ring with 12/24 divisions
  - [ ] Inner dark graphite / chocolate enamel face
  - [ ] Exact CAM² logo emblem / front plate (sharp, stationary, unrotated)
  - [ ] Micro-markers (brass screws and indicator pins)
- [ ] **Physical Material System**: PBR `MeshStandardMaterial` using `naturalPalette` tokens (`orbitBrass`, `orbitBrightBrass`, `orbitBronze`, `orbitInkRaised`, `orbitIvory`, `walnut`).
- [ ] **Living Micro-Animations**:
  - [ ] Independent counter-rotating precision rings
  - [ ] Subtle breathing scale (`1.000` to `1.012`, ~6s period)
  - [ ] Data communication particles between nodes and nucleus
- [ ] **Four 3D Orbital Rings (`AtomicOrbit.tsx`)**:
  - [ ] 4 orbital planes: Horizontal, Diagonal A ($+38^\circ$), Diagonal B ($-38^\circ$), Vertical ($84^\circ$)
  - [ ] Correct WebGL depth occlusion (back paths pass behind CAM², front paths curve in front)
  - [ ] Dual brass tube rails and golden spacer collars
- [ ] **11 Repository Electron Nodes (`RepositoryElectron.tsx`)**:
  - [ ] Nodes travel on assigned orbits
  - [ ] Billboarded medals with engraved vector icons
  - [ ] Outward screen-space pill label tracking
- [ ] **Interactions**:
  - [ ] Nucleus hover: pointer cursor, subtle warm highlight, gentle elevation
  - [ ] Nucleus click: activates central orchestrator state and contextual panel
  - [ ] Node click / activation: triggers brass data particle glide to CAM² and opens case study
- [ ] **Lighting & Camera (`AtomLighting.tsx`, `RepositoryAtom.tsx`)**:
  - [ ] Studio lighting with warm key, neutral fill, and rim glints
  - [ ] 45mm perspective feel with subtle cursor parallax
- [ ] **Verification**:
  - [ ] Prebuild test suite (496 tests)
  - [ ] Palette contract & color linter
  - [ ] Live browser inspection on desktop, tablet, and mobile
  - [ ] Reduced motion support
