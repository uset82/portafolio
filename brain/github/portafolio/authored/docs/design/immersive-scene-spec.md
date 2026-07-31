<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/design/immersive-scene-spec.md; checkedOn: 2026-07-31; redactions: 0 -->

# Immersive observatory scene specification

## Layered composition

| Layer | DOM/canvas | Bounds and purpose |
| --- | --- | --- |
| Page canvas | DOM | Warm parchment background and static fallback |
| Poster | image in scene region | Immediate visual; never sole source of copy or controls |
| WebGL canvas | R3F, lazy | Replaces poster only after ready; fills scene region and can bleed behind header |
| Editorial overlay | DOM | Identity, headline, support, actions, current focus; left safe zone |
| Global controls | DOM | Navigation, sound, pause/reduced-motion state |
| Artifact access layer | DOM | Labeled buttons/links synchronized with 3D focus targets |
| CC AI | DOM | Lower right desktop; bottom sheet mobile |
| Selected Systems | DOM | First-viewport transition; not drawn into canvas |

Desktop at 1672×941 uses reference-normalized anchors: robot target `(0.66, 0.47)`, hand/water contact `(0.58, 0.65)`, drone `(0.72, 0.18)`, ASTRAEA `(0.91, 0.40)`, PINÁCULO `(0.57, 0.82)`, Sound Lab `(0.26, 0.79)`, energy `(0.48, 0.31)`, electronics `(0.35, 0.50)`, CC AI `(0.88, 0.68)`. The headline safe zone is x `0.025–0.31`, y `0.20–0.52`. Mobile prioritizes robot face, hand, water, and one labeled artifact; foreground artifacts may move below the fold as DOM entries.

## Camera storyboard

| State | Camera/target | Entry | Duration | Input and interruption |
| --- | --- | --- | ---: | --- |
| Poster/load | no live camera | Static approved crop | 0 | DOM usable immediately |
| Home ready | wide 35–45mm equivalent; target water behind hand | Crossfade only after assets and controls ready | 650ms | Any navigation cancels reveal |
| Idle | same framing | ≤1% breathing drift, no auto-orbit | continuous optional | Pause, hidden tab, reduced motion stop it |
| Observatory entry | dolly slightly toward robot/water | Primary CTA | 900ms | Wheel/pointer/another selection cancels |
| ASTRAEA | three-quarter close view, label unobscured | Artifact button/mesh select | 760ms | Back/Home and new selection interrupt |
| PINÁCULO | low foreground view | Artifact button/mesh select | 700ms | Same |
| Sound Lab | low left instrument view | Artifact button/mesh select | 700ms | Same; never starts audio |
| Future Energy | mid-depth tanks | Artifact button/mesh select | 760ms | Same |
| Electronics / AI | close left-mid module | Artifact button/mesh select | 700ms | Same |
| Back/Home | approved wide frame | Back/Home | 650ms | New selection interrupts |
| Mobile | fixed guided crops, no free orbit by default | DOM artifact selection | immediate or ≤450ms | swipe not required |
| Error/fallback | poster crop | Context loss or asset failure | immediate | Retry re-enters load state |

Camera transitions use one R3F owner and cancellable state, never overlapping tweens. Pointer exploration is bounded so the text-safe zone and primary subject remain visible. Scrolling is never hijacked.

## Artifact interaction map

| Artifact | 3D response | DOM equivalent and destination | Occlusion/collision rule |
| --- | --- | --- | --- |
| Robot | Subtle outline/focus; head may acknowledge selection | “Observatory guide” button; returns to overview | Hand stays in water; body never blocks headline |
| Drone | Hover/focus label; slow hover animation | “Aerial systems” summary; Laboratory | Stays above robot silhouette and outside header links |
| ASTRAEA | Ring highlight and focus camera | “ASTRAEA — Celestial intelligence”; Cosmos/case study when verified | Label remains readable; no clipping through stand |
| PINÁCULO | Number ring highlight, optional mechanical tick | “PINÁCULO — Numerological engine”; Cosmos/case study | Foreground does not block robot hand contact point |
| Sound Lab | Knob/ring highlight; no audio on focus | “Sound Lab — Harmonic instrument”; Sound | Touch uses DOM controls; no hover-only operation |
| Future Energy | Vessel highlight and slow liquid response | “Future Energy — Adaptive flow systems”; Laboratory/case study | Transparent vessels use conservative sorting/material count |
| Electronics / AI | Indicator highlight, no flashing | “Electronics / AI”; Laboratory/work | Avoid rapid emissive animation; label outside mesh |
| Water | Pointer/touch ripple when quality allows | Text description plus Pause scene | Ripple plane never intercepts artifact selection incorrectly |

Keyboard order follows DOM reading order. Activating a DOM artifact updates the camera and moves focus to a concise description, not into the canvas. Canvas picking mirrors DOM selection but cannot expose additional essential information.

## Water behavior

- Full tier: shallow planar reflection at reduced resolution, normal-based refraction, one low-amplitude caustic pass, and a maximum 8 active ripple impulses.
- Ripple sources: robot-hand contact at slow authored cadence; pointer/touch only inside water bounds; artifact/camera actions do not create ripples.
- Shader cap: one water material, ≤2 texture samples per normal layer, bounded DPR, no screen-space chromatic effects, and reflection disabled before reducing semantic UI.
- Reduced tier/mobile: static environment reflection, one normal map, no planar reflection, ≤3 simple ripples or none.
- Reduced motion/Save-Data/fallback: still poster or static water material; no pointer response. Information and actions are identical.
- Robot hand displaces a subtle circular field; it never creates a large splash or hides contact detail.

## Robot and procedural motion language

- Idle stabilization: tiny joint correction every 6–10 seconds, amplitude below 1.5°.
- Head tracking: follows a selected artifact or bounded pointer region, never the user continuously; yaw ±18°, pitch ±10°, eased and interruptible.
- Fingers: one slow 2–3 second water-contact articulation followed by 8–14 seconds rest; no constant tapping.
- Mechanical “breath”: chest/shoulder settle below 0.8% scale or 1° rotation, authored in the rig if available.
- Drone: vertical hover ≤1.5% of scene height and gentle roll ≤1.5°, paused offscreen.
- ASTRAEA/PINÁCULO: movement only on selection or very slow idle tick; no perpetual spinning.
- Reduced motion freezes a deliberately authored readable pose. Camera changes cut immediately.

## Sound Lab behavior

Sound is always muted until the user chooses Play. Track title, artist/credit, duration, rights/availability, and transcript/notes are DOM content. Keyboard: Space only toggles while the player is focused; arrows seek/adjust by documented increments; M toggles mute while focused. Touch targets are 44px. A waveform is derived from approved audio data or replaced by a static progress rule—never fabricated. Mechanical response is amplitude-driven only while playing and stops when hidden, muted by policy if required, or reduced motion is active. Failure keeps metadata visible and offers an approved external link when available.

## Loading, capability, and quality tiers

1. **Semantic/poster:** immediate HTML, responsive approved poster, navigation, actions, artifact links, and chat trigger.
2. **Reduced 3D:** low-resolution textures, simplified water, limited lights/shadows, no postprocessing, frozen or sparse idle motion.
3. **Full 3D:** selected assets, bounded reflections, authored motion, and camera focus.

Selection considers WebGL support, memory/performance sampling, viewport, `Save-Data`, reduced motion, and previous context loss. Users can pause motion and use the poster experience. Loading reports real asset groups rather than a fake percentage. Slow network retains the poster and says “Preparing the observatory.” Context loss returns to poster with Retry. Asset failure identifies the affected optional scene group without blocking Work/Contact routes.

## Performance constraints

- Initial semantic/poster experience loads without Three.js in the critical bundle.
- Full scene budget target: ≤180k visible triangles home, ≤120 draw calls, ≤24 materials, ≤96MB estimated texture memory desktop; reduced tier ≤90k triangles, ≤70 draw calls, ≤48MB textures.
- Hero-required GLB transfer target ≤5MB; optional artifacts lazy, total first scene ≤9MB. Use Draco or meshopt after measured loader/runtime comparison; KTX2 ETC1S for color and UASTC only where normal-map quality visibly needs it.
- Major assets: 3 LODs; small props: 1–2; named interactive assets preserve silhouette and readable labels. DPR capped at 1.75 desktop and 1.35 mobile by default.
- Pause render demand when hidden/offscreen where safe; dispose textures, materials, geometries, mixers, targets, and listeners on replacement.

## Asset acceptance

Models pass only with correct real-world relative scale, named pivots, outward normals, no unintended non-manifold/open geometry, no duplicate hidden shells, clean UVs, no visible texture seams at target distance, and a documented material/texture set. PBR uses sRGB only for base color/emissive; normal/roughness/metallic/AO are non-color data. One consistent meter scale and Y-up export are required. Rigs need stable bind pose, normalized weights, no joint flips, and named clips with loop/one-shot intent. Animation clips must begin/end without visible pop and remain inside declared bounds.

Every production asset records source/author, tool/model/version if generated, date, terms snapshot, territory/display rights, attribution, likeness risk, allowed reuse, and derivative relationship. Hunyuan 3D is not used for production under the reviewed license terms; future providers must pass the same gate.
