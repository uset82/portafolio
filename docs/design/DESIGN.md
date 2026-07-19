# Submerged Earth Observatory — implementation design contract

Status: approved for initial implementation  
Baseline: `docs/design/reference/mainUI-approved.png`  
Decision record: `docs/decisions/001-portfolio-foundation.md`

## Visual thesis

Carlos's portfolio is a sunlit instrument-maker's observatory: warm editorial typography and natural materials frame a precise world of AI, electronics, sound, energy, and symbolic systems, with a contemplative ceramic robot as the unmistakable visual signature.

Nightglass contributes its discipline—hierarchy, semantic states, quiet controls, accessibility, and restrained motion—but its dark palette is replaced by Carlos's locked natural palette. Refero is studied for systems thinking only; no brand, component, layout, or copy is cloned.

## Content plan

1. **Hero / orient:** Carlos, the one-line promise, two actions, and the observatory as one dominant visual plane.
2. **Selected systems / prove:** a short editorial index of flagship work, beginning in the first viewport transition.
3. **Laboratory and media / deepen:** full-width project, sound, energy, and process moments rather than a card mosaic.
4. **Story / humanize:** a concise biography/CV route and a curated personal-practice route.
5. **Contact / convert:** one quiet invitation with email/contact behavior once verified.

## Interaction thesis

- The first view assembles in reading order while the observatory resolves from its poster; the motion communicates readiness, not spectacle.
- Entering the Observatory moves the camera toward one artifact at a time while a matching DOM summary receives focus; users can interrupt or return home immediately.
- Project and media links use a restrained underline/figure reveal. CC AI opens as a mobile sheet or a compact desktop panel and never blocks the primary navigation.

## Originality and reference audit

| Reference | Lesson used | Must not copy |
| --- | --- | --- |
| Carlos's `mainUI.png` | Approved hierarchy, subject placement, material warmth, object naming, and first-viewport balance | Embedded raster text as the real interface |
| Refero Styles | Design-token documentation, spacing discipline, and state completeness | Product branding, screenshots, exact layouts, or signature components |
| Nightglass | One dominant idea, cardless structure, quiet DOM overlays, accessible interaction states | Near-black canvas, aqua accent, or dark glass surfaces |
| Editorial museum catalogues | Large serif title, measured captions, and object-led sequencing | Any specific publication grid or wordmark |
| Scientific instrument plates | Fine dividers, engraved labels, index numbers, and provenance detail | Faux historical claims or ornamental illegibility |
| Calm spatial portfolios | Canvas-first presentation with DOM routes and poster fallback | Scroll hijacking, mystery navigation, or inaccessible canvas-only content |

## Locked color system

These custom properties are the implementation API. Values are copied from the approved plan and must remain synchronized across DOM, poster, Three.js materials, loading UI, and chat.

```css
:root {
  --swatch-taupe: #a38772;
  --swatch-sage-stone: #c1bfb0;
  --swatch-sage-muted: #b1b199;
  --swatch-sand: #ecdfcf;
  --swatch-warm-ivory: #fef4ea;
  --swatch-clay: #cfa18a;
  --swatch-sage-pale: #cccab5;
  --swatch-off-white: #e5dfd3;
  --swatch-sage-dark: #77715b;
  --swatch-taupe-warm: #be967d;
  --swatch-buff: #dcc1ac;
  --swatch-dusty-pink: #e8bdb4;
  --scene-parchment: #e8dfd5;
  --scene-stone: #aea090;
  --scene-taupe: #9d8a73;
  --scene-sand: #c9b49e;
  --scene-linen: #d7c7b5;
  --scene-shadow-sage: #6f6655;
  --scene-oak: #8b755d;
  --scene-walnut: #5f4b35;
  --scene-espresso: #2e2417;
  --scene-deep-wood: #4b3520;
  --color-canvas: var(--scene-parchment);
  --color-canvas-soft: var(--swatch-warm-ivory);
  --color-linen: var(--swatch-sand);
  --color-buff: var(--swatch-buff);
  --color-off-white: var(--swatch-off-white);
  --color-sage-light: var(--swatch-sage-stone);
  --color-sage-muted: var(--swatch-sage-muted);
  --color-sage-pale: var(--swatch-sage-pale);
  --color-sage-dark: var(--swatch-sage-dark);
  --color-moss: #69705a;
  --color-taupe: var(--swatch-taupe);
  --color-taupe-warm: var(--swatch-taupe-warm);
  --color-clay: var(--swatch-clay);
  --color-dusty-pink: var(--swatch-dusty-pink);
  --color-oak: var(--scene-oak);
  --color-walnut: var(--scene-walnut);
  --color-espresso: var(--scene-espresso);
  --color-deep-espresso: #2a1d16;
  --color-water-slate: #5b6965;
  --color-water-light: #87918a;
  --color-pewter: #9b9d96;
  --color-silver: #c8c7be;
  --color-text-primary: #2a1d16;
  --color-text-secondary: #6e5b4d;
  --color-text-on-dark: var(--swatch-warm-ivory);
  --color-border-soft: #cdb69e;
  --color-focus: var(--swatch-sage-dark);
}
```

Required contrast pairs: primary on parchment 12.40:1; secondary on parchment 4.88:1; espresso on taupe 4.87:1; ivory on walnut 7.60:1; dark sage on ivory 4.50:1. Warm ivory is not used as normal text on taupe. Translucent surfaces need a solid readable fallback and must be checked over the rendered scene.

Color distribution targets: 30% off-white/parchment/linen, 20% buff/sand/pale taupe, 18% sage/stone, 12% oak/walnut, 10% water/pewter/silver, 7% espresso structure, and at most 3% clay/dusty pink. No cyan, electric blue, violet, neon, rainbow gradient, or almost-black replacement theme.

## Typography

- **Display and editorial:** Cormorant Garamond Variable, SIL Open Font License, self-hosted as WOFF2. Fallback: Georgia, `Times New Roman`, serif.
- **Body and interface:** Manrope Variable, SIL Open Font License, self-hosted as WOFF2. Fallback: Inter, `Segoe UI`, sans-serif.
- **Technical metadata:** the body stack with tabular numbers; no third family in v1.
- Display weight 500; body 400; labels/navigation 500–600. Avoid faux bold.
- Hero: `clamp(3rem, 5.7vw, 6.4rem)` at 0.93 line-height, 2–3 desktop lines; `clamp(2.65rem, 12vw, 4.25rem)` on mobile.
- Section title: `clamp(2.2rem, 4vw, 4.5rem)`. Body: `clamp(1rem, 1.1vw, 1.125rem)` at 1.6.
- Reading width 42rem; hero support copy 35rem; navigation does not wrap on desktop.
- Fonts preload only required weights/subsets; `font-display: swap`; fallback metrics are tuned to minimize layout shift.

## Grid, spacing, shape, and elevation

- Base spacing unit: 4px. Named steps: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128px.
- Page gutter: 16px small mobile, 24px large mobile/tablet, 40px laptop, 56px wide desktop.
- Editorial grid: 12 columns desktop, 8 tablet, 4 mobile. Hero copy spans 4/12; scene spans columns 4–12 with overlap behind the calm field.
- Header height: 84px desktop, 68px mobile. Interactive targets are at least 44×44px.
- Borders: 1px `--color-border-soft`, with engraved 1px inset detail only for artifact metadata.
- Radii: 2px labels/dividers, 8px controls, 16px chat/large media. Full pills only for actual status.
- Elevation: prefer occlusion, media crop, and a single soft shadow (`0 20px 55px rgb(46 36 23 / .16)`) over stacked shadows.
- Z-index contract: scene 0, atmosphere 5, page content 10, header 20, chat 30, mobile navigation 40, modal 50, skip link 60.

## Global shell

### Navigation

- Desktop: transparent/quiet overlay with CC mark, Carlos Carpio, six text links, sound control, and reduced-motion status. Active route uses an underline and `aria-current="page"`.
- Mobile: CC mark/name remain visible; a labeled Menu control opens a full-width warm-ivory sheet. Focus moves to the first link, is contained while open, Escape closes, and focus returns to Menu.
- A skip link appears on keyboard focus. Header remains usable at 200% zoom and can wrap into the sheet before links collide.
- Contact is always reachable through navigation and the footer. No mystery icon-only route.

### Footer

- A quiet two-column close: one contact sentence and verified email/action on the left; routes, copyright, privacy, and optional résumé on the right.
- On mobile it becomes one reading-order column. No social links appear until verified.

## Page and route composition

### Home

The first viewport is a poster: identity and promise on the left; observatory visual on the right; two actions; one current-focus note; chat at lower right; Selected Systems begins at the lower edge. Subsequent sections are full-width editorial moments: Selected Systems, Laboratory, Sound, Cosmos, Story, and Contact. Lists and figures replace a generic project-card grid.

### Work index

- Default: ordered editorial list with image, title, category, status, one-sentence contribution, and year only when verified.
- Filters are introduced only when at least eight verified projects exist; until then, category anchor links suffice.
- If filters exist, they are real buttons, announce result count, retain all items in DOM, and expose a clear Reset. No-result copy explains how to recover.

### Case study

Order: title/status → role/contribution → concise overview → problem and constraints → approach → visual/demo evidence → outcome (verified only) → learning → stack → source/demo links → related work. Unavailable demos and preparation states are explicit. The layout alternates wide media with a 42rem reading column rather than stacking cards.

### Laboratory and media

- Laboratory groups verified experiments by system and maturity. Experimental concepts are visibly labeled and never presented as shipped claims.
- Sound uses native controls or accessible custom controls with play/pause, time, mute, transcript/notes, loading, and failure state. Sound is mute-first and never autoplays audibly.
- Video is poster-first, lazy, captioned/transcribed, and provides an external-host link if embedding fails.

### Story and Cosmos

- Story presents biography, experience, skills, education, and résumé action in an editorial timeline. On mobile, dates precede entries in reading order; no alternating timeline.
- Cosmos and personal-practice material is curated into short essays/objects. Astrology and numerology are personal/creative exploration, not scientific or medical claims. Trips never expose precise private location or dates.

### Contact and error states

- V1 defaults to a verified mail link; a server form is added only after recipient, privacy, spam, and retention decisions are approved.
- 404 uses “This instrument is not in the observatory” plus Work and Home actions.
- Missing case study, unavailable demo, failed embed, offline request, and AI error each explain what happened and provide a next action. A toast is never the sole error location.

## Component and interaction states

All interactive elements specify default, hover, focus-visible, active/pressed, disabled, loading, error, and visited behavior where applicable. Focus is a 3px dark-sage ring with 3px warm-ivory offset. Hover is enhancement; touch and keyboard expose the same action. Loading retains control dimensions and includes text or an accessible name. Status uses text/icon plus color. Visited project links use a subtle espresso-to-sage underline shift without reducing contrast.

## Responsive contract

| Viewport | Hero | Scene crop | Navigation | Chat | Selected systems |
| --- | --- | --- | --- | --- | --- |
| 320–389 | Single column; copy first; poster below | Robot hand/water and one artifact; no text baked into essential area | Menu sheet | Collapsed button; opens bottom sheet | Vertical editorial list |
| 390–639 | Copy occupies top 52–58svh; visual continues below | Robot, water, ASTRAEA edge | Menu sheet | Bottom sheet, max 78svh | Two-up only if labels fit |
| 640–1023 | 8-column overlap | Robot centered; Sound Lab/PINÁCULO foreground | Compact link row or menu by fit | Right sheet | Two columns |
| 1024–1439 | 4/12 copy, 8/12 scene | Matches approved image anchors | Full navigation | 360–400px panel | Three editorial columns |
| 1440+ | Copy capped at 580px; scene can bleed | Approved wide framing; no extra decorative objects | Full navigation | 400px panel | Three columns with wider media |

No horizontal page scroll. At 200% zoom, desktop navigation may switch to the mobile sheet. Touch targets remain 44px. Cropping protects the robot face/hand, ASTRAEA label zone, and the headline calm zone; Sound Lab and PINÁCULO may fall below the fold on narrow screens.

## Motion system

1. **Assemble:** logo, eyebrow, headline, copy, and actions reveal in reading order over 520ms with ≤60ms stagger. The poster/scene resolves from 0.985 scale and 0 opacity over 650ms.
2. **Focus:** an artifact selection triggers a 600–900ms interruptible camera transition while its DOM label expands over 220ms. Only one system owns camera movement.
3. **Trace:** project/media links draw a 160ms underline and figures reveal once by ≤16px over 420ms. No ambient DOM loop.

Easing: emphasized `cubic-bezier(.16, 1, .3, 1)` for entrances/camera endpoints; standard `cubic-bezier(.2, .8, .2, 1)` for controls. Reduced motion removes parallax, camera travel, stagger, auto-rotation, water ripples, drone hover, robot tracking, and smooth scrolling. Content appears immediately; artifact selection changes framing via an immediate cut and the same DOM label/focus update.

## Cross-system animation ownership

| Transition | Owner | Trigger | Duration | Cancellation | Reduced motion | Cost |
| --- | --- | --- | ---: | --- | --- | --- |
| Header/hero assemble | Motion / Animate UI open-code pattern | First render | 520–650ms | Route change | Immediate | Low |
| Button/link feedback | CSS | Pointer/focus/press | 160ms | Input ends | Immediate | Low |
| Mobile menu/chat sheet | Motion | Activate | 220ms | Escape/reverse | Immediate | Low |
| Section/figure reveal | Motion | First intersection | 420ms | Unmount | Immediate | Low |
| Scene camera focus | R3F | Artifact action | 600–900ms | New input cancels | Camera cut | Medium |
| Robot/drone idle | R3F animation mixer/procedural | Scene ready + visible | Slow loop | Pause/hidden/input | Frozen authored pose | Medium |
| Water ripples | R3F shader | Pointer/touch/robot hand | ≤1.2s decay | New impulse/quality change | Static normal map | High |
| Chat streaming cursor | CSS | Server stream | 480ms cadence | Complete/stop | Static progress text | Low |

## Accessibility and fallback rules

- Semantic header, navigation, main, sections, headings, links, buttons, form labels, and live regions exist independently of WebGL.
- Canvas receives a useful accessible label plus an adjacent text description; every artifact has a DOM button/link equivalent.
- Poster-first loading preserves the headline and primary actions. No-JavaScript presents the poster, page links, project summaries, and contact path.
- WebGL unsupported/context lost/asset failure shows the approved poster and a concise explanation with Retry where recovery is possible.
- `Save-Data`, low memory/performance, or mobile quality detection selects a reduced poster or low tier without removing content.
- Audio is mute-first, optional, and never the only feedback channel. Continuous nonessential scene motion has a Pause control.
- Live chat announces connection, streaming completion, stop, retry, error, and rate-limit state without repeatedly reading partial tokens.

## QA gate

- Compare the implementation to `mainUI-approved.png` at 1440px: palette, exposure, calm left field, subject dominance, object anchors, chat placement, and first-viewport balance.
- Inspect 390px and 1440px widths, then 320px, 768px, 1024px, and 1920px for crop/reflow regressions.
- Verify keyboard-only completion, visible focus, menu/chat focus return, 44px targets, heading order, accessible names, and 200% zoom.
- Verify normal and reduced motion, muted audio, Save-Data/static fallback, no-JavaScript content, WebGL failure, image failure, chat error/rate limit, and unavailable demo states.
- Check contrast over both solid and translucent scene surfaces. Check no blue/cyan/violet palette drift.
- Performance targets: poster ≤350KB desktop / ≤180KB mobile, initial JS ≤180KB gzip excluding optional 3D, total initial transfer ≤1.2MB, LCP ≤2.5s on representative mobile, CLS ≤0.1, INP ≤200ms; full 3D lazy-loads after semantic UI.
