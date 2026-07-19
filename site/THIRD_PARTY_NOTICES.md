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
