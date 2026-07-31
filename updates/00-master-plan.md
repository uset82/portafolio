# Portfolio Updates — Master Plan 01

**Opened:** 2026-07-31
**Owner:** Carlos Carpio
**Scope:** the four upgrades requested on 2026-07-31 — a genuinely knowledgeable CC AI, a
per-project "brain" folder system, a playable/listenable/watchable experience layer, and a
modern visual rebuild of the site.
**Status:** planning complete, implementation not started. Nothing in this file is checked.

---

## 1. What you asked for, restated

| #   | Your request                                                                       | Workstream                          |
| --- | ---------------------------------------------------------------------------------- | ----------------------------------- |
| 1   | Make the CC AI chat box actually smart — GitHub projects, ChatGPT projects, books, resources, so it answers with your knowledge and the way you want | **A — CC AI intelligence**          |
| 2   | One organized folder per project/repo inside a "portfolio brain" holding skills, agents, books, PDFs, docs | **B — Portfolio Brain**             |
| 3   | Visitors can play your games, hear your music, see your videos — possibly one world, possibly links to games on other servers, possibly all on Railway Pro | **C — Playable & media layer**      |
| 4   | Modernize the design — fix the weird parts, more animation and atmosphere, prove web design / Figma / Adobe / video craft | **V — Visual system rebuild**       |
|     | Everything above needs a working repo, a rotated key, and Railway capacity           | **F — Foundation** + **P — Platform** |

---

## 2. Ground truth — what is actually in the repo today

Verified by reading the files on 2026-07-31, not assumed.

**Application**

- Next.js 16.2.10, React 19.2.4, TypeScript strict, Tailwind 4, `motion` 12, Three.js 0.185 +
  R3F 9, zod 4. Package manager pinned to pnpm 10.13.1, Node 22.
- Routes that exist: `/`, `/work`, `/work/[slug]`, `/laboratory`, `/sound`, `/cosmos`,
  `/story`, `/contact`, `not-found`. **There is no games/arcade route.**
- 224 unit tests plus content, palette, server-boundary, 3D-asset, and immersive gates,
  all wired into `pnpm verify`. This is a genuinely disciplined codebase — the plan below is
  built to go *through* those gates, not around them.

**CC AI as it stands**

- `site/src/lib/ai/cc-ai-knowledge.ts` builds **one static system prompt**. It serializes
  *every* eligible record into JSON and stops when it hits `maxCharacters` (default 8 000,
  hard ceiling 20 000). Selection is insertion order — there is **no relevance retrieval,
  no chunking, no embeddings, no reranking**.
- The public corpus is `site/src/content/cc-ai-public-knowledge.json` — **6.7 KB total**,
  two records: a profile and a contact/links record. Everything else is excluded.
- `CcAiProvider.complete()` returns one finished string. **No streaming.**
- `model-policy.ts` already enforces `dataCollection: "deny"`, ZDR support, and refuses free
  routes in `production` mode. That part is good and should be kept.
- ~~`CC_AI_ENABLED=false` for any deployment.~~ **CORRECTED 2026-07-31 — this was wrong.**

**⚠ The site is already live and CC AI is already public.** I took the "keep it false" line from
`docs/railway-deployment.md` and did not check production. Verified today:

- `https://carloscarpio.up.railway.app/` returns **HTTP 200** — the portfolio is deployed.
- `/api/cc-ai` returns **405 on GET**, i.e. the route is live and method-gated, not `503 disabled`.
- `maintaskplan.md` task 8.17 records `CC_AI_ENABLED=true` and `NEXT_PUBLIC_SITE_URL` set in
  Railway on 2026-07-30, with a successful production POST answering from
  `google/gemma-4-26b-a4b-it:free`.
- The page carries `<meta name="robots" content="noindex">`, but **`/robots.txt` does not exist**
  — it returns the 404 page.

**What this means:** CC AI is serving the public **right now** on a variable free model, with a
6.7 KB corpus, **without** the `A.5` evaluation set, **without** `A.9` durable rate limiting
(the limiter is per-instance), and **without** an `A.10` production model policy. Those are
precisely the conditions `A.12` exists to gate, and it has already been passed. `A.12` is
therefore not "switch it on" — it is "decide whether to harden it or switch it off". See `A.12`.

So "make it smarter" is not prompt tuning. It is **building the retrieval layer that does
not exist yet**, and building the corpus it retrieves from.

**Content integrity pipeline (the constraint that shapes everything)**

Every fact reaching CC AI must pass, in `cc-ai-knowledge.ts`:

- `verification` ∈ {`verified`, `user-approved`}
- `rights` ∈ {`owned`, `permission-granted`, `permissive-license`, `attribution-required`, `not-applicable`}
- `publication === "ready"` (projects and media)
- every `sourceIds` entry must resolve to a source with `public: true`

Nothing bypasses this. New knowledge does not get a shortcut — it gets a bigger, better-fed
version of the same gate.

**Deployment**

- Railway, Dockerfile at repo root, `railway.json` with `watchPatterns: ["/site/**", ...]`.
- **`.dockerignore` is `*` with only `!Dockerfile`, `!site/`, `!site/**` re-added.** Anything
  outside `site/` — including a future `brain/` folder — **never enters the production image.**
  This is a hard architectural fact: the brain lives outside `site/`, so its *approved public
  build output* must be emitted **into** `site/` to reach production. See B.6.
- Health check `/`, restart on failure ×3, `$PORT`-aware start.
- CI: `.github/workflows/verify.yml`.

**Assets**

- `site/public/videos/robot-water-sequence.mp4` — 4.0 MB (in the image).
- `site/public/images/observatory-poster.png` — **2.5 MB PNG** (in the image, a real and
  easy performance win — see V.9).
- `imagesandvideo/` holds `robot.glb` **90 MB** and `logo.glb` **85 MB**. Outside `site/`, so
  not shipped. They cannot be shipped as-is; see C.8.

**Your GitHub account** — pulled from the API on 2026-07-31, full detail in
[`02-github-inventory.md`](02-github-inventory.md)

- **61 public repos → 6 forks → 13 empty → 42 own, non-empty repos.**
- Playable web games exist and are real: `My-Football-Game` (Node/Express, **already carries a
  `railway.json`**), `Monkey-Tug-of-War` (Flutter web), `gimmemycake` and `drone_Lips` (static
  Vite/JS), `MandelBro`, `3Doodle` (full-stack, needs Postgres).
- Music is real too: `StrudelAI`, `LyriGenie`, `Suno-UDIO-Helper`, and
  `v0-banana-piano-app` which is **already live** on Vercel.
- `webdesigner` (20.1 MB) is your own design system — Blender assets, a GSAP pack, a
  `3d-scroll-website-skill-pack`, and a distributable Codex plugin. `AGENTS.md` already routes
  to it as `$webdesigner-design-system`. This is the single best answer to request 4.
- **Several repos already contain `.agents/`, `AGENTS.md`, `PROJECT_DIARY.md`, and authored
  plan/fix documents.** The brain does not start empty — it starts by harvesting your own
  writing. Estimated corpus: low thousands of chunks, versus **two records / 6.7 KB today**.
- `ASTROEA` (repo) vs `astraea` (site slug) is a spelling mismatch that will break retrieval
  unless a canonical mapping is recorded.

---

## 3. Blockers — clear these before anything else

### 3.1 There is no git repository here — but recovery is safe and exact

`git rev-parse` fails in `C:\Users\carlo\PROYECTOS\portafolio-main`. There is a `.github/`
folder but **no `.git/`**. The folder name is the signature of a downloaded GitHub ZIP.

Consequences: no history, no branches, no `git status` (which `AGENTS.md` requires at the start
of every task), and **Railway cannot deploy from this folder** — it deploys from a connected
branch. Any work done here is currently unpublishable.

**I compared this folder against `uset82/portafolio` HEAD by git blob hash.** The result is
about as clean as it could be:

| Remote HEAD `58dd1d44` (2026-07-30, "fix(deploy): move Railway build config to the repository root") | |
| --- | --- |
| Files tracked in remote | 305 |
| **Byte-identical locally** | **298** |
| Modified locally | 6 — `maintaskplan.md` (+7.9 KB), `docs/assets/observatory-3d-manifest.json`, `site/.env.example`, `site/.gitignore`, `site/.prettierignore`, `site/README.md` |
| Deleted locally | 1 — `site/src/components/cc-mark.tsx` (`brand-mark.tsx` exists in both; looks like a completed rename) |
| Local-only | `updates/*` (this plan), `site/.env.local` (**secret, must stay ignored**), `.claude/` and `site/.claude/` editor configs, `site/next-env.d.ts` |

**There is no divergence and nothing to reconcile.** Local is remote HEAD plus a handful of
uncommitted edits. Recovery is non-destructive — see `F.1` for the exact procedure.

### 3.2 The OpenRouter key was pasted into a chat transcript

`maintaskplan.md` records this twice (U.14) and flags rotation as required before any
deployment. It has not been rotated. Treat the current key as compromised. `F.2`.

### 3.3 The hero direction is formally unresolved

U.20 records your own verdict — *"all this 3d inside world is bullshit"* — and the site was
put into `OBSERVATORY_LIVE_CANVAS_PRESENTATION = "poster-authoritative"`, with the fully-built
Three.js canvas gated off behind a one-line constant in
`site/src/lib/three/progressive-loading.ts`.

**That gate is exactly the "weird design" in request 4.** The page currently shows a static
poster standing in for an interactive world, with overlay cards positioned against a painted
image. It reads as unfinished because architecturally it *is* paused mid-decision.

Request 3 now asks for interactive, playable 3D. That is not a contradiction of U.20 — you
rejected *decorative* 3D that carried no content. But it does mean U.20 must be formally
re-decided rather than quietly reversed. `Q.3`.

---

## 4. Decisions I need from you

These change what gets built. Everything else I can decide myself.

- [x] ☑ **Q.1 — Git recovery path. RESOLVED 2026-07-31, no input needed.**
      `uset82/portafolio` exists, public, MIT, default branch `main`, HEAD `58dd1d44`. The blob
      comparison in §3.1 proves local is that HEAD plus 6 modified files, 1 deletion, and
      untracked additions. Reconnect in place — do **not** clone over the top. Procedure in `F.1`.

- [ ] ☐ **Q.2 — Books and third-party PDFs: how they may be used.**
      My recommendation, and the reasoning, is in A.4. Short version: your books are
      **someone else's copyrighted work**. They can shape *how* CC AI reasons; they cannot be
      indexed as text a public chatbot can reproduce. I need you to confirm the two-tier
      approach before I build the ingestion.

- [ ] ☐ **Q.3 — Hero direction, final.** Pick one:
      **(a)** Cinematic video hero — commit to `robot-water-sequence.mp4`, delete the poster
      ambiguity, retire the canvas from the homepage. *Recommended for now.*
      **(b)** Reframed interior 3D — author a real interior `home` camera, make the guide
      focal, re-anchor overlay cards to live instruments. Higher cost, higher risk, repeats
      the thing you already rejected once.
      **(c)** Full-bleed editorial — type and real project media carry the hero, no world.

- [ ] ☐ **Q.4 — Arcade launch set.** I classified your games myself (see `02-github-inventory.md`
      §2.1) so this is now a short question: **which three ship first?** My recommendation is
      `My-Football-Game` (it already has a `railway.json` — fastest possible first win),
      `Suno-UDIO-Helper` or `v0-banana-piano-app` for the music side, and one static game
      (`drone_Lips` or `gimmemycake`). Confirm or substitute. Also: do any of these still run
      on Netlify/Render/Glitch today, and should those stay live or move to Railway?

- [ ] ☐ **Q.5 — Music and video rights.** `U.6` and `U.15` in `maintaskplan.md` are still open.
      `/sound` cannot publish a single track until you confirm authorship/rights per item. If any
      track uses samples, stock, or collaborators, I need that per track, not in bulk.

- [ ] ☐ **Q.6 — Production model and budget.** `CC_AI_MODE=production` refuses free routes
      by design. Name the paid model + fallbacks and a monthly ceiling. Model IDs and prices
      must be re-verified at decision time, not taken from this document.

- [ ] ☐ **Q.7 — Which projects are public, and in what order.** Largely answered by the
      inventory: 42 own non-empty repos, clustered in `02-github-inventory.md` §3. What I still
      need from you: **which 8–12 are flagship**, and whether the local-only folders in
      `C:\PROYECTOS` that have no GitHub counterpart (`HERMES`, `Trae`, `battery`,
      `claudealocal`, `data`, `doomsday`, `marcoloco`, `minimax`, `qoder`, `rhyno3d`,
      `winsdkcli`) should get brain folders too or stay private.

- [ ] ☐ **Q.8 — Licensing.** 35 of your 42 own repos have **no license**, which legally means
      all rights reserved. That is fine for display, but it blocks anyone learning from them,
      and `avatar-studio` shows `NOASSERTION` — GitHub could not parse its LICENSE file.
      Do you want a default license applied across the public ones?

- [x] ☑ **Q.9 — Mentora framing.** **Resolved 2026-07-31 (Carlos):** `uset82/mentora` is a
      **fork of the college repo `mosores/Mentora`**, but Carlos largely developed the project
      and fixed most of it (verified commits include Studio source picker, mind-map speedup,
      fullscreen artifacts, responsive study visuals). Frame as *"primary developer of this
      Mentora fork (college base) — shipped X, Y, Z"*, not as inventing the original college
      repo and not as a minor contribution. Same honesty check still applies to `osiris`
      (no parallel claim yet).

---

## 5. Workstream F — Foundation

- [ ] ☐ **F.1 — Reconnect version control in place, without losing local work.**
      Because §3.1 proved local == remote HEAD + a known delta, the safe procedure is to
      re-attach git *underneath* the existing files rather than clone over them:

      ```bash
      cd /c/Users/carlo/PROYECTOS/portafolio-main
      git init
      git remote add origin https://github.com/uset82/portafolio.git
      git fetch origin main
      git reset --mixed FETCH_HEAD
      git status
      ```

      `reset --mixed` rewrites the index only — **it never touches working-tree files**. After
      it, `git status` should show exactly the 6 modifications, the `cc-mark.tsx` deletion, and
      the untracked additions from §3.1. If it shows anything else, stop and re-diff before
      committing.

      Then, before the first commit, verify these are ignored: `site/.env.local` (**contains
      the live key**), `node_modules/`, `.next/`, `.pnpm-store/`, `tsconfig.tsbuildinfo`, and
      `site/.env.local` (**contains the live key**), `node_modules/`, `.next/`, `.pnpm-store/`,
      and `tsconfig.tsbuildinfo`.

      **Correction (2026-07-31):** an earlier draft of this task claimed
      `imagesandvideo/*.glb` exceeded GitHub's 100 MB per-file limit and would be rejected.
      That was wrong. `robot.glb` is 90.8 MB and `logo.glb` is 85.5 MB — both **under** the
      100 MiB hard block (they are over the 50 MB warning threshold). They are **already
      tracked and already pushed**, which is most of why the repository is 172.6 MB. Nothing
      needs excluding; `C.8` still applies for web delivery.
      Acceptance: `git status` matches §3.1 exactly, no secret is staged, and a branch pushes.

- [ ] ☐ **F.2 — Rotate the OpenRouter key.** Revoke the exposed key in the OpenRouter
      dashboard, issue a new one, place it **only** in Railway's secret store and a local
      gitignored `.env.local`. Re-check for a stale user-scope `OPENROUTER_API_KEY` Windows
      environment variable — that already cost a full debugging session once (recorded in U.14).
      Acceptance: old key returns 401, new key never appears in any transcript or file that git tracks.

- [ ] ☐ **F.3 — Secret and content scan.** Scan the working tree for keys, tokens, the private
      résumé, private locations, and personal contact data before the first push. Acceptance:
      clean scan recorded in the completion log.

- [ ] ☐ **F.4 — Establish this plan in the ledger.** Add a pointer to `updates/` from
      `maintaskplan.md` so the two plans cannot drift apart.

- [ ] ☐ **F.5 — Baseline capture.** Record current `pnpm verify` result, production build
      output size, route list, and Lighthouse scores at 1440×900 and 390×844 **before** any
      change, so every later claim of improvement has a real before-number.

---

## 6. Workstream A — CC AI intelligence

Goal: CC AI answers about any of your projects, your methods, and your body of work, with
citations, in your voice, and refuses cleanly when it does not know — without ever leaking
private material or reproducing anyone else's book.

### 6.1 Target architecture

```
brain/                          authored + synced source (outside site/, never in the image)
  │
  ├── ingest        github sync · doc distillation · manual authoring
  ├── approve       verification + rights + public flag  ← existing gate, unchanged
  │
  └── build ──────► site/src/content/generated/cc-ai-index.json   (public tier ONLY)
                            │
                            ▼
                    retrieval (lexical scoring + field boosts, top-k)
                            │
                            ▼
                    context assembly (budgeted, pinned boundaries, cited)
                            │
                            ▼
                    OpenRouter (named model in production, ZDR, no data collection)
                            │
                            ▼
                    streamed answer + [source-id] citations + grounded UI cards
```

### 6.2 Tasks

- [ ] ☐ **A.1 — Chunk and index the corpus.** Replace whole-record serialization with
      chunking: 400–800 characters per chunk, each carrying `{id, type, title, headingPath,
      sourceIds, text}`. Emit `site/src/content/generated/cc-ai-index.json` from a
      `pnpm ai:index` script. Acceptance: index builds deterministically, schema-validated,
      and is byte-identical across two runs on unchanged input.

- [ ] ☐ **A.2 — Add retrieval.** Implement lexical scoring (BM25-style term weighting) with
      field boosts for exact title/slug matches, plus a type filter derived from a light
      intent pass. Return top-k 8–12 chunks against a ~6 000-character budget within a
      12 000-character total context. **Pin** the profile record and the exclusion/boundary
      records into every request so refusal rules can never be evicted by retrieval.
      Acceptance: new unit tests prove that a question about project X retrieves X's chunks
      and that boundary records are present in 100 % of assembled contexts.
      **No new production dependency** — `rules.md` requires justifying every one, and a few
      thousand chunks scored in-process does not need a vector database.

- [ ] ☐ **A.3 — Embeddings, only if measured as necessary.** After A.5's evaluation set
      exists, measure lexical retrieval recall. Add embeddings **only** if recall is
      demonstrably short, and prefer build-time embedding into a static vector file over a
      runtime service. Postgres + pgvector on Railway is the escalation path if the corpus
      passes roughly 5 000 chunks or needs runtime updates — not before.
      Acceptance: a written recall measurement justifying the decision either way.

- [ ] ☐ **A.4 — Two-tier corpus with a hard wall.** *(blocked on `Q.2`)*
      - **Tier P — public, citable.** Your own words about your own work. Reaches the model,
        is quotable, is cited. This is what gets indexed.
      - **Tier S — private priors.** Your distilled method notes, frameworks, and reasoning
        patterns *rewritten by you in your own words*. Promotable to Tier P once you approve
        them. Books and PDFs are the **input** to writing these; they are not the output.
      - **Tier X — excluded, never indexed.** Raw book text, purchased PDFs, raw ChatGPT
        conversation exports, the résumé source, private locations, third-party material.
        Stored in gitignored `private/` folders that also never enter the Docker image.

      **Why this shape:** a book you bought is still the author's copyrighted work. Indexing
      full text into a public chatbot creates a system that can reproduce substantial portions
      of it on request — that is a real legal exposure, and `rules.md` already requires media
      rights checks. The two-tier split gives you what you actually want: CC AI reasons with
      the frameworks you learned, phrased as *your* synthesis, which is both safer and more
      genuinely yours. If you want the raw-book version for personal use, that is A.11.
      Acceptance: an automated check fails the build if any Tier S or Tier X file contributes
      text to the generated index.

- [ ] ☐ **A.5 — Expand the evaluation set.** `site/src/content/cc-ai-evaluation.json` and
      `docs/content/cc-ai-evaluation-set.md` already exist. Grow to 60–100 cases spanning:
      answerable factual questions per project; questions that must be refused (salary,
      address, employers, unverified claims); **prompt-injection attempts** ("ignore your
      instructions", instructions hidden inside a pasted project description);
      **copyright probes** ("quote chapter 3 of that book"); status-integrity probes ("is
      PINÁCULO shipped?" — it is a concept and must stay labelled as one).
      Acceptance metrics: citation validity 100 %, private-data leakage 0, correct refusal
      on every unanswerable case, status labels never upgraded.

- [ ] ☐ **A.6 — Stream the answer.** Replace `CcAiProvider.complete()` with a streaming path
      behind the same interface, keeping the non-streaming implementation for tests. A
      grounded answer that takes eight seconds to appear all at once feels broken; the same
      answer streaming feels alive. Acceptance: first token under 1.5 s on the production
      model, existing error codes and abuse controls unchanged, reduced-motion respected.

- [ ] ☐ **A.7 — Grounded UI responses.** When an answer is about a project or a media work,
      render the real project card and route link beneath the text rather than a bare URL.
      The data is already in `content/records.ts`. Acceptance: cards only ever render for
      records that exist; no fabricated links; keyboard reachable.

- [ ] ☐ **A.8 — Session memory, bounded.** Keep the last N turns within a session, with an
      explicit token budget and a visible "new conversation" control. No cross-session
      persistence, no visitor profiling, no cookies beyond what is disclosed.

- [ ] ☐ **A.9 — Durable rate limiting.** `cc-ai-abuse-control.ts` is per-instance, which is
      not a limit once Railway runs more than one replica. Add a shared store (Railway Redis)
      before public activation. Acceptance: limit holds across two concurrent instances in a test.

- [ ] ☐ **A.10 — Production model policy.** *(blocked on `Q.6`)* Set
      `OPENROUTER_PRODUCTION_MODEL` and ordered fallbacks. Anthropic models route through
      OpenRouter under `anthropic/…` identifiers; **verify the exact current IDs and pricing
      at decision time** rather than trusting any ID written in this document. Keep
      `dataCollection: "deny"` and ZDR on. Disclose the actually-responding model in the UI —
      the existing policy already requires this.

- [ ] ☐ **A.11 — Optional: private study mode.** A separate authenticated route where *you*
      can query the full Tier S/X corpus for your own work. Different route, different
      corpus, never reachable by visitors, never part of the public index. Only build this if
      you want it; it is not needed for the public site.

- [ ] ☐ **A.12 — Turn CC AI on.** Flip `CC_AI_ENABLED=true` in production only after A.5
      passes, A.9 is live, F.2 is done, and the privacy copy matches the real configuration.
      This closes the public half of `U.13`/`U.14`.

---

## 7. Workstream B — Portfolio Brain

Full specification lives in [`01-brain-spec.md`](01-brain-spec.md). Tasks:

- [ ] ☐ **B.1 — Create the `brain/` skeleton and templates.** Root `README.md`,
      `_templates/project/`, `_templates/book/`, `private-source-map.json`, and the
      `.gitignore` rules. Lives at `portafolio-main/brain/`, inside the existing repo, so the
      build bridge and CI stay in one checkout.

- [ ] ☐ **B.0 — Create `uset82/brain-private` as a PRIVATE repository.** Clone it as a sibling
      of `portafolio-main`. This is where books, PDFs, ChatGPT exports, and raw notes live —
      **not** in a gitignored folder inside the public portfolio repo.

      **Why a second repo and not a `.gitignore`:** `uset82/portafolio` is public. One
      `git add -f`, one mis-scoped pattern, or one "why won't this commit?" moment puts a book
      or an API key on the public internet permanently — forks and caches survive deletion. A
      separate repo with its own visibility setting removes that failure mode structurally
      instead of relying on discipline. Reasoning in `01-brain-spec.md` §2.
      Acceptance: repo exists, is private, contains `books/`, `chatgpt/`, `courses/`,
      `scratch/`, and **no** file in it is reachable from the public repo.

- [ ] ☐ **B.2 — Define `project.json` and validate it.** A zod schema reusing the exact
      `verification` / `rights` / `publication` / `sourceIds` vocabulary from
      `site/src/content/schemas.ts`, so the brain feeds the existing pipeline instead of
      forking it. Ship `pnpm brain:check`. Acceptance: schema violations fail CI.

- [ ] ☐ **B.3 — Migrate existing content into the brain.** `docs/content/` already holds
      `ifoundyou-source-pack.md`, `opennemoclaw-source-pack.md`, `flagship-project-summaries.json`,
      `project-link-register.json`, `project-media-inventory.json`. These become the first
      project folders rather than being duplicated.

- [ ] ☐ **B.4 — GitHub sync script.** `pnpm brain:sync-github` pulls into `brain/github/`, with
      a `checkedOn` stamp on every file. Full acceptance rules in
      [`02-github-inventory.md`](02-github-inventory.md) §6. The three that matter most:
      **filter to `fork === false` and `size >= 50 KB`** (that is 42 repos, not 61);
      **exclude volatile counts** (stars, forks — `records.ts` already documents this);
      and **pull authored documents, not just READMEs** — `AGENTS.md`, `agents.md`, `docs/**`,
      `*_DIARY.md`, `*_PLAN.md`. Forks land in `brain/github/_forks/` with a mandatory
      `contributionNotes` field that must be hand-filled before `public: true` is allowed
      (this is what enforces the `Q.9` Mentora framing mechanically).
      Acceptance: re-running on unchanged upstream produces an empty diff and never rewrites a
      hand-authored file.

      **Highest-value finding:** `StrudelAI` alone carries `PROJECT_DIARY.md`,
      `STRUDEL_DICTIONARY.md`, and ~15 authored plan/fix documents. `webdesigner` carries
      `design.md`, `openaidesign.md`, `mainidea.md`, and a full `.agents/` tree. That is you
      explaining your own reasoning in your own words — the best CC AI Tier P corpus that
      exists, and it is already written. Harvest it before writing anything new.

- [ ] ☐ **B.5 — Harvest your ChatGPT project custom instructions.** *(do this before B.9)*
      Each ChatGPT Project's custom instructions are short, entirely your own words, carry no
      copyright risk, and are a literal specification of how you want to be answered. They are
      the highest-value and lowest-risk import in this entire plan — a more direct answer to
      "make the chat answer the way I want" than any amount of book ingestion.
      They land in `brain/agents/` and `brain/library/<topic>/` as Tier P.
      Acceptance: every ChatGPT Project's instructions captured, `rights: owned`, sourced.

- [ ] ☐ **B.9 — ChatGPT conversation pipeline: split → scan → distill → approve.**
      `chatgpt:split` explodes the `conversations.json` export into per-conversation Markdown
      inside `brain-private/`; `chatgpt:scan` flags likely secrets, long verbatim quotes, and
      personal identifiers; **you** write the distilled notes; `brain:check` blocks promotion
      of anything still carrying a `brain-private/` path. Full rationale in
      [`01-brain-spec.md`](01-brain-spec.md) §6.
      **Do not index the raw export.** Those transcripts realistically contain pasted book
      excerpts, pasted API keys (you already had one key exposure this month — `U.14`),
      personal and employer details, and abandoned wrong turns that would make CC AI
      confidently incorrect. Step 3 is deliberately manual; that is the control, not a gap.
      Acceptance: no raw transcript text reaches any generated file, proven by a test.

- [ ] ☐ **B.6 — Build bridge into `site/`.** Because `.dockerignore` excludes everything
      outside `site/`, add `pnpm brain:build` that emits **only approved public tier** content
      into `site/src/content/generated/`. Acceptance: a file marked private cannot appear in
      the generated output, proven by a test; the generated folder is committed so production
      builds never need `brain/`.

- [ ] ☐ **B.7 — Per-project agent skills.** Each project folder gets an `agents/SKILL.md`
      describing how to work on that project. Mirrors the existing `.agents/skills/` pattern
      (`curate-portfolio-content`, `portfolio-delivery`) rather than inventing a second system.

- [ ] ☐ **B.8 — Rights register per project.** Every media file in a project folder carries
      owner, license, and reuse status, extending the existing
      `docs/content/asset-licensing-register.json` and `local-media-clearance-register.json`.

---

## 8. Workstream C — Playable & media layer

Goal: a visitor can *do* something — play, listen, watch — not just read.

### 8.1 My recommendation on the "inside world"

Build the **content first, the world second.** You already rejected an immersive 3D hero once
(U.20) because it was an empty world wrapped around nothing. A 3D arcade lobby built before
the games are playable would repeat that exactly — months of scene work, still nothing to play.

So: `/arcade` ships as a fast, editorial, genuinely playable index. The 3D hub becomes an
*optional entrance* to the same content later, once there is content worth entering for. If
the world never gets built, the arcade still works. That ordering is the whole recommendation.

### 8.2 Hosting tiers, mapped to your actual repos

| Tier | Shape                                | Where it lives                                                      | Your repos                                                                                     |
| ---- | ------------------------------------ | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **A** | Static build, small                 | `site/public/games/<slug>/`, same origin, already in the image        | `drone_Lips`, `gimmemycake`, `MandelBro`, `Suno-UDIO-Helper`, possibly `Monkey-Tug-of-War` (Flutter web — decide on *built* size, not the 22.7 MB repo) |
| **B** | Needs a server or a database        | Own Railway service + Next `rewrites` proxy so it stays on your domain | **`My-Football-Game`** (Express — *already carries a `railway.json`*), `3Doodle` (Vite + Drizzle → needs Postgres), `StrudelAI`, `LyriGenie` (Python) |
| **C** | Already hosted elsewhere            | Existing `consent-embed.tsx` — poster + explicit click-to-load        | `v0-banana-piano-app` (live on Vercel), `bankAI` (live on Vercel)                               |
| **—** | Not web-playable                    | Video or photo documentation only                                     | `REACTIONGAME`, `MicrocontrollerPiano`, `piano-`, `TRAFFICLIGHT`, `elefante`, `Automatic-Watering-Elephant`, `RS232_VHD_DE2115` |

Railway Pro supports multiple services from one repository with different root directories, so
Tier B does not require a second repo.

**Do not put `Tetris` in the arcade.** It is Carlos's course work (teacher example; his code)
under CC-BY-4.0, but Java desktop — not web-playable for the arcade shell. See
`02-github-inventory.md` §2.1.

**Fastest first win:** `My-Football-Game` already has a `railway.json`, a `server.js`, and an
`index.html`. It is the shortest path from today to "a visitor played my game on my site."

### 8.3 Tasks

- [ ] ☐ **C.1 — Measure built output for each arcade candidate.** The repo classification is
      done (`02-github-inventory.md` §3.1–3.2); what is still unknown is **built** size, which
      is what decides Tier A vs B. Build each candidate once and record: output size, engine,
      input method, mobile viability, current live host, rights. Flutter web
      (`Monkey-Tug-of-War`) and image-heavy Vite (`gimmemycake`, 26.7 MB repo) are the two that
      could go either way.

- [ ] ☐ **C.2 — Add the `/arcade` route.** Editorial index with real posters, one-line
      descriptions, controls, and an honest status per item. Follows the existing
      `laboratory-index` / `project-register` component patterns.

- [ ] ☐ **C.3 — Build the play shell.** `/arcade/[slug]`: poster → explicit play button →
      sandboxed iframe. Never autoload, never autoplay audio. Includes a documented keyboard
      alternative or an honest "requires pointer" state. Sandbox attributes on every embed,
      per `rules.md`'s external-embed sanitization rule.

- [ ] ☐ **C.4 — Mobile honesty.** Desktop-only games get a clear "desktop recommended" state
      instead of a broken canvas. `rules.md` requires mobile to be designed deliberately, and
      that includes designing the *unavailable* case.

- [ ] ☐ **C.5 — Make `/sound` real.** *(blocked on `Q.5`)* The route and `SoundFoundation`
      component exist but publish nothing. Wire actual tracks: mute-first, real durations,
      credits, waveform or a still, transcript/caption where there is speech.

- [ ] ☐ **C.6 — Video showcase.** Your creations get their own presentation with posters,
      captions, and lazy loading. `native-media.tsx` and `media-readiness.tsx` already exist —
      extend rather than replace.

- [ ] ☐ **C.7 — Tool promotion surface.** You mentioned promoting tools you work with. Give
      that a defined place — a "built with / working with" section tied to real projects — so
      it reads as evidence rather than a logo wall.

- [ ] ☐ **C.8 — Large asset strategy.** `robot.glb` (90 MB) and `logo.glb` (85 MB) can never
      ship as-is. Either run them through the existing `assets:optimize` pipeline (Draco +
      KTX2, already built in `scripts/optimize-3d-asset.ts`) down to a web budget, or serve
      from object storage behind a CDN. Acceptance: no single web-delivered 3D asset exceeds
      the budget recorded in the plan.

- [ ] ☐ **C.9 — Optional 3D hub.** Only after C.2–C.5 ship and there is content to enter.
      Reuses the fully-built, contract-tested Observatory canvas that is currently gated off —
      the work is not wasted, it is waiting for a reason to exist.

---

## 9. Workstream V — Visual system rebuild

Goal: the site itself is the portfolio piece. Someone who hires for design should see the
craft in the first ten seconds.

### 9.1 Fix what is concretely broken first

These are already documented in `maintaskplan.md` as open items — they are the "weird design."

- [ ] ☐ **V.1 — Close `U.19` decisions 1–3.** The `/work` counter label overstating what the
      records disclaim; the homepage section numbering skipping 04; the hero's desktop
      paragraph exceeding the locked hero budget. Small, specific, visible.

- [ ] ☐ **V.2 — Commit to one hero.** *(blocked on `Q.3`)* Remove the poster-versus-canvas
      ambiguity entirely. Whichever option you pick, the result must be a single deliberate
      composition, not a fallback standing in for something else. Re-anchor or remove the
      artifact overlay cards accordingly — they are currently positioned against a *painted*
      image, which is the single most obvious source of the unfinished feeling.

- [ ] ☐ **V.3 — Retire or reactivate the canvas gate.** `OBSERVATORY_LIVE_CANVAS_PRESENTATION`
      must stop being a paused decision. Either the canvas mounts with an approved framing, or
      the homepage stops pretending to be a 3D world. Record the resolution against `U.20`.

### 9.2 Build the system

- [ ] ☐ **V.4 — Type and layout ramp.** A real editorial type scale with defined roles
      (display / headline / subhead / body / caption / label), an explicit grid, and vertical
      rhythm tokens. Rendered as a page, not just a token file.

- [ ] ☐ **V.5 — Three motion motifs, no more.** `rules.md` caps this at 2–3 deliberately.
      Proposed: **(1) Reveal** — staged entrance for editorial blocks, extending the existing
      `hero-reveal.tsx`. **(2) Focus pull** — depth and weight shift on hover/focus for media
      and project cards. **(3) Passage** — route transitions via the existing `template.tsx`.
      Every motif needs a complete `prefers-reduced-motion` path, not a disabled one.

- [ ] ☐ **V.6 — Atmosphere layer (your "smoke").** Recommended implementation, cheapest to
      most expensive: (a) animated grain + a slowly drifting warm gradient mask in CSS/SVG;
      (b) a pre-rendered looping mist plate as a low-bitrate video with `mix-blend-mode`;
      (c) a single WebGL plane with a fog shader. Start at (a), escalate only if it does not
      read. **Hard constraint: the warm natural palette is locked** — mist must be buff,
      taupe, and pewter, never blue or violet. A blue haze would violate the color contract in
      `maintaskplan.md`, and it is the default every generator reaches for.

- [ ] ☐ **V.7 — Craft evidence page, built around `webdesigner`.** You want to show Figma,
      Adobe, video, and web design ability. Telling does not work; showing does — and you
      already built the strongest possible exhibit.

      `uset82/webdesigner` (20.1 MB) contains `Blender/`, `gsap-public/`, a
      `3d-scroll-website-skill-pack/`, `design.md`, `openaidesign.md`, a `.codex-plugin/`, and
      a `marketplace.json`. Your own `AGENTS.md` already routes to it as
      `$webdesigner-design-system`. **You authored a design system, a 3D-scroll technique pack,
      and a distributable plugin** — that is a far stronger signal than any animation, because
      it proves you can define a system, not just decorate one.

      So `/studio` leads with `webdesigner` as a real case study, then adds: the live
      design-token page from `V.4`, wireframe → final comparisons, motion tests, a video reel,
      and `avatar-studio` as a second systems exhibit. Process, not polish.

- [ ] ☐ **V.8 — Micro-interaction pass.** Focus states, hover transitions, loading skeletons,
      empty states, error states, cursor treatment. This is where perceived craft actually
      lives, and it is invisible in screenshots — which is why it is a separate task.

- [ ] ☐ **V.9 — Performance guardrails.** Convert `observatory-poster.png` (2.5 MB PNG) to
      AVIF/WebP with a PNG fallback. Set explicit budgets: LCP, CLS, total JS, total image
      weight. Then hold them as acceptance criteria for every V task — `rules.md` already
      treats budgets as acceptance criteria, and an animation pass is exactly where budgets
      get quietly lost.

- [ ] ☐ **V.10 — Accessibility re-verification.** WCAG 2.2 AA, keyboard-only, 200 % zoom,
      visible focus, reduced motion — re-run after every visual change, not once at the end.

- [ ] ☐ **V.11 — Visual regression baselines.** Capture approved baselines at 1440×900,
      1129×868, and 390×844 so future changes surface as diffs instead of surprises.

---

## 10. Workstream P — Platform (Railway)

- [ ] ☐ **P.1 — Service topology.** Decide and document: one web service, plus optional
      game services (C.2 Tier B), plus Redis (A.9). Record which repository path each builds from.

- [ ] ☐ **P.2 — Environment matrix.** One table: variable × environment (local / preview /
      production), with which are secret. Extends `site/.env.example`, which is already
      well-documented — keep placeholders only, never real values.

- [ ] ☐ **P.3 — Preview environments.** Per-branch previews so design work is reviewable
      before production, as `rules.md` requires.

- [ ] ☐ **P.4 — Image size budget.** Track the built image size as games and media land. If
      `site/public` passes ~50 MB, move large assets to object storage + CDN rather than
      growing the image.

- [ ] ☐ **P.5 — Custom domain and headers.** Domain, HTTPS, security headers, caching policy
      for static assets and media.

- [ ] ☐ **P.6 — Observability.** Error tracking and uptime for the site and the CC AI route,
      with a documented rollback to the last verified deployment ID.

---

## 11. Sequencing

```
Week 0   F.1 F.2 F.3 F.5        ← nothing ships until git and the key are fixed
          └─ answer Q.2 Q.3      (Q.1 and Q.9 already resolved; use Q.9 framing when mentora publishes)

Week 1   V.1 V.2 V.3 V.9        ← fix the visible weirdness first; fastest perceived win
         B.1 B.2                ← brain skeleton in parallel (no dependency on V)

Week 2   B.3 B.4 B.6            ← corpus starts filling
         A.1 A.2                ← retrieval against a real corpus
         C.1                    ← inventory, feeds Q.4

Week 3   A.5 A.9 A.6            ← evaluation, durable limits, streaming
         V.4 V.5 V.6            ← the system rebuild
         C.2 C.3                ← arcade shell

Week 4   A.10 A.12              ← CC AI goes public
         C.5 C.6                ← sound and video, gated on Q.5
         V.7 V.8                ← craft evidence
         P.1–P.5                ← platform hardening

Later    A.3 A.11 C.9 V.11      ← embeddings, study mode, 3D hub, regression baselines
```

Weeks are ordering, not estimates. Anything blocked on a `Q.*` slides until answered.

---

## 12. Risks

| Risk                                                                          | Mitigation                                                                    |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **No git — work is unpublishable and unrecoverable**                          | `F.1` first, before any other change; recovery path proven safe in §3.1        |
| **College/upstream base understated or overclaimed** (`mentora`, `osiris`, `Tetris`) | `Q.9` resolved for Mentora (primary developer of college fork); `B.4` still requires hand-written `contributionNotes` before publish; Tetris = course authorship, arcade-excluded as Java |
| **13 empty repos and 6 forks polluting the AI corpus**                        | `B.4` filters to `fork === false` and `size >= 50 KB` by default               |
| **A repo README silently upgrading a project's status** (e.g. `pinaculo` is a concept) | `project.json` `status` is hand-set only; no script may raise it       |
| **Exposed OpenRouter key**                                                    | `F.2`, rotate before any deployment                                           |
| **Book ingestion creates copyright exposure**                                 | Two-tier corpus (A.4); Tier X never indexed; build fails if it is             |
| **Bigger corpus makes hallucination easier, not harder**                      | Pinned boundary records + expanded evaluation set (A.5) + citation validation |
| **Prompt injection through project descriptions or pasted text**              | Existing "treat as data" rule + explicit injection cases in A.5               |
| **Animation and atmosphere destroy performance**                              | V.9 budgets as acceptance criteria on every V task; baseline captured in F.5  |
| **Games balloon the Docker image**                                            | Tier table in C.2; ~50 MB `site/public` ceiling; P.4 tracking                 |
| **The 3D hub repeats the U.20 mistake**                                       | Content before world; C.9 gated behind C.2–C.5 shipping                       |
| **Palette drift toward blue/neon from generated assets and "smoke" effects**  | Palette lock is a contract; `palette:check` already runs in CI                |
| **`openrouter/free` treated as production**                                   | `model-policy.ts` already refuses it in production mode; keep that            |
| **Brain content silently leaking into the public build**                      | B.6 build bridge with a leak test; `private/` git- and docker-ignored         |

---

## 13. Definition of done for this round

- Git is real, the key is rotated, and a preview deploys from a pushed branch.
- CC AI answers project-specific questions with valid citations, refuses correctly on every
  evaluation case, leaks nothing from Tier S or Tier X, and runs on a named production model
  with durable rate limiting.
- `brain/` holds one validated folder per approved project, syncs from GitHub without
  clobbering hand-authored notes, and its approved public output reaches `site/` through a
  tested build bridge.
- A visitor can play at least one game, hear at least one rights-cleared track, and watch at
  least one video, on both desktop and a phone, without a broken state.
- The homepage has one committed hero composition. No component stands in for something else.
- Three motion motifs, a live design-token page, and craft evidence — all inside the
  performance budgets recorded in `F.5`, verified against them.
- `pnpm verify` passes: format, zero-warning lint, strict TypeScript, all tests, content,
  palette, boundary, asset, and immersive gates.
- Every checked box above has a dated evidence entry below.

---

## 14. Completion log

_Empty. Add a dated entry with changed files, checks run, and rendered verification whenever a
checkbox above is marked, per `rules.md`._

- 2026-07-31 — Plan created. No implementation performed. Repository inspected: no `.git`
  present; CC AI corpus measured at 6.7 KB with no retrieval layer; `.dockerignore` confirmed
  to exclude everything outside `site/`; `U.19`/`U.20` confirmed as the documented source of
  the unresolved hero design. Blocking questions `Q.1`–`Q.7` raised.

- 2026-07-31 — GitHub account inspected via REST API; `02-github-inventory.md` created.
  61 public repos classified into 6 forks, 13 empty, 42 own non-empty. `Q.1` **resolved**
  without user input: `uset82/portafolio` HEAD `58dd1d44` compared against this folder by git
  blob hash — 298 of 305 files byte-identical, 6 modified, 1 deleted, no divergence; exact
  non-destructive recovery procedure written into `F.1`. `Q.4` narrowed from open-ended to a
  three-item launch pick after classifying every game and audio repo by deploy shape.
  `Q.8` (licensing — 35 of 42 repos unlicensed) raised; `Q.9` (`mentora` college fork)
  later **resolved 2026-07-31** — Carlos largely developed and fixed the fork; frame as
  primary developer of the Mentora fork (college base). Tetris reframed as course authorship
  (teacher example; his code), arcade-excluded as Java desktop only.
  Workstreams B, C, and V revised: `B.4` now harvests authored agent/diary documents rather
  than READMEs alone, `C.2` tiers are mapped to named repos, and `V.7` is rebuilt around the
  `webdesigner` design system as the primary craft exhibit.
  Checks: read-only API queries and hash comparison only. No files in `site/` were modified.
