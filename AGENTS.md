# Portfolio Project Guidance

## Mission

Build Carlos Carpio's portfolio as a polished, editorial, media-aware experience that presents software, AI systems, music/video, CV material, travel, and hobbies without becoming a generic developer-card grid. Use `deep-research-report (8).md` as research input and `maintaskplan.md` as the execution ledger.

## Instruction order

1. Follow the current user request.
2. Follow this `AGENTS.md` for durable repository behavior.
3. Use `maintaskplan.md` for **v1 launch** task order, dependencies, completion state, and evidence.
4. Use `updates/TASKBOARD.md` for **post-v1 work** — the current round of fixes and upgrades.
   It is the single page showing where the project is, all tasks, and which agent owns each.
5. Apply `rules.md`, `skills.md`, and the executable rules in `.codex/rules/portfolio.rules`.
6. Treat the research report as recommendations, not immutable requirements.

If two sources conflict, preserve explicit user decisions and record the resolution in `maintaskplan.md`.

## Start every task

- Read the relevant sections of `maintaskplan.md` and select the smallest ready unchecked task.
- Inspect `git status` and preserve unrelated or user-authored changes.
- Read `skills.md` and invoke the matching skill instead of recreating its workflow.
- Do not scaffold the application until the Phase 1 stack decision gate is checked.
- State any assumption that changes product scope, architecture, content, or visual direction.

## Workflow roles

Roles describe stages and ownership; they do not require separate models or subagents.

- **Architect:** clarify audience, information architecture, stack, content model, budgets, and decision records.
- **Designer:** establish the visual thesis, content hierarchy, tokens, responsive behavior, accessibility, and motion intent. For visually led work, explicitly use `$webdesigner-design-system` and `$frontend-skill` when available.
- **Content curator:** use `$curate-portfolio-content`; verify claims, links, media rights, dates, and attribution before publishing them.
- **Builder:** use the selected framework idiomatically and use WebDesigner's scaffold/code-generation skills when they match the chosen stack.
- **Reviewer:** inspect rendered desktop and mobile output; validate behavior, content, accessibility, performance, and design coherence.
- **Security reviewer:** run the WebDesigner security workflow before release and validate findings before changing code.
- **Release owner:** prepare preview deployment, production checks, rollback notes, and handoff documentation.

Do not spawn subagents unless the user explicitly asks for delegation or parallel agent work.

## Task-plan discipline

- Use `$portfolio-delivery` for implementation work driven by `maintaskplan.md`.
- Change `[ ] ☐` to `[x] ☑` only after the task's acceptance condition is satisfied and verified.
- Add a dated evidence entry to the completion log whenever a checkbox is marked.
- Leave partial, failed, blocked, or unverified work unchecked; add a concise status note beneath it.
- Add newly discovered work as a new unchecked task with a unique ID. Do not silently widen an existing task.
- Update the plan in the same turn as the implementation and verification.
- Never mark a whole phase complete from visual inspection alone.

## Product and design constraints

- Default direction: multi-page editorial portfolio with a modular homepage, deep project case studies, dedicated media, CV/about, and curated trips/hobbies.
- Preserve a clear first viewport: identity, one headline, one short supporting statement, a focused CTA group, and one dominant visual idea.
- Use real project/media content as the visual anchor. Do not rely on gradients, glass effects, or decorative 3D as a substitute for hierarchy.
- WebDesigner's Nightglass system is a starting system, not permission to ignore a stronger approved brief or coherent existing brand.
- Cards are opt-in. Use them only when grouping or interaction benefits from them.
- Motion must explain hierarchy or state, remain restrained, and have a complete `prefers-reduced-motion` path.
- Do not activate Blender, Mint, Three.js, or generated 3D for ordinary UI work. Use them only when the user explicitly requests 3D or a verified product requirement needs it.
- Meet WCAG 2.2 AA targets, keyboard navigation, visible focus, semantic HTML, sensible zoom behavior, and accessible media controls.
- Design mobile and desktop deliberately; do not treat mobile as a compressed desktop layout.

## Content integrity

- Never invent metrics, employers, dates, collaborators, outcomes, testimonials, client names, or ownership claims.
- Separate verified facts, first-person reflection, and future/experimental concepts.
- Prefer the repository README, code, release metadata, live demo, and user-provided assets over third-party summaries.
- Confirm that screenshots, logos, music, video, fonts, and photos are reusable before committing them.
- Keep private dashboard data, credentials, precise private locations, and non-public assets out of the repository.
- Every meaningful image needs useful alt text or an explicit decorative treatment.

## Engineering expectations

- Prefer TypeScript and strict schemas for structured content.
- Keep dependencies minimal; justify production dependencies in the task evidence.
- Preserve framework conventions and avoid custom infrastructure when the framework already provides a sound primitive.
- Keep secrets in environment variables and provide only sanitized examples.
- Treat performance budgets as acceptance criteria: responsive images, lazy non-critical media, minimal client JavaScript, stable layout, and no continuous animation loops.
- Add tests at the level that best protects the change: content/schema checks, unit tests, component tests, end-to-end flows, accessibility checks, or build verification.

## Verification and definition of done

A task is done only when its scoped artifact exists, relevant checks pass, rendered behavior is inspected when UI is involved, and `maintaskplan.md` contains completion evidence. Before release, verify:

- install, lint, type-check, tests, and production build;
- primary journeys at representative mobile and desktop viewports;
- keyboard navigation, focus order, contrast, reduced motion, and accessible names;
- broken links, missing assets, metadata, sitemap/robots behavior, and social previews;
- performance budgets and lazy-loading behavior;
- security review, secret scan, dependency audit, and deployment configuration.

Until the stack is selected, document intended commands in the plan rather than inventing unavailable scripts.

## Git and publishing

- Keep commits focused and do not include unrelated user changes.
- Do not rewrite history, force-push, delete branches, publish packages, deploy, or merge without explicit user authorization.
- Do not commit secrets, local caches, dashboard exports, or private media.
- Use preview deployments for review before production.

## Key files

- `updates/TASKBOARD.md` — **post-v1 work: current position, every task, and its owner.**
  Start here for anything in the current round. Supporting detail lives beside it in `updates/`:
  `05-runbook.md` (ordered steps and agent kickoff text), `tasks/*-TASKS.md` (per-agent plans),
  `00-master-plan.md` (reasoning), `02-github-inventory.md` (all 61 repos, numbered).
- `maintaskplan.md` — v1 launch checkbox plan and completion evidence.
- `deep-research-report (8).md` — research, alternatives, and initial roadmap.
- `rules.md` — human-readable project rules.
- `skills.md` — skill routing and invocation guide.
- `.agents/skills/` — repo-scoped reusable workflows.
- `.codex/rules/portfolio.rules` — executable command approval policy.
