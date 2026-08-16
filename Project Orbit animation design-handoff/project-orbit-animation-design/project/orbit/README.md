# Project Orbit — handoff

Standalone, framework-free implementation of the Project Orbit section
(`Project Orbit.html` + this folder). Drop-in target: the `#selected-systems`
region of the homepage, replacing the static Selected Systems cards.

## Files

| File | Role |
| --- | --- |
| `projects.js` | `PROJECTS` (single source of truth) + `ORBIT_CONFIG` tuning block |
| `orbit-math.js` | `getOrbitPosition`, `nodeAngle`, `shortestDelta`, `depth01`, easing, damping |
| `icons.js` | canvas line glyphs used as node icon textures |
| `project-orbit.js` | scene: rails, medallion, nodes, labels, bearing balls, interaction |
| `../assets/ca2m-mark.png` | the real CAM² mark (copied from `public/images/brand`) |

## Geometry

True ellipse in the XZ plane — `x = cos(a) * 7.5`, `z = sin(a) * 2.95`, no
CSS-scaled circle. Camera sits at ~52° elevation so the flattened ellipse
reads as an ellipse rather than a line. Node placement is `index / count`
around the ellipse plus `orbitRotation`; nothing is hardcoded per project, so
adding an entry to `PROJECTS` just redistributes the ring.

Three rails (brass primary, bronze inner, thin bronze outer) are TubeGeometry
along a CatmullRom sampling of `EllipseCurve`. 22 bearing balls (14 on small
screens) ride the same ellipse in one InstancedMesh at 1.45× node speed.
Calibration dots are one Points buffer, six dots per node toward CAM².

## Motion

- Idle: one revolution / 60 s (`ORBIT_CONFIG.revolutionSeconds`, tune 45–90),
  clockwise, delta-time driven.
- Hover: orbit eases down to 25 % speed, node scales ~7 %, brass rim brightens.
- Drag: pointer/touch, horizontal, inertia `velocity *= 0.93`; >5 px is a drag,
  ≤5 px is a click (`dragThresholdPx`).
- Select: pauses the orbit, takes the shortest rotational path, eases the whole
  track for 820 ms until the node reaches front-centre, then shows actions.
  Second click (or double-click) opens. Set `openOnFirstClick: true` to launch
  on first click.
- Depth: front nodes scale 1.10 / brighter, rear 0.84 / dimmer; label opacity
  and z-index follow the same normalized depth.
- `prefers-reduced-motion`: no continuous rotation, focus moves in 160 ms,
  everything remains navigable.

## API (`window.projectOrbit`)

`selectProject(id)`, `focusProject(id)`, `activateProject(id)`,
`openProject(id)`, `activateAgent(agentId)`,
`activateAgentFlow(sourceId, targetId)`, `pauseOrbit()`, `resumeOrbit()`,
`resetOrbit()`, plus `rotation` / `selectedProjectId` getters.

Events bubble from the section root: `orbit:select`, `orbit:open`,
`orbit:agent`, `orbit:agent-flow` — the hooks for the later ANA / Repo2Agent
flow visualization. No agent animation is implemented yet, by design.

## Accessibility & fallback

Every project is also a real `<a>` in `[data-orbit-fallback]`: Tab reaches it,
focus rotates the corresponding node into view, Enter follows the link, Space
selects. If WebGL is unavailable the section sets
`data-orbit-state="fallback"` and that list becomes the navigation.

## Performance

`devicePixelRatio` capped at 2, shared geometries/materials, InstancedMesh for
balls, rendering paused on `document.hidden` and when the section leaves the
viewport (IntersectionObserver). One synchronous frame is painted at startup so
the section is never blank if rAF is throttled.

## Porting into the Next.js site

1. `projects.js` becomes the typed registry (`PortfolioProject[]`) — keep it the
   only place URLs live, and reconcile `internalRoute` with the real router
   (`/work/<slug>` if that route exists; the placeholders here only use routes
   confirmed present: `/work`, `/sound`, `/cosmos`, `/laboratory`).
2. `project-orbit.js` becomes `ProjectOrbitScene` — the constructor takes the
   section element, so a `useEffect(() => createProjectOrbit(ref.current), [])`
   wrapper with a `useRef` is enough; return value is the API object.
3. Labels and the focus panel are plain DOM here; in React render them from
   state and keep only the per-frame transform writes in the loop.
4. Lazy-load with `next/dynamic` (`ssr: false`) so three.js stays out of the
   hero's bundle.

## Data still to confirm

- `SmartChatbot`, `Repo2Agent`, `SOUND LAB`, `FUTURE ENERGY` have no repository
  in `brain/github/inventory.json`; they point at internal routes / the ANA
  agent. Swap in live URLs when they exist.
- ASTRAEA's repo is `uset82/ASTROEA` (spelling differs from the display name).
