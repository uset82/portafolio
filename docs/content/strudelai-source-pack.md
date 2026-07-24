# StrudelAI — case-study source pack

Reviewed 2026-07-19 from the public repository, current GitHub metadata, and both README-listed deployments. This pack verifies what the portfolio may say; it is not yet publishable case-study copy.

## Classification

- **Canonical repository:** <https://github.com/uset82/StrudelAI>
- **Portfolio status:** evolving public prototype
- **Repository state:** public, not archived, default branch `main`
- **Latest source activity checked:** commit `c6728f8` dated 2026-06-21
- **Release state:** no GitHub release; one repository tag, `v0.1.0-validator`
- **License state:** unresolved. The README says MIT, but GitHub reports no detected license and the repository root contains no license file.

Do not describe StrudelAI as a production service, a released product, or fully MIT-licensed until those states are evidenced.

## Verified contribution wording

Carlos's confirmed GitHub account, `uset82`, owns the public repository and appears in GitHub's contributor data. The visible commit history also includes `g57436746-coder` and an unlinked `Grok Build Agent` identity.

Safe wording: **“Carlos maintains the public StrudelAI repository and is a documented contributor to the prototype.”**

Do not say “built entirely by Carlos,” “sole creator,” or assign specific features to Carlos until he approves a more detailed contribution account.

## Product and implemented surface

The repository presents StrudelAI as an AI-assisted, browser-based music and live-coding workspace. Current source paths support a multi-surface prototype with:

- a sonic interface and arrangement/track controls;
- Strudel pattern editing and browser audio playback;
- spectral visualization and analysis;
- voice synthesis, effects, recording, and export modules;
- Synplant-inspired genetic sound exploration;
- a dual-deck DJ view;
- AI-agent, validation, and completion routes;
- optional YouTube analysis and MusicGen tooling.

These are source-backed implementation surfaces, not proof that every documented workflow is complete or production reliable.

## Verified stack

The current `package.json`, repository tree, and deployment configuration support:

- Next.js 16, React 19, TypeScript, and Tailwind CSS 4;
- Strudel packages, Superdough, Web Audio, Tone.js, WaveSurfer.js, Meyda, and pitch analysis libraries;
- Socket.IO with a custom TypeScript server;
- OpenRouter agent tooling and Google Generative AI integrations;
- optional Python, FFmpeg, librosa, `yt-dlp`, and MusicGen helper services;
- Netlify's Next.js plugin with Node.js 20.

Provider names and model choices vary across the README, environment examples, dependencies, and source modules. Portfolio copy should say **configurable AI integrations** instead of naming one model as the definitive production provider.

## Live deployment checks

| URL | Result on 2026-07-19 | Approved description |
| --- | --- | --- |
| <https://strudelzeroai.app.canner.ca/> | HTTP 200; page title `Aether Sonic Workstation` | Primary public prototype |
| <https://strudelai.netlify.app/> | HTTP 200; page title `Aether Sonic Workstation` | Public mirror |

These checks prove that the landing surfaces responded. They do not prove microphone permission, audio output, external AI requests, WebSocket behavior, export, YouTube analysis, or GPU-backed MusicGen on every browser or deployment.

## Constraints and honest boundaries

- Browser audio requires a user gesture and is subject to browser autoplay/device behavior.
- Voice and recording features require microphone permission and a compatible browser.
- AI routes require configured server credentials and inherit provider availability, cost, and rate limits.
- Optional YouTube analysis requires local Python/FFmpeg services; optional MusicGen requires a separate Python service and suitable GPU resources.
- The custom Socket.IO server and optional local services are not evidenced as available on both public deployments.
- The repository exposes only a focused music-quality test command; this review did not treat the whole feature set as covered by an automated test suite.
- No verified user, performance, reliability, accessibility, or business metrics are present.

## Outcome evidence

The defensible outcome is a substantial public prototype with two reachable deployment URLs, a visible application architecture, and implemented creative-audio modules. No adoption, revenue, conversion, latency, audience, festival-use, or professional-tooling outcome may be claimed.

## Media and reuse ledger

| Candidate | Observed source state | Portfolio decision |
| --- | --- | --- |
| `image/README/1765671236142.png` | Repository image; authorship and reuse permission not documented | Exclude |
| `src/components/image/SonicInterface/*.png` | Three UI images; provenance and reuse permission not documented | Exclude pending review |
| `Gemini_Generated_Image_…png` | Filename indicates generated media, but no model/terms snapshot or public-display approval is recorded | Exclude |
| `images/hercules.png` and `images/PioneerDJ.jpg` | Product/brand imagery with no rights record | Exclude |
| `Synplant User Guide.pdf` | Third-party reference document, not portfolio media | Never republish |
| Framework SVGs under `public/` | Default framework marks, not meaningful case-study evidence | Do not use |

No StrudelAI screenshot, audio, video, logo, or generated image is approved for the portfolio yet. Task 2.13 must create a rights-cleared visual inventory; until then, use text and canonical links only.

## Safe facts for later case-study drafting

- StrudelAI is an evolving public prototype for AI-assisted music creation and Strudel live coding.
- It combines browser audio, pattern editing, analysis, voice processing, genetic sound exploration, and DJ-oriented interaction experiments.
- Carlos maintains the public repository and is a documented contributor.
- Two public prototype URLs responded successfully on the review date.
- The project uses a Next.js/React/TypeScript interface with browser-audio, real-time, and configurable AI integrations.

## Claims that remain blocked

- sole authorship or feature-by-feature attribution;
- production readiness, professional adoption, festival use, or audience metrics;
- stable availability of AI, microphone, WebSocket, YouTube, or MusicGen workflows;
- an MIT licensing claim for the repository as distributed;
- reuse of any repository image, audio, video, brand mark, or third-party document.

## Primary-source trail

- Repository and README: <https://github.com/uset82/StrudelAI>
- Package manifest: <https://github.com/uset82/StrudelAI/blob/main/package.json>
- Primary prototype: <https://strudelzeroai.app.canner.ca/>
- Mirror: <https://strudelai.netlify.app/>

