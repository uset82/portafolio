# `updates/` — post-v1 planning ledger

main prompt

thats why you need to go to my repos from github https://github.com/uset82?tab=repositories

and follow the idea

generate a detail project call , updates future task
so we can fix and update the portafolio site

1. we need to make smarter the cacm ai chat box , how? I was thinking to collect all my github projects information and data , projects from chatgpt inside my projects from chatgpt i have a loot of books that helps my projects to answer the way i want , and some other resources so the chat can actually answer basically all my knowlege and more
2. we need to create and organize small folder for each of my project and github inside portafolio brain so we can add the skills agents , books , pdfs , documemtations
3. we need to provide better architecture and design to my portafolio side i was thinking to actually when user go to portafolio can test my games , listen my music , see my videos creation . so this can help as well user no just see but maybe i can promotore some tools that i have been woriking with

you have to help me later how we can do this possible maybe creating and inside world like ready to play or link that pool my games that are in the other servers im using https://railway.com/ pro so maybe i can just upload everything in here 4 we need to make more modern my portafolio site you have created weird design around that need to get fixed more animations more smoke because my portafolio will show that i know webdesigning , creativity , figma design , adobe design , video design and creation you know what i mean?
this is for now

This folder holds the **next round of work** on the portfolio: the fixes and upgrades
requested after the first build. It does not replace `maintaskplan.md`; it extends it.

| File                                                                             | Purpose                                                                                                 |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `00-master-plan.md`                                                              | The plan. Blockers, decisions, six workstreams, sequencing, risks, done-criteria.                       |
| `01-brain-spec.md`                                                               | Concrete folder + schema specification for the "portfolio brain" (request 2).                           |
| `02-github-inventory.md`                                                         | All 61 repos at `github.com/uset82`, numbered 1–61 and classified. The corpus everything is built from. |
| **`DELEGATION-PROMPT.md`**                                                       | Reusable prompt for running four AI environments in parallel, plus why each rule exists.                |
| **`TASKBOARD.md`** ← **OPEN THIS ONE**                                           | **The whole project on one page.** Where we are, all 67 tasks with checkboxes, who owns each.           |
| `05-runbook.md`                                                                  | The exact commands and the text to paste into each agent.                                               |
| `03-multi-agent-plan.md`                                                         | How Codex, Grok, Claude, and Gemini work in parallel without colliding.                                 |
| `04-followup.md`                                                                 | **The tracker.** Where things _are_ — status board, blocked-on matrix, nudge list. Claude owns it.      |
| `tasks/CLAUDE-TASKS.md` · `CODEX-TASKS.md` · `GROK-TASKS.md` · `GEMINI-TASKS.md` | **One task plan per environment, with markable checkboxes.** 54 tasks split near-evenly.                |
| `agents/CLAUDE.md` · `CODEX.md` · `GROK.md` · `GEMINI.md`                        | How each environment works — lane, ownership, protocol. Give each agent **only its own**.               |
| `claims/`                                                                        | One claim file per agent, so task claims never conflict.                                                |

## Who does what

| Agent             | Tasks                       | Lane                                                                                   |
| ----------------- | --------------------------- | -------------------------------------------------------------------------------------- |
| **Claude**        | [15](tasks/CLAUDE-TASKS.md) | Plans · engineering architecture · **design, looks, animation** · review & integration |
| **Codex**         | [13](tasks/CODEX-TASKS.md)  | Brain pipeline (`B.*`) · CC AI retrieval (`A.1`–`A.9`)                                 |
| **Grok** (Cursor) | [13](tasks/GROK-TASKS.md)   | Arcade (`C.*`) · platform (`P.3`–`P.6`) · performance · error triage                   |
| **Gemini**        | [13](tasks/GEMINI-TASKS.md) | **Music & video setup** (`M.*`) · images · atmosphere · rights registers               |

**Lost? Open [`TASKBOARD.md`](TASKBOARD.md).** It is the whole project on one page — current
position, every task with a checkbox, and who owns it. Everything else is detail you open only
when a specific task needs it.

## Relationship to the existing plan

- `maintaskplan.md` stays the source of truth for **v1 launch** tasks (Phases 0–9) and for
  the `U.*` user-decision queue.
- `updates/00-master-plan.md` is the source of truth for **this round**. Its task IDs use
  new prefixes (`F.`, `A.`, `B.`, `C.`, `V.`, `P.`, `Q.`) so they never collide with the
  numeric IDs in `maintaskplan.md`.
- Where this plan resolves an open `U.*` item, it says so explicitly and the `U.*` checkbox
  is only flipped in `maintaskplan.md` with dated evidence, per `rules.md`.

## Conventions inherited from the repo

These are not optional here — `AGENTS.md` and `rules.md` still apply:

- Mark `[ ] ☐` → `[x] ☑` only after the acceptance condition is verified, one at a time.
- Every checked task gets a dated entry in the completion log with changed files + checks run.
- Blocked or partial work stays unchecked with a status note underneath it.
- New discovered work becomes a new unchecked task with its own ID; never widen an existing one.
- Never invent facts, metrics, dates, employers, or outcomes. Every public claim needs a
  source ID and a rights status.
- Warm natural palette is locked. No blue, cyan, violet, neon, or near-black substitutions.
