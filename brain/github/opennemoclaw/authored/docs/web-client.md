<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/docs/web-client.md; checkedOn: 2026-07-31; redactions: 1 -->

# Web Client

`@nemoclaw/web` is the local React + Vite dashboard for NemoClaw. It talks to the Fastify API and uses the same runtime, persistence, and policy paths as the CLI and channel adapters.

## Start the API

The dashboard expects the local API from `@nemoclaw/api` to be available first.

The simplest way to start that API is:

```bash
nemoclaw serve
```

## Run the dashboard

```bash
npm run dev --workspace @nemoclaw/web
```

For a production bundle:

```bash
npm run build --workspace @nemoclaw/web
```

## What the dashboard covers

- onboarding and API connection setup with a saved base URL and bearer token
- agent creation plus start and stop controls
- searchable conversation history
- live chat against the websocket streaming endpoint
- recent agent logs
- conversation-level tool execution inspection
- policy visibility for the loaded policy set

## Auth notes

- REST requests use the configured bearer token.
- Browser websocket requests automatically send the same token through the API `?token=[REDACTED credential-like value] query parameter because browsers cannot attach custom `Authorization` headers during websocket connection setup.
- The base URL can point to a remote or reverse-proxied NemoClaw API as long as the remote server is started with safe auth and CORS settings.

## Verification

Run the web package tests with:

```bash
npm run test --workspace @nemoclaw/web
```

That suite includes:

- jsdom coverage for the dashboard state flow
- a real-browser end-to-end flow that launches the locally installed Edge or Chrome binary through `playwright-core`, starts a temporary Fastify API harness, and drives the Vite-served dashboard through onboarding, history, logs, policy inspection, tool inspection, and streaming chat
