<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/docs/contributing-blueprints.md; checkedOn: 2026-07-31; redactions: 0 -->

# Contributing Blueprints

Blueprints are the main authoring surface for reusable agents. They define agent defaults, policies, connectors, files, and dependency chains without creating a second runtime path.

## Key Files

- `blueprints/<id>/blueprint.yaml`
- `blueprints/<id>/README.md`
- `packages/core/src/types/blueprint.ts`
- `packages/core/src/blueprints/local-blueprint-resolver.ts`
- `packages/core/test/local-blueprint-resolver.test.ts`
- `packages/core/test/agent-lifecycle-service.test.ts`

## What a Blueprint Can Define

- agent defaults: capabilities, inference config, policies, connectors, environment, resources, schedule
- runtime defaults: system prompt, max iterations, tool-call format
- sandbox defaults: image, networking, security, resources
- policies and connectors shipped with the blueprint
- materialized files under the agent workspace
- dependencies on other blueprints

The source schema lives in `packages/core/src/types/blueprint.ts`. Keep new fields aligned with that schema first, then update the resolver and tests.

## Resolution Model

`LocalBlueprintResolver` is the authority for blueprint loading and merge behavior.

- Search paths come from the configured blueprints directory, bundled built-ins, and `./blueprints`.
- Dependencies are merged first, then the requested blueprint overrides them.
- Policies, connectors, files, and parameters are merged by id or path.
- File materialization maps `/sandbox/...` entries into the persisted agent directory.

If you change merge rules, update `packages/core/src/blueprints/local-blueprint-resolver.ts` and add tests that prove the new precedence behavior.

## Authoring Rules

- Keep blueprint ids stable and lowercase.
- Treat a blueprint as a reusable template, not a place for machine-specific secrets.
- Prefer declarative defaults over hidden runtime logic.
- Put user-facing usage notes in the blueprint's own `README.md`.
- If a blueprint needs extra capabilities, make them explicit in `agent.capabilities`.

## Minimal Example

```yaml
id: support-agent
name: Support Agent
description: Example contributor blueprint
version: 1.0.0
status: published
author:
  name: NemoClaw
agent:
  capabilities:
    - filesystem
    - memory
  inference:
    provider: openrouter
    model: openrouter/free
runtime:
  systemPrompt: You are a concise support assistant.
files:
  - path: /sandbox/notes/README.txt
    content: Workspace notes live here.
```

## Typical Workflow

1. Add or edit `blueprints/<id>/blueprint.yaml`.
2. Add or update `blueprints/<id>/README.md`.
3. If you add schema or merge semantics, update the core blueprint types and resolver.
4. Verify the blueprint can be turned into a real agent through the lifecycle service.

## Verification

At minimum, cover the affected path with:

- `packages/core/test/local-blueprint-resolver.test.ts`
- `packages/core/test/agent-lifecycle-service.test.ts`

Finish with:

```sh
npm run build
npm run test
```
