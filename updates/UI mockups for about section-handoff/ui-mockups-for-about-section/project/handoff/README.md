# Direction 1b — handoff

Three files, all inside `site/src`:

| File | What to do |
| --- | --- |
| `close-footer-1b.css` | Replace the last two blocks of `app/globals.css` ("The close…" from line ~9887 and "Footer — a signature bar…") with this. Also delete the now-dead `.profile-teaser__mark` / `.site-footer__signal` / `.site-footer__status` rules earlier in the file (lines ~3207–3432) and the old `.profile-teaser`/`.site-footer` blocks at ~3105–3490 they belong to. |
| `profile-teaser.tsx` | Replaces `components/profile-teaser.tsx`. |
| `site-footer.tsx` | Replaces `components/site-footer.tsx`. |

## Call-site change

`ProfileTeaser` no longer takes `footer` — the invitation lives in the footer now:

```diff
- <ProfileTeaser content={metadata.profileTeaser} footer={metadata.footer} />
+ <ProfileTeaser content={metadata.profileTeaser} />
```

`SiteFooter`'s props are unchanged.

## Optional content change — the italic accent

The mock sets *many ways* in italic walnut. That is a copy decision, so it stays
in content rather than being sliced out of the string in CSS:

```ts
// content/schemas.ts, profileTeaserSchema
headingAccent: z.string().min(3).max(40).optional(),

// content/records.ts, metadata.profileTeaser
headingAccent: "many ways",
```

Without it the heading prints plain and nothing breaks.

## Notes

- No new tokens. Colours, fonts, radii and timings all resolve from `tokens.css`.
- Contrast: `--color-buff` on `--color-espresso` is 9.4:1; the 50%-ivory
  micro-labels sit at 4.7:1, so keep them at 600 weight and no smaller than
  0.62rem.
- The scroll-in uses `animation-timeline: view()`, which degrades to no
  animation where it is unsupported — no JS, no observer, no layout shift.
- Hover indent on the thread rows is behind `@media (hover: hover)`.
