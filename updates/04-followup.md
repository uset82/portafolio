# Follow-up tracker — is everything going to plan?

**Owner: Claude.** Nobody else edits this file — it is the one place that reads across all four
lanes, and a shared status file edited by four agents would conflict on every write.

This answers the question *"is anyone stuck or missing something?"* without you having to open
four task plans and read 54 checkboxes.

> **This is not the step-by-step guide.** For "what do I do first, and what do I paste where",
> open [`05-runbook.md`](05-runbook.md). That file is the ordered sequence; this one is the
> status you check *between* its steps.

---

## 1. Status board

Updated at every checkpoint. `—` means not started.

_Last checkpoint: 2026-07-31._

| Agent | Lane | Wave | Active task | Branch | State |
| --- | --- | --- | --- | --- | --- |
| **Claude** | Plans · architecture · design & animation | 0 | `F.3` `F.5` next | `main` + `feat/design-system` | **`F.1` done** |
| **Codex** | Brain pipeline · CC AI retrieval | — | — | `feat/brain-pipeline` | worktree ready, not started |
| **Grok** | Arcade · platform · error triage | — | — | `feat/arcade` | worktree ready, not started |
| **Gemini** | Music · video · images · rights | — | — | `chore/media` | worktree ready, not started |

**Overall:** Wave 0 in progress.

- ✅ **`F.2`** — OpenRouter key revoked by Carlos. No user- or machine-scope
  `OPENROUTER_API_KEY` environment variable set, so the `U.14` stale-variable failure cannot recur.
- ✅ **`F.1`** — git reconnected. HEAD `58dd1d4`, 305 tracked files, working tree untouched.
  Real delta is 3 files, smaller than §3.1 predicted (line-ending normalization explained the
  difference). `site/.env.local` confirmed ignored.
- ✅ **Step 3** — four worktrees created as siblings under `PROYECTOS\`, all at `58dd1d4`.
  An earlier attempt placed three inside the repo as orphan branches; removed and recreated.
- ⬜ **`F.3` `F.5`** — secret scan and baseline capture still open.
- ⬜ **Nothing committed or pushed yet** — awaiting Carlos's authorization.

Agents can start once `F.5` records the baseline.

---

## 2. Blocked-on matrix

The fastest way to see who is waiting for what.

| Blocker | Owner | Blocks | Cost of leaving it |
| --- | --- | --- | --- |
| `F.1` git reconnect | Claude | **Everything** | Four agents on a folder with no version control is data loss with extra steps |
| `F.2` rotate OpenRouter key | **Carlos** | `A.10`, `A.12`, any deploy | Key was pasted into a chat transcript and is still live |
| `Q.2` books approach | **Carlos** | `B.9`, `library/` | Codex cannot build the ChatGPT pipeline without the tier decision |
| `Q.3` hero direction | **Carlos** | `V.2`, `V.3` | Claude's biggest design task cannot start |
| `Q.5` music rights | **Carlos** | `M.2`–`M.5`, `C.5` | Gemini can inventory but cannot publish a single track |
| `Q.4` arcade launch set | **Carlos** | `C.2`, `C.3` | Grok can measure builds but not choose what ships |
| `Q.6` production model | **Carlos** | `A.10`, `A.12` | CC AI cannot leave prototype mode |
| `Q.7` flagship projects | **Carlos** | `B.4` scope | Sync runs, but nobody knows which 8–12 matter |
| `Q.8` licensing | **Carlos** | — | 35 of 42 repos are all-rights-reserved by default |
| `Q.9` Mentora framing | **Resolved 2026-07-31** | Publishing `mentora` | College fork; Carlos largely developed/fixed it — frame as primary developer of the fork |

**Six of ten blockers are still yours** (`Q.9` resolved). Agent throughput is not the constraint
right now.

---

## 3. Checkpoint ritual

Claude runs this at the end of each working session, or when you ask *"where are we?"*

1. `git fetch origin && git branch -r` — which branches moved since last checkpoint?
2. Read the four `claims/*.md` files — what did each agent claim, and how long ago?
3. Read the four `tasks/*-TASKS.md` completion logs — what got checked off, with what evidence?
4. Diff claims against completions — **anything claimed but not completed for two checkpoints
   becomes a nudge.**
5. Update §1, §2, and §4 of this file.
6. Report to Carlos: what moved, what is stuck, what needs him.

---

## 4. Nudges — the "hey, you're missing this" list

Plain-language reminders, one line each. Claude writes them; the named agent clears them.
Format: `**[AGENT]** — what is missing → which task it belongs to`.

### Open

_None yet — no agent has started. Populated at the first checkpoint._

### Format examples

These are the shape, not real items:

- **[GEMINI]** — the Suno tracks still are not in the inventory; `/sound` cannot publish
  anything without them → `M.1`, then `M.2` for rights
- **[GEMINI]** — video inventory is missing; nothing is listed for `C.6` → `M.6`
- **[CODEX]** — `brain:check` is written but not wired into `pnpm test`, so CI is not enforcing
  it → `B.2` acceptance
- **[GROK]** — three of six game builds are measured; `Monkey-Tug-of-War` and `3Doodle` are
  still unknown, so hosting tier cannot be decided → `C.1`
- **[CLAUDE]** — `V.2` is claimed but `Q.3` is still unanswered; either chase the decision or
  release the claim
- **[CARLOS]** — `F.2` key rotation has been open since 2026-07-27; it blocks every deploy

### Cleared

_Move nudges here with a date once resolved, rather than deleting them — the pattern of what
repeatedly slips is useful information._

---

## 5. Health signals to watch

| Signal | Means | Do |
| --- | --- | --- |
| A branch red for more than one session | Something broke and nobody owns it | Grok `T.1` triage |
| Same nudge open at three checkpoints | The task is mis-scoped or genuinely blocked | Re-scope it or escalate to Carlos |
| An agent editing outside its ownership map | The next merge conflict, arriving early | Send the PR back |
| A PR with a metric, date, or outcome and no source ID | Fabrication | Reject — `AGENTS.md` |
| Review queue longer than three PRs | Integration is the bottleneck | Cut active agents, do not lower the review bar |
| Blue or violet appearing in any asset | Palette lock breach | `palette:check` should catch it; if it did not, fix the check too |

---

## 6. Task distribution — for reference

| Agent | Tasks | Lane |
| --- | --- | --- |
| [Claude](tasks/CLAUDE-TASKS.md) | 15 | `F.*` foundation · `V.*` design, motion, craft · `A.10` `A.12` `P.1` `P.2` architecture · review & integration |
| [Codex](tasks/CODEX-TASKS.md) | 13 | `B.*` brain pipeline · `A.1`–`A.9` CC AI retrieval |
| [Grok](tasks/GROK-TASKS.md) | 13 | `C.*` arcade · `P.3`–`P.6` platform · `V.9` performance · `T.1` error triage |
| [Gemini](tasks/GEMINI-TASKS.md) | 13 | `M.*` music & video · images · `V.6` atmosphere · `B.8` rights |

54 tasks, near-even. Claude carries one extra because the standing duties — shared-file broker,
serial integration, content-integrity review, and this tracker — are continuous rather than
checkbox work.
