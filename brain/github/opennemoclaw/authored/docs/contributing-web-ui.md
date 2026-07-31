<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/docs/contributing-web-ui.md; checkedOn: 2026-07-31; redactions: 0 -->

# Contributing Web UI

The web client is a local dashboard over the shared Fastify API. UI changes should preserve that architecture: the browser talks to the API package, and the API package talks to the same lifecycle services used elsewhere.

## Key Files

- `packages/web/src/App.tsx`
- `packages/web/src/api.ts`
- `packages/web/src/styles.css`
- `packages/web/test/app.test.tsx`
- `packages/web/test/app.e2e.test.ts`
- `packages/web/test/helpers/browser-harness.ts`
- `packages/api/src/app.ts`

## Current Structure

- `App.tsx` owns the main dashboard state and interaction flow
- `api.ts` is the single browser-facing transport layer for REST and websocket chat
- `styles.css` defines the visual system
- the browser harness starts the real API and web app together for end-to-end tests

Keep new UI work within that split. If you need another server endpoint, add it in the API package first and then consume it from `api.ts`.

## UI Contribution Rules

- preserve the existing visual language unless the task is an intentional redesign
- prefer extending the current state flow over introducing parallel caches or side channels
- keep API types close to `api.ts`
- make empty states and error states explicit
- cover new user-visible flows in tests, not just helper functions

## Testing Strategy

Use both levels of coverage:

- `packages/web/test/app.test.tsx` for targeted component behavior
- `packages/web/test/app.e2e.test.ts` for real browser flows against the actual API and web bundle

If a UI change depends on new API behavior, add or update server tests in `packages/api/test/app.test.ts`.

## Practical Workflow

1. add or update API endpoints if needed
2. update `packages/web/src/api.ts`
3. update `packages/web/src/App.tsx` and `packages/web/src/styles.css`
4. extend the UI tests
5. run the web workspace tests locally, then finish with the full workspace build and test run

## Verification

Focused loop:

```sh
npm run test --workspace @nemoclaw/web
```

Final verification:

```sh
npm run build
npm run test
```
