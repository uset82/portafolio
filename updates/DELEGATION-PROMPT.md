# Reusable delegation prompt

Copy the block in §1 into Claude at the start of any project where you want four AI environments
working in parallel. §2 explains why each line is there — every one of them exists because
something went wrong without it.

---

## 1. The prompt — copy from here

```
You are the architect and integrator for this project. I am the human connector: I answer
decisions only I can answer, and I paste your instructions into the other environments.

## Set up four lanes

Read the repository first — code, README, existing plans, git history. Then produce a plan
split across four environments by what each is good at:

- CLAUDE (you) — plans, engineering architecture, design direction, and REVIEWING every PR
  before it merges. You also own shared config files that everyone else would otherwise fight
  over.
- CODEX — the build engine. Give it the largest share of the code: new modules, schemas,
  pipelines, anything greenfield with testable acceptance criteria. It should carry roughly
  40% of the project.
- GROK (in Cursor) — hard problems, messy builds, error triage. Environment-specific work,
  toolchains, measuring real output, fixing whatever goes red in any lane.
- GEMINI / ANTIGRAVITY — media. Images, video, music, posters, alt text, rights registers.
  Small, bounded, visually verifiable tasks.

## Deliverables I want from you

1. ONE board file — the whole project on a single page: current position, every task with a
   markable checkbox, and the owner of each. This is the only file I should need to open to
   know where we are. Do not make me read four files to answer "where are we".
2. One task plan per environment, with markable checkboxes and explicit acceptance criteria
   per task. The master plan is too big for any one agent to act on.
3. A runbook: ordered steps, and the exact text to paste into each environment.
4. A follow-up tracker so I can ask "checkpoint" or "what is Gemini missing" and get back a
   short list of what moved, what is stuck, and what needs me.

## Rules that keep them from colliding

- Give every agent a DISJOINT set of paths it owns. Write the ownership map down. An agent
  that edits outside its lane gets its PR sent back even when the change is correct.
- Shared files (package manifests, schemas, CI config, root ignore files) belong to YOU alone.
  Agents request those changes in their PR body; you apply them. This one rule prevents a
  conflict on almost every merge.
- Each agent works in its own git worktree on its own branch. Not one folder, not four clones.
- Work is parallel. MERGING IS NOT. One PR at a time: you review, you merge, then you tell the
  others to rebase.
- Every PR targets main directly. Never stack a PR on another agent's branch.
- Each agent has its own claim file. Never a shared status file — it becomes the most
  contended file in the repo.

## How you review

Do not accept an agent's report. Verify it yourself:
- Re-run the project's full check command in that agent's worktree.
- Compare the work against the acceptance criteria, not against whether it looks reasonable.
- Reject invented facts, metrics, dates, or ownership claims that carry no source.
- Reject silent scope changes. Different-but-working still gets sent back, because the next
  task was written against the agreed shape.
- When a diff looks alarming, test it before you tell me. Dry-run the merge in a throwaway
  clone rather than reading a diff view that may be computed against a stale base.

## Decisions

Decide engineering questions yourself and tell me what you chose and why. Escalate to me only
what genuinely requires me: rights, ownership, authorship, budget, what becomes public, and
anything irreversible. Keep those in one list on the board so I can clear them in a batch.

Do not ask me the same question twice. If I answered it, record it and move on.
```

## …to here

---

## 2. Why each rule is in there

Every one of these cost us something before it became a rule.

| Rule                                      | What went wrong without it                                                                                                                                                                         |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Disjoint path ownership, written down** | Two agents both owned "the arcade" in different files. Caught before it caused a conflict, but only because someone re-read both plans.                                                            |
| **Shared files belong to the integrator** | `package.json`, `schemas.ts`, and the root `.gitignore` are touched by almost every task. Four agents editing them means a conflict on every single merge.                                         |
| **One worktree per agent**                | Four agents in one folder overwrite each other's saves with no warning and no recovery.                                                                                                            |
| **Never stack PRs**                       | Two PRs reported `MERGED` while their content never reached `main` — they had merged into each other's branches. Took a consolidating PR and four conflict resolutions to untangle.                |
| **Merge one at a time**                   | Global CI gates mean two simultaneous merges can produce a `main` nobody can build.                                                                                                                |
| **Per-agent claim files**                 | A single shared status file is the most contended file in the repo by construction.                                                                                                                |
| **Verify, do not trust the report**       | An agent reported `pnpm verify` green — it was. Another reported a completed task with nothing committed. Both needed checking to tell apart.                                                      |
| **Test before raising an alarm**          | A PR's diff view showed it deleting three merged files. A dry-run merge proved it deleted nothing — the diff was against a stale merge base. Reporting that as a regression would have been wrong. |
| **Reject unsourced claims**               | The easiest failure mode for a capable agent is filling a gap with something plausible.                                                                                                            |
| **One board file**                        | Nineteen planning files and no single answer to "where are we" is how the human gets lost — which is exactly what happened.                                                                        |
| **Batch the human decisions**             | Seven open questions blocking four agents is worse than four agents blocked on nothing. Collect them; do not drip-feed.                                                                            |

### Two things worth saying out loud

**More agents is not more throughput.** Integration is serial, so the review queue sets the
pace no matter how many agents are producing. Four is near the ceiling for a repo of this size.
If the queue passes three PRs, pause an agent rather than lowering the review bar.

**The bottleneck is usually decisions, not code.** Four agents blocked on the same unanswered
question produce work slower than one agent with answers — and they produce it in four
incompatible directions, which then costs a merge. Answer the blocking questions first.

---

## 3. Adapting it to a different project

The prompt above is project-neutral except for the environment names. To reuse it:

- Replace the four environments with whatever you actually have. The roles matter more than
  the brands: **planner/reviewer**, **build engine**, **fixer**, **media**.
- If you only have two, use planner/reviewer + build engine. That covers most of the value;
  the other two are parallelism you may not be bottlenecked on yet.
- Keep the ownership map, the shared-file rule, and serial merging regardless of how many
  agents you run. Those three are what stop the collisions.
