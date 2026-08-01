<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/docs/whatsapp-channel.md; checkedOn: 2026-07-31; redactions: 2 -->

# WhatsApp Channel Adapter

NemoClaw now includes a `WhatsAppAdapter` in `@nemoclaw/core` for running the shared agent runtime behind a Meta WhatsApp Cloud API phone number.

## How it works

- Outbound replies use the Graph API `/{phoneNumberId}/messages` endpoint.
- Inbound messages are accepted through `adapter.receiveWebhookPayload(payload)`.
- The adapter converts each inbound text message into the shared `ChannelInboundEnvelope` shape used by `ChannelManager` and `ChannelAgentBridge`.
- Conversation reuse is keyed by `<adapter-id>:<wa-id>`, so repeated messages from the same WhatsApp identity land in the same persisted NemoClaw conversation.

## Required config

```ts
const adapter = new WhatsAppAdapter({
  id: 'whatsapp-main',
  name: 'WhatsApp Main',
  accessToken: [REDACTED credential-like value]
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  agentId: 'support-agent'
})
```

Optional fields:

- `baseUrl` defaults to `https://graph.facebook.com`
- `apiVersion` defaults to `v21.0`
- `requestTimeoutMs` defaults to `30000`

## Runtime wiring

```ts
const manager = new ChannelManager()
const adapter = new WhatsAppAdapter({
  id: 'whatsapp-main',
  accessToken: [REDACTED credential-like value]
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  agentId: 'support-agent'
})

manager.register(adapter)

const bridge = new ChannelAgentBridge({
  channelManager: manager,
  lifecycleService
})

bridge.start()
await manager.startAdapter('whatsapp-main')
```

When your local HTTP layer receives the Meta webhook body, pass it straight through:

```ts
await adapter.receiveWebhookPayload(request.body)
```

Only text messages are routed right now. Non-text webhook events are ignored without failing the adapter.
