# Portfolio Brain — folder and schema specification

Companion to [`00-master-plan.md`](00-master-plan.md), Workstream **B**.
This is the concrete answer to request 2: *"create and organize a small folder for each of my
projects and GitHub repos inside the portfolio brain, so we can add the skills, agents, books,
PDFs, documentation."*

**Status:** specification only. Nothing has been created.

---

## 1. Design rules

Five rules that everything below follows.

1. **The brain lives outside `site/`.** `.dockerignore` is `*` with only `!Dockerfile`,
   `!site/`, `!site/**` re-added, so `brain/` never enters the production image. That is
   deliberate and must stay true — it is the safety property that keeps private material off
   the internet by construction, not by discipline.
2. **One folder per project. The folder name is the slug** used by the site route, the GitHub
   repo mapping, and the AI index. One identifier everywhere.
3. **Public and private are separated by _repository_, not by a flag or a `.gitignore`.**
   `uset82/portafolio` is a **public** repo. Protecting books, PDFs, and ChatGPT exports with
   nothing but a `.gitignore` inside a public repo is one `git add -f`, one mis-scoped pattern,
   or one "why isn't this committing?" away from being public forever — and a leak to a public
   GitHub repo is permanent, because forks and caches survive deletion. So private material
   lives in a **separate private repository**. That is structural safety, not discipline.
4. **Generated content and authored content never share a folder.** `github/` is machine-owned
   and safe to delete and re-sync. Everything else is yours and is never overwritten by a script.
5. **Reuse the existing vocabulary.** `verification`, `rights`, `publication`, `sourceIds`
   already exist in `site/src/content/schemas.ts` and already gate CC AI. The brain feeds that
   pipeline. It does not invent a parallel one.

---

## 2. Where it lives — two repos, one working folder

You asked for "all the data in one folder." You get that locally. It is **two repositories**
underneath, because one of them is public and one must never be.

```
C:\Users\carlo\PROYECTOS\
│
├── portafolio-main\           ← uset82/portafolio        PUBLIC   (repo #61)
│   ├── site/                    the Next.js app
│   ├── brain/                   ★ public-tier knowledge — the folder you asked for
│   └── updates/                 these plans
│
└── brain-private\             ← uset82/brain-private     PRIVATE  (to create)
    ├── books/                   PDFs, EPUBs — raw, never distilled by a script
    ├── chatgpt/                 raw ChatGPT project exports
    ├── courses/
    └── scratch/                 unfiltered personal notes
```

**Why `brain/` goes inside the portfolio repo rather than its own:** the build bridge
(`brain:build` → `site/src/content/generated/`) needs both sides in one checkout, one CI run,
and one `pnpm verify`. A separate public repo would need a submodule or a sync job — machinery
with no benefit, since `.dockerignore` already keeps `brain/` out of the production image.

**Why private material gets its own repo rather than a gitignored subfolder:** see design
rule 3. Different repo, different visibility setting, no shared `.gitignore` to get wrong.

You still work in one place: `brain-private` is cloned as a sibling, and `brain/` holds a
`private-source-map.json` recording *which* private file a distilled note came from, without
containing the file itself. That gives you traceability without exposure.

---

## 3. Tree

```
brain/                              ← inside uset82/portafolio (public)
├── README.md                       how the brain works; ingest and promotion rules
├── .gitignore                      belt-and-braces: *.pdf, *.epub, exports/**
├── private-source-map.json         note → private-repo path. Paths only, no content.
│
├── _templates/
│   ├── project/                    copy this to start a new project folder
│   │   ├── project.json
│   │   ├── NOTES.md
│   │   ├── knowledge/.gitkeep
│   │   ├── references/links.json
│   │   ├── sources.json
│   │   ├── media/.gitkeep
│   │   └── agents/SKILL.md
│   └── book/
│       └── NOTE.md                 owned distillation template — never raw text
│
├── projects/                       42 candidates — see 02-github-inventory.md §3
│   ├── webdesigner/                your design system — the craft exhibit (V.7)
│   ├── avatar-studio/              seed from docs/content/avatar-studio-source-pack.md
│   ├── strudel-ai/                 richest authored-doc corpus you have
│   ├── ifoundyou/                  seed from docs/content/ifoundyou-source-pack.md
│   ├── opennemoclaw/               seed from docs/content/opennemoclaw-source-pack.md
│   ├── astraea/                    ⚠ repo is ASTROEA — record the slug mapping
│   ├── pinaculo/                   status: concept. Never let a README upgrade it.
│   ├── my-football-game/           first arcade candidate (already Railway-shaped)
│   └── …                           one per approved project — see Q.7
│
├── github/                         GENERATED by brain:sync-github — do not hand-edit
│   ├── inventory.json
│   ├── _forks/                     mentora, osiris … contributionNotes REQUIRED before publish
│   └── <repo>/
│       ├── meta.json               description, topics, languages, license, homepage, checkedOn
│       ├── README.snapshot.md
│       └── authored/               AGENTS.md, PROJECT_DIARY.md, docs/** — the Tier P goldmine
│
├── library/                        book and course distillations — YOUR words only
│   ├── README.md                   restates the copyright rule at the point of use
│   └── <topic-slug>/NOTE.md
│
├── agents/                         cross-cutting skills, mirrors .agents/skills/
│
└── index/                          GENERATED build artifact, gitignored
```

### Inside one project folder

```
brain/projects/<slug>/
├── project.json      manifest — schema-validated, the only machine-read file
├── NOTES.md          your own words: what it is, why, what you learned. Citable.
├── knowledge/        distilled owned notes → these become CC AI Tier P chunks
│   ├── architecture.md
│   ├── decisions.md
│   └── faq.md            questions you actually get asked about this project
├── references/
│   └── links.json    external URLs with checkedOn dates. Links only, no copies.
├── sources.json      pointers into brain-private/ — paths and page refs, never content
├── media/            rights-cleared images/video for the site, with a rights record
└── agents/
    └── SKILL.md      how an agent should work on this project
```

---

## 4. `project.json`

Validated by a zod schema in `scripts/` and enforced by `pnpm brain:check`.

```jsonc
{
  "slug": "opennemoclaw",
  "title": "OpenNemoClaw",
  "type": "software",            // software | hardware | media | research | game | tool
  "status": "prototype",         // concept | prototype | active | shipped | archived
                                 // NEVER upgrade this without evidence — CC AI reads it
  "public": true,                // false ⇒ nothing from this folder reaches the site or AI
  "publication": "ready",        // draft | ready — matches site/src/content/schemas.ts
  "verification": "user-approved", // verified | user-approved | unverified
  "rights": "owned",             // owned | permission-granted | permissive-license
                                 // | attribution-required | not-applicable
  "summary": "One honest sentence.",
  "github": {
    "repo": "uset82/opennemoclaw",
    "public": true,
    "checkedOn": "2026-07-31"
  },
  "playable": {                  // omit unless it is playable
    "tier": "A",                 // A = static in image | B = own Railway service | C = external embed
    "buildSizeMb": 8.2,
    "engine": "phaser",
    "input": "keyboard+pointer",
    "mobile": "supported"        // supported | degraded | desktop-only
  },
  "sourceIds": ["github-uset82"],
  "siteRoute": "/work/opennemoclaw",
  "tags": ["ai", "tooling"]
}
```

**Invariants enforced by `brain:check`:**

- `public: true` requires `rights` in the approved set **and** every `sourceIds` entry to
  resolve to a source marked `public: true` in `site/src/content/records.ts`.
- `publication: "ready"` requires a non-empty `NOTES.md` and at least one `knowledge/` file.
- `status` may never be raised by a script — only by you, with evidence. `pinaculo` is a
  concept and CC AI must keep calling it one.
- No file content from `brain-private` may appear in `project.json`, `NOTES.md`, or `knowledge/`.
  `sources.json` may name a private path; it may never quote from it.

---

## 5. The three tiers, and where each file goes

| Tier                  | Lives in                                | Reaches CC AI | Quotable | Examples                                                       |
| --------------------- | --------------------------------------- | ------------- | -------- | -------------------------------------------------------------- |
| **P — public**        | `NOTES.md`, `knowledge/`, `github/`     | Yes, indexed  | Yes, cited | Your architecture notes, your decisions, repo README facts     |
| **S — private priors**| `brain-private/`, draft `library/` notes | No            | No       | Your rewritten synthesis of a book's framework                 |
| **X — excluded**      | `brain-private/` only                   | Never         | Never    | Book PDFs, purchased courses, raw ChatGPT exports, résumé source |

**Promotion is one direction only: X → (you rewrite it) → S → (you approve it) → P.**
There is no automated path from X to P, and `brain:build` fails the build if one appears.

### On the books — the reasoning, once, in plain terms

You said your books help your projects answer the way you want. That is real and it should
show up in CC AI. The question is *how*.

A book you own is still the author's copyrighted work. If its full text is indexed into a
public chatbot, that chatbot can reproduce substantial parts of it on request — which is a
genuine legal exposure, and `rules.md` already requires clearing reuse rights on every asset
you publish.

What actually gives you what you want: **you write the method down in your own words.** A
`library/<topic>/NOTE.md` holding your synthesis — the framework as you apply it, the parts you
rejected, how it shows up in your projects — is Tier P. It is citable, it is yours, and it is
strictly better as portfolio material than a quoted passage, because it demonstrates that you
*understood* the book rather than that you own it.

The raw PDFs stay in `brain-private/` and remain useful to you locally. If you want full-corpus
retrieval over them for your own use, that is `A.11` — an authenticated private route, a
different corpus, never reachable by visitors.

---

## 6. Your ChatGPT projects — yes, but split them three ways

You asked whether to put your ChatGPT projects in here, and whether to make a personal GitHub
repo for them. **Yes to the repo — make it `uset82/brain-private`, and make it private.**
That repo *is* the ChatGPT store. But a ChatGPT Project is not one kind of thing, and the
three parts inside it have very different value and very different risk.

| Part of a ChatGPT Project | What it is | Tier | Where it goes |
| --- | --- | --- | --- |
| **Custom instructions** | The prompt you wrote telling it how to think and answer | **P — highest value you own** | `brain/library/<topic>/` and `brain/agents/` |
| **Conversations** | Your questions, its answers, your corrections | **S → P after distillation** | Raw in `brain-private/chatgpt/`; distilled notes in `brain/` |
| **Uploaded files** | Books, PDFs, papers, course material | **X — never** | `brain-private/books/` and nowhere else |

### 6.1 The custom instructions are the prize

You said the books help your projects *"answer the way I want."* The thing that actually
encodes "the way I want" is **not the books** — it is the custom instructions you wrote for
each ChatGPT Project. Those are short, they are entirely your own words, they carry no
copyright risk, and they are literally a specification of your reasoning style.

That makes them the single highest-value, lowest-risk import in this whole plan. Harvest them
first. They become `brain/agents/` skills and feed CC AI's system prompt directly — the most
direct possible answer to "make the chat answer the way I want."

### 6.2 Conversations need filtering, not dumping

Raw ChatGPT exports arrive as one large `conversations.json` from **Settings → Data controls →
Export data**. Do not index it. In practice those transcripts contain, mixed together:

- your genuine reasoning and decisions — valuable;
- long pasted excerpts from the books you uploaded — someone else's copyright;
- API keys, tokens, and connection strings pasted in while debugging — you already had one key
  exposure this month (`U.14`), so treat this as likely rather than hypothetical;
- personal, family, employer, and client details;
- abandoned wrong turns that would make CC AI confidently incorrect.

So the pipeline is: **split → review → distill → approve.**

1. `chatgpt:split` explodes `conversations.json` into one Markdown file per conversation,
   grouped by project, into `brain-private/chatgpt/`. Mechanical, no judgement.
2. `chatgpt:scan` flags likely secrets, long verbatim blocks, and personal identifiers, then
   writes a review checklist. Mechanical, no judgement.
3. **You** read the flagged set and write distilled notes into
   `brain/projects/<slug>/knowledge/` or `brain/library/<topic>/`. Judgement, and only yours.
4. `brain:check` refuses to promote anything still carrying a `brain-private/` path.

Step 3 is the one that cannot be automated, and that is the point. A note you rewrote is Tier P
and citable. A transcript you pasted is not.

### 6.3 What this gets you

Once the instructions and distillations are in, CC AI can answer *"how does Carlos approach
X?"* from your actual documented method rather than from a generic model prior — grounded,
cited, and in your framing. That is the real version of "answer basically all my knowledge."

---
## 7. Scripts to build

| Script                     | Command                | Behavior                                                                                                   |
| -------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| `brain:check`              | `pnpm brain:check`     | Validates every `project.json`, checks tier invariants, fails on private references. Runs in CI.            |
| `brain:sync-github`        | `pnpm brain:sync-github` | Refreshes `brain/github/` only. Never touches authored folders. Excludes volatile counts (stars, forks).  |
| `brain:build`              | `pnpm brain:build`     | Emits approved **public tier only** into `site/src/content/generated/`. Fails on any tier violation.        |
| `ai:index`                 | `pnpm ai:index`        | Chunks the generated content into `site/src/content/generated/cc-ai-index.json` for retrieval (task A.1).   |
| `chatgpt:split`            | `pnpm chatgpt:split`   | Explodes a `conversations.json` export into per-conversation Markdown inside `brain-private/chatgpt/`. Writes nothing to the public repo. |
| `chatgpt:scan`             | `pnpm chatgpt:scan`    | Flags likely secrets, long verbatim quotes, and personal identifiers in the split output; emits a review checklist. Flags only — never edits, never promotes. |

`brain:check` joins the existing `pnpm test` chain alongside `content:check`, `palette:check`,
`boundary:check`, and `assets:check`.

The two `chatgpt:*` scripts operate **only** on the private sibling repo and are deliberately
excluded from CI — they read material that CI must never have access to.

### The build bridge, and why it exists

```
brain/  ──brain:build──►  site/src/content/generated/  ──ai:index──►  cc-ai-index.json
(not in image)            (in image, committed)                       (in image, committed)
```

Because `.dockerignore` excludes everything outside `site/`, production **cannot** read
`brain/`. The generated output is therefore committed to git so the Docker build finds it
already present. This is a feature: production ships a reviewed snapshot, and a mistake in
`brain/` cannot reach the internet until someone regenerates and commits it deliberately.

**Required test:** create a fixture with a `public: false` project and a private-path reference, run
`brain:build`, and assert neither contributes a single byte to the generated output.

---

## 8. Ignore rules

The private repo is the real boundary (§2). These patterns are a **second** line of defence for
the case where a book or export gets dropped into the public tree by mistake — belt and braces,
not the primary control.

Add to `brain/.gitignore`:

```gitignore
index/
private/
**/private/
*.pdf
*.epub
*.mobi
exports/
conversations.json
```

`.dockerignore` needs no change — `brain/` is already excluded by the `*` rule. **Verify this
stays true** if anyone ever loosens that pattern; it is the single line standing between the
brain and the production image.

**Pre-commit hook (recommended):** reject any commit to `uset82/portafolio` that adds a `.pdf`,
`.epub`, or a file over ~2 MB outside `site/public/`. A public repo does not get a second
chance at a leak, and the two rules above are the two ways it would realistically happen.

---

## 9. Bootstrapping order

1. `B.1` — create `brain/`, `_templates/`, `.gitignore`, `README.md`.
2. `B.2` — write the schema and `brain:check`, wire into `pnpm test`.
3. Seed **two** project folders by hand: `ifoundyou` and `opennemoclaw`, whose source packs
   already exist in `docs/content/`. Prove the shape works before scaling it.
4. `B.4` — GitHub sync across the 42 filtered repos, reconciled against `Q.7`.
5. `B.6` — build bridge plus the leak test.
6. Fill remaining folders, highest-value first. Recommended order: `webdesigner` (it is the
   `V.7` exhibit), `StrudelAI` (richest authored-doc corpus), `avatar-studio`, then the
   arcade candidates as `C.2` needs them.
7. `B.5` / `library/` — ChatGPT and book distillations, ongoing rather than a one-time push.

Do not create forty-two empty project folders on day one. Two complete folders teach more than
forty-two empty ones, and the schema will change once it meets real content.

**Harvest before you write.** `02-github-inventory.md` §4 lists repos that already carry
`.agents/`, `AGENTS.md`, `PROJECT_DIARY.md`, `STRUDEL_DICTIONARY.md`, `design.md`, and a dozen
authored plan documents. That material is already in your own words and already Tier P. Pull it
in first; write new notes only for the gaps it leaves.
