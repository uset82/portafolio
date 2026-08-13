# TASK — Replace Static Selected Systems with Interactive Project Orbit

Read the project context before changing code:

- AGENTS.md
- mainidea.md
- taskplan.md
- smartchatbot.md
- DESIGN.md
- rules.md
- skills.md
- current homepage implementation
- current Selected Systems component
- current project/repository data
- package.json
- existing routing/navigation architecture

Study the supplied visual references:

REFERENCE A:
The dark black-and-antique-gold elliptical orbital project system.

REFERENCE B:
The current portfolio homepage where the static Selected Systems cards
appear below the main ANA hero.

============================================================
PRIMARY OBJECTIVE
============================================================

Replace ONLY the current static Selected Systems cards with a new
interactive component:

PROJECT ORBIT / REPOSITORY SOLAR SYSTEM

The rest of the homepage must remain intact.

Do not redesign or rebuild the entire homepage.

The new component represents all portfolio projects/repositories as
interactive objects travelling around a horizontally flattened
elliptical mechanical orbit.

Concept:

              ASTRAEA
                 ●

 SmartChatbot ●             ● PINÁCULO

Avatar Studio ●     CAM²     ● Future Energy

   iFoundYou ●               ● Sound Lab

       3Doodle ●         ● Repo2Agent

              StrudelAI
                 ●


But the final layout must be a WIDE HORIZONTAL ELLIPSE, not a circle.

It should visually resemble:

- a precision astronomical instrument
- a mechanical planetary orbit
- a metallic ball-bearing track
- a futuristic astrolabe
- a repository constellation

The central CAM² logo represents the portfolio identity.

The orbiting objects represent projects/repositories.

============================================================
IMPORTANT UX PRINCIPLE
============================================================

This must NOT just be a decorative image.

Every project is a real interactive element.

User interaction:

Project node
    ↓
hover / focus
    ↓
highlight
    ↓
click / tap
    ↓
select project
    ↓
orbit smoothly positions project into focus
    ↓
open project / app / game / demo

Each project must support one or more destinations:

- live app URL
- live game URL
- portfolio project route
- GitHub repository
- agent interface
- project details

The destination must come from project DATA.

Never hardcode navigation logic into individual Three.js objects.

============================================================
PHASE 0 — AUDIT CURRENT IMPLEMENTATION
============================================================

[ ] Find the homepage component.

[ ] Find the current Selected Systems/cards section.

[ ] Identify how project data currently enters that component.

[ ] Identify whether the project uses:
    - React
    - Next.js
    - Astro
    - React islands
    - vanilla Three.js
    - React Three Fiber

[ ] Check whether Three.js is already installed.

[ ] Check whether React Three Fiber / Drei are already installed.

[ ] Check existing animation libraries.

[ ] Check current routing strategy.

[ ] Identify current project live URLs and GitHub URLs.

[ ] Identify mobile/responsive rules surrounding this section.

[ ] Document affected files before modification.

[ ] Update taskplan.md with this entire implementation sequence.

STOP and correct the plan if existing architecture makes the proposed
paths inappropriate.

============================================================
PHASE 1 — DEFINE THE PROJECT DATA MODEL
============================================================

Create one reusable project definition.

Example:

type PortfolioProject = {
  id: string
  name: string
  shortName?: string

  description?: string

  icon?: string
  iconType?: string

  category:
    | "ai"
    | "engineering"
    | "energy"
    | "music"
    | "astrology"
    | "numerology"
    | "creative"
    | "tool"
    | "game"
    | "research"

  destinationType:
    | "external-app"
    | "internal-route"
    | "github"
    | "agent"

  href: string

  githubUrl?: string
  liveUrl?: string

  agentId?: string

  enabled: boolean
  featured?: boolean
}

Initial visible projects may include:

- SmartChatbot
- ASTRAEA
- PINÁCULO
- FUTURE ENERGY
- SOUND LAB
- Repo2Agent
- StrudelAI
- 3Doodle
- iFoundYou
- Avatar Studio

Do not duplicate repository metadata across UI components.

Create one source of truth.

Later this data should be compatible with the Repo2Agent registry.

============================================================
PHASE 2 — COMPONENT ARCHITECTURE
============================================================

Prefer a structure similar to:

src/
  components/
    project-orbit/
      ProjectOrbit.tsx
      ProjectOrbitScene.tsx
      OrbitTrack.tsx
      OrbitNode.tsx
      OrbitLabel.tsx
      OrbitCenter.tsx
      OrbitParticles.tsx
      ProjectFocusPanel.tsx
      orbitMath.ts
      orbitConfig.ts
      types.ts

Adapt paths to the actual codebase.

Responsibilities:

ProjectOrbit
- DOM wrapper
- responsive layout
- loading state
- accessibility fallback

ProjectOrbitScene
- Three.js scene
- camera
- renderer
- animation state

OrbitTrack
- elliptical mechanical track

OrbitNode
- individual interactive project object

OrbitLabel
- readable HTML project name

OrbitCenter
- CAM² medallion

OrbitParticles
- small moving metallic balls

ProjectFocusPanel
- optional selected-project details / launch CTA

============================================================
PHASE 3 — BUILD THE TRUE ELLIPTICAL ORBIT
============================================================

CRITICAL:

Do NOT simulate a circle merely scaled with CSS.

Construct an actual elliptical path.

Use approximately:

radiusX = 7.5
radiusZ = 2.6–3.0

The exact values may be adjusted after visual testing.

The orbit must appear:

WIDE
HORIZONTAL
FLATTENED
SLIGHTLY RECEDING IN DEPTH

not:

ROUND
VERTICAL
SPHERICAL

Mathematical position:

x = cos(angle) * radiusX
z = sin(angle) * radiusZ

Use the existing camera coordinate system appropriately.

Create a reusable function:

getOrbitPosition(angle)

returning:

{
  x,
  y,
  z
}

Use the SAME mathematical orbit for:

- project nodes
- metallic balls
- highlights
- active-agent effects

============================================================
PHASE 4 — BUILD THE MECHANICAL RAIL
============================================================

The reference image contains a mechanical gold/brass channel.

Build this using real Three.js geometry.

Preferred approach:

EllipseCurve / custom Curve3
        ↓
sample points
        ↓
CatmullRomCurve3
        ↓
TubeGeometry

Create approximately 2–3 parallel rails.

Visual materials:

dark bronze
aged brass
antique gold
graphite
blackened metal

Avoid:

purple
cyan
bright blue
cyberpunk neon

Use physically based materials.

Target visual properties approximately:

metalness: 0.75–0.95
roughness: 0.2–0.4

Add restrained highlights.

Do not create excessive bloom.

============================================================
PHASE 5 — CENTRAL CAM² MEDALLION
============================================================

Place the existing CAM² logo at the exact visual center.

Do NOT regenerate or reinterpret the logo.

Use the supplied real logo asset.

Create a physical-looking medallion:

outer brass rim
dark graphite center
CAM² logo
small beveled structure
restrained warm edge glow

The center object should NOT rotate around the track.

It remains stable.

Optional subtle behavior:

mouse/parallax tilt:
±2–3 degrees maximum.

Very slow independent mechanical movement is acceptable.

Do not make the logo spin continuously.

============================================================
PHASE 6 — PROJECT NODES
============================================================

Every repository becomes an OrbitNode.

Each node contains:

- circular mechanical housing
- project icon
- subtle brass rim
- readable project label
- invisible enlarged hit area

Do NOT manually assign x/y positions.

Use:

angle =
  orbitRotation +
  projectIndex / projectCount * PI * 2

Then calculate position from the ellipse.

This automatically supports:

10 projects
20 projects
50 projects

without rewriting the component.

============================================================
PHASE 7 — KEEP LABELS FACING THE USER
============================================================

Project names must NEVER rotate upside down with the orbit.

For example:

ASTRAEA
PINÁCULO
SOUND LAB
Repo2Agent

must remain horizontal and readable.

Preferred implementation:

HTML/CSS labels anchored to Three.js positions.

Use:

CSS2DRenderer

or

Drei Html

depending on the existing stack.

Do not create project-name textures.

Do not generate project names as 3D text unless there is a proven reason.

Benefits:

- crisp text
- accessibility
- responsive typography
- easier localization
- easier interaction

============================================================
PHASE 8 — AUTOMATIC ORBIT ROTATION
============================================================

Idle behavior:

The project system rotates continuously.

Very slowly.

It must feel like:

a precision clockwork mechanism

not:

a carousel

Target approximate speed:

one complete revolution every 45–90 seconds.

Expose:

orbitSpeed
orbitRotation

through configuration.

Use frame-independent animation:

rotation += speed * deltaTime

Do not tie movement directly to FPS.

============================================================
PHASE 9 — METALLIC FLOW BALLS
============================================================

Add small polished brass spheres travelling through the track.

These should create the feeling of:

metal balls moving through a mechanical channel.

Use InstancedMesh where practical.

Target:

12–30 small balls

depending on screen size/performance.

They may move slightly faster than project nodes.

Important:

They are decorative flow indicators.

They should never interfere with project clicking.

Later they may visualize Repo2Agent communication.

============================================================
PHASE 10 — DEPTH / SOLAR SYSTEM EFFECT
============================================================

Nodes on the front half of the ellipse should appear:

slightly larger
slightly brighter
higher visual priority

Nodes travelling toward the rear should appear:

slightly smaller
slightly dimmer

Calculate a normalized depth value.

Example concept:

depth =
  normalize(z)

Then derive:

scale
opacity
labelOpacity
brightness
zIndex

Example:

front:
scale = 1.1

back:
scale = 0.82

Keep the effect restrained.

Do not make nodes disappear.

This is what will make the system feel genuinely 3D.

============================================================
PHASE 11 — MOUSE / TOUCH DRAG
============================================================

Allow the visitor to manually rotate the project orbit.

Desktop:

click + drag horizontally

Mobile:

touch + drag horizontally

Dragging changes:

orbitRotation

Add inertia:

velocity *= damping

Do not allow vertical page scrolling to break unnecessarily.

Differentiate:

drag

from:

click

using a movement threshold.

For example:

pointer movement < 5px
→ click

pointer movement > 5px
→ drag

This is critical to prevent accidentally opening projects.

============================================================
PHASE 12 — HOVER BEHAVIOR
============================================================

Desktop pointer hover:

selected node:

- scale +5–10%
- brighter brass edge
- icon slightly brighter
- label gains contrast
- orbit slows

Other nodes remain visible.

Optional:

draw a restrained connection line from the hovered node toward CAM².

Do not freeze immediately on every accidental mouse pass.

Use smooth interpolation.

============================================================
PHASE 13 — PROJECT SELECTION
============================================================

When the user clicks/taps a project:

1. stop automatic orbit rotation

2. set:

selectedProjectId

3. determine the desired focus angle

4. calculate shortest rotational distance

5. smoothly rotate the entire orbit until that node reaches the
   focus position

Recommended focus position:

front-center / lower-center

NOT necessarily the top.

The selected repository should feel as though the mechanical system
deliberately rotates the project toward the visitor.

Use a smooth easing curve.

Duration approximately:

600–1000 ms

No abrupt snapping.

============================================================
PHASE 14 — OPEN PROJECT / GAME / APP
============================================================

After selection animation:

Use project.destinationType.

external-app:
window.open(project.liveUrl, "_blank", "noopener,noreferrer")

github:
open GitHub URL

internal-route:
use existing router

agent:
open ANA with agent/project context

Important:

Never hardcode:

if project === "ASTRAEA"

inside interaction logic.

Navigation must always come from the data model.

============================================================
PHASE 15 — PROJECT LAUNCH UX
============================================================

Recommended behavior:

FIRST CLICK:

focus/select project

Display:

Project name
short description

[ OPEN PROJECT ]

Optional:

[ GitHub ]
[ Ask ANA ]

SECOND ACTION:

opens the application.

This prevents accidental navigation while the visitor is dragging the
orbit.

However support:

double-click desktop

or

explicit configuration:

openOnFirstClick: true

if direct launch is later preferred.

============================================================
PHASE 16 — APP / GAME PREVIEW
============================================================

For selected projects with a live application:

Optionally provide:

LIVE PREVIEW

Use an iframe ONLY if the remote application permits framing.

Do not assume every external site supports iframe embedding.

Fallback:

Open Project ↗

Never disable navigation because preview failed.

============================================================
PHASE 17 — ASTRAEA SPECIAL STATE
============================================================

ASTRAEA may initially occupy the featured/top position like the reference.

But this must be generated using:

featured: true

not hardcoded coordinates.

Featured project may have:

slightly brighter halo
slightly larger initial node
subtle constellation animation

Once the user manually rotates the orbit, ASTRAEA behaves like every
other node.

============================================================
PHASE 18 — REPO2AGENT FUTURE API
============================================================

Build hooks now for future ANA integration.

Expose functions/events such as:

selectProject(projectId)

focusProject(projectId)

activateProject(projectId)

openProject(projectId)

activateAgent(agentId)

activateAgentFlow(sourceId, targetId)

resetOrbit()

pauseOrbit()

resumeOrbit()

Future behavior:

User asks ANA:

"Analyze my astrology and numerology."

ANA activates:

ASTRAEA
+
PINÁCULO

The corresponding nodes illuminate.

Small brass particles travel from:

ASTRAEA
→ CAM²

and:

PINÁCULO
→ CAM²

Then ANA synthesizes the response.

Do NOT implement the complete multi-agent visualization yet.

Only prepare the API architecture.

============================================================
PHASE 19 — BACKGROUND
============================================================

The current reference contains a subtle mechanical robot detail in the
upper-right.

Do not necessarily bake the entire reference PNG into the component.

Prefer:

CSS background
+
real Three.js foreground objects

Keep the background extremely subtle.

Three.js must remain the visual focus.

Do not compete with the hero above.

============================================================
PHASE 20 — HOMEPAGE INTEGRATION
============================================================

Remove the current static:

SELECTED SYSTEMS

three-card grid.

Replace the same vertical region with:

PROJECT ORBIT

Keep homepage flow:

HEADER

ANA HERO

↓ scroll

PROJECT ORBIT

↓ scroll

remaining portfolio content

The new orbit must NOT cover ANA's face or hero copy.

Do not position it absolutely over the entire homepage.

It is its own section.

Suggested height desktop:

600–780px

depending on final proportions.

============================================================
PHASE 21 — SCROLL ENTRANCE
============================================================

When the orbit enters the viewport:

1. central CAM² medallion fades/scales in

2. elliptical rail materializes

3. project nodes appear sequentially

4. metal balls begin moving

5. automatic rotation begins

Duration:

approximately 1.2–2 seconds.

Keep motion elegant.

Do not animate every property.

No excessive particles.

============================================================
PHASE 22 — OPTIONAL HERO → ORBIT TRANSITION
============================================================

DO NOT implement until the orbit is working.

Later possibility:

ANA hero video
↓
scroll
↓
hero darkens slightly
↓
gold particles emerge
↓
CAM² medallion appears
↓
mechanical orbit constructs itself
↓
projects begin circulating

This can later use:

ShaderMaterial
noise
alpha dissolve
particles

But this is NOT part of the first working implementation.

============================================================
PHASE 23 — RESPONSIVE DESIGN
============================================================

Desktop:

full elliptical orbit

Tablet:

slightly smaller orbit
fewer labels simultaneously displayed

Mobile:

retain horizontal orbit concept

Options:

reduce radiusX
reduce node size
hide labels on background nodes
only show labels near foreground
tap node to reveal name

Never turn the mobile version into an unreadable miniature desktop
scene.

============================================================
PHASE 24 — ACCESSIBILITY
============================================================

The portfolio cannot depend solely on WebGL.

Create a semantic project navigation fallback.

Each project must exist in accessible HTML.

Support:

Tab
Shift+Tab
Enter
Space

When a node receives keyboard focus:

focus the corresponding orbit node.

Screen readers must have:

project name
description
destination

Respect:

prefers-reduced-motion

Reduced motion mode:

no continuous rotation

Nodes remain positioned around the ellipse.

Selection animations become short/minimal.

============================================================
PHASE 25 — PERFORMANCE
============================================================

Target smooth desktop performance.

Use:

InstancedMesh for repeated balls

shared geometry

shared materials

lazy loading

visibility pause

Cap devicePixelRatio:

Math.min(window.devicePixelRatio, 1.5 or 2)

Pause renderer when:

document.hidden

or

orbit section outside viewport

Avoid expensive post-processing initially.

Do not introduce a large bloom pipeline just for gold highlights.

============================================================
PHASE 26 — LOADING / FALLBACK
============================================================

Lazy-load Three.js.

Before loading:

show lightweight static fallback matching the project orbit concept.

If WebGL is unavailable:

show accessible project grid/list.

The portfolio must remain usable.

============================================================
PHASE 27 — VISUAL POLISH
============================================================

Match the supplied concept.

Primary visual palette:

#0B0907
#15100C
#21170F
antique brass
aged gold
soft ivory
warm amber

Avoid:

electric blue
cyan
purple
pink
rainbow gradients

Gold illumination should be restrained.

The interface should feel:

premium
mechanical
intelligent
astronomical
timeless
technical

not:

casino
cyberpunk
gaming RGB

============================================================
PHASE 28 — INTERACTION POLISH
============================================================

Implement smooth interpolation for:

rotation
scale
light intensity
label opacity
focus
camera adjustments

Avoid sudden state changes.

Use damping / lerp.

Example concept:

current +=
(target - current) *
(1 - Math.exp(-speed * delta))

Use frame-rate-independent easing.

============================================================
PHASE 29 — TEST PROJECT NAVIGATION
============================================================

Test every configured project.

For each project verify:

[ ] label correct

[ ] icon correct

[ ] click target correct

[ ] no accidental navigation while dragging

[ ] GitHub URL correct

[ ] live app URL correct

[ ] internal route correct

[ ] keyboard interaction works

[ ] mobile tap works

Do not mark this phase complete until every configured project has been
tested.

============================================================
PHASE 30 — QUALITY GATE
============================================================

Run:

[ ] typecheck

[ ] lint

[ ] production build

[ ] desktop interaction test

[ ] tablet test

[ ] mobile test

[ ] keyboard navigation test

[ ] reduced-motion test

[ ] performance inspection

[ ] console error check

[ ] external-link security check

[ ] WebGL fallback test

[ ] project destination test

Mark each checkbox [x] only after actual verification.

============================================================
DEFINITION OF DONE
============================================================

The feature is complete when:

[ ] Static Selected Systems cards are removed.

[ ] Real Three.js elliptical orbit appears in the same homepage region.

[ ] Orbit is visibly flatter horizontally than vertically.

[ ] Central CAM² identity remains stable.

[ ] All configured portfolio projects appear around the orbit.

[ ] Projects continuously orbit at a slow speed.

[ ] User can drag the orbit.

[ ] User can hover/focus nodes.

[ ] User can select a project.

[ ] Selected project smoothly moves into focus.

[ ] User can open the corresponding app/game/repository.

[ ] Labels remain readable and horizontal.

[ ] Mobile interaction works.

[ ] Keyboard navigation works.

[ ] Reduced-motion works.

[ ] Repository list comes from reusable data.

[ ] Future Repo2Agent/ANA activation API exists.

[ ] No major regression to the existing homepage.

[ ] Production build succeeds.

============================================================
IMPORTANT DEVELOPMENT RULE
============================================================

DO THIS SEQUENTIALLY.

First create the basic ellipse and three temporary test nodes.

Verify movement.

Then add real project nodes.

Verify interaction.

Then add selection/navigation.

Verify navigation.

Then add visual polish.

Do NOT spend time on shaders or complex effects before the fundamental
interaction works.

After each verified task:

update taskplan.md immediately:

[ ] → [x]

If something fails:

leave [ ]

and write:

BLOCKED: <exact reason>

Do not mark work complete merely because code exists.


The small ○ are the brass flow balls. The larger ● are your actual projects.

When the user touches StrudelAI, for example, the entire track rotates smoothly until StrudelAI comes forward. Then:

STRudelAI
Generative Music + AI

[ Open App ↗ ]    [ GitHub ]    [ Ask ANA ]

For a game, [Open App] launches the game. For ASTRAEA or PINÁCULO, the third action can eventually activate that specialist agent through ANA. For Repo2Agent, it can open the architecture/project page.

And later, once the Repo2Agent system is working, this same orbit can become a live visualization of ANA's reasoning: ASTRAEA and PINÁCULO illuminate when those agents are being called, and the small metallic balls move toward the central CAM² medallion as data flows between them. That would connect the visual design directly to how the portfolio actually works.