<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/pacha/blob/main/DESIGN.md; checkedOn: 2026-07-31; redactions: 0 -->

# Pasha Design System

## Overview
Editorial luxury for a Bergen restaurant: deep charcoal and emerald surfaces, warm brass accents, real food photography, calm spacing, and restrained motion. The site should feel like an intimate dining invitation, not a generic booking product.

## Colors
- **Ink** `#070706`: primary page background and high-contrast image scrims.
- **Charcoal** `#14120f`: elevated surfaces and admin workspace background.
- **Emerald** `#10231c`: atmospheric section bands and quiet depth.
- **Ivory** `#f7f0df`: primary text on dark surfaces.
- **Mist** `#d6cab2`: secondary text and fine dividers.
- **Brass** `#caa15a`: primary CTAs, focus rings, small highlights.
- **Terracotta** `#a24f33`: reserved for warm food/detail accents and warnings.

## Typography
- **Headlines**: Playfair Display, 600-700 weight, generous line-height.
- **Body/UI**: Inter, 400-600 weight, clear labels and readable menu text.
- Use hero-scale type only for the public hero. Admin screens use compact utility headings.

## Components
- **Buttons**: 999px radius for primary public CTAs; 8px radius for admin actions. Brass fill for the single most important action.
- **Inputs**: Dark surface, 1px mist/brass border on focus, 8px radius, visible labels.
- **Menu rows**: Image-led editorial rows with dividers and hover underline/image lift, not dense card grids.
- **Admin panels**: Calm bordered surfaces with minimal shadow; cards only for grouped editing forms or repeated records.

## Motion
- Hero image fades and slowly scales, disabled for `prefers-reduced-motion`.
- Sections reveal with subtle upward opacity transitions.
- Menu and admin controls use restrained hover/focus transitions only.

## Do's and Don'ts
- Do make the restaurant name unmistakable in the first viewport.
- Do use real restaurant photos before generated or stock imagery.
- Do keep CTAs clear: Book a table and Order via Foodora.
- Don't use decorative gradient blobs, busy card mosaics, or large marketing copy blocks.
- Don't present illustrative food as actual dishes unless labeled.
