<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/artifacts/observatory-capability-policy.md; checkedOn: 2026-07-31; redactions: 0 -->

# Observatory capability and quality policy

Date: 2026-07-23
Tasks: 4.32 and 5.34
Status: mounted and browser-verified; the live Canvas remains rights-gated

## Ownership

`ObservatorySceneRuntimeProvider` wraps the hero scene and its experience controls. Its capability controller therefore runs before the poster-first mounting decision instead of depending on a WebGL renderer that may not exist. Browser signals and the resolved decision are projected into version 3 of `ObservatorySceneStore`; no Three.js object is the source of truth.

The controller observes:

- WebGL2 creation with `failIfMajorPerformanceCaveat`;
- viewport width and height plus the actual device pixel ratio;
- optional approximate device memory and logical processor count;
- `prefers-reduced-motion`;
- optional reduced-data and effective-connection hints;
- optional battery charging state and normalized charge level;
- document visibility.

Every non-baseline API is feature-detected. Missing device-memory, connection, or battery information is neutral. Battery access is caught when unsupported, insecure, or policy-blocked. Resize, media-query, connection, battery, and visibility listeners have paired cleanup, and resize-like changes are coalesced through one animation-frame callback. No signal is logged, persisted, or sent to a service.

## Decision precedence

| Condition | Result | Reason |
| --- | --- | --- |
| WebGL2 unknown | Static poster | Fail closed before assessment |
| WebGL2 unsupported or major caveat | Static poster | Current Three.js renderer requires WebGL2 |
| Supported WebGL2 plus explicit Poster/Reduced/Full choice | Manual tier | Explicit visitor choice wins over soft hints |
| Automatic plus reduced-data or slow-2g/2g | Static poster | Avoid optional scene transfer |
| Automatic plus reduced motion, low uncharged battery, width below 768px, DPR above 2 below 1024px, memory at or below 4 GB, four or fewer logical processors, or 3G | Reduced | Preserve the scene with cheaper motion/material/loading behavior |
| Supported WebGL2 with no limiting signal | Full | Balanced default |

WebGL2 support is the only hard gate against a manual Full request. Manual Full does not override the separate motion preference: reduced-motion still projects the non-animated scene behavior. Automatic data-saving remains conservative, while a deliberate manual choice can opt back into a live tier.

## Visitor controls and persistence

`ObservatoryExperienceControls` is mounted as one native disclosure in the homepage hero and is also linked from the desktop header. It contains:

- Auto, Full, Reduced, and Poster quality radios;
- Follow system and Reduce motion radios;
- a Pause/Resume scene-motion button;
- a truthful mute-first Sound status and `/sound` route;
- one Reset settings action;
- one atomic polite status describing resolved quality, motion, and sound.

The sound state remains muted and unavailable until approved tracks, credits, and rights exist. Sound activation and autoplay are never persisted.

Only explicit quality, motion, and pause preferences use browser-local storage. The versioned parser rejects malformed or incompatible data; cross-tab changes are applied atomically; storage failures leave the controls functional; Reset clears the stored entry and restores Auto, Follow system, and unpaused motion. Capability signals, sound state, browsing data, and device details are never stored or transmitted.

Every visible option/action is at least 44px high, has a visible focus path, uses the locked Natural Observatory tokens, and removes transitions under reduced motion. Escape and Close collapse the disclosure and restore focus to its summary. Desktop places the drawer above the scene and the CC AI launcher; mobile makes the complete control an in-flow section after the poster so opening it cannot clip or cover the following semantic content.

## Verification

Thirteen focused deterministic tests cover successful, null, and exception WebGL2 probes; hard-gate behavior; all manual choices; reduced-data and slow-network poster behavior; the complete reduced-tier signal set; healthy and missing-hint defaults; versioned scene-store ownership; listener cleanup; strict preference parsing/storage/removal; atomic apply/reset; mute-first sound; the outside-Canvas runtime boundary; semantic controls; and mobile in-flow behavior.

Production-browser inspection at 1440×900 confirmed separate scene-status/control layers, an unobstructed drawer above the CC AI launcher, 44px targets, manual Poster and Reduce motion choices, Pause/Resume, persistence after reload, atomic Reset, Escape focus restoration, no horizontal overflow, and no console warnings/errors. Inspection at 390×844 confirmed an in-flow 358px-wide open control with 44px targets, reachable sound/reset/following content, no clipping, no horizontal overflow, Close focus restoration, and an unchanged Selected Systems route.

The production build remains 13 routes. This verification makes no live-model or renderer-performance claim: the critical robot URL is still rights-gated, so the public homepage correctly retained its complete poster experience throughout.

## Browser API references

- [MDN: Navigator.deviceMemory](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory)
- [MDN: NetworkInformation](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation)
- [MDN: Navigator.getBattery](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getBattery)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
