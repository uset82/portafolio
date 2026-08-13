# Portfolio Brain

This directory contains public, reviewable knowledge used to describe Carlos Carpio's work. It
is part of the public portfolio repository, so every committed file must be safe to publish.

## Boundaries

- Raw books, PDFs, course files, ChatGPT exports, personal notes, and other private material
  belong only in the separate private sibling repository.
- `private-source-map.json` may record a private repository path for provenance. It must never
  copy or quote the source file.
- `github/` is machine-owned. Sync scripts may replace it, but they must never write to authored
  project, library, or agent folders.
- `projects/`, `library/`, and `agents/` are authored. Scripts may validate or read them but must
  not overwrite them.
- `index/` is generated and ignored. Production receives only reviewed output emitted into the
  site's generated-content directory by the later build bridge.
- `repositories/registry.generated.json` is machine-owned ANA / Repo2Agent audit output. Do not
  hand-edit it. Human corrections belong in `repositories/registry.overrides.json`.
- Phase 2 approved runtime types live in `registry.overrides.json`. Generated inference is not
  activation; every override keeps `enabled: false` until a later phase explicitly turns a
  specialist on.
- Private repository metadata, if discovered, is written only to the gitignored
  `repositories/registry.private.generated.json`. Private contents are never inspected or copied
  into this public repository.

## Promotion rule

Private or excluded source material can become public only after Carlos rewrites it in his own
words, verifies the claims, records reusable rights, and explicitly marks it ready. Promotion is
one-way: excluded source to private synthesis to approved public knowledge. No script promotes a
project, changes its status, or copies private source text.

## Starting a project

1. Copy `_templates/project/` to `projects/<slug>/`, using the same lowercase slug as the site.
2. Replace all placeholders and register public source IDs already known to the site content
   ledger.
3. Write an honest `NOTES.md` and distilled knowledge files in Carlos's own words.
4. Keep publication in draft until verification, rights, public-source, and content checks pass.

The separate `_templates/book/NOTE.md` is only for original distillation. It is never a place for
raw excerpts or copied source text.
