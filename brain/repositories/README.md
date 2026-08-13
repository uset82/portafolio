# ANA repository registry

This folder holds the Repo2Agent audit of GitHub repositories owned by `uset82`.

| File | Owner | Purpose |
| --- | --- | --- |
| `registry.generated.json` | machine | Read-only capability audit. Refresh with `pnpm ana:audit`. |
| `registry.overrides.json` | human | Approved Phase 2 runtime type, domain corrections, and `enabled: false`. Always wins. |
| `manifests/*/agent.json` | human | Phase 6 and Phase 17 host copies of specialist manifests. Discovery path for the runtime registry. |
| `registry.private.generated.json` | machine, gitignored | Private-repo metadata only. Never contains file contents. |

Rules:

- Discovery is read-only. The auditor does not execute repository code.
- Newly discovered repositories stay `enabled: false` until a later phase explicitly activates them.
- Proposed `agent.json` drafts from the Phase 27 scanner are not host manifests. Approve/Edit/Ignore never enables runtime lookup.
- Host `agent.json` files in `manifests/` do not enable specialists. Runtime lookup still requires `enabled: true`.
- Private repositories never enter `registry.generated.json`.
- ANA must not be wired to this registry until Phase 5+.
