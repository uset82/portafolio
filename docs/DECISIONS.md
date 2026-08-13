# Architecture decisions

Living log for portfolio architecture decisions. Numbered records in `docs/decisions/` remain
valid. This file records decisions that span ANA / Repo2Agent and any later conflict with older
plans.

| ID | Date | Decision | Status |
| --- | --- | --- | --- |
| 001 | 2026-07-19 | Next.js App Router portfolio foundation | Accepted — `docs/decisions/001-portfolio-foundation.md` |
| 002 | 2026-08-12 | ANA / Repo2Agent multi-agent architecture | Accepted for Phase 0–1 |
| 003 | 2026-08-12 | Phase 2 repository runtime classification | Accepted |
| 004 | 2026-08-12 | Universal RepoAgent protocol | Accepted |
| 005 | 2026-08-13 | `repo2agent/v1` agent.json standard | Accepted |
| 006 | 2026-08-13 | Central Agent Registry | Accepted |
| 007 | 2026-08-13 | First three specialist adapters | Accepted |
| 018 | 2026-08-13 | Second-wave host adapters and electronics cluster | Accepted |
| 019 | 2026-08-13 | Domain agents as default selection | Accepted |
| 020 | 2026-08-13 | Semantic capability discovery | Accepted |
| 021 | 2026-08-13 | Internal ANA debug dashboard | Accepted |
| 022 | 2026-08-13 | Portfolio ANA UI behind CC AI | Accepted |
| 023 | 2026-08-13 | ANA status streaming over SSE | Accepted |
| 024 | 2026-08-13 | ANA-mediated specialist-to-specialist calls | Accepted |
| 025 | 2026-08-13 | ANA verification layer before synthesis | Accepted |
| 026 | 2026-08-13 | Ask My Portfolio public-repository navigation | Accepted |
| 027 | 2026-08-13 | Optional combined multi-domain analysis | Accepted |
| 028 | 2026-08-13 | Automatic repository discovery without auto-activation | Accepted |
| 029 | 2026-08-13 | In-repo Repo2Agent CLI without npm publish | Accepted |
| 030 | 2026-08-13 | Confirmed ANA runtime path and remaining gaps | Accepted |
| 031 | 2026-08-13 | ANA Definition of Done verified in-process | Accepted |

---

## 002 — ANA / Repo2Agent multi-agent architecture

Date: 2026-08-12  
Status: Accepted for documentation and Phase 1 audit implementation  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md`

### Context

The portfolio already has a visitor-facing assistant (CC AI), a public `brain/` knowledge tree,
and `brain:sync-github` for authored GitHub snapshots. The new spec asks to turn useful
repositories into capabilities while keeping one user-facing agent.

`updates/TASKBOARD.md` task `B.7` previously said every repo needs its own skill and agent.
That guidance is about **how CC AI should talk about a project** (`SKILL.md` / `ANSWERS.md`).
It does not mean every repository should become a runtime LLM agent.

`mainidea.md` and `taskplan.md` did not exist. They are created at the repository root because
the spec names those files. `maintaskplan.md` remains the v1 launch ledger.

### Decisions

1. **Product / user-facing agent name:** ANA.
2. **Architecture / module name:** Repo2Agent.
3. **ANA is the sole user-facing orchestrator.** Visitors do not chat with ASTROEA, pinaculo, or
   other specialists directly.
4. **A repository is not automatically an AI agent.** Runtime types are `agent`, `tool`,
   `knowledge`, and `disabled`.
5. **Every repository must be audited before it can participate.** Inference is separate from
   approval. Generated records always have `enabled: false`.
6. **Public and private repositories are treated differently.** The committed
   `brain/repositories/registry.generated.json` contains public repositories only. Private
   metadata, if discovered while authenticated, is written to gitignored
   `registry.private.generated.json` and never includes file contents or README text.
7. **Unknown repository code never executes during discovery.** Phase 1 is read-only: GitHub
   metadata, tree paths, README, and selected manifests (`package.json`, `requirements.txt`,
   `pyproject.toml`, Docker files, and similar). No `.env`, keys, or source execution.
8. **Specialists start as read + compute.** Write, network, external-action, and high-risk
   permissions require a later security gate.
9. **CC AI stays the current public assistant** until Phase 21. Repo2Agent does not replace the
   existing `/api/cc-ai` route, knowledge ledger, or chat UI in Phase 0–1.
10. **Do not rebuild the portfolio.** Reuse `brain/`, `scripts/brain-sync-github.ts` (GitHub
    client and redaction), Zod, and `site/src` conventions.
11. **Path adaptation:** the Next.js app lives in `site/`, so ANA modules live in
    `site/src/ana/repositories/` rather than a top-level `src/ana/`. The CLI lives in `scripts/`
    beside `brain-sync-github.ts`. Registry JSON lives in `brain/repositories/` so it stays out
    of the Docker production image.
12. **Language detection:** Phase 1 uses the GitHub repository `language` field from the list
    payload. It does not call the per-repo languages API. That keeps discovery cheaper; a later
    phase may enrich it.
13. **README storage:** the audit stores a redacted excerpt (max 800 characters), not the full
    README. Full snapshots already exist in `brain/github/*/README.snapshot.md`.
14. **Checkbox convention:** `taskplan.md` uses the repository dual marker `[ ] ☐` / `[x] ☑`
    from `AGENTS.md` / `maintaskplan.md`.
15. **First specialist candidates** (ASTROEA, pinaculo, StrudelAI) are audited only in Phase 1.
    Those repositories are not modified.
16. **Books / extra folders in astrology and numerology repos** are out of Phase 0–1. Raw books
    belong in `brain-private` per `updates/01-brain-spec.md` and remain blocked on `Q.10`. Do
    not add book folders to `uset82/ASTROEA` or `uset82/pinaculo` from this portfolio task.
17. **Host portfolio:** `uset82/portafolio` is classified as `knowledge`, not as a specialist
    agent. ANA will live here; the repo is the orchestrator host, not a domain specialist.

### Consequences

- Phase 2+ must not start until Phase 0 and Phase 1 checkboxes in `taskplan.md` are verified.
- `B.7` skills remain valid as knowledge-framing for CC AI. Repo2Agent runtime classification
  is a separate layer.
- A later public capability snapshot for ANA, if needed in the production image, must go through
  a reviewed build bridge similar to `brain:build`. Do not import `brain/` from the Next.js
  client.

---

## 003 — Phase 2 repository runtime classification

Date: 2026-08-12  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 2; inventory: `updates/02-github-inventory.md`

### Decisions

1. **Approved type lives in `registry.overrides.json`.** Generated inference remains in
   `registry.generated.json`. Overrides always win. The policy that produces those overrides is
   `site/src/ana/repositories/classification-policy.ts`.
2. **`enabled` stays false for every public repository.** Classification is not activation.
   Specialists are not callable until Phase 6+.
3. **Six specialist-agent candidates:** ASTROEA, pinaculo, StrudelAI (Phase 6 proof of concept),
   plus mentora, smartapply-app, and Thesis-Writer-Kit (named later specialists). Mentora stays
   `status: fork` with the Q.9 primary-developer framing.
4. **Eight tools:** qr-code-generator, StillasCalculator, TRAFFICLIGHT, MicrocontrollerPiano,
   piano-, REACTIONGAME, Automatic-Watering-Elephant, SmartHomeControl. Deterministic or firmware
   utilities. ANA does not need an extra LLM to call them later.
5. **Disabled:** empty/near-empty placeholders and unrelated upstream forks (FreeCAD, opencode,
   osiris, Paper2Video).
6. **Paper2Video conflict:** `smartchatbot.md` Phase 17 lists it in wave 2; the GitHub inventory
   records it as an untouched upstream fork. Phase 2 follows the inventory: `disabled`. Revisit
   only if contribution evidence is added.
7. **Tetris** is course work on a teacher example (CC-BY-4.0), not an unrelated vendor clone. It
   is `knowledge`, not `disabled`.
8. **`uset82/portafolio` domain is locked to `portfolio`.** The generated audit tagged every
   domain because this repo contains the whole brain. That would poison capability routing.
9. **Private repositories** remain out of the public registry and are not enabled. Phase 2 adds
   no execution path.

### Consequences

- Phase 3 (RepoAgent protocol) may start after Phase 2 checkboxes are verified.
- Do not add `agent.json` to ASTROEA, pinaculo, or StrudelAI until Phase 6.

---

## 004 — Universal RepoAgent protocol

Date: 2026-08-12  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 3

### Decisions

1. **In-repo module, not a new package.** The spec path `packages/agent-protocol/` is adapted to
   `site/src/ana/protocol/` for the same reason as decision 002: the app lives in `site/`. Do not
   publish an npm package until Phase 28.
2. **Shared interface.** Every specialist presents `RepoAgent`: `manifest()`, `health()`, and
   `execute(request)`. ANA must not need repository-specific call shapes.
3. **`AgentRequest` (not fully specified in the master spec):** `requestId`, kebab-case
   `capability`, and `input` as a record of declared camelCase fields. Unknown keys are rejected.
   Required fields must be present. Declared value types (`string` | `number` | `boolean` |
   `object` | `array`) are checked at the protocol boundary.
4. **`AgentHealth` (not fully specified in the master spec):** `agentId`, status
   `healthy` | `degraded` | `unavailable`, ISO-8601 UTC `checkedAt`, optional `message`.
5. **`AgentResponse`** follows the spec: `agentId`, `status` (`success` | `partial` | `failed`),
   `result`, `summary`, optional `evidence` / `assumptions` / `warnings` / `confidence`, and
   `runtimeMs`. `invokeRepoAgent` also rejects a response whose `agentId` does not match the
   manifest.
6. **Capabilities stay kebab-case** (`natal-chart`), matching Phase 1/2 registry tokens, not the
   spec example `natal_chart`.
7. **Permissions** match Phase 16: `read` | `compute` | `network` | `write` |
   `external-action` | `high-risk`. Default specialist intent remains read + compute.
8. **Domains** reuse `repositoryDomainSchema` from the Phase 1 audit module so routing vocabulary
   stays one list.
9. **Phase 3 is contract only.** Validation uses Zod. Tests use an in-memory fixture agent. No
   `agent.json` on ASTROEA, pinaculo, or StrudelAI. No real specialist `execute`. No ANA core,
   registry lookup, or UI.

### Consequences

- Phase 4 may start after Phase 3 checkboxes are verified. It designs `repo2agent/v1` and a
  loader **in this repository only**.
- Do not add `agent.json` to ASTROEA, pinaculo, or StrudelAI until Phase 6.

---

## 005 — `repo2agent/v1` agent.json standard

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 4

### Decisions

1. **On-disk format lives in this repo's loader, not yet in specialist GitHub repos.** Module:
   `site/src/ana/manifest/`. Phase 6 is when ASTROEA, pinaculo, and StrudelAI receive `agent.json`.
2. **Schema id:** `schema: "repo2agent/v1"`. The loader dispatches on that field. Unknown versions
   fail as `unsupported_schema` so a later `repo2agent/v2` can be added without changing ANA core
   capability lists.
3. **`agent.json` is AgentManifest plus envelope fields.** Envelope: `schema`, `type`
   (`agent` | `tool`). Body: the Phase 3 manifest (id, name, repository, version, description,
   domains, capabilities, inputs, outputs, permissions, sensitivity, execution, timeoutMs).
   `toAgentManifest` strips the envelope for `RepoAgent.manifest()`.
4. **Do not accept the thin spec example as-is.** The master spec uses snake_case capabilities
   (`natal_chart`), snake_case `requiredInputs`, and omits permissions, execution, and timeout.
   Those copies are invalid under v1. Capabilities stay kebab-case; inputs stay camelCase
   `InputDefinition` objects so sensitivity cannot be dropped.
5. **`type` is only `agent` or `tool`.** Knowledge and disabled repositories do not get
   `agent.json`.
6. **Adding a capability is data, not an ANA core change.** v1 treats `capabilities` as an open
   kebab-case list. New specialist skills do not require a protocol or loader change.
7. **Loader is read-only.** `loadAgentJsonFile` / `parseAgentJsonText` never write files and never
   execute repository code.

### Consequences

- Phase 5 may start after Phase 4 checkboxes are verified. It builds the central registry on
  this loader and still must not enable specialists.
- Do not add `agent.json` to ASTROEA, pinaculo, or StrudelAI until Phase 6.

---

## 006 — Central Agent Registry

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 5

### Decisions

1. **Runtime registry is a new module**, `site/src/ana/registry/`. It does not replace
   `site/src/ana/repositories/registry.ts`, which remains the audit JSON loader.
2. **Admission gate.** A manifest enters runtime lookup only when the matching audit is public,
   `enabled: true`, and `recommendedType` is `agent` or `tool` and matches `agent.json` `type`.
   Knowledge, disabled, unknown, and type-mismatched documents are skipped. Private repositories
   never enter lookup; `enabled: true` on a private audit throws `private_enabled`.
3. **Lookup is exact.** `findByCapability` and `findByDomain` match kebab-case capability tokens
   and the Phase 1 domain enum. Semantic matching is Phase 19.
4. **Recorded runtime fields:** health, version, availability (`available` if health is healthy or
   degraded), permissions, `latencyEstimateMs` (the manifest `timeoutMs` budget, not a measured
   sample), `costEstimate` (default `unknown` until billing data exists), and `privacyLevel`
   (manifest sensitivity).
5. **No adapter means unavailable.** Until Phase 6 registers a `RepoAgent`, the default health
   probe reports `unavailable` / "No runtime adapter registered".
6. **Production catalog is empty.** Committed audits all have `enabled: false` and this repository
   has no `agent.json` files. Injecting ASTROEA / pinaculo / StrudelAI documents against those
   audits still skips them as `not-enabled`.

### Consequences

- Phase 6 may start after Phase 5 checkboxes are verified. That is the first time specialist
  GitHub repos may receive `agent.json`, and only for ASTROEA, pinaculo, and StrudelAI.
- Do not enable specialists or replace CC AI in this phase.

---

## 007 — First three specialist adapters

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 6

### Decisions

1. **Host adapters, not a rewrite of the three GitHub remotes.** Callable cores live in
   `site/src/ana/specialists/`. `uset82/ASTROEA`, `uset82/pinaculo`, and `uset82/StrudelAI` were
   not modified from this workspace (they are not this git tree; no push).
2. **`agent.json` host copies** live in `brain/repositories/manifests/{astraea,pinaculo,strudel}/`.
   That is the Phase 5 discovery path. Remote copies in the specialist repos remain a later
   working-tree update.
3. **Do not invent domain engines.** Pináculo runs the extracted `PinaculoCalculator.calculateComplete`
   locally. ASTRAEA and StrudelAI call injected engines; production uses `ASTRAEA_API_URL` /
   `STRUDEL_API_URL` HTTP. Missing engines return `failed` / `unavailable`, not fake charts or
   music.
4. **`/api/agent` is a specialist adapter, not a chatbot.** It is gated by
   `ANA_SPECIALISTS_ENABLED` (default false) and does not replace `/api/cc-ai`.
5. **`enabled` stays false** in the audit overrides. Independent verification uses `invokeRepoAgent`
   and the gated adapter. ANA Core (Phase 7) is what connects them for visitors.
6. **Sensitivity is honest.** Astrology and numerology responses always include a warning that
   results are personal/cultural, not scientific, medical, or legal advice. Interpretation is not
   generated in this host.

### Consequences

- Phase 7 may start after Phase 6 checkboxes are verified. Do not convert other repositories.
- Do not set `ANA_SPECIALISTS_ENABLED=true` in production until ANA Core and privacy gates exist.

---

## 008 — ANA Core is a deterministic orchestrator

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 7

### Decisions

1. **ANA Core is not an LLM.** `site/src/ana/core/` runs a deterministic loop: understand →
   plan → select → validate inputs → execute → compare → synthesize → answer. Intent matching
   is keyword-based in `planner.ts`. Phase 8 upgrades routing; this phase does not call
   OpenRouter or replace `/api/cc-ai`.
2. **Injected `RepoAgent` instances, not audit admission.** `runAna(request, { agents })` talks
   to the agents it is given. Tests use fake specialists. Production audit `enabled` stays
   false, so the Phase 5 catalog remains empty. Core does not flip `ANA_SPECIALISTS_ENABLED`.
3. **No visitor chat route.** There is no public ANA API or UI in this phase. CC AI remains
   the visitor-facing assistant.
4. **Do not answer specialist domains without delegation.** If a capable agent exists, ANA
   cites its summary and provenance. If it exists but was not invoked, ANA refuses rather than
   inventing domain output (no invented “Sun in Leo”). If none is registered, ANA will not
   invent the answer.
5. **Portfolio facts stay with CC AI.** Questions about work, CV, case studies, and employers
   return `ANA_PORTFOLIO_BOUNDARY`. ANA does not impersonate CC AI or invent biography.

### Consequences

- Phase 8 may start after Phase 7 checkboxes are verified. The Anna / Oslo multi-domain
  example is a fixture, not live personal data.
- Do not enable specialists in `registry.overrides.json`. Do not convert more repositories.
- Do not replace CC AI until Phase 21.

---

## 009 — Deterministic intent router and internal DAG

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 8

### Decisions

1. **Still not an LLM.** Goal and domain detection stay keyword/pattern based in
   `site/src/ana/core/intent.ts`. Spec snake_case tokens (`personality_analysis`) become
   kebab-case goals (`personality-analysis`).
2. **Select the minimum registered agents.** Routes name preferred ids (`astraea`, `pinaculo`,
   `strudel`, `mentora`, `business`). Lookup is by id, not “any agent in the domain”. Missing
   specialists are listed on `unavailableAgents` and are not invented. Irrelevant tools stay
   inactive.
3. **Ask only for selected-agent inputs.** Missing fields come from registered step manifests.
   A music-company clause can supply `prompt`; a place name is stored as `birthPlace` and is
   never geocoded into coordinates.
4. **The Anna / Oslo example is a fixture.** Tests use that message, not live personal data.
   `mentora` and `business` remain unregistered.
5. **The DAG is declared, not executed in parallel.** Independent steps get `dependsOn: []` and
   `execution: "parallel"`. Sequential `executePlan` is unchanged. `Promise.allSettled` is
   Phase 9. Real dependency edges are Phase 10.
6. **No visitor route.** `/api/cc-ai` stays. `ANA_SPECIALISTS_ENABLED` stays false. Audit
   `enabled` stays false.

### Consequences

- Phase 9 may start after Phase 8 checkboxes are verified.
- Do not convert mentora or a business agent in this phase.
- Do not replace CC AI until Phase 21.

---

## 010 — Parallel execution with isolation

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 9

### Decisions

1. **Independent steps overlap.** `executePlan` runs steps with empty `dependsOn` in a worker
   pool using `Promise.allSettled`. Responses stay in plan order. Defaults: concurrency 3,
   cost 8 (one unit per attempt), one retry on throw or timeout.
2. **One specialist cannot break ANA.** Timeouts, throws, cancellation, and cost skips become
   `status: "failed"` responses. The pool continues.
3. **Timeout is the manifest `timeoutMs`.** The orchestrator races `invokeRepoAgent`; it does
   not add `AbortSignal` to `RepoAgent.execute` in this phase.
4. **Traces never include inputs.** Events record agent id, capability, attempt, runtime, and
   outcome only. Birth data, names, and places stay out.
5. **Dependent edges stay sequential.** If any step has `dependsOn`, the executor falls back
   to one-at-a-time order. Wave scheduling is Phase 10.
6. **No visitor route.** `/api/cc-ai` stays. `ANA_SPECIALISTS_ENABLED` stays false. Audit
   `enabled` stays false.

### Consequences

- Phase 10 may start after Phase 9 checkboxes are verified.
- Do not enable specialists or replace CC AI in this phase.

---

## 011 — Dependency DAG with wave execution

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 10

### Decisions

1. **Planner lives in `site/src/ana/core/dag.ts`.** `applyAgentDependencies` adds edges only for
   agents present in the current step list. Missing predecessors (including unregistered
   `mentora` / `business`) are dropped, not invented.
2. **Policy matches the spec graph.** `career` waits for `education` or `mentora`. `business`
   waits for `career`, `astraea`, and `pinaculo`. ASTRAEA, Pináculo, and education stay
   independent of each other.
3. **Cycles do not run.** Kahn waves leave cyclic nodes out. Those steps return
   `Circular dependency.` and never call `execute`.
4. **Waves replace the all-sequential fallback.** Each wave uses the Phase 9 pool. Mixed graphs
   set `execution: "mixed"` and record `waves` / `cycles` on the DAG.
5. **Education and career agents are still fixtures.** This phase does not convert mentora,
   smartapply, or a business repo. No visitor ANA route.

### Consequences

- Phase 11 may start after Phase 10 checkboxes are verified.
- Do not enable specialists or replace CC AI in this phase.

---

## 012 — Structured synthesis, not concatenation

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 11

### Decisions

1. **ANA compares results.** `buildAnaSynthesis` groups successful specialist output into
   symbolic, practical, and creative kinds. The answer is sectioned, not `resultA + resultB`.
2. **Required sections:** agreements, contradictions, high-confidence facts, assumptions,
   symbolic interpretation, practical evidence, recommendations, action plan. Creative
   opportunities are an extra section when music/design specialists ran.
3. **Symbolic is never a fact.** Astrology and numerology summaries stay in SYMBOLIC
   INTERPRETATION even when they carry high `confidence`. HIGH-CONFIDENCE FACTS only accept
   practical results with confidence ≥ 0.7.
4. **Conflicts stay unresolved.** ANA lists disagreeing specialists and does not pick a winner
   or invent a blended claim. Provenance fields beyond agent/repository/capability remain
   Phase 12.
5. **No visitor route.** `/api/cc-ai` stays. Specialists stay disabled.

### Consequences

- Phase 12 may start after Phase 11 checkboxes are verified.
- Do not enable specialists or replace CC AI in this phase.

---

## 013 — Claim provenance without private inputs

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 12

### Decisions

1. **Every specialist claim carries provenance.** `AnaProvenance` records statement, agent id
   (producer), repository, capability, `producedAt`, `inputFingerprint`, and optional confidence.
2. **Fingerprints are not the input.** `fingerprintInput` SHA-256-hashes each field value, then
   hashes that map. Raw birth dates, names, and places never appear in provenance or the
   Sources section.
3. **Sources are public.** The answer lists agent, repository, capability, timestamp, confidence,
   and a fingerprint prefix. Timestamp comes from execution traces when present.
4. **No visitor memory yet.** Session/user memory is Phase 13. No visitor ANA route. Specialists
   stay disabled.

### Consequences

- Phase 13 may start after Phase 12 checkboxes are verified.
- Do not enable specialists or replace CC AI in this phase.

---

## 014 — Separate memory scopes with consent and encryption

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 13

### Decisions

1. **Three scopes never mix blindly.** Session is the current conversation. User memory is a
   saved profile. Project memory is public repository knowledge. `runAna` may reuse session
   fields automatically; user memory is applied only when `applyUserMemory: true`.
2. **User memory requires consent.** `saveUserMemory` rejects `consent: false` or a missing
   save call. `runAna` never promotes session data into user memory.
3. **Delete is an API, not a visitor button.** `deleteMemory` removes a session, a user profile,
   one category, or a project record. There is no ANA chat UI in this phase.
4. **Categories and permissions are declared now.** Categories are `basic`, `education`,
   `skills`, `interests`, `goals`, `birthProfile`, and `preferences`. Per-agent allowlists live
   in `permissions.ts`. Field-level `contextFilter` wiring is Phase 14.
5. **Sensitive user categories are encrypted at rest** with AES-256-GCM bound to user id and
   category. Phase 13 is in-process; `ANA_MEMORY_KEY` is documented for later persistence.
6. **Private profile stays out of public artifacts.** Project memory rejects birth/name fields
   and CC AI ledger paths. Saving user memory does not mutate `cc-ai-public-knowledge.json` or
   public `brain/`.
7. **`brain-private` is not wired.** If a later adapter persists files, the path must pass
   `assertMemoryPathIsolated`. Client modules cannot import `@/ana/memory`. Extra astrology or
   numerology book folders remain blocked on `Q.10`.

### Consequences

- Phase 14 may start after Phase 13 checkboxes are verified.
- Do not enable specialists or replace CC AI in this phase.

---

## 015 — Privacy-aware specialist context

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 14

### Decisions

1. **`contextFilter(agentId, userContext)` is the field gate.** ASTRAEA receives birth date/time/place
   (and related chart coordinates). Pináculo receives name and birth date. Strudel receives music
   preferences. Career receives education, skills, and experience. Unknown agents receive no
   personal profile fields.
2. **Consent is required to share personal fields.** `executePlan` sends them only when
   `sharePersonalProfile` is true. `runAna` sets that flag because the user submitted the
   specialist request. Saved user memory still needs `applyUserMemory`.
3. **Secrets never go to specialists.** Fields matching password/secret/api-key/credential names
   are dropped before invoke.
4. **Logs and analytics stay metadata-only.** `maskSensitiveFields` redacts profile and secret
   keys. `toAnalyticsEvent` copies only `requestId`, `agentId`, `event`, `at`, `capability`,
   `status`, and `runtimeMs`. Traces still omit input values.
5. **No visitor route.** `/api/cc-ai` stays. Specialists stay disabled.

### Consequences

- Phase 15 may start after Phase 14 checkboxes are verified.
- Do not enable specialists or replace CC AI in this phase.

---

## 016 — Sandbox manager for specialist execution

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 15

### Decisions

1. **No arbitrary repository code in the portfolio process.** `runRepository` is denied. Docker
   and other providers are not wired. Injected host adapters may run; Pináculo's extracted
   calculator is a reviewed host function, not a live clone of `uset82/pinaculo`.
2. **Every sandbox job carries limits.** Defaults: 15s timeout, 128MB memory, 8s CPU budget,
   256KB max output. `executePlan` caps specialist timeout at the sandbox limit.
3. **Network is restricted.** `file:`, cloud-metadata, and private hosts are denied unless an
   env-configured specialist URL explicitly allows private hosts. Metadata IPs stay denied.
4. **Filesystem and secrets stay out.** Inputs that reference `.env` or `brain-private` are
   denied. Sandbox env copies only `NODE_ENV` and never API keys.
5. **ANA consumes only validated output.** Results must be JSON-serializable, under the size
   cap, and free of `__proto__` / `constructor` keys and leaked secrets.
6. **No visitor route.** `/api/cc-ai` stays. Specialists stay disabled.

### Consequences

- Phase 16 may start after Phase 15 checkboxes are verified.
- Do not enable specialists or replace CC AI in this phase.

---

## 017 — Security gate before specialist execution

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 16

### Decisions

1. **The gate sits between planner and execution.** `executePlan` evaluates `evaluateSecurityGate`
   before sandbox invoke. Denied agents return a failed response and do not run.
2. **Six checks.** The gate records whether the agent may run, access requested information, write,
   call external APIs, expose secrets, or require confirmation.
3. **Permission levels stay the protocol enum.** `read`, `compute`, `network`, `write`,
   `external-action`, `high-risk`.
4. **Visitor default is read + compute.** Pináculo already matches. ASTRAEA and Strudel still
   declare `network` and remain disabled; enabling them for visitors needs an explicit network
   grant later.
5. **Write and external-action need grant plus confirmation.** Tests prove they do not execute
   without that grant.
6. **No visitor route.** `/api/cc-ai` stays. Specialists stay disabled.

### Consequences

- Phase 17 may start after Phase 16 checkboxes are verified.
- Do not enable specialists or replace CC AI in this phase.

---

## 018 — Second-wave host adapters and one electronics cluster

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 17

### Decisions

1. **Integrate wave 2 as classified, not as a second conversion of GitHub remotes.** Host
   adapters live in `site/src/ana/specialists/`. Host `agent.json` copies live in
   `brain/repositories/manifests/`. `uset82/mentora`, `smartapply-app`, `Thesis-Writer-Kit`,
   and the electronics/tool remotes were not modified.
2. **Named wave-2 mapping.** Mentora, SmartApply, and Thesis Writer Kit are host **agents**
   (injected engines; default unavailable). StillasCalculator is a host **tool** catalog card.
   SmartHomeControl is a tool of the electronics cluster, not its own LLM agent. avatar-studio,
   3Doodle, and iFoundYou stay **knowledge** with no manifests. Paper2Video stays **disabled**.
3. **One Electronics specialist, five tools.** `electronics-agent` (type `tool`, home repo
   `uset82/TRAFFICLIGHT`) exposes `traffic-light`, `fpga-uart`, `microcontroller`, `smart-home`,
   and `watering-system`. FPGA/UART remains knowledge. Related piano/assignment/reaction-game
   repos are listed on cards, not turned into extra agents.
4. **Do not invent domain output or execute remote code.** LLM-shaped specialists fail until an
   engine is injected. Tool cards return README/audit facts only. Stillas does not compute loads.
5. **Nothing is activated.** Audit `enabled` stays false. Knowledge/disabled/private repositories
   are not admitted. `/api/agent` stays gated by `ANA_SPECIALISTS_ENABLED`. CC AI stays.

### Consequences

- Phase 18 may start after Phase 17 checkboxes are verified. Domain agents (Creative, Engineering,
  Personal Insight, Education, Career) are next; they must not hide specialist provenance.
- Do not enable specialists or replace CC AI in this phase.

---

## 019 — Domain agents as default selection

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 18

### Decisions

1. **Five domain agents are a planning layer**, not GitHub remotes and not extra `agent.json`
   files. Catalog: `site/src/ana/domains/`. Ids: `creative`, `engineering`, `personal-insight`,
   `education-agent`, `career-agent`.
2. **ANA's default selection is the domain catalog.** Goals map to domain agents; members expand
   to registered specialists. QR, Stillas, thesis-writer, and electronics stay out of natal or
   personality plans even when injected. Knowledge members (LyriGenie, avatar-studio, 3Doodle,
   HVL coursework) are listed and not executed. Paper2Video stays excluded (disabled). Energy
   has no classified public repository, so Engineering does not invent one.
3. **Execution is still the specialist.** `electronics-agent` remains the single Engineering
   executable. Career-analysis expands Mentora then SmartApply (DAG). Thesis Writer stays in
   Education but is not selected for career-analysis.
4. **Provenance keeps the specialist as producer.** Sources list `astraea` / repository /
   capability, with optional `via personal-insight`. Domain id does not replace the specialist.
5. **Nothing is activated.** `/api/cc-ai` stays. Specialists stay disabled.

### Consequences

- Phase 19 may start after Phase 18 checkboxes are verified (semantic discovery, with keyword
  fallback). Do not index private or disabled repositories.
- Do not enable specialists or replace CC AI in this phase.

---

## 020 — Semantic capability discovery

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 19

### Decisions

1. **Discovery is a local index, not a hosted embedding API.** Module: `site/src/ana/discovery/`.
   Default vectors are 256-dimension hashed term-frequency (FNV-1a) plus cosine similarity.
   No OpenAI, transformers, or other embedding-model package is added.
2. **Indexed text is descriptions, capabilities, README excerpts, API schemas, and tool
   descriptions.** Host catalog cards, host `agent.json`, and public audits can all contribute
   documents. Ranking is injected so tests can force keyword fallback via
   `createUnavailableEmbeddingEngine`.
3. **Keyword lookup is the fallback** when embeddings are unavailable or `useEmbeddings` is
   false. Intent still uses deterministic electronics terms (`stm32`, `exti`, `fpga`, `vhdl`,
   `uart`, and similar) for the new `capability-search` goal. “Software engineering” stays
   career-analysis, not electronics.
4. **Private, disabled, and Paper2Video repositories are not indexed.** Knowledge audits may
   appear as non-executable documents. Deterministic capability hints win over noisy ranking
   when both fire.
5. **Nothing is activated.** `/api/cc-ai` stays. Specialists stay disabled.

### Consequences

- Phase 20 may start after Phase 19 checkboxes are verified (internal `/ana/debug` dashboard).
- Do not enable specialists or replace CC AI in this phase.

---

## 021 — Internal ANA debug dashboard

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 20

### Decisions

1. **`/ana/debug` is internal.** It is not in public navigation, sends `noindex`, and 404s unless
   `ANA_DEBUG_ENABLED=true`. `/api/ana/debug` uses the same gate. Default is false. This is not
   a visitor chatbot and does not replace CC AI.
2. **Each run gets a `requestId` and a `traceId`.** `runAna` always assigns a trace id.
   Snapshots also record a redacted request preview, plan size, active agent ids, per-step
   latency, cost units, token totals, and result status/errors.
3. **Telemetry omits sensitive inputs.** Snapshots do not copy `plan.provided`, specialist
   `result` payloads, or the synthesized answer. Names, ISO/natural dates, times, and place
   clauses are stripped from the preview.
4. **Cost is executor units, not currency.** Token counts stay `reported: false` until an engine
   returns usage. Do not invent dollar costs or token numbers.
5. **Nothing is activated.** Specialists stay disabled. `/api/cc-ai` stays the public assistant.

### Consequences

- Phase 21 may start after Phase 20 checkboxes are verified (portfolio ANA UI, still behind
  CC AI until equivalent safety gates pass).
- Do not enable specialists, `ANA_DEBUG_ENABLED`, or replace CC AI in public deploys in this
  phase.

---

## 022 — Portfolio ANA UI behind CC AI

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 21

### Decisions

1. **CC AI remains the public portfolio guide.** Typed questions and the existing welcome
   prompts stay on `/api/cc-ai`. ANA exploration chips appear only when
   `ANA_SPECIALISTS_ENABLED=true` **and** every required specialist id is in the homepage
   `availableAgentIds` list. Production keeps that list empty, so chips stay hidden.
2. **`POST /api/ana` is not a second chatbot.** It calls `runAna` with host specialists, reuses
   the CC AI abuse guard, accepts `message` only (client `input` blobs are ignored), and
   returns `requestId`, `traceId`, `answer`, `status`, and `active`. It omits `plan.provided`
   and specialist payloads. The same `ANA_SPECIALISTS_ENABLED` gate as `/api/agent` applies.
3. **Observatory mapping is status, not chat.** ASTRAEA, PINÁCULO, Sound Lab, and Electronics
   show `active` / `standby` in the existing assistant shell. No chat buttons on 3D artifacts.
   No Three.js drive in this phase.
4. **No-JS and reduced motion stay complete.** Homepage `<noscript>` lists specialist status and
   states that CACM AI remains the public guide. Status dots do not pulse.
5. **Nothing is activated.** Specialists stay disabled. `/api/cc-ai` stays the public assistant.

### Consequences

- Phase 22 (streaming status) may start after Phase 21 checkboxes are verified.
- Do not enable specialists or replace CC AI in public deploys in this phase.

---

## 023 — ANA status streaming over SSE

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 22

### Decisions

1. **SSE on the existing `POST /api/ana` route.** When `Accept` includes `text/event-stream`,
   the handler streams status then a final `complete` event. JSON remains the default for
   clients that do not ask for SSE. No WebSocket, Socket.IO, or other realtime stack.
2. **Status is plan/execution, not answer tokens.** Events are `understanding`, `planning`,
   `running`, and `combining`. The synthesized answer arrives once in `complete`. Status
   events omit `plan.provided` and specialist payloads.
3. **Accessible announcements stay atomic.** The polite live region reads the latest phase
   sentence (`ANA is understanding your question.`, `ASTRAEA is calculating a natal chart.`,
   `ANA is combining the results.`). The transcript log stays `aria-live="off"`, so presenting
   the answer does not speak every token.
4. **CC AI stays non-streaming JSON.** Typed portfolio questions still use `/api/cc-ai`.
   Specialists stay disabled. `ANA_SPECIALISTS_ENABLED` remains false in public deploys.

### Consequences

- Phase 23 (controlled agent-to-agent calls) may start after Phase 22 checkboxes are verified.
- Do not add a WebSocket stack without a new decision record.

---

## 024 — ANA-mediated specialist-to-specialist calls

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 23

### Decisions

1. **Specialists cannot call each other directly.** The only supported follow-up path is
   `requestSpecialist({ agentId, capability, reason })` in `site/src/ana/core/delegation.ts`.
   The helper uses `AsyncLocalStorage`. Outside `executePlan` it returns a failed response with
   `ANA_DELEGATION_DENIED`. `/api/agent` and `invokeRepoAgent` stay one-shot and do not enter
   that store.
2. **No input blobs on follow-ups.** The request schema is strict: `{ agentId, capability, reason }`
   only (`reason` max 120 characters). ANA fills specialist input from `plan.provided` through
   `selectAgentInput` and the security gate, the same as planned steps.
3. **Hard limits, configurable on `AnaExecuteOptions` / `AnaRuntime`.** Defaults are
   `maxAgentDepth = 3`, `maxAgentsPerRequest = 8`, `maxRuntimeMs = 30_000`. Budget remains the
   existing `costLimit` (`ANA_DEFAULT_COST_LIMIT = 8`). Planned specialists run at depth 1;
   a follow-up is `depth + 1`. Depth 4, a 9th specialist, an agent already on the call stack,
   and wall-clock expiry are denied. Reuse of an already-ran step traces `delegate` with
   `reason: "already-ran"` and does not increment the count. Runtime uses `AbortController` plus
   `setTimeout` (not `AbortSignal.timeout`, which leaves a dangling timer).
4. **Every sub-call is visible in traces.** New events are `delegate` and `delegate-denied`.
   Optional fields `via`, `depth`, and `reason` (`reason` is a code: `recursion`, `max-depth`,
   `max-agents`, `max-runtime`, `unknown-agent`, `capability-mismatch`, `already-ran`, not the
   free-text specialist reason). Start events of delegated runs include `via` and `depth`.
   Traces still omit provided PII.
5. **Nothing is activated.** Host adapters were not changed to call `requestSpecialist`.
   Specialists stay disabled. CC AI stays the public visitor assistant.

### Consequences

- Phase 24 (verification layer) may start after Phase 23 checkboxes are verified.
- Do not enable specialists or replace CC AI in public deploys in this phase.
- Do not let specialists pass arbitrary input into follow-up requests.

---

## 025 — ANA verification layer before synthesis

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 24

### Decisions

1. **Every executed specialist result is verified before synthesis.** Pipeline: schema validator →
   consistency check → optional verification agent → ANA. `verifyResponses` records structured
   findings. Verification does not run when ANA skipped execution (missing inputs, deferral).
2. **Schema validator.** Re-parse the `AgentResponse` envelope. When a manifest is available,
   `resultMatchesManifestOutputs` accepts either named output fields on `result` or, for a single
   declared object/array/scalar output, the payload itself. Invalid output is a finding, not a
   thrown protocol error, so one bad specialist cannot break ANA.
3. **The six checks.** Findings use codes `unanswered-capability`, `invalid-output`,
   `execution-failure`, `undeclared-assumptions`, `contradiction`, and `low-confidence` (below 0.7,
   matching high-confidence facts). Partial results must declare assumptions. Error-only success
   payloads and claimed-capability mismatches count as unanswered. Same-capability summary
   disagreements remain contradictions; ANA still does not pick a winner.
4. **Optional verification agent.** Off by default. `runVerificationAgent` uses the built-in
   deterministic `ana-verifier`, or `verificationAgent` injects a `result-verification` specialist.
   It receives finding codes, agent ids, and capabilities — not `plan.provided`, summaries, or
   payloads. Failure of the optional agent is a warning; ANA continues. It is not a visitor
   specialist and is not in `createHostSpecialists()`.
5. **Nothing is activated.** CC AI stays the public visitor assistant. Specialists stay disabled.

### Consequences

- Phase 25 (Ask My Portfolio) may start after Phase 24 checkboxes are verified.
- Do not enable specialists or replace CC AI in public deploys in this phase.
- Do not send private inputs or specialist payloads to the optional verifier.

---

## 026 — Ask My Portfolio public-repository navigation

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 25

### Decisions

1. **Navigation is not biography.** Goal `ask-portfolio` answers “what has Carlos built…” from
   the public repository audit. CV, employer, résumé, and case-study questions still return
   `ANA_PORTFOLIO_BOUNDARY` and stay with CC AI's approved ledger.
2. **Search public audits only.** `searchPortfolioKnowledge` lists owned public repositories that
   are not `disabled`, `private`, `empty`, or `fork`. `uset82/Paper2Video` stays excluded. Hits
   cite `https://github.com/{owner/repo}`, domains, and runtime type. README marketing, size,
   stars, and contribution claims are omitted.
3. **Electronics is catalog, not execution.** Embedded-systems questions rank the electronics
   cluster. If `electronics-agent` is registered it is named as not executed. Specialists stay
   disabled. ANA does not invent metrics.
4. **CC AI stays public.** Typed visitor questions still use `/api/cc-ai`. `ANA_SPECIALISTS_ENABLED`
   remains false. Ask My Portfolio is available inside `runAna` when audits are provided.

### Consequences

- Phase 26 (advanced multi-domain analysis) may start after Phase 25 checkboxes are verified.
- Do not enable specialists or replace CC AI in public deploys in this phase.
- Do not treat a public GitHub listing as a held flagship case study.

---

## 027 — Optional combined multi-domain analysis

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 26

### Decisions

1. **Combined analysis is opt-in.** Goal `combined-analysis` runs only on explicit language
   (for example “combined analysis” across personality, education, career, and business). An
   explicit natal-chart request still selects only ASTRAEA. The Anna/Oslo multi-goal fixture is
   unchanged.
2. **Five specialists, no invented sixth.** The route expands Personal Insight (ASTRAEA +
   Pináculo), Education (Mentora), Career (SmartApply), and the business specialist. Market
   research is listed when unregistered and is not invented. Existing DAG policy still waits:
   career after education, business after career plus ASTRAEA/Pináculo.
3. **Four labeled sections.** Combined answers lead with FACTUAL ANALYSIS (practical
   high-confidence evidence only), SYMBOLIC INTERPRETATION (ASTRAEA/Pináculo, not facts),
   AI INFERENCE (ANA comparisons, labeled as inference), and ACTIONABLE RECOMMENDATION
   (suggestions, not facts). Existing Phase 11 section names remain for other specialist answers.
   Natal claims never become career, medical, or legal facts.
4. **Consent before sharing.** Combined analysis does not send personal fields until
   `sharePersonalProfile` is true on the request or runtime, or the message explicitly consents.
   Single-specialist requests still share allowlisted fields for that turn (decision 015).
   Allowlists from Phase 14 still apply. Traces and synthesized answers omit raw profile values.
5. **Nothing is activated.** Host adapters stay disabled. CC AI stays the public visitor
   assistant. No public combined-analysis chip.

### Consequences

- Phase 27 (automatic repository discovery) may start after Phase 26 checkboxes are verified.
- Do not enable specialists or replace CC AI in public deploys in this phase.
- Do not treat submitting a natal date as combined-analysis consent.

---

## 028 — Automatic repository discovery without auto-activation

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 27

### Decisions

1. **Scan is a diff, not a rewrite.** `scanOwnedRepositories` compares a GitHub listing against
   known audits. New public repositories are audited with the existing read-only inspector.
   Private repositories are counted without contents. Known remotes, including ASTROEA,
   pinaculo, and StrudelAI, are not treated as new and are not modified.
2. **Inference proposes, it does not register.** Agent/tool candidates get a `repo2agent/v1`
   draft (`permissions: read+compute`, `enabled: false`, version `0.0.0`). Knowledge, empty,
   duplicate, fork, private, and disabled repositories skip `agent.json`. Drafts are not written
   into `brain/repositories/manifests/` or GitHub remotes.
3. **Human review is Approve / Edit / Ignore.** Review never sets `enabled: true`.
   `activateDiscoveredCapability` always returns `activated: false`. The runtime registry still
   admits only public, enabled agent/tool manifests, so even an approved draft stays out.
4. **No visitor UI and no live GitHub write in this phase.** The discovery notice text exists for
   tests and later operator tooling. CC AI stays the public assistant. Specialists stay disabled.

### Consequences

- Phase 28 (Repo2Agent SDK) may start after Phase 27 checkboxes are verified.
- Do not enable specialists or replace CC AI in public deploys in this phase.
- Do not execute discovered repository source during scan.

---

## 029 — In-repo Repo2Agent CLI without npm publish

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 28

### Decisions

1. **Same commands, not a published package.** `npx repo2agent` is the intended public interface.
   This phase implements it in-repo as `pnpm repo2agent` (`scripts/repo2agent.ts` →
   `site/src/ana/sdk/`). `site/package.json` stays `"private": true`. `repo2agent publish` is
   denied until a later explicit authorization.
2. **`init` writes the spec tree.** `agent.json`, `AGENTS.md`, `agent/index.ts`, `agent/schemas.ts`,
   `agent/tools.ts`, and `tests/agent.test.ts`. The stub is local-function, read+compute, and does
   not execute remote repository code.
3. **`validate` / `test` / `register` reuse the in-repo contract.** Validate uses the Phase 4
   `repo2agent/v1` loader. Test invokes the scaffold through `invokeRepoAgent`. Register copies
   `agent.json` into a manifests root and always reports `enabled: false` / `published: false`.
   Runtime lookup still requires a human-approved enabled audit.
4. **Protected remotes stay untouched.** Init and register refuse `astraea` / `pinaculo` /
   `strudel` and `uset82/ASTROEA`, `uset82/pinaculo`, `uset82/StrudelAI`.
5. **Nothing is activated.** CC AI stays the public visitor assistant. Specialists stay disabled.

### Consequences

- Phase 29 (final architecture integration) may start after Phase 28 checkboxes are verified.
- Do not enable specialists or replace CC AI in public deploys in this phase.
- Do not run `npm publish`.

---

## 030 — Confirmed ANA runtime path and remaining gaps

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 29

### Context

Phases 7–16 and 21 already built the orchestrator, planner, registry, sandbox, security gate,
verification, synthesis, and gated UI. Phase 29 is confirmation, not a new orchestrator. The
public assistant is still CC AI. This record maps the spec diagram onto the in-repo modules and
lists what is still unfinished.

### Decisions

1. **Confirmed runtime path.** The in-repo walk is User → `createAnaPostHandler` / `runAna` →
   `draftPlan` (intent/planner) → `indexRepoAgents` / `routeIntent` (registry and capability
   selection) → `executePlan` (`RepoAgent.execute` through `sandbox.runAgent` and the security
   gate) → traces and responses (result bus) → `completeVerification` → `synthesizeAnaResult` →
   user answer. Typed visitor questions still use `/api/cc-ai`. The map lives in
   `site/src/ana/core/architecture.ts`.
2. **Protocol path is repository-agnostic.** ANA Core does not import host adapters or GitHub
   remotes. Execute, verify, and synthesize work through `RepoAgent` (`manifest` / `health` /
   `execute`). An uncatalogued specialist can run on that protocol without editing `runAna`.
3. **Default routing is not fully catalog-free.** Domain catalog member ids, intent keywords, and
   DAG policy still name known specialists. New repositories still need scan → propose → human
   approve → later enable, and often a catalog or discovery route, before ANA selects them by
   default. That remaining work belongs to Phase 30 (`ANA-30.17`), not a silent rewrite of Core.
4. **Remaining gaps stay explicit.** Specialists remain disabled; the production registry catalog
   is empty; Energy / Avatar / Video / Design / market-research are not executable host adapters;
   combined analysis is consent-gated; Ask My Portfolio is not biography; private repos stay out;
   `runRepository` is denied in-process; Repo2Agent is unpublished; visitor grant is read+compute;
   debug stays off; Phase 30 Definition of Done is unverified. Production ANA is not live.
5. **Nothing is activated.** CC AI stays the public visitor assistant. `ANA_SPECIALISTS_ENABLED`
   and `ANA_DEBUG_ENABLED` stay false in public deploys. ASTROEA, pinaculo, and StrudelAI remotes
   were not modified.

### Consequences

- Phase 30 (Definition of Done) may start after Phase 29 checkboxes are verified.
- Do not enable specialists or replace CC AI in public deploys in this phase.
- Do not treat the named domain catalog as proof that ANA already discovers every new repository
  without Core changes.

---

## 031 — ANA Definition of Done verified in-process

Date: 2026-08-13  
Status: Accepted  
Decision owner: Carlos Carpio  
Spec: `updates/tasks/smartchatbot.md` Phase 30

### Context

Phase 29 confirmed the orchestrator path and recorded remaining gaps. Phase 30 is the
Definition of Done: prove the in-repo orchestrator can receive a natural-language question,
plan, search, select, ask for missing inputs, run concurrently, filter inputs, execute tools,
isolate repository code, share one output schema, survive failures, detect contradictions,
synthesize, retain provenance, return one answer, show active systems, and register a new
repo without editing ANA Core.

This is fixture verification of `runAna` and related modules. It is not a production cutover.

### Decisions

1. **DoD is verified in-process.** ANA-30.1–ANA-30.17 pass in
   `site/src/tests/ana-definition-of-done.test.ts` with injected specialists and host tools.
   Public `POST /api/ana` stays gated. Typed visitor questions still use CC AI.
2. **ANA-30.17 means Core stays protocol-based.** Scan, propose, and `repo2agent register`
   admit a new repository without editing `site/src/ana/core/`. Execute/verify/synthesize
   already run unknown `RepoAgent`s. Default domain-catalog routing still names known
   specialists (gap recorded in ADR 030). Register never sets `enabled: true`.
3. **Production ANA is not live.** Specialists remain disabled. The runtime registry catalog
   stays empty until a later human enablement decision. Energy / Avatar / Video / Design /
   market-research are still not executable host adapters. Repo2Agent is unpublished.
4. **Nothing is activated.** `ANA_SPECIALISTS_ENABLED` and `ANA_DEBUG_ENABLED` stay false in
   public deploys. ASTROEA, pinaculo, and StrudelAI remotes were not modified.

### Consequences

- The sequential ANA / Repo2Agent ledger in `taskplan.md` is complete through Phase 30.
- Do not enable specialists or replace CC AI without a new explicit decision.
- Remaining product gaps in ADR 030 still apply.


