# Approved Natural Observatory implementation prompt

Canonical source: `maintaskplan.md`  
Archived with reference: 2026-07-19

Build Carlos Carpio's portfolio as a multi-page editorial experience whose homepage is The Submerged Earth Observatory. Work only on ready tasks in `maintaskplan.md` and keep its evidence log current.

## Visual source of truth

Use `mainUI-approved.png` (1672×941; SHA-256 `B4E11D325297CEB8FFB021866FFA2903B316D5D2443DEF67BA890B4B3F3058BF`) as the approved composition, exposure, material, and atmosphere reference. Recreate it as real semantic UI plus an optional interactive 3D enhancement. Never ship the screenshot as the final full-page background.

## Visual thesis

A bright, calm, natural-futurist observatory: warm paper and limestone, pale ceramic machinery, sage water, aged oak and walnut, quiet pewter, editorial serif display type, restrained sans-serif utility text, and one contemplative mechanical focal figure. It must feel like Carlos's workshop of software, AI, music, electronics, future energy, astrology, and numerology—not dark steampunk, cyberpunk, generic beige SaaS, or a dashboard-card grid.

## Composition

Keep the first viewport poster-like and legible: CC mark and Carlos Carpio identity; Work, Laboratory, Sound, Cosmos, Story, and Contact navigation; one short role line; one 2–3 line headline; one concise supporting statement; a focused CTA pair; one dominant Observatory scene; unobtrusive sound/motion controls; a lower-right CC AI entry; and a narrow Selected Systems transition. Preserve calm text-safe space on the left. On mobile, prioritize identity, headline, CTAs, project paths, and a strong static/cropped visual before loading heavy 3D.

## Color contract

Use the semantic token system in `DESIGN.md`. Exact supplied anchors: `#A38772`, `#C1BFB0`, `#B1B199`, `#ECDFCF`, `#FEF4EA`, `#CFA18A`, `#CCCAB5`, `#E5DFD3`, `#77715B`, `#BE967D`, `#DCC1AC`, and `#E8BDB4`. Scene anchors: `#E8DFD5`, `#AEA090`, `#9D8A73`, `#C9B49E`, `#D7C7B5`, `#6F6655`, `#8B755D`, `#5F4B35`, `#2E2417`, and `#4B3520`.

Keep warm off-white/linen dominant, followed by buff/taupe, sage/stone, wood, water/metal, and only small clay/dusty-pink warmth. No cyan, turquoise, electric blue, violet, neon, rainbow gradient, bright orange glow, crushed black, or near-black theme. Taupe uses deep-espresso text; warm-ivory text is reserved for walnut or darker surfaces. Validate actual and translucent color pairings to WCAG 2.2 AA.

## DOM and canvas architecture

Semantic HTML owns headings, copy, navigation, CTAs, project links, chat controls, loading/error states, and every essential action. A Three.js/React Three Fiber canvas may own the environment, robot, water, artifacts, camera, and pointer/touch scene interaction. Retain the same content and primary paths in full-3D, reduced-quality, static, no-WebGL, no-JavaScript where practical, and reduced-motion modes. Start poster-first; never show a blank hero while assets load.

## 3D assets

Use a provider-neutral, rights-cleared asset pipeline. Hunyuan Studio or Hunyuan3D 2.1 may not be used for production until the rights gate confirms terms covering generation location and worldwide public display, including the EU, UK, and South Korea. Otherwise use original authored, procedural, user-owned, or permissively licensed assets. Never call a generation provider from the public browser runtime. Review and optimize every accepted asset for originality, rights, topology, UVs, PBR maps, palette, scale, pivots, LODs, GLB size, texture memory, mobile cost, and static fallback.

## Motion

Use 2–3 purposeful motifs: a reading-order hero entrance, a restrained scene/depth transition, and one clear hover/focus/touch response. Selected Animate UI source components plus Motion may own DOM animation; R3F owns scene animation; CSS owns simple state transitions. Assign each property to one owner. Configure `MotionConfig reducedMotion="user"`, stop parallax/camera loops for reduced motion, provide a pause/static control for nonessential continuous motion, and avoid scroll hijacking or animation noise.

## CC AI

Use `@openrouter/sdk` only behind a server route. Treat `openrouter/free` as a low-volume prototype route with changing model selection, availability, and limits—not a production SLA. Keep the key out of client bundles; disclose the actual responding model; restrict providers by approved data/training policy; ground answers only in approved public records; make uncertainty explicit; bound messages, concurrency, retries, retention, and logs; and design stop, retry, timeout, 402/429, provider-failure, privacy, and unavailable-chat states. The portfolio works without chat.

## Animate UI and Refero

Animate UI is copy-first source, not a ready-made visual theme. Import only components that improve comprehension, preserve applicable licenses/notices, and replace defaults with this palette and typography. Use Refero only to study typography, spacing, navigation, and interaction patterns; record lessons in `DESIGN.md` and do not copy another product's branding, layout, assets, or language.

## Quality bar

Design mobile and desktop intentionally. Keep touch targets at least 44px, keyboard focus visible, canvas actions duplicated in DOM, audio mute-first, and meaningful media labeled. Bound DPR/render work, pause offscreen/hidden animation, lazy-load noncritical media and 3D, dispose replaced GPU resources, and measure transfer/parse/GPU/thermal cost. Verify 390px and 1440px, 200% zoom, keyboard flow, screen-reader order, reduced motion, static fallback, WebGL failure, contrast, and palette/exposure against the approved image. Record intentional deviations in `DESIGN.md`; unexplained palette or hierarchy drift is a defect.
