<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/docs/plugin-manifests.md; checkedOn: 2026-07-31; redactions: 0 -->

# File-Based Plugin And Skills Manifests

NemoClaw can now discover local plugin manifests from `paths.pluginsDir` and `./plugins`. A manifest can do three things:

- expose extra blueprint directories
- declare named tool packs that activate existing registered tools by name
- declare named skills that overlay prompt, files, policies, connectors, sandbox defaults, and agent settings

## Example Manifest

```yaml
plugin:
  id: ops-extension
  name: Ops Extension
  version: 1.0.0
  description: Reusable ops blueprints and overlays.

blueprintsDir: ./blueprints

toolPacks:
  - id: shell-tools
    name: Shell Tools
    description: Enable shell execution helpers.
    tools:
      - run_command

skills:
  - id: incident-analyst
    name: Incident Analyst
    description: Add incident-response defaults.
    agent:
      capabilities:
        - filesystem
    runtime:
      systemPrompt: Prefer concise triage, timelines, and next actions.
    sandbox:
      image: plugin/image:latest
    policies:
      - id: incident-policy
        name: Incident Policy
        defaultAction: allow
    files:
      - path: /sandbox/runbooks/triage.md
        content: Follow the incident checklist.
```

## Create An Agent With Plugin Overlays

```ts
import { AgentLifecycleService } from '@nemoclaw/core';

await lifecycleService.createAgent({
  name: 'incident-pilot',
  blueprint: 'ops-agent',
  skills: ['ops-extension/incident-analyst'],
  toolPacks: ['ops-extension/shell-tools']
});
```

The selected refs are persisted in agent metadata, so later `startAgent(...)` calls reapply the same skill overlays for files, policies, and sandbox defaults.

## CLI Usage

```bash
nemoclaw create incident-pilot \
  --blueprint ops-agent \
  --skill ops-extension/incident-analyst \
  --tool-pack ops-extension/shell-tools
```

## Behavior

- Plugin blueprints are resolved through the same `LocalBlueprintResolver` path already used for built-in blueprints.
- Tool packs activate capabilities from the tools they reference. For example, a pack that includes `run_command` grants the `process` capability.
- Skills can contribute files, policies, connectors, sandbox defaults, runtime prompt additions, environment variables, resources, and schedule overrides.
- Bare refs like `incident-analyst` work when they are unique. If two plugins export the same id, use `plugin-id/skill-id` or `plugin-id/tool-pack-id`.

## Current Scope

- Tool packs group tools that are already registered in the runtime. This phase does not load arbitrary tool code from plugin files.
- Plugin manifests are local filesystem artifacts. There is no remote registry install flow yet.
- Blueprints still own the base agent definition; skills are additive overlays, not a replacement blueprint format.

## Verification

The core and product suites cover:

- `packages/core/test/local-plugin-manifest-loader.test.ts` for manifest discovery, blueprint dirs, and ref resolution
- `packages/core/test/plugin-manifest-lifecycle.test.ts` for plugin blueprint creation plus skill and tool-pack overlays
- `packages/cli/test/commands.test.ts` for CLI forwarding of `--skill` and `--tool-pack`
- `packages/api/test/app.test.ts` for API acceptance of the new create-agent fields
