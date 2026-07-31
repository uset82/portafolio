# OpenNemoClaw

OpenNemoClaw is a public TypeScript agent-framework prototype. It is not a released product,
security certification, managed agent service, or evidenced safe default for untrusted
production workloads.

## Verified status and contribution

The repository is hosted under Carlos's confirmed public GitHub account. Carlos is a documented
contributor alongside another GitHub contributor; this record does not claim sole authorship,
primary architecture, or ownership of every package, blueprint, document, or visual.

## What the repository demonstrates

- workspace packages for CLI, API, core runtime, connectors, policies, Docker sandboxing, and a
  Vite/React Web interface;
- agent lifecycle, tool, memory/store, workflow, channel, voice, plugin, and blueprint surfaces;
- OpenRouter integration and a generic HTTP connector;
- Docker lifecycle and resource/configuration controls;
- policy loading, validation, request evaluation, and violation records;
- `basic-agent` and `web-scraper` blueprint examples;
- source and tests spanning several package boundaries.

## Publication boundary

The source implements Docker and policy controls, but their strength depends on the daemon,
image, host, network, mounts, capabilities, and selected configuration. The repository does not
establish complete isolation, secure defaults, a hardened supply chain, or independent security
review.

README installer URLs currently target a different nonexistent repository path. The repository
also has no detected `LICENSE` file even though README/package metadata mentions MIT. This
record therefore claims neither a working quick installer nor a distributed MIT license.

No repository hero, screenshot, diagram, or generated output is reused because its provenance
and portfolio permission are unresolved.

Source basis: `docs/content/opennemoclaw-source-pack.md` and the public repository, rechecked on
2026-07-31.
