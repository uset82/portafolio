<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/docs/import-export.md; checkedOn: 2026-07-31; redactions: 0 -->

# Import and Export Workspace State

NemoClaw can now export a portable bundle of user-managed state and import it into another local workspace.

The bundle includes:

- agent directories, including materialized workspace files
- policy definitions
- user-managed blueprint directories from `paths.blueprintsDir`
- logical knowledge state from the configured `MemoryStore`

The bundle does not include live runtime state. Imported agents are always restored in a stopped state.

## Export

```sh
nemoclaw export ./backup/nemoclaw-bundle
```

To overwrite an existing bundle directory:

```sh
nemoclaw export ./backup/nemoclaw-bundle --force
```

## Import

```sh
nemoclaw import ./backup/nemoclaw-bundle
```

Imports are fail-safe by default. If the target workspace already contains an agent, policy, or blueprint with the same id or name, the import stops before copying anything.

## Bundle Layout

```text
nemoclaw-bundle/
  manifest.json
  agents/
    <agent-name>/
  policies/
    <policy-id>.json
  blueprints/
    <blueprint-id>/
  knowledge/
    <agent-name>.json
```

`manifest.json` records the bundle format version plus counts for exported agents, policies, blueprints, and memories.

## Restore Behavior

- Running, errored, and pending agents are normalized to `stopped`.
- `runtimeId`, `startedAt`, and stale `lastError` fields are cleared.
- Knowledge is restored through the logical memory interface instead of copying backend-specific database files.
- Built-in packaged blueprints are not part of this bundle format. The export only copies user-managed blueprint directories from `paths.blueprintsDir`.

## Typical Use

1. Export from the source machine or workspace.
2. Copy the bundle directory to the destination machine.
3. Initialize NemoClaw on the destination machine if needed.
4. Run `nemoclaw import <bundle-dir>`.
5. Start the restored agents normally with `nemoclaw start <name>`.

## Verification

Coverage for this flow is in:

- `packages/core/test/workspace-transfer-service.test.ts`
- `packages/core/test/lancedb-memory-store.test.ts`
- `packages/core/test/sqlite-conversation-store.test.ts`
- `packages/cli/test/commands.test.ts`
