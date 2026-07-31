# C.1 — Arcade candidate build measurements

Measured 2026-07-31 on Windows (Node v22.14.0, npm 11.12.1).
Repo size is **not** used as a proxy. Fresh clones under `_arcade-build/` (gitignored).

Flutter SDK was **not** installed on this machine — `Monkey-Tug-of-War` uses the committed
`build/web` only (may be stale). MandelBro's orphaned `webpack.config.js` failed (missing
`src/client/assets`); shippable artifacts are `public/` and `simplified/`.

## Summary table

| Repo                    | Built output                                                                            | Built size                                                                                   | Engine                                                                        | Input method                                               | Mobile viability                                                                          | Current live host                                         | Rights                                                                                                           | Recommended tier                                                                |
| ----------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| #32 `My-Football-Game`  | Static client + Express/`socket.io` prod install (no compile step)                      | **4.85 MB** deploy (client **0.14 MB**; prod `node_modules` **4.70 MB**)                     | Canvas 2D + Socket.IO                                                         | Keyboard (arrows / WASD); on-screen touch controls present | Touch controls exist; playable on phone UI, better on desktop for 2P                      | None found (README local-only; `railway.json` ready)      | Unlicensed → all rights reserved / owned                                                                         | **B** (server)                                                                  |
| #46 `Monkey-Tug-of-War` | Committed `build/web` (Flutter web; fresh `flutter build web` **not run**)              | **35.59 MB** (`canvaskit` **31.57 MB**; without canvaskit **4.02 MB**)                       | Flutter / Flame                                                               | Touch / tap keypad (classroom math tug)                    | Designed as browser classroom game; large canvaskit payload                               | None found; `netlify.toml` publishes prebuilt `build/web` | Unlicensed → all rights reserved / owned                                                                         | **A** (static) — heavy for ~50 MB `site/public` budget                          |
| #42 `gimmemycake`       | `vite build` → `dist/`                                                                  | **33.78 MB** (of which `baby.glb` **29.49 MB**; without `.map` **30.27 MB**)                 | Vite + Three / Needle + MediaPipe Hands                                       | Webcam hand tracking; touch-mode fallback                  | Mobile needs HTTPS + camera permission; touch fallback helps                              | None found; README targets Netlify                        | Unlicensed → all rights reserved / owned                                                                         | **A** (static) — `baby.glb` dominates; optimize or CDN before shipping in-image |
| #37 `drone_Lips`        | `npm run build` in `drone-lips/` (Astro static) → `dist/`                               | **27.30 MB** (MediaPipe wasm ≈ **18.1 MB**; drone PNGs ≈ **6.8 MB**)                         | Astro + React Three Fiber + MediaPipe Face                                    | Webcam face landmarks; iPhone-oriented chat/voice helpers  | README/chat copy assumes iPhone; needs camera + HTTPS                                     | None found; root `netlify.toml` → `drone-lips` build      | Unlicensed → all rights reserved / owned                                                                         | **A** (static) — heavy wasm; same budget pressure as Monkey/gimmemycake         |
| #14 `MandelBro`         | No working webpack dist. Shippable: `MandelBro/simplified/` and `MandelBro/public/`     | **simplified 0.07 MB**; **public 0.28 MB** (client-ish **0.27 MB**)                          | HTML5 Canvas (+ optional Web Speech); full version Express/Socket.IO + Gemini | Pointer / click UI; voice input (Web Speech) optional      | Simplified is browser-static and fine on mobile; full multiplayer needs server + API keys | Simplified demo: `https://eabsxuzi.manus.space`           | Unlicensed on GitHub (README claims MIT; **no LICENSE file**) → treat as all rights reserved / owned until `Q.8` | **A** for simplified; **B** for full multiplayer/`public`+server                |
| #12 `3Doodle`           | `vite build` + esbuild server → `dist/` (`dist/public` client + `dist/index.js` server) | **2.73 MB** total (client assets **2.71 MB** incl. **2.22 MB** PNG; server bundle **20 KB**) | Vite/React client + Express + Drizzle/Postgres                                | Pointer / touch drawing canvas; mobile layout present      | Mobile drawing UI exists (`mobile-drawing-*`)                                             | None found (Canner mentioned in README; needs DB)         | Unlicensed → all rights reserved / owned                                                                         | **B** (server + Postgres)                                                       |

## Tier read for `00-master-plan.md` §8.2

| Tier                        | Repos after C.1                                                                                                                                                                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — static, same-origin** | `MandelBro/simplified` (tiny), then `drone_Lips`, `gimmemycake`, `Monkey-Tug-of-War` **if** large assets fit budget or move to CDN                                                                                                                   |
| **B — own Railway service** | `My-Football-Game` (fastest; already `railway.json`), `3Doodle` (Postgres), MandelBro full multiplayer                                                                                                                                               |
| **Budget note**             | Three “static” games alone are ~33+27+36 MB ≈ **96 MB** before site chrome — exceeds the ~50 MB `site/public` ceiling in P.4. Prefer MandelBro simplified + Football (B) for launch; CDN/optimize GLB/wasm before shipping the heavy three in-image. |

## Build commands used

```text
My-Football-Game     npm ci --omit=dev
Monkey-Tug-of-War    (no Flutter SDK) measure build/web
gimmemycake          npm ci && npm run build
drone_Lips           cd drone-lips && npm ci && npm run build
MandelBro            measure public/ + simplified/; webpack --mode production FAILED
3Doodle              npm ci && npm run build
```

## Adjacent work discovered (do not widen C.1)

| Suggested ID | Note                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------- |
| C.1b         | Install Flutter SDK and re-run `flutter build web --release` for Monkey; re-measure                 |
| C.1c         | Fix MandelBro webpack `CopyWebpackPlugin` path / restore `src/client/assets`                        |
| C.10         | Optimize or externally host `gimmemycake` `baby.glb` and MediaPipe wasm before Tier A in-image ship |
