# ANA / Repo2Agent Multi-Agent System

Source of truth for architecture: `updates/tasks/smartchatbot.md`.
Product thesis: `mainidea.md`.
Decisions: `docs/DECISIONS.md`.
v1 launch ledger remains `maintaskplan.md`. Post-v1 board: `updates/TASKBOARD.md`.

## How to maintain this plan

- `[ ] ☐` incomplete, blocked, or not verified.
- `[x] ☑` implemented **and** verified with evidence.
- Never mark a task complete only because code was written.
- When blocked, leave the checkbox unchecked and add `BLOCKED: <reason>` beneath it.
- Update checkboxes immediately after verification.
- Do not start a later phase before its dependencies are complete.
- Add a dated row to the completion log when a checkbox is marked.

Verification evidence may include tests, typecheck, lint, build, schema validation, API
response, runtime verification, or inspection of generated output.

---

# ANA / Repo2Agent Multi-Agent System

## PHASE 0 — Architecture and project integration

Depends on: nothing.
Do not write specialist-agent runtime code in this phase.

- [x] ☑ **ANA-0.1** Record product name: ANA is the user-facing agent.
- [x] ☑ **ANA-0.2** Record architecture/module name: Repo2Agent.
- [x] ☑ **ANA-0.3** Record that ANA is the sole user-facing orchestrator.
- [x] ☑ **ANA-0.4** Record repository runtime types: `agent`, `tool`, `knowledge`, `disabled`.
- [x] ☑ **ANA-0.5** Record that a repository is not automatically an LLM agent.
- [x] ☑ **ANA-0.6** Record that every repository must undergo capability analysis first.
- [x] ☑ **ANA-0.7** Record public vs private repository handling.
- [x] ☑ **ANA-0.8** Record that unknown repository code never executes automatically.
- [x] ☑ **ANA-0.9** Record that specialists start as read + compute; write/external-action needs explicit permission.
- [x] ☑ **ANA-0.10** Add the architecture section to `mainidea.md`.
- [x] ☑ **ANA-0.11** Add this phase plan to `taskplan.md`.
- [x] ☑ **ANA-0.12** Record decisions in `docs/DECISIONS.md`.
- [x] ☑ **ANA-0.13** Preserve the existing portfolio, CC AI, and `brain/` architecture; do not rebuild from scratch.

**Phase 0 is complete when:** the rules above are written in `mainidea.md`, `taskplan.md`, and
`docs/DECISIONS.md`, and no Phase 2+ implementation has started.

---

## PHASE 1 — Repository audit system

Depends on: Phase 0.
Read-only discovery. Do not convert repositories into agents.

- [x] ☑ **ANA-1.1** Define a typed `RepositoryAudit` schema (Zod) with repository, description, language, framework, readme, hasBackend, hasAPI, hasDatabase, hasLLM, domain, capabilities, status, agentPotential, recommendedType, visibility, enabled.
- [x] ☑ **ANA-1.2** Support status values: production, prototype, experiment, educational, empty, duplicate, fork.
- [x] ☑ **ANA-1.3** Support agentPotential values: high, medium, low, none.
- [x] ☑ **ANA-1.4** Support recommendedType values: agent, tool, knowledge, disabled.
- [x] ☑ **ANA-1.5** Place ANA repository modules under `site/src/ana/repositories/` (`schemas.ts`, `classifier.ts`, `github.ts`, `auditor.ts`).
- [x] ☑ **ANA-1.6** Add a registry-generation CLI that reuses the existing GitHub client and credential redaction.
- [x] ☑ **ANA-1.7** Enumerate all `uset82/*` owned repositories through the GitHub API (not a hardcoded catalog).
- [x] ☑ **ANA-1.8** Read public repository metadata (name, description, language, visibility, size, fork, homepage).
- [x] ☑ **ANA-1.9** Read README when available; store a redacted excerpt only.
- [x] ☑ **ANA-1.10** Inspect selected manifests when present: `package.json`, `requirements.txt`, `pyproject.toml`, Docker files, and equivalent config. Skip `.env` and secret paths.
- [x] ☑ **ANA-1.11** Detect API/backend, database, and LLM signals from paths and manifests.
- [x] ☑ **ANA-1.12** Detect empty repositories.
- [x] ☑ **ANA-1.13** Detect forks.
- [x] ☑ **ANA-1.14** Detect duplicate name collisions.
- [x] ☑ **ANA-1.15** Infer domain and capabilities without treating inference as approval.
- [x] ☑ **ANA-1.16** Infer possible recommended type and agent potential.
- [x] ☑ **ANA-1.17** Write `brain/repositories/registry.generated.json`.
- [x] ☑ **ANA-1.18** Add `brain/repositories/registry.overrides.json` with overrides winning over generated fields.
- [x] ☑ **ANA-1.19** Generated records always have `enabled: false`.
- [x] ☑ **ANA-1.20** Private repositories never enter the public generated registry; contents are not inspected.
- [x] ☑ **ANA-1.21** Do not execute repository code during discovery.
- [x] ☑ **ANA-1.22** Audit ASTROEA, pinaculo, and StrudelAI only; do not modify those repositories.
- [x] ☑ **ANA-1.23** Add schema/unit tests for classification, overrides, private-content isolation, and committed registry validation.
- [x] ☑ **ANA-1.24** Run the relevant test/typecheck/lint verification.

  Note: `pnpm test`'s `content:check` still fails on two pre-existing untracked files in `imagesandvideo/` (`ChatGPT Image Aug 11, 2026...png` and `ChatGPT Image Jul 24, 2026...png`). That inventory mismatch is unrelated to Repo2Agent and was not changed.

**Phase 1 is complete when:** a schema-valid public registry is generated from GitHub, overrides
exist, tests prove inference is separate from enablement, and private contents cannot appear in
the public artifact.

**STOP. Do not start Phase 2 until Phase 0 and Phase 1 are checked.**
Phase 0–16 are checked as of 2026-08-13. The next ready task is **ANA-17.1**.

---

## PHASE 2 — Repository classification

Depends on: Phase 1.

- [x] ☑ **ANA-2.1** Assign each audited repository one runtime type using generated inference plus human overrides.
- [x] ☑ **ANA-2.2** Keep specialist-agent candidates explicit: ASTROEA, pinaculo, StrudelAI, and later mentora, smartapply-app, Thesis-Writer-Kit.
- [x] ☑ **ANA-2.3** Classify deterministic repos as tools (QR, StillasCalculator, traffic-light, microcontroller utilities).
- [x] ☑ **ANA-2.4** Classify educational/reference repos as knowledge sources.
- [x] ☑ **ANA-2.5** Classify empty, duplicate, test, obsolete, and unrelated forks as disabled.
- [x] ☑ **ANA-2.6** Never automatically expose private repositories.
- [x] ☑ **ANA-2.7** Never automatically execute unknown repositories.
- [x] ☑ **ANA-2.8** Store the approved classification in the registry with `enabled`.
- [x] ☑ **ANA-2.9** Document why any inference was overridden.

---

## PHASE 3 — Universal RepoAgent protocol

Depends on: Phase 2.

- [x] ☑ **ANA-3.1** Create `packages/agent-protocol/` or an equivalent in-repo module without splitting a new product yet.
- [x] ☑ **ANA-3.2** Define `RepoAgent` with `manifest()`, `health()`, and `execute(request)`.
- [x] ☑ **ANA-3.3** Define `AgentManifest` (id, name, repository, version, description, domains, capabilities, inputs, outputs, permissions, sensitivity, execution, timeoutMs).
- [x] ☑ **ANA-3.4** Define `AgentResponse` (agentId, status, result, summary, evidence, assumptions, warnings, confidence, runtimeMs).
- [x] ☑ **ANA-3.5** Validate the protocol with Zod or JSON Schema.
- [x] ☑ **ANA-3.6** Add tests that reject invalid manifests and responses.

  Equivalent module: `site/src/ana/protocol/` (decision 004). No new npm package. ASTROEA,
  pinaculo, and StrudelAI were not modified.

**Phase 3 is complete when:** the shared `RepoAgent` contract exists, Zod rejects invalid
manifests and responses, and tests prove an in-memory specialist can round-trip without calling
a real repository.

**STOP. Do not start Phase 4 until Phase 3 is checked.**
Phase 0–16 are checked as of 2026-08-13. The next ready task is **ANA-17.1**.

---

## PHASE 4 — `agent.json` manifest standard

Depends on: Phase 3.

- [x] ☑ **ANA-4.1** Design `repo2agent/v1` schema.
- [x] ☑ **ANA-4.2** Validate with Zod or JSON Schema.
- [x] ☑ **ANA-4.3** Build a manifest loader.
- [x] ☑ **ANA-4.4** Reject invalid manifests.
- [x] ☑ **ANA-4.5** Version the schema so capabilities can grow without changing ANA core.
- [x] ☑ **ANA-4.6** Do not add `agent.json` to ASTROEA, pinaculo, or StrudelAI until Phase 6.

  Module: `site/src/ana/manifest/` (decision 005). Loader is read-only. This repository contains
  no committed `agent.json`. ASTROEA, pinaculo, and StrudelAI were not modified.

**Phase 4 is complete when:** `repo2agent/v1` validates, the loader rejects invalid and unknown
schema versions, new capabilities do not require an ANA core change, and no specialist GitHub
repo received `agent.json`.

**STOP. Do not start Phase 5 until Phase 4 is checked.**
Phase 0–16 are checked as of 2026-08-13. The next ready task is **ANA-17.1**.

---

## PHASE 5 — Central Agent Registry

Depends on: Phase 4.

- [x] ☑ **ANA-5.1** Add `site/src/ana/registry/` (`registry.ts`, `discovery.ts`, `schemas.ts`, `health.ts`) or extend the Phase 1 module without duplicating it.
- [x] ☑ **ANA-5.2** Load only approved, enabled manifests.
- [x] ☑ **ANA-5.3** Record health, version, availability, permissions, latency, cost estimate, and privacy level.
- [x] ☑ **ANA-5.4** Implement `findByCapability`.
- [x] ☑ **ANA-5.5** Implement `findByDomain`.
- [x] ☑ **ANA-5.6** Keep disabled and private repositories out of runtime lookup.
- [x] ☑ **ANA-5.7** Add registry tests with fixtures.

  Module: `site/src/ana/registry/` (decision 006). Audit JSON stays in
  `site/src/ana/repositories/registry.ts`. No committed `agent.json`. ASTROEA, pinaculo, and
  StrudelAI were not modified or enabled.

**Phase 5 is complete when:** runtime lookup returns only public enabled agent/tool manifests,
disabled and private repositories cannot be found, and tests cover fixtures plus the committed
empty production catalog.

**STOP. Do not start Phase 6 until Phase 5 is checked.**
Phase 0–16 are checked as of 2026-08-13. The next ready task is **ANA-17.1**.

---

## PHASE 6 — First specialist-agent proof of concept

Depends on: Phase 5.
Convert only ASTROEA, pinaculo, and StrudelAI.

For each of ASTROEA, pinaculo, and StrudelAI:

- [x] ☑ **ANA-6.1** Separate reusable core logic from UI.
- [x] ☑ **ANA-6.2** Create clean callable functions.
- [x] ☑ **ANA-6.3** Create an `/api/agent` adapter or equivalent without exposing the specialist as a user-facing chatbot.
- [x] ☑ **ANA-6.4** Add `agent.json`.
- [x] ☑ **ANA-6.5** Add validation, tests, and a health check.
- [x] ☑ **ANA-6.6** Return standardized `AgentResponse`.
- [x] ☑ **ANA-6.7** Verify each specialist independently before connecting ANA.
- [x] ☑ **ANA-6.8** Keep sensitivity labels honest (astrology/numerology are personal/cultural, not scientific advice).

  Host adapters: `site/src/ana/specialists/` (decision 007). Host `agent.json` in
  `brain/repositories/manifests/`. `/api/agent` is gated off. Audit `enabled` stays false.
  ASTROEA, pinaculo, and StrudelAI GitHub remotes were not modified.

**Phase 6 is complete when:** each of the three specialists can be invoked independently through
the RepoAgent contract, returns `AgentResponse`, carries honest sensitivity labels, and is not
wired into ANA Core or the public CC AI UI.

**STOP. Do not start Phase 7 until Phase 6 is checked.**
Phase 0–16 are checked as of 2026-08-13. The next ready task is **ANA-17.1**.

---

## PHASE 7 — ANA Core

Depends on: Phase 6.

- [x] ☑ **ANA-7.1** Add `site/src/ana/core/` (`ana.ts`, `planner.ts`, `router.ts`, `executor.ts`, `synthesizer.ts`, `verifier.ts`).
- [x] ☑ **ANA-7.2** Implement understand → plan → select → validate inputs → execute → compare → synthesize → answer.
- [x] ☑ **ANA-7.3** Keep ANA from answering specialist domains without delegation when a capable agent exists.
- [x] ☑ **ANA-7.4** Preserve CC AI's public-only knowledge boundary for portfolio facts.
- [x] ☑ **ANA-7.5** Add unit tests for the core loop with fake agents.

  Module: `site/src/ana/core/` (decision 008). Deterministic keyword planner, not an LLM.
  `runAna` talks to injected `RepoAgent` instances. No visitor chat route. Audit `enabled`
  stays false. `/api/cc-ai` is unchanged.

**Phase 7 is complete when:** the core loop delegates specialist domains to fake or injected
agents, refuses to invent answers when a capable agent exists but was not used, defers
portfolio facts to CC AI's public-knowledge boundary, and unit tests cover those paths.

**STOP. Do not start Phase 8 until Phase 7 is checked.**
Phase 0–16 are checked as of 2026-08-13. The next ready task is **ANA-17.1**.

---

## PHASE 8 — Intent router

Depends on: Phase 7.

- [x] ☑ **ANA-8.1** Detect user goal and domains.
- [x] ☑ **ANA-8.2** Extract already-provided data.
- [x] ☑ **ANA-8.3** Identify missing required inputs.
- [x] ☑ **ANA-8.4** Select the minimum required agents/tools.
- [x] ☑ **ANA-8.5** Avoid activating irrelevant agents.
- [x] ☑ **ANA-8.6** Ask the user only for missing information.
- [x] ☑ **ANA-8.7** Produce an internal execution DAG.
- [x] ☑ **ANA-8.8** Cover the multi-domain example (name, birth data, study, music company) as a fixture, not as live personal data.

  Module: `site/src/ana/core/intent.ts` + `routeIntent` (decision 009). Deterministic kebab-case
  goals. Unregistered agents (`mentora`, `business`) are recorded, not invented. The Anna/Oslo
  example is a test fixture. The DAG is declared; parallel `Promise.allSettled` is Phase 9.

**Phase 8 is complete when:** the router detects goals and domains, extracts provided fields,
selects only the minimum registered agents, asks only for those agents' missing inputs, emits
an internal DAG, and the Anna/Oslo fixture is covered without live personal data.

**STOP. Do not start Phase 9 until Phase 8 is checked.**
Phase 0–16 are checked as of 2026-08-13. The next ready task is **ANA-17.1**.

---

## PHASE 9 — Parallel execution

Depends on: Phase 8.

- [x] ☑ **ANA-9.1** Run independent agents with `Promise.allSettled` or equivalent.
- [x] ☑ **ANA-9.2** Timeout protection.
- [x] ☑ **ANA-9.3** Retry policy.
- [x] ☑ **ANA-9.4** Partial failure handling so one specialist cannot break ANA.
- [x] ☑ **ANA-9.5** Concurrency limit.
- [x] ☑ **ANA-9.6** Cost limit.
- [x] ☑ **ANA-9.7** Cancellation.
- [x] ☑ **ANA-9.8** Execution tracing (no sensitive inputs in traces).

  Module: `site/src/ana/core/executor.ts` (decision 010). Independent steps run in a bounded
  pool. Throws, timeouts, and aborts become failed `AgentResponse`s. Traces never include
  input values. Dependent edges still run sequentially until Phase 10.

**Phase 9 is complete when:** independent specialists overlap, one failure cannot break ANA,
timeouts/retries/concurrency/cost/cancellation are enforced, and traces omit sensitive inputs.

**STOP. Do not start Phase 10 until Phase 9 is checked.**
Phase 0–16 are checked as of 2026-08-13. The next ready task is **ANA-17.1**.

---

## PHASE 10 — Dependency DAG

Depends on: Phase 9.

- [x] ☑ **ANA-10.1** DAG planner.
- [x] ☑ **ANA-10.2** Dependency resolution.
- [x] ☑ **ANA-10.3** Circular dependency detection.
- [x] ☑ **ANA-10.4** Parallel independent branches.
- [x] ☑ **ANA-10.5** Sequential dependent branches.
- [x] ☑ **ANA-10.6** Tests for career-after-education and business-after-career graphs.

  Module: `site/src/ana/core/dag.ts` (decision 011). Policy edges: career after education/mentora;
  business after career + astraea + pinaculo. Missing predecessors are dropped. Cycles are not
  executed. Waves run independent nodes in parallel.

**Phase 10 is complete when:** the planner resolves a DAG, detects cycles, runs independent
branches in parallel and dependents after their predecessors, and tests cover career-after-education
and business-after-career.

**STOP. Do not start Phase 11 until Phase 10 is checked.**
Phase 0–16 are checked as of 2026-08-13. The next ready task is **ANA-17.1**.

---

## PHASE 11 — Synthesis engine

Depends on: Phase 10.

- [x] ☑ **ANA-11.1** Implement `synthesizer.ts` so ANA reasons across results instead of concatenating them.
- [x] ☑ **ANA-11.2** Structure output: agreements, contradictions, high-confidence facts, assumptions, symbolic interpretation, practical evidence, recommendations, action plan.
- [x] ☑ **ANA-11.3** Keep factual analysis separate from symbolic astrology/numerology interpretation.
- [x] ☑ **ANA-11.4** Add synthesis fixtures with conflicting specialist outputs.

  Module: `site/src/ana/core/synthesizer.ts` (decision 012). High-confidence facts come only from
  practical specialists. Symbolic natal/numerology never enters that section. Conflicts are
  listed; ANA does not pick a winner or invent a blended claim.

**Phase 11 is complete when:** the answer is structured, symbolic interpretation is separate from
facts, conflicting fixtures are covered, and ANA does not concatenate specialist summaries as one voice.

**STOP. Do not start Phase 12 until Phase 11 is checked.**
Phase 0–16 are checked as of 2026-08-13. The next ready task is **ANA-17.1**.

---

## PHASE 12 — Provenance

Depends on: Phase 11.

- [x] ☑ **ANA-12.1** Attach producer, repository, capability, timestamp, input fingerprint, and confidence to important statements.
- [x] ☑ **ANA-12.2** Surface sources in the ANA response without exposing private inputs.
- [x] ☑ **ANA-12.3** Tests that a synthesized claim retains its specialist sources.

  Module: `site/src/ana/core/provenance.ts` (decision 013). Input fingerprints are SHA-256 of
  hashed field values, never the raw birth data or names. Sources list agent, repo, capability,
  time, confidence, and a fingerprint prefix.

**Phase 12 is complete when:** each specialist claim carries producer/repo/capability/time/fingerprint/confidence,
the public answer lists sources without private inputs, and tests prove the claim retains those sources.

**STOP. Do not start Phase 13 until Phase 12 is checked.**
Phase 0–16 are checked as of 2026-08-13. The next ready task is **ANA-17.1**.

---

## PHASE 13 — Memory

Depends on: Phase 12.

- [x] ☑ **ANA-13.1** Session memory for the current conversation.
- [x] ☑ **ANA-13.2** User memory only with explicit save controls.
- [x] ☑ **ANA-13.3** Delete-memory control.
- [x] ☑ **ANA-13.4** Data categories and per-agent permissions.
- [x] ☑ **ANA-13.5** Encryption for sensitive stored data.
- [x] ☑ **ANA-13.6** Keep private profile data out of the public portfolio and CC AI ledger.
- [x] ☑ **ANA-13.7** If `brain-private` is used, keep it isolated from client bundles.

  Module: `site/src/ana/memory/` (decision 014). In-process store. Session reuses provided
  fields; user memory requires `consent: true`; `deleteMemory` covers session/user/project.
  Sensitive categories are AES-256-GCM. Project memory cannot hold birth data. Persistence, if
  added later, must pass `assertMemoryPathIsolated`. No visitor delete button; no CC AI change.

Discovered, not in Phase 1: extra book folders for numerology/astrology belong in `brain-private`
after `Q.10`, not inside `uset82/ASTROEA` or `uset82/pinaculo`.

**Phase 13 is complete when:** session, user, and project scopes stay separate, user memory
requires consent, deletion works, categories/permissions exist, sensitive data is encrypted,
and private profile cannot enter the public ledger or client bundles.

**STOP. Do not start Phase 14 until Phase 13 is checked.**
Phase 0–16 are checked as of 2026-08-13. The next ready task is **ANA-17.1**.

---

## PHASE 14 — Privacy-aware context routing

Depends on: Phase 13.

- [x] ☑ **ANA-14.1** Implement `contextFilter(agentId, userContext)`.
- [x] ☑ **ANA-14.2** Agent-specific input allowlists (ASTROEA gets birth data; Strudel gets music preferences; career gets education/skills).
- [x] ☑ **ANA-14.3** Sensitive field masking.
- [x] ☑ **ANA-14.4** Explicit consent before sharing personal profile fields.
- [x] ☑ **ANA-14.5** No secret data, birth data, or profile data in logs or analytics.

  Module: `site/src/ana/privacy/` (decision 015). `executePlan` intersects the allowlist with
  declared manifest inputs. Personal fields require `consent` / `sharePersonalProfile`.
  `toAnalyticsEvent` copies only safe metadata keys.

**Phase 14 is complete when:** each specialist receives only required fields, personal profile
sharing needs consent, logs/analytics omit secrets and birth/profile data, and tests prove the
ASTRAEA / Pináculo / Strudel / career split.

**STOP. Do not start Phase 15 until Phase 14 is checked.**
Phase 0–16 are checked as of 2026-08-13. The next ready task is **ANA-17.1**.

---

## PHASE 15 — Sandbox execution

Depends on: Phase 14.

- [x] ☑ **ANA-15.1** No arbitrary repository code inside the portfolio Node process.
- [x] ☑ **ANA-15.2** CPU, memory, and timeout limits.
- [x] ☑ **ANA-15.3** Network restrictions.
- [x] ☑ **ANA-15.4** Filesystem isolation.
- [x] ☑ **ANA-15.5** Secret isolation.
- [x] ☑ **ANA-15.6** Output validation before ANA consumes sandbox results.

  Module: `site/src/ana/sandbox/` (decision 016). `runRepository` is denied in-process.
  Limits default to 15s / 128MB / 8s CPU. HTTP engines reject file/metadata URLs. Sandbox env
  drops API keys. Output is size-checked and stripped of dangerous keys. Pináculo remains a
  reviewed host function. Docker is not wired.

**Phase 15 is complete when:** untrusted repo code cannot run in the portfolio process, jobs
carry resource limits, network/fs/secrets are isolated, and ANA only consumes validated output.

**STOP. Do not start Phase 16 until Phase 15 is checked.**
Phase 0–16 are checked as of 2026-08-13. The next ready task is **ANA-17.1**.

---

## PHASE 16 — Security gate

Depends on: Phase 15.

- [x] ☑ **ANA-16.1** Insert Security Gate between planner and execution.
- [x] ☑ **ANA-16.2** Check whether the agent may run, access the requested information, write, call external APIs, expose secrets, or require confirmation.
- [x] ☑ **ANA-16.3** Permission levels: read, compute, network, write, external-action, high-risk.
- [x] ☑ **ANA-16.4** Default visitor-facing specialists to read + compute.
- [x] ☑ **ANA-16.5** Tests that write/external-action is denied without an explicit grant.

  Module: `site/src/ana/security/` (decision 017). Visitor grant is `read` + `compute`.
  `write`, `external-action`, and `high-risk` also need confirmation. ASTRAEA/Strudel still
  declare `network` and stay disabled for visitors until an explicit grant.

**Phase 16 is complete when:** the gate sits between plan and execute, visitor default is
read+compute, and write/external-action cannot run without an explicit grant.

**STOP. Do not start Phase 17 until Phase 16 is checked.**
Phase 0–17 are checked as of 2026-08-13. The next ready task is **ANA-18.1**.

---

## PHASE 17 — Second-wave repository integration

Depends on: Phase 6 verified and Phase 16.

- [x] ☑ **ANA-17.1** Integrate wave 2 as classified: mentora, smartapply-app, Thesis-Writer-Kit, Paper2Video, avatar-studio, 3Doodle, StillasCalculator, SmartHomeControl, iFoundYou.
- [x] ☑ **ANA-17.2** Prefer one Electronics agent with tools (Traffic Light, FPGA/UART knowledge, microcontroller, SmartHome, watering) instead of five embedded LLM agents.
- [x] ☑ **ANA-17.3** Do not activate disabled or private repositories.

  Host adapters in `site/src/ana/specialists/` (decision 018). Mentora / SmartApply / Thesis
  Writer are injected-engine agents (default unavailable). Stillas is a tool catalog.
  Electronics is one `electronics-agent` with five tools. Knowledge and Paper2Video have no
  manifests. `enabled` stays false.

**Phase 17 is complete when:** wave 2 is wired as classified, electronics is one specialist
with tools, and disabled/private repositories stay inactive.

**STOP. Do not start Phase 18 until Phase 17 is checked.**
Phase 0–30 of the sequential ANA / Repo2Agent ledger are checked as of 2026-08-13. Do not enable specialists. Do not replace CC AI.

---

## PHASE 18 — Domain agents

Depends on: Phase 17.

- [x] ☑ **ANA-18.1** Introduce Creative, Engineering, Personal Insight, Education, and Career domain agents.
- [x] ☑ **ANA-18.2** Hide micro-agent sprawl from ANA's default selection.
- [x] ☑ **ANA-18.3** Keep specialist provenance visible after domain aggregation.

  Module: `site/src/ana/domains/` (decision 019). Default selection is the five domain agents;
  execution expands to registered specialists. Knowledge/disabled members are not executed.
  Sources still name the specialist (`via` the domain).

**Phase 18 is complete when:** the five domain agents exist, default selection is domains not
micro-agents, and specialist provenance remains visible.

**STOP. Do not start Phase 19 until Phase 18 is checked.**
Phase 0–30 of the sequential ANA / Repo2Agent ledger are checked as of 2026-08-13. Do not enable specialists. Do not replace CC AI.

---

## PHASE 19 — Semantic capability discovery

Depends on: Phase 18.

- [x] ☑ **ANA-19.1** Embed agent descriptions, capabilities, README summaries, API schemas, and tool descriptions.
- [x] ☑ **ANA-19.2** Rank registry matches for free-text engineering queries (for example STM32 interrupt debugging).
- [x] ☑ **ANA-19.3** Fall back to keyword/capability lookup when embeddings are unavailable.
- [x] ☑ **ANA-19.4** Do not index private or disabled repositories.

  Module: `site/src/ana/discovery/` (decision 020). Default “embeddings” are a local 256-dim
  hashed TF vectorizer (no new model package). Keyword ranking is used when embeddings are
  unavailable. Private, disabled, and Paper2Video repositories are not indexed.

**Phase 19 is complete when:** free-text engineering queries rank toward electronics, keyword
fallback works without embeddings, and private/disabled repos stay out of the index.

**STOP. Do not start Phase 20 until Phase 19 is checked.**
Phase 0–30 of the sequential ANA / Repo2Agent ledger are checked as of 2026-08-13. Do not enable specialists. Do not replace CC AI.

---

## PHASE 20 — Observability / debug dashboard

Depends on: Phase 9.

- [x] ☑ **ANA-20.1** Internal `/ana/debug` dashboard (not a public visitor feature).
- [x] ☑ **ANA-20.2** Show request, plan, active agents, latency, tokens, cost, and result.
- [x] ☑ **ANA-20.3** Request ID and trace ID.
- [x] ☑ **ANA-20.4** No sensitive inputs in telemetry.

  Module: `site/src/ana/debug/` (decision 021). Gated by `ANA_DEBUG_ENABLED` (default false);
  `/ana/debug` 404s when off and is not in public navigation. Snapshots redact the request
  preview and omit provided inputs, specialist payloads, and the synthesized answer. Cost is
  executor units; token counts stay unreported until an engine returns usage.

**Phase 20 is complete when:** the internal dashboard exists, shows the observability fields,
carries request/trace IDs, and telemetry has no sensitive inputs.

**STOP. Do not start Phase 21 until Phase 20 is checked.**
Phase 0–30 of the sequential ANA / Repo2Agent ledger are checked as of 2026-08-13. Do not enable specialists. Do not replace CC AI.

---

## PHASE 21 — Portfolio ANA UI integration

Depends on: Phase 7 and Phase 11. Replaces CC AI only after equivalent safety gates pass.

- [x] ☑ **ANA-21.1** Connect ANA to the existing assistant UI without blocking primary navigation.
- [x] ☑ **ANA-21.2** Offer exploration prompts (career, education, personality, business, engineering, music, astrology, numerology, projects) only when those capabilities are enabled.
- [x] ☑ **ANA-21.3** Map Observatory artifacts to active specialists (ASTRAEA, PINÁCULO, Sound Lab, electronics) as status, not as separate chatbots.
- [x] ☑ **ANA-21.4** Keep a complete `prefers-reduced-motion` and no-JS path.
- [x] ☑ **ANA-21.5** Preserve CC AI's public-only refusal behavior until ANA's knowledge gate is proven.

  Typed questions and the existing CACM AI welcome prompts stay on `/api/cc-ai`. ANA chips
  appear only when `ANA_SPECIALISTS_ENABLED` is true and every required agent is listed;
  the homepage currently passes `availableAgentIds: []`. `POST /api/ana` reuses the CC AI
  abuse guard, ignores client `input` blobs, and omits `plan.provided`. Observatory mapping
  is status only. Recorded as `docs/DECISIONS.md` 022.

**Phase 21 is complete when:** ANA is reachable from the existing assistant shell without
blocking navigation, chips stay capability-gated, Observatory mapping is status not chat,
reduced-motion and no-JS paths exist, and typed questions still use CC AI.

**STOP. Do not start Phase 22 until Phase 21 is checked.**
Phase 0–30 of the sequential ANA / Repo2Agent ledger are checked as of 2026-08-13. Do not enable specialists. Do not replace CC AI.

---

## PHASE 22 — Streaming execution status

Depends on: Phase 9 and Phase 21.

- [x] ☑ **ANA-22.1** Stream plan/execution status instead of waiting for the full synthesis.
- [x] ☑ **ANA-22.2** Choose SSE or the existing route-handler streaming style; do not add a new realtime stack without a decision record.
- [x] ☑ **ANA-22.3** Accessible status announcements that do not read every token.

  SSE on existing `POST /api/ana` when `Accept: text/event-stream`; JSON remains the default.
  Status events are understanding / planning / running / combining. The answer arrives once
  in `complete`. The polite live region announces phases, not tokens. Recorded as
  `docs/DECISIONS.md` 023.

**Phase 22 is complete when:** ANA can stream plan/execution status over SSE without a new
realtime stack, JSON still works, and accessible announcements do not read every token.

**STOP. Do not start Phase 23 until Phase 22 is checked.**
Phase 0–30 of the sequential ANA / Repo2Agent ledger are checked as of 2026-08-13. Do not enable specialists. Do not replace CC AI.

---

## PHASE 23 — Controlled agent-to-agent calls

Depends on: Phase 10 and Phase 16.

- [x] ☑ **ANA-23.1** Allow a specialist to request another specialist only through ANA's runtime.
- [x] ☑ **ANA-23.2** Enforce `maxAgentDepth = 3`, `maxAgentsPerRequest = 8`, `maxRuntime = 30s`, configurable budget.
- [x] ☑ **ANA-23.3** No uncontrolled autonomous recursion.
- [x] ☑ **ANA-23.4** Every sub-agent call remains visible in the trace.

  Module: `site/src/ana/core/delegation.ts` (decision 024). Follow-ups use `requestSpecialist`
  with `{ agentId, capability, reason }` only; ANA fills input from `plan.provided`. Defaults
  are depth 3, 8 agents, 30s wall-clock, existing `costLimit`. Recursion, depth 4, a 9th
  specialist, and runtime expiry are denied. Traces add `delegate` / `delegate-denied` with
  `via`, `depth`, and reason codes. Host adapters were not changed. Specialists stay disabled.

**Phase 23 is complete when:** specialists can request other specialists only through ANA,
limits are enforced, recursion is blocked, and every sub-call is visible in the trace.

**STOP. Do not start Phase 24 until Phase 23 is checked.**
Phase 0–30 of the sequential ANA / Repo2Agent ledger are checked as of 2026-08-13. Do not enable specialists. Do not replace CC AI.

---

## PHASE 24 — Verification layer

Depends on: Phase 11.

- [x] ☑ **ANA-24.1** Schema validator on every agent result.
- [x] ☑ **ANA-24.2** Consistency check across agents.
- [x] ☑ **ANA-24.3** Optional verification agent.
- [x] ☑ **ANA-24.4** Detect unanswered capability, invalid output, execution failure, undeclared assumptions, contradictions, and low confidence.

  Module: `site/src/ana/core/verifier.ts` (decision 025). Envelope plus declared-output schema,
  same-capability contradictions, and the six finding codes. Optional `ana-verifier` runs only
  when requested and never receives private inputs. Invalid/unanswered results are excluded from
  high-confidence facts. Specialists stay disabled.

**Phase 24 is complete when:** every executed result is schema-checked, contradictions are
detected, an optional verifier exists, and the six verification checks are recorded.

**STOP. Do not start Phase 25 until Phase 24 is checked.**
Phase 0–30 of the sequential ANA / Repo2Agent ledger are checked as of 2026-08-13. Do not enable specialists. Do not replace CC AI.

---

## PHASE 25 — Ask My Portfolio

Depends on: Phase 5, Phase 7, and the public knowledge ledger.

- [x] ☑ **ANA-25.1** Answer portfolio navigation questions from repository knowledge plus ANA synthesis.
- [x] ☑ **ANA-25.2** Examples: embedded-systems work; projects that combine AI and creativity.
- [x] ☑ **ANA-25.3** Cite public sources only. No invented metrics or private repos.

  Module: `site/src/ana/knowledge/portfolio.ts` (decision 026). Goal `ask-portfolio` searches
  public audits. Embedded queries rank TRAFFICLIGHT; AI/creativity ranks StrudelAI, 3Doodle, and
  avatar-studio. Paper2Video, private, empty, and fork repos are omitted. CV/case-study questions
  still defer to CC AI. Specialists stay disabled.

**Phase 25 is complete when:** ANA can navigate public repositories for the example questions,
cite GitHub sources, and refuse invented metrics, private repos, and biography claims.

**STOP. Do not start Phase 26 until Phase 25 is checked.**
Phase 0–30 of the sequential ANA / Repo2Agent ledger are checked as of 2026-08-13. Do not enable specialists. Do not replace CC AI.

---

## PHASE 26 — Advanced multi-domain analysis

Depends on: Phase 11, Phase 14, and Phase 24.

- [x] ☑ **ANA-26.1** Optional combined analysis across ASTROEA, pinaculo, education, career, and business agents.
- [x] ☑ **ANA-26.2** Clearly separate factual analysis, symbolic interpretation, AI inference, and actionable recommendation.
- [x] ☑ **ANA-26.3** Collect sensitive inputs only with consent and route them per Phase 14.

  Goal `combined-analysis` is opt-in (decision 027). Natal-only stays ASTRAEA. Combined answers
  lead with FACTUAL ANALYSIS / SYMBOLIC INTERPRETATION / AI INFERENCE / ACTIONABLE RECOMMENDATION.
  Personal fields are not sent until explicit consent. Market research stays listed if unregistered.
  Specialists stay disabled.

**Phase 26 is complete when:** a consented combined request can call the five specialists without
mixing natal claims into facts, and an unconsented combined request does not share the profile.

**STOP. Do not start Phase 27 until Phase 26 is checked.**
Phase 0–30 of the sequential ANA / Repo2Agent ledger are checked as of 2026-08-13. Do not enable specialists. Do not replace CC AI.

---

## PHASE 27 — Automatic repository discovery

Depends on: Phase 1 and Phase 4.

- [x] ☑ **ANA-27.1** Scan GitHub for new owned repositories.
- [x] ☑ **ANA-27.2** Infer capabilities and propose `agent.json`.
- [x] ☑ **ANA-27.3** Require human approval before registry activation.
- [x] ☑ **ANA-27.4** Never auto-activate unreviewed code.

  Scanner: `site/src/ana/repositories/scanner.ts` and `proposals.ts` (decision 028). Diffs listed
  owned repos against known audits. New agent/tool candidates get a proposed `repo2agent/v1`
  document. Approve/Edit/Ignore never set `enabled: true`. Runtime registry still skips
  `not-enabled`. ASTROEA, pinaculo, and StrudelAI remotes were not modified.

**Phase 27 is complete when:** a new owned repository can be scanned and proposed without entering
the runtime registry, and unreviewed code cannot activate.

**STOP. Do not start Phase 28 until Phase 27 is checked.**
Phase 0–30 of the sequential ANA / Repo2Agent ledger are checked as of 2026-08-13. Do not enable specialists. Do not replace CC AI.

---

## PHASE 28 — Repo2Agent SDK

Depends on: Phase 4 and a stable in-repo protocol.

- [x] ☑ **ANA-28.1** `npx repo2agent init` scaffolding (`agent.json`, `AGENTS.md`, agent module, tests).
- [x] ☑ **ANA-28.2** `validate`, `test`, and `register` commands.
- [x] ☑ **ANA-28.3** Do not publish a package until this phase is explicitly authorized.

  In-repo CLI: `pnpm repo2agent` → `scripts/repo2agent.ts` (decision 029). `init` writes the spec
  tree. `validate` / `test` / `register` use the existing `repo2agent/v1` loader. `register`
  copies `agent.json` into a manifests root with `enabled: false`. `publish` is denied. ASTROEA,
  pinaculo, and StrudelAI remotes are refused. Site `package.json` stays private.

**Phase 28 is complete when:** the four commands exist locally, a scaffold validates, and npm
publish is not authorized.

**STOP. Do not start Phase 29 until Phase 28 is checked.**
Phase 0–30 of the sequential ANA / Repo2Agent ledger are checked as of 2026-08-13. Do not enable specialists. Do not replace CC AI.

---

## PHASE 29 — Final architecture integration

Depends on: Phases 7–16 and 21.

- [x] ☑ **ANA-29.1** Confirm the runtime path: User → ANA → planner → registry → capability selection → specialists/tools → sandbox → result bus → verification → synthesis → user.
- [x] ☑ **ANA-29.2** Confirm ANA does not need per-repository implementation knowledge.
- [x] ☑ **ANA-29.3** Record remaining gaps in `docs/DECISIONS.md`.

  Confirmed path (decision 030): gated `POST /api/ana` → `runAna` → `draftPlan` →
  `indexRepoAgents` / `routeIntent` → `executePlan` (sandbox + security gate) → traces/responses
  → `completeVerification` → `synthesizeAnaResult`. Execute/verify/synthesize stay on the
  `RepoAgent` protocol. Default routing still names known specialists. Remaining gaps live in
  ADR 030. Specialists stay disabled. CC AI stays public.

**Phase 29 is complete when:** the runtime path is confirmed against code, ANA Core stays
repository-agnostic at execute/verify/synthesize, and remaining gaps are recorded.

**STOP. Do not start Phase 30 until Phase 29 is checked.**
Phase 0–30 of the sequential ANA / Repo2Agent ledger are checked as of 2026-08-13. Do not enable specialists. Do not replace CC AI.

---

## PHASE 30 — Acceptance tests / Definition of Done

Depends on: Phase 29.

Repo2Agent v1 is finished only when all of these are verified:

- [x] ☑ **ANA-30.1** ANA receives one natural-language question.
- [x] ☑ **ANA-30.2** ANA understands the goal.
- [x] ☑ **ANA-30.3** ANA searches the agent registry.
- [x] ☑ **ANA-30.4** ANA selects the correct specialist agent(s).
- [x] ☑ **ANA-30.5** ANA requests missing information only when needed.
- [x] ☑ **ANA-30.6** Agents can run concurrently.
- [x] ☑ **ANA-30.7** Each agent receives only required user data.
- [x] ☑ **ANA-30.8** Deterministic repos execute as tools rather than unnecessary LLMs.
- [x] ☑ **ANA-30.9** Repository code runs isolated when execution is required.
- [x] ☑ **ANA-30.10** Agent outputs follow one shared schema.
- [x] ☑ **ANA-30.11** Failures do not break ANA.
- [x] ☑ **ANA-30.12** ANA identifies contradictions.
- [x] ☑ **ANA-30.13** ANA synthesizes rather than concatenating answers.
- [x] ☑ **ANA-30.14** Results retain repository/agent provenance.
- [x] ☑ **ANA-30.15** The user sees one coherent response.
- [x] ☑ **ANA-30.16** The portfolio UI visualizes which systems were activated.
- [x] ☑ **ANA-30.17** New repos can later be discovered and registered without modifying ANA Core.

  Definition of Done (decision 031): verified in-process by
  `site/src/tests/ana-definition-of-done.test.ts`. Public `POST /api/ana` stays gated. CC AI
  stays the visitor assistant. ANA-30.17 covers scan / register / protocol execute without
  editing ANA Core; named catalog routing remains a gap (ADR 030). Production ANA is not live.

**Phase 30 is complete when:** all 17 Definition of Done checks pass against the in-repo
orchestrator. Public ANA stays gated.

**STOP.** Phase 0–30 of the sequential ANA / Repo2Agent ledger are checked as of 2026-08-13.
Do not enable specialists. Do not replace CC AI. Remaining product gaps stay in ADR 030 and 031.

---

## Completion log

| Date | Task ID | What changed | Checks or review evidence |
| --- | --- | --- | --- |
| 2026-08-12 | ANA-0.1–ANA-0.13 | Documented ANA as the sole user-facing orchestrator, Repo2Agent as the module name, four runtime types, public/private split, no auto-execution, and read+compute defaults. Created `mainidea.md` and `taskplan.md`; recorded decisions in `docs/DECISIONS.md`; pointed `AGENTS.md`, `updates/TASKBOARD.md`, and `maintaskplan.md` at the new plan. | Inspection of those files. No Phase 2+ runtime work started. |
| 2026-08-12 | ANA-1.1–ANA-1.6 | Added typed `RepositoryAudit` schema and ANA repository modules under `site/src/ana/repositories/`, plus `scripts/ana-audit-repositories.ts` reusing the GitHub client and credential redaction. | `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-12 | ANA-1.7–ANA-1.22 | Live GitHub audit of owned repositories. Wrote `brain/repositories/registry.generated.json` (62 public, all `enabled: false`). Private repos counted without content inspection into a gitignored file. ASTROEA, pinaculo, and StrudelAI audited as disabled agent candidates. Those three repos were not modified. | `pnpm ana:audit -- --checked-on 2026-08-12` → “62 public repositories. 8 private repositories were counted without content inspection.” Schema validation of the committed registry. |
| 2026-08-12 | ANA-2.1–ANA-2.9 | Assigned all 62 public repositories a runtime type via `registry.overrides.json` (6 agents, 8 tools, 31 knowledge, 17 disabled). Every override keeps `enabled: false`. Documented override reasons in notes and `docs/DECISIONS.md` 003. ASTROEA, pinaculo, and StrudelAI were not modified. | `tsx --test src/tests/ana-repository-classification.test.ts` plus audit tests: 13/13 pass. `pnpm typecheck` and `pnpm lint` exit 0. Effective registry: specialists remain disabled; private repos absent; portafolio domain locked to `portfolio`. |
| 2026-08-12 | ANA-3.1–ANA-3.6 | Added the universal RepoAgent protocol at `site/src/ana/protocol/` (Zod `AgentManifest` / `AgentRequest` / `AgentHealth` / `AgentResponse`, `RepoAgent` interface, `invokeRepoAgent`). In-memory fixture only. No `agent.json` and no changes to ASTROEA, pinaculo, or StrudelAI. Recorded as `docs/DECISIONS.md` 004. | `tsx --test src/tests/ana-agent-protocol.test.ts` plus prior ANA tests: 19/19 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-4.1–ANA-4.6 | Added versioned `repo2agent/v1` `agent.json` schema and read-only loader at `site/src/ana/manifest/`. Documents convert to the Phase 3 `AgentManifest`. Unknown schema versions fail as `unsupported_schema`. No committed `agent.json`; ASTROEA, pinaculo, and StrudelAI were not modified. Recorded as `docs/DECISIONS.md` 005. | `tsx --test src/tests/ana-agent-json.test.ts` plus prior ANA tests: 24/24 pass. `pnpm typecheck` and `pnpm lint` exit 0. Repo walk found zero `agent.json` files. |
| 2026-08-13 | ANA-5.1–ANA-5.7 | Added the central Agent Registry at `site/src/ana/registry/` with admission gating, `findByCapability` / `findByDomain`, and health/availability/privacy/cost/latency fields. Committed audits stay `enabled: false`; in-memory ASTROEA/pinaculo/StrudelAI documents are skipped. Recorded as `docs/DECISIONS.md` 006. | `tsx --test src/tests/ana-agent-registry.test.ts` plus prior ANA tests: 29/29 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-6.1–ANA-6.8 | Added host adapters for ASTROEA, pinaculo, and StrudelAI in `site/src/ana/specialists/`. Pináculo runs the extracted calculator; ASTRAEA/StrudelAI use injected HTTP engines. Host `agent.json` in `brain/repositories/manifests/`. `/api/agent` is gated by `ANA_SPECIALISTS_ENABLED`. Audit `enabled` stays false. Those three GitHub remotes were not modified. Recorded as `docs/DECISIONS.md` 007. | `tsx --test src/tests/ana-specialists.test.ts` plus prior ANA tests: 34/34 pass. `pnpm typecheck` and `pnpm lint` exit 0. Runtime registry still empty. |
| 2026-08-13 | ANA-7.1–ANA-7.5 | Added ANA Core at `site/src/ana/core/` (`runAna`: understand → plan → select → validate inputs → execute → compare → synthesize). Specialist domains require delegation; portfolio facts defer with `ANA_PORTFOLIO_BOUNDARY`. No visitor ANA route and no CC AI replacement. Recorded as `docs/DECISIONS.md` 008. | `tsx --test src/tests/ana-core.test.ts` plus prior ANA tests: 41/41 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-8.1–ANA-8.8 | Added a deterministic intent router (`intent.ts`, `routeIntent`) with kebab-case goals, provided-field extraction, minimum-agent selection, missing-input prompts for selected agents only, and an internal parallel DAG. The Anna/Oslo multi-domain example is a fixture; `mentora` and `business` stay unavailable. Recorded as `docs/DECISIONS.md` 009. | `tsx --test src/tests/ana-intent-router.test.ts` plus prior ANA tests: 47/47 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-9.1–ANA-9.8 | Parallel `executePlan`: bounded worker pool with `Promise.allSettled`, per-manifest timeouts, one retry on throw/timeout, cost budget, `AbortSignal` cancellation, and traces without input values. One specialist failure cannot break ANA. Recorded as `docs/DECISIONS.md` 010. | `tsx --test src/tests/ana-execution.test.ts` plus prior ANA tests: 57/57 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-10.1–ANA-10.6 | Added a DAG planner at `site/src/ana/core/dag.ts`. Career waits for education; business waits for career plus ASTRAEA/Pináculo. Independent waves overlap; cycles fail without execution. Recorded as `docs/DECISIONS.md` 011. | `tsx --test src/tests/ana-dag.test.ts` plus prior ANA tests: 62/62 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-11.1–ANA-11.4 | Rewrote `synthesizer.ts` to compare specialist results into structured sections. Symbolic astrology/numerology stays out of high-confidence facts. Conflicting career fixtures are reported without picking a winner. Recorded as `docs/DECISIONS.md` 012. | `tsx --test src/tests/ana-synthesis.test.ts` plus prior ANA tests: 64/64 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-12.1–ANA-12.3 | Added claim provenance (`statement`, producer, repository, capability, timestamp, SHA-256 input fingerprint, confidence). Sources are listed without raw private inputs. Recorded as `docs/DECISIONS.md` 013. | `tsx --test src/tests/ana-provenance.test.ts` plus prior ANA tests: 67/67 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-13.1–ANA-13.7 | Added in-process ANA memory (`session` / `user` / `project`). User save requires explicit consent. Sensitive categories are AES-256-GCM. Private profile cannot write the CC AI ledger or public `brain/`. Recorded as `docs/DECISIONS.md` 014. | `tsx --test src/tests/ana-memory.test.ts` plus prior ANA tests: 76/76 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-14.1–ANA-14.5 | Added `contextFilter` so each specialist receives only allowlisted fields. Personal profile sharing needs consent. Logs/analytics omit secrets and birth/profile data. Recorded as `docs/DECISIONS.md` 015. | `tsx --test src/tests/ana-privacy.test.ts` plus prior ANA tests: 81/81 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-15.1–ANA-15.6 | Added sandbox manager (`runRepository` denied in-process). Jobs carry CPU/memory/timeout limits. HTTP engines reject file/metadata URLs. Sandbox env drops API keys. Output is validated before ANA consumes it. Recorded as `docs/DECISIONS.md` 016. | `tsx --test src/tests/ana-sandbox.test.ts` plus prior ANA tests: 90/90 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-16.1–ANA-16.5 | Inserted a security gate between plan and execute. Visitor grant is read+compute. Write and external-action are denied without an explicit grant and confirmation. Recorded as `docs/DECISIONS.md` 017. | `tsx --test src/tests/ana-security.test.ts` plus prior ANA tests: 95/95 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-17.1–ANA-17.3 | Host adapters for classified wave 2: mentora, smartapply, thesis-writer (injected engines), stillas tool catalog, one electronics-agent with five tools. Paper2Video/knowledge/private stay inactive. Remotes were not modified. Recorded as `docs/DECISIONS.md` 018. | `tsx --test src/tests/ana-*.test.ts`: 101/101 pass. `pnpm typecheck` and `pnpm lint` exit 0. Runtime registry still empty. |
| 2026-08-13 | ANA-18.1–ANA-18.3 | Domain planning layer (`creative`, `engineering`, `personal-insight`, `education-agent`, `career-agent`). Default selection expands to registered specialists only. Provenance keeps the specialist as producer (`via` the domain). Recorded as `docs/DECISIONS.md` 019. | `tsx --test src/tests/ana-*.test.ts`: 106/106 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-19.1–ANA-19.4 | Semantic capability discovery (`site/src/ana/discovery/`): hashed TF embeddings plus keyword fallback. STM32 EXTI queries rank electronics; private/disabled/Paper2Video stay out of the index. Recorded as `docs/DECISIONS.md` 020. | `tsx --test src/tests/ana-*.test.ts`: 112/112 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-20.1–ANA-20.4 | Internal `/ana/debug` dashboard gated by `ANA_DEBUG_ENABLED`. Snapshots include request/trace IDs, plan, active agents, latency, unreported tokens, cost units, and result. Sensitive inputs are omitted. Recorded as `docs/DECISIONS.md` 021. | `tsx --test src/tests/ana-*.test.ts`: 119/119 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-21.1–ANA-21.5 | Wired ANA into the existing CACM AI shell. Typed questions stay on CC AI. Exploration chips stay hidden while specialists are disabled. Observatory mapping is status, not chatbots. `POST /api/ana` is gated and omits provided inputs. Recorded as `docs/DECISIONS.md` 022. | `tsx --test src/tests/ana-*.test.ts`: 125/125 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-22.1–ANA-22.3 | Streamed ANA plan/execution status over SSE on existing `POST /api/ana`. JSON remains the default. Live region announces phases, not answer tokens. Recorded as `docs/DECISIONS.md` 023. | `tsx --test src/tests/ana-*.test.ts`: 131/131 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-23.1–ANA-23.4 | ANA-mediated specialist follow-ups via `requestSpecialist` and AsyncLocalStorage. No input blobs. Limits: depth 3, 8 agents, 30s, existing cost budget. Recursion blocked. Traces add `delegate` / `delegate-denied`. Recorded as `docs/DECISIONS.md` 024. | `tsx --test src/tests/ana-*.test.ts`: 139/139 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-24.1–ANA-24.4 | Verification layer before synthesis: envelope/output schema, consistency, six finding codes, optional `ana-verifier` off by default with no private inputs. Recorded as `docs/DECISIONS.md` 025. | `tsx --test src/tests/ana-*.test.ts`: 152/152 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-25.1–ANA-25.3 | Ask My Portfolio navigates public repository audits (`ask-portfolio`). Embedded and AI/creativity examples cite GitHub sources. Private, disabled, fork, and Paper2Video repos are omitted. CV/case-study questions still defer to CC AI. Recorded as `docs/DECISIONS.md` 026. | `tsx --test src/tests/ana-*.test.ts`: 157/157 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-26.1–ANA-26.3 | Optional `combined-analysis` across ASTRAEA, Pináculo, Mentora, SmartApply, and business. Four labeled sections; natal stays out of FACTUAL ANALYSIS. Combined runs require explicit consent; allowlists still apply. Market research is listed when unregistered. Recorded as `docs/DECISIONS.md` 027. | `tsx --test src/tests/ana-*.test.ts`: 162/162 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-27.1–ANA-27.4 | Owned-repo scanner diffs GitHub listings against known audits and proposes `agent.json` drafts. Approve/Edit/Ignore never set `enabled: true`. Unreviewed code cannot enter the runtime registry. ASTROEA, pinaculo, and StrudelAI remotes were not modified. Recorded as `docs/DECISIONS.md` 028. | `tsx --test src/tests/ana-*.test.ts`: 167/167 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-28.1–ANA-28.3 | In-repo Repo2Agent CLI (`init`, `validate`, `test`, `register`). Scaffold matches the spec tree. Register does not enable specialists. `publish` is denied and `site/package.json` stays private. Protected remotes are refused. Recorded as `docs/DECISIONS.md` 029. | `tsx --test src/tests/ana-*.test.ts`: 172/172 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-29.1–ANA-29.3 | Confirmed the User → ANA → planner → registry → capability selection → sandbox → traces → verification → synthesis path against `runAna`. Protocol execute/verify/synthesize stay repository-agnostic; named catalog routing remains a gap. Recorded remaining gaps as `docs/DECISIONS.md` 030. | `tsx --test src/tests/ana-*.test.ts`: 176/176 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
| 2026-08-13 | ANA-30.1–ANA-30.17 | Verified the Repo2Agent Definition of Done in-process: natural-language receive, plan, registry search, specialist selection, missing inputs, concurrency, input allowlists, tool execution, sandbox isolation, shared output schema, failure isolation, contradictions, synthesis, provenance, one answer, active-system UI, and new-repo scan/register without editing ANA Core. Recorded as `docs/DECISIONS.md` 031. Public ANA stays gated. | `tsx --test src/tests/ana-*.test.ts`: 193/193 pass. `pnpm typecheck` and `pnpm lint` exit 0. |
