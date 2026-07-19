# Observatory capability and quality policy

Date: 2026-07-19
Task: 4.32
Status: verified, intentionally unmounted

## Ownership

`ObservatorySceneRuntimeProvider` wraps the optional Canvas. Its capability controller therefore runs before the poster-first mounting decision instead of depending on a WebGL renderer that may not exist. Browser signals and the resolved decision are projected into version 2 of `ObservatorySceneStore`; no Three.js object is the source of truth.

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

## Manual control

`ObservatoryQualityControl` is a semantic fieldset with four radio choices: Auto, Full, Reduced, and Poster. It reports the current resolved tier and whether the choice is automatic or manual through a polite live region. Each option is at least 44px high, has a visible focus path, uses the locked Natural Observatory tokens, reflows to two columns on narrow widths, and removes transitions under reduced motion.

The control is exported but not mounted in a route. Task 4.33 will place the runtime provider, poster, optional Canvas, status, and manual control in one progressive-enhancement boundary.

## Verification

Eight deterministic tests cover successful, null, and exception WebGL2 probes; hard-gate behavior; all manual choices; reduced-data and slow-network poster behavior; the complete reduced-tier signal set; healthy and missing-hint defaults; versioned scene-store ownership; listener cleanup; the outside-Canvas runtime boundary; and the semantic 44px reduced-motion-aware manual control.

All 78 unit tests, lint, strict type-check, palette validation, and the production build pass. The build remains 13 pages, and capability/runtime markers are absent from initial route chunks because no route imports the scene.

Extended browser QA was not run. This slice makes no claim about a real device's exposed hints or the visual presentation of the unmounted control. Desktop and mobile QA remain separately approval-gated.

## Browser API references

- [MDN: Navigator.deviceMemory](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory)
- [MDN: NetworkInformation](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation)
- [MDN: Navigator.getBattery](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getBattery)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
