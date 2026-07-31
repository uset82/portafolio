# Runbook — what to do next

| File | Answers |
| --- | --- |
| [`TASKBOARD.md`](TASKBOARD.md) | "Where are we, and who owns what?" — the whole project, one page |
| **`05-runbook.md`** ← you are here | **"What do I paste, and where?"** |
| [`04-followup.md`](04-followup.md) | "Is anyone stuck?" — status board and nudges |
| [`tasks/*.md`](tasks/) | "What does *this* agent do?" — one plan per environment |

---

## ▶ YOU ARE HERE — Step 4. Everything before it is done.

Setup is finished and verified. **Skip to the paste blocks below.**

<details>
<summary><b>Steps 0–3.5 — completed 2026-07-31</b> (click only if something broke and you need the recovery procedure)</summary>

| Step | Status |
| --- | --- |
| **0** — Answer the blocking questions | ☑ `Q.3` video hero (3D retired) · `Q.5` music is yours, tips welcome · `Q.4` all games ship · `Q.6` zero budget · `Q.8` 37 unlicensed repos listed · `Q.9` fork framing verified. Full record in [`06-decisions.md`](06-decisions.md). **Still open: `Q.10` books, `Q.11` flagships, `Q.12` MIT.** |
| **1** — Rotate the OpenRouter key | ☑ Revoked by Carlos. No stale user- or machine-scope `OPENROUTER_API_KEY` env var — the `U.14` failure cannot recur. |
| **2** — Reconnect git | ☑ HEAD `58dd1d4`, 305 files, working tree untouched. Real delta was 3 files, *smaller* than predicted — line-ending normalization explained the difference. |
| **3** — Create worktrees | ☑ Four siblings under `PROYECTOS\`. First attempt put three inside the repo as orphan branches; removed and recreated at zero loss. |
| **3.5** — Pre-launch check | ☑ All four worktrees fast-forwarded to `fdcab68` so they contain `updates/`; `pnpm install` run in all four; `tsc --noEmit` smoke-tested in `wt-codex`. |

**If you ever need to rebuild the worktrees** — run from `portafolio-main`, never from `updates/`,
and only after `main` has a commit (otherwise git silently creates empty `--orphan` branches):

```powershell
cd C:\Users\carlo\PROYECTOS\portafolio-main
git worktree add ..\wt-claude -b feat/design-system
git worktree add ..\wt-codex  -b feat/brain-pipeline
git worktree add ..\wt-grok   -b feat/arcade
git worktree add ..\wt-gemini -b chore/media
```

Then in each: `pnpm install`, and `git merge --ff-only chore/planning-ledger` so it has the plans.

</details>

---

## STEP 4 — Launch. Paste one block per environment.

These four run in parallel. **Give each agent only its own block** — an agent that reads
another's plan starts "helpfully" fixing that lane, which is the exact conflict this avoids.

### → Codex

```
Read updates/agents/CODEX.md then updates/tasks/CODEX-TASKS.md.
Work in ../wt-codex on branch feat/brain-pipeline.

Start with B.0, then B.1, B.2, B.3. One task per PR, in that order.
gh is authenticated as uset82 with repo scope, so B.0 can create the
private repository now.

Do not edit files outside your ownership list; request them in the PR
body instead. pnpm verify must be green before you open a PR.
```

### → Claude

```
Read updates/tasks/CLAUDE-TASKS.md.
Work in ../wt-claude on branch feat/design-system.

Start with SPEC.1 (design system spec) - Codex's V.4 and V.5 are
blocked until it lands, so it is on the critical path. Then V.1.
Review any incoming PR before doing your own build work.
```

### → Grok (in Cursor)

```
Read updates/agents/GROK.md then updates/tasks/GROK-TASKS.md.
Work in ../wt-grok on branch feat/arcade.

Start with C.1 only: clone each arcade candidate, build it, and record
its BUILT output size - repo size is not a proxy. Deliver the table in
C.1 as data in your PR, not as code.
Do not build the /arcade route - that is Codex's C.2, from Claude's spec.
```

### → Gemini / Antigravity

```
Read updates/agents/GEMINI.md then updates/tasks/GEMINI-TASKS.md.
Work in ../wt-gemini on branch chore/media.

Start with M.7 (image audit + convert the 2.5 MB poster to AVIF/WebP)
- it needs nothing from anyone and is a real performance win.

M.12 and M.13 need Carlos to send the Suno and YouTube links first.
Do not publish any track: M.2 onward is blocked until M.11 confirms
which Suno plan tier each track was generated under.
```

> **Checkpoint:** each agent has claimed its task in `claims/<agent>.md`.

### What you still owe

- ☑ ~~`gh auth login`~~ — done 2026-07-31, `uset82`, scopes `gist read:org repo workflow`.
  `B.0` is unblocked.
- ⬜ **Send the Suno + YouTube links** → Gemini `M.12`/`M.13`. It has `M.7` meanwhile, so it is
  not idle.
- ⬜ **`Q.13`** — 7 **private** repos surfaced once auth landed and were **not** in the 61-repo
  public inventory: `marcoloco`, `ecco8-circular-luxe`, `rentme`, `ask-bank-ai`, `masterHVL`,
  `diagram-pixel-perfect-clone`, `tragatelo-food-facts`. Should any of them be public, enter the
  brain, or stay private and invisible to CC AI?
- ⬜ `Q.10` books · `Q.11` flagships · `Q.12` MIT licensing

---

## STEP 5 — The loop

```
   ┌──────────────────────────────────────────────┐
   │  1. Agents work in their own worktrees       │
   │  2. Agent opens a PR (pnpm verify green)     │
   │  3. Claude reviews → merges ONE at a time    │
   │  4. Claude tells the others to rebase        │
   │  5. You ask Claude for a checkpoint          │
   │  6. Claude updates 04-followup.md + nudges   │
   │  7. You clear anything on your list          │
   └───────────────────┬──────────────────────────┘
                       └──► back to 1
```

**Checkpoint** — paste into Claude:

```
Checkpoint. Update updates/04-followup.md and tell me:
what moved, what is stuck, what needs me.
```

**Chase one agent** — paste into Claude:

```
What is Gemini missing?
```

You get back the nudge line to forward, e.g. *"Gemini still has not sent the Suno links, so
`/sound` cannot publish → M.12, then M.11 for the plan tier."*

Run a checkpoint at the end of every session. Two minutes, and it is the only thing that stops a
lane stalling silently for a week.

---

## Wave order

Authoritative version lives in [`TASKBOARD.md`](TASKBOARD.md) — this is the summary.

| Wave | Claude | Codex | Grok | Gemini |
| --- | --- | --- | --- | --- |
| **0** ☑ | `F.1` `F.3` `F.4` `F.5` `F.5b` `A.0` `P.7` | — | — | — |
| **1** | `SPEC.1` `V.1` | `B.1` `B.2` `B.3` | `C.1` | `M.7` `M.12` `M.13` |
| **2** | `V.2` `V.3` `SPEC.3` | `B.4` `B.6` `B.7.1` `B.7.2` | `V.12` `C.8` | `M.11` `M.14` `M.8` |
| **3** | `SPEC.2` `A.10` `P.1` `P.2` | `A.1` `A.2` `A.4` `A.5` `B.7.3`–`B.7.11` | `C.10` `V.9` `P.3` | `M.1`–`M.5` `M.15` `V.6` |
| **4** | `V.10` `A.12` `VER.4` | `A.6` `A.9` `A.13` `V.4` `V.5` `V.7` `V.8` `V.13` `C.2`–`C.4` | `C.7` `P.4`–`P.6` `T.1` | `C.5` `C.6` `M.16` `B.8` |

---

## If something goes wrong

| Symptom | Do this |
| --- | --- |
| Agent says it cannot find `updates/` | Its worktree is behind. `git -C ..\wt-<agent> merge --ff-only chore/planning-ledger` |
| `pnpm verify` fails instantly with missing modules | `pnpm install` was never run in that worktree — they do not share `node_modules` |
| Two agents edited the same file | Both push as-is; Claude resolves. Never let an agent guess at another's intent. |
| A branch is red and nobody owns it | Grok, task `T.1`. Fix on the **owning agent's** branch, not by editing their files. |
| An agent edited outside its lane | Send the PR back. Leading indicator of the next conflict. |
| A PR has a metric or date with no source | Reject it — fabricated. `AGENTS.md` forbids it. |
| Review queue longer than 3 PRs | Integration is the bottleneck. Pause an agent; do not lower the review bar. |
| Blue or violet in an asset | Palette breach. `palette:check` should fail; if it did not, fix the check too. |

---

## If four agents turns out to be too many

Integration is serial, so the review queue sets the pace regardless. The minimum that loses
nothing: run **Codex** on the brain pipeline and **Claude** on specs and design, then add Grok
and Gemini once those two are producing merged PRs.
