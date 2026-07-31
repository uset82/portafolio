<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/content/voice-and-copy-guide.md; checkedOn: 2026-07-31; redactions: 0 -->

# Voice and copy guide

Status: approved implementation convention for English portfolio copy.

Reviewed: 2026-07-20

Executable companion: `docs/content/voice-and-copy-contract.json`

This guide controls new interface copy, project summaries, case studies, biography material, media labels, errors, and CC AI framing. It does not make a factual record publishable: source verification, contribution approval, privacy, rights, and publication state still govern every claim.

## Core voice

The portfolio sounds calm, precise, curious, warm, and technically grounded. It connects engineering with creative practice without turning either into spectacle.

- Lead with what the work is and its present state.
- Prefer concrete nouns and active verbs over promotional adjectives.
- Explain the evidence boundary when a project is experimental, conditional, or incomplete.
- Let the Observatory metaphor organize the experience; do not use it to turn concepts into factual achievements.
- Keep sentences compact enough to scan, then add technical depth where it improves understanding.
- Use confidence for verified facts and explicit uncertainty for everything else.

Avoid hype, startup slogans, vague futurism, forced cleverness, sales pressure, mystical certainty, and defensive legal language in ordinary interface copy. Exclamation marks are not part of the default voice.

## Point of view

Use a deliberate hybrid voice:

- **First person** for Carlos's approved identity statement, hero promise, current focus, contact invitation, and reflections he has explicitly approved. Example: ?I turn hidden patterns into working systems.?
- **Third person** for biography facts, project summaries, contribution boundaries, source-derived outcomes, and editorial context. Example: ?Carlos maintains the public StrudelAI repository and is a documented contributor.?
- **Direct interface voice** for controls, guidance, errors, and privacy notes. Address the visitor as ?you? only when it helps them act. Example: ?Open the repository instead.?

Do not use ?I? for a learning inferred by the portfolio team. Label it as an editorial learning until Carlos approves it as a personal reflection. Do not use ?we? unless a named, verified collaboration is being described. Never convert repository ownership into first-person sole-authorship language.

## Capitalization and titles

- Use sentence case for page titles, section headings, field labels, status explanations, buttons, and new calls to action.
- Preserve the already approved labels `Enter the Observatory` and `Explore Selected Work` exactly until a deliberate copy revision is approved.
- Use title case for the six primary navigation labels: Work, Laboratory, Sound, Cosmos, Story, and Contact.
- Preserve official project and product casing: StrudelAI, Codex Avatar Studio, iFoundYou / Dommedag, OpenNemoClaw, WebDesigner, CC AI, ASTRAEA, and PIN?CULO.
- All caps are limited to official all-cap names, short technical abbreviations, and visually rendered metadata whose accessible name uses normal reading order.
- Do not capitalize generic categories such as prototype, experiment, project, repository, case study, or live demo inside sentences.

## Punctuation and numbers

- Use complete sentences with terminal punctuation for prose, captions, errors, privacy notes, and explanations.
- Omit terminal punctuation from short navigation labels, buttons, filter names, and compact status tags.
- Use the serial comma in lists.
- Prefer a colon for an explanation and an em dash for a meaningful interruption; do not stack decorative dashes.
- Use a middle dot only in the approved role line or compact metadata where the separation is also understandable to assistive technology.
- Hyphenate compound modifiers where they improve clarity: AI-assisted, browser-based, privacy-safe, text-and-links, real-time, and poster-first.
- Use numerals for versions, counts, dimensions, durations, and technical limits. Use ISO dates in internal ledgers and a readable month-year form in public prose.
- Write units consistently: `1280?720`, `8.0 seconds`, `24 fps`, `1.8 MB`, and `v0.1.0`.
- Avoid ampersands in prose unless they are part of an official name.

## Technology and product names

Use canonical names on first and subsequent mention. Expand a term only when the expected audience may not know it.

| Use                                   | Avoid                                                   | Notes                                                                                              |
| ------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| artificial intelligence (AI), then AI | A.I., artificial-intelligence                           | ?AI? is acceptable without expansion in compact interface copy.                                    |
| CC AI                                 | CCAI, CC-AI                                             | This is the portfolio assistant name, not a model name.                                            |
| OpenRouter                            | Open Router, openrouter                                 | Use `@openrouter/sdk` only in code or package references.                                          |
| Next.js                               | NextJS, Next JS                                         | Add a version only when it was verified and materially relevant.                                   |
| React                                 | React.js                                                | Use the official library name.                                                                     |
| TypeScript                            | Typescript, Type Script                                 | Preserve the capital S.                                                                            |
| Three.js                              | ThreeJS, Three JS                                       | Use React Three Fiber for `@react-three/fiber`; use Drei for the approved helper package.          |
| WebGL, WebGL 2                        | Web GL, webgl                                           | Do not use WebGL as a synonym for every 3D asset or renderer.                                      |
| glTF, GLB                             | GLTF, glb in prose                                      | Use `.glb` only for a filename or extension.                                                       |
| VS Code                               | Visual Studio Code when space is limited                | Do not call an extension a marketplace release unless a listing is verified.                       |
| Codex                                 | OpenAI Codex when source context requires it            | Do not imply that Codex generated or approved work without evidence.                               |
| WebDesigner                           | Web Designer, webdesigner in prose                      | Lowercase is reserved for repository/package paths.                                                |
| Nightglass                            | Night Glass                                             | It is a default design system, not this portfolio's color palette.                                 |
| StrudelAI                             | Strudel AI                                              | Distinguish the project from the Strudel library.                                                  |
| Codex Avatar Studio                   | avatar-studio in prose                                  | Lowercase is reserved for the repository slug.                                                     |
| iFoundYou / Dommedag                  | Mesh Guardian as a settled name                         | Keep the dual name until Carlos chooses one public product name.                                   |
| OpenNemoClaw                          | OpenNemo Claw, OpenNemoC                                | Do not reproduce the broken `opennemoc` installer path.                                            |
| MapLibre GL JS                        | MapLibre, when specificity matters                      | Use the shorter name only after the full name is established.                                      |
| Supabase, Postgres/PostGIS            | PostgreSQL/PostGIS only when source wording requires it | Do not imply that a configured backend is a current public service.                                |
| Socket.IO, PixiJS, Tailwind CSS       | SocketIO, Pixi.js, Tailwind                             | Preserve official casing.                                                                          |
| Hunyuan 3D                            | Hunyuan3D as a generic provider label                   | Mention only when the provider, model/version, terms, and generated asset provenance are recorded. |

Do not make model names evergreen marketing copy. Provider and model availability can change; put exact IDs in technical metadata or a dated implementation note.

## Project status labels

Use the least ambitious accurate status. Internal values stay lowercase; public display labels use the forms below.

| Internal value | Display label  | Use only when                                                                                            |
| -------------- | -------------- | -------------------------------------------------------------------------------------------------------- |
| `shipped`      | Shipped        | The intended public experience or product is available and the shipped scope is evidenced.               |
| `maintained`   | Maintained     | A usable artifact exists and current maintenance evidence has been checked.                              |
| `prototype`    | Prototype      | A working implementation exists, but completeness, reliability, release, or adoption is not established. |
| `experiment`   | Experiment     | The work primarily tests an idea, architecture, interaction, or technical path.                          |
| `concept`      | Concept        | The item is an approved idea, visual, or navigational object without project evidence.                   |
| `preparation`  | In preparation | Content or implementation is being prepared and is not yet available as a case study.                    |
| `archived`     | Archived       | The artifact remains part of the record but is not actively maintained.                                  |
| `hold`         | On hold        | Verification, contribution, privacy, rights, or release gates prevent publication.                       |
| `private`      | Private        | The source or asset is intentionally not public. Do not create a public action to it.                    |

?Released? is not a substitute for ?shipped.? Use it only with a verified release record, such as the Codex Avatar Studio `v0.1.0` release, and retain the broader prototype label where reliability or marketplace status is not established. Use ?live? only for a URL checked recently, and state what was actually observed.

## Evidence and contribution language

Order project copy as: value and status, problem, Carlos's verified contribution, constraints, approach, observable outcome, editorial or approved learning, stack, and source links.

Preferred evidence phrases include:

- ?The repository contains??
- ?The reviewed source supports??
- ?The deployment returned HTTP 200 on 20 July 2026.?
- ?The verified result is??
- ?No adoption or reliability metric is available.?
- ?This is an editorial inference from the audited constraints, not a user quote.?

Contribution language must name what is known and the limit of that knowledge. ?Published from Carlos's GitHub account? does not mean ?built entirely by Carlos.? A commit count is provenance evidence, not a complete measure of design, research, authorship, or collaboration.

## Prohibited unsupported claims

Do not publish any of the following without the named evidence:

- sole creator, built entirely by Carlos, or equivalent ownership language without an approved contribution record;
- production-ready, enterprise-ready, professional-grade, battle-tested, or proven at scale without release, use, reliability, and scope evidence;
- secure, hardened, completely isolated, privacy-first, anonymous, or safe by default without a defined threat model and validated controls;
- works offline, catastrophe-ready, emergency-ready, guaranteed delivery, or suitable for life-critical use without field and safety evidence;
- explicit opt-in location sharing while the current iFoundYou Web flow can resume exact-coordinate sharing after sign-in;
- fully open source or MIT-licensed when the distributed repository lacks the applicable license file;
- marketplace publication, passing CI, current release, working installer, or live service unless each state was checked and dated;
- automatic accessibility, security, deployment, design quality, or productivity from WebDesigner or any AI-assisted workflow;
- guaranteed free model access, stable provider behavior, private prompts, or zero data retention from OpenRouter or another provider;
- user counts, revenue, conversion, performance gains, uptime, awards, clients, testimonials, or professional adoption without a primary source and approval;
- employer, education, credential, date, location, contact, collaborator, or role details beyond the approved profile and normalized r?sum? boundary;
- astrology or numerology as scientific, medical, financial, diagnostic, or predictive authority; frame them as creative or personal practice;
- generated imagery as a real product screenshot, shipped asset, human-authored illustration, or documented outcome;
- public reuse rights inferred from repository visibility, a generated filename, account ownership, or possession of a local file;
- WCAG conformance, accessibility certification, security certification, or performance-budget success without the corresponding completed audit.

When a claim cannot pass, remove it or replace it with the verified present state. Do not soften unsupported language with ?aims to? and leave the same misleading implication in place.

## Page and component patterns

### Hero and identity

Keep one first-person promise, one short supporting statement, two focused actions, and one current-focus note. Do not add a stack list, biography timeline, availability claim, or achievement count to the first viewport.

### Project index and case studies

Use a one-sentence value statement followed by the status and contribution boundary. Link labels are descriptive: `Open repository`, `View primary prototype`, or `View v0.1.0 release`, never `Click here`. Broken or unavailable actions are removed from navigation and explained in the case-study text only when relevant.

### Story and CV

Use the approved third-person biography for factual narrative. First-person reflection requires Carlos's approval. Do not expose location, private contact details, self-rated skill percentages, ambiguous credentials, or the private source r?sum?. A r?sum? download stays absent until a separately redacted file is approved.

### Sound, video, and personal practice

Name credits, rights, captions, transcript, poster, and playback state plainly. Never promise audio before a playable source is approved. Astrology and numerology remain creative or personal practice. Trips use intentionally broad place and time labels.

### Contact

Use a quiet invitation without urgency or implied availability. Until a public method is approved, route visitors to the Contact page without showing an email address, form, phone number, location, or unverified social account.

### CC AI

CC AI is a bounded portfolio guide, not Carlos, a general assistant, or an authoritative source. It cites approved public records, preserves project status, and says: ?I don't have verified information about that yet? when evidence is insufficient. It never claims access to private files, memories, credentials, dashboards, or unpublished work.

## UI, error, and accessibility copy

- Tell the visitor what happened, whether their action completed, and what they can do next.
- Avoid blame, jokes during failure, raw provider errors, stack traces, and false reassurance.
- Prefer `This prototype is temporarily unavailable. Open the repository instead.` over `Something went wrong!`
- Use `Loading project details?`, `Retry`, `Close`, `Stop response`, and `Open repository` as concise action labels.
- Announce dynamic status in plain language and do not use color, motion, or sound as the only signal.
- Alt text describes visible evidence and purpose, not every decorative detail. Decorative images use empty alt text.
- Captions add context or provenance instead of repeating alt text.
- Audio is mute-first. Video is poster-first and requires captions or a transcript. Audible autoplay is prohibited.
- Do not put essential instructions only in placeholder text, hover text, canvas content, or animated sequences.

## Review checklist

Before copy enters a `ready` record, confirm:

1. The source supports the nouns, verbs, status, contribution, and outcome.
2. First-person language is user-approved; editorial inferences are not presented as Carlos's words.
3. Official names and technology casing match the contract.
4. Status is the least ambitious accurate label and is consistent across index, case study, metadata, and CC AI.
5. Links were recently checked and unavailable actions are removed or labeled honestly.
6. Rights, privacy, alt text, caption, credit, and accessibility inputs exist for every selected asset.
7. The copy contains no metric, collaborator, date, employer, client, testimonial, location, or security claim without primary-source evidence.
8. The visitor can understand the same information without animation, WebGL, audio, video, or chat.
9. The final paragraph ends with a useful action or clear boundary rather than promotional filler.
