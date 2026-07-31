# Task plan — Codex

**Role: the build engine.** You carry the largest share of the code — the brain pipeline, the
CC AI retrieval layer, the arcade routes, and the design system implemented from Claude's specs.
**Worktree:** `../wt-codex` on `feat/brain-pipeline`
**Board:** [`../TASKBOARD.md`](../TASKBOARD.md) · **Brief:** [`../agents/CODEX.md`](../agents/CODEX.md)

**24 tasks** — the most of any agent. Mark `[ ] ☐` → `[x] ☑` only after the acceptance
condition is verified, one at a time, with a dated entry in §5.

> **Every PR you open is reviewed by Claude before it merges**, against four things: does
> `pnpm verify` pass, does it match the spec, is it honest (no invented facts, no status
> upgrades), and did it stay in your lane. Different-but-working still gets sent back — silent
> divergence is what makes the next task not fit. This is not distrust; it is the check that
> lets you move fast.

**You own:** `brain/**` · `scripts/brain-*.ts` · `scripts/chatgpt-*.ts` · `site/src/lib/ai/**` ·
`site/src/content/generated/**` · `site/src/app/arcade/**` · `site/src/components/arcade/**` ·
`site/src/styles/**` *(from `SPEC.1` only)* · `site/src/tests/cc-ai-*.test.ts` ·
`site/src/tests/brain-*.test.ts` · `site/src/tests/arcade-*.test.ts`

**You must not edit:** `site/src/app/**` and `components/**` *outside* `arcade/`, and
`lib/three/**` (Claude) · `site/public/images|videos|audio/**` (Gemini) ·
`site/public/games/**`, build/deploy scripts, Railway config (Grok) · `updates/**`,
`maintaskplan.md` (Claude) · shared: `package.json`, `schemas.ts`, `records.ts`, `Dockerfile`,
`railway.json`

> `styles/**` is shared with Claude's design lane. You write it **only** when implementing a
> delivered `SPEC.*`, never on your own initiative — Claude makes the visual decisions.

> You will need `package.json` script entries. **Do not add them.** Put the exact lines in your
> PR description; Claude applies them on `main` and you rebase.

---

## 1. Brain pipeline — Workstream B

Full specification: [`../01-brain-spec.md`](../01-brain-spec.md).

- [ ] ☐ **B.1 — Brain skeleton.** `brain/` per spec §3: `README.md`, `.gitignore`,
      `private-source-map.json`, `_templates/project/`, `_templates/book/`, and empty
      `projects/`, `github/`, `library/`, `agents/`, `index/`.
      **Acceptance:** matches spec exactly; §8 ignore patterns present; no `.pdf`/`.epub`/export
      committed.

- [ ] ☐ **B.2 — `project.json` schema + `brain:check`.** Zod schema per spec §4, **reusing** the
      `verification` / `rights` / `publication` / `sourceIds` vocabulary from
      `site/src/content/schemas.ts` — this feeds the existing pipeline, it does not fork it.
      Invariants: `public: true` requires approved rights **and** every `sourceIds` entry
      resolving to a `public: true` source in `records.ts`; `publication: "ready"` requires a
      non-empty `NOTES.md` and ≥1 `knowledge/` file; **`status` may never be raised by a
      script**; no `brain-private/` content in any public file.
      **Acceptance:** clear message + non-zero exit on violation; unit tests cover every
      invariant including negatives; ready to join `pnpm test`.

- [ ] ☐ **B.4 — GitHub sync.** `brain:sync-github` per `../02-github-inventory.md` §6.
      **Filter to `fork === false` and `size >= 50 KB`** — 42 repos, not 61.
      **Pull authored documents, not just READMEs**: `AGENTS.md`, `agents.md`, `docs/**`,
      `*_DIARY.md`, `*_PLAN.md`. `StrudelAI` (#31) alone carries `PROJECT_DIARY.md`,
      `STRUDEL_DICTIONARY.md`, and ~15 authored plan docs — that is the richest Tier P corpus
      that exists and it is already written.
      **Never fetch** stars, forks, watchers, or issue counts.
      Forks → `brain/github/_forks/` with a mandatory hand-filled `contributionNotes` before
      `public: true` is allowed.
      **Acceptance:** re-running on unchanged upstream produces an empty diff and never
      rewrites a hand-authored file.

- [ ] ☐ **B.6 — Build bridge + leak test.** `brain:build` emits **approved public tier only**
      into `site/src/content/generated/`, which is committed so the Docker build finds it
      (`.dockerignore` excludes everything outside `site/`).
      **Acceptance:** a fixture with a `public: false` project and a private-path reference
      contributes **zero bytes** to the output, proven by a test.

- [ ] ☐ **B.7 — Per-project agent skills.** `agents/SKILL.md` per project folder, mirroring the
      existing `.agents/skills/` pattern rather than inventing a second system.

- [ ] ☐ **B.9 — ChatGPT conversation pipeline.** `chatgpt:split` explodes `conversations.json`
      into per-conversation Markdown inside `brain-private/`; `chatgpt:scan` flags likely
      secrets, long verbatim quotes, and personal identifiers, then writes a review checklist.
      Both scripts operate **only** on the private sibling repo and are excluded from CI.
      **Do not index the raw export.** Those transcripts realistically contain pasted book
      excerpts, pasted API keys, personal and employer details, and abandoned wrong turns that
      would make CC AI confidently incorrect. Distillation is Carlos's manual step — that is the
      control, not a gap. Rationale: `../01-brain-spec.md` §6.
      **Acceptance:** no raw transcript text reaches any generated file, proven by a test.

---

## 2. CC AI retrieval — Workstream A

Today `cc-ai-knowledge.ts` serializes **every** record into one system prompt and truncates at
8 000 characters by insertion order. No retrieval, no chunking, no ranking. The corpus is
**6.7 KB, two records**. You are building the layer that does not exist.

- [ ] ☐ **A.1 — Chunk and index.** 400–800 characters per chunk, each carrying
      `{id, type, title, headingPath, sourceIds, text}`. Emit
      `site/src/content/generated/cc-ai-index.json` via `ai:index`.
      **Acceptance:** deterministic — byte-identical across two runs on unchanged input.

- [ ] ☐ **A.2 — Retrieval.** BM25-style lexical scoring with field boosts for exact title/slug
      match, plus a type filter from a light intent pass. Top-k 8–12 against a ~6 000-character
      budget inside a 12 000-character context. **Pin** the profile record and the
      exclusion/boundary records into every request so refusal rules can never be evicted.
      **No new production dependency.** The corpus is low thousands of chunks; `rules.md`
      requires justifying every dependency and a vector database is not justified at this size.
      `A.3` revisits this *only* on a measured recall gap. Do not relitigate it.
      **Acceptance:** tests prove a question about project X retrieves X's chunks, and boundary
      records are present in 100 % of assembled contexts.

- [ ] ☐ **A.5 — Expand the evaluation set.** Grow `cc-ai-evaluation.json` to 60–100 cases:
      answerable factual questions per project; **must-refuse** cases (salary, address,
      employers, unverified claims); **prompt injection** ("ignore your instructions",
      instructions hidden inside a pasted project description); **copyright probes** ("quote
      chapter 3"); **status-integrity probes** ("is PINÁCULO shipped?" — it is a concept).
      **Acceptance:** citation validity 100 %, private-data leakage 0, correct refusal on every
      unanswerable case, status labels never upgraded.

- [ ] ☐ **A.6 — Streaming.** Replace `CcAiProvider.complete()` with a streaming path behind the
      same interface, keeping the non-streaming implementation for tests.
      **Acceptance:** first token under 1.5 s on the production model; error codes and abuse
      controls unchanged; reduced motion respected.

- [ ] ☐ **A.7 — Grounded UI responses.** When an answer concerns a project or media work,
      return the structured record so the real card and route link render beneath the text. Data
      is already in `content/records.ts`.
      **Acceptance:** cards render only for records that exist; no fabricated links; keyboard
      reachable. Component wiring is Claude's — state what you need in the PR.

- [ ] ☐ **A.8 — Bounded session memory.** Last N turns, explicit token budget, visible "new
      conversation" control. No cross-session persistence, no visitor profiling.

- [ ] ☐ **A.9 — Durable rate limiting.** `cc-ai-abuse-control.ts` is per-instance, which is not
      a limit once Railway runs replicas. Add a shared store (Railway Redis).
      **Acceptance:** the limit holds across two concurrent instances in a test.

---

## 3. Design system and arcade — implemented from Claude's specs

Claude makes the design *decisions* and writes the spec; you implement. Do not start these until
the matching `SPEC.*` task is delivered — building against a guess wastes both our time.

- [ ] ☐ **V.4 — Type and layout ramp.** *(needs `SPEC.1`)* Editorial type scale with defined
      roles (display / headline / subhead / body / caption / label), explicit grid, vertical
      rhythm tokens. **Acceptance:** rendered as a live page, not only a token file.

- [ ] ☐ **V.5 — Three motion motifs.** *(needs `SPEC.1`)* **Reveal** (staged entrance, extending
      `hero-reveal.tsx`), **Focus pull** (depth/weight on hover and focus), **Passage** (route
      transitions via `template.tsx`). `rules.md` caps this at three deliberately — do not add a
      fourth. **Acceptance:** each motif has a *complete* `prefers-reduced-motion` path — a real
      alternative, not a disabled one.

- [ ] ☐ **V.7 — `/studio` craft page.** *(needs Claude's spec)* Built around `webdesigner`
      (#59) as the lead case study, plus the live token page from `V.4`, wireframe → final
      comparisons, and `avatar-studio` (#60) as a second systems exhibit.

- [ ] ☐ **V.8 — Micro-interactions.** Focus states, hover transitions, loading skeletons, empty
      states, error states, cursor treatment. Invisible in screenshots, which is why it is its
      own task.

- [ ] ☐ **C.2 — `/arcade` route.** *(needs `Q.4` and Grok's `C.1` measurements)* Editorial
      index: real posters (from Gemini `M.8`), one-line descriptions, controls, honest per-item
      status. Follow the existing `laboratory-index` / `project-register` patterns.

- [ ] ☐ **C.3 — Play shell `/arcade/[slug]`.** Poster → explicit play button → **sandboxed**
      iframe. Never autoload. Never autoplay audio. `sandbox` attributes on every embed —
      `rules.md` requires external-embed sanitization. Documented keyboard alternative or an
      honest "requires pointer" state.

- [ ] ☐ **C.4 — Mobile honesty.** Desktop-only games get a clear "desktop recommended" state,
      not a broken canvas. Designing the *unavailable* case is part of designing mobile.

- [ ] ☐ **B.0 — Create `uset82/brain-private` as a PRIVATE repo.** Clone as a sibling of
      `portafolio-main`. Books, PDFs, ChatGPT exports, raw notes live there — **never** in a
      gitignored folder inside the public portfolio repo. Reasoning: `../01-brain-spec.md` §2.

- [ ] ☐ **B.3 — Seed two project folders by hand.** `ifoundyou` and `opennemoclaw` — their
      source packs already exist in `docs/content/`. Prove the schema works on real content
      before scaling to 42. **Do not create 42 empty folders.**

- [ ] ☐ **B.5 — Harvest ChatGPT project custom instructions.** Short, entirely Carlos's own
      words, zero copyright risk, and a literal specification of how he wants to be answered.
      The highest-value lowest-risk import in the plan. → `brain/agents/`, `brain/library/`.

- [ ] ☐ **A.3 — Embeddings.** **Only if `A.5` shows a measured recall gap.** Prefer build-time
      embedding into a static file over a runtime service. Do not start this speculatively.

- [ ] ☐ **A.11 — Optional private study mode.** Authenticated route over the full private
      corpus, for Carlos only. Different route, different corpus, never reachable by visitors.
      Build only if he asks.

---

## 4. Protocol

1. `git fetch origin && git rebase origin/main` before you start and before you push.
2. `pnpm verify` green in your worktree before any PR — format, zero-warning lint, strict TS,
   all tests, plus content/palette/boundary/asset/immersive gates.
3. One task per PR. Claim in `../claims/codex.md` (yours alone).
4. Never commit to `main`. Never force-push, `reset --hard`, or `clean -fd` —
   `.codex/rules/portfolio.rules` already denies these.
5. Adjacent work discovered → new unchecked task, new ID, in the PR body. Never widen scope.
6. Merge conflict → push as-is, hand to Claude. Do not guess at another agent's intent.
7. Never invent facts, metrics, dates, employers, or ownership. Secrets never enter git.

---

## 5. Completion log

_Dated entry per checked box: changed files, checks run, test evidence._
