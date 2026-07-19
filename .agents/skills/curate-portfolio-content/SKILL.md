---
name: curate-portfolio-content
description: Create or revise accurate portfolio content from verified primary sources. Use when Codex is asked to add a project, write a case study, build project metadata, draft a bio or CV section, curate music/video/travel/hobby content, validate portfolio claims, or turn a GitHub repository and live demo into publishable copy. Preserve provenance, media rights, privacy, and the distinction between shipped work, experiments, concepts, and future plans.
---

# Curate Portfolio Content

Turn source material into concise, credible portfolio narratives without converting assumptions into facts.

## Source order

1. User-provided facts, CV material, and media.
2. The project's own README, documentation, code, releases, issues, and license.
3. A working public demo and its observable behavior.
4. `deep-research-report (8).md` as a lead or synthesis, with current facts rechecked when necessary.
5. Reputable secondary sources only when primary sources cannot support the needed context.

## Workflow

1. Define the content target and required fields before drafting.
2. Collect primary sources and note the source for each material claim.
3. Classify the work accurately as shipped, maintained, prototype, experiment, concept, archived, or private.
4. Extract the problem, constraints, Carlos's verified contribution, approach, stack, observable outcome, and learning.
5. Separate facts from first-person reflection. Ask for missing personal claims rather than writing them as facts.
6. Select only reusable media. Check license, ownership, privacy, attribution, and whether private local assets are excluded from the public repository.
7. Draft for scanning first: clear title, one-sentence value, concise summary, then deeper case-study sections.
8. Validate repository/demo links, dates, product names, technology names, alt text, and public/private boundaries.
9. Update the relevant content task and completion evidence through `$portfolio-delivery`.

## Recommended project record

Use the chosen content system's equivalent of these fields:

- `slug`, `title`, `tagline`, `category`, `status`, `featured`, and `year`;
- `summary`, `problem`, `constraints`, `contribution`, `approach`, `outcome`, and `learnings`;
- `stack`, `repositoryUrl`, `demoUrl`, and optional `documentationUrl`;
- media with `src`, `alt`, `caption`, `credit`, `rights`, dimensions, and poster/fallback data;
- internal provenance notes for claims that may need later re-verification.

Omit a field when it cannot be supported. Do not fill gaps with plausible prose.

## Integrity and privacy gates

- Do not invent metrics, users, performance improvements, revenue, awards, clients, employment history, dates, or collaborator roles.
- Do not imply sole authorship when a repository or asset has collaborators.
- Do not publish secrets, private dashboard data, unpublished artwork, precise private locations, or personal contact details beyond those explicitly approved.
- Do not copy third-party portfolio language or visual assets merely because they appeared in research.
- Use descriptive alt text for informative media and empty alt text for decorative media.
- Mark inaccessible or broken demos honestly; do not describe intended behavior as currently live.

## Case-study shape

Prefer this order unless the approved design calls for a different hierarchy:

1. Value and current status.
2. Problem and audience.
3. Carlos's contribution and constraints.
4. Approach and key decisions.
5. Demonstration or visual evidence.
6. Outcome supported by evidence.
7. What changed or was learned.
8. Repository, demo, and related links.
