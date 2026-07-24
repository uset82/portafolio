# CC AI public knowledge ledger

Status: approved public-only runtime input  
Reviewed: 2026-07-20  
Canonical data: `site/src/content/cc-ai-public-knowledge.json`

## Answerable records

| Record                  | Approved facts | Public sources                                                        |
| ----------------------- | -------------: | --------------------------------------------------------------------- |
| `profile-carlos-carpio` |              5 | Carlos-approved public-profile ledger                                 |
| `public-contact-links`  |              5 | Carlos-approved public-profile ledger and `https://github.com/uset82` |

The records cover only Carlos's approved public name, role wording, privacy-safe location omission, short and long biographies, canonical GitHub account, internal `/contact` path, and the explicit absence of an approved public email, additional social links, and availability claim.

## Excluded knowledge

Nine explicit groups keep private contact/location, the private résumé and unapproved career/education claims, held flagship projects, unsupported metrics and contribution claims, unapproved media and personal stories, unresolved Observatory concept claims, unapproved 3D/provider claims, and hidden operational data out of retrieval.

An exclusion is not transformed into a negative fact except where Carlos explicitly approved the absence—for example, no public location or additional social link. Unsupported questions receive the exact honest-unknown response defined by the CC AI system contract.

## Runtime rules

- Every fact record requires approved verification, an allowed rights state, and only public source IDs.
- The canonical JSON is parsed by the same strict site-content schema used by the server route.
- Explicit knowledge records take precedence over automatically derived content with the same ID, preventing a later metadata change from broadening the profile silently.
- Complete records, never partial facts, are omitted when a source is private, missing, stale, or outside the context budget.
- Chat remains disabled until the separate evaluation, model, provider-policy, abuse, privacy, and release gates pass.

## Adding a fact

1. Approve the exact public wording and source.
2. Add or verify a public source reference in `site/src/content/records.ts`.
3. Add one bounded fact to the canonical JSON record, or create a new uniquely identified record.
4. Add or revise an exclusion when the publication boundary changes.
5. Run the content, unit, server-boundary, and full verification checks before enabling the fact in preview.
