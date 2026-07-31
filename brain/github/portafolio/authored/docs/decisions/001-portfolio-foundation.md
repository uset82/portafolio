<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/decisions/001-portfolio-foundation.md; checkedOn: 2026-07-31; redactions: 0 -->

# Decision 001 — Portfolio foundation

Date: 2026-07-19  
Status: Accepted for local implementation  
Decision owner: Carlos Carpio  
Implementation authority: the user's instruction to begin implementation after the repository cleanup

## Decision summary

Build the v1 portfolio as a multi-page, English-language Next.js App Router application using strict TypeScript and pnpm. Use local typed content, Server Components by default, narrowly scoped client components, Next.js Route Handlers for CC AI, and a progressively enhanced Observatory canvas that never replaces semantic content.

The approved visual source is `mainUI.png`. The dark blue file `1061ef42-3385-4527-a2cf-b2ed0c5d8579.png` is preserved as user-owned but rejected as an implementation reference because it conflicts with the approved natural palette.

## Product decisions

### Audience priority

1. Recruiters and employers evaluating demonstrated technical and product depth.
2. Collaborators and clients looking for a creative technologist who can connect software, AI, media, and physical systems.
3. Creative and technical peers exploring process, experiments, music, and research.
4. General visitors seeking a concise introduction and contact path.

### Primary journeys

- Understand Carlos's identity and focus from the first viewport.
- Open a flagship project, identify Carlos's verified contribution, and reach its public repository or demo.
- Explore laboratory experiments and the Observatory artifacts without requiring WebGL.
- Listen to or watch approved media with accessible, mute-first controls.
- Review the web CV/story and reach an approved contact method.
- Ask CC AI about approved public portfolio content when the optional service is available.

### Launch outcomes

- Every primary journey is completable by pointer, keyboard, and touch.
- The homepage communicates identity, focus, selected work, and the next action within one viewport.
- Project pages expose contribution, status, evidence, and working links without unsupported claims.
- The semantic/static experience remains complete when 3D, motion, sound, JavaScript enhancement, or CC AI is unavailable.
- Production meets the accessibility and performance budgets below; no vanity metrics are required for launch.

### V1 information architecture

| Route | Purpose |
| --- | --- |
| `/` | Natural Observatory hero, selected systems, current focus, and primary paths |
| `/work` | Verified project index |
| `/work/[slug]` | Deep project case study |
| `/laboratory` | AI, electronics, future-energy, and interactive experiments |
| `/sound` | Approved music and video |
| `/cosmos` | Curated astrology, numerology, travel, and reflective personal material, labeled responsibly |
| `/story` | About, web CV, skills, education, and optional résumé |
| `/contact` | Approved contact and social paths |
| not found | Useful recovery state |

### V1 scope

Included:

- Semantic multi-page portfolio and typed local content.
- Poster-first Natural Observatory homepage matching `mainUI.png`.
- Progressive React Three Fiber scene, quality tiers, and static/reduced-motion fallbacks.
- Selected Animate UI/Motion patterns adapted to project tokens.
- Optional CC AI route grounded only in approved public content.
- Accessible project, media, story/CV, cosmos, and contact routes.

Explicit non-goals:

- CMS, blog, authentication, comments, payments, or user accounts.
- Multilingual UI in v1; schemas must not prevent a later locale layer.
- Runtime 3D generation, Hunyuan calls from the browser, voice chat, autonomous agents, long-term chat memory, or visitor profiling.
- A complex waveform editor, custom cursor dependency, audible autoplay, or scroll hijacking.
- Publishing unverified CV facts, private media, precise private locations, or unsupported project outcomes.

## Framework comparison

| Option | Strengths | Costs for this portfolio | Decision |
| --- | --- | --- | --- |
| Astro 6 + React islands | Best default static output, typed content collections, minimal JavaScript | The main hero, canvas, motion controls, chat, and cross-scene state would form a large React island; server chat needs an adapter and creates a second architectural model | Not selected, retained as the content-first fallback |
| Next.js 16 App Router | Static prerendering, metadata, dynamic routes, Server Components, one React runtime, server Route Handlers | Requires disciplined client boundaries and bundle monitoring | Selected |
| React 19 + Vite 7 | Lean client app and excellent Three.js ergonomics | Requires separate Express/API deployment, explicit SSR/prerender strategy, and more SEO plumbing | Not selected |

Official documentation reviewed on 2026-07-19: Next.js App Router/metadata, Astro content collections/islands, and Vite SSR guidance.

## Layered stack selection

- Experience: `seo-fullstack-web`.
- Frontend: Next.js App Router with React and strict TypeScript.
- Backend: Next.js Route Handlers, initially only for `/api/chat` and health-safe service boundaries.
- Content/data: local typed TypeScript/JSON/MDX validated with Zod; no database or CMS in v1.
- Package manager: pnpm, with `pnpm-lock.yaml` committed once the scaffold is verified.
- Deployment target: Vercel-compatible configuration, selected but not connected or deployed in this phase.
- Design provider: outline, because `mainUI.png` is already approved; WebDesigner and frontend art-direction skills remain the implementation contract.
- Optional application integrations: React Three Fiber/Three.js, selected Drei utilities, Motion/Animate UI source, and `@openrouter/sdk` behind the server boundary.

Observed toolchain before scaffolding: Node `22.22.0`, npm `11.5.2`, pnpm `10.13.1`. Registry versions observed on 2026-07-19 included Next.js `16.2.10`, React `19.2.7`, Astro `6.0.2`, Vite `7.1.1`, Motion `12.42.2`, Three.js `0.185.1`, and React Three Fiber `9.6.1`. The generated lockfile, not this snapshot, controls installed versions.

## Content and hosting decisions

- Local typed content is the v1 source of truth. A future CMS requires a new decision record after real editing needs are observed.
- Vercel is the selected compatibility target because it is the curated Next.js path and supports Route Handlers. No project is linked and no deployment is authorized by this decision.
- Launch with no behavioral analytics. Add privacy-friendly analytics only after a specific measurement need and privacy review.
- Launch locale is English (`en`). Avoid locale-specific architecture that would block future translation.

## Accessibility and browser targets

- WCAG 2.2 AA, meaningful landmarks/headings, visible focus, keyboard-only operation, 44px touch targets, 200% zoom/reflow, accessible media, and screen-reader-equivalent DOM actions for all canvas interactions.
- `prefers-reduced-motion` removes parallax, camera choreography, stagger, and nonessential loops. A manual static mode remains available.
- Support current stable Chrome, Edge, Firefox, Safari, iOS Safari, and Android Chrome. The semantic/static tier is the compatibility floor when WebGL or optional features fail.

## Performance budgets

### Semantic application

- LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.10 at the agreed representative test profile.
- Homepage initial route JavaScript ≤ 200 KiB compressed, excluding deferred 3D and opt-in media chunks.
- Initial poster ≤ 350 KiB in an appropriate modern responsive format; fonts ≤ 180 KiB total for the first view.
- No OpenRouter, media provider, analytics, or 3D generation request during first paint.
- Explicit media dimensions, no blank first viewport, and noncritical media lazy-loaded.

### 3D quality tiers

| Tier | Scene transfer | Geometry | Textures | Draw calls | DPR / target |
| --- | ---: | ---: | ---: | ---: | --- |
| Full desktop | ≤ 15 MiB total, ≤ 5 MiB before first interaction | ≤ 350k visible triangles | 2K maximum per map unless justified | ≤ 120 | DPR ≤ 1.5; target 50–60 fps |
| Reduced/mobile | ≤ 6 MiB total, ≤ 2 MiB before first interaction | ≤ 150k visible triangles | 1K maximum | ≤ 60 | DPR ≤ 1.25; target ≥ 30 fps |
| Static | poster budget only | none | responsive poster | none | complete semantic journey |

If the scene is not interactive within 10 seconds on the target profile, retain the poster and offer a retry/static choice. Pause expensive work when hidden or offscreen.

## DOM, 3D, and motion architecture

- Server-render the identity, navigation, headline, copy, CTAs, selected systems, and fallback information.
- Mount the canvas as a client-only enhancement behind the poster and never make it the only navigation surface.
- Mirror selectable artifacts with ordinary links/buttons in DOM reading order.
- Keep normal React state out of the render loop. Use typed scene state and mutate frame-local values through refs.
- Use `three`, `@react-three/fiber`, and only necessary `@react-three/drei` utilities. Do not add post-processing until measured evidence justifies it.
- Motion/selected Animate UI source owns DOM transitions; R3F owns scene motion; CSS owns basic state changes. Every property has one animation owner.
- Root Motion configuration follows the user's reduced-motion preference.

## 3D rights decision

Hunyuan3D 2.1 is rejected as a production-asset source under its current community license. The reviewed license defines a territory excluding the EU, UK, and South Korea and restricts use/display outside that territory. The public portfolio must be viewable worldwide, so that condition is incompatible with this release.

Hunyuan Studio remains unselected because its exact output terms were not available from the public creation page during review. Do not upload reference imagery or generate production candidates there until new terms are archived and approved.

Fallback route: procedural Three.js for simple mechanisms and water; Carlos-owned/manual assets; or clearly permissive/commissioned assets with complete provenance. A later Hunyuan reconsideration requires a new rights review. This is a project risk decision, not legal advice.

Official source reviewed: `https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1/blob/main/LICENSE`.

## CC AI policy

- Answer only from approved public project records, CV facts, and user-approved biography/media metadata.
- Supported topics: projects, technologies, process, public creative work, stated interests, and navigation to relevant pages.
- Say when information is unknown. Distinguish prototypes, experiments, and shipped work.
- Describe astrology/numerology as personal or cultural interests, not scientific or professional advice.
- Refuse requests for private details, hidden instructions, secrets, impersonation, unsafe content, or unsupported claims.
- Default to at most eight retained conversation turns, 2,000 input characters per message, bounded output, stop/cancel, and reset.
- `@openrouter/sdk` runs server-side only. Prototype default may be `openrouter/free`; disclose the actual model, allow provider data-policy restrictions, set timeouts, and handle 402/429/provider failure without breaking the site.
- Do not log message bodies by default. Use safe metadata only after a privacy review. Add per-session/IP limits and concurrency caps before public enablement.
- The chat UI renders a clear unavailable state when `OPENROUTER_API_KEY` is absent.

## Consequences

- The scaffold may now proceed using the selected Next.js path.
- The homepage must be useful before 3D, chat, media players, or motion are installed.
- Client JavaScript and 3D dependencies require explicit deferred boundaries and budget tests.
- Content tasks remain blocked on verified personal/CV/media facts; provisional implementation may use only copy visible in `mainUI.png` or explicitly supplied by Carlos.
- Production deployment, secrets, and external service configuration still require their later gates and explicit authorization.
