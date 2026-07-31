# Task plan — Grok (in Cursor)

**Role:** hard problems, error fixing, builds, and platform. The arcade — getting six games in
five toolchains actually playable on the site — plus Railway and performance.
**Worktree:** `../wt-grok` on `feat/arcade`
**Brief:** [`../agents/GROK.md`](../agents/GROK.md) · **Tracker:** [`../04-followup.md`](../04-followup.md)

**13 tasks.** Mark `[ ] ☐` → `[x] ☑` only after the acceptance condition is verified, one at a
time, with a dated entry in §4.

**You own:** `site/public/games/**` · build and deploy scripts · Railway service configuration ·
3D asset optimization · performance budgets

**You must not edit:** `site/src/app/**` and `components/**` including `arcade/` — **Codex
builds the arcade routes; you supply the game builds and the measurements they need** ·
`styles/**`, `lib/three/**` (Claude — design lane) · `brain/**`, `lib/ai/**` (Codex) ·
`site/public/images|videos|audio/**` (Gemini) · `updates/**` (Claude) · shared:
`package.json`, `schemas.ts`, `records.ts`, `Dockerfile`, `railway.json`

> Your `C.1` measurement table is what unblocks Codex's `C.2`. Deliver it as data in your PR —
> built size, engine, input method, mobile viability, live host, rights — not as code.

> Arcade cards and copy live in `records.ts` — outside your lane. Put the exact record you need
> in your PR description; Claude adds it on `main` and you rebase.

---

## 1. The arcade — Workstream C

Repo classification is already done in [`../02-github-inventory.md`](../02-github-inventory.md)
§3.1–3.2. What is **not** known is built output size, and that is what decides hosting tier.

- [ ] ☐ **C.1 — Build and measure every candidate.** Five toolchains on Windows. Repo size is
      not a proxy for built size.

      | Repo | Stack | Watch for |
      | --- | --- | --- |
      | #32 `My-Football-Game` | Node + Express | **Already carries a `railway.json`** — fastest first win |
      | #46 `Monkey-Tug-of-War` | Flutter web | Needs the Flutter SDK; committed `build/` may be stale |
      | #42 `gimmemycake`, #37 `drone_Lips`, #14 `MandelBro` | Vite / plain JS | Repos are image-heavy; built output should be far smaller |
      | #12 `3Doodle` | Vite + Drizzle | Needs Postgres — server tier, not static |

      **Acceptance:** a table of repo → built size → engine → input method → mobile viability →
      current live host → rights. That table settles Tier A vs B in `00-master-plan.md` §8.2.

- [ ] ☐ **C.2 — `/arcade` route.** Editorial index: real posters, one-line descriptions,
      controls, honest per-item status. Follow the existing `laboratory-index` /
      `project-register` component patterns. Posters come from Gemini (`M.4`).

- [ ] ☐ **C.3 — Play shell `/arcade/[slug]`.** Poster → explicit play button → **sandboxed**
      iframe. Never autoload. Never autoplay audio. Documented keyboard alternative or an honest
      "requires pointer" state. `sandbox` attributes on every embed — `rules.md` requires
      external-embed sanitization.

- [ ] ☐ **C.4 — Mobile honesty.** Desktop-only games get a clear "desktop recommended" state,
      not a broken canvas. `rules.md` requires mobile to be designed deliberately — that
      includes designing the *unavailable* case.

- [ ] ☐ **C.7 — Tool promotion surface.** A "built with / working with" section tied to real
      projects, so it reads as evidence rather than a logo wall.

- [ ] ☐ **C.8 — Large 3D asset strategy.** `imagesandvideo/robot.glb` (90 MB) and `logo.glb`
      (85 MB) can never ship to a browser as-is. They are already tracked in git and are under
      GitHub's 100 MiB limit, so this is a **web-delivery** problem, not a git problem. Run them
      through the existing `scripts/optimize-3d-asset.ts` (Draco + KTX2) to a web budget, or
      serve from object storage behind a CDN.
      **Acceptance:** no web-delivered 3D asset exceeds the recorded budget.

- [ ] ☐ **C.9 — Optional 3D hub.** **Only after C.2–C.5 ship.** Content before world — a lobby
      built before the games are playable repeats the `U.20` mistake exactly. Reuses the
      fully-built, contract-tested Observatory canvas that is currently gated off.

---

## 2. Platform — Workstream P

- [ ] ☐ **P.3 — Preview environments.** Per-branch previews so design work is reviewable before
      production, as `rules.md` requires.

- [ ] ☐ **P.4 — Image size budget.** Track built image size as games and media land. If
      `site/public` passes ~50 MB, move large assets to object storage + CDN rather than growing
      the image. Railway Pro supports multiple services from one repo with different root
      directories, so Tier B games do not need a second repo.

- [ ] ☐ **P.5 — Domain, HTTPS, headers, caching.** Security headers and a caching policy for
      static assets and media.

- [ ] ☐ **P.6 — Observability.** Error tracking and uptime for the site and the CC AI route,
      with a documented rollback to the last verified deployment ID.

---

## 3. Performance and error triage

- [ ] ☐ **V.9 — Performance guardrails.** Set and hold explicit budgets: LCP, CLS, total JS,
      total image weight. Measured against the `F.5` baseline. These become acceptance criteria
      for every design task — an animation pass is exactly where budgets get quietly lost.
      *(Image conversion itself is Gemini's `M.5`; you own the budget and the enforcement.)*

- [ ] ☐ **T.1 — Standing error triage.** When any lane's branch goes red — failing test, broken
      build, type error, flaky gate — you are the one who fixes it. Two rules: fix it **on the
      owning agent's branch**, not by editing their files on yours; and if the fix needs a
      change outside your lane, hand it back rather than reaching across.
      **Acceptance:** no branch stays red for more than one working session.

---

## 4. Protocol

1. `git fetch origin && git rebase origin/main` before you start and before you push.
2. `pnpm verify` green in your worktree before any PR.
3. **Inspect rendered output in a real browser at mobile and desktop sizes.** `rules.md` is
   explicit: a screenshot is not proof of functional correctness, and a passing build is not
   proof of visual quality. You need both.
4. One task per PR. Claim in `../claims/grok.md` (yours alone).
5. Never commit to `main`. Never force-push, `reset --hard`, or `clean -fd`.
6. Adjacent work discovered → new unchecked task, new ID, in the PR body.
7. Merge conflict → push as-is, hand to Claude.

## Non-negotiable

- **`Tetris` (#1) never enters the arcade.** Course work (teacher example; Carlos's code) under
  CC-BY-4.0, but Java desktop — not web-playable in the arcade. `mentora` (#58) is a college
  fork Carlos largely developed and fixed; `osiris` (#56) is a fork too — see
  `../02-github-inventory.md` §2.1.
- **Palette is locked.** Warm natural only — no blue, cyan, violet, neon, near-black.
- Never invent facts, metrics, dates, or ownership. Never upgrade a project's status.
- Do not deploy or merge to production without Carlos's explicit authorization.

---

## 5. Completion log

_Dated entry per checked box: changed files, checks run, rendered verification._
