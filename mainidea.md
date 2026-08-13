# Portfolio product thesis

Carlos Carpio's public portfolio is a multi-page editorial site: The Submerged Earth Observatory.
It presents software, AI systems, music and video, CV material, travel, and personal practice
without collapsing into a generic developer-card grid.

The visitor-facing assistant on the site is currently **CC AI**. It answers only from approved
public portfolio records. That assistant remains in place. This document records the next
architecture: **ANA** as the sole user-facing orchestrator, and **Repo2Agent** as the module that
turns repositories into capabilities.

Source of truth for the multi-agent design: `updates/tasks/smartchatbot.md`.
Implementation ledger: `taskplan.md`.
Architecture decisions: `docs/DECISIONS.md`.

## ANA / Repo2Agent Multi-Agent Architecture

ANA is the only assistant a portfolio visitor talks to. Individual GitHub repositories do not
appear as separate chatbots. A repository is not automatically an AI agent.

```text
Repository
    → Capability analysis
    → Agent | Tool | Knowledge | Disabled
    → Agent Registry
    → ANA Super Agent
    → One unified response
```

### ANA as orchestrator

ANA's job is to understand, plan, delegate, verify, synthesize, and explain. She should not
answer every domain question from a single generic prompt. She should select capabilities from
the registry, invoke the minimum required specialists or tools, and return one coherent reply
with provenance.

The in-repo loop is `runAna` in `site/src/ana/core/`. Phase 29 confirmed that walk:
planner → registry / capability selection → specialists through the sandbox → traces →
verification → synthesis (decision 030). Phase 30 verified the Definition of Done against
that same in-process orchestrator (decision 031). Public `POST /api/ana` stays gated.
Intent routing is deterministic
(kebab-case goals in `intent.ts`, minimum-agent selection, internal DAG). It is not a visitor
chatbot and not an LLM. Biography, CV, employer, and case-study questions still defer to CC AI's
public-knowledge boundary. Ask My Portfolio (`ask-portfolio`) navigates owned public GitHub
audits and cites repository URLs; it does not invent metrics or include private, disabled, empty,
or fork repositories (including Paper2Video). Specialist
domains are refused unless a capable agent was actually delegated. Unregistered specialists
are listed, not invented.

The current CC AI route, knowledge ledger, and UI stay the public assistant. Phase 21 wired ANA
into that same shell: exploration chips and `POST /api/ana` stay gated by
`ANA_SPECIALISTS_ENABLED`, typed questions still use CC AI, and Observatory specialists appear
as status rather than separate chatbots. Phase 22 streams ANA plan/execution status over SSE on
that same POST route; JSON remains the default and the live region announces phases, not answer
tokens. Repo2Agent work must not rebuild the portfolio or bypass the public-only knowledge
boundary.

### Repository-to-capability architecture

Every owned repository is audited before it can participate. The auditor inspects public
metadata, README text, and selected manifests. It infers domain, capabilities, and a recommended
runtime type. Inference is not activation.

ANA should eventually need only:

- what a capability does
- which agent or tool provides it
- required inputs
- required permissions
- how to invoke it
- the output schema

She should not need hardcoded knowledge of how each repository is implemented.
Execute, verify, and synthesize already follow that rule through the `RepoAgent` protocol.
Default routing still names known specialists in the domain catalog, intent keywords, and DAG
policy; remaining gaps are listed in `docs/DECISIONS.md` 030.

### Runtime classification

| Type | When to use | Example |
| --- | --- | --- |
| `agent` | Significant reasoning or domain expertise | ASTROEA, pinaculo, StrudelAI |
| `tool` | Deterministic function, no extra LLM required | QR generator, StillasCalculator |
| `knowledge` | Useful docs or code that should be searchable, not executed | reports, educational repos |
| `disabled` | Empty, duplicate, obsolete, or unrelated fork | empty placeholders, vendor clones |

Related repositories may later collapse into one **domain agent** (for example an Electronics
agent wrapping several embedded tools). That is Phase 18. Until then, classification stays at
repository granularity.

### Agent registry

Machine output lives in `brain/repositories/registry.generated.json`.
Human corrections live in `brain/repositories/registry.overrides.json`.
Overrides always win. Generated audits never set `enabled: true`.

The runtime Agent Registry lives in `site/src/ana/registry/`. It loads only public, enabled
`agent` / `tool` manifests and answers exact `findByCapability` / `findByDomain` lookups.
Semantic discovery lives in `site/src/ana/discovery/`: a local hashed TF index over descriptions,
capabilities, README excerpts, API schemas, and tool text, with keyword fallback when embeddings
are unavailable. Private and disabled repositories are not indexed. A later scanner
(`site/src/ana/repositories/scanner.ts`) can diff newly owned GitHub repositories against known
audits and propose `agent.json` drafts; those drafts stay `enabled: false` until a human reviews
them, and review still does not activate the runtime registry. The audit JSON loader in
`site/src/ana/repositories/registry.ts` stays separate. Until specialists are enabled, the
production catalog is empty.

### RepoAgent protocol

Every specialist presents the same contract to ANA: `manifest()`, `health()`, and
`execute(request)`. The in-repo module is `site/src/ana/protocol/` — not a published
`packages/agent-protocol` package. Capabilities stay kebab-case. Permissions match the later
security gate: read, compute, network, write, external-action, high-risk.

Callable specialists declare that contract on disk as versioned `agent.json`
(`schema: "repo2agent/v1"`). The loader is `site/src/ana/manifest/`. Adding a capability is a
manifest change, not an ANA core change. Host copies for the first three specialists live in
`brain/repositories/manifests/`.

### Specialist agents

The first proof-of-concept specialists are:

- ASTROEA → Astrology Agent (HTTP to the Immanuel chart API; no invented ephemeris)
- pinaculo → Numerology Agent (extracted Pináculo calculator; symbolic, not scientific)
- StrudelAI → Music Agent (HTTP to the StrudelAI music-agent pipeline)

Wave 2 host adapters follow the same contract, still disabled:

- mentora, smartapply, thesis-writer → injected-engine agents (default unavailable)
- stillas → scaffolding tool catalog (no extracted load formulas)
- electronics-agent → one specialist with traffic-light, FPGA/UART knowledge, microcontroller,
  smart-home, and watering tools (not five LLM agents)
- avatar-studio, 3Doodle, iFoundYou stay knowledge; Paper2Video stays disabled

They are invoked independently through `RepoAgent` and a gated `/api/agent` adapter. ANA Core
can delegate to them when they are injected into `runAna`. They do not replace CC AI. Audit
`enabled` stays false, so the production registry catalog is still empty.

### Domain agents

When too many micro-agents exist, specialists group under domain agents: Creative, Engineering,
Personal Insight, Education, Career. ANA's default selection is that domain catalog
(`site/src/ana/domains/`). Execution still invokes registered specialists. Knowledge and
disabled members are listed, not run. Sources keep the specialist as producer, with optional
`via` the domain agent.

### Semantic discovery

Free-text capability search (`capability-search`) ranks the local discovery index, then expands
the Engineering domain. STM32 / EXTI interrupt queries select `electronics-agent` rather than
natal or QR. Keyword lookup is used when embeddings are unavailable. Private, disabled, and
Paper2Video repositories stay out of the index.

### Observability

Internal `/ana/debug` (gated by `ANA_DEBUG_ENABLED`, default false) shows request, plan, active
agents, latency, tokens, cost units, and result, with request ID and trace ID. Snapshots omit
provided inputs and specialist payloads. This is not a visitor feature.

### Execution layer

Independent specialists run concurrently in `executePlan` (bounded pool, timeouts, one retry,
partial failure, cost limit, cancellation, traces without inputs). Dependent work uses a DAG
of waves: career after education, business after career plus ASTRAEA/Pináculo. Cycles are
detected and not executed. A specialist may request another specialist only through ANA's
runtime (`requestSpecialist`); follow-ups reuse `plan.provided` and cannot pass an input blob.
Defaults cap depth at 3, agents per request at 8, and wall-clock at 30s. Recursion is denied.
Every sub-call appears in traces (`delegate` / `delegate-denied`). Repository code that must
execute does so in a sandbox, not inside the portfolio process.

### Verification

Before ANA uses a specialist result: schema validation against the response envelope and
declared outputs, unanswered-capability detection, execution-failure flags, undeclared
assumptions on partial results, contradiction checks, and low-confidence handling (below 0.7).
An optional deterministic verification agent can review finding codes only; it is off by
default and never receives private inputs. ANA synthesizes into
agreements, contradictions, facts, assumptions, symbolic interpretation, practical evidence,
recommendations, and an action plan. An optional combined analysis (`combined-analysis`) is
opt-in: it may call ASTRAEA, Pináculo, Mentora, SmartApply, and business together, and the
answer leads with FACTUAL ANALYSIS, SYMBOLIC INTERPRETATION, AI INFERENCE, and ACTIONABLE
RECOMMENDATION. Symbolic astrology/numerology is never treated as a
high-confidence fact. She does not concatenate answers.

### Provenance

Every important statement retains who produced it, which repository, which capability, when it
ran, an input fingerprint (not the raw private fields), and what confidence it returned.
Sources are listed in the ANA answer. Symbolic interpretation (astrology, numerology) stays
labeled separately from factual project evidence.

### Privacy

Public and private repositories are treated differently. Private repositories never become
public portfolio knowledge automatically. `contextFilter` routes user data per agent allowlist.
ASTRAEA receives birth data, Pináculo receives name and birth date, Strudel receives music
preferences, and career receives education/skills/experience. Personal profile fields need
consent before sharing. Combined analysis requires explicit consent before any of those fields
are sent; a natal-only request still shares allowlisted fields for that turn. Birth data,
names, and secrets are masked in logs and omitted from
analytics. Session, user, and project memory stay in separate scopes. User memory requires
explicit save consent.

### Sandboxing and permissions

Unknown repository code never executes automatically. Specialist work goes through a sandbox
manager: untrusted repository paths are denied in-process, jobs carry CPU/memory/timeout
limits, HTTP targets cannot be file or metadata URLs, `.env` and API keys stay out of the
sandbox, and ANA only consumes validated JSON output. Docker is a later provider, not this
phase. Specialist agents start as **read + compute**. A security gate sits between planner and
execution. Write, network, external-action, and high-risk permissions require an explicit
grant; write and external-action also need confirmation.

### Shared memory

Three scopes: session (current conversation), user (saved with explicit consent), and project
(repository knowledge). They are never mixed blindly. Session may reuse provided fields in the
same conversation. User memory is AES-256-GCM encrypted at rest and is applied only when
requested. `deleteMemory` removes a session, a category, a user profile, or a project record.
`brain-private` is not wired yet; if used later it stays isolated from public `brain/`, the
CC AI ledger, and client bundles.

### Future Repo2Agent SDK

The conversion CLI now exists in-repo (`pnpm repo2agent`: `init`, `validate`, `test`, `register`).
It is not an npm package. `publish` is denied until explicitly authorized. Registering a scaffold
does not enable the specialist.

### Non-goals for the current phase

- Do not convert ASTROEA, pinaculo, or StrudelAI into callable agents yet.
- Do not replace CC AI until equivalent safety gates pass. Phase 21 keeps it as the public guide.
- Do not execute discovered repositories.
- Do not index private repository contents into the public site.
