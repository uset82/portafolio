<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/design/review-gate.md; checkedOn: 2026-07-31; redactions: 0 -->

# Design review gates

Reviewed: 2026-07-19  
Scope: editorial/UI gate and immersive-design gate  
Result: approved for initial application scaffolding and poster-first implementation

## Evidence reviewed

- Approved visual and palette references in `docs/design/reference/`
- Verified design copy in `docs/content/v1-design-content.md`
- `DESIGN.md`
- `wireframes.md`
- `immersive-scene-spec.md`
- `cc-ai-spec.md`
- `docs/assets/observatory-3d-manifest.json`
- Phase 1 architecture and Hunyuan rights decision records

## Editorial/UI gate

| Criterion | Result | Evidence or incorporated change |
| --- | --- | --- |
| Hierarchy | Pass | One identity, one headline, one support statement, two ordered actions, and one dominant scene in the first viewport |
| Originality | Pass | Carlos's approved observatory is the brand signal; Nightglass darkness/aqua and reference-product components are explicitly rejected |
| Content fit | Pass for design | Prototype copy comes from the approved image; unverified projects/CV facts are excluded or labeled as pending |
| Color | Pass | Exact natural tokens and contrast pairs are locked; forbidden blue/cyan/violet substitutions are documented |
| Responsive composition | Pass | Small mobile through wide desktop reflow and protected crops are specified; mobile is not a compressed desktop |
| Accessibility | Pass at specification level | Semantic fallback, focus behavior, target size, reduced motion, live-region, audio, and WebGL failure requirements are explicit |
| Component/state coverage | Pass | Navigation, links, media, contact/error, chat, loading, disabled, empty, visited, and failure states are specified |
| Implementation feasibility | Pass | DOM, poster, lazy WebGL, chat, route, motion-owner, and performance boundaries map to the selected Next.js architecture |

## Immersive gate

| Criterion | Result | Evidence or incorporated change |
| --- | --- | --- |
| Layered conversion of reference | Pass | DOM/canvas bounds, safe zones, normalized anchors, responsive crops, z-index, chat, and Selected Systems transition are defined |
| Camera and artifact journeys | Pass | Home, entry, five artifact focuses, back, mobile, and error states are cancellable and have DOM equivalents |
| Water and motion restraint | Pass | Tiered water, bounded ripples, authored/procedural ownership, pause, hidden-tab behavior, and static replacements are defined |
| Sound Lab | Pass at specification level | Mute-first controls, metadata, transcript/notes, keyboard/touch behavior, and failure fallback are specified; audio awaits verified rights |
| CC AI | Pass at specification level | Collapsed/open/streaming/stop/retry/error/rate-limit/privacy/source/unknown states and mobile focus behavior are defined |
| Loading and quality tiers | Pass | Semantic poster, reduced 3D, full 3D, Save-Data, low power, context loss, asset failure, reduced motion, and no-JavaScript paths retain core journeys |
| Performance | Pass at specification level | Initial and scene budgets, lazy boundary, LOD, DPR, disposal, and pause expectations are measurable |
| Provider/rights feasibility | Pass with gate | Provider-neutral pipeline is required; current Hunyuan production use is rejected under the reviewed territorial terms |

## Phase 3 acceptance map

- 3.1?3.3: invoked workflows, visual thesis, and provenance audit ? `DESIGN.md`
- 3.4?3.6: natural color, typography, grid/spacing/shape/elevation ? `DESIGN.md`
- 3.7?3.18: global shell, route templates, responsive/state/motion/reduced-motion contracts ? `DESIGN.md`
- 3.19: desktop/mobile and launch-route wireframes ? `wireframes.md`
- 3.20?3.22: implementation artifact, editorial gate, and reference audit ? `DESIGN.md` and this review
- 3.23?3.28: layered scene, camera, artifact map, water, robot, and Sound Lab ? `immersive-scene-spec.md`
- 3.29: chat ? `cc-ai-spec.md`
- 3.30?3.31: fallbacks and cross-system animation ownership ? `DESIGN.md` and `immersive-scene-spec.md`
- 3.32: immersive gate ? this review

## Implementation constraints carried forward

- The approved screenshot is a poster/fallback, not the sole interface.
- Initial implementation starts semantic and poster-first; Three.js remains a lazy enhancement.
- The real chat panel covers the screenshot's reference panel to avoid duplicate UI.
- No production 3D generation or asset import occurs until provenance, territory, display, and reuse rights are recorded.
- Phase 2 biographical/project/media verification remains required before public release, even though the approved hero copy is sufficient to implement the shell.
