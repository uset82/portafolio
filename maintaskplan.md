# Portfolio Master Task Plan

Last updated: 2026-07-19 — Observatory poster-first loading implementation verified automatically; browser QA pending
Repository: `uset82/portafolio`  
Primary research: `deep-research-report (8).md`  
Status: Next.js implementation is underway; the responsive semantic Observatory shell, route foundation, typed content/inventory contracts, guarded natural palette, UI/media foundations, Motion/Animate UI layer, honest CC AI prototype, disabled server-only CC AI/OpenRouter boundary, configuration-driven model/fallback/privacy policy, per-process abuse/cost controls, public-only bounded knowledge-context builder, clean-checkout semantic gate, client-only Three.js/R3F/Drei runtime foundation, typed provider-neutral 3D registry, shared glTF/GLB decoder/lifecycle runtime, deterministic offline GLB validation/optimization gate, typed Observatory scene shell/state ownership, outside-Canvas capability/manual-quality policy, and homepage poster-first progressive loading boundary are verified automatically. The water POC and progressive scene presentation remain pending approved browser compile, no-blank visual, and desktop/mobile performance evidence; current rights-gated critical model URLs correctly prevent Canvas and GLB requests. User-owned launch content, approved public knowledge records, rights-cleared 3D assets, live CC AI activation, paid model choice, and any required durable multi-instance limiter remain pending.

## How this plan must be maintained

- Every atomic task begins with a dual marker that remains visible in raw text and renders as a Markdown task checkbox.
- `[ ] ☐` means incomplete, blocked, awaiting a decision, or not yet verified.
- `[x] ☑` means the acceptance condition was satisfied and evidence was recorded.
- Work from the earliest ready unchecked task unless the user explicitly reprioritizes.
- A task is ready only when every dependency named for its phase is checked.
- When a task is completed, change its exact marker from `[ ] ☐` to `[x] ☑` and add one dated row to the completion log.
- Keep partial work unchecked. Add `Status:` and the exact blocker beneath the task.
- Add discoveries as new uniquely numbered `- [ ] ☐` tasks; never hide new scope inside an existing checkbox.
- Do not mark a parent gate or phase complete while a required child task is unchecked.

## Project outcome

Launch a modern, responsive personal portfolio that presents Carlos as a creative technologist across software, AI systems, interactive tools, music/video, CV experience, travel, astrology, numerology, future energy, and electronics.

The approved homepage direction is **The Submerged Earth Observatory**: a warm, natural, Taurus-inspired editorial interface layered over an interactive Three.js world. The experience centers on a contemplative robot touching reflective water and includes the Sound Lab, ASTRAEA, PINÁCULO, future-energy, electronics/AI, a drone, and an integrated **CC AI** chat assistant.

The implementation must remain highly legible, fast, accessible, maintainable, and honest. The 3D experience is an enhancement over semantic HTML—not a replacement for content, navigation, or accessibility.

## Approved experience architecture

- **DOM first:** headings, navigation, CTAs, project summaries, chat controls, and fallback content remain semantic HTML.
- **Interactive canvas:** Three.js through React Three Fiber renders the observatory, robot, water, artifacts, camera transitions, and pointer interactions.
- **3D authoring:** the asset pipeline is provider-neutral. Hunyuan 3D Studio or open-source Hunyuan3D 2.1 may be evaluated only after the exact service/model terms permit the intended generation location and worldwide public display. The current Hunyuan3D 2.1 community license excludes the EU, UK, and South Korea from its territory and restricts use/display outside that territory, so no Hunyuan-derived production asset may ship while task 1.27 is unresolved. Original authored, procedural, user-owned, or permissively licensed assets remain valid fallbacks.
- **Asset delivery:** production assets use glTF/GLB with explicit material, texture, animation, LOD, and compression budgets. Draco/meshopt geometry and KTX2/Basis textures are evaluated rather than applied blindly.
- **UI motion:** selected Animate UI open-code components and Motion handle purposeful DOM transitions. They must be copied selectively, restyled to this project, and reviewed rather than treated as a blanket visual library. Three.js/R3F owns scene motion. The two systems must not animate the same property.
- **CC AI:** `@openrouter/sdk` is called only from a server-side route. `openrouter/free` is a low-volume prototype option, not a production reliability promise; the actual responding model must be disclosed, provider data policies must be constrained, and availability, rate limits, latency, and answer quality are treated as variable.
- **Design references:** Refero Styles is used for research and implementation-facing `DESIGN.md` references, never for cloning another product.
- **Fallback tiers:** full 3D, reduced-quality 3D, static hero, and reduced-motion experiences must preserve the same information and primary actions.

## Current approved visual reference

The latest approved reference is the bright natural observatory composition with:

- warm off-white, buff, taupe, sage, walnut, pewter, and reflective-water tones;
- a contemplative pale-ceramic robot touching water;
- ASTRAEA, PINÁCULO, Sound Lab, future-energy, electronics/AI, and drone artifacts;
- a semantic editorial hero on the left;
- an integrated CC AI chatbox on the lower right;
- a narrow `SELECTED SYSTEMS` preview below the hero.

The reference is a composition target, not a literal raster background for the final desktop experience.

Repository source of truth: `mainUI.png`, 1672×941 pixels, SHA-256 `B4E11D325297CEB8FFB021866FFA2903B316D5D2443DEF67BA890B4B3F3058BF`. If this file changes intentionally, update the hash, palette samples, prompt, and visual-regression baseline together.

## Approved natural palette — implementation color lock

The final DOM interface, Three.js scene, PBR materials, water, overlays, chatbox, loading states, and static fallbacks must use the same warm natural family shown in the approved reference and palette images.

This is a **locked implementation contract**, not a loose mood-board suggestion. Framework defaults, component-library defaults, generated 3D textures, HDR environments, post-processing, and AI-generated assets must not introduce blue, cyan, violet, neon, or excessively dark substitutions.

### Source swatches and semantic natural palette

The `--swatch-*` colors below are sampled directly from the two supplied solid-color palette references. The `--scene-*` values are representative dominant anchors sampled from `mainUI.png`. Semantic `--color-*` tokens are the implementation API. This separates source evidence from role-based design decisions and prevents quiet palette drift.

```css
:root {
  /* Supplied palette references: exact solid fills */
  --swatch-taupe: #A38772;
  --swatch-sage-stone: #C1BFB0;
  --swatch-sage-muted: #B1B199;
  --swatch-sand: #ECDFCF;
  --swatch-warm-ivory: #FEF4EA;
  --swatch-clay: #CFA18A;
  --swatch-sage-pale: #CCCAB5;
  --swatch-off-white: #E5DFD3;
  --swatch-sage-dark: #77715B;
  --swatch-taupe-warm: #BE967D;
  --swatch-buff: #DCC1AC;
  --swatch-dusty-pink: #E8BDB4;

  /* mainUI.png: representative dominant scene anchors */
  --scene-parchment: #E8DFD5;
  --scene-stone: #AEA090;
  --scene-taupe: #9D8A73;
  --scene-sand: #C9B49E;
  --scene-linen: #D7C7B5;
  --scene-shadow-sage: #6F6655;
  --scene-oak: #8B755D;
  --scene-walnut: #5F4B35;
  --scene-espresso: #2E2417;
  --scene-deep-wood: #4B3520;

  /* Semantic implementation roles */
  --color-canvas: var(--scene-parchment);
  --color-canvas-soft: var(--swatch-warm-ivory);
  --color-linen: var(--swatch-sand);
  --color-buff: var(--swatch-buff);
  --color-off-white: var(--swatch-off-white);
  --color-sage-light: var(--swatch-sage-stone);
  --color-sage-muted: var(--swatch-sage-muted);
  --color-sage-pale: var(--swatch-sage-pale);
  --color-sage-dark: var(--swatch-sage-dark);
  --color-moss: #69705A;

  --color-taupe: var(--swatch-taupe);
  --color-taupe-warm: var(--swatch-taupe-warm);
  --color-clay: var(--swatch-clay);
  --color-dusty-pink: var(--swatch-dusty-pink);
  --color-oak: var(--scene-oak);
  --color-walnut: var(--scene-walnut);
  --color-espresso: var(--scene-espresso);
  --color-deep-espresso: #2A1D16;

  --color-water-slate: #5B6965;
  --color-water-light: #87918A;
  --color-pewter: #9B9D96;
  --color-silver: #C8C7BE;

  --color-text-primary: #2A1D16;
  --color-text-secondary: #6E5B4D;
  --color-text-on-dark: var(--swatch-warm-ivory);
  --color-border-soft: #CDB69E;
  --color-focus: var(--swatch-sage-dark);
}
```

Required checked contrast pairs for normal-size text:

| Pair | Contrast | Use |
| --- | ---: | --- |
| `#2A1D16` on `#E8DFD5` | 12.40:1 | Primary text on the page canvas |
| `#6E5B4D` on `#E8DFD5` | 4.88:1 | Secondary text on the page canvas |
| `#2A1D16` on `#A38772` | 4.87:1 | Taupe control with dark text |
| `#FEF4EA` on `#5F4B35` | 7.60:1 | Walnut control with warm-ivory text |
| `#77715B` on `#FEF4EA` | 4.50:1 | Dark-sage text or strong focus treatment on ivory |

Do not place normal-size warm-ivory text on taupe `#A38772`; that pairing does not meet 4.5:1. Taupe controls use deep-espresso text, while warm-ivory text is reserved for walnut or darker surfaces. Recheck every real rendered pairing, including translucent panels over the live canvas.

### Required visual distribution

- 30% warm off-white, parchment, and linen;
- 20% buff, sand, and pale taupe;
- 18% light sage and stone sage;
- 12% aged oak and walnut;
- 10% reflective water, pewter, and silver;
- 7% espresso for structure and readable dark text;
- 3% clay taupe or dusty pink for restrained warmth.

### Component role mapping

| UI / scene role | Approved colors |
| --- | --- |
| Page canvas and left editorial field | `--color-canvas`, `--color-canvas-soft`, `--color-off-white` |
| Primary text | `--color-text-primary` |
| Secondary text and metadata | `--color-text-secondary` |
| Primary CTA | `--color-walnut` with `--color-text-on-dark`, or `--color-taupe` with `--color-text-primary` |
| Secondary CTA and active navigation | `--color-sage-dark`, `--color-taupe` |
| CC AI panel | translucent taupe/sage surface using `--color-taupe`, `--color-sage-light`, and `--color-off-white` |
| Focus rings | `--color-focus` with a visible high-contrast outer offset |
| Observatory architecture | oak, walnut, linen plaster, soft stone, and pewter |
| Robot shell | off-white ceramic, linen stone, graphite joints, walnut details |
| Water | slate-sage and silver reflections; never cyan or tropical blue |
| ASTRAEA | off-white, parchment, pewter, walnut, and muted sage |
| PINÁCULO | walnut, clay taupe, buff, espresso engraving |
| Sound Lab | walnut, buff, graphite, pewter, restrained sage |
| Future-energy liquids | sage mineral, smoky olive, tea brown, translucent graphite |
| Loading and static fallback poster | the same palette and exposure as the approved hero |

### Non-negotiable color constraints

- Do not introduce cyan, turquoise, electric blue, violet, neon purple, bright orange, or rainbow gradients.
- Do not convert the approved palette into an almost-black dark mode.
- Espresso and deep espresso are limited to text, joints, recesses, small framing elements, and controlled shadows.
- Important content and objects must remain visible without crushed blacks.
- Generated Hunyuan textures must be recolored or rejected when they do not match this palette.
- HDRI and post-processing must preserve warm neutral whites and sage water rather than shifting the scene toward blue.
- The CC AI chatbox, navigation, buttons, cards, loaders, and focus states must use the same token system as the 3D scene.
- The approved reference screenshot must be used as a visual-regression baseline for palette, exposure, material warmth, and overall light balance.

### Color-management implementation requirements

- Use sRGB output for interface colors and correctly tagged base-color/emissive textures.
- Treat normal, roughness, metallic, and AO maps as non-color data.
- Validate Three.js renderer color space and tone mapping against the approved screenshot.
- Avoid post-processing presets that materially alter the approved palette.
- Compare the DOM, static poster, and live canvas side by side at desktop and mobile breakpoints.
- Record intentional deviations in `DESIGN.md`; unrecorded palette drift is a defect.

## Planned information architecture

- Modular homepage with identity, selected work, media, profile, and contact paths.
- Project index with clear categories and deep case-study pages.
- Dedicated music/video experience with accessible, lazy-loaded media.
- About/CV page with a web-first timeline and optional downloadable résumé.
- Curated trips/hobbies section with meaningful captions and privacy review.
- Contact and social links without exposing private data.

This is the research-backed starting point. Phase 1 must confirm or revise it before implementation.

## Phase overview

| Phase | Gate | Exit condition |
| --- | --- | --- |
| 0. Codex and repository setup | Setup gate | Instructions, skills, plugin, rules, and repository state are verified |
| 1. Product and architecture | Decision gate | Audience, scope, IA, stack, content source, budgets, and hosting are approved |
| 2. Content and asset inventory | Content gate | Launch content is verified, rights-cleared, modeled, and gaps are explicit |
| 3. Design system, 3D UX, and interaction | Design gate | Approved design brief, observatory scene specification, chat UX, tokens, responsive states, and motion plan exist |
| 4. Technical foundation and immersive scaffold | Build gate | Chosen stack builds; DOM, Three.js, Animate UI, OpenRouter, asset loaders, routes, schemas, and fallbacks are ready |
| 5. Core pages, case studies, and immersive homepage | MVP gate | All launch pages work and the semantic/3D homepage journey is functional across quality tiers |
| 6. 3D assets, media, motion, and CC AI | Experience gate | Rights-cleared authored/generated assets, water, animation, media, and chat are accessible, performant, secure, and purposeful |
| 7. Quality, accessibility, security, SEO | Release-candidate gate | Full QA matrix and release checks pass with no critical issue |
| 8. Deployment and launch | Production gate | Preview approved, production deployed, verified, and recoverable |
| 9. Handoff and iteration | Maintenance gate | Documentation, backlog, and update workflow are complete |

---

## Phase 0 — Codex and repository setup

Dependencies: none.  
Exit criteria: tasks 0.1–0.12, 0.14, and 0.15 are checked. Task 0.13 requires separate publishing authorization and is not required to begin product decisions locally.

- [x] ☑ **0.1 — Audit the research and crashed-run artifacts.**  
  Acceptance: the full research report and existing task-plan file are inspected; the crash point is known.
- [x] ☑ **0.2 — Inspect the GitHub repositories.**  
  Acceptance: `uset82/portafolio` and `uset82/webdesigner` metadata, default branches, and access state are verified.
- [x] ☑ **0.3 — Establish the local Git repository.**  
  Acceptance: the provided portfolio folder is a `main` Git repository with `origin` set to `https://github.com/uset82/portafolio.git`.
- [x] ☑ **0.4 — Register the official OpenAI developer-documentation MCP source.**  
  Acceptance: Codex reports `openaiDeveloperDocs` added globally.
- [x] ☑ **0.5 — Validate the WebDesigner source package.**  
  Acceptance: package verification reports 15 skills and 86 Nightglass tokens, and the bundled MCP smoke test reports five tools.
- [x] ☑ **0.6 — Install and enable WebDesigner.**  
  Acceptance: `codex plugin list` reports `webdesigner@webdesigner-repo-marketplace` installed and enabled at version `1.1.0`.
- [x] ☑ **0.7 — Create and review repository `AGENTS.md`.**  
  Acceptance: it defines the mission, instruction order, workflow roles, plan discipline, content/design/engineering constraints, verification, and Git policy without exceeding Codex's default instruction budget.
- [x] ☑ **0.8 — Create and review human-readable `rules.md`.**  
  Acceptance: task, safety, content, UX, engineering, verification, and release rules are explicit and distinguish Markdown guidance from executable rules.
- [x] ☑ **0.9 — Create and review `skills.md`.**  
  Acceptance: repo skills, WebDesigner skills, complementary skills, conditional 3D behavior, framework tension, and the execution chain are documented.
- [x] ☑ **0.10 — Create and validate repo-scoped skills.**  
  Acceptance: `.agents/skills/portfolio-delivery` and `.agents/skills/curate-portfolio-content` pass the skill validator and contain no TODO placeholders.
- [x] ☑ **0.11 — Create and validate project execution rules.**  
  Acceptance: `.codex/rules/portfolio.rules` passes positive and negative `codex execpolicy check` cases for push, force-push, hard reset, clean, PR mutation, package publication, and deployment commands.
- [x] ☑ **0.12 — Verify discovery from a fresh Codex task opened at the repository root.**  
  Acceptance: the fresh task reports the root `AGENTS.md`, both repo skills, WebDesigner 1.1.0 skills/MCP, and the project rules as available.  
- [ ] ☐ **0.13 — Create and publish the baseline setup commit.**  
  Acceptance: the user authorizes publishing; a focused commit contains the research, plan, instructions, skills, and rules; it is pushed to `origin/main` or a named setup branch.  
  Status 2026-07-19: local branch `codex/portfolio-foundation` contains focused commits `71368ad` and `37147fb`; the clean-checkout gate passed. The authorized push attempt was blocked by the repository command policy because this session has no approval channel, so the task remains open until the branch reaches GitHub.
- [x] ☑ **0.14 — Make every task checkbox visible in raw and rendered Markdown views.**  
  Acceptance: every atomic task uses `[ ] ☐` when open or `[x] ☑` when complete; no task is missing either its Markdown marker or visible box symbol.
- [x] ☑ **0.15 — Consolidate the approved immersive plan and remove superseded planning artifacts.**  
  Acceptance: `maintaskplan.md` contains the natural-palette Observatory plan, current integration research, final implementation prompt, and completion evidence; duplicate v2/v3 plan and standalone prompt files are removed; `deep-research-report (8).md` and `mainUI.png` remain as source artifacts.

---

## Phase 1 — Product, scope, and architecture decisions

Dependencies: Phase 0 setup gate.  
Exit criteria: tasks 1.1–1.27 are checked and a decision record prevents unapproved scaffolding, 3D, animation, or AI-service changes.

- [x] ☑ **1.1 — Define the primary audiences in priority order.**  
  Acceptance: recruiter/employer, collaborator/client, creative peer, and general visitor priorities are accepted or revised.
- [x] ☑ **1.2 — Define the primary user journeys.**  
  Acceptance: at minimum, view flagship work, understand Carlos's contribution, watch/listen, review CV, and make contact have concise success paths.
- [x] ☑ **1.3 — Define measurable launch outcomes.**  
  Acceptance: outcomes are observable without invented vanity metrics; examples include completed case-study views, résumé access, demo clicks, or contact actions.
- [x] ☑ **1.4 — Confirm the v1 information architecture.**  
  Acceptance: homepage, projects, project detail, media, about/CV, trips/hobbies, contact, and error routes are approved or deliberately reduced.
- [x] ☑ **1.5 — Define launch scope and explicit non-goals.**  
  Acceptance: CMS, blog, authentication, 3D, multilingual content, comments, and complex audio visualization are each in or out for v1.
- [x] ☑ **1.6 — Run the WebDesigner framework-selection workflow.**  
  Acceptance: `$framework-selector` produces a layered comparison covering experience type, frontend runtime, content/data layer, deployment, integrations, and operational cost.
- [x] ☑ **1.7 — Compare Astro, Next.js, and React/Vite against this portfolio.**  
  Acceptance: the record addresses content collections, client JavaScript, media, motion, SEO, maintainability, WebDesigner scaffold support, and future CMS options.
- [x] ☑ **1.8 — Approve the frontend stack and package manager.**  
  Acceptance: one stack and one package manager are named with rationale, alternatives, and consequences.
- [x] ☑ **1.9 — Approve the content source for v1.**  
  Acceptance: local typed content/MDX versus Sanity or another CMS is decided; authoring and migration implications are recorded.
- [x] ☑ **1.10 — Approve hosting and preview strategy.**  
  Acceptance: Netlify, Canner, Vercel, or another target is selected with preview, custom-domain, logs, rollback, and cost implications.
- [x] ☑ **1.11 — Approve analytics and privacy approach.**  
  Acceptance: provider or no-analytics choice, consent requirements, retention, and privacy-page needs are explicit.
- [x] ☑ **1.12 — Decide language and locale behavior.**  
  Acceptance: launch language, date formatting, spelling conventions, and any future multilingual path are documented.
- [x] ☑ **1.13 — Set accessibility targets.**  
  Acceptance: WCAG 2.2 AA, keyboard-only operation, 200% zoom, reduced motion, accessible media, and screen-reader expectations are explicit.
- [x] ☑ **1.14 — Set performance budgets.**  
  Acceptance: budgets exist for JavaScript, image/video behavior, fonts, layout shift, LCP/INP/CLS, and third-party requests, with measurement tools named.
- [x] ☑ **1.15 — Set browser and viewport support.**  
  Acceptance: current Chrome, Edge, Firefox, Safari, iOS Safari, Android Chrome, and representative small/medium/large viewport expectations are accepted or revised.
- [x] ☑ **1.16 — Approve the immersive homepage experience thesis.**  
  Acceptance: the user approves The Submerged Earth Observatory, the natural Taurus palette, the central robot/water composition, Sound Lab, ASTRAEA, PINÁCULO, future-energy/electronics artifacts, and the CC AI chatbox as the homepage reference.
- [x] ☑ **1.17 — Approve the DOM-plus-canvas composition.**  
  Acceptance: semantic HTML owns content and navigation; the Three.js canvas is decorative/interactive enhancement; z-index, pointer-events, focus order, hydration boundaries, and no-WebGL behavior are documented.
- [x] ☑ **1.18 — Select the React runtime for the immersive experience.**  
  Acceptance: Next.js App Router, React/Vite, or another React-compatible option is selected after evaluating server routes, static content, Netlify support, React Three Fiber, Animate UI, streaming chat, and operational cost.
- [x] ☑ **1.19 — Approve the Three.js runtime stack.**  
  Acceptance: Three.js, React Three Fiber, Drei, scene-state approach, loaders, shader strategy, and optional post-processing are named with reasons and exclusions.
- [x] ☑ **1.20 — Approve the Hunyuan 3D authoring pipeline.**  
  Acceptance: Hunyuan Studio versus local Hunyuan3D 2.1 is evaluated against an original/authored or permissively licensed fallback; source-image requirements, model/version, generation location, output formats, manual cleanup, Blender/retopology needs, attribution, provenance, and acceptance/rejection criteria are explicit; selection remains conditional on task 1.27.
- [x] ☑ **1.21 — Define 3D quality tiers and budgets.**  
  Acceptance: full, reduced, static, and reduced-motion tiers define maximum initial bytes, total scene bytes, texture resolution, triangles/draw calls, DPR, FPS targets, loader timeout, and switching rules.
- [x] ☑ **1.22 — Define the CC AI product scope.**  
  Acceptance: supported topics, public knowledge sources, refusal boundaries, non-authoritative astrology/numerology wording, out-of-scope requests, conversation length, and visitor expectations are approved.
- [x] ☑ **1.23 — Approve the OpenRouter architecture and model policy.**  
  Acceptance: server-only `@openrouter/sdk`, low-volume prototype model `openrouter/free` or a named `:free` model, actual-model disclosure, provider data-policy filtering, fallback order, timeout, retries, streaming, live rate-limit/error handling, and a paid-production escape hatch are documented without assuming a free-model SLA.
- [x] ☑ **1.24 — Approve CC AI privacy, abuse, and cost controls.**  
  Acceptance: API-key isolation, input limits, rate limits, origin checks, OpenRouter/provider logging and training policy, request-level provider restrictions, logging/redaction, retention, prompt-injection handling, unsafe-content behavior, and failure messaging are explicit.
- [x] ☑ **1.25 — Approve the UI-motion and design-reference policy.**  
  Acceptance: Animate UI/Motion owns DOM transitions, R3F owns scene animation, `MotionConfig reducedMotion="user"` is required, Refero references are recorded in `DESIGN.md`, and copied proprietary layouts/assets are prohibited.
- [x] ☑ **1.27 — Resolve the Hunyuan distribution and territory license gate.**  
  Acceptance: the exact terms governing the selected Hunyuan Studio or model version are archived and reviewed for generation in Norway and worldwide public display, including the EU, UK, and South Korea; written permission or terms clearly covering the intended use exist, or Hunyuan is rejected for production and the provider-neutral fallback is selected. No Hunyuan-derived output enters the public asset pipeline before this task is checked. This is a licensing-risk review, not legal advice.
- [x] ☑ **1.26 — Write and approve the architecture/product decision record.**  
  Acceptance: `docs/decisions/001-portfolio-foundation.md` captures tasks 1.1–1.25 and 1.27, open risks, chosen stack, immersive architecture, AI service policy, 3D rights decision, budgets, and explicit permission to scaffold.

---

## Phase 2 — Content and asset inventory

Dependencies: tasks 1.1–1.5 and 1.9.  
Exit criteria: verified launch content, public CC AI knowledge, and production-ready 2D/3D asset specifications exist, or every missing user-owned item is listed as a blocking gap.

- [x] ☑ **2.1 — Define the structured content schemas.**  
  Acceptance: project, media work, experience, education, trip, hobby, link, and site metadata fields are typed and documented.
- [x] ☑ **2.2 — Create a content inventory ledger.**  
  Acceptance: each planned content item has owner, source, verification state, rights state, missing fields, and launch priority.
- [ ] ☐ **2.3 — Verify Carlos's public profile facts.**  
  Acceptance: approved name, role/title, location granularity, short bio, long bio, email/contact path, and social links are user-confirmed.
- [ ] ☐ **2.4 — Collect and review CV source material.**  
  Acceptance: experience, education, skills, dates, links, and downloadable résumé status are confirmed without invented details.
- [ ] ☐ **2.5 — Select launch flagship projects.**  
  Acceptance: 3–5 projects have approved order and rationale; expected candidates are StrudelAI, avatar-studio, iFoundYou, OpenNemoClaw, and WebDesigner.
- [ ] ☐ **2.6 — Curate the StrudelAI case-study source pack.**  
  Acceptance: repository, live demos, screenshots/media, contribution, status, stack, constraints, outcome evidence, and rights are verified.
- [ ] ☐ **2.7 — Curate the avatar-studio case-study source pack.**  
  Acceptance: architecture/process evidence is collected and all non-public artwork, `.blend`, GLB, or workspace preview exclusions are respected.
- [ ] ☐ **2.8 — Curate the iFoundYou case-study source pack.**  
  Acceptance: product concept, privacy model, location/community behavior, stack, prototype status, and visuals are accurately separated from future intent.
- [ ] ☐ **2.9 — Curate the OpenNemoClaw case-study source pack.**  
  Acceptance: sandboxing, packages/blueprints, technical audience, contribution, and current project status are verified.
- [ ] ☐ **2.10 — Curate the WebDesigner case-study source pack.**  
  Acceptance: plugin architecture, Nightglass system, orchestration stages, skills/MCP scope, validation evidence, and Carlos's contribution are verified.
- [ ] ☐ **2.11 — Draft consistent project summaries.**  
  Acceptance: every selected project has title, tagline, category, status, summary, contribution, stack, outcome, learning, repo/demo links, and provenance notes.
- [ ] ☐ **2.12 — Verify every repository and demo link.**  
  Acceptance: links resolve, current status is recorded, broken/private demos are labeled honestly, and redirects/canonical URLs are known.
- [ ] ☐ **2.13 — Inventory reusable project images and video.**  
  Acceptance: source, owner, license/permission, dimensions, caption, alt-text intent, and optimization needs are recorded.
- [ ] ☐ **2.14 — Collect approved portrait and personal brand assets.**  
  Acceptance: portrait/headshot, signature/mark if any, preferred colors, and reuse permissions are user-confirmed; missing assets are explicit.
- [ ] ☐ **2.15 — Curate music and audio launch content.**  
  Acceptance: tracks, embeds/files, artwork, credits, rights, captions, poster/fallback data, and player requirements are approved.
- [ ] ☐ **2.16 — Curate video launch content.**  
  Acceptance: videos, hosts/files, posters, captions/transcripts, credits, privacy, rights, and lazy-load strategy inputs are ready.
- [ ] ☐ **2.17 — Curate trips and hobbies launch content.**  
  Acceptance: a small intentional set has titles, place/time granularity, captions, images, rights, alt-text intent, and a privacy review.
- [ ] ☐ **2.18 — Define contact and social content.**  
  Acceptance: preferred CTA, email behavior, form/no-form decision input, GitHub/social links, spam/privacy concerns, and availability wording are approved.
- [ ] ☐ **2.19 — Write the site-wide voice and copy guide.**  
  Acceptance: tone, first/third person, title case, punctuation, technology naming, project-status labels, and prohibited unsupported claims are documented.
- [ ] ☐ **2.20 — Review asset licensing and attribution.**  
  Acceptance: every launch asset is owned, licensed, attributed, or replaced; no ambiguous third-party material remains.
- [ ] ☐ **2.21 — Record unresolved content blockers.**  
  Acceptance: each missing user-owned fact or asset has an owner, requested action, fallback, and deadline/launch impact.
- [x] ☑ **2.22 — Archive the approved homepage reference and composition notes.**  
  Acceptance: the reference image, generation prompt, change history, palette, object positions, and non-literal implementation notes are stored under `docs/design/reference/` with provenance.
- [x] ☑ **2.23 — Create the 3D asset manifest.**  
  Acceptance: robot, drone, observatory shell, water basin, ASTRAEA, PINÁCULO, Sound Lab, flow battery, electronics/AI module, props, lights, cameras, and fallback posters each have owner, source, status, scale, animation, material, LOD, and budget fields.
- [ ] ☐ **2.24 — Create provider-neutral 3D reference packs.**  
  Acceptance: every planned asset has clean concept/reference images, orthographic or multi-view guidance where possible, negative constraints, target scale, natural-palette material notes, and reproducible authoring/generation settings; Hunyuan-specific inputs are used only after task 1.27 passes.
- [ ] ☐ **2.25 — Record 3D provenance, license, and likeness risk.**  
  Acceptance: source images, author/generation service and model version, output date, license/terms snapshot, territory and display rights, required notice/attribution, third-party influence, human likeness risk, and permitted reuse are recorded for every candidate asset.
- [x] ☑ **2.26 — Define mesh and material acceptance criteria.**  
  Acceptance: topology, non-manifold geometry, normals, UVs, PBR channels, texture seams, scale, pivots, naming, rig suitability, animation clips, and visual fidelity have pass/fail rules.
- [x] ☑ **2.27 — Define asset optimization targets.**  
  Acceptance: per-asset and total budgets exist for triangles, draw calls, material count, texture dimensions, texture memory, GLB size, Draco/meshopt choice, KTX2 mode, and LOD count.
- [x] ☑ **2.28 — Inventory animation and rigging needs.**  
  Acceptance: robot idle/head/hand clips, drone hover, ASTRAEA rings, PINÁCULO mechanism, Sound Lab controls, flow-battery liquid, camera transitions, and water interactions identify authored versus procedural motion.
- [ ] ☐ **2.29 — Curate Sound Lab audio and interaction inputs.**  
  Acceptance: approved tracks/loops, BPM or amplitude data, mute default, rights, preload policy, waveform source, and fallback behavior are recorded.
- [ ] ☐ **2.30 — Build the CC AI public knowledge ledger.**  
  Acceptance: each answerable fact points to an approved public source such as project content, CV, GitHub metadata, or user-approved biography; private memories and unsupported claims are excluded.
- [ ] ☐ **2.31 — Create the CC AI evaluation set.**  
  Acceptance: representative questions, expected facts, acceptable uncertainty, refusal cases, multilingual cases, prompt-injection attempts, and source-conflict cases are documented.
- [ ] ☐ **2.32 — Approve the v1 content and asset freeze.**  
  Acceptance: all launch-required copy, knowledge records, 2D assets, and approved 3D candidates are ready, or an explicit placeholder/fallback is approved; unverified filler is absent.

---

## Phase 3 — Design system, 3D UX, chat UX, and interaction specification

Dependencies: Phase 1 decision gate and enough Phase 2 content to design with real material.  
Exit criteria: tasks 3.1–3.32 are checked and the approved design bundle can be implemented without inventing layout, scene behavior, copy hierarchy, chat states, component states, quality tiers, or motion behavior.

- [x] ☑ **3.1 — Invoke WebDesigner and frontend art-direction workflows.**  
  Acceptance: `$webdesigner-design-system` and `$frontend-skill` are used; their recommendations are reconciled with the approved brief.
- [x] ☑ **3.2 — Write the visual thesis.**  
  Acceptance: one concise direction explains mood, hierarchy, imagery, typography, color, material, and what makes the portfolio recognizably Carlos.
- [x] ☑ **3.3 — Create a reference/mood board with provenance.**  
  Acceptance: references are labeled as inspiration, not copy targets; reusable assets are separated from visual references.
- [x] ☑ **3.4 — Implement and approve the locked natural color-token system.**  
  Acceptance: the exact off-white, linen, buff, sage, taupe, clay, dusty-pink, walnut, espresso, water, pewter, and silver tokens in the approved color contract are represented as semantic design tokens; component roles and contrast pairs are documented; no blue, cyan, violet, neon, or excessively dark substitute remains.
- [x] ☑ **3.5 — Define typography.**  
  Acceptance: font sources/licenses, display/body/mono roles, responsive scale, line lengths, weights, fallback stacks, and loading strategy are approved.
- [x] ☑ **3.6 — Define grid, spacing, sizing, radius, and elevation tokens.**  
  Acceptance: values form a coherent system and avoid arbitrary per-component styling.
- [x] ☑ **3.7 — Design global navigation and footer behavior.**  
  Acceptance: desktop/mobile navigation, active state, skip link, keyboard behavior, focus management, contact path, and overflow states are specified.
- [x] ☑ **3.8 — Design the homepage composition.**  
  Acceptance: hero, selected work, media teaser, profile teaser, trips/hobbies teaser, and contact/footer form one editorial flow without overcrowding.
- [x] ☑ **3.9 — Design the project index and filters.**  
  Acceptance: grouping/filter need is justified, default view is clear, empty/no-result behavior exists, and cards/list items support keyboard and touch.
- [x] ☑ **3.10 — Design the project case-study template.**  
  Acceptance: overview, contribution, problem, constraints, approach, visuals/demo, outcome, learning, stack, links, and related work hierarchy are specified.
- [x] ☑ **3.11 — Design the media experience.**  
  Acceptance: music/video grouping, accessible controls, posters, loading states, captions/transcripts, errors, and external-host fallbacks are specified.
- [x] ☑ **3.12 — Design About/CV.**  
  Acceptance: biography, experience, skills, education, résumé CTA, personal details, and mobile timeline behavior are specified.
- [x] ☑ **3.13 — Design trips/hobbies.**  
  Acceptance: the section reads as curated personal storytelling rather than an unstructured photo dump and protects private location detail.
- [x] ☑ **3.14 — Design contact and error states.**  
  Acceptance: contact success/failure or mail-link behavior, 404, missing content, offline/failed embed, and unavailable demo states are designed.
- [x] ☑ **3.15 — Specify responsive behavior.**  
  Acceptance: small mobile, large mobile, tablet, laptop, and wide-screen layouts identify reflow, crop, stacking, type, and navigation behavior.
- [x] ☑ **3.16 — Specify interaction states.**  
  Acceptance: default, hover, focus-visible, active, disabled, loading, empty, error, and visited states exist where relevant.
- [x] ☑ **3.17 — Define the motion system.**  
  Acceptance: 2–3 site-wide motifs cover hero, section reveal, and premium media/project interaction with duration/easing and no continuous noise.
- [x] ☑ **3.18 — Define reduced-motion behavior.**  
  Acceptance: every motion motif has a no-motion or minimal-motion equivalent with identical information and functionality.
- [x] ☑ **3.19 — Produce desktop and mobile wireframes/prototypes.**  
  Acceptance: all launch page types and key states are represented using realistic content.
- [x] ☑ **3.20 — Create the implementation-facing design artifact.**  
  Acceptance: `DESIGN.md` or equivalent contains visual thesis, content plan, interaction thesis, tokens, component inventory, responsive rules, motion, and QA checklist.
- [x] ☑ **3.21 — Run the editorial/UI design review gate.**  
  Acceptance: hierarchy, originality, brand signal, accessibility, content fit, responsive composition, and implementation feasibility are approved; changes are incorporated.
- [x] ☑ **3.22 — Audit Refero styles for implementation references.**  
  Acceptance: 3–6 relevant systems are selected for specific lessons in typography, warm editorial surfaces, navigation, chat, and spacing; `DESIGN.md` records what may be learned and what must not be copied.
- [x] ☑ **3.23 — Convert the approved image into a layered composition specification.**  
  Acceptance: DOM regions, canvas bounds, safe text zones, object anchors, camera framing, responsive crops, z-index, chat placement, and bottom-section transition are documented at representative viewports.
- [x] ☑ **3.24 — Storyboard the Three.js camera and scene states.**  
  Acceptance: initial load, idle, Observatory entry, each artifact focus, back/home, scroll transition, mobile state, and error/fallback states have camera, target, duration, input, and interruption behavior.
- [x] ☑ **3.25 — Specify the artifact interaction map.**  
  Acceptance: robot, drone, ASTRAEA, PINÁCULO, Sound Lab, flow battery, electronics/AI, and water define hover/focus/tap behavior, accessible DOM equivalents, labels, project destination, and collision/occlusion rules.
- [x] ☑ **3.26 — Specify WebGL water behavior.**  
  Acceptance: reflection/refraction level, ripple sources, cursor/touch interaction, robot-hand displacement, caustics, shader complexity, visual fallback, reduced motion, and mobile simplification are approved.
- [x] ☑ **3.27 — Specify the robot and procedural motion language.**  
  Acceptance: idle stabilization, head tracking, finger movement, breathing-like mechanics, limits, interruption, loop cadence, and reduced-motion replacement are documented.
- [x] ☑ **3.28 — Specify Sound Lab interaction and audio behavior.**  
  Acceptance: controls, track selection, mute-first policy, waveform/mechanical response, keyboard/touch operation, captions/metadata, and non-audio fallback are designed.
- [x] ☑ **3.29 — Design the CC AI chat experience.**  
  Acceptance: collapsed/open states, first prompt, streaming, stop/retry, model disclosure, citations/links where available, errors, rate limit, privacy note, keyboard order, mobile sheet, and screen-reader announcements are specified.
- [x] ☑ **3.30 — Design loading and capability fallbacks.**  
  Acceptance: poster-first loading, progress, slow network, unsupported WebGL, context loss, asset failure, low-power device, reduced-data, reduced-motion, and no-JavaScript states preserve core journeys.
- [x] ☑ **3.31 — Define the cross-system animation matrix.**  
  Acceptance: each transition has one owner—CSS, Animate UI/Motion, or R3F—plus duration/easing, trigger, cancellation, reduced-motion behavior, and performance class.
- [x] ☑ **3.32 — Run the immersive design review gate.**  
  Acceptance: the observatory world, semantic overlay, chat, Sound Lab, quality tiers, mobile behavior, loading, accessibility, and implementation feasibility are approved with realistic content and assets.

---

## Phase 4 — Technical foundation, 3D runtime, animation, and AI scaffold

Dependencies: Phase 1 and Phase 3 gates.  
Exit criteria: tasks 4.1–4.36 are checked; production build and foundation checks pass; routes, schemas, semantic layout, Three.js runtime, Animate UI, OpenRouter service, loaders, and fallbacks are ready.

- [x] ☑ **4.1 — Scaffold the approved stack in the repository.**  
  Acceptance: scaffold uses the approved package manager and framework; research/instruction files remain intact; no unapproved template content remains.
- [x] ☑ **4.2 — Pin runtime and package-manager expectations.**  
  Acceptance: supported Node/runtime version, package manager version, lockfile, and setup instructions are committed.
- [x] ☑ **4.3 — Enable strict TypeScript and path conventions.**  
  Acceptance: strict checks pass and aliases/import rules are minimal and documented.
- [x] ☑ **4.4 — Configure formatting and linting.**  
  Acceptance: reproducible format/lint commands exist, ignore generated output correctly, and pass on the scaffold.
- [x] ☑ **4.5 — Define the source-directory architecture.**  
  Acceptance: pages/routes, components, layouts, content/data, styles/tokens, assets, utilities, and tests have clear ownership.
- [x] ☑ **4.6 — Implement the route shell.**  
  Acceptance: all approved routes resolve to intentional placeholders using a shared accessible layout, navigation, footer, and skip link.
- [x] ☑ **4.7 — Implement typed content schemas.**  
  Acceptance: invalid required content fails checks with actionable messages; optional and status-specific fields are correct.
- [x] ☑ **4.8 — Add validated launch content records.**  
  Acceptance: approved Phase 2 content loads through the real schema without filler claims.
- [x] ☑ **4.9 — Implement global tokens and the approved natural palette.**  
  Acceptance: the locked palette is centralized in CSS/theme tokens and applied consistently to DOM surfaces, navigation, buttons, CC AI, focus states, loading UI, static fallbacks, and Three.js material constants; automated checks reject forbidden blue/violet/neon values and unintended near-black dominance.
- [x] ☑ **4.10 — Implement shared layout primitives.**  
  Acceptance: container, section, stack/cluster/grid, media frame, prose, and visually hidden patterns cover approved compositions without excessive abstractions.
- [x] ☑ **4.11 — Implement foundational UI primitives.**  
  Acceptance: links/buttons, tags/status, headings, image/media wrappers, cards/list items only where justified, and focus states meet the design spec.
- [x] ☑ **4.12 — Configure image and font pipelines.**  
  Acceptance: responsive sources, dimensions, formats, placeholders if approved, local/hosted font loading, preload discipline, and fallbacks are working.
- [x] ☑ **4.13 — Configure media embedding foundations.**  
  Acceptance: providers/components support lazy loading, consent/privacy needs, accessible names, posters, errors, captions/transcripts, and reduced motion.
- [x] ☑ **4.14 — Add environment-variable documentation.**  
  Acceptance: `.env.example` contains safe placeholders only and every variable has purpose, required/optional state, and local/deploy instructions.
- [x] ☑ **4.15 — Create standard project scripts.**  
  Acceptance: development, build, preview, lint, format-check, type/content check, test, and full verification commands exist and are documented.
- [x] ☑ **4.16 — Add baseline tests.**  
  Acceptance: content/schema validation and at least one critical render or route test run in a clean checkout.
- [ ] ☐ **4.17 — Add continuous integration.**  
  Acceptance: pull requests run install, formatting/lint, type/content checks, tests, and production build with dependency caching that does not mask lockfile errors.
  Status 2026-07-19: `.github/workflows/verify.yml` checks out the repository, installs pinned Node/pnpm versions, restores pnpm's dependency cache, runs a frozen-lockfile install, and executes `pnpm verify`. Local clean-checkout evidence passes, but the command-policy-blocked branch push prevents a pull-request run; the task remains open until GitHub Actions proves the workflow.
- [x] ☑ **4.18 — Write contributor/setup documentation.**  
  Acceptance: README explains purpose, prerequisites, setup, commands, content editing, assets, environment, verification, and preview deployment without stale instructions.
- [x] ☑ **4.19 — Run the semantic foundation gate.**  
  Acceptance: clean install and all standard checks pass; route shell is inspected on mobile and desktop; results are recorded before heavy 3D dependencies are added.
- [x] ☑ **4.20 — Install and configure the approved Three.js stack.**
  Acceptance: `three`, `@react-three/fiber`, approved Drei utilities, version compatibility, tree-shaking, Canvas boundaries, and SSR/client-only behavior are verified.
- [x] ☑ **4.21 — Adopt selected Animate UI open-code components and configure Motion.**  
  Acceptance: Animate UI is treated as a copy-first component distribution rather than an opaque UI dependency; only approved source components are added, their MIT/third-party notices are preserved, default styling is replaced with project tokens, and the application root uses `MotionConfig reducedMotion="user"`.
- [x] ☑ **4.22 — Install and configure the OpenRouter TypeScript SDK.**  
  Acceptance: `@openrouter/sdk` is server-only, no key reaches client bundles, HTTP referrer/app-title metadata is configured if approved, and the SDK can be mocked in tests.
- [x] ☑ **4.23 — Implement the CC AI server route/service boundary.**  
  Acceptance: validated requests, streaming or deliberate non-streaming, timeout, abort, output limit, normalized errors, model metadata, and safe logs are implemented.
- [x] ☑ **4.24 — Implement model configuration and fallback policy.**  
  Acceptance: prototype default, named-model override, actual-model response metadata, free-router variability, provider data-policy constraints, fallback sequence, 402/429/provider failure behavior, and production paid-model switch use configuration rather than hard-coded UI logic.
- [x] ☑ **4.25 — Implement chat abuse and cost controls.**  
  Acceptance: request/body limits, per-IP/session rate limit, concurrency cap, origin/CSRF strategy where relevant, retry limits, and user-facing limit messages are tested.
- [x] ☑ **4.26 — Implement the CC AI knowledge/context builder.**  
  Acceptance: only approved public records are included, context is size-bounded, sources remain traceable, private files are excluded, and unknown answers instruct the model to say so.
- [x] ☑ **4.27 — Create the 3D asset registry.**
  Acceptance: typed metadata maps asset IDs to URLs, nodes, clips, materials, LODs, poster/fallback, interaction target, copyright/provenance, and loading priority.
- [x] ☑ **4.28 — Configure glTF/GLB loading and decoder reuse.**
  Acceptance: GLTF loading supports the selected Draco or meshopt strategy, one reusable decoder configuration, KTX2 detection where used, loading manager progress, cache behavior, and disposal.
- [x] ☑ **4.29 — Add the asset validation and optimization scripts.**
  Acceptance: commands inspect GLB validity, transforms, animations, dimensions, materials, texture sizes, triangle counts, and generate or verify compressed variants reproducibly.
- [x] ☑ **4.30 — Build the scene shell and state model.**
  Acceptance: camera, lights, environment, scene groups, selected artifact, quality tier, sound state, motion preference, and loading/error state have typed ownership without React state in the frame loop.
- [ ] ☐ **4.31 — Build the WebGL water proof of concept.**  
  Acceptance: a bounded shader or render-target prototype demonstrates ripples/reflections at acceptable desktop and mobile cost, with a simpler material and static-poster fallback.
  Status 2026-07-19: the unmounted full shader, still reduced material, zero-work poster tier, structural budgets, and four deterministic tests are implemented; all 78 tests, lint, type-check, and production build pass. This task remains open because real shader compilation, visual ripple/reflection review, and measured desktop/mobile renderer diagnostics are approval-gated and have not run.
- [x] ☑ **4.32 — Implement capability and quality detection.**
  Acceptance: WebGL support, device memory/hardware hints where available, viewport, DPR, reduced motion, reduced data, battery-safe defaults, and manual quality control resolve to a documented tier.
- [ ] ☐ **4.33 — Implement poster-first progressive scene loading.**  
  Acceptance: meaningful HTML and an optimized poster appear before the canvas; heavy assets load by priority; the poster remains on failure; no blank first viewport occurs.
  Status 2026-07-19: the homepage poster and semantic content now precede a dynamic, rights-gated Canvas boundary; typed full/reduced LOD planning, sequential critical loading, idle-deferred loading, selection-driven loading, safe failure status, abort, scoped cache eviction, and disposal are implemented. All 83 tests plus format, lint, type-check, content, palette, server-boundary, public-asset, diff, and 13-route production-build checks pass. This task remains unchecked because approved browser no-blank/failure-path evidence has not run and the two critical model URLs remain intentionally `null` pending rights/asset approval.
- [ ] ☐ **4.34 — Add deterministic 3D and chat test doubles.**  
  Acceptance: route, component, and end-to-end tests can run without downloading large GLBs or making real OpenRouter requests.
- [ ] ☐ **4.35 — Add immersive CI checks.**  
  Acceptance: CI validates asset manifests, GLB budgets/metadata, forbidden client secrets, chat mocks, production build, and a representative fallback render.
- [ ] ☐ **4.36 — Run the immersive foundation gate.**  
  Acceptance: clean checkout verifies semantic hero, poster-first canvas shell, test asset, reduced-motion mode, no-WebGL fallback, mocked CC AI request, and production build.

---

## Phase 5 — Core pages, flagship case studies, and immersive homepage

Dependencies: Phase 4 build gate and approved content for each page.  
Exit criteria: tasks 5.1–5.35 are checked; every launch page supports its primary journey, and the immersive homepage preserves real content, keyboard use, responsive states, and fallback tiers.

### Homepage

- [ ] ☐ **5.1 — Implement the identity-led hero.**  
  Acceptance: name/brand, role, one headline, short support, focused CTA group, and dominant real visual fit the first viewport across approved sizes.
- [ ] ☐ **5.2 — Implement selected work.**  
  Acceptance: flagship order, contribution, status, visuals, links, hover/focus/touch states, and responsive layout are correct.
- [ ] ☐ **5.3 — Implement homepage media teaser.**  
  Acceptance: music/video identity is visible without eager-loading heavy players or autoplaying audible media.
- [ ] ☐ **5.4 — Implement profile/CV teaser.**  
  Acceptance: it communicates credibility and personality with a clear path to About/CV.
- [ ] ☐ **5.5 — Implement trips/hobbies teaser.**  
  Acceptance: it adds personal depth without competing with selected work or exposing private details.
- [ ] ☐ **5.6 — Implement homepage contact/footer transition.**  
  Acceptance: CTA, social/contact links, focus order, and closing composition are clear and non-repetitive.

### Projects

- [ ] ☐ **5.7 — Implement the projects index.**  
  Acceptance: all launch projects are scannable, categorized accurately, linkable, and usable without animation or pointer hover.
- [ ] ☐ **5.8 — Implement filters only if Phase 3 justified them.**  
  Acceptance: URL/state behavior, keyboard control, counts, no-results state, and progressive enhancement work; otherwise record the intentional omission.
- [ ] ☐ **5.9 — Implement the reusable case-study layout.**  
  Acceptance: it supports the approved content hierarchy, media, code/architecture visuals, demos, external links, related work, and narrow-screen readability.
- [ ] ☐ **5.10 — Publish the StrudelAI case study.**  
  Acceptance: verified content, accessible audio/video evidence, current demo/repo links, attribution, and responsive visuals pass review.
- [ ] ☐ **5.11 — Publish the avatar-studio case study.**  
  Acceptance: engineering/process story is strong and no excluded private art, Blender, GLB, or workspace assets are published.
- [ ] ☐ **5.12 — Publish the iFoundYou case study.**  
  Acceptance: privacy/product/system story accurately labels prototype versus shipped behavior and contains no sensitive location data.
- [ ] ☐ **5.13 — Publish the OpenNemoClaw case study.**  
  Acceptance: technical depth, sandboxing claims, contribution, current status, and links are source-verified.
- [ ] ☐ **5.14 — Publish the WebDesigner case study.**  
  Acceptance: plugin/skills/MCP architecture, Nightglass intent, validation, contribution, and current version are accurate.
- [ ] ☐ **5.15 — Implement related-project navigation.**  
  Acceptance: next/previous or related items are meaningful, keyboard accessible, and do not trap users in a loop.

### Profile and personal pages

- [ ] ☐ **5.16 — Implement About/CV.**  
  Acceptance: approved bio, experience, education, skills, portrait, links, and web-first timeline are responsive and accurate.
- [ ] ☐ **5.17 — Add downloadable résumé only if approved.**  
  Acceptance: file is current, accessible, privacy-reviewed, clearly labeled with format/size, and not the sole CV representation; otherwise record omission.
- [ ] ☐ **5.18 — Implement the media page.**  
  Acceptance: approved music/video content has accessible structure, posters, loading/error states, credits, transcripts/captions as applicable, and external fallbacks.
- [ ] ☐ **5.19 — Implement trips/hobbies.**  
  Acceptance: curated stories/galleries have meaningful captions, responsive media, privacy/rights checks, and coherent navigation.
- [ ] ☐ **5.20 — Implement contact.**  
  Acceptance: approved contact method works, exposes no secret, handles spam/privacy appropriately, and has clear success/failure or mail-client fallback behavior.
- [ ] ☐ **5.21 — Implement 404 and unavailable-content states.**  
  Acceptance: states are on-brand, accessible, useful, and provide recovery paths.
- [ ] ☐ **5.22 — Run the semantic core-page MVP gate.**  
  Acceptance: all primary journeys are manually exercised on mobile and desktop without depending on the final 3D scene; content, links, focus, and responsive layout pass.
- [ ] ☐ **5.23 — Implement the layered Observatory hero shell.**  
  Acceptance: semantic editorial content, Canvas, poster, header, CTAs, CC AI anchor, and `SELECTED SYSTEMS` transition reproduce the approved composition and locked natural palette without using the reference image as the final full-page background; DOM and canvas colors visually belong to one system.
- [ ] ☐ **5.24 — Implement the observatory environment.**  
  Acceptance: architecture, skylight, water basin, materials, lighting, exposure, and camera framing match the approved warm natural reference across desktop quality tiers; off-white, buff, sage, taupe, walnut, and pewter remain dominant, while espresso is restricted to controlled structure and shadow.
- [ ] ☐ **5.25 — Implement the robot focal asset and interaction.**  
  Acceptance: optimized model, scale, pivot, materials, idle clip/procedural motion, hand-water alignment, reflection, focus target, loading state, and fallback poster pass.
- [ ] ☐ **5.26 — Implement the water system.**  
  Acceptance: robot-hand ripple, controlled pointer/touch ripples, reflection/refraction tiering, bounded render cost, pause/visibility behavior, reduced-motion mode, and non-WebGL fallback work.
- [ ] ☐ **5.27 — Implement the ASTRAEA artifact.**  
  Acceptance: chart geometry, ring animation, interaction target, project label/link, mobile simplification, and accessible DOM equivalent accurately represent the project.
- [ ] ☐ **5.28 — Implement the PINÁCULO artifact.**  
  Acceptance: 24-position structure, restrained 11/22/33 references, mechanism animation, project label/link, mobile simplification, and accessible DOM equivalent are correct.
- [ ] ☐ **5.29 — Implement the Sound Lab artifact.**  
  Acceptance: walnut/metal instrument, tactile controls, mute-first audio, track metadata, visual/mechanical response, keyboard/touch equivalent, project/media destination, and fallback work.
- [ ] ☐ **5.30 — Implement the future-energy and electronics/AI artifacts.**  
  Acceptance: flow-battery and electronics modules are visually distinct, technically credible, linked to verified content, budget compliant, and accessible through DOM equivalents.
- [ ] ☐ **5.31 — Implement the drone and ambient scene motion.**  
  Acceptance: hover path, stabilization, visibility pause, collision/occlusion limits, device-tier simplification, and reduced-motion behavior are verified.
- [ ] ☐ **5.32 — Implement camera/navigation transitions.**  
  Acceptance: Work, Laboratory, Sound, Cosmos, Story, artifact selection, back, browser history, keyboard, touch, interruption, and deep-link behavior remain understandable and reversible.
- [ ] ☐ **5.33 — Implement the CC AI chatbox UI.**  
  Acceptance: collapsed/open layout, prompts, streaming display, stop/retry, accessible status announcements, model disclosure, privacy note, error/rate-limit states, and mobile sheet match the design.
- [ ] ☐ **5.34 — Implement quality, motion, and fallback controls.**  
  Acceptance: auto quality, manual quality, sound, reduced motion, static experience, preference persistence, and reset are discoverable, keyboard accessible, and do not hide content.
- [ ] ☐ **5.35 — Run the immersive homepage MVP gate.**  
  Acceptance: the full hero journey works on representative desktop/mobile tiers, and identical project/navigation/chat entry points remain available in reduced, static, no-WebGL, and reduced-motion modes.

---

## Phase 6 — 3D assets, media, motion, water, and CC AI polish

Dependencies: Phase 5 MVP gate.  
Exit criteria: tasks 6.1–6.33 are checked; rights-cleared authored/generated assets, motion, water, media, and CC AI improve identity while preserving accessibility, security, performance, and fallback behavior.

- [ ] ☐ **6.1 — Implement the approved hero motion motif.**  
  Acceptance: motion supports hierarchy, runs once or intentionally, avoids layout shift, and has a complete reduced-motion result.
- [ ] ☐ **6.2 — Implement section/project reveal behavior.**  
  Acceptance: IntersectionObserver or equivalent avoids repeated churn; offscreen content remains available without JavaScript.
- [ ] ☐ **6.3 — Implement the approved premium hover/touch interaction.**  
  Acceptance: behavior works with pointer, touch, keyboard, and reduced motion without hiding essential information.
- [ ] ☐ **6.4 — Eliminate animation noise.**  
  Acceptance: no continuous decorative loops, gratuitous parallax, custom cursor dependency, scroll hijacking, or motion on every element remains.
- [ ] ☐ **6.5 — Run the animation quality gate.**  
  Acceptance: `$animation-quality-gate` or equivalent review validates timing, easing, hierarchy, contact frames where relevant, reduced motion, and performance.
- [ ] ☐ **6.6 — Optimize responsive project imagery.**  
  Acceptance: correct crops, art direction if needed, intrinsic dimensions, modern formats, compression, lazy/eager priorities, and alt treatment are verified.
- [ ] ☐ **6.7 — Optimize video delivery.**  
  Acceptance: posters load first, embeds/players lazy-load, captions/transcripts/fallback links work, no audible autoplay occurs, and data use is reasonable.
- [ ] ☐ **6.8 — Optimize audio delivery.**  
  Acceptance: player controls are keyboard/screen-reader usable, metadata/credits are present, preload is restrained, and errors/fallbacks work.
- [ ] ☐ **6.9 — Add waveform visualization only if approved and justified.**  
  Acceptance: it improves listening UX, lazy-loads, has a semantic fallback, and stays within budgets; otherwise record intentional omission.
- [ ] ☐ **6.10 — Verify loading, empty, and failure states.**  
  Acceptance: slow/failed image, audio, video, demo, and external-provider paths remain understandable and navigable.
- [ ] ☐ **6.11 — Verify no-JavaScript/progressive fallback.**  
  Acceptance: identity, copy, navigation, project content, CV, links, and media fallbacks remain usable where the chosen stack permits.
- [ ] ☐ **6.12 — Run the DOM/media experience-polish gate.**  
  Acceptance: real-device or representative browser testing confirms editorial UI and media polish without budget, accessibility, or content regressions.
- [ ] ☐ **6.13 — Produce the first rights-cleared robot candidate.**  
  Acceptance: the approved authoring/generation route and reference pack produce a documented candidate; if Hunyuan is used, task 1.27 is already checked; visual identity, silhouette, hands, material regions, originality, and rights are reviewed before cleanup.
- [ ] ☐ **6.14 — Produce the rights-cleared observatory artifact candidates.**  
  Acceptance: separate documented candidates exist for drone, ASTRAEA, PINÁCULO, Sound Lab, flow battery, electronics/AI, and selected environment modules; every route and output passes the task 2.25 record.
- [ ] ☐ **6.15 — Reject unsuitable generated assets explicitly.**  
  Acceptance: artifacts with derivative likeness, unusable topology, misleading engineering, unreadable form, licensing ambiguity, or impossible budgets are rejected with reasons rather than silently shipped.
- [ ] ☐ **6.16 — Clean and standardize accepted meshes.**  
  Acceptance: retopology/decimation, normals, manifold repair, UVs, scale, origin, pivots, node names, material slots, and scene orientation pass the asset specification.
- [ ] ☐ **6.17 — Create production PBR materials and textures.**  
  Acceptance: base color, normal, roughness, metallic, restrained emissive use, AO policy, color spaces, texture resolution, seams, and material response match the exact locked natural palette; Hunyuan outputs that introduce blue, violet, neon, or excessive darkness are recolored or rejected.
- [ ] ☐ **6.18 — Rig and animate the robot where needed.**  
  Acceptance: skeleton/controls, idle/head/hand clips, loop boundaries, root motion, hand-water contact, export settings, and procedural-versus-authored responsibilities are validated.
- [ ] ☐ **6.19 — Author and validate artifact animations.**  
  Acceptance: ASTRAEA rings, PINÁCULO mechanism, Sound Lab controls, drone hover, battery flow indicators, and electronics signals use named clips or documented procedural animation.
- [ ] ☐ **6.20 — Produce LOD and simplified variants.**  
  Acceptance: full, medium, low, and poster/static variants maintain silhouette and project identity while meeting their triangle, draw-call, material, and texture budgets.
- [ ] ☐ **6.21 — Optimize and package GLB assets.**  
  Acceptance: glTF validation passes; unused nodes/materials are removed; mesh quantization/compression and texture compression are compared by measured size, decode time, quality, and compatibility.
- [ ] ☐ **6.22 — Implement adaptive render scheduling.**  
  Acceptance: on-demand or low-frequency idle rendering is used where possible; continuous frames are limited to visible active motion; tab visibility and offscreen state pause expensive work.
- [ ] ☐ **6.23 — Tune water for quality tiers.**  
  Acceptance: desktop, mobile, reduced, and static implementations define render-target resolution, reflection frequency, ripple count, caustics, DPR, and graceful timeout behavior.
- [ ] ☐ **6.24 — Integrate Animate UI components selectively.**  
  Acceptance: navigation, chat, dialogs/sheets, controls, section transitions, and tooltips use only components that improve comprehension; project tokens replace default styling.
- [ ] ☐ **6.25 — Reconcile DOM and R3F motion timing.**  
  Acceptance: camera moves, artifact reactions, text transitions, chat animation, and section reveals share a documented rhythm without duplicate easing or conflicting transforms.
- [ ] ☐ **6.26 — Implement CC AI streaming and cancellation.**  
  Acceptance: partial responses render accessibly, visitors can stop generation, disconnects clean up resources, and retry does not duplicate messages.
- [ ] ☐ **6.27 — Implement CC AI grounding and uncertainty behavior.**  
  Acceptance: the system prompt restricts answers to approved public context, identifies unknowns, distinguishes shipped work from ideas, and avoids treating astrology/numerology as established science.
- [ ] ☐ **6.28 — Implement model transparency and free-tier fallback.**  
  Acceptance: the UI displays the actual responding model, handles `openrouter/free` random routing, timeouts, changing low-volume limits, 402/429 responses, provider unavailability, and an optional paid production model without redesign; it does not promise that chat is always available.
- [ ] ☐ **6.29 — Implement conversation and privacy boundaries.**  
  Acceptance: message count/size limits, reset, local/transient history policy, no sensitive-data invitation, redacted logs, and privacy disclosure match the approved policy.
- [ ] ☐ **6.30 — Run CC AI evaluation and red-team tests.**  
  Acceptance: factual, multilingual, unknown, conflicting-source, prompt-injection, abusive, privacy, astrology/numerology, and rate-limit cases meet documented expectations.
- [ ] ☐ **6.31 — Profile GPU, CPU, memory, network, and battery behavior.**  
  Acceptance: representative desktop and mobile traces identify bottlenecks; asset, shader, frame-loop, and UI changes are measured rather than guessed.
- [ ] ☐ **6.32 — Run the immersive animation and asset quality gate.**  
  Acceptance: clips, procedural motion, Hunyuan assets, materials, water contact, timing, artifact readability, reduced motion, and compression quality pass visual/technical review.
- [ ] ☐ **6.33 — Run the full experience-polish gate.**  
  Acceptance: representative devices confirm the Observatory, Sound Lab, artifacts, CC AI, media, and semantic fallbacks are polished without budget, accessibility, security, or content regressions.

---

## Phase 7 — Quality, accessibility, security, performance, and SEO

Dependencies: Phase 6 experience gate.  
Exit criteria: tasks 7.1–7.44 are checked; no critical/high issue is open; lower issues are fixed or explicitly accepted with rationale and follow-up IDs.

### Functional and visual QA

- [ ] ☐ **7.1 — Run clean install and full automated verification.**  
  Acceptance: lockfile install, format/lint, type/content checks, tests, and production build pass from a clean state.
- [ ] ☐ **7.2 — Test the desktop browser matrix.**  
  Acceptance: primary journeys pass in current Chrome, Edge, Firefox, and Safari or documented available equivalents.
- [ ] ☐ **7.3 — Test the mobile browser matrix.**  
  Acceptance: primary journeys pass in iOS Safari and Android Chrome or documented device/emulation equivalents.
- [ ] ☐ **7.4 — Inspect responsive breakpoints and extremes.**  
  Acceptance: 320px through wide screens, landscape mobile, long titles, long URLs, zoom, and high text scaling do not clip, overlap, or create accidental scroll.
- [ ] ☐ **7.5 — Run visual and palette-regression checks.**  
  Acceptance: approved page/viewport baselines include the final observatory reference; repeatable comparison detects layout, palette, exposure, white-balance, sage-water, wood warmth, CC AI surface, and forbidden-color drift.
- [ ] ☐ **7.6 — Validate all internal and external links.**  
  Acceptance: no unintended 4xx/5xx, broken anchors, wrong repo/demo, mixed content, or unsafe target behavior remains.

### Accessibility

- [ ] ☐ **7.7 — Validate semantic structure.**  
  Acceptance: landmarks, heading order, lists, links/buttons, forms, figures/captions, and language metadata are correct.
- [ ] ☐ **7.8 — Complete keyboard-only testing.**  
  Acceptance: skip link, nav, filters, media, dialogs if any, forms, and all actions work with logical focus and no trap.
- [ ] ☐ **7.9 — Validate visible focus and contrast.**  
  Acceptance: all states meet approved contrast and focus indicators remain visible on every background.
- [ ] ☐ **7.10 — Validate names, descriptions, and alt text.**  
  Acceptance: controls and media expose useful accessible names; decorative media is ignored correctly; no filename alt text remains.
- [ ] ☐ **7.11 — Validate motion and flashing safety.**  
  Acceptance: reduced-motion preference removes/minimizes motion, no critical meaning depends on animation, and no unsafe flashing exists.
- [ ] ☐ **7.12 — Test screen-reader primary journeys.**  
  Acceptance: at least one desktop and one mobile screen-reader path or documented available equivalents confirm meaningful order, labels, status, and media fallback.
- [ ] ☐ **7.13 — Run automated accessibility scans.**  
  Acceptance: chosen scanner reports no serious/critical issue on every page type; false positives and manual-only checks are documented.

### Performance

- [ ] ☐ **7.14 — Measure page performance against Phase 1 budgets.**  
  Acceptance: representative home, project, media, and CV pages meet LCP/INP/CLS, transfer, request, and JavaScript budgets or have approved exceptions.
- [ ] ☐ **7.15 — Audit image, font, and media loading.**  
  Acceptance: no oversized asset, missing dimension, unnecessary preload, layout shift, duplicate font, eager heavy embed, or autoplay data waste remains.
- [ ] ☐ **7.16 — Audit client JavaScript and third parties.**  
  Acceptance: every client bundle and third-party request is justified; unused libraries and duplicate functionality are removed.
- [ ] ☐ **7.17 — Test constrained network and CPU behavior.**  
  Acceptance: key content appears, navigation remains responsive, and media failures degrade safely under throttling.

### SEO and sharing

- [ ] ☐ **7.18 — Implement unique metadata and canonical URLs.**  
  Acceptance: every indexable page has approved title, description, canonical, robots intent, and language metadata.
- [ ] ☐ **7.19 — Implement social sharing metadata and images.**  
  Acceptance: Open Graph/Twitter-equivalent fields, dimensions, safe text regions, alt metadata if supported, and absolute URLs validate.
- [ ] ☐ **7.20 — Implement sitemap and robots behavior.**  
  Acceptance: production sitemap contains intended canonical pages; private/draft/preview content is handled correctly.
- [ ] ☐ **7.21 — Implement structured data where truthful.**  
  Acceptance: Person, WebSite, CreativeWork/SoftwareApplication, Breadcrumb, or other schema is limited to supported claims and passes validation.
- [ ] ☐ **7.22 — Verify content discoverability and crawl output.**  
  Acceptance: server/rendered HTML contains meaningful content, heading/link structure is sane, and no accidental noindex/canonical conflict exists.

### Security and privacy

- [ ] ☐ **7.23 — Run the WebDesigner security workflow.**  
  Acceptance: `$security-audit` produces a threat model, validated findings, and reviewed remediation proposals for the actual stack and deployment.
- [ ] ☐ **7.24 — Scan for secrets and private data.**  
  Acceptance: repository and build output contain no credentials, tokens, private dashboards, precise private locations, or prohibited media metadata.
- [ ] ☐ **7.25 — Audit dependencies and licenses.**  
  Acceptance: supported audit reports no unresolved high/critical vulnerability; production licenses and asset/font licenses are compatible and recorded.
- [ ] ☐ **7.26 — Validate external links, embeds, and headers.**  
  Acceptance: rel policies, iframe permissions, CSP/frame/connect needs, referrer policy, HTTPS, and provider privacy behavior are appropriate.
- [ ] ☐ **7.27 — Validate form/contact abuse controls if applicable.**  
  Acceptance: input validation, spam control, rate limiting/provider behavior, privacy notice, failure handling, and secret placement are reviewed; otherwise task records no form.
- [ ] ☐ **7.28 — Create the release-candidate report.**  
  Acceptance: automated results, browser/device matrix, accessibility, performance, SEO, security, known issues, accepted risks, and preview URL are collected in one review artifact.
- [ ] ☐ **7.29 — Approve the semantic/site release candidate.**  
  Acceptance: no unapproved critical/high issue remains in the content, routes, standard UI, or media layers before final immersive checks.
- [ ] ☐ **7.30 — Test WebGL support and context recovery.**  
  Acceptance: unsupported WebGL, blocked GPU, context loss/restoration, decoder failure, and shader compile failure show stable fallback content without trapping input.
- [ ] ☐ **7.31 — Validate 3D asset and initial-load budgets.**  
  Acceptance: each GLB/texture/decoder and the complete scene stay within approved compressed/uncompressed, request, parse, GPU-memory, and time-to-interactive budgets.
- [ ] ☐ **7.32 — Validate render-loop and thermal behavior.**  
  Acceptance: idle, interaction, camera transition, water, chat-open, background tab, and long-session tests meet FPS/CPU/GPU/battery expectations on representative devices.
- [ ] ☐ **7.33 — Validate 3D keyboard and screen-reader equivalents.**  
  Acceptance: every selectable artifact and camera destination has a logical semantic control, name, description, state, and destination independent of the canvas.
- [ ] ☐ **7.34 — Validate reduced-motion and static parity.**  
  Acceptance: all information, project links, Sound Lab controls, chat, and navigation remain available when transforms, loops, water motion, and camera transitions are disabled.
- [ ] ☐ **7.35 — Validate chat API-key isolation.**  
  Acceptance: source maps, bundles, network responses, logs, errors, and deployment output reveal no OpenRouter credential or internal prompt.
- [ ] ☐ **7.36 — Validate CC AI request abuse controls.**  
  Acceptance: oversized input, rapid requests, parallel requests, retry storms, invalid origins where applicable, and malformed payloads are bounded and return safe errors.
- [ ] ☐ **7.37 — Validate prompt-injection and data-exfiltration resistance.**  
  Acceptance: tests cannot coerce hidden instructions, secrets, private context, or unapproved filesystem/network data; limitations are documented honestly.
- [ ] ☐ **7.38 — Validate CC AI factual grounding.**  
  Acceptance: the evaluation set confirms sourced public facts, uncertainty, prototype/status labels, and refusal to invent achievements, dates, demos, or private details.
- [ ] ☐ **7.39 — Validate AI privacy and retention behavior.**  
  Acceptance: the implemented provider/log/history behavior matches the privacy notice; deletion/reset works as promised; no analytics captures message content unless explicitly approved.
- [ ] ☐ **7.40 — Validate model/rate-limit failure UX.**  
  Acceptance: free-router unavailability, model change, timeout, 429, provider failure, malformed stream, and content refusal produce helpful retry/fallback behavior.
- [ ] ☐ **7.41 — Audit generated 3D asset provenance and licenses.**  
  Acceptance: every production asset has a complete source/model/version/terms/cleanup record and no ambiguous reference, trademark, likeness, or third-party asset remains.
- [ ] ☐ **7.42 — Run CSP and third-party connection tests.**  
  Acceptance: OpenRouter server calls, asset hosts, fonts/media, WebAssembly decoders, workers, and analytics use the minimum required directives without unsafe broad allowances.
- [ ] ☐ **7.43 — Update the release-candidate report with immersive evidence.**  
  Acceptance: 3D budgets, device matrix, fallback captures, chat evaluations, rate-limit tests, asset provenance, known limitations, and preview URL are attached.
- [ ] ☐ **7.44 — Approve the complete immersive release candidate.**  
  Acceptance: no unapproved critical/high issue remains and the user approves the Observatory experience, CC AI, and site for production deployment.

---

## Phase 8 — Deployment and launch

Dependencies: Phase 7 release-candidate gate and explicit user authorization for external writes.  
Exit criteria: tasks 8.1–8.24 are checked; production is live with verified 3D assets, CC AI, fallbacks, observability, documentation, and rollback.

- [ ] ☐ **8.1 — Run the deployment-advisor workflow.**  
  Acceptance: `$deploy-advisor` confirms the approved provider, build settings, environment, caching, redirects, headers, preview behavior, and rollback path.
- [ ] ☐ **8.2 — Configure preview deployment.**  
  Acceptance: branch/PR preview builds from a clean checkout, has correct non-production robots/privacy behavior, and exposes no secret.
- [ ] ☐ **8.3 — Review the preview deployment.**  
  Acceptance: the complete release-candidate matrix is exercised against the hosted preview, including real URLs and media providers.
- [ ] ☐ **8.4 — Configure production environment variables and secrets.**  
  Acceptance: values are stored only in the provider secret store, scoped minimally, documented without disclosure, and preview/production separation is correct.
- [ ] ☐ **8.5 — Configure custom domain and HTTPS.**  
  Acceptance: DNS, apex/www choice, redirects, certificate, canonical host, and mixed-content checks pass.
- [ ] ☐ **8.6 — Configure caching, redirects, and security headers.**  
  Acceptance: immutable assets, HTML/content freshness, 404s, legacy URLs, CSP if used, HSTS/referrer/permissions policies, and media providers work together.
- [ ] ☐ **8.7 — Configure approved analytics/monitoring.**  
  Acceptance: privacy choice is honored; events avoid sensitive data; production errors, uptime, or deploy notifications are visible as approved.
- [ ] ☐ **8.8 — Create a rollback procedure.**  
  Acceptance: last-known-good deployment, provider rollback steps, DNS contingency, and owner are documented and tested where safe.
- [ ] ☐ **8.9 — Deploy production with explicit authorization.**  
  Acceptance: the authorized release is deployed from the approved commit and provider reports success.
- [ ] ☐ **8.10 — Run production smoke tests.**  
  Acceptance: home, project, case study, media, CV, trips/hobbies, contact, 404, metadata, sitemap, robots, assets, and primary external links pass on the canonical domain.
- [ ] ☐ **8.11 — Re-run production accessibility and performance spot checks.**  
  Acceptance: hosted behavior remains within approved gates and no provider/header/third-party regression appears.
- [ ] ☐ **8.12 — Verify search and social tooling.**  
  Acceptance: sitemap submission/inspection as approved, social-card previews, canonical host, and structured-data validation succeed.
- [ ] ☐ **8.13 — Publish release notes and tag if approved.**  
  Acceptance: scope, known limitations, production URL, rollback reference, and version/tag are recorded without claiming unfinished work.
- [ ] ☐ **8.14 — Complete the standard production launch gate.**  
  Acceptance: user confirms canonical routes, content, media, metadata, contact, and non-3D fallback meet launch intent.
- [ ] ☐ **8.15 — Configure production 3D asset delivery.**  
  Acceptance: GLB, KTX2/textures, posters, decoders, cache headers, immutable naming, CDN/provider origin, range/CORS behavior, and rollback versions are verified.
- [ ] ☐ **8.16 — Confirm Hunyuan generation is not a public runtime dependency.**  
  Acceptance: production serves reviewed static assets; Hunyuan credentials, local inference dependencies, generation endpoints, and raw candidate outputs are absent; any Hunyuan-derived asset has the checked task 1.27 decision and required notices/terms, otherwise no such asset ships.
- [ ] ☐ **8.17 — Configure OpenRouter production secrets and model policy.**  
  Acceptance: server-side key, model/default/fallback configuration, provider data-policy restrictions, app metadata, timeout, per-key budget/usage monitoring, and preview/production separation are stored only in the provider secret system.
- [ ] ☐ **8.18 — Configure production chat streaming and timeouts.**  
  Acceptance: the deployment platform supports the selected response mode and duration; aborts, disconnects, body limits, and cold starts are tested on the hosted preview.
- [ ] ☐ **8.19 — Configure durable rate limiting if required.**  
  Acceptance: provider-native, edge, or datastore-backed limits work across instances; failure of the limiter fails safely and does not expose secrets.
- [ ] ☐ **8.20 — Configure production CSP for 3D and AI.**  
  Acceptance: workers/WASM, asset origins, media, fonts, and server-side AI calls function with the narrowest practical directives.
- [ ] ☐ **8.21 — Run hosted 3D fallback tests.**  
  Acceptance: low bandwidth, blocked asset origin, decoder failure, unsupported WebGL, context loss, reduced motion, and static mode all retain the primary journey.
- [ ] ☐ **8.22 — Run hosted CC AI smoke and failure tests.**  
  Acceptance: approved prompts, streaming/cancel, model disclosure, reset, 429, timeout, provider outage, privacy copy, and mobile layout work on preview and production.
- [ ] ☐ **8.23 — Verify production performance and cost guardrails.**  
  Acceptance: CDN transfer, serverless/edge execution, OpenRouter request volume, rate limits, logs, and alerts remain within the approved launch assumptions.
- [ ] ☐ **8.24 — Complete the immersive production launch gate.**  
  Acceptance: user confirms the live Observatory, Sound Lab, ASTRAEA, PINÁCULO, water, artifacts, CC AI, and all fallback tiers meet launch intent; unresolved issues have backlog IDs.

---

## Phase 9 — Handoff, maintenance, and iteration

Dependencies: Phase 8 production gate.  
Exit criteria: tasks 9.1–9.15 are checked; Carlos can update content, regenerate/replace 3D assets, evaluate chat models, verify changes, preview, release, and recover the site without reconstructing hidden context.

- [ ] ☐ **9.1 — Document the content update workflow.**  
  Acceptance: add/edit/archive project, media, CV, trip, and hobby instructions include validation, assets, preview, and publishing.
- [ ] ☐ **9.2 — Document the asset pipeline.**  
  Acceptance: naming, folders, dimensions, compression, rights/credits, alt text, posters, captions/transcripts, and replacement behavior are clear.
- [ ] ☐ **9.3 — Document design-system maintenance.**  
  Acceptance: token changes, component states, motion rules, reduced motion, and visual-regression update policy are clear.
- [ ] ☐ **9.4 — Document local development and troubleshooting.**  
  Acceptance: prerequisites, common failures, clean install, checks, provider/environment issues, and support paths are current.
- [ ] ☐ **9.5 — Document deployment and rollback runbook.**  
  Acceptance: preview, production, secrets, domain, headers, monitoring, rollback, and incident steps match the real provider.
- [ ] ☐ **9.6 — Create a prioritized post-launch backlog.**  
  Acceptance: CMS, blog, additional projects, multilingual support, waveform, advanced motion, 3D, or other enhancements have value, cost, dependency, and priority rather than vague ideas.
- [ ] ☐ **9.7 — Establish recurring content/link review.**  
  Acceptance: cadence and owner exist for CV freshness, project status, demo links, dependency updates, broken links, licenses, and analytics/privacy review.
- [ ] ☐ **9.8 — Review real usage before adding complexity.**  
  Acceptance: the first iteration decision is based on approved feedback/analytics or direct user goals, not trend-driven scope expansion.
- [ ] ☐ **9.9 — Document the approved 3D authoring/generation workflow.**  
  Acceptance: reference preparation, tool/model/version, rights gate, settings, candidate storage, review, cleanup, optimization, provenance, rejection, and replacement steps are reproducible; any Hunyuan-specific path remains conditional on its archived terms.
- [ ] ☐ **9.10 — Document 3D runtime maintenance.**  
  Acceptance: asset registry, LODs, compression, decoders, quality tiers, water tuning, camera targets, interaction mapping, profiling, and fallback procedures are current.
- [ ] ☐ **9.11 — Document CC AI knowledge maintenance.**  
  Acceptance: approved-source updates, content freeze, prompt/evaluation changes, privacy review, and regression tests are clear.
- [ ] ☐ **9.12 — Document OpenRouter model and cost maintenance.**  
  Acceptance: model availability review, free-router limitations, paid fallback decision, rate limits, usage alerts, key rotation, and provider outage procedure are documented.
- [ ] ☐ **9.13 — Establish recurring 3D and AI regression review.**  
  Acceptance: cadence and owner exist for asset URLs/budgets, browser/GPU regressions, model behavior, grounding, prompt injection, privacy, rate limits, and provider changes.
- [ ] ☐ **9.14 — Review real usage before increasing 3D or AI complexity.**  
  Acceptance: additional artifacts, runtime generation, voice, avatars, long-term memory, or heavier shaders require measured need and a new decision record.
- [ ] ☐ **9.15 — Close the master project goal.**  
  Acceptance: all required launch and handoff tasks are checked; remaining enhancements are explicitly moved to the backlog; final evidence, asset manifest, model policy, and URLs are recorded.

---

## User-owned input queue

These are not assumed facts. Add or refine items as Phase 1–2 discovers them.

- [ ] ☐ **U.1 — Confirm preferred professional name and headline.**
- [ ] ☐ **U.2 — Confirm target audience priority and desired opportunities.**
- [ ] ☐ **U.3 — Provide or approve biography and CV source.**
- [ ] ☐ **U.4 — Approve flagship project order and contribution wording.**
- [ ] ☐ **U.5 — Provide/approve portrait and personal brand assets.**
- [ ] ☐ **U.6 — Provide/approve music, video, travel, and hobby content with reuse rights.**
- [ ] ☐ **U.7 — Confirm public contact method and social links.**
- [ ] ☐ **U.8 — Approve stack/content/hosting decisions from Phase 1.**
- [ ] ☐ **U.9 — Approve the design gate from Phase 3.**
- [ ] ☐ **U.10 — Approve production deployment from Phase 8.**
- [x] ☑ **U.11 — Approve The Submerged Earth Observatory visual direction.**
- [ ] ☐ **U.12 — Approve the final 3D asset candidates after Hunyuan generation and cleanup.**
- [ ] ☐ **U.13 — Confirm the public knowledge and boundaries for CC AI.**
- [ ] ☐ **U.14 — Provide an OpenRouter key through the deployment secret store when integration testing begins.**
- [ ] ☐ **U.15 — Approve Sound Lab tracks/audio rights and mute-first behavior.**
- [ ] ☐ **U.16 — Approve 3D quality budgets and the static/mobile fallback appearance.**
- [ ] ☐ **U.17 — Approve a rights-cleared 3D authoring fallback if task 1.27 rejects Hunyuan for worldwide portfolio use.**

## Completion log

| Date | Task | What changed | Evidence |
| --- | --- | --- | --- |
| 2026-07-19 | 0.1 | Inspected the full research report and empty crashed-run task plan. | Report headings and all 407 lines reviewed; `maintaskplan.md` was 0 bytes before reconstruction. |
| 2026-07-19 | 0.2 | Inspected both GitHub repositories. | GitHub metadata showed `uset82/portafolio` public, empty, default `main`; `uset82/webdesigner` public and populated. |
| 2026-07-19 | 0.3 | Initialized the provided portfolio folder as the working repository. | `git status` reported `main`; `origin` fetch/push points to `https://github.com/uset82/portafolio.git`. |
| 2026-07-19 | 0.4 | Added the official OpenAI developer-documentation MCP source. | `codex mcp add` returned `Added global MCP server 'openaiDeveloperDocs'`. |
| 2026-07-19 | 0.5 | Validated WebDesigner before installation. | Validator reported version 1.1.0, 15 skills, 86 tokens; MCP smoke test reported five tools. |
| 2026-07-19 | 0.6 | Replaced stale marketplace state and installed the current WebDesigner plugin. | `codex plugin list` reported installed/enabled version 1.1.0 from `webdesigner-repo-marketplace`. |
| 2026-07-19 | 0.7 | Created the repository instruction chain and delivery conventions. | `AGENTS.md` reviewed at 7,238 bytes, below the default 32 KiB Codex project-instruction budget. |
| 2026-07-19 | 0.8 | Created human-readable delivery and safety rules. | `rules.md` distinguishes project guidance from executable command policy and covers planning through release. |
| 2026-07-19 | 0.9 | Created the project skill-routing index. | `skills.md` records WebDesigner 1.1.0, repo skills, core workflow routing, conditional 3D, and the Astro/WebDesigner decision tension. |
| 2026-07-19 | 0.10 | Created two discoverable repository skills. | `quick_validate.py` passed for `portfolio-delivery` and `curate-portfolio-content`; no TODO placeholders remain. |
| 2026-07-19 | 0.11 | Created and tested project-local command rules. | `codex execpolicy check` passed push/force-push/reset/clean/PR/npm/Netlify/Vercel/Wrangler cases; read-only `gh pr view` remained allowed. |
| 2026-07-19 | 0.12 | Verified fresh-task discovery from the repository root. | This task loaded the root `AGENTS.md`, both repository skills, WebDesigner 1.1.0 skills, MCP/tool capabilities, and project execution rules at task start. |
| 2026-07-19 | 0.14 | Added dual-format visible task boxes throughout the master plan. | Every task now uses standard Markdown plus a raw-text symbol: `[ ] ☐` for open and `[x] ☑` for complete; an automated scan found no unmarked task. |
| 2026-07-19 | 0.15 | Consolidated the immersive natural-palette plan into the execution ledger and removed superseded documents. | Final scan found 310 unique task IDs, 0 duplicates, 0 malformed markers; v2, v3, and standalone prompt files are absent; `mainUI.png` hash matches the documented baseline and the research report remains. |
| 2026-07-19 | 1.16 | Approved The Submerged Earth Observatory as the immersive homepage thesis. | User iterated and accepted the bright natural observatory reference with robot, water, ASTRAEA, PINÁCULO, Sound Lab, future-energy/electronics artifacts, drone, and CC AI. |
| 2026-07-19 | U.11 | User approved the visual direction to be converted into a real UI. | Latest approved reference image and explicit instruction to implement it as animated 3D UI. |
| 2026-07-19 | 1.16 palette clarification | Locked the natural off-white, sage, taupe, buff, clay, dusty-pink, walnut, water, and pewter palette for DOM, Three.js, Hunyuan assets, CC AI, and fallbacks. | User supplied natural-palette references and requested that the real UI retain the same colors as the approved generated image. |
| 2026-07-19 | 1.1 | Completed define the primary audiences in priority order. | Prioritized recruiter/employer, collaborator/client, creative peer, and general visitor in `docs/decisions/001-portfolio-foundation.md`. |
| 2026-07-19 | 1.2 | Completed define the primary user journeys. | Decision record defines six concise journeys covering identity, work, laboratory, media, CV/contact, and optional CC AI. |
| 2026-07-19 | 1.3 | Completed define measurable launch outcomes. | Decision record defines observable journey, first-viewport, project-truth, fallback, accessibility, and performance outcomes without vanity metrics. |
| 2026-07-19 | 1.4 | Completed confirm the v1 information architecture. | Decision record assigns responsibilities to `/`, work, laboratory, sound, cosmos, story, contact, and recovery routes. |
| 2026-07-19 | 1.5 | Completed define launch scope and explicit non-goals. | Decision record separates semantic/immersive v1 scope from CMS, auth, comments, runtime generation, voice, and other non-goals. |
| 2026-07-19 | 1.6 | Completed run the webdesigner framework-selection workflow. | Created schema-shaped `task-intent.json` and `stack-selection.json`; validation reported every required enum/field check true. |
| 2026-07-19 | 1.7 | Completed compare astro, next.js, and react/vite against this portfolio. | Decision table compares content, React/canvas boundaries, server API needs, SEO, and operational cost; Next.js selected. |
| 2026-07-19 | 1.8 | Completed approve the frontend stack and package manager. | Selected Next.js App Router, strict TypeScript, React, and pnpm; observed local Node 22.22.0 and pnpm 10.13.1. |
| 2026-07-19 | 1.9 | Completed approve the content source for v1. | Selected local typed TypeScript/JSON/MDX with Zod validation and an explicit later-CMS decision boundary. |
| 2026-07-19 | 1.10 | Completed approve hosting and preview strategy. | Selected Vercel-compatible output without linking or deploying a project; preview and production remain release-gated. |
| 2026-07-19 | 1.11 | Completed approve analytics and privacy approach. | Selected no behavioral analytics for launch; later privacy-friendly analytics requires a concrete need and review. |
| 2026-07-19 | 1.12 | Completed decide language and locale behavior. | Selected English `en` for launch while preserving a future locale path. |
| 2026-07-19 | 1.13 | Completed set accessibility targets. | Recorded WCAG 2.2 AA, keyboard, 44px targets, 200% zoom, screen-reader canvas equivalents, and reduced/static modes. |
| 2026-07-19 | 1.14 | Completed set performance budgets. | Recorded Core Web Vitals, JavaScript/poster/font limits, no-third-party-first-paint rule, and tiered 3D transfer/runtime budgets. |
| 2026-07-19 | 1.15 | Completed set browser and viewport support. | Recorded evergreen desktop/mobile browser targets with semantic/static compatibility as the fallback floor. |
| 2026-07-19 | 1.17 | Completed approve the dom-plus-canvas composition. | Decision record assigns content/navigation to server-rendered DOM and makes the canvas a poster-backed, mirrored enhancement. |
| 2026-07-19 | 1.18 | Completed select the react runtime for the immersive experience. | Selected Next.js App Router because one React runtime covers R3F, Motion, metadata, static routes, and server chat. |
| 2026-07-19 | 1.19 | Completed approve the three.js runtime stack. | Selected Three.js, React Three Fiber, and only necessary Drei utilities; post-processing deferred pending evidence. |
| 2026-07-19 | 1.20 | Completed approve the hunyuan 3d authoring pipeline. | Evaluated Hunyuan against provider-neutral authored/procedural fallbacks and selected the rights-cleared fallback route. |
| 2026-07-19 | 1.21 | Completed define 3d quality tiers and budgets. | Decision record specifies full, reduced/mobile, and static byte, geometry, texture, draw-call, DPR, FPS, and timeout limits. |
| 2026-07-19 | 1.22 | Completed define the cc ai product scope. | Recorded approved topics/sources, uncertainty, prototype labels, astrology/numerology framing, limits, and refusal boundaries. |
| 2026-07-19 | 1.23 | Completed approve the openrouter architecture and model policy. | Recorded server-only SDK, `openrouter/free` prototype, actual-model disclosure, policy filtering, timeouts, and failure behavior. |
| 2026-07-19 | 1.24 | Completed approve cc ai privacy, abuse, and cost controls. | Recorded no body logging by default, bounded history/input/output, origin/rate/concurrency controls, reset, and safe unavailable mode. |
| 2026-07-19 | 1.25 | Completed approve the ui-motion and design-reference policy. | Assigned DOM motion to selected Animate UI/Motion source, scene motion to R3F, CSS state transitions, and complete reduced motion. |
| 2026-07-19 | 1.27 | Completed resolve the hunyuan distribution and territory license gate. | `docs/research/hunyuan-3d-rights-review.md` records the official license conflict and rejects Hunyuan for worldwide production use. |
| 2026-07-19 | 1.26 | Completed write and approve the architecture/product decision record. | Created `docs/decisions/001-portfolio-foundation.md`; JSON artifacts parse and every schema-enum check passed. |
| 2026-07-19 | 2.22 | Archived the approved homepage reference, palette evidence, prompt, and composition notes. | `docs/design/reference/` contains hashed source images, provenance, change-control rules, anchors, and the approved implementation prompt. |
| 2026-07-19 | 2.23 | Created the provider-neutral 3D asset manifest. | `docs/assets/observatory-3d-manifest.json` parses with 12 named scene assets; every asset has source, state, scale, animation, material, LOD, budget, and fallback fields. |
| 2026-07-19 | 2.26 | Defined mesh, material, rig, and animation acceptance rules. | `docs/design/immersive-scene-spec.md` documents topology, normals, UV/PBR color spaces, scale, pivots, bind/weight, clip, and visual pass/fail criteria. |
| 2026-07-19 | 2.27 | Defined full and reduced 3D optimization targets. | Scene spec and manifest record triangle, draw-call, material, texture-memory, GLB, texture, LOD, compression, and DPR targets. |
| 2026-07-19 | 2.28 | Inventoried authored and procedural motion requirements. | Scene spec assigns robot, drone, ASTRAEA, PINÁCULO, Sound Lab, liquid, camera, and water motion plus reduced-motion replacements. |
| 2026-07-19 | 3.1 | Applied the WebDesigner design system and frontend art-direction workflows. | Read both current skills and their design, token, Tailwind, and explicit-3D contracts; reconciliation is documented in `docs/design/DESIGN.md`. |
| 2026-07-19 | 3.2 | Wrote the Natural Observatory visual thesis. | `docs/design/DESIGN.md` defines mood, hierarchy, imagery, typography, materials, and Carlos's robot/observatory signature. |
| 2026-07-19 | 3.3 | Created a provenance-labeled reference audit. | `DESIGN.md` distinguishes reusable Carlos-owned source files from Refero, Nightglass, editorial, instrument, and spatial inspiration. |
| 2026-07-19 | 3.4 | Approved the implementation natural-token contract. | `DESIGN.md` contains all locked swatch, scene, semantic, contrast, distribution, and forbidden-color rules; automated scan found 28 semantic token references. |
| 2026-07-19 | 3.5 | Defined the typography system. | `DESIGN.md` records licensed variable serif/sans roles, scale, weights, fallbacks, line lengths, and loading strategy. |
| 2026-07-19 | 3.6 | Defined the layout token system. | `DESIGN.md` records grid, spacing, gutters, header/target sizing, radii, elevation, and z-index contract. |
| 2026-07-19 | 3.7 | Designed navigation and footer behavior. | `DESIGN.md` specifies desktop/mobile routing, active state, skip link, keyboard/focus behavior, zoom overflow, and contact paths. |
| 2026-07-19 | 3.8 | Designed the homepage editorial flow. | `DESIGN.md` and `wireframes.md` cover hero, Selected Systems, Laboratory, Sound, Cosmos, Story, and Contact without a generic card grid. |
| 2026-07-19 | 3.9 | Designed the work index and conditional filtering. | `DESIGN.md` defines the editorial default, eight-project filter threshold, announced counts, reset, and no-result recovery. |
| 2026-07-19 | 3.10 | Designed the case-study template. | `DESIGN.md` and `wireframes.md` specify overview through related-work hierarchy and honest unavailable/preparation states. |
| 2026-07-19 | 3.11 | Designed accessible music/video behavior. | `DESIGN.md` and wireframes specify mute-first controls, posters, loading, captions/transcripts, errors, and host fallback. |
| 2026-07-19 | 3.12 | Designed Story/About/CV. | `DESIGN.md` and wireframes define biography, experience, skills, education, résumé path, and mobile timeline reading order. |
| 2026-07-19 | 3.13 | Designed curated trips, hobbies, and Cosmos storytelling. | `DESIGN.md` specifies short editorial stories, personal-practice framing, rights checks, and safe location/date granularity. |
| 2026-07-19 | 3.14 | Designed contact and recovery states. | `DESIGN.md` and wireframes cover mail-link/form boundary, 404, missing content, offline/embed/demo, and AI failure recovery. |
| 2026-07-19 | 3.15 | Specified responsive behavior. | `DESIGN.md` defines 320px through 1440+ reflow, crop, stacking, typography, navigation, chat, and Selected Systems behavior. |
| 2026-07-19 | 3.16 | Specified complete interaction states. | `DESIGN.md` covers default, hover, focus-visible, pressed, disabled, loading, empty, error, visited, and non-color status cues. |
| 2026-07-19 | 3.17 | Defined three restrained motion motifs. | `DESIGN.md` defines Assemble, Focus, and Trace with duration, easing, trigger, ownership, cancellation, and no ambient DOM loop. |
| 2026-07-19 | 3.18 | Defined reduced-motion equivalence. | Design and scene specs replace stagger, parallax, camera travel, water, hover, and idle loops with immediate states while preserving actions. |
| 2026-07-19 | 3.19 | Produced realistic desktop/mobile route wireframes. | `docs/design/wireframes.md` represents home, work/no-results, case study, laboratory, sound, story, cosmos, contact, 404, and chat states. |
| 2026-07-19 | 3.20 | Created the implementation-facing design contract. | `docs/design/DESIGN.md` contains the required thesis, plan, interaction, tokens, components, responsive, motion, accessibility, fallback, and QA sections. |
| 2026-07-19 | 3.21 | Passed the editorial/UI design review gate. | `docs/design/review-gate.md` approves hierarchy, originality, content fit, color, responsive composition, accessibility, states, and feasibility. |
| 2026-07-19 | 3.22 | Completed the Refero/reference implementation audit. | `DESIGN.md` records six scoped references, permitted lessons, and explicit no-copy boundaries. |
| 2026-07-19 | 3.23 | Converted the reference into a layered composition specification. | Scene spec records DOM/canvas layers, normalized object anchors, safe zones, responsive crop priorities, z-index roles, chat, and bottom transition. |
| 2026-07-19 | 3.24 | Storyboarded camera and scene states. | Scene spec defines poster, ready, idle, entry, five artifact views, back, mobile, and fallback states with targets, timing, input, and cancellation. |
| 2026-07-19 | 3.25 | Specified the artifact interaction map. | Scene spec maps robot, drone, ASTRAEA, PINÁCULO, Sound Lab, energy, electronics/AI, and water to mesh/DOM actions and occlusion rules. |
| 2026-07-19 | 3.26 | Specified tiered WebGL water behavior. | Scene spec defines reflection/refraction, ripple sources, hand displacement, caustics, shader cap, mobile tier, poster, and reduced-motion behavior. |
| 2026-07-19 | 3.27 | Specified robot and procedural motion language. | Scene spec bounds joint, head, finger, mechanical, drone, artifact, interruption, cadence, pause, and frozen-pose behavior. |
| 2026-07-19 | 3.28 | Specified Sound Lab interaction and audio. | Scene spec defines mute-first playback, keyboard/touch controls, metadata, rights, waveform truth, mechanical response, and non-audio fallback. |
| 2026-07-19 | 3.29 | Designed the CC AI experience. | `docs/design/cc-ai-spec.md` defines all panel, streaming, stop/retry, disclosure, source, error, rate, privacy, keyboard, mobile, and announcement behavior. |
| 2026-07-19 | 3.30 | Designed poster-first loading and capability fallbacks. | Design and scene specs preserve routes across slow network, no JS, unsupported/lost WebGL, asset failure, low tier, Save-Data, and reduced motion. |
| 2026-07-19 | 3.31 | Defined the cross-system animation matrix. | `DESIGN.md` assigns every transition to CSS, Motion/Animate UI, or R3F with timing, trigger, cancellation, reduced motion, and cost. |
| 2026-07-19 | 3.32 | Passed the immersive design review gate. | `docs/design/review-gate.md` approves scene, overlay, chat, Sound Lab, tiers, mobile, loading, accessibility, performance, and provider feasibility. |
| 2026-07-19 | 4.1 | Scaffolded the approved Next.js application in the separate `site/` workspace. | Next.js 16.2.10, React 19, TypeScript, Tailwind v4, ESLint, App Router, `src/`, `@/*`, and pnpm are installed; template UI/assets were removed and root research/instructions remain intact. |
| 2026-07-19 | 4.2 | Pinned runtime and package-manager expectations. | `site/package.json`, `.nvmrc`, `pnpm-lock.yaml`, and README pin Node 22.x and pnpm 10.13.1 with frozen-lockfile setup instructions. |
| 2026-07-19 | 4.3 | Enabled the strict TypeScript and path contract. | `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `allowJs: false`, and the minimal `@/*` alias are configured; `pnpm typecheck` passes. |
| 2026-07-19 | 4.4 | Configured reproducible formatting and linting. | Prettier and Next ESLint scripts/ignores exist; final `pnpm format:check` and zero-warning `pnpm lint` both pass. |
| 2026-07-19 | 4.5 | Defined generated-source ownership. | `site/README.md`, `docs/artifacts/workspace-layout.md`, and `docs/artifacts/file-map.md` assign routes, components, content, tokens, assets, tooling, utilities/tests, and control-plane ownership. |
| 2026-07-19 | 4.6 | Implemented the shared accessible route shell. | `/`, six approved top-level routes, three system slugs, and 404 render through the shared header/footer/skip link; HTTP verification returned 200 for intended routes and 404 for the recovery test. |
| 2026-07-19 | 2.1 | Defined and documented the structured content contract. | `site/src/content/schemas.ts` types projects, media works, experience, education, trips, hobbies, links, sources, metadata, media, and inventory records; `docs/content/content-schema.md` documents field intent and evidence boundaries. |
| 2026-07-19 | 2.2 | Created the content inventory ledger. | `docs/content/content-inventory.json` validates 26 planned content and asset entries with owner, source, verification, rights, gaps, priority, decision, requested action, fallback, and launch impact. |
| 2026-07-19 | 4.7 | Implemented actionable runtime content validation. | `pnpm content:check` parses site and inventory records, cross-checks source IDs and duplicate IDs, enforces status-specific evidence, and proves three invalid fixtures are rejected. |
| 2026-07-19 | 4.8 | Loaded approved display content through the runtime schema. | The header, homepage hero actions/copy, and Selected Systems use server-parsed records; the three reference systems remain `concept`, `publication: hold`, with no invented stack, links, media, outcomes, or rights claim. |
| 2026-07-19 | 4.9 | Guarded the Natural Observatory palette across DOM and future canvas roles. | CSS tokens and `site/src/styles/palette.ts` centralize 30 approved colors and 11 Three.js material roles; `pnpm palette:check` rejects every unapproved source hex plus cyan, violet, neon, and near-black sentinels. |
| 2026-07-19 | 4.10 | Implemented the shared editorial layout vocabulary. | Container, section, stack, cluster, responsive 12/8/4-column grid, media frame, prose, and visually-hidden primitives live in global CSS; the shared route intro uses them and was rendered at 1440×900 and 390×844 with no horizontal overflow or console warnings. |
| 2026-07-19 | 4.11 | Implemented the foundational Natural Observatory UI primitives. | Typed action link/button, editorial heading, status tag, image frame, and editorial link-row components are integrated into the homepage and concept routes; 1440×900 and 390×844 review confirmed 44px actions, ≥69px rows, visible six-pixel keyboard focus, literal concept status, working optimized image, no overflow, and no console warnings; `pnpm verify` passes. |
| 2026-07-19 | 4.15 | Added and documented the standard project command surface. | Development, build, preview, lint, format, strict type, content, palette, test, and full verification commands are present in `site/package.json` and documented in `site/README.md`; `pnpm verify` passes. |
| 2026-07-19 | 4.12 | Configured the poster image and font pipelines. | Next Image supplies responsive optimized poster delivery with dimensions/alt text; Next Font bundles Cormorant Garamond and Manrope with swap/fallback behavior; production build passes. |
| 2026-07-19 | 4.14 | Documented environment variables without secrets. | `site/.env.example` and the README document server/browser visibility, optional/required timing, local files, deploy secret storage, model config, and canonical URL. |
| 2026-07-19 | 4.18 | Wrote contributor and setup documentation. | `site/README.md` covers purpose, prerequisites, install, commands, source/content ownership, assets, environment, motion/3D boundaries, verification, and preview-only release policy. |
| 2026-07-19 | 4.21 | Adopted a selected Animate UI primitive and configured Motion accessibly. | The local adapted button preserves source/license notice, uses project tokens, and the root `MotionConfig` uses `reducedMotion="user"`; desktop/mobile interaction and reduced CSS paths were reviewed. |
| 2026-07-19 | 4.13 | Configured privacy-aware native and external media foundations without publishing unverified media. | Native audio/video is manual, mute-first, `preload="none"`, poster/caption/transcript/error aware; external iframes are absent until consent, lazy, named, sandboxed, privacy-labeled, and recoverable. `/sound` rendered an honest source-readiness state at 1440×900 and 390×844 with 66–83px rows, one H1, no overflow or console issues; content contracts reject missing video accessibility data and autoplay embed URLs; `pnpm verify` passes. |
| 2026-07-19 | 4.22 | Installed and isolated the official OpenRouter TypeScript SDK behind a mockable server-only boundary. | `@openrouter/sdk` 0.13.65 is lockfile-pinned; configuration requires a server key, normalizes the approved HTTP referer/title, rejects unsafe URLs, and keeps debug logging off. Eight tests, `pnpm boundary:check`, `pnpm verify`, and a `.next/static` scan passed with no SDK runtime, key identifier, or key prefix in browser bundles. |
| 2026-07-19 | 4.23 | Implemented a disabled-by-default, non-streaming CC AI route and provider-neutral service boundary. | `/api/cc-ai` validates bounded JSON, issues server request IDs, propagates aborts/timeouts, caps tokens/characters, returns requested/responding model metadata, uses no-store responses, and normalizes failures without body/raw-error logging. Fifteen mocked tests and the production build pass; a real local production request returned safe HTTP 503 `disabled`, and client chunks remained AI-secret/runtime free. |
| 2026-07-19 | 4.24 | Implemented the configuration-driven CC AI model, fallback, and provider privacy policy. | Prototype mode defaults to the variable `openrouter/free` router with a named override; production requires a paid named model; both modes support deduplicated ordered fallbacks and return actual responding-model metadata. Requests enforce ZDR plus denied provider data collection, while 402, 429, and provider failure remain distinct safe states. Twenty-four deterministic tests, `pnpm verify`, the dynamic route build, and a `.next/static` policy-identifier scan pass. |
| 2026-07-19 | 4.25 | Implemented the disabled route's abuse and cost-control foundation. | Exact same-origin/Fetch Metadata checks reject cross-site or unverifiable sources; bounded JSON/body/history/output, trusted hosting IP plus server-issued HttpOnly session fixed-window limits, per-session/process concurrency caps, bounded tracking state, explicit `Retry-After`, single provider attempts, and distinct forbidden/rate/busy messages are tested. Thirty-three deterministic tests, `pnpm verify`, the dynamic production route build, and a `.next/static` scan pass. The limiter is intentionally per process; task 8.19 remains the durable multi-instance production gate. |
| 2026-07-19 | 4.26 | Implemented the public-only, size-bounded CC AI knowledge/context builder. | The service reads only validated structured records and requires factual approval, applicable publication/rights readiness, and all-public provenance; it never reads source files and excludes design-only, held, pending-rights, private, or mixed-source records. Whole JSON records and public source IDs fit an 8,000-character budget, response metadata remains traceable, and the system instruction preserves status and requires an exact honest-unknown answer. The current production context correctly contains zero facts pending task 2.30. Forty deterministic tests, `pnpm verify`, the dynamic route build, and a client-bundle prompt/private-source scan pass. |
| 2026-07-19 | 4.16 | Proved the baseline content, schema, route, media, AI-boundary, and fallback tests from a clean repository checkout. | Exact commit `71368ad` was cloned into a disposable directory; `pnpm install --frozen-lockfile` and `pnpm verify` passed with 40 tests and the 13-page production build. |
| 2026-07-19 | 4.19 | Passed the semantic foundation gate before adding the Three.js runtime. | The same clean checkout passed every standard command, then its production server was inspected at 1440×900 and 390×844: one H1, complete optimized poster/alt text, matching client/scroll widths, zero console warnings/errors, and a keyboard-Escape mobile-menu close path. |
| 2026-07-19 | 4.20 | Installed and configured the optional Three.js runtime behind a reusable client-only boundary. | Exact `three` 0.185.1, Fiber 9.6.1, Drei 10.7.7, and matching types satisfy the current React 19.2.4 peer ranges. `LazyThreeCanvas` disables SSR; the internal owner bounds DPR, uses demand rendering, requires fallback/label input, and exposes only a four-utility named Drei allowlist. Three focused tests, all 43 tests, `pnpm verify`, the 13-page production build, and an initial-client-chunk scan passed; no scene is mounted and no Three.js marker entered the current critical chunks. |
| 2026-07-19 | 4.27 | Created the typed runtime registry for all 12 provider-neutral Observatory assets. | Strict schemas and data map stable IDs to planned GLB/LOD URLs, required node and clip contracts, approved material roles, scale, poster/DOM fallback, interaction targets, provenance/copyright fields, and loading priority. The registry matches the specification manifest and LOD counts; every current public model URL is `null`, every fallback resolves locally, and unsafe or rights-pending public URLs are rejected. Five focused registry tests pass. |
| 2026-07-19 | 4.28 | Configured one reusable glTF runtime with self-hosted, version-matched decoders and explicit asset lifecycle ownership. | Shared Draco and KTX2 instances use pinned Three.js 0.185.1 files; meshopt is bundled, KTX2 detects renderer support, and each explicit attempt receives a fresh LoadingManager whose first fatal URL cannot be overwritten by late progress. Scoped cache eviction, abort, retry isolation, permanent decoder teardown, and deduplicated geometry/material/texture/image/skeleton disposal are implemented. Five focused loader tests verify decoder hashes, progress/error behavior, clean retries, disposal/cache semantics, and configuration source; all 53 tests and `pnpm verify` pass. No real GLB decode was claimed because every registry URL is still rights-gated and `null`. |
| 2026-07-19 | 4.29 | Added the deterministic offline GLB validation, budget, and Meshopt variant pipeline. | Pinned glTF Transform 4.4.1, Khronos Validator 2.0.0-dev.3.10, Draco 1.5.7, and meshoptimizer 1.2.0 inspect validity, transforms, required nodes/clips, meter bounds, animations, materials, texture dimensions/memory, visible triangles, draw calls, extensions, hashes, and manifest/LOD budgets. Generation validates before writing and emits a timestamp-free toolchain/input/output hash sidecar; verification regenerates byte-for-byte. Five in-memory/temporary-fixture tests, all 58 tests, `pnpm assets:check`, `pnpm verify`, and the 13-page build pass. The public scan correctly reports zero GLBs because all rights-gated registry URLs remain `null`; no production model or visual approval is claimed. |
| 2026-07-19 | 4.30 | Built the typed, single-owner Observatory scene state and unmounted R3F shell. | All 12 registry assets map exactly once into seven named groups; provisional storyboard camera views, locked-palette local lights, transparent no-HDR environment, quality, motion/pause/visibility, muted sound, real loading/error/retry, selected artifact, and monotonic cancellable camera requests have explicit ownership. Eight focused tests confirm fail-closed poster defaults, no Sound Lab autoplay, stale-camera rejection, safe recovery, and no `useFrame`/React frame-loop state writes. All 66 tests, `pnpm verify`, and the 13-page build pass; the shell is absent from routes, so no visual or real-WebGL claim is made. |
| 2026-07-19 | 4.32 | Implemented the outside-Canvas capability detector, versioned quality state, and semantic manual tier control. | WebGL2, viewport, DPR, optional memory/CPU, reduced motion/data, connection, battery, visibility, and Auto/Full/Reduced/Poster preference resolve through documented hard/soft precedence. Missing limited APIs are neutral, listeners clean up, unsupported WebGL2 remains poster-only, and the 44px radio fieldset uses project tokens. Eight focused tests, all 78 tests, `pnpm verify`, and the 13-page build pass; no route mounts the runtime, so no browser/device claim is made. |

## Implementation research notes

- Hunyuan3D 2.1 provides image-to-shape and PBR texture-generation pipelines. Its official repository currently reports approximately 10 GB VRAM for shape generation, 21 GB for texture generation, and 29 GB for the combined path. Treat outputs as source assets requiring a production art pipeline rather than ready-to-ship web files.
- Hunyuan3D 2.1 is not under an OSI-style permissive license. Its current community license defines a territory excluding the European Union, United Kingdom, and South Korea and restricts use/display outside that territory. The hosted Studio may have different terms, but those terms were not accessible from the public creation page during this audit. Task 1.27 is therefore a hard production gate.
- The OpenRouter TypeScript SDK package is `@openrouter/sdk`. The `openrouter/free` router selects a compatible free model at random; availability and rate limits can change. As reviewed on 2026-07-19, official documentation describes free models as experimental/low-volume and lists 50 free-model requests per day when lifetime credit purchases are below $10, with higher limits after qualifying purchases. Runtime code must handle current API errors/headers instead of hard-coding that snapshot.
- OpenRouter providers have different training, logging, and retention policies. Account- and request-level provider restrictions must be configured before public chat, and visitors must not be invited to send sensitive information.
- Animate UI is an MIT-licensed, open React/TypeScript/Tailwind/Motion component distribution. It is copy-first rather than a conventional opaque component package; imported source and transitive primitive licenses must be reviewed and adapted.
- Animate UI recommends root-level Motion configuration that follows the visitor's reduced-motion preference.
- Three.js GLTFLoader supports Draco, meshopt, and KTX2 integrations. Compression choices must be measured because smaller transfer can add decode/transcode cost.
- React Three Fiber guidance favors asset reuse, avoiding React state updates inside frame loops, minimizing mount/unmount churn, and using on-demand rendering when continuous motion is unnecessary.
- Refero Styles provides AI-readable design-system references. Store selected lessons and provenance in `DESIGN.md`; do not reproduce a reference site wholesale.

Primary sources for the above constraints:

- `https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1`
- `https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1/blob/main/LICENSE`
- `https://3d.hunyuan.tencent.com/studio/creation/concept`
- `https://openrouter.ai/docs/client-sdks/overview`
- `https://openrouter.ai/docs/cookbook/get-started/free-models-router-playground`
- `https://openrouter.ai/docs/guides/routing/model-variants/free`
- `https://openrouter.ai/docs/api_reference/limits`
- `https://openrouter.ai/docs/guides/privacy/provider-logging`
- `https://github.com/imskyleen/animate-ui`
- `https://github.com/imskyleen/animate-ui/blob/main/LICENSE.md`
- `https://animate-ui.com/docs`
- `https://animate-ui.com/docs/accessibility`
- `https://threejs.org/docs/pages/GLTFLoader.html`
- `https://threejs.org/docs/pages/DRACOLoader.html`
- `https://threejs.org/docs/pages/KTX2Loader.html`
- `https://r3f.docs.pmnd.rs/advanced/pitfalls`
- `https://r3f.docs.pmnd.rs/advanced/scaling-performance`
- `https://styles.refero.design/`

## Final Codex implementation prompt — approved Natural Observatory direction

Use this prompt for implementation and review only after the relevant Phase 1 decision tasks are checked:

```text
Build Carlos Carpio's portfolio as a multi-page editorial experience whose homepage is The Submerged Earth Observatory. Work only on ready tasks in maintaskplan.md and keep its evidence log current.

VISUAL SOURCE OF TRUTH
Use repository mainUI.png (1672×941; SHA-256 B4E11D325297CEB8FFB021866FFA2903B316D5D2443DEF67BA890B4B3F3058BF) as the approved composition, exposure, material, and atmosphere reference. Recreate it as real semantic UI plus an optional interactive 3D enhancement. Never ship the screenshot as the final full-page background.

VISUAL THESIS
A bright, calm, natural-futurist observatory: warm paper and limestone, pale ceramic machinery, sage water, aged oak and walnut, quiet pewter, editorial serif display type, restrained sans-serif utility text, and one contemplative mechanical focal figure. It must feel like Carlos's workshop of software, AI, music, electronics, future energy, astrology, and numerology—not dark steampunk, cyberpunk, generic beige SaaS, or a dashboard-card grid.

COMPOSITION
Keep the first viewport poster-like and legible: CC mark and Carlos Carpio identity; Work, Laboratory, Sound, Cosmos, Story, and Contact navigation; one short role line; one 2–3 line headline; one concise supporting statement; a focused CTA pair; one dominant Observatory scene; unobtrusive sound/motion controls; a lower-right CC AI entry; and a narrow SELECTED SYSTEMS transition. Preserve calm text-safe space on the left. On mobile, prioritize identity, headline, CTAs, project paths, and a strong static/cropped visual before loading heavy 3D.

COLOR CONTRACT
Use the semantic token system in this plan. The exact supplied palette anchors are #A38772 taupe, #C1BFB0 stone sage, #B1B199 muted sage, #ECDFCF sand, #FEF4EA warm ivory, #CFA18A clay, #CCCAB5 pale sage, #E5DFD3 off-white, #77715B dark sage, #BE967D warm taupe, #DCC1AC buff, and #E8BDB4 dusty pink. mainUI.png adds representative anchors #E8DFD5 parchment, #AEA090 stone, #9D8A73 taupe, #C9B49E sand, #D7C7B5 linen, #6F6655 shadow sage, #8B755D oak, #5F4B35 walnut, #2E2417 espresso, and #4B3520 deep wood.

Keep warm off-white/linen dominant, then buff/taupe, sage/stone, wood, water/metal, and only small clay/dusty-pink warmth. No cyan, turquoise, electric blue, violet, neon, rainbow gradient, bright orange glow, crushed black, or near-black theme. Taupe #A38772 uses deep-espresso text; warm-ivory text is reserved for walnut #5F4B35 or darker surfaces. Validate all actual and translucent color pairings to WCAG 2.2 AA.

DOM AND CANVAS ARCHITECTURE
Semantic HTML owns headings, copy, navigation, CTAs, project links, chat controls, loading/error states, and every essential action. A Three.js/React Three Fiber canvas may own the environment, robot, water, artifacts, camera, and pointer/touch scene interaction. The experience must retain the same content and primary paths in full-3D, reduced-quality, static, no-WebGL, no-JavaScript where practical, and reduced-motion modes. Start poster-first; never show a blank hero while assets load.

3D ASSETS
Use a provider-neutral, rights-cleared asset pipeline. Hunyuan Studio or Hunyuan3D 2.1 is optional and may not be used for production until task 1.27 confirms terms covering generation location and worldwide public display, including the EU, UK, and South Korea. Otherwise use original authored, procedural, user-owned, or permissively licensed assets. Never call a 3D generation provider from the public browser runtime. Review and optimize every accepted asset for originality, rights, topology, UVs, PBR maps, palette, scale, pivots, LODs, GLB size, texture memory, mobile cost, and static fallback.

MOTION
Use 2–3 purposeful motifs: a reading-order hero entrance, a restrained scene/depth transition, and one clear hover/focus/touch response. Selected Animate UI source components plus Motion may own DOM animation; R3F owns scene animation; CSS owns simple state transitions. Assign each property to one owner. Configure MotionConfig reducedMotion="user", stop parallax/camera loops for reduced motion, provide a pause/static control for nonessential continuous motion, and avoid scroll hijacking or animation noise.

CC AI
Use @openrouter/sdk only behind a server route. Treat openrouter/free as a low-volume prototype route with random model selection and changing availability/limits, not a production SLA. Keep the API key out of client bundles; disclose the actual responding model; restrict providers by approved data/training policy; ground answers only in approved public portfolio records; make uncertainty explicit; bound messages, concurrency, retries, retention, and logs; and design stop, retry, timeout, 402/429, provider-failure, privacy, and unavailable-chat states. The rest of the portfolio must work without chat.

ANIMATE UI AND REFERO
Animate UI is copy-first source, not a ready-made visual theme. Import only components that improve comprehension, preserve applicable licenses/notices, and replace their defaults with this palette and typography. Use Refero Styles only to study typography, spacing, navigation, and interaction patterns; record selected lessons in DESIGN.md and do not copy another product's branding, layout, assets, or language.

QUALITY BAR
Design mobile and desktop intentionally. Keep touch targets at least 44px, keyboard focus visible, canvas actions duplicated in DOM, audio mute-first, and all meaningful media labeled. Bound DPR and render work, pause offscreen/hidden animation, lazy-load noncritical media and 3D, dispose replaced GPU resources, and measure transfer/parse/GPU/thermal cost. Verify 390px and 1440px compositions, 200% zoom, keyboard flow, screen-reader order, reduced motion, static fallback, WebGL failure, contrast, and side-by-side palette/exposure against mainUI.png. Record intentional deviations in DESIGN.md; unexplained palette or hierarchy drift is a defect.
```

## Decision log

| Date | Decision | Status | Rationale / consequence |
| --- | --- | --- | --- |
| 2026-07-19 | Treat the provided `PORTAFOLIO` folder as the local root of the empty GitHub repository. | Accepted | Preserves the research artifact and makes the plan/instructions part of the project rather than a sibling folder. |
| 2026-07-19 | Keep framework selection open until Phase 1. | Active | Research favors Astro; WebDesigner guaranteed scaffolds favor Next.js/React-Vite. The project must decide from requirements, not template convenience. |
| 2026-07-19 | Include the Submerged Earth Observatory as a v1 immersive homepage requirement. | Accepted | The user explicitly approved the visual direction and requested conversion into a real animated 3D interface. Semantic HTML and fallback tiers remain mandatory. |
| 2026-07-19 | Keep the production 3D asset pipeline provider-neutral; treat Hunyuan as conditional, offline authoring only. | Active / gated | The current Hunyuan3D 2.1 license excludes the EU, UK, and South Korea and restricts use/display outside its territory. No Hunyuan-derived public asset ships until task 1.27 documents terms or permission covering the intended worldwide portfolio use. |
| 2026-07-19 | Use React-compatible UI and 3D tooling. | Active | Animate UI is React-based and the proposed scene uses React Three Fiber; Phase 1 must choose Next.js or React/Vite based on server-route and deployment requirements. |
| 2026-07-19 | Use OpenRouter through a server-only service boundary for CC AI. | Active | The prototype may use `openrouter/free`, but random model selection, provider data policies, free-tier limits, availability, latency, and answer quality are variable; production needs actual-model disclosure, policy filtering, bounded use, and configurable fallback. |
| 2026-07-19 | Separate DOM motion from scene motion. | Active | Animate UI/Motion owns semantic UI; R3F owns canvas motion. Reduced-motion and static experiences must preserve all information and actions. |
| 2026-07-19 | Lock the approved natural palette across DOM, canvas, generated assets, chat, and fallbacks. | Accepted | Prevents framework defaults, Hunyuan textures, HDR environments, or post-processing from drifting toward blue, violet, neon, near-black, or an unrelated generic 3D style. |
| 2026-07-19 | Override Nightglass's dark color defaults with the approved Natural Observatory palette while retaining its hierarchy/accessibility discipline. | Accepted | The user-supplied reference is the stronger explicit brand direction; dark canvas and electric-aqua tokens would contradict `mainUI.png`. |
| 2026-07-19 | Keep one authoritative plan and embed the reusable implementation prompt within it. | Accepted | `maintaskplan.md` is the execution ledger; parallel v2/v3 plans and a standalone prompt caused drift and are unnecessary once their unique content is consolidated. |

## Open risks

- Portfolio content, CV facts, portrait, personal media, and asset rights still need user confirmation.
- Live demo availability and repository facts can change and must be re-verified during curation.
- The GitHub repository still has no published branch; the prepared local foundation branch cannot be pushed until the project command policy permits the external write.
- Hunyuan production use is unresolved: the current Hunyuan3D 2.1 license does not cover use/display in the EU, UK, or South Korea, and the hosted Studio terms still require an archived review. A rights-cleared alternative must remain available.
- Any generated 3D mesh may require substantial retopology, UV/material repair, rigging, manual art direction, and rights review before it is web-ready.
- Hunyuan3D 2.1 local shape and texture generation has significant GPU requirements; the official repository currently reports 10 GB, 21 GB, and 29 GB VRAM for shape, texture, and combined paths respectively.
- `openrouter/free` is appropriate for prototyping but has variable model selection, availability, latency, quality, and rate limits; it must not be treated as a production SLA.
- OpenRouter routes to providers with differing training, logging, and retention policies; CC AI cannot launch until provider restrictions and visitor privacy copy match the actual configuration.
- The observatory scene can easily exceed mobile GPU, memory, thermal, and bandwidth budgets unless LODs, texture compression, adaptive quality, poster-first loading, and static fallbacks are enforced.
- WebGL water, reflections, multiple animated GLBs, audio response, DOM motion, and streaming chat may compete for main-thread/GPU resources and require measured scheduling.
- The CC AI knowledge base and system prompt must exclude private memories, sensitive family/work information, and unsupported biographical claims.
