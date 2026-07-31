<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/content/webdesigner-source-pack.md; checkedOn: 2026-07-31; redactions: 0 -->

# WebDesigner — case-study source pack

Reviewed 2026-07-20 from the public repository, plugin and marketplace manifests, Nightglass skill, orchestration source, bundled MCP server, third-party notices, installed plugin state, contributor metadata, and live package/MCP verification. This pack describes the plugin's evidenced scope without treating generated output as product proof.

## Classification and status

- **Canonical repository:** <https://github.com/uset82/webdesigner>
- **Artifact:** installable Codex plugin and repository marketplace
- **Current version:** `1.1.0`
- **Installed state checked:** enabled as `webdesigner@webdesigner-repo-marketplace`
- **GitHub release/tag:** none
- **CI/workflow evidence:** no GitHub workflow runs exposed
- **Repository license:** none present or detected

The plugin can be installed directly from its repository marketplace without a GitHub release. Do not describe it as published in a central marketplace, formally released on GitHub, or open source until those states are evidenced.

## Contribution evidence

The plugin manifest names Carlos Carpio as author and developer and links to the confirmed `uset82` account. The repository is owned by that account. GitHub attributes one visible commit to `uset82` and two to `g57436746-coder`.

Safe wording: **“Carlos publishes WebDesigner 1.1.0 under his GitHub account and is named as the plugin author/developer; the public commit record also includes another identity.”**

Do not claim sole implementation, sole authorship of every bundled skill, or original ownership of third-party Blender specialists. Their provenance must remain tied to `THIRD_PARTY_NOTICES.md`.

## Plugin architecture

The public package contains:

- `.codex-plugin/plugin.json` for identity, version, author, capabilities, skills, and MCP registration;
- a repository marketplace manifest and platform installers;
- `.mcp.json` pointing to the bundled Node MCP server;
- `src/` TypeScript CLI, router, orchestrator, schemas, and MCP source;
- `dist/mcp/server.js`, a self-contained installed MCP runtime;
- 15 discoverable skills covering design, lifecycle stages, and specialist Blender work;
- Nightglass tokens, references, templates, and source-pinned third-party notices;
- package verification and MCP smoke-test scripts.

Installation registers the plugin; the plugin does not automatically rewrite a user's application.

## Orchestration stages

The repository defines six lifecycle stages:

1. **Plan** — normalize intent and select a supported stack.
2. **Design** — establish visual thesis, content structure, tokens, and interaction approach.
3. **Build** — produce framework-idiomatic implementation artifacts.
4. **Security** — record findings and reviewable remediation.
5. **Review** — inspect behavior, accessibility, design coherence, and handoff.
6. **Deploy** — prepare deployment guidance for the chosen stack.

These stages are routing and workflow contracts, not proof that every provider, framework, generated site, security finding, or deployment is automatically correct.

## MCP scope

The installed MCP server exposes five tools:

- `wd_intake_project`;
- `wd_get_best_model`;
- `wd_add_artifact`;
- `wd_get_status`;
- `wd_save_code_file`.

They support structured intake, capability-based model routing, artifact/status tracking, and code-file handoff. They do not themselves supply a design provider, hosting provider, Blender installation, Mint authentication, or universal model access.

## Discoverable skill scope

The verified package exposes 15 skills:

- one WebDesigner/Nightglass design-system workflow;
- six lifecycle helpers for framework selection, scaffolding, Stitch design, code generation, security review, and deployment advice;
- eight specialist workflows for Blender modeling, materials, rigging, animation, motion inspection, export, technical art, and animation quality review.

Mint is conditional and external. Ordinary UI work does not activate Mint or Blender, and the plugin does not install those applications, purchase credits, or store provider credentials.

## Nightglass scope and portfolio override

Nightglass is a default for new or unspecified interfaces. Its evidenced system includes 86 framework-neutral tokens, Tailwind CSS v4 mappings, typography, spacing, restrained surface/elevation rules, responsive composition, accessibility guidance, purposeful motion, reduced-motion behavior, design prompts, and QA.

The repository explicitly says a strong user brief or coherent existing product language takes precedence. Carlos's portfolio therefore continues to use the approved natural Observatory palette and visual thesis; Nightglass may inform structure, accessibility, and QA but must not recolor the project to its midnight/aqua defaults.

## Verification evidence

On 2026-07-20, the installed 1.1.0 copy passed:

- `npm run verify`: 15 skills, 86 Nightglass tokens, installers, marketplace wiring, MCP bundle, and source pins;
- `npm run test:mcp`: a real MCP initialize/tool-list handshake exposing five tools;
- `codex plugin list`: installed and enabled from `webdesigner-repo-marketplace`.

This verifies packaging and MCP discovery. It is not a benchmark of generated UI quality, a security certification, an accessibility conformance report, or a production deployment test.

## Rights and provenance

`THIRD_PARTY_NOTICES.md` records provenance and license notices for bundled specialist sources, but the repository itself has no top-level license. Public visibility and an install script do not establish portfolio redistribution rights for source, brand assets, screenshots, or third-party skill text.

The portfolio media allowlist is **empty**. Use a link and Carlos-approved textual description until an original screenshot/demo is created, visually checked, scrubbed of private workspace data, and approved for public display.

## Outcome evidence

The defensible outcome is an installed, discoverable v1.1.0 Codex plugin whose package verifier and five-tool MCP handshake pass locally. No verified user count, installation count, generated-site benchmark, accessibility rate, security outcome, deployment success rate, or commercial adoption metric is available.

## Safe facts for later drafting

- WebDesigner 1.1.0 is an installable Codex plugin published from Carlos's GitHub account.
- It combines Nightglass, lifecycle-stage skills, specialist Blender workflows, and a bundled five-tool MCP orchestration server.
- The package exposes 15 discoverable skills and verifies an 86-token Nightglass contract.
- Its six lifecycle stages cover plan, design, build, security, review, and deploy.
- The installed package verifier and MCP handshake pass.

## Claims that remain blocked

- sole implementation or ownership of all bundled specialist material;
- central-marketplace publication, GitHub release, or an open-source license;
- automatic design quality, accessibility compliance, security, or deployment correctness;
- Mint, Blender, Stitch, provider, model, or hosting availability without those separate capabilities;
- adoption, productivity, quality, or business metrics;
- reuse of any unapproved screenshot, generated site, workspace, or brand asset.

## Primary-source trail

- Repository and README: <https://github.com/uset82/webdesigner>
- Plugin manifest: <https://github.com/uset82/webdesigner/blob/main/.codex-plugin/plugin.json>
- Nightglass skill: <https://github.com/uset82/webdesigner/blob/main/skills/webdesigner-design-system/SKILL.md>
- MCP server source: <https://github.com/uset82/webdesigner/blob/main/src/mcp/server.ts>
- Third-party notices: <https://github.com/uset82/webdesigner/blob/main/THIRD_PARTY_NOTICES.md>
