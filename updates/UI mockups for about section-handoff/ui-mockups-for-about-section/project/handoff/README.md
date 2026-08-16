# Direction 4a ("One blend") — Handoff

Three files, all inside `site/src`:

| File | What to do |
| --- | --- |
| `close-footer-4a.css` | Implemented in `app/globals.css` replacing legacy `.profile-teaser` and `.site-footer` rules. |
| `profile-teaser.tsx` | Replaces `components/profile-teaser.tsx`. |
| `site-footer.tsx` | Replaces `components/site-footer.tsx`. |

## Architecture & Layout Overview

Direction 4a connects the parchment about/profile section to the dark espresso footer with a smooth vertical gradient blend, creating a unified closing sequence:

1. **Top Section (`.profile-teaser`)**:
   - Canvas parchment (`#e8dfd5`) background.
   - Large Cormorant Garamond display heading: *"One practice, many ways of seeing."* with *many ways* italicized in walnut.
   - Concise practice bio note paired with an editorial italic serif link: `Explore profile and CV →` linking to `/story`.
2. **Gradient Transition (`.profile-teaser__blend`)**:
   - Fluid vertical band fading from `--color-canvas` (`#e8dfd5`) through linen, sand, oak, and deep wood tones to `--color-deep-espresso` (`#2a1d16`).
3. **Footer Section (`.site-footer`)**:
   - Dark espresso background (`#2a1d16`).
   - The direct ask: *"Let’s turn a difficult idea into a working system."* with pill CTA button `Visit Contact →` and privacy assurance.
   - Hairline divider (`rgba(220, 193, 172, 0.15)`).
   - Partitioned navigation:
     - Left (Primary doors): `Play` (`/arcade`), `See` (`/work`), `Listen` (`/sound`), `About` (`/story`).
     - Right (Secondary doors & signature): `Laboratory` (`/laboratory`), `Cosmos` (`/cosmos`), `Support` (`/support`), `GitHub ↗`, and single-line copyright notice.

## Content Schema & Records

The copy accent is schema-driven:

```ts
// content/schemas.ts, profileTeaserSchema
headingAccent: z.string().min(3).max(40).optional(),

// content/records.ts, metadata.profileTeaser
headingAccent: "many ways",
```

## Accessibility & Verification

- Contrast: `--color-buff` on `--color-deep-espresso` is 9.4:1; primary links sit at > 7:1.
- Semantic HTML landmarks: `<section aria-labelledby="profile-teaser-title">` and `<footer aria-labelledby="footer-contact-title">`.
- Focus outlines and full touch targets (`min-height: 44px` / mobile stretch) preserved.
- Passes all 493 automated tests, typecheck, linting, and palette boundary checks.
