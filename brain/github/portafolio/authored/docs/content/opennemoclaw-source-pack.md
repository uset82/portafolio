<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/content/opennemoclaw-source-pack.md; checkedOn: 2026-07-31; redactions: 0 -->

# OpenNemoClaw — case-study source pack

Reviewed 2026-07-19 from the public repository, current packages and tests, Docker provider, policy engine, blueprints, documentation, GitHub metadata, contributor history, installer URLs, and media references. This pack records an implementation prototype, not a security certification or released product.

## Classification and current status

- **Canonical repository:** <https://github.com/uset82/opennemoclaw>
- **Status:** public TypeScript agent-framework prototype
- **Package version:** `0.1.0`, private npm workspace
- **Public releases/tags:** none
- **CI/workflow evidence:** no GitHub workflow runs exposed
- **Live demo:** none
- **Last source push checked:** 2026-03-18
- **License:** unresolved

The README and package manifests say MIT, but the repository contains no `LICENSE` file and GitHub detects no license. Do not call the distributed repository MIT-licensed until the file exists.

## Contribution evidence

The repository is owned by Carlos's confirmed `uset82` account. GitHub attributes one visible commit to `uset82` and three to `renoschubert`.

Safe wording: **“Carlos hosts OpenNemoClaw under his public GitHub account and is a documented contributor alongside another GitHub contributor.”**

Do not describe Carlos as sole author, primary architect, or owner of every package, blueprint, document, or visual without a separately approved contribution statement.

## Intended audience

The evidenced audience is developers experimenting with local AI-agent runtimes who can manage Node.js, npm workspaces, Docker Desktop, provider credentials, CLI workflows, and security configuration. It is not evidenced as an end-user agent product, managed cloud service, or safe default for untrusted production workloads.

## Implemented package map

The repository contains seven workspace surfaces:

- `packages/cli` — create, configure, start, stop, inspect, chat, import/export, and lifecycle commands;
- `packages/api` — HTTP/control server code and tests;
- `packages/core` — runtime, tools, agent lifecycle, channels, memory/stores, workflow/orchestration, voice, plugins, and blueprint resolution;
- `packages/connectors` — an OpenRouter connector, generic HTTP connector, and registry;
- `packages/policies` — policy loading, validation, request evaluation, and violation records;
- `packages/sandbox` — Docker lifecycle and execution integration;
- `packages/web` — a Vite/React management interface with component and browser-harness tests.

The source is materially broader than the short README. Portfolio copy should focus on the package boundaries and verified code rather than reproduce every roadmap claim.

## Blueprints

Two repository blueprints exist:

1. `basic-agent` — OpenRouter-based assistant with bounded turns/tokens, a read-only-root sandbox configuration, dropped capabilities, default-deny policy, restricted filesystem paths, and HTTP/HTTPS network allowance.
2. `web-scraper` — extends the basic agent with extraction guidance, GET/HEAD network intent, request limits, output parameters, and bounded page counts.

Both YAML files label themselves published and MIT. That is blueprint metadata, not a substitute for a repository license or proof that every rule is enforced end-to-end.

## Sandboxing evidence and limits

The Docker provider contains real controls for CPU/memory/PID limits, read-only root filesystems, `no-new-privileges`, capability drop/add lists, privileged mode, network modes, DNS/hosts/port bindings, and read-only/read-write mounts. Tests cover Docker-provider behavior and integration paths. Blueprint defaults request a read-only root, no new privileges, all capabilities dropped, and default-deny policies.

This supports **“Docker sandbox and policy controls are implemented in source.”** It does not support “completely isolated” or “secure by default” because:

- isolation strength depends on the selected image, Docker daemon, host platform, network mode, bind mounts, capabilities, and runtime configuration;
- the configuration types permit privileged mode, capability additions, host/container networking, port exposure, and writable binds;
- the policy engine allows a request when no policy is loaded;
- this review did not confirm an independent threat model, penetration test, hardened image, supply-chain review, or production deployment;
- container user enforcement and every blueprint-to-runtime control were not independently proven end to end.

Portfolio language must describe controls and design intent, not claim a security guarantee.

## Provider and credential boundary

Current source clearly contains OpenRouter integration and a generic HTTP connector. The README's broad “provider agnostic” claim is not equivalent to verified first-class support for multiple named providers. Use **“OpenRouter and extensible connector experiments”** until specific provider journeys are tested.

Credentials must remain interactive/environment-only and never appear in screenshots, commands with real values, exported workspaces, logs, or repository content.

## Installation and release blockers

All three README installation targets point to the nonexistent `uset82/opennemoc` repository rather than `uset82/opennemoclaw`:

- the macOS/Linux installer URL returns 404;
- the PowerShell installer URL returns 404;
- the manual clone URL returns 404.

Do not reproduce the one-line remote execution commands in the portfolio. Until the paths are corrected and release smoke tests are published, say only that installation scripts and local installer code exist in the repository.

## Outcome evidence

The defensible outcome is a multi-package public prototype with a CLI, API, Web UI, Docker sandbox provider, policy engine, tests, and two blueprint examples. There is no verified release, installable package, live service, working documented installer, adoption metric, security result, reliability result, or production case study.

## Media and rights

The README embeds a GitHub user-attachment hero image. Its author, source, generation method, model/terms snapshot, and portfolio permission are not documented. The repository has no license file.

The portfolio media allowlist is **empty**. Link to the repository; do not copy or hotlink the hero image, CLI screenshots, Web UI, diagrams, or generated agent output until provenance and permission are recorded.

## Safe facts for later drafting

- OpenNemoClaw is a public TypeScript prototype exploring local agent management with CLI, API, Web UI, Docker sandbox controls, and policy evaluation.
- Its workspace separates core runtime, connectors, policies, sandbox, API, CLI, and Web packages.
- The repository contains basic-agent and web-scraper blueprint examples.
- OpenRouter integration and a generic HTTP connector exist in source.
- Carlos is a documented contributor alongside another GitHub contributor.

## Claims that remain blocked

- secure, completely isolated, hardened, or production-safe;
- provider-agnostic support beyond verified connector code;
- a working quick installer, public package, release, or live demo;
- an MIT license for the repository as currently distributed;
- sole authorship or primary-architecture attribution to Carlos;
- adoption, performance, reliability, security, or production outcomes;
- reuse of the README hero or any unapproved project media.

## Primary-source trail

- Repository and README: <https://github.com/uset82/opennemoclaw>
- Docker provider: <https://github.com/uset82/opennemoclaw/blob/main/packages/sandbox/src/docker-provider.ts>
- Policy engine: <https://github.com/uset82/opennemoclaw/blob/main/packages/policies/src/engine.ts>
- Basic blueprint: <https://github.com/uset82/opennemoclaw/blob/main/blueprints/basic-agent/blueprint.yaml>
- Roadmap: <https://github.com/uset82/opennemoclaw/blob/main/ROADMAP.md>
