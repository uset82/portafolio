# MandelBro — vendored build provenance

| Field | Value |
| --- | --- |
| Source repository | https://github.com/uset82/MandelBro |
| Vendored path in source | `MandelBro/simplified/index.html` |
| Copied on | 2026-08-13 |
| Size | 74 293 bytes, single file |
| Owner | Carlos Alfredo Carpio Meza (`uset82`) |
| Licence in the source repository | none present — all rights reserved by the owner |

## Why this file and not a build

`simplified/index.html` is already the shippable artifact: it is fully
self-contained, with every icon inlined as a `data:` URI and no stylesheet,
script, font, or API call fetched from anywhere. The repository's webpack build
(`webpack.config.js`) fails on a missing `src/client/assets` path, which C.1
recorded on 2026-07-31; nothing here depends on fixing it.

Verified before vendoring:

- no `fetch`, `XMLHttpRequest`, `socket`, or absolute `http(s)://` reference;
- no `localStorage`, `sessionStorage`, or `indexedDB` use;
- one optional `webkitSpeechRecognition` call, which degrades to the text input
  when the browser or the sandbox denies it.

Because it needs no origin privileges, the play shell serves it with
`sandbox="allow-scripts"` and no `allow-same-origin`, which places it on an
opaque origin with no access to this site's cookies or storage.

## Refreshing this copy

```bash
git clone --depth 1 https://github.com/uset82/MandelBro
cp MandelBro/simplified/index.html site/public/games/mandelbro/index.html
```

Re-check the three verification points above after any refresh; the sandbox
choice in `src/components/arcade/game-frame.tsx` depends on them.
