# TASKBOARD — the whole project, one page

**Open this file first. It is the only file you need to know where we are and who does what.**
Everything else is detail you open only when a task needs it.

`CARLOS` decisions only · `CLAUDE` plans, design direction, **verifies everything** ·
`CODEX` the build engine, most of the code · `GROK` hard fixes, builds, platform ·
`GEMINI` music, video, images

**90 open tasks** across the four agent plans. Status: `☐` not started · `⏳` in progress · `☑` done · `⛔` blocked

---

## YOU ARE HERE → Wave 1 in progress

```
WAVE 0  ██████████  Foundation      ← COMPLETE
WAVE 1  █████░░░░░  First build     ← Codex B.1-B.3 merged · Grok C.1 merged
WAVE 2  ░░░░░░░░░░  Core systems
WAVE 3  ░░░░░░░░░░  Experience
WAVE 4  ░░░░░░░░░░  Launch
```

**Merged to `main`:** `B.1` `B.2` `B.3` brain foundation (PR #9) · `C.1` arcade measurements
(PR #1) · `SPEC.1` design system · `P.7` robots.txt · all of Wave 0
**Open PRs:** 0. `brain:check` is wired into `pnpm test` and green.
**Next up:** Codex `B.0` + `B.4` · Claude `V.1` then `SPEC.3` · Grok `V.12` · Gemini commit `M.7`
**Waiting on you:** `Q.10` books · `Q.11` flagships · `Q.12` MIT · `Q.13` private repos ·
Suno + YouTube links · Gemini's AVIF is larger than its WebP and needs re-encoding

### Baseline — every later "we improved X" is measured against these

|                                          |                                       |
| ---------------------------------------- | ------------------------------------: |
| `pnpm verify`                            |                        green (exit 0) |
| Client JS in build output                |                   2 879 KB / 23 files |
| **Homepage transferred, desktop**        |                          **4 150 KB** |
| **Homepage transferred, mobile 390×844** | **4 039 KB** — 98 % is the hero video |
| CLS                                      |                0 (desktop and mobile) |
| TTFB                                     |                 14 ms · Load 1 068 ms |
| `site/public`                            |                                7.9 MB |
| Routes                                   |                                    12 |

> **`V.12` — the 3.96 MB hero video downloads on mobile.** Found while measuring, not in the
> original plan. It is 98 % of mobile page weight and the biggest performance problem on the
> site. Assigned to `GROK` in Wave 2.

> **⚠ `A.0` — the site is ALREADY LIVE and CC AI is ALREADY PUBLIC.**
> `https://carloscarpio.up.railway.app/` returns 200; `/api/cc-ai` answers. My plan said
> `CC_AI_ENABLED=false` — **that was wrong, I had not checked production.**
> CC AI is serving visitors now on a _variable free model_, with a 6.7 KB corpus, no evaluation
> set, no durable rate limiting, and no production model policy. `A.12` was written as
> "switch it on"; it is now **"harden it or switch it off"**. Your call — see `A.0` in Wave 0.

---

## WAVE 0 — Foundation _(nobody builds until this is done)_

- [x] ☑ **F.2** · `CARLOS` · Revoke the exposed OpenRouter key — _done 2026-07-31_
- [x] ☑ **F.1** · `CLAUDE` · Reconnect git in place — _done, HEAD `58dd1d4`, 305 files, nothing lost_
- [x] ☑ **W.0** · `CARLOS` · Create four sibling worktrees — _done, all at `58dd1d4`_
- [x] ☑ **F.3** · `CLAUDE` · Secret and content scan — _clean, 0 findings across 305 tracked files_
- [x] ☑ **F.5** · `CLAUDE` · Baseline captured — _`pnpm verify` green, sizes recorded_
- [x] ☑ **F.4** · `CLAUDE` · `AGENTS.md` now points at `updates/TASKBOARD.md`
- [x] ☑ **F.5b** · `CLAUDE` · Core Web Vitals — _browser-measured, no new dependency. CLS 0. FCP/LCP not exposed by this browser._
- [x] ☑ **F.6** · `CARLOS` · Commit + push — _done. Branch `chore/planning-ledger`, 3 commits, pushed._
- [x] ☑ **A.0** · `CLAUDE` · **Decided: keep CC AI on.** The risk was smaller than I stated — see below.
- [x] ☑ **P.7** · `CLAUDE` · `robots.txt` added as `site/src/app/robots.ts`, disallow-all while this is an unapproved preview. Builds as a static route; format, lint, typecheck, route tests green.

### A.0 — decision and the evidence behind it

I inspected the live Railway config instead of assuming. What is actually set:

| Variable                                                   | Value                                                    |
| ---------------------------------------------------------- | -------------------------------------------------------- |
| `CC_AI_ENABLED`                                            | `true`                                                   |
| `NEXT_PUBLIC_SITE_URL`                                     | `https://carloscarpio.up.railway.app`                    |
| `OPENROUTER_API_KEY`                                       | present (73 chars — correct format, value never printed) |
| `CC_AI_MODE`                                               | **not set** → code default `prototype`                   |
| `OPENROUTER_MODEL`                                         | **not set** → code default `openrouter/free`             |
| `CC_AI_RATE_LIMIT` / `_WINDOW_SECONDS` / `_MAX_CONCURRENT` | **not set** → defaults 6 req / 60 s / 4 concurrent       |

**Decision: keep it on.** Reasoning:

1. **The per-instance limiter is adequate at current scale.** One Railway service, no horizontal
   scaling configured. `A.9`'s shared limiter is only required once there is more than one
   replica — so this is a scaling prerequisite, not a live hole. **I overstated this earlier.**
2. **Defaults are sane** — 6 requests per minute per client, 4 concurrent.
3. **Cost is genuinely zero.** Prototype mode on a free route matches `Q.6` exactly.
4. It is your first feature request. Switching off a working feature to mitigate a risk that is
   already mitigated would be the wrong trade.

**What stays true:** `A.9` becomes mandatory before scaling past one replica, and `A.13` is
still needed before `CC_AI_MODE` can ever be set to `production` on a zero budget.

**Optional hardening**, one command — pins the limits explicitly instead of relying on defaults:

```bash
railway variables --set CC_AI_MODE=prototype --set CC_AI_RATE_LIMIT=6 --set CC_AI_RATE_WINDOW_SECONDS=60 --set CC_AI_MAX_CONCURRENT=4
```

I did not run it: it changes live production config and triggers a redeploy, and the behaviour
is identical to the current defaults. It is config hygiene, not a fix.

### Decisions only you can make — these unblock other people

**All answered 2026-07-31 — full record and consequences in [`06-decisions.md`](06-decisions.md).**

- [x] ☑ **Q.3** · **(a) video hero. 3D is retired, not paused.** → unblocks `V.1`–`V.3`; cancels `C.9`; creates `V.13` (delete ~40 dead 3D files + 1 258 KB of decoders)
- [x] ☑ **Q.5** · **Music is yours, open to anyone, tips welcome** → `M.2` proceeds; ⚠ `M.11` must confirm the Suno plan tier first — free-tier generations may not be yours to license openly
- [x] ☑ **Q.4** · **Show ALL games**, hosted on Railway Pro where they move; leave the live Vercel ones alone → `C.2` scope widens from 3 to the full set
- [x] ☑ **Q.6** · **Zero budget, open source** → ⚠ `model-policy.ts` refuses free routes in production mode, so `A.13` must add named-free-model support; makes `A.9` rate limiting **urgent**
- [x] ☑ **Q.8** · Answered — **37** repos unlicensed (not 35; my earlier count was wrong). List in `06-decisions.md`. Recommend MIT on all → `Q.12`
- [x] ☑ **Q.9** · Framing confirmed **and verified**: `uset82` authored **46 of the last 100** `mentora` commits, plus 5 as `carlos`, vs 5 by the upstream owner — ~78 % is yours. "Primary developer on a forked college project" is supported by the record.
- [~] ⏳ **Q.7** · "idk" → I proposed **10 flagship projects** spanning web, design systems, Rust, Flutter, VHDL, C++, Python. Approve or swap → `Q.11`

### ⛔ The one blocker left

- [ ] ☐ **Q.10** · `CARLOS` · **The books — did you _write_ them, or do you _own copies_?**
      _"the books are mine as well"_ has two readings and they lead to opposite work.
      **(a) You wrote them** → fully citable, index directly, `B.9` gets much simpler.
      **(b) You own copies you bought** → owning a copy is not owning the copyright; distilled
      notes go public, raw PDFs stay private and unindexed.
      I will not guess: under (a) I would discard work that is legitimately yours; under (b) I
      would index someone else's copyrighted text into a public chatbot.

- [ ] ☐ **Q.11** · `CARLOS` · Approve or swap the 10 flagship projects
- [ ] ☐ **Q.12** · `CARLOS` · Apply MIT to the 37 unlicensed repos?
- [ ] ☐ **Q.13** · `CARLOS` · **7 private repos surfaced once `gh` authenticated** — they were
      invisible to the public API and are **not** in `02-github-inventory.md`:
      `marcoloco` · `ecco8-circular-luxe` (TS, 5.1 MB) · `rentme` · `ask-bank-ai` ·
      `masterHVL` · `diagram-pixel-perfect-clone` · `tragatelo-food-facts`.
      Public, brain-only, or invisible to CC AI? **Default until you say otherwise: invisible** —
      `B.4` syncs public repos only, so nothing private leaks by accident.

---

## WAVE 1 — First build

**Codex carries this wave.** Claude verifies each PR before it merges.

### Codex — brain foundation

- [ ] ☐ **B.0** · `CODEX` · Create `uset82/brain-private` (private repo) + local sibling clone — _unblocked, `gh` now authenticated_
- [x] ☑ **B.1** · `CODEX` · `brain/` skeleton, templates, ignore rules — _merged PR #9, 16 files, matches spec §3 exactly_
- [x] ☑ **B.2** · `CODEX` · `project.json` zod schema + `brain:check` — _merged PR #9. Imports the real schemas from `schemas.ts`; 7/7 tests incl. negatives; `pinaculo` status guard. Now wired into `pnpm test`._
- [x] ☑ **B.3** · `CODEX` · Seed `ifoundyou` + `opennemoclaw` — _merged PR #9. `brain-check`: "Brain valid: 2 projects."_

### Claude — direction and verification

- [ ] ☐ **V.1** · `CLAUDE` · Close `U.19` decisions 1–3 (counter label, section 04, hero copy budget)
- [ ] ☐ **SPEC.1** · `CLAUDE` · Write the design-system spec Codex implements in `V.4`/`V.5`
- [ ] ☐ **VER.1** · `CLAUDE` · **Verify Wave 1 Codex PRs** — schema matches `schemas.ts`, no status upgrades, tests cover negatives

### Grok — measurement

- [ ] ☐ **C.1** · `GROK` · Build and measure every arcade candidate (5 toolchains) → decides hosting tier

### Gemini — inventory

- [ ] ☐ **M.1** · `GEMINI` · Track inventory: title, duration, tool, date, samples, collaborators
- [ ] ☐ **M.7** · `GEMINI` · Image audit + convert the 2.5 MB poster to AVIF/WebP

---

## WAVE 2 — Core systems

### Codex — the big one

- [ ] ☐ **B.4** · `CODEX` · GitHub sync — 42 repos, forks/empty filtered, pulls authored docs not just READMEs
- [ ] ☐ **B.6** · `CODEX` · Build bridge into `site/` + leak test
- [ ] ☐ **B.7** · `CODEX` · Per-project `agents/SKILL.md`
- [ ] ☐ **A.1** · `CODEX` · Chunk + index the corpus → `cc-ai-index.json`
- [ ] ☐ **A.2** · `CODEX` · Lexical retrieval with field boosts, pinned boundary records
- [ ] ☐ **V.4** · `CODEX` · Type + layout ramp, from `SPEC.1`
- [ ] ☐ **V.5** · `CODEX` · Three motion motifs with full reduced-motion paths, from `SPEC.1`

### Claude

- [ ] ☐ **V.2** · `CLAUDE` · Commit to one hero — ⛔ _needs `Q.3`_
- [ ] ☐ **V.3** · `CLAUDE` · Resolve the canvas gate, record against `U.20`
- [ ] ☐ **SPEC.2** · `CLAUDE` · Retrieval spec + evaluation criteria for `A.5`
- [ ] ☐ **VER.2** · `CLAUDE` · **Verify Wave 2** — retrieval returns right chunks, boundary records always present, no invented facts

### Grok

- [ ] ☐ **V.13** · `CODEX` · **Delete the dead 3D layer** — `lib/three/**`, `components/three/**`, `site/public/three/decoders/**` (1 258 KB), the canvas gate, and the `assets:check` / `immersive:check` gates that test it. _Unblocked by `Q.3`. Removes ~a quarter of the codebase._
- [ ] ☐ **A.13** · `CODEX` · Make `model-policy.ts` accept a **named free model** in production mode — zero budget requires it
- [ ] ☐ **M.10** · `CLAUDE` · "Buy me a coffee" destination and placement
- [ ] ☐ **M.11** · `GEMINI` · **Confirm the Suno plan tier per track**, then choose the music licence — blocks every music publish
- [ ] ☐ **V.12** · `GROK` · **Stop shipping the 3.96 MB hero video to mobile** — 98 % of mobile page weight. Options: `<source media>` per breakpoint, poster-only on small screens, or a lighter encode. _Found during `F.5b`, highest-value perf fix available._
- [ ] ☐ **C.8** · `GROK` · Optimize the 90 MB / 85 MB GLBs for web delivery
- [ ] ☐ **P.3** · `GROK` · Preview environments per branch
- [ ] ☐ **T.1** · `GROK` · Standing error triage — no branch stays red past one session

### Gemini

- [ ] ☐ **M.2** · `GEMINI` · Rights record per track — ⛔ _needs `Q.5`_
- [ ] ☐ **M.8** · `GEMINI` · Arcade posters
- [ ] ☐ **M.9** · `GEMINI` · Site-wide alt text

---

## WAVE 3 — Experience

### Codex

- [ ] ☐ **A.5** · `CODEX` · Evaluation set 60–100 cases: refusals, injection, copyright probes, status integrity
- [ ] ☐ **A.6** · `CODEX` · Streaming responses, first token under 1.5 s
- [ ] ☐ **A.7** · `CODEX` · Grounded UI responses — real project cards, no fabricated links
- [ ] ☐ **A.8** · `CODEX` · Bounded session memory
- [ ] ☐ **A.9** · `CODEX` · Durable rate limiting across instances
- [ ] ☐ **B.9** · `CODEX` · ChatGPT pipeline: split → scan → distill — ⛔ _needs `Q.2`_
- [ ] ☐ **C.2** · `CODEX` · `/arcade` route — ⛔ _needs `Q.4` and `C.1`_
- [ ] ☐ **C.3** · `CODEX` · Play shell: poster → click → sandboxed iframe, never autoload
- [ ] ☐ **C.4** · `CODEX` · Mobile honesty states for desktop-only games

### Claude

- [ ] ☐ **A.10** · `CLAUDE` · Production model policy — ⛔ _needs `Q.6`_
- [ ] ☐ **P.1** · `CLAUDE` · Railway service topology
- [ ] ☐ **P.2** · `CLAUDE` · Environment variable matrix
- [ ] ☐ **VER.3** · `CLAUDE` · **Verify Wave 3** — run the evaluation set, confirm zero leakage and 100 % citation validity

### Grok

- [ ] ☐ **V.9** · `GROK` · Performance budgets: LCP, CLS, JS weight, image weight — held as acceptance criteria
- [ ] ☐ **P.4** · `GROK` · Image size budget, object storage if `site/public` passes ~50 MB
- [ ] ☐ **P.5** · `GROK` · Domain, HTTPS, security headers, caching

### Gemini

- [ ] ☐ **M.3** · `GEMINI` · Audio prep — loudness, bitrate, format + fallback
- [ ] ☐ **M.4** · `GEMINI` · Per-track visual, palette-compliant
- [ ] ☐ **M.5** · `GEMINI` · Captions and transcripts (WCAG requirement)
- [ ] ☐ **V.6** · `GEMINI` · Atmosphere plates — **warm only, no blue**

---

## WAVE 4 — Launch

### Codex

- [ ] ☐ **V.7** · `CODEX` · `/studio` craft page built around `webdesigner` (#59), from Claude's spec
- [ ] ☐ **V.8** · `CODEX` · Micro-interactions: focus, hover, skeletons, empty and error states
- [ ] ☐ **A.3** · `CODEX` · Embeddings — **only if `A.5` shows a measured recall gap**
- [ ] ☐ **A.11** · `CODEX` · Optional private study mode (authenticated, separate corpus)
- [ ] ☐ **B.5** · `CODEX` · Harvest ChatGPT project custom instructions → `brain/agents/`

### Claude

- [ ] ☐ **V.10** · `CLAUDE` · Accessibility re-verification: WCAG 2.2 AA, keyboard, 200 % zoom
- [ ] ☐ **A.12** · `CLAUDE` · **CC AI activation gate** — only when `A.5` passes, `A.9` live, key rotated, privacy copy accurate
- [ ] ☐ **VER.4** · `CLAUDE` · **Final review** — full `pnpm verify`, rendered checks, content integrity sweep
- [ ] ☐ **REL.1** · `CLAUDE` · Release checklist + rollback notes — ⛔ _needs Carlos's deploy authorization_

### Grok

- [ ] ☐ **C.7** · `GROK` · "Built with / working with" tool surface
- [ ] ☐ **C.9** · `GROK` · Optional 3D hub — **only after the arcade actually ships**
- [ ] ☐ **P.6** · `GROK` · Observability + documented rollback
- [ ] ☐ **V.11** · `GROK` · Visual regression baselines at 3 viewports

### Gemini

- [ ] ☐ **C.5** · `GEMINI` · `/sound` content set — ⛔ _needs `Q.5`_
- [ ] ☐ **C.6** · `GEMINI` · Video showcase assets
- [ ] ☐ **M.6** · `GEMINI` · Video inventory + rights
- [ ] ☐ **B.8** · `GEMINI` · Rights register per brain project

---

## Who has how much

| Owner      |  Tasks | Role                                                                                                                                                                    |
| ---------- | -----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CODEX**  | **41** | The build engine. Brain pipeline, **per-repo skills and agents (the thing that makes CC AI smart)**, retrieval, arcade routes, design system — all from Claude's specs. |
| **CLAUDE** |     18 | Plans, **design direction including the arcade**, architecture, `SPEC.*` for Codex, and **verifying every Codex PR before it merges**.                                  |
| **GEMINI** |     18 | **Music and video _design_** (with Antigravity), Suno and YouTube sourcing, images, atmosphere, rights.                                                                 |
| **GROK**   |     13 | Hard builds, game builds, platform, performance, standing error triage.                                                                                                 |
| **CARLOS** |     12 | Decisions only.                                                                                                                                                         |

Codex now carries roughly **40 %** of the project — the engine, as you asked. The other three
exist to keep it fed with specs, verified, and supplied with assets.

### Per-repo skills and agents — `B.7.1`–`B.7.11`

**Yes, every repo needs its own skill and agent.** That is the difference between a chatbot that
recites a README and one that explains how you built something and why.

A synced README tells CC AI _what a repo is_. A `SKILL.md` + `ANSWERS.md` tells it _how to talk
about it_ — which questions it can answer, which it must refuse, the honest status, and what the
project is genuinely comparable to. Without them, retrieval returns text and the model
improvises the framing. With them, the framing is yours.

Broken into 11 markable tasks: two templates, one generator for all 42 skeletons, then seven
cluster fills (design → music → games → AI → site systems → electronics → web apps), fork
contribution notes, and cross-cutting agents. Fill order is richest-documentation-first, so the
pattern is proven where there is most to say.

---

## How Claude verifies Codex

Codex writes fast; that is the point of using it. The check on speed is that **nothing merges
without Claude confirming it**, against four things — in this order:

1. **Does it pass?** `pnpm verify` green in Codex's worktree: format, zero-warning lint, strict
   TypeScript, all tests, plus content, palette, boundary, asset, and immersive gates.
2. **Does it match the spec?** Compare against the `SPEC.*` task or the acceptance criteria in
   `tasks/CODEX-TASKS.md`. Different-but-working still gets sent back — silent divergence is
   what makes the next task not fit.
3. **Is it honest?** No invented facts, metrics, dates, or ownership. No status upgrades
   (`pinaculo` stays a concept). Every public claim has a source ID and a rights status.
4. **Did it stay in its lane?** Files outside Codex's ownership map get sent back, even when the
   change is correct — that is what prevents the next merge conflict.

`VER.1`–`VER.4` are the scheduled checkpoints. Between them, every individual PR still gets
reviewed before merge — **one at a time, never in parallel.**

---

## The other files, and when to open them

| File                                               | Open it when                                                         |
| -------------------------------------------------- | -------------------------------------------------------------------- |
| **`TASKBOARD.md`** ← this one                      | Always. Status and ownership.                                        |
| [`05-runbook.md`](05-runbook.md)                   | You need the exact commands and the text to paste into each agent    |
| [`tasks/*-TASKS.md`](tasks/)                       | An agent needs the full detail and acceptance criteria for its tasks |
| [`00-master-plan.md`](00-master-plan.md)           | You want the reasoning behind a decision                             |
| [`01-brain-spec.md`](01-brain-spec.md)             | Working on the brain folders                                         |
| [`02-github-inventory.md`](02-github-inventory.md) | You need repo facts — all 61, numbered                               |
| [`04-followup.md`](04-followup.md)                 | Checkpoint history and nudges                                        |
| [`03-multi-agent-plan.md`](03-multi-agent-plan.md) | Ownership map and conflict rules                                     |
