<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/docs/discord-channel.md; checkedOn: 2026-07-31; redactions: 2 -->

# Discord Channel Adapter

NemoClaw includes a `DiscordAdapter` in `@nemoclaw/core` for routing Discord bot traffic through the shared channel runtime.

## How it works

- Outbound replies use the Discord bot REST API `POST /channels/{channelId}/messages`.
- Inbound messages are accepted through `adapter.receiveGatewayEvent(payload)`.
- The adapter accepts either a full Discord gateway dispatch envelope for `MESSAGE_CREATE` or the raw message payload itself.
- Conversation reuse is keyed by `<adapter-id>:<channel-or-thread-id>:<user-id>`, which keeps per-user context separated inside shared Discord channels.
- Bot-authored and empty messages are ignored to avoid reply loops.

## Required config

```ts
const adapter = new DiscordAdapter({
  id: 'discord-main',
  name: 'Discord Main',
  botToken: [REDACTED credential-like value]
  agentId: 'support-agent'
})
```

Optional fields:

- `baseUrl` defaults to `https://discord.com/api`
- `apiVersion` defaults to `v10`
- `requestTimeoutMs` defaults to `30000`
- `suppressMentions` defaults to `true`

## Runtime wiring

```ts
const manager = new ChannelManager()
const adapter = new DiscordAdapter({
  id: 'discord-main',
  botToken: [REDACTED credential-like value]
  agentId: 'support-agent'
})

manager.register(adapter)

const bridge = new ChannelAgentBridge({
  channelManager: manager,
  lifecycleService
})

bridge.start()
await manager.startAdapter('discord-main')
```

When your gateway client receives a `MESSAGE_CREATE` event, pass the event into the adapter:

```ts
await adapter.receiveGatewayEvent(gatewayPayload)
```

Only text message content is routed right now. Non-message gateway events are ignored without failing the adapter.
