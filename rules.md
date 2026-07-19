# Portfolio Project Rules

## Purpose

These are human-readable delivery rules for every portfolio task. Codex's executable command policy lives separately in `.codex/rules/portfolio.rules`; Markdown alone does not create command allow/deny behavior.

## Planning and status

- `maintaskplan.md` is the single source of truth for work status.
- Work from the earliest ready unchecked task unless the user selects another task.
- Mark one checkbox at a time by changing `[ ] ☐` to `[x] ☑`, only after its acceptance condition is met.
- Record dated evidence for every newly checked task: changed files, checks, visual review, or decision artifact.
- Keep blocked and partial work unchecked and explain the blocker directly below the task.
- Add follow-up work explicitly; do not hide it inside a completion claim.

## Scope and safety

- Preserve unrelated user changes and private files.
- Do not change the chosen stack, content model, hosting provider, analytics, or visual direction without recording the decision.
- Do not add production dependencies, external services, CMS products, or paid tools without a clear need and user-visible tradeoff.
- Do not deploy, publish, merge, force-push, rewrite history, delete branches, or remove material content without explicit authorization.
- Never store credentials, API keys, private dashboard exports, personal addresses, or non-public location data in Git.

## Source and content truth

- Verify current external facts from primary sources when they may have changed.
- Use `$curate-portfolio-content` for project case studies and portfolio copy derived from repositories or demos.
- Never invent performance numbers, user counts, revenue, awards, job history, dates, roles, client work, or testimonials.
- Label prototypes and concepts accurately.
- Verify every public repository and demo link before release.
- Check media ownership and reuse rights; record attribution when required.

## Experience quality

- Keep the site editorial, cinematic, and legible; avoid a generic dashboard or card mosaic.
- Give each page and section one primary job and one dominant visual idea.
- Keep the hero concise and identity-led.
- Use WebDesigner's design system deliberately; explicit approved brand choices override defaults.
- Use 2–3 purposeful motion motifs across the site, not per-element animation noise.
- Provide reduced-motion behavior and do not autoplay audible media.
- Do not introduce decorative 3D unless the user explicitly requests it.
- Meet WCAG 2.2 AA targets and support keyboard-only use, 200% zoom, and visible focus.

## Engineering

- Prefer strict TypeScript, semantic HTML, progressive enhancement, and structured content schemas.
- Minimize browser JavaScript and third-party scripts.
- Use responsive images, explicit dimensions, lazy non-critical media, and optimized fonts.
- Keep components composable without creating abstraction before a repeated pattern exists.
- Sanitize user-controlled content and external embeds.
- Document environment variables with safe placeholders only.
- Preserve a clean production build with no unexplained warnings.

## Verification

- Run the narrowest relevant checks during development and the full release gate before launch.
- Inspect visual changes in a real browser at mobile and desktop sizes.
- Test keyboard flow, focus, contrast, reduced motion, media controls, and error/empty states.
- Validate metadata, canonical URLs, sitemap, robots rules, structured data, social images, and broken links.
- Run security and dependency checks before deployment.
- A screenshot is not proof of functional correctness; a passing build is not proof of visual quality.

## Git and release

- Keep commits scoped, reviewable, and descriptive.
- Use preview deployments for stakeholder review.
- Record deployment evidence and rollback instructions before production release.
- Tag or announce a release only after Phase 8 exit criteria are checked.
