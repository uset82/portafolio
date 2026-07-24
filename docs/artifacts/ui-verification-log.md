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

## Clean-checkout semantic foundation gate — 2026-07-19

- Cloned exact commit `71368ad` into a disposable directory with no working-tree changes.
- `pnpm install --frozen-lockfile` completed, then `pnpm verify` passed formatting, lint, strict types, 40 tests, content/palette/boundary checks, and the 13-page production build.
- The clean production server was inspected at 1440×900 and 390×844 before any Three.js dependency was added.
- Desktop metrics: 1425px client/scroll width, one H1, complete 1254px-wide optimized poster, 26 focusable controls, and no console warnings/errors.
- Mobile metrics: 375px client/scroll width, one H1, complete 339px responsive poster, 26 focusable controls, and no console warnings/errors.
- The settled mobile first viewport kept identity, readable headline/support, both actions, and the CC AI entry. The labeled Menu exposed all six routes and closed with Escape, restoring the Menu control.

## Reusable case-study layout — 2026-07-20

### Desktop — 1440×900

- ASTRAEA rendered as one main landmark with one H1 and a three-part field-note hero: route/status rail, dominant project identity, and factual evidence/publication rail.
- The approved-concept section begins at the first viewport transition; the wide held-evidence field and publication boundary follow in semantic source order.
- The 44px Back to Work action, project status text/marker, facts, and return action remained readable. Document client width and scroll width both measured 1425px, with no horizontal overflow.

### Mobile — 390×844

- The hero, facts, reading sections, held-evidence instrument, and publication action intentionally collapsed to one 343px content column.
- ASTRAEA remained within the viewport at 74.1px, the evidence instrument measured 319.8px, and Back to Work plus the lower action both measured 44px.
- Document client width and scroll width both measured 375px. The evidence copy remained readable below the instrument, and the browser console contained no warnings or errors.

### Contract and production checks

- The held branch renders no external project actions or project media. The evidence fixture verifies contribution, overview, problem/constraints, approach, accessible image evidence, architecture, demo, outcome, learning, stack, external source, and related-work regions in order.
- `pnpm verify` passed formatting, zero-warning lint, strict types, 98 unit tests, content/palette/server/asset gates, all 13 static routes, and the emitted immersive artifact check.

## Identity-led hero — 2026-07-20

### Desktop — 1440×900

- Carlos Carpio's identity, approved role, single headline, short support statement, two distinct actions, current-focus note, the complete Observatory scene, CC AI entry, and the Selected Systems transition all settled inside the first viewport.
- Both actions measured 44px and resolve to `#selected-systems` and `/work`. The optimized 1254×705 poster loaded with meaningful alt text and the reveal settled at full opacity without inline hidden styles.
- The document had one H1 and one main landmark, no horizontal overflow, and no browser console warnings or errors.

### Mobile — 390×844

- Identity, role, headline, support, both stacked 44px actions, and a 212px scene strip all fit before the first viewport boundary; the optional current-focus note begins after the scene.
- The mobile poster crop isolates the real robot and instruments instead of shrinking the poster's baked desktop interface into the page. The image remained complete and meaningfully labeled.
- The document had one H1 and one main landmark, no horizontal overflow, settled full opacity, and no browser console warnings or errors.

### Contract and production checks

- Static rendering verifies that reveal wrappers contain no hidden inline style and therefore remain readable if hydration or client animation fails.
- The content contract requires approval-backed public identity provenance, the approved role, one-sentence headline, concise support, and exactly two distinct homepage actions.
- `pnpm verify` passed formatting, zero-warning lint, strict types, all 100 unit tests, content/palette/server/asset gates, all 13 static routes, and the emitted immersive artifact check.

## Selected Work unpublished component preview — 2026-07-20

The component was reviewed through a temporary local preview route and then removed. It is not mounted in the production homepage while task U.4 remains unchecked.

### Desktop — 1440×900

- The five draft flagships appeared in the verified editorial order as full-width divided rows rather than cards: StrudelAI, Codex Avatar Studio, iFoundYou / Dommedag, OpenNemoClaw, and WebDesigner.
- Every row kept its typographic visual plate, category, literal status, title/tagline, contribution boundary, and repository action visible. Actions measured 44px; four rows measured 192px and the longer iFoundYou row measured 230.38px.
- The document client and scroll widths both measured 1425px, with no horizontal overflow and no project image, video, or iframe.

### Mobile — 390×844

- Every row intentionally reflowed to one 343px column. The five typographic plates measured 343×116px and every repository action measured 343×44px.
- Category, status, title, tagline, contribution, and action remained in semantic reading order without depending on hover. The document client and scroll widths both measured 375px.

### Contract and production checks

- Static rendering verifies all five ordered articles, contribution labels, status text, link slots, and the absence of unapproved media.
- CSS contracts require focus-within and hover feedback, a pressed touch state, 44px actions, tablet reflow, and mobile single-column reflow; the global reduced-motion override collapses their transition durations.
- `pnpm verify` passed formatting, zero-warning lint, strict types, all 102 unit tests, content/palette/server/asset gates, all 13 production routes, and the emitted immersive artifact check.

## Homepage profile/CV teaser — 2026-07-20

### Desktop — 1440×900

- The profile section rendered as a wide, cardless two-column editorial field: a 477px code-native `CC` profile study beside a 746px copy column.
- The approved role, exact long biography, three practice threads, Story/CV action, and verified GitHub path remained visible in a clear hierarchy. The section had no image, picture, PDF, or download control.
- Each practice-thread row and both actions measured 44px. The section used its H2 as the accessible label, its link group exposed “Profile and CV paths,” and the 1425px client/scroll widths matched with no horizontal overflow.

### Mobile — 390×844

- The teaser intentionally reflowed to one 343px column with the copy before the monogram field, rather than compressing the desktop arrangement.
- All three practice rows and both full-width actions measured 343×44px. The `CC` field followed the actions as a 343×214px identity panel.
- The document client and scroll widths both measured 375px, with no horizontal overflow.

### Contract and production checks

- Static rendering verifies the exact approval-backed copy and sources, both destinations, the external-site cue, and the absence of portrait, résumé/PDF download, address, phone, or email material.
- CSS contracts require hover/focus feedback, 44px rows/actions, and a copy-first narrow-screen reflow; the existing global reduced-motion override collapses transitions.
- `pnpm verify` passed formatting, zero-warning lint, strict types, all 105 unit tests, content/palette/server/asset gates, all 13 production routes, and the emitted immersive artifact check.

## Related-project journey — 2026-07-22

### Desktop — 1440×900

- ASTRAEA rendered one 669px-wide next-system row for PINÁCULO and no previous/current link. Activating that link navigated to `/work/pinaculo` and updated the document title correctly.
- PINÁCULO rendered the approved adjacent systems as two divided 669×152px rows: previous ASTRAEA and next Future Energy. The current `/work/pinaculo` destination was absent.
- Every state retained the 44px Return to Work action, the navigation exposed “Related project navigation,” and the 1425px client/scroll widths matched with no horizontal overflow.

### Mobile — 390×844

- PINÁCULO reflowed to one 343px column in semantic previous-then-next order. Both adjacent rows measured 343×120px and aligned text left for narrow-screen scanning.
- The Work exit measured 343×44px. Document client and scroll widths both measured 375px with no horizontal overflow.
- Activating Future Energy produced the final boundary state: one previous link to PINÁCULO, no next link, no current-page link, and no wrap to ASTRAEA.

### Contract and production checks

- Static contracts verify the approved linear order, missing-slug behavior, first/middle/last boundaries, accessible direction/project labels, internal-only destinations, current-route omission, and permanent Work exit.
- CSS contracts require visible hover/focus feedback, desktop and mobile touch-safe rows, single-column reflow, and the existing reduced-motion override.
- `pnpm verify` passed formatting, zero-warning lint, strict types, all 109 unit tests, content/palette/server/asset gates, all 13 production routes, and the emitted immersive artifact check over 25 client files.

## Homepage media teaser — 2026-07-22

### Desktop — 1440×900

- The teaser rendered as one 1425px-wide, two-column natural-sage field: a centered 544×544px code-native silent-score instrument beside the approval-backed copy hierarchy.
- The exact “Awaiting approved sources” text status, H2, publication boundary, Music and Moving image identities, and the single `/sound` action were all present with correct heading association and list labeling.
- Both planned-format rows measured 330×56px and the action measured 94×44px. The client and scroll widths both measured 1425px, so the composition introduced no horizontal overflow.
- Activating Visit Sound reached `/sound`, whose Playback foundation remained honest and contained zero audio, video, iframe, or autoplay elements.

### Mobile — 390×844

- The teaser intentionally reordered to a 343px copy-first column followed by the 343×343px silent-score panel; the heading remained readable without compressing the desktop composition.
- The two planned formats stacked as 343×56px rows and the action expanded to 343×44px. Client and scroll widths both measured 375px with no horizontal overflow.
- The teaser contained zero audio, video, iframe, button, or autoplay elements, and browser warning/error output was empty.

### Contract and production checks

- Typed metadata requires exactly two approved formats, an internal action, and public source IDs. Static rendering verifies the exact identity/status, no-player boundary, and `/sound` destination.
- CSS contracts require visible hover/focus feedback, 56px rows, a full-width 44px mobile action, copy-first reflow, and the existing global reduced-motion override.
- `pnpm verify` passed formatting, zero-warning lint, strict types, all 112 unit tests, content/palette/server/asset gates, all 13 production routes, and the emitted immersive artifact check over 25 client files.

## Homepage trips/hobbies teaser — 2026-07-22

### Desktop — 1440×900

- The teaser rendered as one 1425px-wide buff editorial field with a 661px copy region and a distinct 544×680px code-native field-notes study; it followed the Sound section without competing with Selected Work.
- The exact “Personal stories held for review” text status, H2, privacy/rights hold, personal-practice claims boundary, Travel notes/Astrology studies/Numerology studies themes, and single `/cosmos` action were present with correct heading and list labels.
- The three themes measured 220×64px and the action measured 111×44px. Client and scroll widths both measured 1425px, so the section introduced no horizontal overflow.
- Activating Enter Cosmos reached `/cosmos`, whose copy preserved the creative/personal—not scientific, medical, or predictive—framing and the source-verification hold.

### Mobile — 390×844

- The teaser intentionally reordered to a 343px copy-first column followed by the 343×343px field-notes study; the status, large heading, concise boundary, themes, and action retained a clear reading sequence.
- Theme rows measured 343×64px or more and the action expanded to 343×44px. Client and scroll widths both measured 375px with no horizontal overflow.
- The section contained zero image, picture, audio, video, iframe, map, time, or address elements and no coordinate attributes.

### Contract and production checks

- Typed metadata requires exactly three approved preparation themes, the internal `/cosmos` path, reference-approved provenance, and an explicit claims boundary. Static rendering rejects private-location/coordinate/media leakage.
- CSS contracts require visible hover/focus feedback, 64px theme rows, a full-width 44px mobile action, copy-first reflow, and the existing global reduced-motion override.
- Initial local QA surfaced Next.js’s smooth-scroll opt-in warning; `data-scroll-behavior="smooth"` now records that intent on the root HTML element, and a fresh browser tab returned no warnings or errors.
- `pnpm verify` passed formatting, zero-warning lint, strict types, all 115 unit tests, content/palette/server/asset gates, all 13 production routes, and the emitted immersive artifact check over 25 client files.

## Homepage contact/footer transition — 2026-07-22

### Desktop — 1440×900

- The close rendered as one 1425px-wide deep-espresso field with an 880px lead region, a 308×592px contact signal, and a lower five-route editorial index; it followed the linen profile section as a decisive tonal transition rather than another card.
- The exact “Public contact method pending” text status, H2, privacy-first explanation, Visit Contact CTA, verified GitHub link/external cue, and both navigation labels were present with correct heading association.
- Contact and GitHub actions each measured 44px high. The route index contained Work, Laboratory, Sound, Cosmos, and Story as five 223×72px rows; Contact appeared only once as the primary action.
- DOM order was `/contact` → verified GitHub → Work/Laboratory/Sound/Cosmos/Story. Activating Visit Contact reached `/contact`, whose route retained the honest source-verification state. Client and scroll widths both measured 1425px.

### Mobile — 390×844

- The close intentionally reflowed to lead → contact signal → route index → copyright. Both actions expanded to 343×44px before the decorative field.
- The five route exits stacked as 343×64px rows. Client and scroll widths both measured 375px with no horizontal overflow.
- A 7rem footer bottom buffer kept the 343px copyright line above the fixed 130×64px CC AI trigger at the final scroll position; measured rectangles did not overlap.
- The footer contained no form, input, textarea, mail link, phone, address, availability, or booking surface. A fresh browser tab returned no warnings or errors.

### Contract and production checks

- Typed metadata requires the internal `/contact` action, verified external GitHub path, distinct IDs, reference-approved provenance, and literal pending state. Static rendering verifies one instance of each contact path and the complete DOM order.
- CSS contracts require visible focus/hover feedback, 72px desktop route rows, full-width 44px mobile actions, 64px mobile route rows, fixed-trigger clearance, and the existing global reduced-motion override.
- `pnpm verify` passed formatting, zero-warning lint, strict types, all 118 unit tests, content/palette/server/asset gates, all 13 production routes, and the emitted immersive artifact check over 23 client files.

## Projects index — 2026-07-22

### Desktop — 1440×900

- The Work route rendered as one 1425px-wide archival register: a 567px evidence-boundary introduction followed by exactly three approved concept rows in ASTRAEA → PINÁCULO → Future Energy order.
- Each ledger row measured 1339×272px and exposed its instrument index, accurate taxonomy, literal Concept state, bounded summary, and one 144×44px internal action without hiding information behind hover or animation.
- The three destinations were `/work/astraea`, `/work/pinaculo`, and `/work/future-energy`. Activating the first action reached ASTRAEA and its truthful held-concept case-study state.
- Document client and scroll widths both measured 1425px, so the register introduced no horizontal overflow.

### Mobile — 390×844

- The introduction and project rows deliberately became a single 343px reading column. The count remains adjacent to the section label, followed by the H1, boundary copy, and the register.
- Each code-native instrument measured 343×128px; all three internal actions measured 343×44px and remained visible in source order. Cosmos no longer repeats as “Cosmos / Cosmos,” while Future Energy retains the distinct “Laboratory / Energy” taxonomy.
- Document client and scroll widths both measured 375px with no horizontal overflow. Browser warning/error output was empty.

### Contract and production checks

- Static rendering proves complete validated-record coverage, order, semantic navigation/headings, unique internal links, taxonomy/status visibility, the no-shipped-claim boundary, and absence of media, forms, buttons, mail links, or external destinations.
- CSS contracts require visible hover/focus-within and pressed feedback, 44px actions, deliberate tablet/mobile reflow, and no animation dependency; the existing global reduced-motion override still collapses transitions.
- `pnpm verify` passed formatting, zero-warning lint, strict types, all 120 unit tests, content/palette/server/asset gates, all 13 production routes, and the emitted immersive artifact check over 23 client files.

## Observatory experience controls — 2026-07-23

### Desktop — 1440×900

- The collapsed Experience control and scene-status badge occupied separate top-right rows. Opening the 400px drawer placed its opaque Natural Observatory surface above scene annotations and the default CC AI launcher, so every control remained readable and operable.
- Auto resolved to Reduced for the inspected browser. Manual Poster and Reduce motion selections, Pause/Resume, and the atomic live summary all updated correctly; reloading retained Poster, reduced motion, and pause.
- Reset restored Auto, Follow system, and active motion and became disabled. Escape and Close collapsed the disclosure and returned focus to its summary.
- All options and actions measured at least 44px high. Client and scroll widths both measured 1425px, and the browser warning/error log was empty.

### Mobile — 390×844

- The collapsed control followed the 212px poster scene as a deliberate in-flow row. Opening it produced a 358px-wide, 719.5px-tall section rather than an overlay or clipped scene child.
- Quality and motion options reflowed into two 144.8×44px columns. Close, Pause, Sound status, and Reset remained 44px high; the lower sound/reset area and the current-focus/Selected Systems content after the control remained reachable by normal scrolling.
- Close restored focus to the summary. Document client and scroll widths matched at 390px with no horizontal overflow.

### Fallback and integrity checks

- The critical robot URL remained rights-gated, so the browser correctly retained the complete poster experience while still allowing quality/motion preference changes; no live-Canvas or renderer-performance claim is made.
- Sound remained visibly muted and unavailable with an ordinary `/sound` route. No audio source, autoplay state, provider request, or sound activation entered preference storage.
- Five preference/control tests plus the strengthened capability and scene-state contracts bring the complete suite to 170 tests.
- `pnpm verify` passed formatting, zero-warning lint, strict types, all 170 tests, content/palette/server/asset gates, the 13-route production build, and the 12-manifest/0-public-GLB/25-client-file semantic fallback scan.

## CC AI presentation — 2026-07-23

### Desktop — 1440×900

- The collapsed lower-right launcher measured 400×272px and opened a 400px-wide natural-palette dialog with a focused labeled composer, three 366×44px prompts, a 44px Close control, a 55px Send control, and the exact provider-processing/private-files privacy boundary.
- Prompt activation and Enter submission reached the real disabled-by-default same-origin route and rendered one honest `CC AI paused` alert, selected-work and Story recovery links, and Clear conversation without exposing a provider error. Clear reset the transcript; Escape closed the panel and restored focus to the collapsed launcher.
- The dialog remained within its 68vh bound with no document or panel overflow. Client and scroll widths both measured 1425px.

### Mobile — 390×844

- The launcher remained fixed to the viewport at 130.3×64px and sat six pixels above the in-flow 343×44px Experience summary. Removing transform from the route-entry shell fixed the prior full-document containing block; lowering the Experience control stacking kept the chat overlay authoritative.
- The opened modal sheet measured 390×658.3px (`78svh`) from 185.7px to the viewport bottom. Its backdrop covered the viewport, the composer received focus, body overflow became hidden, and client/scroll widths both measured 390px.
- Every visible control measured at least 44px. Shift+Tab from Close wrapped to the privacy summary and Tab from that summary wrapped to Close after the summary was added to the focus boundary.
- The deterministic disabled-service alert, recovery links, Clear action, composer, Send, privacy summary, and sheet footer remained visible without internal or horizontal overflow. Escape restored launcher focus and body scrolling; the exit panel detached after its bounded transition.

### Diagnostics and scope

- Browser warning/error output was empty after desktop and mobile journeys.
- Reducer/transport contracts cover completed progressive presentation, Stop/Retry, stale-request cancellation, model/context disclosure, rate-limit/error normalization, and reduced motion. The production route remains disabled and non-streaming, so no provider request or live-stream claim was made; normalized provider streaming remains task 6.26.

## Observatory live shell — desktop QA — 2026-07-23

### Approved scope — 1440×900 desktop only

- A temporary local route supplied schema-valid repository-only GLTF doubles to the production progressive-loading owner; it was removed before the final build and introduced no public model, provider request, or shipped QA route.
- Full and Reduced each reached `Interactive Observatory ready` with one 1425×900 Canvas at DPR 1. Document client and scroll widths both measured 1425px, and the visual shell retained the semantic header, editorial identity and CTAs, CC AI anchor, and Selected Systems transition without a blank viewport.
- The first visual pass found camera-facing walnut ribs/beams occupying the observatory opening. Moving structural repetitions to a protected rear arc cleared the foreground while retaining the plaster cutaway, oculus, basin, windows, and locked natural palette.
- The public `/` route remained intentionally poster-only with zero canvases and `Poster mode · immersive assets awaiting approval`; the rights-gated robot contract was not bypassed in production.

### Interaction, failure, and shader checks

- ASTRAEA’s 44px DOM focus control selected the matching scene/camera state, wrote `?focus=astraea`, changed to `Return to overview`, announced the focused state, and restored the overview URL on return.
- Exact hero-critical failure left the poster exposed, set the Canvas layer to `aria-hidden="true"`, and reported `Poster mode · interactive scene could not be prepared`.
- Full quality initially produced a real WebGL shader error because the water vertex shader declared the reserved identifier `active`. Renaming the value to `rippleActive` and adding a regression assertion produced a clean fresh-tab compile; Reduced remained a still surface.
- Fresh-tab browser diagnostics contained no page or shader error. The only warning was the existing upstream `THREE.Clock` deprecation already tracked by task 8.25.
- Active screenshots were inspected for Full, Reduced, focus, exact failure, and the production poster gate. No deterministic visual baseline was created; mobile/touch, water pointer/robot impulses, pause/visibility behavior, audio, game-bot playtesting, and renderer draw/triangle counters were outside this approved pass.
- After deleting the temporary QA route, `pnpm verify` passed formatting, zero-warning lint, strict types, all 170 tests, content/palette/server/asset gates, all 13 production routes, and the post-build scan over 12 manifest assets, zero public GLBs, 25 client files, and one semantic poster fallback.

## Observatory live shell — mobile QA — 2026-07-23

### Approved scope — 390×844 mobile only

- A temporary repository-only route supplied the same schema-valid in-memory GLTF doubles to the production progressive-loading owner. It was removed before the final build; the production registry and robot rights gate were not changed.
- Auto selected Reduced and rendered one nonblank 375×212 Canvas at DPR 1. The document client and scroll widths both measured 375px, so the 390px viewport had no horizontal overflow.
- The two hero actions and Experience summary each measured 343×44px. ASTRAEA’s scene destination measured 192×44px and successfully opened `/work/astraea`; the compact design intentionally omits the Canvas camera-focus button.
- Poster mode removed Canvas and retained the optimized poster. Exact critical failure kept one Canvas layer `aria-hidden="true"`, exposed the poster, and showed the honest failure status. The public `/` route rendered zero canvases and `Poster mode · immersive assets awaiting approval`.

### Issues fixed and diagnostics

- The first pass measured ASTRAEA at x=143–359 and the fixed CC AI trigger at x=228.7–359, producing a 17.9px vertical overlap over the only mobile scene link. ASTRAEA now occupies x=16–208 and remains separated from CC AI by 20.7px.
- The 44px status badge was clipped at y=433.9–477.9, 128px above the scene beginning at y=561.9. It now sits visibly at y=577.9–621.9 inside the 212px scene.
- A fresh Reduced tab contained no page or shader error. The only warning was the existing upstream `THREE.Clock` deprecation tracked by task 8.25.
- Active screenshots covered Reduced, Poster, exact failure, and the production poster gate. No deterministic visual baseline, orientation matrix, water pointer/robot impulse, renderer call/triangle profile, audio check, or game bot was run.
- After removing the temporary QA route and resetting the viewport, `pnpm verify` passed formatting, zero-warning lint, strict types, all 170 tests, content/palette/server/asset gates, the 13-route production build, and the post-build scan over 12 manifest assets, zero public GLBs, 25 client files, and one semantic poster fallback.
