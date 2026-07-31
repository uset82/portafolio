<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/chaclacayo/blob/main/AGENTS.md; checkedOn: 2026-07-31; redactions: 0 -->

# AGENTS.md — Chaclacayo Real Estate Landing Page

> A guide for AI coding agents working on this project.
> Reference: [main_idea.md](./main_idea.md) for full project blueprint.

## Project Overview

This is a **premium bilingual (ES/EN) real estate landing page** for selling a property in Chaclacayo, Lima, Peru. The site is a static single-page application (SPA) built with vanilla HTML, CSS, and JavaScript — no frameworks.

**Owner/Contact:** Carlos Carpio — carloscarpio82@hotmail.com

## Dev Environment Tips

- This is a **static site** — no build tools, no npm, no bundler required.
- Serve locally with `npx serve .` or `python -m http.server 8080` from the project root.
- All paths in HTML/CSS/JS must be **relative** (e.g., `./css/styles.css`, `./FOTOS/image.jpeg`).
- The `FOTOS/` directory contains the original property photos (JPEG). Reference them directly in the gallery.
- The video file is `FOTOS/WhatsApp Video 2026-04-27 at 15.53.37.mp4`.

## File Structure

```
chaclacayo/
├── index.html          # Main SPA page (all sections)
├── css/
│   └── styles.css      # Design system + all styles
├── js/
│   ├── main.js         # Core logic, scroll animations, form handling
│   ├── i18n.js         # ES/EN translation system
│   └── gallery.js      # Photo carousel + lightbox + video
├── FOTOS/              # Original property photos + video
├── AGENTS.md           # This file
├── rules.md            # Project rules for agents
├── skills.md           # Reusable skill definitions
└── main_idea.md        # Full project blueprint
```

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 semantic |
| Styles | Vanilla CSS with custom properties (design tokens) |
| Logic | Vanilla JavaScript (ES6+) |
| Fonts | Google Fonts (Playfair Display + Inter) |
| Icons | Inline SVG or emoji |
| Forms | mailto: pre-formatted or Formspree/EmailJS |
| Map | Google Maps Embed or Leaflet.js |

## Design System

All design tokens are defined as CSS custom properties in `css/styles.css`. Always use tokens — never hardcode colors, fonts, or spacing.

### Key Tokens
- `--color-primary: #1B4332` (forest green)
- `--color-accent: #D4A843` (gold)
- `--color-bg-dark: #0A0F0D` (dark background)
- `--color-text: #F1F1F1` (light text)
- Headings: `Playfair Display`, Body: `Inter`

## Coding Conventions

### HTML
- Use semantic elements: `<header>`, `<main>`, `<section>`, `<footer>`
- Every section needs a unique `id` for smooth scroll navigation
- All translatable text uses `data-i18n="key_name"` attributes
- Images must have descriptive `alt` text (bilingual keys)
- Use `loading="lazy"` on all images below the fold

### CSS
- Mobile-first approach — base styles are mobile, use `@media (min-width:)` for larger screens
- Breakpoints: `640px` (tablet), `1024px` (desktop)
- Use `var(--token-name)` for all design values
- Class naming: BEM-inspired (e.g., `.hero__title`, `.contact__form-field`)
- Animations use `prefers-reduced-motion` media query for accessibility

### JavaScript
- ES6+ modules, no transpilation needed
- i18n keys stored in `js/i18n.js` as a single `translations` object
- `data-i18n` attributes are the source of truth for translatable elements
- Form validation is client-side only
- Use `IntersectionObserver` for scroll-triggered animations
- Language toggle persists to `localStorage`

## Testing Instructions

1. Open `index.html` in a browser or serve with `npx serve .`
2. Verify all 8 sections render correctly
3. Test language toggle (ES ↔ EN) — all visible text should switch
4. Test all CTA buttons link to `mailto:carloscarpio82@hotmail.com`
5. Test contact form validation (name + email required)
6. Test gallery carousel navigation (arrows, thumbnails)
7. Test lightbox open/close
8. Test WhatsApp floating button link
9. Test responsive layout at 320px, 640px, 1024px, 1440px
10. Check `prefers-reduced-motion` disables animations

## PR / Commit Instructions

- Commit messages: `[section] description` (e.g., `[hero] add gradient overlay`)
- One logical change per commit
- Always test in browser before committing
- Run Lighthouse audit before final deploy

## Critical Business Rules

1. **Carlos Carpio's contact info must ALWAYS be visible** — in header, contact section, and footer
2. **Email:** carloscarpio82@hotmail.com — must appear as clickable `mailto:` link
3. **"Venta Directa / Direct Sale"** badge must appear in the hero
4. **Contact CTA must appear in at least 3 locations**: hero, mid-page, closing
5. **WhatsApp floating button** must be visible on every scroll position
6. **All content must be bilingual** — no section can be Spanish-only or English-only
7. **Property photos are real** — never replace with stock photos or AI-generated images
8. **Chaclacayo's tropical climate** is a key selling point — highlight warmth, Vitamin D, health benefits
