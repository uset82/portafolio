# Portfolio content contract

Date: 2026-07-19  
Runtime source: `site/src/content/schemas.ts`

The TypeScript/Zod schemas are the executable source of truth. This document explains their authoring intent. Content is parsed on the server before a route can render, and `pnpm content:check` reports the exact record path for invalid data.

## Shared states

### Verification

| State                     | Meaning                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| `verified`                | Supported by an approved primary source and checked for publication.                         |
| `user-approved`           | Carlos explicitly approved the wording or fact; further source evidence may still be useful. |
| `reference-approved`      | Approved for visual/design use only; it is not evidence that a project shipped.              |
| `needs-user-confirmation` | Requires a factual decision or source from Carlos.                                           |
| `needs-source-review`     | A source exists or is expected but has not been reviewed.                                    |
| `blocked`                 | Cannot progress until a named dependency is resolved.                                        |
| `rejected`                | Must not be published.                                                                       |

### Rights

`owned`, `permission-granted`, `permissive-license`, `attribution-required`, `pending`, `not-applicable`, and `rejected` distinguish factual verification from permission to publish. `pending` content stays on hold.

### Publication

`draft`, `ready`, `hold`, and `private` control launch eligibility. A record being valid does not make it publishable; launch UI must select only `ready` records.

## Sources and links

- A source has an ID, label, type, owner, public/private flag, and at least one repository-relative path or public URL. Optional review date and notes preserve provenance.
- A link has a stable ID, label, URL/path, purpose, verification state, source IDs, and external flag.
- Source IDs are cross-checked. Unknown references and duplicate content IDs fail validation.

## Media assets

All assets require an owner, source, rights state, verification state, and source IDs.

- Images require dimensions and either useful alt text or an explicit decorative flag with empty alt text.
- Audio is always mute-first and may include duration or transcript data.
- Video requires dimensions, a poster, and either captions or a transcript; duration remains optional.
- External embeds require an absolute provider URL without autoplay parameters, a useful accessible name, explicit privacy-mode state, and an external fallback URL. The UI creates the provider iframe only after visitor consent.
- Embeds require a provider, accessible name, privacy mode, and fallback URL.

## Projects

Every project has an ID/slug, title, tagline, category, status, featured flag, publication state, summary, owner, verification, rights, provenance, stack, links, media, and optional presentation metadata.

Status creates a strict evidence boundary:

- `concept` and `preparation` require a concept statement and must not imply shipped outcomes.
- `shipped`, `maintained`, `prototype`, `experiment`, and `archived` require Carlos's contribution, problem, constraints, and approach. Outcome, learning, and year remain optional when evidence is not yet sufficient.

## Other content types

- Media work: title, kind, status, publication state, summary, credits, media, links, owner, rights, verification, and sources.
- Experience: organization, role, start/end, summary, public location granularity, links, verification, and sources.
- Education: institution, program, optional credential/dates/summary, verification, and sources.
- Trip: public place/time granularity, reflection, at least one image, completed privacy review, verification, and sources.
- Hobby: framing, summary, claims boundary, optional media, verification, and sources.
- Site metadata: identity, locale, eyebrow, headline, supporting statement, current focus, assistant name, two actions, verification, and sources.

## Inventory ledger

`docs/content/content-inventory.json` tracks planned content before it is eligible for the runtime records. Every entry includes owner, source, verification, rights, missing fields, launch priority, decision, requested action, fallback, and launch impact. Any entry not marked `verified` must state at least one gap. This prevents an empty or optimistic record from being mistaken for launch-ready content.

## CC AI knowledge eligibility

The runtime context builder uses only parsed records from this contract; it does not read the files named by provenance references. A knowledge record must be `verified` or `user-approved`, and every referenced source must have `public: true`. Projects and media works also require `publication: ready` plus publishable rights. `reference-approved` means design use only and is never sufficient for factual chat context. A record with mixed public and private provenance is excluded in full.

Eligible records are serialized as whole JSON objects with source IDs under a fixed character budget. The model is instructed to cite those IDs, preserve concept/prototype/preparation status, and state that it does not know when the approved evidence is insufficient. The current content set intentionally produces no eligible knowledge records; task 2.30 remains the source-approval gate.

## Authoring rules

1. Add or update the primary source before adding factual copy.
2. Use the least ambitious accurate status; future intent is not an outcome.
3. Keep rights and factual verification separate.
4. Do not add private locations, private media, credentials, testimonials, metrics, employers, dates, or collaborators without approval.
5. Run `pnpm content:check`, then `pnpm verify` from `site/`.
