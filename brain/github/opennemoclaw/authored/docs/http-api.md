<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/docs/http-api.md; checkedOn: 2026-07-31; redactions: 3 -->

# Local HTTP API

`@nemoclaw/api` provides the local Fastify server that exposes the shared agent runtime over HTTP and websockets.

The preferred way to run it from the installed CLI is:

```sh
nemoclaw serve
```

For remote-control or reverse-proxy patterns, see [remote-control.md](/Users/carlo/PROYECTOS/nemoclaw/docs/remote-control.md).

## Create the server

Use `createConfiguredApiServer` when you want the API to boot from the normal NemoClaw config directories and runtime services.

```ts
import { ConfigManager } from '@nemoclaw/core';
import { createConfiguredApiServer } from '@nemoclaw/api';

const configManager = new ConfigManager();
const app = await createConfiguredApiServer({
  configManager,
  authToken: [REDACTED credential-like value]
  corsOrigin: true
});

await app.listen({
  host: '127.0.0.1',
  port: 3000
});
```

Use `createApiServer` when tests or custom hosts need to inject their own lifecycle service, conversation store, or policy store.

## Auth and transport

- REST and websocket routes accept `Authorization: Bearer <token>` when `authToken` is configured.
- Browser websocket clients can also pass the same token as `?token=[REDACTED credential-like value] credential-like value]` because browsers do not allow custom `Authorization` headers during websocket connection setup.
- `GET /health` stays open for local health checks.
- CORS can be disabled, set to `true`, or restricted to one or more origins with `corsOrigin`.
- When the API is intended for remote clients, prefer explicit origins or disabled CORS instead of wildcard browser access.

## Routes

- `GET /agents`
- `POST /agents`
- `GET /agents/:name`
- `POST /agents/:name/start`
- `POST /agents/:name/stop`
- `DELETE /agents/:name?keepData=true|false`
- `GET /agents/:name/conversations`
- `POST /agents/:name/messages`
- `GET /agents/:name/logs?tail=<n>`
- `GET /conversations/:id`
- `GET /conversations/:id/messages?limit=<n>`
- `GET /conversations/:id/tool-executions`
- `GET /policies`
- `GET /policies/:id`
- `PUT /policies/:id`

## Streaming chat

Connect to `GET /agents/:name/messages/stream` with a websocket client and send JSON shaped like:

```json
{
  "type": "chat.request",
  "prompt": "Summarize the last run",
  "conversationId": "optional-conversation-id"
}
```

The server sends:

- `chat.chunk` for streamed assistant text
- `chat.complete` with the final `chatWithAgent` result payload
- `chat.error` when request validation or runtime execution fails
