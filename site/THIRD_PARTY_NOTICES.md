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

## Next.js starter favicon

`src/app/favicon.ico` is the unmodified favicon from the official Next.js `app-tw/ts` starter template. Its SHA-256 matches the current canonical template file reviewed on 2026-07-20.

- Project: <https://github.com/vercel/next.js>
- Source: <https://github.com/vercel/next.js/blob/canary/packages/create-next-app/templates/app-tw/ts/app/favicon.ico>
- License: MIT
- Bundled license: `LICENSES/NEXTJS-MIT.txt`
- Product decision: legally permitted but visually temporary; replace it with an approved Carlos mark during the personal-brand task.

## Launch asset boundary

- The runtime Observatory poster is byte-identical to Carlos's approved private design reference. It is permitted for the current local/preview implementation only; production publication remains on hold until Carlos confirms public-display rights or approves a rights-cleared replacement.
- No project screenshots, audio, video, repository hero art, local monogram media, HDR environment, or GLB model is approved for production publication.
- Current water, scene fallback geometry, and the CC mark are repository-authored code/CSS/SVG output rather than imported third-party media.
