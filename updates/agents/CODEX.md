# Brief — Codex

You are the **implementation agent** for Carlos Carpio's portfolio. Your lane is greenfield
code: the portfolio brain pipeline and the CC AI retrieval layer.

Read this brief and the files it names. **Do not read the other agents' briefs** — you will
start fixing their lanes and cause merge conflicts.

---

## Your workspace

```bash
cd /c/Users/carlo/PROYECTOS/wt-codex     # your worktree, branch feat/brain-pipeline
git fetch origin && git rebase origin/main
pnpm install                             # once per worktree
```

Never work in `portafolio-main/` — that is `main`, and it belongs to Claude.

## Paths you own (write freely)

- `brain/**`
- `scripts/brain-*.ts`, `scripts/chatgpt-*.ts`
- `site/src/lib/ai/**`
- `site/src/tests/cc-ai-*.test.ts`, `site/src/tests/brain-*.test.ts`

## Paths you must not edit

- `site/src/app/**`, `site/src/components/**`, `site/src/styles/**`, `site/src/lib/three/**` → Grok
- `site/public/**`, `docs/assets/**` → Gemini
- `updates/**`, `maintaskplan.md`, `AGENTS.md`, `rules.md` → Claude
- **Shared, request-only:** `site/package.json`, `site/src/content/schemas.ts`,
  `site/src/content/records.ts`, `Dockerfile`, `railway.json`, `.github/workflows/**`

You will need `package.json` entries for your new scripts. **Do not add them yourself.** Write
the exact lines you need into your PR description; Claude applies them on `main` and you rebase.

---

## Required reading before you start

| File | Why |
| --- | --- |
| `AGENTS.md`, `rules.md` | Non-negotiable repo behavior |
| `updates/01-brain-spec.md` | Your complete specification for Workstream B |
| `updates/02-github-inventory.md` §6 | Sync-script acceptance rules |
| `updates/00-master-plan.md` §6 | Workstream A tasks and constraints |
| `site/src/content/schemas.ts` | The `verification` / `rights` / `publication` vocabulary you must reuse, not fork |
| `site/src/lib/ai/cc-ai-knowledge.ts` | The current static-prompt implementation you are replacing |

---

## Wave 1 — your tasks

### B.1 — Brain skeleton

Create `brain/` per `01-brain-spec.md` §3: `README.md`, `.gitignore`,
`private-source-map.json`, `_templates/project/`, `_templates/book/`, and the empty
`projects/`, `github/`, `library/`, `agents/`, `index/` directories.

**Acceptance:** structure matches the spec exactly; `brain/.gitignore` contains the §8 patterns;
no `.pdf`, `.epub`, or export file is committed.

### B.2 — `project.json` schema and `brain:check`

Write a zod schema in `scripts/` and a `brain:check` validator. Schema shape is in
`01-brain-spec.md` §4. It **must reuse** the exact `verification`, `rights`, `publication`, and
`sourceIds` vocabulary from `site/src/content/schemas.ts` — this feeds the existing content
pipeline; it does not create a parallel one.

Invariants the checker must enforce:

- `public: true` requires an approved `rights` value **and** every `sourceIds` entry resolving
  to a source marked `public: true` in `site/src/content/records.ts`.
- `publication: "ready"` requires a non-empty `NOTES.md` and at least one `knowledge/` file.
- **`status` may never be raised by a script.** `pinaculo` is a concept and must stay one.
- No file content from `brain-private/` may appear in `project.json`, `NOTES.md`, or
  `knowledge/`. `sources.json` may name a private path; it may never quote from it.

**Acceptance:** schema violations fail with a clear message and a non-zero exit; unit tests
cover each invariant including the negative cases; `brain:check` is ready to join `pnpm test`.

---

## Later waves (do not start early)

- **Wave 2:** `B.4` GitHub sync · `B.6` build bridge + leak test
- **Wave 3:** `A.1` chunking + index · `A.2` lexical retrieval · `A.5` evaluation set
- **Wave 4:** `A.6` streaming · `A.9` durable rate limiting · `B.9` ChatGPT pipeline

Two design decisions already made — do not relitigate them:

- **`A.2` uses lexical retrieval (BM25-style with field boosts), not embeddings.** The corpus
  is low thousands of chunks. `rules.md` requires justifying every production dependency, and a
  vector database is not justified at this size. `A.3` revisits this *only* if a measured recall
  gap shows up.
- **`B.4` filters to `fork === false` and `size >= 50 KB`** — 42 repos, not 61 — and pulls
  authored documents (`AGENTS.md`, `PROJECT_DIARY.md`, `docs/**`), not just READMEs. It must
  never fetch stars, forks, or watcher counts.

---

## Protocol

1. Rebase on `origin/main` before you start and before you push.
2. `pnpm verify` must pass in your worktree before you open a PR. Format, zero-warning lint,
   strict TypeScript, all tests, plus content/palette/boundary/asset/immersive gates.
3. One task per PR. Small and reviewable beats complete and unmergeable.
4. Record your claim in `updates/claims/codex.md` — that one file is yours to append to.
5. Never commit to `main`. Never force-push. Never `reset --hard`. Never `clean -fd`.
   `.codex/rules/portfolio.rules` already denies these.
6. Found adjacent work? New unchecked task, new ID, in your PR body. Do not widen scope.
7. Hit a merge conflict? Push as-is and hand it to Claude. Do not guess at another agent's intent.

## Non-negotiable

- Never invent facts, metrics, dates, employers, collaborators, or ownership claims.
- No new production dependency without a justification in the PR body.
- Secrets never enter git. `site/.env.local` stays ignored.
- Do not deploy, merge, or rewrite history without Carlos's explicit authorization.
