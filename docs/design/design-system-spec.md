# SPEC.1 — Design system specification

**Author:** Claude · **Date:** 2026-07-31 · **Status:** ready for implementation
**Implements:** `V.4` (type and layout ramp) and `V.5` (three motion motifs) in
`updates/tasks/CODEX-TASKS.md`
**Audience:** Codex. Build exactly this. Different-but-working gets sent back — the next task
has to fit against these token names.

---

## 1. The problem, measured

Measured in `site/src/app/globals.css` (7 298 lines) on 2026-07-31:

|                                                    |   Count |
| -------------------------------------------------- | ------: |
| Distinct `font-size` values                        | **102** |
| …of those, crammed between `0.56rem` and `0.95rem` |  **21** |
| Distinct `clamp()` expressions                     | **102** |
| `@keyframes` blocks                                |      11 |
| `transition` / `animation` declarations            |      62 |
| `prefers-reduced-motion` blocks                    |   **2** |

Twenty-one type sizes between 9px and 15px. `0.62rem`, `0.63rem`, `0.65rem`, `0.66rem`,
`0.68rem` — nobody can perceive those differences; they are drift, not design. And 73 animated
declarations guarded by 2 reduced-motion blocks means **most motion has no reduced-motion path
at all**, which is a WCAG 2.2 problem, not just an aesthetic one.

What already exists and is good — **do not touch it**: the locked palette in
`site/src/styles/tokens.css`, the font pairing (Cormorant Garamond display / Manrope body),
`--page-gutter`, `--page-max`, `--reading-max`, and `MotionConfig reducedMotion="user"` with
easing `[0.16, 1, 0.3, 1]` in `motion-provider.tsx`. This spec adds a scale on top; it does not
restyle the site.

---

## 2. Type ramp — 8 roles replace 102 values

Add to `site/src/styles/tokens.css`. Every role is a triplet: size, line-height, tracking.

| Token             | Size                              | Line-height | Tracking   | Font    | Use                                   |
| ----------------- | --------------------------------- | ----------- | ---------- | ------- | ------------------------------------- |
| `--text-display`  | `clamp(3.2rem, 5vw, 6.25rem)`     | `0.9`       | `-0.045em` | display | Hero headline. One per page, maximum. |
| `--text-headline` | `clamp(2rem, 3.2vw, 3.4rem)`      | `0.96`      | `-0.04em`  | display | Section `h2`                          |
| `--text-title`    | `clamp(1.35rem, 1.8vw, 1.85rem)`  | `1.15`      | `-0.02em`  | display | Card and subsection `h3`              |
| `--text-lead`     | `clamp(1.08rem, 1.45vw, 1.35rem)` | `1.5`       | `-0.01em`  | body    | Intro paragraph, one per section      |
| `--text-body`     | `clamp(1rem, 1.1vw, 1.125rem)`    | `1.7`       | `0`        | body    | Default prose                         |
| `--text-caption`  | `0.875rem`                        | `1.6`       | `0`        | body    | Supporting text, metadata, credits    |
| `--text-label`    | `0.75rem`                         | `1.25`      | `0.06em`   | body    | Uppercase section labels              |
| `--text-micro`    | `0.6875rem`                       | `1.4`       | `0.13em`   | body    | Chips, counters, numerals             |

Four of these are values already in the codebase — `--text-display`, `--text-title`,
`--text-lead`, `--text-body` are lifted verbatim from the current hero, card, intro, and prose
rules. That is deliberate: the ramp should not visibly restyle those, only name them.

**Hard floor: `--text-micro` at `0.6875rem` (11px).** The current `0.56rem` is 9px, below
comfortable reading at any zoom level. **Nothing may be smaller.**

**Declare each role as a single shorthand-ish group** so a rule adopts all three properties at
once and they cannot drift apart:

```css
:root {
  --text-body-size: clamp(1rem, 1.1vw, 1.125rem);
  --text-body-leading: 1.7;
  --text-body-tracking: 0;
  /* …one triplet per role */
}

/* Utility class per role, used instead of ad-hoc font-size */
.type-body {
  font-family: var(--font-body);
  font-size: var(--text-body-size);
  line-height: var(--text-body-leading);
  letter-spacing: var(--text-body-tracking);
}
```

---

## 3. Spacing scale — 8 steps replace 102 clamps

| Token         | Value                    | Use                                                       |
| ------------- | ------------------------ | --------------------------------------------------------- |
| `--space-3xs` | `0.25rem`                | Icon-to-label gap                                         |
| `--space-2xs` | `0.5rem`                 | Inside a control                                          |
| `--space-xs`  | `0.75rem`                | Tight stack                                               |
| `--space-sm`  | `1rem`                   | Default stack                                             |
| `--space-md`  | `1.5rem`                 | Between related blocks                                    |
| `--space-lg`  | `2.5rem`                 | Between groups                                            |
| `--space-xl`  | `clamp(3rem, 5vw, 5rem)` | Between subsections                                       |
| `--space-2xl` | `clamp(4rem, 8vw, 8rem)` | Between page sections _(matches current `padding-block`)_ |

`--space-2xl` is the existing section rhythm, kept exactly. The rest are new.

Existing layout tokens stay as they are: `--page-gutter`, `--page-max`, `--reading-max`,
`--header-height`, `--control-height`.

---

## 4. Grid

One 12-column grid, one gap token, no per-component grids.

```css
.layout-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--space-md);
  max-width: var(--page-max);
  margin-inline: auto;
  padding-inline: var(--page-gutter);
}
```

Named spans so components declare intent rather than arithmetic: `--span-full` (1 / -1),
`--span-wide` (2 / 12), `--span-text` (capped at `--reading-max`), `--span-half`.

**Mobile is designed, not compressed** — `rules.md` requires this. Below `48rem` the grid
collapses to a single column and `--space-2xl` steps down to `--space-xl`; it is not simply the
desktop layout squeezed.

---

## 5. Motion — exactly three motifs

`rules.md` caps this at two to three deliberately. Three, no fourth. Every motif has a **real
reduced-motion alternative**, not a disabled state — the information and the sequence must
survive.

Shared easing, already in `motion-provider.tsx`: `--ease-entrance: cubic-bezier(0.16, 1, 0.3, 1)`.
Add `--ease-exit: cubic-bezier(0.4, 0, 1, 1)`.

### Motif 1 — Reveal

Staged entrance for editorial blocks. Extends the existing `hero-item-enter` keyframe.

|                |                                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| Trigger        | Element enters viewport, once. Never replays on scroll-back.                                             |
| Properties     | `opacity` 0 → 1, `translateY` `0.75rem` → 0                                                              |
| Duration       | `--motion-reveal: 480ms`                                                                                 |
| Easing         | `--ease-entrance`                                                                                        |
| Stagger        | `--motion-stagger: 60ms`, capped at **6 items** — beyond that the last item waits too long               |
| Reduced motion | Opacity only, `160ms`, **no stagger, no transform**. Content still fades in, so the arrival still reads. |

### Motif 2 — Focus pull

Depth and weight shift on hover and keyboard focus for media, project cards, and links.

|                |                                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| Trigger        | `:hover`, `:focus-visible`                                                                                           |
| Properties     | `--shadow-soft` strength, border colour `--color-border-soft` → `--color-border-strong`, `scale(1.01)` on media only |
| Duration       | `--motion-focus: 180ms`                                                                                              |
| Easing         | `--ease-entrance`                                                                                                    |
| Reduced motion | Border and shadow change **instantly**, no scale. The affordance stays; the movement goes.                           |

**`:focus-visible` must produce the same visual result as `:hover`.** A keyboard user gets the
same information a mouse user gets — the existing `--shadow-focus` token already carries the ring.

### Motif 3 — Passage

Route transitions, via the existing `template.tsx` and `route-entry-settle` keyframe.

|                |                                                                    |
| -------------- | ------------------------------------------------------------------ |
| Trigger        | Route change                                                       |
| Properties     | `opacity` 0 → 1, `translateY` `0.5rem` → 0 on the main region only |
| Duration       | `--motion-passage: 320ms`                                          |
| Easing         | `--ease-entrance`                                                  |
| Reduced motion | Opacity only, `120ms`, no transform                                |

**Never animate the header, footer, or skip link** — persistent chrome moving between routes
reads as a page reload and breaks the sense of place.

### What gets deleted

Of the 11 keyframes, these three motifs cover: `hero-item-enter`, `scene-enter`,
`route-entry-settle`, `case-study-arrive`, `recovery-copy-arrive`,
`recovery-instrument-arrive`, `selected-systems-acknowledge`. **Consolidate them into the three
motifs.** `cc-ai-connect`, `cc-ai-cursor`, `mobile-nav-enter`, and `recovery-signal` are
component state indicators, not motifs — keep them, but they still need reduced-motion paths.

---

## 6. Migration — how to change 102 values without breaking 7 298 lines

Do not rewrite `globals.css` in one pass. Four phases, each its own PR.

**Phase 1 — Add, change nothing.** Add every token from §2–§5 to `tokens.css` plus the `.type-*`
utilities. Nothing consumes them yet. `pnpm verify` green, zero visual diff.

**Phase 2 — Publish the mapping table.** Map all 102 font sizes and 102 clamps to their nearest
role, as a committed table in this folder. Anything that lands **more than one step** from its
nearest role gets flagged in the PR rather than silently moved — that is where a real design
decision is hiding.

**Phase 3 — Replace, section by section.** One PR per area: header/footer → hero → work →
laboratory → sound/cosmos/story → contact → CC AI panel. Each PR includes **rendered captures at
1440×900, 1129×868, and 390×844**. `rules.md`: a passing build is not proof of visual quality.

**Phase 4 — Lock it.** Add `pnpm tokens:check` — fails if a raw `font-size` appears outside
`tokens.css`, or a raw `clamp()` appears outside the token block, or any size falls below
`0.6875rem`. Join it to `pnpm test` beside `palette:check`. **Without this the drift returns
within a month** — that is how 102 values happened in the first place.

---

## 7. Acceptance

**`V.4` is done when:**

- 8 type roles and 8 spacing steps exist in `tokens.css` with utility classes
- No raw `font-size` outside `tokens.css`; `tokens:check` enforces it and runs in `pnpm test`
- Nothing renders below `0.6875rem`
- The grid is one definition, not per-component
- A live token page renders every role and step — **rendered, not just a file** (`rules.md`)
- `pnpm verify` green; captures at all three viewports in the PR
- Client JS and CSS are **no larger** than the `F.5` baseline of 2 879 KB

**`V.5` is done when:**

- Exactly three motifs exist, driven by tokens, with the consolidation in §5 applied
- **Every** animated declaration has a reduced-motion path — the 2-of-73 coverage gap is closed
- Each reduced-motion path is a real alternative, verified with the OS setting on
- `:focus-visible` gives the same result as `:hover` everywhere
- Header, footer, and skip link never animate on route change
- Keyboard-only pass at all three viewports

---

## 8. Out of scope

Not in this spec, and not for Codex to decide: the hero composition (`V.2`/`V.3`, mine), the
arcade (`SPEC.3`), `/studio` (`SPEC.2`), atmosphere plates (`V.6`, Gemini), and the palette —
**locked, and `palette:check` enforces it.** No blue, cyan, violet, neon, or near-black.
