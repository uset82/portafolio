<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/assets/reference-packs/generation-prompts.md; checkedOn: 2026-07-31; redactions: 0 -->

# Observatory 3D reference-pack generation record

Status: internal modeling reference only  
Generated: 2026-07-20  
Tool path: Codex built-in image generation  
Input reference: `docs/design/reference/mainUI-approved.png`  
Input SHA-256: `B4E11D325297CEB8FFB021866FFA2903B316D5D2443DEF67BA890B4B3F3058BF`

The built-in tool did not expose a model version, seed, sampling parameters, or deterministic replay control. “Reproducible” therefore means that the exact input hash, complete prompt chain, accepted output hash, dimensions, review corrections, and intended use are recorded. It does not promise a byte-identical rerender.

These prompts create 2D provider-neutral modeling references. They are not Hunyuan-specific inputs, do not authorize any generated GLB, and do not replace the task 2.25 provenance, rights, likeness, and public-runtime review.

## environment-base

Accepted only as the base for `environment-remove-robot`; the base image was rejected because the bottom-right lighting panel introduced a robot despite the architecture-only constraint.

```text
Use case: stylized-concept
Asset type: provider-neutral 3D modeling reference sheet for the Submerged Earth Observatory portfolio
Primary request: create a clean six-panel concept sheet for the architectural environment shown in Image 1: observatory shell, circular skylight, arched windows, shallow circular water basin, warm built-in shelves, sparse potted plants and workbench props, plus the neutral warm daylight and camera-framing character. This is reference art for original 3D modeling, not a final website screenshot.
Input images: Image 1 is the approved style, palette, material, and world-building reference; do not copy its baked UI text.
Scene/backdrop: uniform warm parchment studio background; every panel isolated and easy to read.
Style/medium: polished realistic 3D concept render with physically plausible materials and consistent scale.
Composition/framing: 3 by 2 grid with equal gutters. Top row: wide interior perspective, front elevation-like view, overhead plan-like view. Bottom row: water-basin detail, props-and-plants kit, lighting and camera mood study. No panel borders or labels.
Lighting/mood: soft warm daylight through the oculus, gentle neutral shadows, calm editorial atmosphere.
Color palette: natural Observatory palette only—parchment, linen, warm oak, walnut, taupe, pewter, muted sage, slate-sage water, espresso details.
Materials/textures: linen plaster, pale carved stone, oak and walnut, aged pewter, clear shallow water, restrained sage foliage.
Constraints: preserve one coherent architecture across all views; practical buildable geometry; visible full silhouettes; generous margins; no people, robot, drone, project devices, UI, text, letters, numbers, logos, trademarks, watermark, blue neon, violet, cyan glow, black sci-fi void, excessive glass, fantasy ornament, or photobashed clutter.
```

## environment-remove-robot

Accepted output: `observatory-environment-reference.png`.

```text
Use case: precise-object-edit
Asset type: corrected provider-neutral architectural reference sheet
Input images: Image 1 is the edit target.
Primary request: remove only the small humanoid robot standing in the bottom-right panel and reconstruct the stone floor and water-basin edge naturally behind it.
Constraints: change only the small robot removal area; keep all six panels, panel geometry, architecture, plants, props, water, materials, color palette, lighting, camera framing, borders, resolution, and composition unchanged. Add no replacement subject, no text, no labels, no logos, and no watermark.
```

## robot-drone-base

Accepted output: `robot-drone-reference.png`.

```text
Use case: stylized-concept
Asset type: provider-neutral 3D character and vehicle modeling reference sheet
Primary request: create a clean eight-panel orthographic-style concept sheet for two original assets from Image 1: the humanoid robot guide and the compact four-rotor drone. This is reference art for original web-ready 3D modeling.
Input images: Image 1 is the approved style, palette, material, and proportion reference; do not copy its baked UI text.
Scene/backdrop: uniform warm parchment studio background with equal gutters.
Style/medium: polished realistic 3D product/character render, practical articulated construction, consistent design language.
Composition/framing: 4 by 2 grid with no labels. Top row shows the same robot in neutral standing pose from front, left profile, back, and three-quarter views, full body visible. Bottom row shows the same drone from front, side, top, and three-quarter views, fully visible. Preserve one identical design across views.
Lighting/mood: soft neutral studio light that reveals silhouette, joint structure, and surface breaks.
Color palette: off-white ceramic, linen stone, aged pewter, graphite/espresso joints, very restrained walnut detail; natural Observatory palette only.
Materials/textures: slightly worn ceramic shells, brushed aged metal, dark mechanical joints, fine walnut accents.
Constraints: original design; robot approximately 1.7 meters high, friendly but not cute, no human skin or face, clear shoulder/elbow/wrist/hip/knee/ankle articulation and five-finger hands; drone approximately 1.4 meters wide with protected rotors and one central camera. Neutral poses only. No architecture, water, props, weapons, wings, extra limbs, cables to nowhere, text, labels, letters, numbers, logos, trademarks, watermark, blue neon, violet, cyan glow, black sci-fi void, glossy white consumer-electronics styling, or aggressive military styling.
```

## artifact-systems-base

Accepted only as the base for `artifact-systems-remove-writing`; the base image was rejected because it introduced pseudo-writing and glyph-like surface marks.

```text
Use case: stylized-concept
Asset type: provider-neutral 3D artifact modeling reference sheet
Primary request: create a clean nine-panel concept sheet for three original Observatory artifacts from Image 1: ASTRAEA celestial chart engine, PINÁCULO numerological pattern engine, and Sound Lab harmonic instrument. This is modeling reference art, not a website screenshot.
Input images: Image 1 is the approved style, palette, material, and object-language reference; ignore all baked UI text and nameplates.
Scene/backdrop: uniform warm parchment studio background with equal gutters.
Style/medium: polished realistic 3D product-design render with practical, buildable geometry and consistent scale.
Composition/framing: 3 columns by 3 rows, no labels. Top row shows the same ASTRAEA artifact from front, side, and three-quarter views. Middle row shows the same PINÁCULO artifact from front, top, and three-quarter views. Bottom row shows the same Sound Lab artifact from front, top, and three-quarter views. Keep each artifact identical across its three views and fully visible.
Lighting/mood: soft neutral studio light revealing engravings, controls, silhouette, and material changes.
Color palette: parchment, walnut, oak, taupe clay, buff, aged pewter, muted sage, espresso engraving; natural Observatory palette only.
Materials/textures: ASTRAEA is a tilted mechanical astrolabe with layered engraved rings in parchment/pewter on a walnut stand; PINÁCULO is a low circular walnut-and-clay tabletop mechanism with one outer dial and a restrained ring of movable wooden markers; Sound Lab is a low rectangular walnut instrument with one central circular harmonic dial, a few physical knobs and sliders, aged-metal hardware, and no keyboard.
Constraints: original designs; clear silhouette and plausible mechanical assembly; ASTRAEA approximately 2.8 m high, PINÁCULO approximately 2.7 m wide, Sound Lab approximately 2.5 m wide. No numerals, alphabet letters, words, glyph-like writing, nameplates, UI, screens, people, robot, drone, architecture, water, excessive parts, text, labels, logos, trademarks, watermark, blue neon, violet, cyan glow, black sci-fi void, fantasy magic effects, zodiac trademarks, or illegible pseudo-writing.
```

## artifact-systems-remove-writing

Accepted output: `artifact-systems-reference.png`.

```text
Use case: precise-object-edit
Asset type: corrected provider-neutral 3D artifact reference sheet
Input images: Image 1 is the edit target.
Primary request: remove every alphabet-like character, numeral-like character, pseudo-letter, pseudo-word, glyph, rune, zodiac symbol, and illegible written mark from the three ASTRAEA panels, the three PINÁCULO panels, and the three Sound Lab panels. Replace them only with clean unlabeled material surfaces and simple neutral geometric construction marks: concentric circles, straight radial lines, dots, small round fasteners, and shallow grooves.
Constraints: preserve the exact 3 by 3 sheet composition, the three object designs, silhouettes, viewpoints, proportions, wood/metal/ceramic materials, natural palette, lighting, blank nameplates, knobs, markers, and resolution. Change only written or symbol-like surface marks. Add no text, labels, letters, numbers, glyphs, logos, trademarks, or watermark.
```

## energy-electronics-base

Accepted output: `energy-electronics-reference.png`.

```text
Use case: stylized-concept
Asset type: provider-neutral 3D energy and electronics modeling reference sheet
Primary request: create a clean six-panel concept sheet for two original Observatory devices from Image 1: a Future Energy adaptive-flow battery demonstrator and an electronics/AI module. This is reference art for original web-ready 3D modeling, not a website screenshot.
Input images: Image 1 is the approved style, palette, material, and object-language reference; ignore baked UI text and nameplates.
Scene/backdrop: uniform warm parchment studio background with equal gutters.
Style/medium: polished realistic 3D industrial-design render with practical, buildable geometry and a coherent handmade scientific-instrument language.
Composition/framing: 3 columns by 2 rows, no labels. Top row shows the same adaptive-flow battery from front, side, and three-quarter views. Bottom row shows the same electronics/AI module from front, top, and three-quarter views. Keep each device identical across its views and fully visible.
Lighting/mood: soft neutral studio light revealing tanks, piping, controls, silhouette, and material changes.
Color palette: aged pewter, clear neutral glass, muted sage mineral liquid, smoky olive, tea brown, walnut, graphite, buff, parchment; natural Observatory palette only.
Materials/textures: flow battery has two restrained vertical glass reservoirs, protected pipe loop, pump housing, wooden/aged-metal base, and visible but mechanically plausible sage and tea-brown liquid paths; electronics/AI module is a compact horizontal aged-metal and walnut instrument with visible modular boards behind protective grilles, tactile switches, cable sockets, one small blank status window, and no exposed dangerous wiring.
Constraints: original designs; Future Energy approximately 2.5 m wide and 2.4 m high; electronics/AI module approximately 2.2 m wide and 1.3 m high. No words, letters, numerals, glyphs, nameplates, UI, data screens, people, robot, drone, architecture, water basin, text, labels, logos, trademarks, watermark, blue neon, violet, cyan glow, black sci-fi void, medical equipment styling, oil-industry branding, impossible pipe connections, excessive cables, or illegible pseudo-writing.
```

## Review and handoff

- Accepted images contain no intended text or labels; asset-to-panel mapping lives in `reference-pack-manifest.json`.
- Generated orthographic-style views are proportion guidance, not measured CAD drawings. Modelers must reconcile small cross-view inconsistencies before topology or rig approval.
- The robot sheet does not waive manual five-finger topology, joint-deformation, stable-contact, or likeness review.
- The energy sheet communicates an educational flow-battery form only; it is not an engineering pressure-vessel design or performance claim.
- Exact target scales, material assignments, negative constraints, and authoring notes are authoritative in the manifest rather than inferred from pixels.
