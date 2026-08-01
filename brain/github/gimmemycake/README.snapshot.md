<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/gimmemycake/blob/main/README.md; checkedOn: 2026-07-31; redactions: 0 -->

# 🎂 Gimme My Cake

A tiny 3D web game built with Three.js + Vite where you grab cakes with your hand (pinch gesture) and feed a crying baby. If camera access is unavailable, the game falls back to mouse/touch controls.

## Demo / Concept
- Goal: feed the baby by throwing cakes into the mouth while it opens and closes.
- Each successful feed increases score and reduces the cry meter.
- Misses increase the cry meter. When the cry meter reaches 100%, it’s game over.

## How To Play

### Option A — Hand Tracking (recommended)
1. Click **🎮 Play Game**.
2. Allow camera permission when prompted.
3. Use **pinch** (thumb + index finger together) to grab a cake.
4. Move your hand to position the cake.
5. **Release** the pinch to throw the cake toward the baby’s mouth.

### Option B — Mouse / Touch fallback
- Click/tap to grab a cake near the pointer.
- Drag to move the cake.
- Release to throw.

## Game Mechanics (What happens each frame)

### 1) Mouth target detection
The game determines a world-space mouth position via `getMouthPosition()`:
- If the loaded baby model has a named mouth/jaw/head node, it uses that.
- Otherwise it estimates a reasonable mouth point using the baby’s bounding box.

### 2) Cake lifecycle
Cakes are `Group` meshes added to the scene and tracked in `this.cakes`.

- **Resting cakes**: cakes spawn on the table and stay there until grabbed/thrown.
- **Held cake**: while held (pinched or pointer-down), the cake follows the hand/pointer position.
- **Thrown cake**: on release, the game computes a ballistic throw velocity toward the mouth.

### 3) Hit detection
Thrown cakes are checked against:
- **Mouth hit** (when mouth is open): triggers a “feed” success.
- **Body/face hit**: triggers a messy splat.
- **Fall out of bounds**: counts as a miss if the cake was thrown.

### 4) Success animation and effects
On a successful mouth hit, the game runs a cute “combo”:
- Screen shake
- Golden flash
- Floating emojis (3)
- Star burst
- Heart burst
- Triple sparkle rings
- Colorful confetti
- **Cake sucking animation** (cake shrinks/spins into the mouth and disappears)
- Dramatic baby reaction (pop + shake + bouncy return)

## Tech Stack
- **Vite + TypeScript**: dev server, build pipeline
- **Three.js**: 3D rendering
- **GLTFLoader**: loads the baby model
- **@mediapipe/tasks-vision**: hand landmark detection
- **Howler**: sound playback (optional; if files aren’t present the game still runs)

## Project Structure
Key files:
- `src/main.ts` — entry point
- `src/game/NeedleGame.ts` — main game loop + scene + gameplay
- `src/scripts/HandTrackingService.ts` — MediaPipe webcam hand tracking + touch fallback
- `public/baby.glb` — the baby model loaded at runtime

## Local Development

### Install
```bash
npm install
```

### Run dev server
```bash
npm run dev
```

Vite will print a local URL (usually `https://localhost:300x/`). Open it in your browser.

> Note: Camera access usually requires **HTTPS** or `localhost`. This project uses Vite’s HTTPS dev server.

### Build for production
```bash
npm run build
```

### Preview the production build locally
```bash
npm run preview
```

## Netlify Deployment

### Quick deploy steps
1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import an existing project**.
3. Choose your GitHub repo.
4. Set:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Deploy.

### Important: Camera + HTTPS
Hand tracking requires camera access. Netlify serves your site over HTTPS by default, which is perfect.

### SPA routing
This project is a single page app, so no special redirects are typically needed.

## Controls / Tips
- If hand tracking feels “off”, try better lighting and keep your hand in view.
- If you deny camera access, the game automatically switches to touch mode.
- Cakes spawn on the table so they’re easy to grab.

## Assets
- Baby model: `public/baby.glb` (you can replace it with your own GLB as long as it’s accessible at `/baby.glb`).

## Troubleshooting

### “Camera access denied”
- Allow camera permission in the browser.
- Ensure the site is served over HTTPS (Netlify is fine; Vite dev server is HTTPS here).

### Cakes not interacting / weird physics
- Make sure you are pinching to grab (or pointer-down dragging).
- Ensure you release the pinch/click to throw.

### Build errors
- Run `npm install` again.
- Check TypeScript errors in `src/game/NeedleGame.ts`.

## License
Add a license if you plan to open-source this project.
