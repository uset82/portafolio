# TASKBOARD — the whole project, one page

**Open this file first. It is the only file you need to know where we are and who does what.**
Everything else is detail you open only when a task needs it.

`CARLOS` decisions only · `CLAUDE` plans, design direction, **verifies everything** ·
`CODEX` the build engine, most of the code · `GROK` hard fixes, builds, platform ·
`GEMINI` music, video, images

**78 tasks.** Status: `☐` not started · `⏳` in progress · `☑` done · `⛔` blocked

---

## YOU ARE HERE → Wave 0, almost finished

```
WAVE 0  ██████████  Foundation      ← COMPLETE
WAVE 1  ░░░░░░░░░░  First build     ← ready to start
WAVE 2  ░░░░░░░░░░  Core systems
WAVE 3  ░░░░░░░░░░  Experience
WAVE 4  ░░░░░░░░░░  Launch
```

**Done:** `F.2` key revoked · `F.1` git reconnected · worktrees created · `F.3` scan clean ·
`F.4` cross-link added · `F.5` baseline captured, `pnpm verify` green
**Next:** launch Codex on `B.0`–`B.3`. Runbook Step 4 has the text to paste.
**Waiting on you:** `Q.3` hero direction · `Q.5` music rights · `Q.2` books ·
authorization to commit and push
**Nothing is committed yet.**

### Baseline — every later "we improved X" is measured against these

| | |
| --- | ---: |
| `pnpm verify` | green (exit 0) |
| Client JS in build output | 2 879 KB / 23 files |
| **Homepage transferred, desktop** | **4 150 KB** |
| **Homepage transferred, mobile 390×844** | **4 039 KB** — 98 % is the hero video |
| CLS | 0 (desktop and mobile) |
| TTFB | 14 ms · Load 1 068 ms |
| `site/public` | 7.9 MB |
| Routes | 12 |

> **`V.12` — the 3.96 MB hero video downloads on mobile.** Found while measuring, not in the
> original plan. It is 98 % of mobile page weight and the biggest performance problem on the
> site. Assigned to `GROK` in Wave 2.

> **⚠ `A.0` — the site is ALREADY LIVE and CC AI is ALREADY PUBLIC.**
> `https://carloscarpio.up.railway.app/` returns 200; `/api/cc-ai` answers. My plan said
> `CC_AI_ENABLED=false` — **that was wrong, I had not checked production.**
> CC AI is serving visitors now on a *variable free model*, with a 6.7 KB corpus, no evaluation
> set, no durable rate limiting, and no production model policy. `A.12` was written as
> "switch it on"; it is now **"harden it or switch it off"**. Your call — see `A.0` in Wave 0.

---

## WAVE 0 — Foundation *(nobody builds until this is done)*

- [x] ☑ **F.2** · `CARLOS` · Revoke the exposed OpenRouter key — *done 2026-07-31*
- [x] ☑ **F.1** · `CLAUDE` · Reconnect git in place — *done, HEAD `58dd1d4`, 305 files, nothing lost*
- [x] ☑ **W.0** · `CARLOS` · Create four sibling worktrees — *done, all at `58dd1d4`*
- [x] ☑ **F.3** · `CLAUDE` · Secret and content scan — *clean, 0 findings across 305 tracked files*
- [x] ☑ **F.5** · `CLAUDE` · Baseline captured — *`pnpm verify` green, sizes recorded*
- [x] ☑ **F.4** · `CLAUDE` · `AGENTS.md` now points at `updates/TASKBOARD.md`
- [x] ☑ **F.5b** · `CLAUDE` · Core Web Vitals — *browser-measured, no new dependency. CLS 0. FCP/LCP not exposed by this browser.*
- [ ] ☐ **F.6** · `CARLOS` · Authorize the first commit + push
- [ ] ☐ **A.0** · `CARLOS` · **Decide: harden live CC AI, or switch it off until the gates pass.** It is public now on a free variable model with no evaluation set and no durable rate limiting. Switching off is one Railway variable (`CC_AI_ENABLED=false`); hardening means `A.5` + `A.9` + `A.10` first.
- [ ] ☐ **P.7** · `GROK` · **Add `robots.txt`.** The page has `<meta robots="noindex">` but `/robots.txt` returns the 404 page. A preview deployment should disallow crawlers explicitly.

### Decisions only you can make — these unblock other people

- [ ] ☐ **Q.3** · `CARLOS` · **Hero direction** → blocks `V.1`–`V.3`. (a) video hero *(recommended)* · (b) reframed 3D · (c) editorial
- [ ] ☐ **Q.5** · `CARLOS` · **Music rights per track** → blocks `M.2`–`M.5`, `C.5`
- [ ] ☐ **Q.2** · `CARLOS` · **Books approach** → blocks `B.9`, `library/`
- [ ] ☐ **Q.4** · `CARLOS` · Which 3 games launch first → blocks `C.2`
- [ ] ☐ **Q.6** · `CARLOS` · Production model + monthly budget → blocks `A.10`, `A.12`
- [ ] ☐ **Q.7** · `CARLOS` · Which 8–12 projects are flagship → shapes `B.4`
- [ ] ☐ **Q.8** · `CARLOS` · Licensing — 35 of 42 repos have none
- [ ] ☐ **Q.9** · `CARLOS` · Fork framing wording for `mentora` / `osiris`

---

## WAVE 1 — First build

**Codex carries this wave.** Claude verifies each PR before it merges.

### Codex — brain foundation
- [ ] ☐ **B.0** · `CODEX` · Create `uset82/brain-private` (private repo) + local sibling clone
- [ ] ☐ **B.1** · `CODEX` · `brain/` skeleton, templates, ignore rules
- [ ] ☐ **B.2** · `CODEX` · `project.json` zod schema + `brain:check`, reusing existing vocabulary
- [ ] ☐ **B.3** · `CODEX` · Seed 2 project folders by hand (`ifoundyou`, `opennemoclaw`) to prove the shape

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
- [ ] ☐ **V.2** · `CLAUDE` · Commit to one hero — ⛔ *needs `Q.3`*
- [ ] ☐ **V.3** · `CLAUDE` · Resolve the canvas gate, record against `U.20`
- [ ] ☐ **SPEC.2** · `CLAUDE` · Retrieval spec + evaluation criteria for `A.5`
- [ ] ☐ **VER.2** · `CLAUDE` · **Verify Wave 2** — retrieval returns right chunks, boundary records always present, no invented facts

### Grok
- [ ] ☐ **V.12** · `GROK` · **Stop shipping the 3.96 MB hero video to mobile** — 98 % of mobile page weight. Options: `<source media>` per breakpoint, poster-only on small screens, or a lighter encode. *Found during `F.5b`, highest-value perf fix available.*
- [ ] ☐ **C.8** · `GROK` · Optimize the 90 MB / 85 MB GLBs for web delivery
- [ ] ☐ **P.3** · `GROK` · Preview environments per branch
- [ ] ☐ **T.1** · `GROK` · Standing error triage — no branch stays red past one session

### Gemini
- [ ] ☐ **M.2** · `GEMINI` · Rights record per track — ⛔ *needs `Q.5`*
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
- [ ] ☐ **B.9** · `CODEX` · ChatGPT pipeline: split → scan → distill — ⛔ *needs `Q.2`*
- [ ] ☐ **C.2** · `CODEX` · `/arcade` route — ⛔ *needs `Q.4` and `C.1`*
- [ ] ☐ **C.3** · `CODEX` · Play shell: poster → click → sandboxed iframe, never autoload
- [ ] ☐ **C.4** · `CODEX` · Mobile honesty states for desktop-only games

### Claude
- [ ] ☐ **A.10** · `CLAUDE` · Production model policy — ⛔ *needs `Q.6`*
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
- [ ] ☐ **REL.1** · `CLAUDE` · Release checklist + rollback notes — ⛔ *needs Carlos's deploy authorization*

### Grok
- [ ] ☐ **C.7** · `GROK` · "Built with / working with" tool surface
- [ ] ☐ **C.9** · `GROK` · Optional 3D hub — **only after the arcade actually ships**
- [ ] ☐ **P.6** · `GROK` · Observability + documented rollback
- [ ] ☐ **V.11** · `GROK` · Visual regression baselines at 3 viewports

### Gemini
- [ ] ☐ **C.5** · `GEMINI` · `/sound` content set — ⛔ *needs `Q.5`*
- [ ] ☐ **C.6** · `GEMINI` · Video showcase assets
- [ ] ☐ **M.6** · `GEMINI` · Video inventory + rights
- [ ] ☐ **B.8** · `GEMINI` · Rights register per brain project

---

## Who has how much

| Owner | Tasks | Role |
| --- | ---: | --- |
| **CODEX** | **25** | The build engine. Most of the code: brain pipeline, CC AI retrieval, arcade routes, and the design system from Claude's specs. |
| **CLAUDE** | 19 | Plans, design direction, architecture decisions, and **verifying every Codex PR before it merges**. Roughly half are `SPEC.*` and `VER.*` — work that exists to keep Codex unblocked and honest. |
| **GEMINI** | 13 | Music, video, images, atmosphere, rights registers. |
| **GROK** | 11 | Hard builds, 3D optimization, platform, performance, standing error triage. |
| **CARLOS** | 10 | Decisions only. Seven are blocking someone right now. |

78 total. Codex has more than twice Grok's load and a third of the whole project — it is the
engine, and the other three exist to keep it fed, verified, and supplied with assets.

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

| File | Open it when |
| --- | --- |
| **`TASKBOARD.md`** ← this one | Always. Status and ownership. |
| [`05-runbook.md`](05-runbook.md) | You need the exact commands and the text to paste into each agent |
| [`tasks/*-TASKS.md`](tasks/) | An agent needs the full detail and acceptance criteria for its tasks |
| [`00-master-plan.md`](00-master-plan.md) | You want the reasoning behind a decision |
| [`01-brain-spec.md`](01-brain-spec.md) | Working on the brain folders |
| [`02-github-inventory.md`](02-github-inventory.md) | You need repo facts — all 61, numbered |
| [`04-followup.md`](04-followup.md) | Checkpoint history and nudges |
| [`03-multi-agent-plan.md`](03-multi-agent-plan.md) | Ownership map and conflict rules |
