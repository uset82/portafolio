# Runbook — start here, in this order

**This is the file you open first.** It tells you what to do, in what order, and exactly what to
paste into each environment.

| File | Answers |
| --- | --- |
| **`05-runbook.md`** ← you are here | **"What do I do first?"** — ordered steps, copy-paste blocks |
| [`04-followup.md`](04-followup.md) | "Where are we?" — status board, who is stuck, nudges |
| [`00-master-plan.md`](00-master-plan.md) | "What is the whole scope?" — 54 tasks, reasoning |
| [`tasks/*.md`](tasks/) | "What does *this* agent do?" — one plan per environment |

Do not skip steps. The order exists because of real dependencies — running Step 5 before
Step 2 puts four agents on a repo with no version control.

---

## STEP 0 — Answer three questions (15 minutes, only you can do this)

Nothing below matters if these stay open. Answer them in chat, or write them into
`00-master-plan.md` §4.

**Q.3 — Hero direction.** The homepage currently shows a static poster standing in for a 3D
world, with cards positioned against a *painted* image. That is the "weird design". Pick one:

- **(a) Cinematic video hero** — commit to `robot-water-sequence.mp4`, retire the canvas.
  *Recommended.* Fastest, and you already have the asset.
- **(b) Reframed interior 3D** — author a real interior camera, make the robot focal, re-anchor
  the cards. Higher cost, and it is the thing you already rejected once.
- **(c) Full-bleed editorial** — type and real project media carry the hero, no world.

**Q.5 — Music rights.** For each track you want on `/sound`: is it entirely yours? Which tool
made it, and on which plan tier? Any samples, stock loops, or collaborators? Gemini cannot
publish a single track without this.

**Q.2 — Books.** Confirm the two-tier approach: your distilled notes in your own words go
public and citable; the raw PDFs stay in a private repo and are never indexed. Reasoning in
[`01-brain-spec.md`](01-brain-spec.md) §5.

> **Checkpoint before moving on:** all three answered.

---

## STEP 1 — Rotate the OpenRouter key (only you — it is a credential)

The current key was pasted into a chat transcript on 2026-07-27 and is still live.

1. Revoke it in the OpenRouter dashboard, create a new one.
2. Put the new key **only** in `site/.env.local` (gitignored) and later in Railway's secret store.
3. Check for a stale Windows user-level variable — this already cost a full debugging session:

```powershell
[Environment]::GetEnvironmentVariable('OPENROUTER_API_KEY','User')
```

If it returns anything, clear it and reopen your terminal. Windows environment variables win
over `.env.local`, because Next.js reads `process.env` first.

> **Checkpoint:** old key returns 401, new key works, nothing is in git.

---

## STEP 2 — Tell Claude to reconnect git (alone — no other agent runs)

Paste into **Claude**:

```
Run F.1 from updates/tasks/CLAUDE-TASKS.md. Reconnect git in place.
Stop and show me the diff if git status does not match §3.1 exactly.
```

Claude runs `git init` → `remote add origin` → `fetch` → `reset --mixed FETCH_HEAD`. Nothing is
overwritten. Expected result: 6 modified files, 1 deleted (`cc-mark.tsx`), known untracked.
**Anything else and it stops rather than committing.**

Then let it finish `F.3` (secret scan), `F.5` (baseline capture), `F.4` (cross-link ledgers).

> **Checkpoint:** `git status` is clean and meaningful, a branch pushes, `pnpm verify` is green,
> baseline numbers are recorded. **Do not start Step 3 before this passes.**

---

## STEP 3 — Create the worktrees (you, one time)

> **Two traps here, both of which already caught us once.**
>
> 1. **Run these from `portafolio-main`, not from `updates/`.** `../wt-claude` is relative — from
>    `updates/` it creates the worktree *inside* the repo, where it shows up as untracked noise
>    and gets scanned by pnpm, eslint, and `next build`.
> 2. **Do STEP 2 first.** If `main` has no commit yet, git prints
>    `No possible source branch, inferring '--orphan'` and silently gives you four **empty**
>    worktrees with no files. If you see that message, stop — the branches are orphans.

Your terminal is PowerShell, so use Windows paths (`cd /c/Users/...` fails with
`Cannot find path 'C:\c\Users\...'`):

```powershell
cd C:\Users\carlo\PROYECTOS\portafolio-main
git worktree add ..\wt-claude -b feat/design-system
git worktree add ..\wt-codex  -b feat/brain-pipeline
git worktree add ..\wt-grok   -b feat/arcade
git worktree add ..\wt-gemini -b chore/media
```

Then in each new folder, once: `pnpm install`.

> **Checkpoint:** `git worktree list` shows five rows — `portafolio-main` plus four **siblings**
> under `PROYECTOS\`, every one at the same commit, none showing `0000000`.

**If you got it wrong**, recovery is zero-loss as long as the worktrees are empty:

```powershell
git worktree remove wt-claude; git worktree remove wt-codex; git worktree remove wt-grok
git worktree prune
```

then re-run the block above.

---

## STEP 4 — Start the agents (paste one block per environment)

Order does not matter here — these four run in parallel. Give each agent **only its own** block.
An agent that reads another's plan will start "helpfully" fixing that lane and cause conflicts.

### → Codex

```
Read updates/agents/CODEX.md then updates/tasks/CODEX-TASKS.md.
Work in ../wt-codex on feat/brain-pipeline.
Start with B.1 and B.2 only. One task per PR.
Do not edit files outside your ownership list — request them in the PR body instead.
```

### → Grok (in Cursor)

```
Read updates/agents/GROK.md then updates/tasks/GROK-TASKS.md.
Work in ../wt-grok on feat/arcade.
Start with C.1 only: build each arcade candidate and measure its BUILT output size.
Deliver the table described in C.1. Do not build the /arcade route yet.
```

### → Gemini

```
Read updates/agents/GEMINI.md then updates/tasks/GEMINI-TASKS.md.
Work in ../wt-gemini on chore/media.
Start with M.1 (track inventory) and M.7 (image audit + poster conversion).
Do not publish any track — M.2 onward is blocked until rights are confirmed.
```

### → Claude

```
Read updates/tasks/CLAUDE-TASKS.md. Work in ../wt-claude on feat/design-system.
Start V.1 — close U.19 decisions 1-3.
Review incoming PRs before doing your own build work.
```

> **Checkpoint:** each agent has claimed its task in `claims/<agent>.md`.

---

## STEP 5 — The loop (repeat until done)

This is the rhythm. It does not change.

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

### To get a checkpoint, paste into Claude:

```
Checkpoint. Update updates/04-followup.md and tell me:
what moved, what is stuck, what needs me.
```

Claude fetches branches, reads the four claim files and the four completion logs, diffs claims
against completions, and writes nudges for anything claimed but not finished across two
checkpoints. You get back three short lists.

### To chase one agent, paste into Claude:

```
What is Gemini missing?
```

Claude reads `tasks/GEMINI-TASKS.md` and `claims/gemini.md` and gives you the nudge —
*"Gemini still has not added the Suno tracks to the inventory; `/sound` cannot publish anything
without them → M.1, then M.2 for rights."* You forward that line to Gemini.

**Run a checkpoint at the end of every working session.** It is two minutes and it is the only
thing that stops a lane from silently stalling for a week.

---

## Wave order — what unlocks what

Do not let an agent run ahead. These dependencies are real.

| Wave | Claude | Codex | Grok | Gemini |
| --- | --- | --- | --- | --- |
| **0** | `F.1` `F.3` `F.4` `F.5` | — | — | — |
| **1** | `V.1` | `B.1` `B.2` | `C.1` | `M.1` `M.7` |
| **2** | `V.2` `V.3` *(needs Q.3)* | `B.4` `B.6` | `C.2` `C.4` | `M.2` *(needs Q.5)* `M.8` `M.9` |
| **3** | `V.4` `V.5` `A.10` `P.1` `P.2` | `A.1` `A.2` `A.5` | `C.3` `C.8` `V.9` | `M.3` `M.4` `M.5` `V.6` |
| **4** | `V.7` `V.8` `V.10` `A.12` | `A.6` `A.9` `B.9` `B.7` | `C.7` `C.9` `P.3`–`P.6` `T.1` | `C.5` `C.6` `M.6` `B.8` |

---

## If something goes wrong

| Symptom | Do this |
| --- | --- |
| Two agents edited the same file | Both push as-is. Claude resolves on `main`. Never let an agent guess at another's intent. |
| A branch is red and nobody owns it | Grok, task `T.1`. Fix on the **owning agent's** branch, not by editing their files. |
| An agent edited outside its lane | Send the PR back. This is the leading indicator of the next conflict. |
| A PR contains a metric or date with no source | Reject it — it is fabricated. `AGENTS.md` forbids it. |
| Review queue is longer than 3 PRs | Integration is the bottleneck. Pause an agent; do not lower the review bar. |
| Blue or violet appeared in an asset | Palette breach. `palette:check` should fail; if it did not, fix the check too. |
| An agent is stuck on a decision | It goes on your list in `04-followup.md` §2, not into a guess. |

---

## If you only want to run two agents

Four is arguably one or two too many for a repo this size, and integration is serial anyway.
The highest-throughput minimum:

1. Answer Step 0.
2. Steps 1–3 as written.
3. Run **Codex** on the brain pipeline and **Claude** on the design fixes.
4. Add Grok and Gemini once those two are producing merged PRs.

You lose nothing except parallelism you are not yet bottlenecked on.
