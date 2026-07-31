# Task plan — Gemini

**Role:** media. Music setup, video, images, posters, alt text, and rights registers.
**Worktree:** `../wt-gemini` on `chore/media`
**Brief:** [`../agents/GEMINI.md`](../agents/GEMINI.md) · **Tracker:** [`../04-followup.md`](../04-followup.md)

**13 tasks.** Mark `[ ] ☐` → `[x] ☑` only after the acceptance condition is verified, one at a
time, with a dated entry in §5.

**You own:** `site/public/images/**` · `site/public/videos/**` · `site/public/audio/**` ·
`docs/assets/**` · `docs/content/*-inventory.json` · `docs/content/*-register.json`

**You must not edit:** `site/src/**` — **all of it** · `brain/**`, `scripts/**` (Codex) ·
`updates/**` (Claude) · shared: `package.json`, `records.ts`

> Track titles, credits, captions, and alt text live in `records.ts` and in components — outside
> your lane. **You write the words and produce the files; Claude wires them in.** Put the exact
> text, mapped to each asset path, in your PR description.

---

## 1. Music — your main lane

Everything here is **blocked on `Q.5`** until Carlos confirms rights per track. Do the
inventory work now; publish nothing until he answers.

- [ ] ☐ **M.1 — Track inventory.** Every candidate track: title, duration, source tool, date,
      file format, current location, and whether any sample, stem, stock loop, or collaborator
      is involved. Related repos: #7 `Suno-UDIO-Helper`, #31 `StrudelAI`, #13 `LyriGenie`.
      **Acceptance:** one row per track in `docs/content/`, no track marked ready.

- [ ] ☐ **M.2 — Rights record per track.** *(blocked on `Q.5`)* Extend
      `docs/content/asset-licensing-register.json` with owner, generation tool, and reuse status
      for each track.

      **Flag for Carlos, per track, before anything publishes:** AI music platforms grant
      ownership and commercial-use rights differently depending on the plan tier the track was
      generated under, and terms change over time. **Verify the actual current terms for the
      account and plan each track was made on** — do not assume, and do not take this document
      as the source. `rules.md` requires confirming reuse rights before publishing, and
      `maintaskplan.md` already carries one unresolved generated-asset licensing risk. Do not
      add a second one.

      **Acceptance:** every track has an owner, a named generation tool, a plan/tier note, and
      an explicit reuse status. A track without one does not ship.

- [ ] ☐ **M.3 — Audio file preparation.** Web-ready masters: consistent loudness, sensible
      bitrate, a format with broad support plus a fallback, correct duration metadata.
      **Acceptance:** total audio weight recorded; nothing over ~2 MB enters `site/public/`
      without written justification — it ships inside the Docker image on every deploy.

- [ ] ☐ **M.4 — Per-track visual.** A still or waveform image per track, palette-compliant.
      Warm natural only.

- [ ] ☐ **M.5 — Captions and transcripts.** Any track with speech or lyrics needs a text
      alternative. This is a WCAG 2.2 AA requirement, not a nice-to-have.

- [ ] ☐ **C.5 — `/sound` content set.** *(blocked on `Q.5` and `M.2`)* The route and
      `SoundFoundation` component already exist but publish nothing. Deliver the full content
      set: mute-first, real durations, credits, visuals, transcripts.
      **Acceptance:** content delivered and specified in your PR. **Claude does the component
      wiring** — `site/src/**` is outside your lane. Never autoplay audible media.

---

## 2. Video

- [ ] ☐ **M.6 — Video inventory and rights.** Same treatment as `M.1`/`M.2`: source, tool,
      date, rights, collaborators. Note that `Paper2Video` (#39) is a **fork of
      `showlab/Paper2Video`** — it is not your work and nothing from it may be presented as such.

- [ ] ☐ **C.6 — Video showcase assets.** Posters, captions, and web-ready encodes with lazy
      loading in mind. `native-media.tsx` and `media-readiness.tsx` already exist — Claude
      extends them; you supply the media and the copy.

---

## 3. Images

- [ ] ☐ **M.7 — Image weight audit and poster conversion.**
      `site/public/images/observatory-poster.png` is a **2.5 MB PNG** shipped inside the
      production image — the single easiest performance win available. Convert to **AVIF and
      WebP, keeping the PNG as fallback**. Audit every file in `site/public/images/` and
      `videos/`: format, dimensions, bytes, where used. Propose a per-image budget table.
      **Acceptance:** before → after weight table in the PR; **no visible quality regression**
      at 1440×900 and 390×844, with side-by-side crops. **Do not delete the original PNG** —
      fallback first; removal is a separate decision. `<picture>` wiring is Claude's.

- [ ] ☐ **M.8 — Arcade posters.** One poster per arcade candidate, feeding Grok's `C.2`.
      Candidates in `../02-github-inventory.md` §3.1.

- [ ] ☐ **M.9 — Site-wide alt text pass.** Every meaningful image gets useful alt text or an
      explicit decorative treatment. Deliver as a path → text mapping in your PR.

- [ ] ☐ **V.6 — Atmosphere plates ("the smoke").**
      **This is where the palette lock gets broken.** Every image generator reaches for a blue
      or violet haze by default. Mist must be **buff, taupe, pewter, warm off-white**. No blue,
      cyan, violet, neon, or near-black. `palette:check` runs in CI and will fail the build.
      Cheapest option first — animated grain plus a slow warm gradient — before anything
      heavier. Deliver as a seamless low-bitrate loop with a still fallback frame.

- [ ] ☐ **B.8 — Rights register per project.** Every media file in a brain project folder
      carries owner, license, and reuse status, extending
      `docs/content/asset-licensing-register.json` and `local-media-clearance-register.json`.

---

## 4. Protocol

1. `git fetch origin && git rebase origin/main` before you start and before you push.
2. `pnpm verify` green before any PR — the asset and content gates are real and they do fail.
3. One task per PR. Claim in `../claims/gemini.md` (yours alone).
4. Never commit to `main`. Never force-push, `reset --hard`, or `clean -fd`.
5. Merge conflict → push as-is, hand to Claude.

## Non-negotiable — rights come first

- **Every asset needs a recorded owner, license, and reuse status before it is committed.**
  No rights record, no commit — regardless of how good it looks.
- **Record provenance for anything generated**, including the tool, the plan tier, and the
  prompt. `rules.md` requires it.
- **Nothing over ~2 MB enters `site/public/`** without written justification.
- Never invent credits, dates, collaborators, or ownership.
- Do not deploy or merge without Carlos's explicit authorization.

---

## 5. Completion log

_Dated entry per checked box: changed files, checks run, visual verification._
