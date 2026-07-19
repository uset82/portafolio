# UI verification log

Date: 2026-07-19  
Browser: Codex in-app browser against local Next.js development server

## Desktop — 1440×900

- Header identity, six routes, sound/motion status, hero copy, both CTAs, current-focus note, robot/water/ASTRAEA crop, CC AI cover, and Selected Systems were visible in the initial viewport.
- The solid editorial field removed duplicated embedded reference text.
- The real CC AI preview covers the screenshot's baked reference panel and expands to the full accessible shell.
- DOM snapshot confirmed semantic banner/navigation/main regions, one H1, section H2s, labeled links, image alt text, assistant trigger, and footer navigation.
- Browser console warning/error read returned an empty set.
- Document width equaled scroll width; no horizontal overflow.

## Mobile — 390×844

- Identity and labeled Menu remain visible; headline, support, actions, and current-focus note use one readable column.
- Menu opened as a full warm-ivory sheet, focused its first link, exposed all six routes, and closed with Escape.
- CC AI opened as a bottom sheet with title, Close, welcome, disabled honest prompts/input, and prototype disclosure.
- The scene crop protects the robot face/body, hand/water contact, and PINÁCULO foreground while cropping baked header/navigation text.
- Selected Systems reflows into a vertical editorial list.
- Document width equaled scroll width; no horizontal overflow.

## Build and code checks

- `pnpm format:check` — pass
- `pnpm lint` — pass, zero warnings
- `pnpm typecheck` — pass under strict/no-unchecked/exact-optional settings
- `pnpm build` — pass; 13 static pages generated, including three system slugs

## Open verification work

Automated accessibility audits, 200% zoom, screen-reader runs, performance profiling, WebGL failure/quality tiers, no-JavaScript mode, and live chat tests remain tied to their later plan tasks.

## Foundational UI primitive pass — 2026-07-19

### Desktop — 1440×900

- Shared primary and secondary hero actions each measured 44px high.
- Three shared editorial link rows rendered at a minimum 69.59px height.
- The shared image frame preserved the optimized poster, correct figure/image semantics, complete load, and intended crop.
- ASTRAEA rendered through the shared editorial heading with the literal “Concept · source review” tag; the tag uses text and a marker in addition to color.
- Keyboard focus exposed the approved warm-ivory offset and dark-sage ring; the skip link settled fully inside the viewport.

### Mobile — 390×844

- Both hero actions remained 44px high and expanded to the 343px content width.
- Editorial rows remained at least 73.59px high; the optimized poster remained loaded inside the shared frame.
- ASTRAEA heading, status tag, and summary reflowed to the 343px content column without horizontal overflow.

### Checks

- Desktop and mobile document widths equaled their viewport widths.
- Browser warning/error log was empty.
- `pnpm verify` passed formatting, lint, strict types, content and palette contracts, and the 13-page production build.

## Media foundation pass — 2026-07-19

### Desktop — 1440×900

- Sound rendered one H1 and a distinct “Playback foundation” H2 with an explicit “Awaiting sources” text status.
- The readiness region measured 353px wide; its three rows measured 66px, 83px, and 66px high.
- No iframe, audio, or video element was created because no approved source exists; the route therefore contacted no third-party media provider.
- The 1425px document width stayed within the layout viewport after the browser scrollbar, with no visible horizontal overflow.

### Mobile — 390×844

- The title, approved explanatory copy, readiness status, and all three requirement rows reflowed into the 343px content column.
- Rows measured 83px, 83px, and 66px high; the page client width and scroll width both measured 375px.
- Browser warning/error output was empty.

### Contract and fallback checks

- Native media source uses `controls`, `muted`, `preload="none"`, a useful player label, adjacent failure recovery, and transcript/caption hooks; video requires a poster.
- Provider source is absent from the DOM before consent. When approved and loaded, the frame is lazy, titled, sandboxed, privacy-described, non-autoplaying by contract, and paired with retry/external recovery.
- The existing `prefers-reduced-motion` and Motion user-preference paths apply, while playback remains manual in every mode.
- `pnpm verify` passed formatting, lint, strict types, negative content and palette contracts, and the 13-page production build.
