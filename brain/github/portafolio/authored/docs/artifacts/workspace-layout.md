<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/artifacts/workspace-layout.md; checkedOn: 2026-07-31; redactions: 0 -->

# Generated workspace layout

The repository root is the control plane. It retains `AGENTS.md`, `maintaskplan.md`, research, decisions, design, rights, and asset specifications. The generated application is isolated in `site/`.

```text
PORTAFOLIO/
?? docs/                    decisions, design, content, rights, assets, evidence
?? mainUI.png               approved source reference
?? maintaskplan.md          living execution ledger
?? site/                    generated Next.js application
   ?? public/images/        browser-served poster assets
   ?? src/app/              routes, metadata, global styling
   ?? src/components/       shared semantic and motion UI
   ?? src/content/          typed local route content
   ?? src/styles/           locked natural tokens
```

Build output, dependencies, local environment files, and caches remain ignored. The generated workspace does not overwrite the research/control plane.
