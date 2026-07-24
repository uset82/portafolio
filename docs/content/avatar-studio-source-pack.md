# Codex Avatar Studio — case-study source pack

Reviewed 2026-07-19 from the public repository, its architecture/security documents, GitHub release metadata, commit identities, repository tree, and the downloadable VSIX. This is an evidence pack, not final case-study copy.

## Classification

- **Canonical repository:** <https://github.com/uset82/avatar-studio>
- **Current public version:** `v0.1.0`
- **Status:** released public prototype for VS Code and compatible Cursor builds
- **Release artifact:** `codex-avatar-studio-0.1.0.vsix`; the GitHub asset responded successfully on the review date
- **Source license:** `UNLICENSED` / all rights reserved
- **Marketplace status:** no marketplace listing was found or claimed; installation is from the release VSIX or a source build
- **Build status:** the latest visible GitHub Actions CI run for the release commit concluded with failure

The release artifact proves a downloadable package exists. It does not prove marketplace approval, production reliability, or a green public CI run.

## Contribution boundary

The repository is published under Carlos's confirmed GitHub account, `uset82`. All 30 visible commits are linked to a different GitHub identity, `g57436746-coder`; GitHub did not expose that account profile during review.

Safe wording: **“Codex Avatar Studio is published from Carlos Carpio's GitHub account as a public prototype.”**

Do not attribute architecture, implementation, design, Blender work, testing, or the release to Carlos until he separately confirms his contribution and any collaborator or agent attribution that should appear.

## Architecture and process evidence

The repository is a pnpm/TypeScript workspace with explicit separation of responsibility:

- `apps/extension` owns VS Code integration, commands, settings, workspace trust, local file access, native pickers, and optional Blender processes;
- `apps/webview` owns the React/Vite presentation and renderer lifecycle;
- `packages/avatar-core` owns typed states, events, capabilities, protocol, manifest validation, and shared contracts;
- `packages/asset-pipeline` handles local image-to-SVG and manifest generation;
- `packages/runtime-pixi` isolates PixiJS rendering;
- SVG is the permanent fallback, with lazy PixiJS and optional Three.js/GLB paths;
- optional Blender tools use staged output and keep source scenes read-only.

The public docs also record strict local-message validation, nonce-based Webview CSP, trusted-workspace gates, bounded asset/package validation, reduced-motion controls, disposal behavior, and fallback from WebGL to SVG.

## Product surface supported by source

- an animated IDE assistant panel with semantic coding/activity states;
- local picture-to-SVG conversion;
- local avatar package import, validation, activation, export, and removal;
- SVG, PixiJS, and optional validated Three.js/GLB rendering;
- focus mode, reduced motion, animation intensity, and frame-rate controls;
- optional local Blender discovery and staged export workflows;
- local-only workspace data under `.codex-avatar`.

Picture tracing is not automatic rigging or production 3D conversion. Blender, WebGL, and custom assets are optional and must not be presented as requirements for the base experience.

## Privacy, security, and runtime constraints

- The documented design requires a trusted workspace for asset-changing operations.
- Asset processing is local; the repository says it does not upload avatar media or use telemetry/remote runtime downloads.
- The Webview receives validated local messages and assets rather than arbitrary filesystem access.
- VS Code 1.96+ is the release-tested host; Cursor compatibility is repository-documented but not independently tested here.
- Node.js 22 and pnpm 11.7.0 are required to build from source.
- Blender 3.6+ is optional; WebGL packages require a validated local GLB plus a package-local SVG fallback.
- The latest public CI run failed, so portfolio copy must not claim the current commit passes CI.

## Release and outcome evidence

GitHub exposes a non-draft, non-prerelease `v0.1.0` release dated 2026-07-14 with one downloadable VSIX asset. The asset returned HTTP 200 and reported a size of 1,860,568 bytes on the review date.

This supports “downloadable prototype release.” There are no verified installation counts, users, marketplace reviews, reliability results, performance outcomes, or accessibility audit results.

## Artwork and workspace exclusion boundary

The README explicitly states that the repository and public VSIX exclude the local Cholita artwork, `.blend` files, GLB files, and workspace previews used during development. The reviewed repository tree contains no `.blend` or `.glb` asset.

The following must remain private and must never be reconstructed, copied from a workspace, or shown in the portfolio without a separate rights review:

- local Cholita artwork or likeness material;
- development `.blend` scenes;
- generated or imported GLB packages;
- `.codex-avatar` registries, avatars, caches, exports, or previews;
- screenshots that reveal a private workspace, filenames, paths, prompts, or user content.

## Public media allowlist

The portfolio media allowlist is currently **empty**.

The repository includes placeholder SVG/Pixi assets, an extension icon, a publisher logo, and `docs/assets/webview-smoke.png`, but the all-rights-reserved license does not grant portfolio redistribution and Carlos has not separately approved them. Link to the repository and release; do not copy or hotlink those assets.

## Rights decision

- The source and bundled artwork are all rights reserved.
- Public visibility is not permission to redistribute source, screenshots, icons, logos, or avatar art.
- Imported/user-generated avatar packages retain their own rights requirements.
- No portfolio screenshot or 3D asset is approved in this task.

## Safe facts for later drafting

- Codex Avatar Studio is a downloadable v0.1.0 public prototype for an animated local IDE assistant.
- It separates the extension host, React Webview, shared avatar contracts, local asset pipeline, and optional renderers.
- The base experience keeps an SVG fallback while richer PixiJS, WebGL, and Blender paths remain optional.
- The repository documents local processing, workspace-trust gates, asset validation, reduced motion, and fallback behavior.
- The project is published from Carlos's confirmed GitHub account.

## Claims that remain blocked

- Carlos's individual implementation or design contribution;
- sole authorship or collaborator attribution;
- a passing current CI state;
- VS Code Marketplace availability;
- production readiness, adoption, installation, or performance metrics;
- portfolio reuse of any icon, screenshot, SVG, GLB, `.blend`, avatar, likeness, or workspace preview.

## Primary-source trail

- Repository and README: <https://github.com/uset82/avatar-studio>
- Architecture: <https://github.com/uset82/avatar-studio/blob/main/docs/ARCHITECTURE.md>
- Security and privacy: <https://github.com/uset82/avatar-studio/blob/main/docs/SECURITY_PRIVACY.md>
- Release: <https://github.com/uset82/avatar-studio/releases/tag/v0.1.0>
- License: <https://github.com/uset82/avatar-studio/blob/main/LICENSE>

