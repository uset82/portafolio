# Portfolio Skills and Routing

## Environment status

- WebDesigner plugin `1.1.0` from `uset82/webdesigner` is installed and enabled through `webdesigner-repo-marketplace`.
- The package was verified with its manifest validator and MCP smoke test before installation.
- The official OpenAI developer-documentation MCP source is registered globally.
- Start a new Codex task from this repository after setup changes so plugin skills, MCP tools, repo skills, `AGENTS.md`, and project rules are discovered together.

## Repo-scoped skills

| Skill | Use it for | Do not use it for |
| --- | --- | --- |
| `$portfolio-delivery` | Selecting, implementing, verifying, and marking one or more ready tasks from `maintaskplan.md` | Skipping decision gates or checking incomplete work |
| `$curate-portfolio-content` | Building accurate case studies, project metadata, bios, media records, and portfolio copy from verified sources | Inventing metrics, roles, dates, or private details |

Repo skills live in `.agents/skills/` and are versioned with the project.

## WebDesigner skills for this project

Use the smallest matching skill and read its full instructions when invoked.

| Stage | Skill | Portfolio use |
| --- | --- | --- |
| Plan | `$framework-selector` | Compare Astro, Next.js, and React/Vite as layered stack choices; record the final decision and tradeoffs |
| Design | `$webdesigner-design-system` | Establish the Nightglass-informed visual thesis, tokens, hierarchy, responsive behavior, accessibility, motion, and design QA |
| Design | `$stitch-design` | Produce portable design artifacts when Stitch is available; otherwise produce the documented fallback design bundle |
| Build | `$project-scaffolder` | Scaffold only after the Phase 1 stack gate is complete and the skill supports the selected path |
| Build | `$code-generator` | Turn approved design and content artifacts into framework-idiomatic implementation |
| Review | `$animation-quality-gate` | Inspect intentional motion output when animation is added |
| Security | `$security-audit` | Create a threat model, validate findings, and propose reviewed remediation before release |
| Release | `$deploy-advisor` | Select and configure the approved deployment target and release notes |

The installed Blender skills (`$blender-modeling`, `$blender-materials`, `$rigging-animation`, `$blender-animation`, `$blender-motion-state-inspection`, `$blender-export`, and `$blender-technical-artist`) are out of scope for ordinary portfolio UI. Invoke them only for explicitly requested Blender work. Mint/Three.js also remain conditional rather than decorative defaults.

## Complementary available skills

- `$frontend-skill`: art direction, image-led hierarchy, cohesive sections, and restrained motion for the actual site build.
- `$browser:control-in-app-browser`: rendered desktop/mobile inspection and local interaction testing.
- `$imagegen`: original raster imagery or edits when the user approves generated visual assets.
- `$github`: repository and pull-request context; use local Git for the working tree.
- `$openai-docs`: current official Codex configuration guidance.

## Recommended execution chain

1. Invoke `$portfolio-delivery` and identify the next ready checkbox.
2. For product or architecture decisions, invoke `$framework-selector` and record the decision before scaffolding.
3. For content work, invoke `$curate-portfolio-content` and verify all claims and links.
4. For design-led work, invoke `$webdesigner-design-system` together with `$frontend-skill`.
5. Use `$stitch-design` only when its provider is available or when its fallback artifact workflow is useful.
6. Use `$project-scaffolder` and `$code-generator` only after design/content inputs and the stack gate are approved.
7. Inspect rendered output with the browser skill; do not sign off from source code alone.
8. Run `$security-audit`, then `$deploy-advisor`, before production release.
9. Mark the checkbox and add evidence only after verification passes.

## Framework note

The research report recommends Astro for content-first performance. WebDesigner's guaranteed scaffolds currently favor Next.js and React/Vite. Phase 1 must compare both facts explicitly. WebDesigner's design, content, review, security, and deployment guidance can still be used if Astro wins; do not force a framework solely to match a template.

## Invocation examples

```text
Use $portfolio-delivery to complete the next ready task in maintaskplan.md.
Use $framework-selector to produce the Phase 1 stack decision for this portfolio.
Use $curate-portfolio-content to draft the StrudelAI case study from verified primary sources.
Use $webdesigner-design-system and $frontend-skill to create the approved portfolio design brief.
Use $security-audit to review the release candidate and record validated findings.
```

