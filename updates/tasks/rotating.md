# Interactive Project Orbit — execution board

Replace the Selected Systems rail on the homepage with an interactive Three.js
Project Orbit / Repository Solar System (wide horizontal brass ellipse, CAM² medallion
center, data-driven project nodes, drag/hover/select/launch).

Original feature spec (full narrative detail, kept verbatim): [`rotating-spec.md`](rotating-spec.md)
Visual reference: `imagesandvideo/ChatGPT Image Aug 13, 2026, 10_11_48 AM.png` (dark
black + antique gold ellipse, CAM² center, 10 icon-medallion nodes with pill labels,
small brass balls on the rail, dotted spokes, subtle mechanical detail upper-right).

**Conventions on this board**
- `[ ] ☐` = not done or not verified · `[x] ☑` = implemented AND verified, with dated
  evidence in the Implementation Log.
- Parent/child rule: a phase header checkbox may only become `[x] ☑` when every required
  child task under it is `[x] ☑`.
- Blocker rule: when something cannot be verified, leave it `[ ] ☐` and add
  `BLOCKED: <specific reason>` beneath it. Never guess, never invent data.
- Task tracking for this feature lives HERE and is registered on
  [`../TASKBOARD.md`](../TASKBOARD.md). Do NOT write this sequence into `taskplan.md` —
  that file is the ANA / Repo2Agent ledger only. (This corrects the original spec's
  Phase 0 instruction.)
- Owners: `CODEX` builds · `CLAUDE` verifies every gate before it opens · `CARLOS`
  approvals (palette, roster, destinations, switch flip).

## Status

**Pipeline reviewed and restructured 2026-08-13. A user-directed Claude Design handoff port is
implemented in the shared dirty worktree, but is not board-compliant or marked complete.**
Every implementation checkbox below remains unchecked; the clean-worktree, switch, and
data-governance gates were bypassed by the direct request and require reconciliation before any
gate may pass.

**2026-08-13 — Carlos directed the orbit into the Observatory hero** as a transparent overlay on
the figure, replacing the painted chest atom and the standalone ink band below the hero. That
amends ORB-9.2 (“section between hero and laboratory”) and requirement 10 (“lazy below the fold”):
the canvas still loads through `dynamic(..., { ssr: false })` and pauses off-screen, but the stage
now lives in the first viewport so the Three chunk can load on first paint. Gates stay unchecked
until browser evidence is recorded.

## Objective

Replace ONLY the current Selected Systems presentation (the `ObservatoryAtom` rail at
the bottom of the homepage hero) with an interactive, data-driven 3D Project Orbit:

- horizontally flattened elliptical orbit (real ellipse math, not a scaled circle)
- precision mechanical / astronomical aesthetic (antique brass on warm black)
- CAM² logo medallion fixed at the center (existing approved `logo.png`, never regenerated)
- repository/project nodes orbit the center; labels always upright and readable
- slow clockwork idle rotation; user can drag; hover highlights; click selects;
  selection rotates the chosen project smoothly into a front-center focus position
- focused project offers real destinations (live app, internal case study, GitHub, agent)
  resolved from project DATA — never hardcoded per project
- ANA / Repo2Agent can drive it later through a documented controller API (interface
  only in V1)

The ANA hero (video, copy, CACM AI panel) and the rest of the homepage remain intact.

## Non-negotiable requirements

1. Hero untouched: video, scrims, headline, actions, CACM AI panel keep working exactly as today.
2. Only the Selected Systems presentation is replaced; the `#selected-systems` anchor keeps
   working (the hero secondary CTA and `content-contract.test.ts` pin it).
3. One source of truth for project data: `siteContent.projects`
   (`site/src/content/records.ts` + `schemas.ts`). No parallel project list, no duplicated
   metadata, no invented URLs, names, or statuses (content-integrity rules apply).
4. Real mathematical ellipse: `x = cos(a)·radiusX`, `z = sin(a)·radiusZ`, `radiusX >> radiusZ`.
5. Labels are accessible HTML, never rotated upside down, never baked into textures.
6. Navigation comes from a data-driven destination resolver; zero `if (project === "X")` logic.
7. Click-vs-drag threshold so dragging never accidentally opens a project.
8. Semantic HTML fallback: every project reachable without WebGL, with keyboard, and with
   screen readers; complete `prefers-reduced-motion` path.
9. Palette: warm blacks + antique brass/gold ONLY through approved `naturalPalette` tokens
   (`palette:check` enforces this). No cyan, electric blue, purple, neon, bloom carnival.
10. Three.js loads lazily below the fold; the homepage's initial JS and CLS 0 baseline are
    preserved; renderer pauses when hidden or out of view.
11. `pnpm verify` stays green at every merge; existing contract tests are updated
    deliberately (as recorded decisions), never deleted to make a build pass.

## Architecture decisions

### Verified findings (audited 2026-08-13 — the DISCOVER work, evidence in file paths)

- **Framework:** Next.js 16.2.10 App Router + React 19.2.4, strict TypeScript, Tailwind 4,
  pnpm, Node 22 (`site/package.json`).
- **3D stack already installed and contract-pinned:** `three@0.185.1`,
  `@react-three/fiber@9.6.1`, `@react-three/drei@10.7.7`
  (`site/src/tests/three-runtime-boundary.test.ts` pins exact versions, requires client-only
  lazy canvas ownership, `ssr:false`, DPR `[1, 1.5]`, demand frameloop policy, a named drei
  allowlist, and forbids `three` imports inside `src/app` routes).
  **Decision: build with React Three Fiber.** It is the established, contract-tested stack;
  vanilla Three.js would fight the existing boundary tests. Anime.js is not used anywhere;
  DOM motion uses the `motion` package; scene animation uses R3F's frame loop.
- **Current Selected Systems:** `site/src/app/page.tsx` (lines ~160–179) renders
  `.selected-systems` as an absolute overlay at the hero's bottom, driven by
  `ObservatoryAtom` (`site/src/components/observatory-atom.tsx` — DOM/CSS Bohr atom, rAF
  loop, IntersectionObserver pause, reduced-motion handling). It is NOT a static three-card
  grid anymore; the original spec's description is outdated.
- **Project data:** `siteContent.projects` has exactly **3 featured concept projects**
  (ASTRAEA, PINÁCULO, Future Energy) — all `status: "concept"`, `publication: "hold"`,
  `links: []`, destinations `/work/<slug>` only. `content-contract.test.ts` asserts
  `projects.length === 3` and hold-status. There are NO verified live-app or GitHub URLs in
  site content today. `site/src/content/site.ts` is `server-only`; client components receive
  plain serializable props (the `ObservatoryAtom` pattern).
- **Design/palette law:** `docs/design/DESIGN.md` locks a warm natural palette and forbids an
  "almost-black replacement theme"; `site/scripts/validate-palette.ts` rejects any hex not in
  `naturalPalette` (`site/src/styles/palette.ts`) and treats `#050505` as a forbidden
  sentinel. The reference image's `#0B0907/#15100C/#21170F` + brass/gold are therefore
  **not currently legal** — Gate A includes a scoped palette amendment.
- **3D was retired:** decision `Q.3` (2026-07-31, `updates/06-decisions.md`) killed the hero
  3D world; `V.13` (TASKBOARD, Wave 2) deletes `site/src/lib/three/**`,
  `site/src/components/three/**`, `site/public/three/decoders/**`, the `U.20` canvas gate
  (`OBSERVATORY_LIVE_CANVAS_PRESENTATION`), and the `assets:check`/`immersive:check` gates.
  This task **amends** that history: 3D returns scoped to one below-the-fold section, by
  Carlos's explicit 2026-08-13 request and reference image. Must be recorded (Gate A).
- **Approved assets:** `imagesandvideo/logo.png` (CAM² monogram) is in the local media
  clearance register with decision `include` — usable for the medallion. The reference PNG is
  NOT registered; do not ship it as a site asset (CSS/three recreate the look instead).
- **Verify chain:** `pnpm verify` = format:check → lint (0 warnings) → typecheck → unit tests
  (node:test via tsx) → brain/content/palette/boundary/assets gates → build → immersive gate.
  Tests are source-contract style (regex over source + pure-function units) — orbit math and
  contracts fit this pattern; rendered behavior is verified in a real browser.
- **Baselines to protect (TASKBOARD):** client JS 2 879 KB / 23 files; homepage transfer
  4 150 KB desktop, 4 039 KB mobile; CLS 0; 12 routes; `pnpm verify` green.

### Decisions to record or confirm at Gate A (proposals ready)

- **D-008 (docs/DECISIONS.md):** "Scoped return of 3D as the Project Orbit section." Amends
  Q.3's blanket retirement: hero stays video; exactly one lazy R3F canvas below the fold;
  `V.13` still deletes the dead observatory layer but MUST keep the `three`/`@react-three/*`
  dependencies and hand its test/gate rewrites to this board's contracts.
- **V.13 sequencing:** recommended **V.13 lands first**, then the orbit builds clean in
  `site/src/components/project-orbit/` (self-contained; no imports from doomed
  `components/three/**` or `lib/three/**`). If V.13 is delayed, the orbit may still proceed
  because it is self-contained — record whichever order actually happens.
- **Palette amendment:** sample the warm blacks + brass/gold values from the reference image,
  name them (e.g. `orbitBlack`, `orbitCoal`, `orbitUmber`, `antiqueBrass`, `agedGold`,
  `warmAmber`), submit to Carlos, then add to `naturalPalette` + `threeMaterialPalette`
  roles. DESIGN.md gets one paragraph scoping the dark treatment to this section only.
- **Presentation switch (rollback strategy):** reuse the proven `U.20` gate pattern — a
  one-line const `PROJECT_ORBIT_PRESENTATION: "atom" | "orbit"` in `orbit-config.ts`.
  Default stays `"atom"` until Gate E passes. `ObservatoryAtom` is deleted only at Gate F.
- **Labels approach:** decided by the ORB-3 spike — drei `Html` (requires extending the drei
  allowlist + boundary test) vs. a plain DOM overlay positioned from projected orbit math
  (no allowlist change). Either way labels are real HTML.
- **Anchor and heading:** section id stays `#selected-systems`; heading copy stays
  "Selected Systems" unless Carlos renames it (record if renamed).

## Milestone gates

No phase may start before its listed gate requirement. CLAUDE verifies each gate and
records evidence in the Implementation Log before the next phase begins.

### MILESTONE A — ARCHITECTURE APPROVED (after ORB-1)
- [ ] ☐ Framework/stack identified and recorded (done in review; re-confirmed at ORB-0)
- [ ] ☐ Selected Systems implementation + affected files documented
- [ ] ☐ Project data source identified; adapter approach chosen
- [ ] ☐ D-008 decision recorded in `docs/DECISIONS.md`
- [ ] ☐ Palette amendment approved by Carlos and `palette:check` green with new tokens
- [ ] ☐ V.13 coordination order recorded
- [ ] ☐ Rollback switch strategy recorded
**No Three.js implementation work before this gate passes.**

### MILESTONE B — ORBIT PROTOTYPE WORKS (after ORB-4)
- [ ] ☐ Real mathematical ellipse (unit-tested `getOrbitPosition`)
- [ ] ☐ Three temporary nodes render on the ellipse
- [ ] ☐ Horizontal flattening visibly and numerically correct (radiusX ≫ radiusZ)
- [ ] ☐ Camera perspective matches the reference framing intent
- [ ] ☐ Front/rear depth ordering correct; stable rendering; zero console errors/warnings
**No project polish, rails, or particles before this gate passes.**

### MILESTONE C — INTERACTION WORKS (after ORB-6)
- [ ] ☐ Idle rotation, drag (mouse + touch), inertia
- [ ] ☐ Click-vs-drag threshold verified (no accidental opens)
- [ ] ☐ Hover highlight with smooth interpolation
- [ ] ☐ Selection rotates shortest-path into front-center focus (600–1000 ms, eased, interruptible)
- [ ] ☐ Labels remain upright through all rotation states
- [ ] ☐ Keyboard parity for rotate/select; page scroll never trapped
**No homepage replacement before this gate passes.**

### MILESTONE D — NAVIGATION WORKS (after ORB-7)
- [ ] ☐ Destinations resolved from project data only (unit-tested resolver)
- [ ] ☐ Every configured project's destination verified valid (internal route renders / URL returns 200)
- [ ] ☐ External links open with `noopener,noreferrer` in a new tab
- [ ] ☐ First click selects; explicit second action launches (no accidental launches)
- [ ] ☐ Missing destinations degrade honestly (no dead or invented links)

### MILESTONE E — HOMEPAGE INTEGRATION WORKS (after ORB-9)
- [ ] ☐ Orbit replaces the atom presentation behind the switch
- [ ] ☐ ANA hero visually and functionally unchanged (video, copy, CACM AI, scrims)
- [ ] ☐ `#selected-systems` anchor scrolls to the orbit section
- [ ] ☐ Layout stable: CLS 0 maintained, laboratory section flows correctly after it
- [ ] ☐ Both switch states (`atom`/`orbit`) build and pass `pnpm verify`

### MILESTONE F — PRODUCTION READY (after ORB-13)
- [ ] ☐ Desktop, tablet, mobile verified in real browsers
- [ ] ☐ Keyboard-only journey and screen-reader labels verified
- [ ] ☐ Reduced-motion path verified
- [ ] ☐ WebGL-unavailable fallback verified
- [ ] ☐ Performance within agreed budgets; renderer pauses off-screen/hidden
- [ ] ☐ `pnpm verify` (including production build) green
- [ ] ☐ Old atom implementation removed; dev harness removed; docs/TASKBOARD updated

## Implementation pipeline

Sequential. Do not reorder without recording why. Each task is one objectively
verifiable engineering step.

### ORB-0 — Preflight (DISCOVER re-check) · owner CODEX
- [ ] ☐ **ORB-0.1** · Create/confirm working branch in Codex's worktree (e.g. `feat/project-orbit`); `git status` clean of unrelated changes
  BLOCKED: On 2026-08-13 the shared worktree is on `main` at `7d7d63f` and contains unrelated, uncommitted ANA / Repo2Agent, documentation, configuration, media, and task-board changes. Creating or switching an orbit branch would preserve but not isolate those user-authored changes, so the required clean-worktree condition is not verifiable without a separate clean worktree or direction from Carlos.
- [ ] ☐ **ORB-0.2** · Run `pnpm verify` in `site/`; record green baseline output date/hash
- [ ] ☐ **ORB-0.3** · Re-confirm the audited findings above still hold (page.tsx rail, 3 projects, deps, gates); note any drift in the log
- [ ] ☐ **ORB-0.4** · Confirm V.13 status on TASKBOARD (merged? open?) and record which sequencing branch of D-008 applies

### ORB-1 — Decision records & contract amendments (PLAN) · owner CLAUDE + CARLOS → GATE A
- [ ] ☐ **ORB-1.1** · Write D-008 in `docs/DECISIONS.md` (scoped 3D return, V.13 dependency-keep clause, one-canvas rule)
- [ ] ☐ **ORB-1.2** · Sample and name orbit palette tokens from the reference image; add to `site/src/styles/palette.ts` (`naturalPalette` + `threeMaterialPalette` roles) — submit for Carlos approval
      BLOCKED until Carlos approves the exact token values.
- [ ] ☐ **ORB-1.3** · Add the scoped-dark-section paragraph to `docs/design/DESIGN.md` (amends "no almost-black replacement theme" with a bounded exception for this section)
- [ ] ☐ **ORB-1.4** · Run `pnpm palette:check` — green with the new tokens
- [ ] ☐ **ORB-1.5** · Record the presentation-switch plan (`PROJECT_ORBIT_PRESENTATION`, default `"atom"`)
- [ ] ☐ **ORB-1.6** · Verify Gate A checklist; CLAUDE signs the log entry

### ORB-2 — Data model (MODEL DATA) · owner CODEX
- [ ] ☐ **ORB-2.1** · Extend `site/src/content/schemas.ts` with orbit-relevant, optional project fields (e.g. `shortName`, orbit icon reference, destination metadata on existing `links`) — zod-validated, no breaking change to the 3 existing records
- [ ] ☐ **ORB-2.2** · Define `OrbitProjectView` (serializable) + `resolveDestination(project)` in `site/src/components/project-orbit/types.ts` / adapter: precedence live-app → internal route → GitHub → details; returns `{ kind, href, external, label }`
- [ ] ☐ **ORB-2.3** · Server adapter `selectOrbitProjects()` mapping `siteContent.projects` (the current 3) to `OrbitProjectView[]`; no client import of server-only modules (`boundary:check` green)
- [ ] ☐ **ORB-2.4** · Unit tests: destination precedence, disabled/missing-link degradation, adapter output for the 3 real records
- [ ] ☐ **ORB-2.5** · `pnpm test` green (content contract untouched at length 3 in this phase)

### ORB-3 — Technical spike (TECHNICAL SPIKE, timeboxed ~1 session) · owner CODEX
- [ ] ☐ **ORB-3.1** · Dev-only harness page `site/src/app/dev/orbit/page.tsx` returning `notFound()` outside development; confirm zero effect on production build/route output
- [ ] ☐ **ORB-3.2** · Lazy client boundary (`next/dynamic`, `ssr:false`) mounting a minimal R3F `<Canvas>` — no `three` imports in the route file (three-runtime-boundary rule holds for the new folder)
- [ ] ☐ **ORB-3.3** · Decide frameloop strategy: `demand` + `invalidate()` ticker vs `always`-while-visible; record choice + rationale (slow continuous rotation must not spin a hidden GPU)
- [ ] ☐ **ORB-3.4** · Decide label mechanism: drei `Html` (extend allowlist + its test) or DOM overlay from projected coordinates; record choice
- [ ] ☐ **ORB-3.5** · Measure the lazy three chunk size (gzipped) from a production build; record the number for the V.9/ORB-11 budget conversation
- [ ] ☐ **ORB-3.6** · Verify: mounts in Next 16/React 19 with no hydration mismatch, no console errors, WebGL context-loss handler stub in place

### ORB-4 — Basic orbit prototype (BASIC ORBIT PROTOTYPE → VERIFY GEOMETRY) · owner CODEX → GATE B
- [ ] ☐ **ORB-4.1** · `orbit-math.ts`: `getOrbitPosition(angle, config) → {x,y,z}` with `radiusX ≈ 7.5`, `radiusZ ≈ 2.6–3.0` (tunable config, not constants scattered in components)
- [ ] ☐ **ORB-4.2** · Node angle assignment `angle = orbitRotation + index / count · 2π` (+ optional featured offset) — pure function
- [ ] ☐ **ORB-4.3** · Unit tests: flattening ratio, even distribution, front/rear z-sign classification, angle wrapping, shortest-path delta helper
- [ ] ☐ **ORB-4.4** · Render three temporary placeholder nodes + a thin single-line ellipse guide (no TubeGeometry rails yet)
- [ ] ☐ **ORB-4.5** · Slow frame-independent idle rotation (`rotation += speed · deltaTime`; one revolution ≈ 45–90 s; `orbitSpeed`/`orbitRotation` in `orbit-config.ts`)
- [ ] ☐ **ORB-4.6** · Depth attenuation v1: scale/opacity from normalized z (front ≈ 1.1, rear ≈ 0.82; nothing disappears)
- [ ] ☐ **ORB-4.7** · Camera framing: slight elevation, whole ellipse in frame at target aspect ratios; recorded values in config
- [ ] ☐ **ORB-4.8** · Reduced-motion: rotation off, nodes statically distributed
- [ ] ☐ **ORB-4.9** · Verify Gate B in the dev harness (screenshot + console clean); CLAUDE signs

### ORB-5 — Component architecture & real nodes · owner CODEX
- [ ] ☐ **ORB-5.1** · Structure `site/src/components/project-orbit/` (repo kebab-case): `project-orbit.tsx` (section wrapper: heading, fallback, lazy scene), `project-orbit-scene.tsx`, `orbit-track.tsx`, `orbit-node.tsx`, `orbit-labels.tsx`, `orbit-center.tsx`, `use-orbit-state.ts`, `orbit-math.ts`, `orbit-config.ts`, `types.ts`
- [ ] ☐ **ORB-5.2** · Semantic fallback `<ul>` of project links ALWAYS in the DOM (it is the screen-reader/keyboard structure and the no-WebGL/no-JS path), visually swapped when the canvas is ready
- [ ] ☐ **ORB-5.3** · WebGL capability detection → canvas never mounts when unsupported; fallback stays; status text pattern like the existing scene-status copy
- [ ] ☐ **ORB-5.4** · Center medallion v1: disc + existing approved `logo.png` texture (no regeneration, no continuous spin)
- [ ] ☐ **ORB-5.5** · Real nodes from `selectOrbitProjects()` (the 3 approved projects); enlarged invisible hit areas
- [ ] ☐ **ORB-5.6** · Upright HTML labels per ORB-3.4 decision; readable at rest and while rotating
- [ ] ☐ **ORB-5.7** · Define `OrbitController` interface in `types.ts`: `selectProject`, `focusProject`, `activateProject`, `openProject`, `pauseOrbit`, `resumeOrbit`, `resetOrbit`, plus reserved typed no-ops `activateAgent`, `activateAgentFlow` (Repo2Agent future API — interface only, no ANA wiring)
- [ ] ☐ **ORB-5.8** · Contract test: fallback list presence, no `three` import from `src/app`, palette compliance; `pnpm test` green

### ORB-6 — Core interaction (CORE INTERACTION → VERIFY INTERACTION) · owner CODEX → GATE C
- [ ] ☐ **ORB-6.1** · Interaction state machine in `use-orbit-state.ts`: `idle` / `dragging` / `focusing` / `focused` (+ `paused`); unit-test transitions
- [ ] ☐ **ORB-6.2** · Pointer drag rotates `orbitRotation` (Pointer Events, mouse + touch); inertia with damping on release
- [ ] ☐ **ORB-6.3** · Click-vs-drag threshold (< 5 px movement = click); verified against accidental opens
- [ ] ☐ **ORB-6.4** · Touch strategy preserves vertical page scroll (`touch-action: pan-y`; horizontal-intent capture only)
- [ ] ☐ **ORB-6.5** · Hover: node scale +5–10 %, label contrast up, orbit slows; all smoothly interpolated (frame-rate-independent damping)
- [ ] ☐ **ORB-6.6** · Selection: shortest rotational path to front-center focus angle, 600–1000 ms eased, interruptible by new input
- [ ] ☐ **ORB-6.7** · Keyboard: fallback-list focus highlights the matching node; arrow keys step focus; Enter/Space selects — same state machine
- [ ] ☐ **ORB-6.8** · Implement the orbit-control subset of `OrbitController` (`selectProject`/`focusProject`/`pauseOrbit`/`resumeOrbit`/`resetOrbit`)
- [ ] ☐ **ORB-6.9** · Reduced-motion selection = short minimal transition; verify
- [ ] ☐ **ORB-6.10** · Verify Gate C in dev harness (desktop pointer + touch emulation + keyboard); CLAUDE signs

### ORB-7 — Navigation & launch UX (NAVIGATION → VERIFY NAVIGATION) · owner CODEX → GATE D
- [ ] ☐ **ORB-7.1** · Focus panel v1 on selection: project name, descriptor, primary `[Open]` action + `[GitHub]` when present — all from `resolveDestination` data
- [ ] ☐ **ORB-7.2** · First click selects/focuses; explicit second action launches. (Direct-launch stays available later via `openOnFirstClick` config, default off)
- [ ] ☐ **ORB-7.3** · Internal destinations use `next/link`/router; external use new tab + `noopener,noreferrer`; unit-test the attribute/branch logic
- [ ] ☐ **ORB-7.4** · No-destination projects show an honest state (e.g. case-study-only) — no dead buttons, no invented URLs
- [ ] ☐ **ORB-7.5** · Verify all 3 real projects: `/work/astraea`, `/work/pinaculo`, `/work/future-energy` render; keyboard launch works; drag never launches
- [ ] ☐ **ORB-7.6** · Test fixture covers external-type destination handling (until real external links are approved in ORB-8)
- [ ] ☐ **ORB-7.7** · Verify Gate D; CLAUDE signs

### ORB-8 — Real project roster expansion (REAL PROJECT DATA) · owner CODEX + CARLOS (+ `$curate-portfolio-content`)
Target roster (from spec): SmartChatbot, ASTRAEA, PINÁCULO, Future Energy, Sound Lab,
Repo2Agent, StrudelAI, 3Doodle, iFoundYou, Avatar Studio.
- [ ] ☐ **ORB-8.1** · Curate each new project record via `$curate-portfolio-content`: verified title, descriptor, category, GitHub URL (from `updates/02-github-inventory.md` + live check), live URL only if it returns 200 and is Carlos's, internal route only if it exists
      BLOCKED: most roster projects have no verified live URL today (arcade `C.2`/Railway hosting not built); GitHub-only or internal-route destinations are the honest default until then.
      BLOCKED: "SmartChatbot" destination undefined — Carlos must confirm whether it is the in-site assistant (internal anchor), a repo, or a live app.
      BLOCKED: Sound Lab has no player (`/sound` is source-held); its node links to `/sound` as a room, not a playable app.
- [ ] ☐ **ORB-8.2** · Carlos approves the roster + destination set (Q.11-adjacent decision; record in `updates/06-decisions.md`)
- [ ] ☐ **ORB-8.3** · Add approved records to `records.ts`; update `content-contract.test.ts` expectations as part of the SAME approved change (length, hold rules); `content:check` green
- [ ] ☐ **ORB-8.4** · `featured: true` drives ASTRAEA's initial top position via the angle-offset formula (no hardcoded coordinates)
- [ ] ☐ **ORB-8.5** · Verify orbit renders and distributes N approved projects (works for 3, 10, or more) with acceptable label density
- [ ] ☐ **ORB-8.6** · Node icon source decided: existing approved assets or neutral engraved-initial medallions (default) — no unlicensed icon packs
      BLOCKED: no approved icon set exists yet; default is engraved initials until Carlos approves artwork.

### ORB-9 — Homepage integration behind switch (HOMEPAGE INTEGRATION) · owner CODEX → GATE E
- [ ] ☐ **ORB-9.1** · Precondition recorded: V.13 merged, or orbit confirmed self-contained against the doomed folders
- [ ] ☐ **ORB-9.2** · New full-width section `<section id="selected-systems">` between the hero and the laboratory section hosting `<ProjectOrbit>` (desktop height ~600–780 px, reserved to keep CLS 0); heading + count kept
- [ ] ☐ **ORB-9.3** · Switch `PROJECT_ORBIT_PRESENTATION` selects atom-in-hero (current) vs orbit-section; default remains `"atom"` until Gate E verified
- [ ] ☐ **ORB-9.4** · In orbit mode: the old absolute rail is not rendered inside the hero; hero scrims/copy/video/CACM AI unchanged; the hero's bottom edge composition reviewed
- [ ] ☐ **ORB-9.5** · Update `observatory-hero-shell.test.ts` + `globals.css` contracts for both switch states, deliberately, with a log entry (never loosen unrelated assertions)
- [ ] ☐ **ORB-9.6** · Anchor check: hero secondary CTA "Enter the Observatory" scrolls to the orbit section
- [ ] ☐ **ORB-9.7** · Verify Gate E at desktop + mobile widths in a real browser; CLS measured 0; CLAUDE signs

### ORB-10 — Responsive + accessibility (RESPONSIVE + ACCESSIBILITY) · owner CODEX, verify CLAUDE
- [ ] ☐ **ORB-10.1** · Deliberate mobile strategy (not a shrunken desktop): reduced `radiusX`, larger hit targets, labels only near the foreground arc, tap = select-then-confirm; recorded in `orbit-config.ts` breakpoints
- [ ] ☐ **ORB-10.2** · 320 px readability decision: if the ellipse cannot stay legible, mobile ≤ 389 px uses the semantic list presentation (already built as fallback) — record the chosen cutoff
- [ ] ☐ **ORB-10.3** · Tablet config verified (fewer simultaneous labels)
- [ ] ☐ **ORB-10.4** · Keyboard: Tab/Shift+Tab reach every project, Enter/Space select/launch, visible focus ring, focus order logical
- [ ] ☐ **ORB-10.5** · Screen reader: name, descriptor, destination kind announced; selection announced via `aria-live=polite`; canvas `aria-hidden` with the semantic list as the accessible surface
- [ ] ☐ **ORB-10.6** · `prefers-reduced-motion`: no continuous rotation, static distribution, minimal selection transition, entrance replaced by immediate presentation
- [ ] ☐ **ORB-10.7** · 200 % zoom usable; touch targets ≥ 44 px; contrast of gold-on-black label/panel text meets WCAG 2.2 AA with the approved tokens

### ORB-11 — Performance (PERFORMANCE) · owner CODEX (+ GROK/V.9 budget agreement)
- [ ] ☐ **ORB-11.1** · Three chunk only loads near the section (dynamic import triggered by approach; skeleton/fallback first); verify initial homepage JS unchanged before scroll
- [ ] ☐ **ORB-11.2** · Record orbit chunk size vs the ORB-3.5 spike number; agree a budget line with V.9 (proposal: lazy orbit chunk ≤ 250 KB gzip; zero added blocking JS)
- [ ] ☐ **ORB-11.3** · DPR capped per runtime policy `[1, 1.5]`; shared geometries/materials; no post-processing/bloom
- [ ] ☐ **ORB-11.4** · Renderer pauses when `document.hidden` or section out of view (IntersectionObserver), resumes cleanly; verified via performance panel
- [ ] ☐ **ORB-11.5** · Steady-state profile on a mid-range mobile: no thermal spiral, no unbounded memory (dispose on unmount verified)
- [ ] ☐ **ORB-11.6** · CLS stays 0 (reserved section height); homepage transfer delta recorded against the 4 150/4 039 KB baseline

### ORB-12 — Visual polish (VISUAL POLISH — only after Gates B–D) · owner CODEX, design verify CLAUDE
- [ ] ☐ **ORB-12.1** · Mechanical rail: `EllipseCurve` → sampled points → `CatmullRomCurve3` → `TubeGeometry`, 2–3 parallel rails replacing the guide line
- [ ] ☐ **ORB-12.2** · PBR brass/bronze materials from `threeMaterialPalette` roles (metalness ≈ 0.75–0.95, roughness ≈ 0.2–0.4); restrained warm highlights, no bloom pipeline
- [ ] ☐ **ORB-12.3** · Medallion polish: brass rim, dark graphite center, bevel, restrained edge glow; optional pointer parallax tilt ≤ ±3°; never a continuous spin
- [ ] ☐ **ORB-12.4** · Node housings: circular medallion, brass rim, engraved-initial or approved icon, hover glow consistent with reference
- [ ] ☐ **ORB-12.5** · Scroll entrance (restrained): medallion fades/scales → rail materializes → nodes appear sequentially → rotation starts (~1.2–2 s total; reduced-motion = immediate)
- [ ] ☐ **ORB-12.6** · Background: subtle CSS treatment only (vignette/warm-black gradient with approved tokens); the reference's robot corner detail is OMITTED unless a cleared asset is registered
- [ ] ☐ **ORB-12.7** · Interaction interpolation polish: exponential damping (`1 − e^(−k·Δt)`) on rotation/scale/opacity/light
- [ ] ☐ **ORB-12.8** · `palette:check` green; side-by-side review against the reference image recorded (CLAUDE)

### ORB-13 — Final QA & cleanup (FINAL QA) · owner CODEX, verify CLAUDE → GATE F
- [ ] ☐ **ORB-13.1** · Per-project navigation matrix executed for EVERY configured project: label, icon, click target, GitHub URL, live URL, internal route, keyboard, mobile tap, no accidental drag-launch
- [ ] ☐ **ORB-13.2** · Full `pnpm verify` green (format, lint, typecheck, tests + gates, production build)
- [ ] ☐ **ORB-13.3** · Real-browser matrix: desktop Chrome/Edge + Firefox, tablet width, iOS/Android-class mobile emulation minimum; console clean everywhere
- [ ] ☐ **ORB-13.4** · Reduced-motion, WebGL-off, JS-off (list renders server-side) all verified
- [ ] ☐ **ORB-13.5** · Performance snapshot recorded vs baseline (JS delta, transfer delta, CLS, interaction smoothness note)
- [ ] ☐ **ORB-13.6** · Flip `PROJECT_ORBIT_PRESENTATION` default to `"orbit"`; soak on preview; Carlos sign-off
- [ ] ☐ **ORB-13.7** · Remove `ObservatoryAtom` + atom CSS + obsolete rail CSS + dev harness route; update affected tests; `pnpm verify` green again
- [ ] ☐ **ORB-13.8** · Update `updates/TASKBOARD.md` status + final Implementation Log entry; Gate F checklist verified

## V1 required

Real ellipse and depth ordering · CAM² center medallion (approved `logo.png`) ·
data-driven nodes + upright HTML labels · slow clockwork idle rotation · drag with
inertia (mouse + touch) · click-vs-drag threshold · hover highlight · selection
rotate-into-focus · focus panel with data-driven `[Open]`/`[GitHub]` · safe external
links · keyboard parity · screen-reader semantics · reduced-motion path · WebGL/no-JS
fallback list · deliberate mobile strategy · lazy loading + visibility pause ·
palette-compliant brass/black visuals · restrained entrance · `pnpm verify` green ·
`OrbitController` interface (orbit-control subset implemented).

## Optional / future

**V1.1 OPTIONAL (only after Gate F):**
- Metallic flow balls traveling the rail (`InstancedMesh`, 12–30, decorative, never clickable)
- Advanced focus panel (longer description, `[Ask ANA]` action, optional iframe live preview
  with frame-permission detection and `Open ↗` fallback)
- Decorative connection spokes from hovered node toward CAM²
- Sophisticated multi-stage entrance construction animation
- Featured-node halo/constellation flourish for ASTRAEA
- `openOnFirstClick` / double-click direct-launch configuration

**FUTURE (needs ANA / Repo2Agent progress; do NOT build now):**
- Shader transition from the ANA hero into the orbit (hero darkens → gold particles →
  medallion → orbit constructs)
- Live agent activation: nodes illuminate when ANA delegates to ASTRAEA/PINÁCULO/etc.
- Agent-to-agent flow: brass particles travel node → CAM² during delegation
  (implements the reserved `activateAgent` / `activateAgentFlow` API)
- Roster populated dynamically from the Repo2Agent registry instead of static records

## Verification matrix

| Check | B | C | D | E | F |
| --- | --- | --- | --- | --- | --- |
| `orbit-math` / state-machine unit tests | ✔ | ✔ | ✔ | — | ✔ |
| Destination resolver unit tests | — | — | ✔ | — | ✔ |
| `pnpm test` (all gates incl. content/palette/boundary) | ✔ | ✔ | ✔ | ✔ | ✔ |
| `pnpm verify` (adds build + immersive) | — | — | — | ✔ | ✔ |
| Real browser desktop (pointer) | ✔ | ✔ | ✔ | ✔ | ✔ |
| Real browser mobile width (touch) | — | ✔ | ✔ | ✔ | ✔ |
| Keyboard-only journey | — | ✔ | ✔ | — | ✔ |
| Screen-reader announcement spot-check | — | — | — | — | ✔ |
| Reduced-motion mode | ✔ | ✔ | — | — | ✔ |
| WebGL-off / JS-off fallback | — | — | — | ✔ | ✔ |
| Console clean (zero errors/warnings) | ✔ | ✔ | ✔ | ✔ | ✔ |
| CLS / perf budget measurement | — | — | — | ✔ | ✔ |

## Definition of Done

- [ ] ☐ Static/atom Selected Systems presentation removed (after soak, ORB-13.7)
- [ ] ☐ Real Three.js elliptical orbit lives in the homepage's Selected Systems region
- [ ] ☐ Orbit is visibly wider than deep (horizontal flattening obvious)
- [ ] ☐ Central CAM² identity stable (no track rotation, no logo regeneration)
- [ ] ☐ Every APPROVED roster project appears, positioned by formula from data
- [ ] ☐ Continuous slow idle orbit; drag works; hover works; selection focuses smoothly
- [ ] ☐ Focused project opens its app/route/repo from data; external links safe
- [ ] ☐ Labels always readable and horizontal
- [ ] ☐ Mobile interaction deliberate and usable; keyboard complete; reduced-motion complete
- [ ] ☐ Non-WebGL fallback keeps every project reachable
- [ ] ☐ Project list has one source of truth compatible with the future Repo2Agent registry
- [ ] ☐ `OrbitController` API exists with reserved ANA hooks
- [ ] ☐ No homepage regression (hero intact, CLS 0, budgets respected)
- [ ] ☐ Production build + full `pnpm verify` green

## Blockers

- ⛔ **ORB-1.2** — Palette token values need Carlos's approval before any visual work
  (palette:check will fail otherwise; DESIGN.md forbids unapproved near-black themes).
- ⛔ **ORB-8.1** — No verified live-app URLs for most roster projects (hosting work `C.2`/
  Railway migration not done); GitHub/internal destinations are the honest interim.
- ⛔ **ORB-8.1** — "SmartChatbot" destination undefined (in-site assistant vs repo vs app).
- ⛔ **ORB-8.6** — No approved node icon set; default is engraved initials until approval.
- ⚠ **Dependency** — `V.13` (dead 3D layer removal) sequencing must be recorded at Gate A;
  V.13 must keep `three`/`@react-three/*` dependencies either way.
- ⚠ **Dependency** — `V.12` (mobile hero video weight) is unrelated but shares the homepage
  perf budget conversation; coordinate measurements with GROK.

## Pipeline Review

- [x] ☑ Full original task (Phases 0–30 in `rotating-spec.md`) reviewed against the 15 review questions
- [x] ☑ Repository context inspected (files listed under Architecture decisions)
- [x] ☑ Actual stack determined (Next.js App Router + R3F established — not vanilla three, not a new framework)
- [x] ☑ Dependency order corrected to proof-before-polish (rails/particles/entrance moved after interaction + navigation proofs)
- [x] ☑ Milestone gates A–F added with objective verification lists
- [x] ☑ Missing phases added (decision/palette amendment, technical spike, roster curation, rollback switch, cleanup)
- [x] ☑ Redundant/oversized phases merged or split (see mapping in the log entry below)
- [x] ☑ Optional and future scope moved out of the V1 critical path
- [x] ☑ Verification strategy strengthened (matrix + repo gate integration + per-project navigation matrix)
- [x] ☑ Rollback/safety strategy added (presentation switch, atom retained until Gate F, archived spec)
- [x] ☑ Pipeline ready for Codex implementation

## Implementation Log

Append-only. Format: `### YYYY-MM-DD — <phase/task>` with Changed / Verified / Evidence / Remaining.
### 2026-08-13 — Medallion alignment and manipulation adjustment

Changed:
- Clarified implementation target from the screenshot feedback: the "circle/aro" is the medallion ring around the CAM² logo, not the large repository orbit.
- Restored the large repository orbit to its original `radiusX: 7.5` / `radiusZ: 2.95`, original camera framing, and non-tilted rail plane.
- Reduced only the medallion ring/core (`rim 1.4 → 1.3`, outer edge `1.55 → 1.44`, core `1.58 → 1.47`).
- Kept the medallion centered on its own zero point: CAM² logo, core, rim, sheen, and glow stay concentric.
- Added continuous rightward CAM² logo rotation, disabled under reduced motion.
- Added visible ~15° inclined rotation to the medallion rim via slow rim precession; the ring around the logo is no longer visually flat/static.
- Changed dragging the medallion/logo/rim to pan only the medallion; the large repository orbit stays in place. Double-clicking the medallion re-centers it.
- Updated the Project Orbit contract tests for medallion-only pan, rim precession, smaller medallion ring, and restored large-orbit radii.

Verified:
- `pnpm typecheck` — green.
- `pnpm lint` — green.
- `pnpm test:unit` — 447 passed, 0 failed.

Evidence:
- `site/src/content/project-orbit.ts`
- `site/src/components/project-orbit-scene.tsx`
- `site/src/components/project-orbit.tsx`
- `site/src/tests/project-orbit-contract.test.ts`

Remaining:
- Visual/browser verification is still recommended because this was adjusted from a screenshot and not inspected in the live browser in this session.

### 2026-08-13 — PIPELINE REVIEW (no implementation)

Changed:
- Archived the original spec verbatim to `updates/tasks/rotating-spec.md`.
- Rewrote `updates/tasks/rotating.md` as this execution board: status, objective,
  non-negotiables, audited architecture findings, Gate A decision proposals, milestone
  gates A–F, 14-phase sequential pipeline (ORB-0 … ORB-13), V1 / V1.1 / FUTURE scope
  split, verification matrix, Definition of Done, blockers.
- Registered the Project Orbit board and the V.13 coordination note on `updates/TASKBOARD.md`.
- Phase mapping from the original spec: 0→ORB-0 (audit executed during this review;
  re-check kept); NEW ORB-1 (decisions/palette/rollback — was missing); 1→ORB-2 (real
  roster deferred to ORB-8); NEW ORB-3 spike (was missing); 3+8(core)+10→ORB-4;
  2+5(v1)+6+7+18(interface)→ORB-5; 11+12+13→ORB-6; 14+15+29(nav part)→ORB-7;
  1(roster)+17→ORB-8; 19(min)+20→ORB-9; 23+24→ORB-10; 25+26(perf part)→ORB-11;
  4+5(polish)+21+27+28→ORB-12; 29+30→ORB-13. Phase 9 (flow balls) and 16 (iframe
  preview) → V1.1; Phase 22 (hero shader transition) and 18 (live agent visuals) → FUTURE.

Verified:
- Stack facts, Selected Systems implementation, data records, palette/content/boundary/
  three-runtime contracts, U.20/Q.3/V.13 decision history, clearance register status of
  `logo.png`, homepage baselines — all read directly from the repository this session.

Evidence:
- `site/package.json`, `site/src/app/page.tsx` (160–179), `site/src/components/observatory-atom.tsx`,
  `site/src/content/records.ts` / `schemas.ts` / `site.ts`, `site/src/styles/palette.ts`,
  `site/scripts/validate-palette.ts`, `site/src/tests/observatory-hero-shell.test.ts`,
  `site/src/tests/content-contract.test.ts`, `site/src/tests/three-runtime-boundary.test.ts`,
  `site/src/lib/three/progressive-loading.ts` (U.20 gate), `docs/design/DESIGN.md`,
  `docs/DECISIONS.md`, `updates/06-decisions.md` (Q.3), `updates/TASKBOARD.md`,
  reference image `imagesandvideo/ChatGPT Image Aug 13, 2026, 10_11_48 AM.png`.

Remaining:
- Everything under Implementation pipeline (all unchecked). First ready task: **ORB-0.1**.
- Carlos approvals: palette tokens (ORB-1.2), roster + destinations (ORB-8.2),
  SmartChatbot destination, icon direction (ORB-8.6).

### 2026-08-13 — ORB-0.1 preflight (blocked)

Changed:
- Recorded the shared-worktree blocker directly beneath ORB-0.1. No product, application, or dependency files were changed.

Verified:
- Current branch is `main` at `7d7d63f`.
- `git status --short` reports unrelated modified and untracked ANA / Repo2Agent modules, documentation, configuration, media, and task-board files.

Evidence:
- Read-only Git inspection on 2026-08-13: `AGENTS.md`, `brain/.gitignore`, `brain/README.md`, `maintaskplan.md`, `site/.env.example`, `site/package.json`, `site/scripts/validate-server-boundaries.ts`, `updates/TASKBOARD.md`, `brain/repositories/`, `site/src/ana/`, ANA tests, and multiple task/media files are already modified or untracked.

Remaining:
- ORB-0.1 remains unchecked. A clean, isolated Project Orbit worktree/branch (or explicit direction to treat the current dirty worktree as in-scope) is required before ORB-0.2 can run.

### 2026-08-13 — User-directed Claude Design handoff port (unplanned)

Changed:
- Carlos supplied the Claude Design Project Orbit handoff and directed a direct implementation in
  the shared worktree, outside the ORB-0 → ORB-13 order.
- Rebuilt the standalone raw-Three handoff as a lazy, demand-rendered React Three Fiber section
  between the hero and laboratory: true ellipse rails, instanced bearing balls, CAM² medallion,
  ten icon nodes, DOM labels, drag/inertia, hover, focused panel, and semantic navigation.
- Preserved existing internal case-study routes for ASTRAEA and PINÁCULO; other destinations
  remain route or repository links from the supplied handoff. The semantic list selects first and
  exposes an explicit action; without JavaScript, the links remain direct fallback navigation.
- Used existing approved palette tokens instead of adding raw black/brass literals. The medallion
  remains static (the source handoff's continuous logo spin was intentionally omitted).
- Kept `Project Orbit animation design-handoff/` as untracked source reference only; no duplicate
  snapshot or asset bundle was added to the application.

Verified:
- `pnpm test:unit` — 405 passing tests.
- `pnpm lint`, `pnpm typecheck`, `pnpm palette:check`, `pnpm boundary:check`,
  `pnpm assets:check`, and `pnpm immersive:check` — passing.
- `pnpm build` — production build passed after the final implementation.
- Browser review: lazy canvas rendered at desktop and mobile widths; semantic-list selection
  focused Future Energy without navigation and exposed its explicit action.

Remaining:
- No ORB checkbox or milestone gate is marked complete: Gate A records, clean branch/worktree,
  `PROJECT_ORBIT_PRESENTATION` rollback switch, source-of-truth adapter, formal roster approval,
  and the planned full accessibility/performance matrix remain unverified.
- `pnpm verify` remains blocked by unrelated ANA files failing repository-wide Prettier check;
  `pnpm test` remains blocked after its passing unit suite by the pre-existing local-media
  clearance inventory mismatch. Neither was changed for this port.

### 2026-08-13 — User-directed Claude Design fidelity correction (unplanned)

Changed:
- Carlos confirmed `Project Orbit animation design-handoff/` is the downloaded Claude Design
  source and requested that it be treated as the visual authority.
- Reworked the port to match the supplied `Project Orbit.html` more literally: its compact
  heading, full-width 34° camera framing, responsive source fit calculation, exterior DOM labels,
  in-stage detail panel, and warm-black/brass material treatment.
- Added the handoff's named palette roles, warm PMREM reflection environment, ACES exposure 0.94,
  outer medallion bezel, restrained sheen/glow, source-equivalent glyph drawings, dynamic point
  spokes, and a short reduced-motion-safe construction entrance. The continuous source-logo spin
  remains deliberately omitted.

Verified:
- `pnpm test:unit` — 410 passing tests.
- `pnpm lint`, `pnpm typecheck`, `pnpm palette:check`, `pnpm boundary:check`, and
  `pnpm assets:check` — passing.
- `pnpm build` — production build passed.
- Desktop side-by-side review against a local serving of the downloaded handoff: the initial
  instrument shot and semantic-list Future Energy selection both render with the source-style
  framing and in-stage panel.

Remaining:
- No ORB checkbox or milestone gate is marked complete. Mobile QA, formal accessibility/performance
  evidence, roster approval, and the worktree/rollback gate remain open under the existing board.

### 2026-08-13 — User-supplied 3D CAM² medallion logo (unplanned)

Changed:
- Carlos supplied `imagesandvideo/logo.glb` as the CAM² logo to use in Project Orbit. Its source
  model is retained outside the public runtime; the derived public asset is
  `site/public/images/brand/ca2m-logo.glb`.
- Added a repeatable local pipeline at `site/scripts/optimize-project-orbit-logo.ts`: the source
  was reduced from 85,465,832 bytes / 1,500,000 triangles / three 4K PNG maps to a 6,464,760-byte,
  89,998-triangle Meshopt GLB with the same PBR normal, base-color, and metal/roughness maps at
  1024 px.
- Replaced the flat center-mark plane with a lazy, Meshopt-capable `useGLTF` presentation wrapper.
  It corrects the source's bottom-edge pivot and gives only the logo a fixed, restrained angle for
  visible depth; the medallion does not continuously spin. The existing 2D mark remains a loading
  fallback while the model is fetched.
- Added a focused contract check for the local optimized 3D asset and its bounded presentation.

Verified:
- `pnpm typecheck`, `pnpm lint`, `pnpm assets:check`, and `pnpm build` — passing.
- `pnpm exec tsx --test src/tests/project-orbit-contract.test.ts src/tests/project-orbit-math.test.ts`
  — 7 passing tests.
- `pnpm exec tsx scripts/optimize-project-orbit-logo.ts --inspect` confirmed
  `EXT_meshopt_compression`, `KHR_materials_specular`, 1024px maps, and 89,998 triangles.

Remaining:
- No ORB checkbox or milestone gate is marked complete. Extended browser QA was not run under the
  Three.js verification policy; a desktop canvas/load smoke test can be run with Carlos's approval.
- The public-use provenance of the user-supplied source is recorded as Carlos's direction in this
  log; the broader roster, rollback, accessibility, performance, and clean-worktree gates remain
  open.

### 2026-08-13 — User-directed 3D logo motion adjustment (unplanned)

Changed:
- Carlos reviewed the live Project Orbit canvas and requested a slightly smaller logo plus a
  rightward horizontal rotation.
- Reduced the 3D CAM² logo presentation scale from 2.40 to 2.16, including its temporary 2D
  loading fallback, and added a source-equivalent 26-second local-Y rotation on the logo only.
- The orbit and outer medallion remain still relative to one another; the animation stops for
  `prefers-reduced-motion`, while off-screen, and when the document is hidden.

Verified:
- `pnpm typecheck`, `pnpm lint`, `pnpm assets:check`, and `pnpm build` — passing.
- `pnpm exec tsx --test src/tests/project-orbit-contract.test.ts src/tests/project-orbit-math.test.ts`
  — 7 passing tests.

Remaining:
- No ORB checkbox or milestone gate is marked complete. Extended browser QA was not rerun; desktop
  or mobile visual tuning can proceed from Carlos's next review comment.

### 2026-08-13 — User-directed 15° medallion assembly tilt (unplanned)

Changed:
- Carlos's visual review showed the independently spinning logo edge-on while the gold rim stayed
  static. Replaced that full rotation with one shared identity assembly containing the 3D CAM² logo
  and both brass/bronze rim rings.
- The assembly begins to the right, eases through a bounded horizontal ±15° tilt over a 12-second
  cycle, and returns. The dark center face remains stable, so the medallion retains a clear anchor
  and the CAM² mark remains readable throughout.
- Reduced-motion, hidden-document, and off-screen behavior remain static or paused.

Verified:
- `pnpm typecheck`, `pnpm lint`, and `pnpm build` — passing.
- `pnpm exec tsx --test src/tests/project-orbit-contract.test.ts src/tests/project-orbit-math.test.ts`
  — 7 passing tests.

Remaining:
- No ORB checkbox or milestone gate is marked complete. Extended browser QA was not rerun; Carlos's
  live review remains the next tuning input.

### 2026-08-13 — User-directed clear CAM² mark / moving rim correction (unplanned)

Changed:
- Carlos's follow-up screenshot showed that the shared 15° assembly could present the 3D CAM²
  mark edge-on. Split the medallion into a front-facing CAM² presentation and a separate
  brass/bronze rim assembly.
- The CAM² model now stays clear and camera-facing (with only its fixed shallow presentation
  pitch); only the two gold rim rings make the bounded rightward 15° horizontal turn.
- Reduced-motion, hidden-document, and off-screen pause behavior remains unchanged.

Verified:
- `pnpm typecheck`, `pnpm lint`, and `pnpm build` — passing.
- `pnpm exec tsx --test src/tests/project-orbit-contract.test.ts src/tests/project-orbit-math.test.ts`
  — 7 passing tests, including the contract that the logo is a sibling of the moving rim.

Remaining:
- No ORB checkbox or milestone gate is marked complete. Extended browser QA was not run; Carlos's
  live review remains the next tuning input.

### 2026-08-13 — User-directed bounded logo and rim motion tuning (unplanned)

Changed:
- Carlos requested the smaller CAM² logo to move horizontally to the right while the gold rim
  carries a stronger 15° turn. Reduced the logo presentation scale from 2.16 to 2.00.
- Added a separate, bounded ±4° logo yaw that starts rightward and keeps the shallow 3D mark
  legible; the brass/bronze rim remains independently bounded at ±15°.
- The motion wrappers remain separate presentation transforms, preserving the imported model's
  canonical transform and the existing reduced-motion, hidden-document, and off-screen pause
  behavior.

Verified:
- `pnpm typecheck`, `pnpm lint`, and `pnpm build` — passing.
- `pnpm exec tsx --test src/tests/project-orbit-contract.test.ts src/tests/project-orbit-math.test.ts`
  — 7 passing tests, including separate logo-yaw and rim-motion contracts.
- The running local preview continued responding at `http://localhost:3000/` with HTTP 200.

Remaining:
- No ORB checkbox or milestone gate is marked complete. Extended browser QA was not run; Carlos's
  live review remains the next tuning input.

### 2026-08-13 — User-directed smaller bezel and visible rightward pose (unplanned)

Changed:
- Carlos's latest live screenshot showed that the gold bezel remained oversized and the previous
  ±4° logo motion was too subtle to read. Reduced the brass ring radius from 1.72 to 1.50 and
  bronze edge from 1.90 to 1.66, keeping the bezel inside the dark medallion face.
- Replaced the near-invisible oscillation with a clear, fixed 15° horizontal rightward presentation
  angle on the CAM² logo and its smaller bezel. This preserves the 3D reading without taking the
  shallow model edge-on or making the mark disappear.
- The imported GLB's canonical transform remains unchanged; the rightward angles are presentation
  transforms only.

Verified:
- `pnpm typecheck`, `pnpm lint`, and `pnpm build` — passing.
- `pnpm exec tsx --test src/tests/project-orbit-contract.test.ts src/tests/project-orbit-math.test.ts`
  — 7 passing tests, including the 15° logo/bezel and reduced-radius contracts.
- The running local preview continued responding at `http://localhost:3000/` with HTTP 200.

Remaining:
- No ORB checkbox or milestone gate is marked complete. Extended browser QA was not run; Carlos's
  live review remains the next tuning input.

### 2026-08-13 — User-directed centered full-gold ring and visible motion (unplanned)

Changed:
- Carlos's screenshot revealed the cause of the off-centre, half-gold bezel: its 3D back edge was
  being depth-occluded by the dark center disc. Moved the core and its sheen behind the full bezel,
  preserving the bezel's centre while allowing both sides to remain visibly gold.
- Replaced the fixed pose with a coordinated, rightward 0–15° horizontal motion for the logo and
  bezel. It cycles over 8 seconds, pauses off-screen/when hidden, and never reaches an edge-on
  angle that would make the shallow CAM² model disappear.
- Kept the reduced bezel radii (1.50 brass / 1.66 bronze) and the imported GLB's canonical
  transform intact; all changes are presentation-only layers.

Verified:
- `pnpm typecheck`, `pnpm lint`, and `pnpm build` — passing.
- `pnpm exec tsx --test src/tests/project-orbit-contract.test.ts src/tests/project-orbit-math.test.ts`
  — 7 passing tests, including core/rim layering and coordinated rightward-motion contracts.
- The running local preview continued responding at `http://localhost:3000/` with HTTP 200.

Remaining:
- No ORB checkbox or milestone gate is marked complete. Extended browser QA was not run; Carlos's
  live review remains the next tuning input.

### 2026-08-13 — User-directed diagonal ring and touch-controlled centre rotation (unplanned)

Changed:
- Carlos supplied `Downloads/rotate.png` to clarify the desired axes: the CAM² logo has a 15°
  horizontal leftward yaw; the smaller gold ring has a 15° physical diagonal tilt, rather than a
  horizontal yaw or an invisible in-plane roll.
- Rebuilt the centre transform hierarchy around one local-zero, drag-controlled pivot. The logo
  and ring now share that origin; the GLB retains its internal pivot-correction wrapper so its
  visible mark remains centred inside the ring.
- Reduced the ring to 1.40 / 1.55 radii and made both concentric edges gold. The graphite core and
  sheen now sit safely behind the ring, preventing any arc from being masked.
- Replaced autonomous centre motion with a direct horizontal pointer/touch response. Each drag
  turns the logo and ring together in the user's direction, clamped to ±18° so the shallow logo
  never goes edge-on; pointer cancellation cleans up touch interruption.

Verified:
- `pnpm typecheck`, `pnpm lint`, and `pnpm build` — passing.
- `pnpm exec tsx --test src/tests/project-orbit-contract.test.ts src/tests/project-orbit-math.test.ts`
  — 7 passing tests, including the local-zero hierarchy, diagonal quaternion, left logo yaw, and
  bounded drag-control contracts.
- The running local preview continued responding at `http://localhost:3000/` with HTTP 200.

Remaining:
- No ORB checkbox or milestone gate is marked complete. Extended browser QA was not run; Carlos's
  live review remains the next tuning input.

### 2026-08-13 — In-hero Project Orbit overlay (user-directed)

Changed:
- Moved `<ProjectOrbit>` inside `.observatory-hero` so the brass ellipse covers the painted chest
  atom instead of sitting in a separate ink band between the hero and the laboratory.
- Cleared the WebGL backdrop (`setClearColor(0, 0)`) and dropped the section ink, header, and CSS
  fallback so the hero video shows through.
- Kept `#selected-systems`, CACM AI above the overlay (`--z-chat`), and the semantic list for
  keyboard / no-JS. Mobile shares the scene-band grid row rather than covering the cream copy.
- Amends ORB-9.2 and requirement 10: the canvas still lazy-loads, but the stage is now in the
  first viewport.

Verified:
- `pnpm exec tsx --test src/tests/observatory-hero-shell.test.ts src/tests/project-orbit-contract.test.ts src/tests/content-contract.test.ts src/tests/three-runtime-boundary.test.ts` — 18 passing.
- `pnpm lint` and `pnpm typecheck` — passing.
- Browser review on local `http://localhost:3000/`: at 1440×900 and ~985px the transparent brass orbit sits on the figure in the hero (labels and CAM² medallion visible; CACM AI remains above it). At 390×844 the orbit shares the scene-band grid row under the cream copy.

Remaining:
- Gates stay unchecked. Overlay placement on the chest can still be nudged after live review; the painted atom remains in the video artwork underneath.

### 2026-08-13 — Orbit lower band + CACM AI header (user-directed)

Changed:
- Sat the hero orbit in the lower empty band under the reading column (`top: auto; left: 16%;
  bottom: 0`) instead of on the figure's chest.
- Anchored CACM AI in the header from 48rem up (`top` + `bottom: auto`), matching the mark to
  the right of Contact. Phone layout still uses the bottom trigger.

Verified:
- Contract assertions for the lower-band orbit and 48rem header trigger recorded in
  `observatory-hero-shell.test.ts`.

### 2026-08-13 — Orbit off the portrait (user-directed)

Changed:
- Pulled Project Orbit out of the hero overlay. The cinematic poster is one composition again;
  the brass ellipse is its own section between the hero and the laboratory.
- CACM AI stays in the header from 48rem up.

Verified:
- `observatory-hero-shell.test.ts` now requires the orbit after the hero close, and forbids
  `.observatory-hero .project-orbit-section` overlay rules.

### 2026-08-13 — Orbit framing and mobile list (user-directed)

Changed:
- Fitted the orbit camera to the stage (horizontal + vertical FOV, no 200px margin floor) so the
  ellipse fills the canvas instead of sitting tiny and flat.
- Idle revolution is 32s so the 3D turn is readable. Phones hide overlapping labels and keep the
  semantic system list; the stage height scales with the viewport.

Verified:
- Orbit contract tests pin the new camera fit and `revolutionSeconds: 32`.

### 2026-08-13 — Orbit-to-laboratory aura seam (user-directed)

Changed:
- Replaced the hard ink/cream cut with layered radial washes and a long vertical fade
  (Aura-style ambient gradients, using only approved brass/espresso/walnut/canvas tokens).
- Laboratory opens from a mixed espresso-canvas wash so the two sections meet as light,
  not a square rule.

Verified:
- `observatory-hero-shell.test.ts` pins the orbit `::after` and laboratory 180deg canvas fades.
- `pnpm palette:check` — passing.

### 2026-08-13 — Drop the orbit ink slab (user-directed)

Changed:
- Removed the full-bleed dark rectangle behind Selected Systems. The orbit section now continues
  the parchment page; contrast for the brass instrument comes from a blurred elliptical espresso
  bloom (`::before` radial), not a square theme break.
- Hero bottom scrim fades to `--color-canvas` instead of near-black. Laboratory is canvas again.
- Heading type is espresso on parchment. The stage is taller so the 3D fills the section.

Verified:
- `observatory-hero-shell.test.ts` pins canvas continuity, the elliptical well, and the hero
  scrim fading to canvas.

### 2026-08-13 — Brighter, sharper Project Orbit (user-directed)

Changed:
- Raised parchment-side lighting (exposure 1.22, warmer environment map, stronger key/ambient)
  so the brass reads gold instead of muddy brown.
- Sharpened node icons (256px textures, no mipmaps) and reduced the medallion haze sprite.

Verified:
- `project-orbit-contract.test.ts` pins exposure 1.22 and 256px icon textures.
