<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/artifacts/drone-sculpt/img2threejs-review-log.md; checkedOn: 2026-07-31; redactions: 0 -->

# Observatory drone image-to-Three.js review log

## 2026-07-23 — Intake

- Source: `docs/assets/reference-packs/robot-drone-reference.png`
- Image probe: pass, 1672 × 941 PNG.
- Reference evidence: four drone views in one approved internal reference sheet.
- Reference-derived PBR evidence: pass at 0.93 extraction confidence.
- Scope decision: the runtime implementation is a stylized, reference-informed procedural concept. It does not claim aerodynamic accuracy, manufacturing accuracy, flight performance, or reference fidelity.

## Locked visual gate

The image-to-Three.js workflow requires a browser-rendered screenshot, a side-by-side comparison sheet, AI-vision layer scores, critical-feature scores, and an explicit `action=continue` entry before the blockout pass can advance. Project rules require separate user authorization for that browser and screenshot work, so no visual pass has been approved or recorded.

Current pipeline state:

- Current pass: `blockout`
- Completed passes: none
- Gate result: blocked pending authorized rendered comparison
- Runtime fallback: bounded procedural Three.js concept under the Observatory technical-art and interaction contracts

## 2026-07-23 — Runtime diagnostic preparation

The procedural fallback now exposes an opt-in serializable capture of its active/rest/paused/reduced/poster phase, last-applied pose, world position, hover-corridor margin, roof clearance, robot-exclusion clearance, and attitude margin. This seam observes the runtime without a production global, debug UI, forced invalidation, or additional loop. It prepares measured evidence for a future authorized browser comparison but does not satisfy or bypass the locked screenshot, fidelity-scoring, or `action=continue` gate above.
