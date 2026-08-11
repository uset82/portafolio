# Third-party notices

## Animate UI button primitive

The adapted motion-button behavior in `src/components/animate-ui/button.tsx` is based on the copy-first Animate UI Button primitive by Skyleen.

- Project: <https://github.com/imskyleen/animate-ui>
- Component documentation: <https://animate-ui.com/docs/primitives/buttons/button>
- License: MIT
- Local changes: removed `asChild`/Slot composition, reduced hover/tap scale, removed default visual styling, and applied the Natural Observatory tokens.

## Motion

Motion is used for the root reduced-motion policy, the reading-order hero reveal, and the adapted button behavior.

- Project: <https://motion.dev/>
- License: MIT

## OpenRouter TypeScript SDK

The server-only CC AI integration boundary uses the official OpenRouter TypeScript SDK.

- Package: `@openrouter/sdk` 0.13.65
- Project: <https://github.com/OpenRouterTeam/typescript-sdk>
- License: Apache-2.0
- Local boundary: no browser import, no SDK debug logger, and tests inject a deterministic factory without network access.

## Fonts

Cormorant Garamond and Manrope are loaded through Next.js font optimization and distributed under the SIL Open Font License. They are bundled by the production build rather than loaded from a third-party browser request.

- Cormorant Garamond source: <https://github.com/google/fonts/tree/main/ofl/cormorantgaramond>
- Manrope source: <https://github.com/google/fonts/tree/main/ofl/manrope>
- Bundled license and copyright notices: `LICENSES/FONTS-OFL-1.1.txt`

## Favicon and app icons

`src/app/favicon.ico`, `src/app/icon.png`, and `src/app/apple-icon.png` are owner-created media: derivatives of Carlos Carpio's CA²M monogram, approved for public display on 2026-07-27. They replaced the MIT-licensed Next.js starter favicon that shipped until that date, so no third-party icon asset remains in the build.

## Launch asset boundary

- The runtime Observatory poster is byte-identical to Carlos's ownership-recorded design reference and was approved for public production display on 2026-07-25.
- The CA²M header/CC AI mark, favicon, and app icons are controlled derivatives of Carlos's owned monogram and were approved for public display on 2026-07-27.
- The muted robot-water hero clip and its poster are controlled, hash-pinned derivatives of Carlos's owned video and were approved for silent looping homepage playback on 2026-07-27. On 2026-08-11 both were regenerated from a new owned Observatory sequence under the same recipe; the superseded source is no longer served.
- No project screenshots, launch music, external embeds, raw local GLB, HDR environment, or other unapproved local media is included in the runtime.
- Current water, scene fallback geometry, procedural 3D assets, CSS materials, and lighting are repository-authored code output rather than imported third-party media.
