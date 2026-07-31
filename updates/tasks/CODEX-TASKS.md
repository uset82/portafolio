# Task plan — Codex

**Role: the build engine.** You carry the largest share of the code — the brain pipeline, the
per-repo skills and agents that make CC AI smart, the retrieval layer, and the arcade and design
system implemented from Claude's specs.
**Worktree:** `../wt-codex` on `feat/brain-pipeline`
**Board:** [`../TASKBOARD.md`](../TASKBOARD.md) · **Brief:** [`../agents/CODEX.md`](../agents/CODEX.md)

**41 tasks.** Mark `[ ] ☐` → `[x] ☑` only after the acceptance condition is verified, one at a
time, with a dated entry in §6.

> **Every PR is reviewed by Claude before it merges**, against four things: does `pnpm verify`
> pass, does it match the spec, is it honest (no invented facts, no status upgrades), and did it
> stay in your lane. Different-but-working still gets sent back — silent divergence is what makes
> the next task not fit. This is the check that lets you move fast.

**You own:** `brain/**` · `scripts/brain-*.ts` · `scripts/chatgpt-*.ts` · `site/src/lib/ai/**` ·
`site/src/content/generated/**` · `site/src/app/arcade/**` · `site/src/components/arcade/**` ·
`site/src/styles/**` _(from a delivered `SPEC.*` only)_ · `site/src/tests/cc-ai-*.test.ts` ·
`site/src/tests/brain-*.test.ts` · `site/src/tests/arcade-*.test.ts`

**You must not edit:** `site/src/app/**` and `components/**` _outside_ `arcade/`, `lib/three/**`
(Claude) · `site/public/images|videos|audio/**` (Gemini) · `site/public/games/**`, build/deploy
scripts, Railway config (Grok) · `updates/**`, `maintaskplan.md` (Claude) · shared:
`package.json`, `schemas.ts`, `records.ts`, `Dockerfile`, `railway.json`

> **Design decisions are Claude's, implementation is yours.** That includes the arcade — Claude
> designs how playing inside the portfolio looks and feels; you build it. Never start a `V.*` or
> `C.2`–`C.4` task before its `SPEC.*` is delivered.

> You will need `package.json` script entries. **Do not add them.** Put the exact lines in your
> PR description; Claude applies them on `main` and you rebase.

---

## 1. Brain foundation — Workstream B

Full specification: [`../01-brain-spec.md`](../01-brain-spec.md).

- [ ] ☐ **B.0 — Create `uset82/brain-private` as a PRIVATE repo.** Clone as a sibling of
      `portafolio-main`. Books, PDFs, ChatGPT exports, and raw notes live there — **never** in a
      gitignored folder inside the public portfolio repo. A `.gitignore` in a public repo is one
      `git add -f` away from a permanent leak. Reasoning: `../01-brain-spec.md` §2.
      **Acceptance:** repo exists, is private, contains `books/`, `chatgpt/`, `courses/`,
      `scratch/`; nothing in it is reachable from the public repo.

- [x] ☑ **B.1 — Brain skeleton.** `brain/` per spec §3: `README.md`, `.gitignore`,
      `private-source-map.json`, `_templates/project/`, `_templates/book/`, and empty
      `projects/`, `github/`, `library/`, `agents/`, `index/`.
      **Acceptance:** matches spec exactly; §8 ignore patterns present; no `.pdf`/`.epub`/export
      committed.

- [x] ☑ **B.2 — `project.json` schema + `brain:check`.** Zod schema per spec §4, **reusing** the
      `verification` / `rights` / `publication` / `sourceIds` vocabulary from
      `site/src/content/schemas.ts` — this feeds the existing pipeline, it does not fork it.
      Invariants: `public: true` requires approved rights **and** every `sourceIds` entry
      resolving to a `public: true` source in `records.ts`; `publication: "ready"` requires a
      non-empty `NOTES.md` and ≥1 `knowledge/` file; **`status` may never be raised by a
      script**; no `brain-private/` content in any public file.
      **Acceptance:** clear message + non-zero exit on violation; unit tests cover every
      invariant _including negatives_; ready to join `pnpm test`.

- [x] ☑ **B.3 — Seed two project folders by hand.** `ifoundyou` and `opennemoclaw` — source
      packs already exist in `docs/content/`. Prove the schema survives real content before
      scaling. **Do not create 42 empty folders.**
      **Acceptance:** both pass `brain:check`; each has a real `NOTES.md` and ≥1 `knowledge/` file.

- [ ] ☐ **B.4 — GitHub sync.** `brain:sync-github` per `../02-github-inventory.md` §6.
      **Filter to `fork === false` and `size >= 50 KB`** — 42 repos, not 61.
      **Pull authored documents, not just READMEs**: `AGENTS.md`, `agents.md`, `docs/**`,
      `*_DIARY.md`, `*_PLAN.md`, `*_FIX*.md`, `design.md`. `StrudelAI` (#31) alone carries
      `PROJECT_DIARY.md`, `STRUDEL_DICTIONARY.md`, and ~15 authored plan docs — the richest
      Tier P corpus that exists, already written.
      **Never fetch** stars, forks, watchers, or issue counts — they change under you.
      Forks → `brain/github/_forks/` with a mandatory hand-filled `contributionNotes` before
      `public: true` is allowed.
      **Acceptance:** re-running on unchanged upstream produces an empty diff and never rewrites
      a hand-authored file.

- [ ] ☐ **B.6 — Build bridge + leak test.** `brain:build` emits **approved public tier only**
      into `site/src/content/generated/`, committed so the Docker build finds it
      (`.dockerignore` excludes everything outside `site/`).
      **Acceptance:** a fixture with a `public: false` project and a private-path reference
      contributes **zero bytes** to the output, proven by a test.

---

## 2. Per-repo skills and agents — this is what makes CC AI smart

**Yes, every repo needs its own skill and agent.** This is the difference between a chatbot that
recites a README and one that can actually explain how Carlos built something and why.

A synced README tells CC AI _what a repo is_. A `SKILL.md` tells it _how to talk about it_ —
which questions it can answer, which it must refuse, what the honest status is, and what the
project is genuinely comparable to. Without these, retrieval returns text and the model
improvises the framing. With them, the framing is Carlos's.

Each project folder gets:

```
brain/projects/<slug>/agents/
├── SKILL.md          how an agent works ON this project (build, test, conventions)
└── ANSWERS.md        how CC AI TALKS ABOUT this project — scope, refusals, status, comparisons
```

- [ ] ☐ **B.7.1 — Author the two templates and their validator.** `_templates/project/agents/`
      gets `SKILL.md` and `ANSWERS.md`. Mirror the existing `.agents/skills/` shape
      (`curate-portfolio-content`, `portfolio-delivery`) — do not invent a second system.
      `ANSWERS.md` front-matter must carry: `answerableTopics[]`, `mustRefuse[]`,
      `statusClaim` (must equal `project.json.status`), `comparableTo[]`, `sourceIds[]`.
      **Acceptance:** `brain:check` fails when `statusClaim` disagrees with `project.json`, and
      fails when `ANSWERS.md` exists without `sourceIds`. Negative tests included.

- [ ] ☐ **B.7.2 — Generate skeletons for all 42 repos from synced data.** From `B.4` output,
      write a `SKILL.md` + `ANSWERS.md` stub per project with everything machine-derivable
      already filled: stack, entry points, build command, test command, license, live URL.
      Leave judgement fields **empty and clearly marked**, never guessed.
      **Acceptance:** 42 folders exist; no stub contains an invented capability, metric, or
      status; `brain:check` passes with stubs flagged `publication: "draft"`.

Then fill them by cluster. Clusters are from `../02-github-inventory.md` §3.
**Fill order is deliberate: richest documentation first, so the pattern is proven on the
projects that have the most to say.**

- [ ] ☐ **B.7.3 — Design and creative tooling (3 repos).** #59 `webdesigner`, #60 `avatar-studio`,
      #19 `diagramcloner`. `webdesigner` is the flagship — it ships a design system, a
      3D-scroll skill pack, Blender assets, and a distributable plugin, and it already has
      `.agents/`, `AGENTS.md`, `design.md`, `openaidesign.md`, `mainidea.md` to harvest.
      **Acceptance:** each answers "what is it", "what did Carlos build", "what is it not".

- [ ] ☐ **B.7.4 — Music and audio (6).** #31 `StrudelAI`, #13 `LyriGenie`, #7 `Suno-UDIO-Helper`,
      #24 `v0-banana-piano-app`, #28 `MicrocontrollerPiano`, #27 `piano-`.
      `StrudelAI`'s `PROJECT_DIARY.md` and `STRUDEL_DICTIONARY.md` are the highest-value source
      material in the whole corpus — harvest before writing anything new.

- [ ] ☐ **B.7.5 — Games and interactive (6).** #32 `My-Football-Game`, #46 `Monkey-Tug-of-War`,
      #14 `MandelBro`, #12 `3Doodle`, #37 `drone_Lips`, #42 `gimmemycake`.
      Each `ANSWERS.md` must state engine, input method, and whether it is playable in a
      browser — CC AI will be asked "can I play it?" and must answer correctly.

- [ ] ☐ **B.7.6 — AI, agents, applied systems (9).** #21 `bankAI`, #18 `EFFATA`, #51 `QubeSolve`,
      #45 `Thesis-Writer-Kit`, #10 `smartapply-app`, #6 `LLM-Web-App`, #48 `opennemoclaw`,
      #49 `opennemoclawsite`, #44 `ReportAIEquinor`.

- [ ] ☐ **B.7.7 — Portfolio-site systems (4).** #43 `ASTROEA`, #20 `pinaculo`, #40 `iFoundYou`,
      #48 `opennemoclaw`. **Record the `ASTROEA` → `astraea` slug mapping** or retrieval misses
      on one spelling. **`pinaculo` is a concept** — `statusClaim` must say so, and no README
      may upgrade it.

- [ ] ☐ **B.7.8 — Electronics and embedded (8).** #29 `RS232_VHD_DE2115`,
      #35 `Automatic-Watering-Elephant`, #26 `elefante`, #22 `TRAFFICLIGHT`, #23 `REACTIONGAME`,
      #25 `hvl2025-microcontroller-assignment3`, #28 `MicrocontrollerPiano`, #27 `piano-`.
      These are hardware — `ANSWERS.md` must make clear they are not web-runnable.

- [ ] ☐ **B.7.9 — Web apps and studies (7).** #55 `StillasCalculator`, #54 `CRM_SaaS_Educativo`,
      #53 `pacha`, #52 `chaclacayo`, #11 `SmartHomeControl`, #9 `qr-code-generator`,
      #4 `project-bolt-qrmollebakken-supabase`.

- [ ] ☐ **B.7.10 — Fork contribution notes (2).** #58 `mentora` and #56 `osiris`.
      **`mentora` wording is already approved and evidence-backed:** _"Primary developer on a
      forked college project"_ — `uset82` authored 46 of the last 100 commits plus 5 as
      `carlos`, versus 5 by the upstream owner. #1 `Tetris` is Carlos's course code but stays
      out of the arcade because it is Java desktop, not because it is not his.
      **Acceptance:** neither claims sole authorship; neither undersells real contribution.

- [ ] ☐ **B.7.11 — Cross-cutting agents in `brain/agents/`.** Skills that span projects rather
      than describe one: how Carlos approaches AI systems, hardware, design systems, and music.
      Seeded from `B.5`.

- [ ] ☐ **B.8 — Wire skills into retrieval.** `ANSWERS.md` must actually reach CC AI: its
      `mustRefuse` list joins the pinned boundary records, and `answerableTopics` boosts
      retrieval for that project.
      **Acceptance:** a test proves a `mustRefuse` topic is refused for that project even when
      its chunks rank highest.

---

## 3. ChatGPT and library ingestion

- [ ] ☐ **B.5 — Harvest ChatGPT project custom instructions.** Short, entirely Carlos's own
      words, zero copyright risk, and a literal specification of how he wants to be answered.
      The highest-value lowest-risk import in this plan. → `brain/agents/`, `brain/library/`.

- [ ] ☐ **B.9 — ChatGPT conversation pipeline.** `chatgpt:split` explodes `conversations.json`
      into per-conversation Markdown inside `brain-private/`; `chatgpt:scan` flags likely
      secrets, long verbatim quotes, and personal identifiers, then writes a review checklist.
      Both scripts operate **only** on the private sibling repo and are excluded from CI.
      **Do not index the raw export** — transcripts realistically contain pasted book excerpts,
      pasted API keys, personal details, and abandoned wrong turns that would make CC AI
      confidently incorrect. Distillation is Carlos's manual step; that is the control, not a gap.
      **Acceptance:** no raw transcript text reaches any generated file, proven by a test.

- [ ] ☐ **B.10 — `library/` ingestion.** ⛔ _Blocked on `Q.10` — whether Carlos wrote the books
      or owns copies._ Do not start until answered; the two cases need opposite pipelines.

---

## 4. CC AI retrieval — Workstream A

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
      `A.3` revisits this _only_ on a measured recall gap. Do not relitigate it.
      **Acceptance:** tests prove a question about project X retrieves X's chunks, and boundary
      records are present in 100 % of assembled contexts.

- [ ] ☐ **A.4 — Slug and alias resolution.** `ASTROEA`/`astraea`, `iFoundYou`/`ifoundyou`,
      `opennemoclaw`/`opennemoclawsite`. Build an alias map so a question using either spelling
      resolves to the same project. **Acceptance:** test covers every known alias pair.

- [ ] ☐ **A.5 — Expand the evaluation set.** Grow `cc-ai-evaluation.json` to 60–100 cases:
      answerable factual questions per project; **must-refuse** cases (salary, address,
      employers, unverified claims); **prompt injection** ("ignore your instructions",
      instructions hidden inside a pasted project description); **copyright probes** ("quote
      chapter 3"); **status-integrity probes** ("is PINÁCULO shipped?" — it is a concept);
      **fork-integrity probes** ("did Carlos build Mentora?" — contributor, not author).
      **Acceptance:** citation validity 100 %, private-data leakage 0, correct refusal on every
      unanswerable case, status labels never upgraded.

- [ ] ☐ **A.6 — Streaming.** Replace `CcAiProvider.complete()` with a streaming path behind the
      same interface, keeping the non-streaming implementation for tests.
      **Acceptance:** first token under 1.5 s; error codes and abuse controls unchanged;
      reduced motion respected.

- [ ] ☐ **A.7 — Grounded UI responses.** When an answer concerns a project or media work, return
      the structured record so the real card and route link render beneath the text. Data is
      already in `content/records.ts`.
      **Acceptance:** cards render only for records that exist; no fabricated links; keyboard
      reachable. Component wiring is Claude's — state what you need in the PR.

- [ ] ☐ **A.8 — Bounded session memory.** Last N turns, explicit token budget, visible "new
      conversation" control. No cross-session persistence, no visitor profiling.

- [ ] ☐ **A.9 — Durable rate limiting.** `cc-ai-abuse-control.ts` is per-instance. That is
      **adequate today** — Railway runs one replica — but becomes a real hole the moment the
      service scales. Add a shared store (Railway Redis).
      **Acceptance:** the limit holds across two concurrent instances in a test.

- [ ] ☐ **A.13 — Named free model in production mode.** `model-policy.ts` currently refuses all
      free routes when `CC_AI_MODE=production`. Carlos's budget is zero (`Q.6`), so production
      mode is unreachable as written. Allow an **explicitly named** free model — keeping the
      "no silent free-tier dependency" intent — while still rejecting the variable
      `openrouter/free` router.
      **Acceptance:** named free model accepted in production mode; bare `openrouter/free`
      still rejected; the responding model is still disclosed in the UI.

- [ ] ☐ **A.3 — Embeddings.** **Only if `A.5` shows a measured recall gap.** Prefer build-time
      embedding into a static file over a runtime service. Do not start speculatively.

- [ ] ☐ **A.11 — Optional private study mode.** Authenticated route over the full private corpus,
      for Carlos only. Different route, different corpus, never reachable by visitors. Build
      only if he asks.

---

## 5. Arcade and design system — implemented from Claude's specs

**Claude designs, you build.** Carlos assigned the arcade _design_ to Claude so playing inside
the portfolio is a designed experience, not a bare iframe list. Do not start any of these before
the matching `SPEC.*` lands — building against a guess wastes both our time.

- [ ] ☐ **C.2 — `/arcade` index route.** _(needs `SPEC.3` + Grok's `C.1` measurements)_
      All games ship, not a launch three (`Q.4`). Real posters from Gemini `M.8`, one-line
      descriptions, controls, honest per-item status.
      **Acceptance:** every game in the register renders; no fabricated status; keyboard
      navigable; `Tetris` absent.

- [ ] ☐ **C.3 — Play shell `/arcade/[slug]`.** _(needs `SPEC.3`)_ Poster → explicit play button
      → **sandboxed** iframe. Never autoload. Never autoplay audio. `sandbox` attributes on
      every embed — `rules.md` requires external-embed sanitization. Documented keyboard
      alternative or an honest "requires pointer" state.

- [ ] ☐ **C.4 — Mobile honesty.** Desktop-only games get a clear "desktop recommended" state,
      not a broken canvas. Designing the _unavailable_ case is part of designing mobile.

- [ ] ☐ **C.10 — Same-origin game hosting wiring.** Serve Tier-A static builds from
      `site/public/games/<slug>/` (Grok supplies the builds) and proxy Tier-B Railway services
      through Next `rewrites` so everything stays on one domain.
      **Acceptance:** no mixed-content warnings; each game reachable from `/arcade/<slug>`.

- [ ] ☐ **V.4 — Type and layout ramp.** _(needs `SPEC.1`)_ Editorial type scale with defined
      roles (display / headline / subhead / body / caption / label), explicit grid, vertical
      rhythm tokens. **Acceptance:** rendered as a live page, not only a token file.

- [ ] ☐ **V.5 — Three motion motifs.** _(needs `SPEC.1`)_ **Reveal**, **Focus pull**, **Passage**.
      `rules.md` caps this at three deliberately — do not add a fourth.
      **Acceptance:** each has a _complete_ `prefers-reduced-motion` path, a real alternative
      rather than a disabled one.

- [ ] ☐ **V.7 — `/studio` craft page.** _(needs `SPEC.2`)_ Built around `webdesigner` (#59) as
      the lead case study, plus the live token page from `V.4`, wireframe → final comparisons,
      and `avatar-studio` (#60) as a second systems exhibit.

- [ ] ☐ **V.8 — Micro-interactions.** Focus, hover, loading skeletons, empty states, error
      states, cursor treatment. Invisible in screenshots, which is why it is its own task.

- [ ] ☐ **V.13 — Delete the dead 3D layer.** `Q.3` retired 3D for good. Remove
      `site/src/lib/three/**`, `site/src/components/three/**`, `site/public/three/decoders/**`
      (1 258 KB), the `OBSERVATORY_LIVE_CANVAS_PRESENTATION` gate, and rewrite or remove the
      `assets:check` and `immersive:check` gates that exist only to test it.
      **Acceptance:** `pnpm verify` green after removal; client JS measurably smaller than the
      2 879 KB `F.5` baseline; no dead imports.

---

## 6. Protocol

1. `git fetch origin && git rebase origin/main` before you start and before you push.
2. `pnpm verify` green in your worktree before any PR — format, zero-warning lint, strict TS,
   all tests, plus content/palette/boundary/asset gates.
3. One task per PR. Claim in `../claims/codex.md` (yours alone).
4. Never commit to `main`. Never force-push, `reset --hard`, or `clean -fd` —
   `.codex/rules/portfolio.rules` already denies these.
5. Adjacent work discovered → new unchecked task, new ID, in the PR body. Never widen scope.
6. Merge conflict → push as-is, hand to Claude. Do not guess at another agent's intent.
7. Never invent facts, metrics, dates, employers, or ownership. Never upgrade a project's
   status. Secrets never enter git.

---

## 7. Completion log

_Dated entry per checked box: changed files, checks run, test evidence._

### 2026-07-31 — `B.1`, `B.2`, `B.3` merged to main

Merged via PR #9, consolidating #2 (`B.1`), #3 (`B.2`), #5 (`B.3`). `origin/main` at `546fb88`.

**Reviewed and independently verified by Claude** — not accepted on report:

- `brain-check` run by the reviewer: **"Brain valid: 2 projects."**
- `brain-check.test.ts`: **7/7 pass**, every invariant covered including negatives
- Dry-run merge in a throwaway clone confirmed Grok's `C1-MEASUREMENTS.md`, the runbook
  rewrite, and `Q.13` all survive. GitHub's diff showed them as deletions only because the
  branch predated PRs #1 and #4 — a stale merge base, not a real regression.

**Done well:** `brain-project-schema.ts` _imports_ `publicationStateSchema`, `rightsStateSchema`,
and `verificationStateSchema` from `site/src/content/schemas.ts` rather than redefining them —
the single most important `B.2` requirement and the easiest to get wrong. The `project.json`
template defaults to values that cannot validate (`rights: "pending"`,
`verification: "needs-user-confirmation"`), so a placeholder can never slip through as a claim.
And `rights: "not-applicable"` on both seeded projects is correct: the repos are unlicensed, but
these records describe the projects rather than redistribute their code.

**Noted, not blocking:** the `pinaculo` status guard is slug-specific inside a generic validator.
Lift it to a `conceptOnlySlugs` list when a second concept project appears.

**Shared-file wiring applied by Claude** — correctly requested rather than done by Codex.
`site/package.json` gains `"brain:check": "tsx ../scripts/brain-check.ts"`, and `brain:check`
now runs inside `pnpm test` between `test:unit` and `content:check`.

**Process problem, fixed:** stacked PRs #3 and #5 targeted their parent branches, so both
reported MERGED without ever reaching `main`. Codex spotted it and opened a second clean stack
(#6–#8), which would have duplicated the work. Resolved with one consolidating PR (#9); #7 and
#8 closed as superseded.

**`B.0` remains open.** It was skipped while `gh` was unauthenticated. `gh` is now authenticated
as `uset82` with `repo` scope, so it is ready to run.
