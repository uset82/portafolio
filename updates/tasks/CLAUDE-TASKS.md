# Task plan — Claude

**Role:** plans, engineering architecture, **design / looks / animations**, integration, review.
**Worktree:** `portafolio-main/` on `main` for planning · `../wt-claude` on `feat/design-system`
for design code.
**Brief:** [`../agents/CLAUDE.md`](../agents/CLAUDE.md) · **Tracker:** [`../04-followup.md`](../04-followup.md)

**15 tasks.** Mark `[ ] ☐` → `[x] ☑` only after the acceptance condition is verified, one at a
time, with a dated entry in §5.

> **Note on the dual role.** You now write feature code *and* referee merges. Keep design work
> on `feat/design-system`, never directly on `main`, and rebase before every review session.
> If your own branch ever blocks someone else's merge, yours yields.

---

## 1. Wave 0 — foundation (nobody else starts until these are done)

- [x] ☑ **F.1 — Reconnect git in place, without losing local work.** — **done 2026-07-31**
      `git init -b main` → `remote add origin` → `git fetch origin` → `reset --mixed origin/main`
      → `branch --set-upstream-to=origin/main main`.
      **Result:** HEAD at `58dd1d4`, 305 tracked files, working tree untouched. Real delta is
      **smaller** than §3.1 predicted — 2 modified (`maintaskplan.md` +12 lines,
      `site/README.md` 1 line), 1 deleted (`cc-mark.tsx`, 7 lines). `site/.env.local` confirmed
      ignored by `site/.gitignore:34`. Evidence in §5.

- [x] ☑ **F.3 — Secret and content scan.** — **done 2026-07-31, clean.** All 305 tracked files
      scanned for key patterns, emails, phone/address patterns, résumé, and credential files.
      Zero findings. `updates/` also clean. Evidence in §5.

- [x] ☑ **F.4 — Cross-link the ledgers.** — **done 2026-07-31.** `AGENTS.md` now points at
      `updates/TASKBOARD.md` in both "Instruction order" (new item 4) and "Key files", splitting
      v1 launch work from post-v1 work.

- [x] ☑ **F.5 — Capture the baseline.** — **done 2026-07-31, partial.** `pnpm verify` green,
      build sizes, asset weights, and route list recorded in §5. **Lighthouse not captured** —
      no CLI present and installing one is a dependency decision for Carlos. Real Core Web
      Vitals can be measured off the production server instead; that is what `V.9`'s budget
      needs. Left open as `F.5b`.

- [ ] ☐ **F.5b — Core Web Vitals baseline.** Start the production server, measure LCP, CLS, INP,
      and transferred JS at 1440×900 and 390×844. *(needs Carlos to choose: browser-measured
      vitals, or install Lighthouse.)*

- [ ] ☐ **W.0 — Create worktrees and hand out briefs.** Three worktrees per
      `03-multi-agent-plan.md` §2. Give each agent **only its own** brief and task plan.

---

## 2. Design, looks, and animation — your main build lane

- [ ] ☐ **V.1 — Close `U.19` decisions 1–3.** (a) `/work` counter "03 validated routes"
      overstates what the records disclaim → "routes in register". (b) Homepage numbering skips
      04 → add "Profile / 04". (c) Hero desktop paragraph exceeds the locked hero budget → reuse
      the existing mobile band pattern at all widths, **layout only, no copy change**.
      Decision 4 is superseded by `U.20` — do not act on it.
      **Acceptance:** rendered at 1440×900, 1129×868, 390×844; no overflow; no console errors.

- [ ] ☐ **V.2 — Commit to one hero.** *(blocked on `Q.3`)* Remove the poster-versus-canvas
      ambiguity entirely. Re-anchor or remove the artifact overlay cards — they are currently
      positioned against a *painted* image, which is the single most obvious source of the
      unfinished feeling.

- [ ] ☐ **V.3 — Resolve the canvas gate.** `OBSERVATORY_LIVE_CANVAS_PRESENTATION` in
      `site/src/lib/three/progressive-loading.ts` must stop being a paused decision. Either the
      canvas mounts with an approved framing, or the homepage stops presenting itself as a 3D
      world. Record the resolution against `U.20` in `maintaskplan.md`.

- [ ] ☐ **V.4 — Type and layout ramp.** Editorial type scale with defined roles (display /
      headline / subhead / body / caption / label), explicit grid, vertical-rhythm tokens.
      **Acceptance:** rendered as a live page, not only a token file.

- [ ] ☐ **V.5 — Three motion motifs, no more.** `rules.md` caps this deliberately.
      **(1) Reveal** — staged entrance for editorial blocks, extending `hero-reveal.tsx`.
      **(2) Focus pull** — depth and weight shift on hover/focus for media and project cards.
      **(3) Passage** — route transitions via the existing `template.tsx`.
      **Acceptance:** each motif has a *complete* `prefers-reduced-motion` path — a real
      alternative, not a disabled one.

- [ ] ☐ **V.7 — Craft evidence page, built around `webdesigner` (repo #59).**
      You want the site to prove web design, Figma, Adobe, and video ability. The strongest
      exhibit already exists: `uset82/webdesigner` holds `Blender/`, `gsap-public/`, a
      `3d-scroll-website-skill-pack/`, `design.md`, a `.codex-plugin/`, and `marketplace.json` —
      a design system you authored and shipped as a distributable plugin. `AGENTS.md` already
      routes to it as `$webdesigner-design-system`.
      `/studio` leads with it as a case study, then the live token page from `V.4`, wireframe →
      final comparisons, motion tests, and `avatar-studio` (#60) as a second systems exhibit.

- [ ] ☐ **V.8 — Micro-interaction pass.** Focus states, hover transitions, loading skeletons,
      empty states, error states, cursor treatment. This is where perceived craft actually
      lives, and it is invisible in screenshots — which is why it is its own task.

- [ ] ☐ **V.10 — Accessibility re-verification.** WCAG 2.2 AA, keyboard-only, 200 % zoom,
      visible focus, reduced motion. Re-run after **every** visual change, not once at the end.

### The design specs Codex builds from

Codex implements; you decide. Every `V.*` and `C.2`–`C.4` task in `CODEX-TASKS.md` is blocked
until its spec lands, so these are on the critical path — write them before Codex runs dry.

- [ ] ☐ **SPEC.1 — Design system spec.** Type ramp with named roles, grid, spacing scale, and
      the three motion motifs with their reduced-motion alternatives. Feeds `V.4` and `V.5`.

- [ ] ☐ **SPEC.2 — `/studio` craft page spec.** Structure for the `webdesigner` (#59) case
      study, the live token page, wireframe → final comparisons, and `avatar-studio` (#60).
      Feeds `V.7`.

- [ ] ☐ **SPEC.3 — Arcade design spec.** *(Carlos assigned the arcade look to you.)*
      **The point is that playing happens *inside* the portfolio, not that a link opens
      elsewhere.** Specify: how the index reads as an editorial room rather than a card grid;
      the poster → click → play transition; how the frame is presented so a game feels embedded
      rather than bolted on; the loading, error, and "desktop recommended" states; how a visitor
      exits back into the site without losing their place.

      Constraints that are not yours to move: warm natural palette, sandboxed iframes, never
      autoload, never autoplay audio, and a complete keyboard path or an honest
      "requires pointer" statement. All games ship (`Q.4`), so the layout must survive a set
      that is uneven in quality and aspect ratio — that is the real design problem.
      Feeds `C.2`, `C.3`, `C.4`, `C.10`.

- [ ] ☐ **SPEC.4 — Review Gemini's `/sound` and video specs** (`M.14`, `M.15`) for palette,
      motion, and accessibility coherence, then hand the merged brief to Codex. Gemini owns how
      music and video *feel*; you own that they feel like the same site.

---

## 3. Architecture decisions

- [ ] ☐ **A.10 — Production model policy.** *(blocked on `Q.6`)* Set
      `OPENROUTER_PRODUCTION_MODEL` and ordered fallbacks. Anthropic models route as
      `anthropic/…` through OpenRouter — **verify exact IDs and pricing at decision time**, not
      from any document. Keep `dataCollection: "deny"` and ZDR. Disclose the responding model.

- [ ] ☐ **P.1 — Service topology.** Web service + optional game services + Redis. Record which
      repository path each builds from.

- [ ] ☐ **P.2 — Environment matrix.** Variable × environment (local / preview / production),
      marking which are secret. Extends `site/.env.example` — placeholders only, never values.

- [ ] ☐ **A.12 — CC AI activation gate.** Flip `CC_AI_ENABLED=true` **only** when all are true:
      `A.5` passes with zero leakage and 100 % citation validity; `A.9` durable limiting is live
      across instances; `F.2` key rotation done; privacy copy matches actual configuration.
      This closes the public half of `U.13`/`U.14`.

---

## 4. Standing responsibilities (not checkboxes — continuous)

- **Shared-file broker.** Nobody but you edits `site/package.json`, `site/src/content/schemas.ts`,
  `site/src/content/records.ts`, `Dockerfile`, `railway.json`, `.github/workflows/**`. Agents
  request in their PR body; you apply on `main`; they rebase. This one mechanism prevents a
  conflict on every merge.
- **Serial integration.** One PR merges at a time. Review → verify → merge → tell the rest to
  rebase.
- **Content integrity.** No invented facts, metrics, dates, employers, or ownership. No status
  upgrades (`pinaculo` stays a concept). Fork framing: `mentora` is primary developer of a
  college fork; `Tetris` is Carlos's course code but never enters the arcade (Java desktop).
- **Follow-up.** Run the checkpoint in `04-followup.md` and issue nudges. That file is yours.

---

## 5. Completion log

_Dated entry per checked box: changed files, checks run, rendered verification._

### 2026-07-31 — `F.1` git reconnected

**Commands:** `git init -b main` · `git remote add origin https://github.com/uset82/portafolio.git`
· `git fetch origin` · `git reset --mixed origin/main` · `git branch --set-upstream-to=origin/main main`

**Result:** HEAD `58dd1d4` ("fix(deploy): move Railway build config to the repository root"),
matching `git ls-remote` before the fetch. 305 tracked files; 1 absent from disk
(`site/src/components/cc-mark.tsx`, the intentional deletion). No working-tree file was
modified — `reset --mixed` rewrites the index only.

**Tracked delta:** `maintaskplan.md` (+12/−1), `site/README.md` (+1/−1),
`site/src/components/cc-mark.tsx` (deleted, −7). Total 3 files.

**Deviation from the predicted §3.1 delta, explained and verified.** §3.1 predicted 6 modified
files; git reports 2. The four not reported — `docs/assets/observatory-3d-manifest.json`,
`site/.env.example`, `site/.gitignore`, `site/.prettierignore` — show **empty `git diff`**.
Cause: `.gitattributes` sets `* text=auto` and `core.autocrlf=true`, so git normalizes line
endings. The §3.1 comparison hashed raw bytes from disk; those four were re-saved locally with
CRLF while their content stayed identical. Git's answer is authoritative and the real delta is
smaller than predicted. No action needed.

**Safety checks:** `site/.env.local` ignored via `site/.gitignore:34` (`.env*`), 0 staged
entries, 24 lines intact. No user- or machine-scope `OPENROUTER_API_KEY` environment variable
set — the stale-variable failure recorded in `U.14` cannot recur.

**Correction issued:** the earlier claim that `imagesandvideo/*.glb` exceeded GitHub's 100 MB
limit was wrong. `robot.glb` 90.8 MB, `logo.glb` 85.5 MB — both under the 100 MiB block, both
already tracked and pushed. Fixed in `00-master-plan.md` `F.1` and `tasks/GROK-TASKS.md` `C.8`.

**Resolved 2026-07-31:** the three misplaced worktrees were removed (empty, orphan branches,
zero loss) and all four recreated as siblings under `PROYECTOS\`, each at `58dd1d4` with 305
files. Root cause: the commands ran from `updates/` so `../wt-*` landed inside the repo, and
they ran before `main` had a commit so git inferred `--orphan`. Both traps are now documented in
`05-runbook.md` Step 3, with PowerShell-correct paths (`cd /c/Users/...` fails in PowerShell).

---

### 2026-07-31 — `F.3` secret and content scan: CLEAN

Scanned all 305 tracked files via `git ls-files | xargs grep`:

| Check | Result |
| --- | --- |
| Key patterns (`sk-`, `sk-or-v1-`, `ghp_`, `github_pat_`, `AKIA`, PEM private keys) | 0 |
| Email addresses (excluding package scopes and schema URLs) | 0 |
| Phone, address, and postcode patterns | 0 |
| Résumé PDF | absent from working tree; gitignored |
| `.env`, `.env.local`, credential files tracked | 0 |
| `updates/` (staged for first commit) | 0 |

One filename matched the filter — `docs/content/cv-source-checklist.md` — read in full and
cleared: it is a process checklist about *excluding* private data, not private data.

Root `.gitignore` hardened in the same pass: added `/.pnpm-store/` (untracked cache, 60 KB now
but grows) and `**/.claude/settings.local.json` (per-machine settings; shared agent config stays
tracked).

### 2026-07-31 — `F.5` baseline

**`pnpm verify` — exit 0.** Format, zero-warning lint, strict TypeScript, all unit tests,
content, palette, boundary, asset, and immersive gates all green.

- Palette gate: 30 approved colors, 11 Three.js material roles, 3 forbidden-color sentinels passed
- Server boundary: OpenRouter runtime and credentials confirmed server-only
- 3D asset gate: 0 public GLB variants, 4 reference sheets, 12 rights-gated registry assets
- Immersive: 12 manifest assets, 26 client files, 1 semantic poster fallback, 7 semantic routes
- Build: Next.js 16.2.10 Turbopack — compiled 28.1 s, TypeScript 26.6 s, 15 static pages in 685 ms

**Routes (12):** `/` · `/_not-found` · `/api/cc-ai` (dynamic) · `/apple-icon.png` · `/contact` ·
`/cosmos` · `/icon.png` · `/laboratory` · `/sound` · `/story` · `/work` ·
`/work/[slug]` → `astraea`, `pinaculo`, `future-energy`

**Sizes — the numbers every later improvement is measured against:**

| Metric | Baseline |
| --- | ---: |
| Client JS shipped | **2 879 KB** across 23 files |
| Largest chunk | 861 KB (`3u6_10tm2q6id.js`) |
| Draco decoder in client media | 702 KB |
| `.next/static` | 4.3 MB |
| `.next/server` | 16 MB |
| `site/public` total | **7.9 MB** |
| — `robot-water-sequence.mp4` | 3 958 KB |
| — `observatory-poster.png` | 2 535 KB |
| — Three.js decoders (6 files) | 1 258 KB |
| Tracked files | 305 |
| `.git` | 173 MB |

**Two findings worth acting on.** The video and the poster are **82 % of all shipped assets** —
`M.7` is a larger win than estimated. And 2 879 KB of client JS is heavy for a site whose
homepage currently renders a poster, with 702 KB of that being a Draco decoder for 3D that is
gated off — `V.9` should investigate whether it is being loaded unconditionally.

**Note:** the build reported `Environments: .env.local`, so it consumed local development
configuration. Production builds on Railway must use the secret store, not this file.

**Not captured:** Lighthouse. No CLI present; installing one is Carlos's dependency decision.
Tracked as `F.5b`.

### 2026-07-31 — `F.5b` Core Web Vitals, browser-measured

Production server (`next start`, port 3100), measured through the browser Performance API.
No new dependency added.

| Metric | 1440×900 | 390×844 |
| --- | ---: | ---: |
| TTFB | 14 ms | — |
| CLS | **0** | 0 |
| Load | 1 068 ms | 200 ms *(warm cache)* |
| Total transferred | **4 150 KB** | **4 039 KB** |
| — `robot-water-sequence.mp4` | **3 958 KB** | **3 958 KB** |
| — poster image | 192 KB | — |
| Script files | 10 | 10 |
| Canvas elements | 0 | 0 |

**Headline finding: the 3.96 MB hero video downloads on mobile too.** At 390×844 it is
**98 % of total page weight**. Localhost hides this — it transferred in 11 ms — but on a real
mobile connection it is the entire experience budget spent before anything else loads. This is
the single biggest performance problem on the site and it was not in the plan. Added as `V.12`.

**Correction — my earlier Draco hypothesis was wrong.** I suggested the 702 KB Draco decoder
might be loading unconditionally and that `V.9` should investigate. Measured:
`DRACO_or_BASIS_loaded: false`. The decoder ships in the build output but is **not** requested
at runtime. The lazy-loading boundary works correctly. No action needed.

`canvas_elements: 0` confirms `poster-authoritative` mode is active as designed.

**Not captured:** FCP and LCP. This browser environment does not expose paint-timing entries —
`getEntriesByType('paint')` returned empty and the buffered `largest-contentful-paint` observer
never fired across three attempts, including on fresh navigations. CLS and transfer figures are
real; FCP/LCP are simply absent, not zero. If those two specific numbers are needed, Lighthouse
or a real-device test is required — that decision stays with Carlos.
