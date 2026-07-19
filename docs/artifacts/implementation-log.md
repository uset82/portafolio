# Implementation log

Date: 2026-07-19  
Slice: semantic poster-first foundation

## Implemented

- Shared semantic shell with skip link, CC identity, desktop/mobile navigation, active routes, footer, and contact path.
- Approved home copy and layered Observatory poster composition.
- Real DOM Selected Systems links for ASTRAEA, PINÁCULO, and Future Energy.
- Responsive route shells for Work, Laboratory, Sound, Cosmos, Story, Contact, three named system pages, and 404 recovery.
- Locked natural palette and typography/layout/motion tokens.
- Motion root configured with `reducedMotion="user"`; adapted Animate UI button primitive; reading-order entrance.
- Honest CC AI panel and mobile sheet with disabled service state—no fake model response and no client key.
- Editorial Laboratory, Sound, Story/Cosmos, and footer continuation below the first viewport.
- Next.js image optimization and bundled font pipeline.
- Strict runtime schemas for projects, media, experience, education, trips, hobbies, links, sources, metadata, and the planning inventory.
- A 26-entry content inventory that names every known gap, fallback, rights state, owner, and launch impact without publishing unverified facts.
- Server-parsed homepage identity, actions, navigation, and Selected Systems records; reference projects remain unpublished concepts.
- Automated content and palette contract checks, including deliberate invalid fixtures and forbidden-color sentinels.
- Shared DOM/Three.js palette constants covering 30 approved colors and 11 future material roles.
- Responsive container, section, stack, cluster, 12/8/4-column grid, media-frame, prose, and visually-hidden layout primitives.
- Typed action link/button, editorial heading, status tag, optimized image frame, and editorial link-row primitives using the approved palette and interaction states.
- Homepage actions, Observatory poster, Selected Systems links, route headings, and concept status now exercise the shared UI primitives rather than duplicating markup.
- Native audio/video foundation with manual mute-first playback, no preload, required video posters, optional caption tracks, transcripts, visible credits/rights, and adjacent error recovery.
- External provider foundation that creates no iframe before explicit consent, then uses a lazy named sandboxed frame with a persistent privacy notice, load status, retry state, and approved external fallback.
- Sound route source-readiness ledger that truthfully shows the publication requirements while approved tracks, posters, captions, transcripts, and provider URLs remain unavailable.
- Four Node baseline tests covering the approved content set, video accessibility failures, autoplay embed rejection, and the Sound route's semantic no-media fallback.
- Pull-request verification workflow with pinned Node/pnpm, frozen-lockfile installation, pnpm download caching, concurrency cancellation, read-only repository permissions, and the complete `pnpm verify` gate.
- Exact `@openrouter/sdk` 0.13.65 dependency with a lazy `server-only` factory, required-key failure, normalized HTTP referrer, approved CC AI app title, unsafe-URL rejection, and no debug logger.
- Mockable OpenRouter construction plus four focused configuration/factory tests and an automated source-boundary check that rejects runtime/key use in client components.
- Disabled-by-default `POST /api/cc-ai` route with strict JSON/history/locale validation, server request IDs, no-store responses, explicit non-streaming behavior, disconnect/timeout aborts, provider token and response-character caps, and requested/responding model disclosure.
- Provider-neutral CC AI service and OpenRouter chat adapter with safe 402/429/configuration/timeout/abort/provider/invalid-response normalization; tests use only deterministic providers and no message bodies or raw SDK errors are logged.
- Server-configured CC AI model policy with a variable `openrouter/free` prototype default, named override, deduplicated ordered fallback sequence, actual responding-model metadata, and a fail-closed paid production switch.
- OpenRouter request routing constrained to zero-data-retention endpoints that deny provider data collection; provider fallback remains available only within those privacy filters.
- Same-origin CC AI request guard with Origin/Referer and Fetch Metadata validation, trusted hosting IP plus server-issued HttpOnly session limits, one-active-request-per-session and process concurrency ceilings, bounded state, `Retry-After`, and distinct forbidden/rate/busy responses.
- Provider work remains single-attempt: model/provider fallback occurs inside one bounded OpenRouter request, while visitor retries are explicit and pass through the local limit guard.
- Public-only CC AI knowledge builder over the validated content model: factual approval, publication, rights, and all-public-source gates exclude private/design-only/held records without reading provenance files.
- Deterministic whole-record JSON context capped at 8,000 characters, traceable public source IDs, response knowledge metadata, status-preservation rules, prompt-injection boundary, and an exact honest-unknown instruction. The current approved context correctly contains zero facts.
- Clean-checkout foundation proof for exact commit `71368ad`: frozen-lockfile install, all 40 tests and standard checks, 13-page production build, desktop/mobile production inspection, overflow/image/console checks, and the mobile navigation keyboard path.

## Intentionally deferred

- Three.js/R3F canvas and production 3D assets.
- Live CC AI activation, user-approved public knowledge records, optional normalized streaming, and a durable shared limiter if production uses multiple function instances.
- Unverified project, CV, music, video, travel, social, email, and metrics content.
- Expanded accessibility/end-to-end coverage, the first clean CI run, deployment, and release work.
