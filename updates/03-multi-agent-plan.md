# Multi-agent execution plan — Codex · Grok · Claude · Gemini

Companion to [`00-master-plan.md`](00-master-plan.md). That file says **what** to build; this
one says **who builds it, where, and how they avoid destroying each other's work.**

**Status:** specification. Not started. Blocked on `F.1`.

---

## 0. Read this before delegating anything

**Your bottleneck right now is not coding speed. It is six unanswered decisions.**

`Q.2` (books), `Q.3` (hero direction), `Q.4` (arcade launch set), `Q.5` (music rights),
`Q.6` (production model), `Q.7` (flagship projects), `Q.8` (licensing).
`Q.1` and `Q.9` (Mentora framing) are resolved.
all sit in `00-master-plan.md` §4. Four agents blocked on the same unanswered question produce
work slower than one agent with answers — and they produce it in four incompatible directions,
which then costs you a merge.

So the honest ordering is:

1. **Answer `Q.2`, `Q.3`, `Q.5`.** Fifteen minutes of your time.
2. **Do `F.1` and `F.2`.** Git and the key. Serial, single-agent, no exceptions.
3. **Then** run four agents in parallel, which is what the rest of this document specifies.

Running step 3 before steps 1–2 is the fastest way to get four agents fighting over a repo that
has no version control to protect anyone. I have written the full parallel plan below because
you asked for it and it is genuinely useful — but it is only safe after the gate.

---

## 1. Hard prerequisite: `F.1` must be done, alone

**There is currently no `.git` in this folder.** Parallel agents without version control is not
a risky plan; it is data loss with extra steps. There is no branch to isolate on, no diff to
review, no revert when one agent overwrites another's file.

`F.1` is a single-agent, single-session task. Nobody else touches the repo while it runs.
Procedure is in `00-master-plan.md` §5.

`F.2` (rotate the exposed OpenRouter key) is **yours alone** — it is a credential action and no
agent should perform it.

---

## 2. Isolation model: one git worktree per agent

Four agents editing one folder will collide on save, regardless of how careful the task split
is. Git worktrees solve this exactly: one repository, one history, four independent checkouts
on four branches.

```bash
cd /c/Users/carlo/PROYECTOS/portafolio-main
git worktree add ../wt-codex   -b feat/brain-pipeline
git worktree add ../wt-grok    -b fix/design-hero
git worktree add ../wt-gemini  -b chore/media-optimization
```

Resulting layout:

```
C:\Users\carlo\PROYECTOS\
├── portafolio-main\      main        → Claude (planning, review, integration)
├── wt-codex\             feat/…      → Codex
├── wt-grok\              fix/…       → Grok in Cursor
└── wt-gemini\            chore/…     → Gemini
```

Each worktree needs its own install (`pnpm install` inside it). pnpm's content-addressable
store makes this cheap on disk — the packages are hard-linked, not copied.

**Why worktrees rather than four clones:** one `.git`, so branches and history are shared, and
`git worktree list` shows you the whole fleet at a glance. **Why not one folder with four
agents:** two agents writing `site/src/app/page.tsx` in the same second produces a file that
belongs to neither of them, and no tool will tell you it happened.

---

## 3. Ownership map — the actual anti-collision rule

Isolation stops *simultaneous* edits. It does not stop two agents both changing the same file
on two branches and creating a merge conflict later. That is solved by **disjoint ownership**.

| Path | Owner | Everyone else |
| --- | --- | --- |
| `updates/**`, `maintaskplan.md`, `AGENTS.md`, `rules.md`, `docs/decisions/**` | **Claude** | read-only |
| `site/src/app/**` *(except `app/arcade/**`)*, `site/src/components/**` *(except `components/arcade/**`)*, `site/src/styles/**`, `site/src/lib/three/**` | **Claude** — design lane | read-only |
| `brain/**`, `scripts/brain-*.ts`, `scripts/chatgpt-*.ts` | **Codex** | read-only |
| `site/src/lib/ai/**`, `site/src/content/generated/**`, `site/src/app/arcade/**`, `site/src/components/arcade/**`, `site/src/tests/cc-ai-*.test.ts` | **Codex** | read-only |
| `site/public/games/**`, build & deploy scripts, Railway service config, 3D asset optimization | **Grok** | read-only |
| `site/src/styles/**` | **Claude** decides, **Codex** implements from a delivered `SPEC.*` | read-only |
| `site/public/images/**`, `site/public/videos/**`, `site/public/audio/**`, `docs/assets/**`, `docs/content/*-inventory.json`, `docs/content/*-register.json` | **Gemini** | read-only |
| `site/package.json`, `site/src/content/schemas.ts`, `site/src/content/records.ts`, `Dockerfile`, `railway.json`, `.github/workflows/**` | **Claude, by request only** | request in PR body |

The `arcade/**` carve-outs are deliberate: Claude owns the app shell and design system, but the
arcade is Codex's build, so it gets its own subtree rather than a shared directory. Grok supplies
the game builds and measurements that feed it, and never touches `site/src/`.

> **Claude now writes feature code as well as refereeing.** That is a real tension — the
> integrator being a producer is how review standards slip. Two mitigations, both mandatory:
> design work goes on `feat/design-system` in `../wt-claude`, never straight to `main`; and if
> Claude's own branch ever blocks another agent's merge, **Claude's yields**.

That last row is the important one. Those six files are what everything touches — a new script
means a `package.json` edit, a new content field means a `schemas.ts` edit. If all four agents
edit them freely you get a conflict on every single merge. So: **you do not edit a shared file.
You write the change you need into your PR description, and Claude makes it on `main`.**

### Claim files, not a claim board

Each agent records what it is working on in **its own file** — `updates/claims/codex.md`,
`claims/grok.md`, `claims/gemini.md`, `claims/claude.md`. Separate files cannot conflict.
A single shared board would itself become the most contended file in the repo.

Format, one line per claim:

```
- A.1 · started 2026-08-01 · branch feat/brain-pipeline · status: in-progress
```

---

## 4. Integration protocol

Six rules. They are short because rules nobody remembers do not prevent anything.

1. **Never commit to `main`.** Branch and PR, always. `.codex/rules/portfolio.rules` already
   forbids `push --force`, `reset --hard`, and `clean -fd`; extend the same file with a
   `main`-push denial so it is enforced rather than remembered.
2. **Rebase before you start and before you push.** `git fetch origin && git rebase origin/main`.
3. **`pnpm verify` passes in your own worktree before you open a PR.** Format, zero-warning
   lint, strict TypeScript, all tests, plus the content, palette, boundary, asset, and
   immersive gates. A red branch is not a deliverable.
4. **One PR merges at a time.** Work is parallel; *integration is serial*. Claude reviews,
   merges, and tells the others to rebase. Four simultaneous merges into a repo with global
   gates is how you get a `main` that nobody can build.
5. **Touch only what you own.** Need something outside your lane? State it in the PR body. Do
   not reach across.
6. **Stay inside your task IDs.** Discovering adjacent work is normal — write it up as a new
   unchecked task with a new ID, per `rules.md`. Do not silently widen scope; that is how two
   agents end up building the same thing twice.

### When a conflict happens anyway

Do not resolve it inside the agent that hit it — it only sees one side. Push the branch as-is,
and Claude resolves on `main` with both sides visible. An agent guessing at the other agent's
intent is worse than a two-minute human-reviewed merge.

---

## 5. Who does what, and why

| | Strength you named | Gets | Tasks | Because |
| --- | --- | --- | --- | --- |
| **Claude** | Planning | Plans, architecture, **design / looks / animation**, review, integration, shared files | [15](tasks/CLAUDE-TASKS.md) | Holds whole-repo context and the content-integrity rules. Design is assigned here by your call — the visual system is an architecture problem (tokens, motion motifs, hierarchy) more than a coding one, and it lives in the same files as the `U.19`/`U.20` decisions Claude already tracks. |
| **Codex** | Coding | Workstream **B** (brain pipeline) and **A** (CC AI retrieval) | [13](tasks/CODEX-TASKS.md) | Both are *greenfield*: new files, new directories, defined schemas, testable acceptance criteria. Near-zero conflict surface. Codex already has `.codex/rules/portfolio.rules` and `$portfolio-delivery` wired up in this repo. |
| **Grok** (Cursor) | Hard work, fixing errors | Workstream **C** (arcade), **P** (platform), performance, error triage | [13](tasks/GROK-TASKS.md) | The genuinely hard work: building six games across five toolchains on Windows to measure real output, wiring sandboxed play shells, Railway services, and fixing whatever goes red in any lane. Interactive, messy, environment-specific — the right shape for hands-on IDE iteration, the wrong shape for a spec-and-forget agent. |
| **Gemini** | Images, small tasks | **Music and video setup**, images, posters, alt text, rights registers | [13](tasks/GEMINI-TASKS.md) | Bounded, visual, media-shaped. Music setup joins this lane by your call: Suno/Udio tracks, per-track rights, audio prep, waveform art, captions — all asset production with clear per-item acceptance, touching only `site/public/**` and `docs/`. |

---

## 6. Wave schedule

Dependencies are real. These waves are not suggestions — running Wave 2 work during Wave 1
produces merge conflicts on files that do not exist yet.

### Wave 0 — serial, nobody else runs (≈1 session)

| Task | Who |
| --- | --- |
| `F.1` reconnect git, verify the §3.1 delta, push a branch | Claude or you, alone |
| `F.2` rotate the OpenRouter key | **You only** — credential action |
| `F.3` secret scan · `F.5` capture baseline (build size, Lighthouse, verify) | Claude |
| Answer `Q.2`, `Q.3`, `Q.5` | **You** |
| Create the three worktrees | You |

**Gate:** `git status` is clean, a branch pushes, `pnpm verify` is green, baseline recorded.

### Wave 1 — four agents, fully parallel

| Agent | Tasks | Touches |
| --- | --- | --- |
| **Claude** | `F.4` cross-link ledgers · `V.1` close `U.19` decisions 1–3 · review Wave 1 PRs | `updates/**`, `site/src/app/**`, `site/src/components/**` |
| **Codex** | `B.1` `B.2` — brain skeleton, `project.json` zod schema, `brain:check` | `brain/**`, `scripts/**` (new files only) |
| **Grok** | `C.1` build and measure every arcade candidate (5 toolchains) | game repos, measurement only |
| **Gemini** | `M.1` track inventory · `M.7` image audit + poster conversion | `site/public/images/**`, `docs/content/**` |

No two rows share a directory. That is the design.

### Wave 2 — parallel, after Wave 1 merges

| Agent | Tasks |
| --- | --- |
| **Claude** | `V.2` `V.3` hero direction — **needs `Q.3`** · `A.1` retrieval spec for Codex · Mentora copy uses resolved `Q.9` framing |
| **Codex** | `B.4` GitHub sync (42 repos, fork/empty filtered) · `B.6` build bridge + leak test |
| **Grok** | `C.2` `/arcade` route · `C.4` mobile honesty states |
| **Gemini** | `M.2` per-track rights — **needs `Q.5`** · `M.8` arcade posters · `M.9` alt-text pass |

### Wave 3

| Agent | Tasks |
| --- | --- |
| **Claude** | `V.4` type and layout ramp · `V.5` three motion motifs · `A.10` model policy · `P.1`–`P.2` |
| **Codex** | `A.1` `A.2` chunking + lexical retrieval · `A.5` evaluation set |
| **Grok** | `C.3` play shell · `C.8` large 3D asset optimization · `V.9` performance budgets |
| **Gemini** | `M.3` audio prep · `M.4` per-track visuals · `M.5` captions · `V.6` atmosphere plates — **warm palette only** |

### Wave 4

| Agent | Tasks |
| --- | --- |
| **Claude** | `V.7` `/studio` craft evidence · `V.8` micro-interactions · `V.10` a11y · `A.12` activation gate |
| **Codex** | `A.6` streaming · `A.9` durable rate limiting · `B.9` ChatGPT pipeline · `B.7` project skills |
| **Grok** | `C.7` tool surface · `C.9` optional 3D hub · `P.3`–`P.6` platform hardening · `T.1` triage |
| **Gemini** | `C.5` `/sound` content set · `C.6` video assets · `M.6` video rights · `B.8` rights register |

---

## 7. Cross-cutting rules every agent gets

These come from `AGENTS.md` and `rules.md` and are not negotiable per-agent:

- **Never invent** facts, metrics, dates, employers, collaborators, outcomes, or ownership.
  Every public claim needs a source ID and a rights status.
- **Never upgrade a project's status.** `pinaculo` is a concept. A README does not change that.
- **Palette is locked.** Warm natural family only — no blue, cyan, violet, neon, or near-black.
  `palette:check` runs in CI and will catch you, but do not make it have to.
- **Motion needs a complete `prefers-reduced-motion` path**, not a disabled one.
- **No new production dependency** without justification in the PR body. `rules.md` requires it.
- **Secrets never enter git.** `site/.env.local` stays ignored, forever.
- **Do not deploy, merge, force-push, rewrite history, or delete branches** without Carlos's
  explicit authorization.

---

## 8. Per-agent briefs

Copy-pasteable starting prompts, one per environment:

| File | Environment |
| --- | --- |
| [`agents/CODEX.md`](agents/CODEX.md) | Codex |
| [`agents/GROK.md`](agents/GROK.md) | Grok in Cursor |
| [`agents/GEMINI.md`](agents/GEMINI.md) | Gemini |
| [`agents/CLAUDE.md`](agents/CLAUDE.md) | Claude |

Each brief states the agent's lane, its forbidden paths, its current wave tasks, and its
acceptance criteria. Give an agent its brief and nothing else — an agent that reads all four
briefs will start "helpfully" fixing another agent's lane.

---

## 9. Honest limits of this arrangement

- **Four agents is probably one or two too many for this repo.** The site is ~150 source files
  with global verify gates. Codex plus Grok covers the real parallelism; Gemini's lane is
  genuinely small; Claude is overhead that pays for itself only because integration and content
  integrity actually need a single owner.
- **Integration is serial and it is the throughput ceiling.** Four agents feeding one review
  queue means the queue sets the pace, not the agents.
- **Every agent restart re-derives context**, which costs time and money. The briefs in
  `agents/` exist to shorten that, not to remove it.
- **Grok's lane is the one that will slip.** `V.2`/`V.3` depend on a subjective judgement about
  the hero, and `C.1` depends on five toolchains building correctly on Windows. Plan for it.
- If you want the single highest-throughput setup rather than the most parallel one: answer the
  decisions, run **Codex on the brain pipeline** and **Claude on the design fixes**, and add
  Grok and Gemini once those two are producing merged PRs.
