<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/docs/contributing-channels.md; checkedOn: 2026-07-31; redactions: 0 -->

# Contributing Channels

Channel adapters bring external messaging systems onto the same lifecycle and policy path already used by the CLI and web client. New adapters should plug into the shared channel manager and bridge instead of creating a separate agent runtime.

## Key Files

- `packages/core/src/types/channel.ts`
- `packages/core/src/runtime/channel-manager.ts`
- `packages/core/src/runtime/channel-agent-bridge.ts`
- `packages/core/src/runtime/telegram-adapter.ts`
- `packages/core/src/runtime/whatsapp-adapter.ts`
- `packages/core/src/runtime/discord-adapter.ts`
- `packages/core/test/channel-manager.test.ts`
- `packages/core/test/channel-agent-bridge.test.ts`

## Architecture

The channel stack has three layers:

1. typed envelopes, sessions, and adapter contracts in `types/channel.ts`
2. normalization, identity mapping, allowlists, and rate limits in `channel-manager.ts`
3. lifecycle reuse in `channel-agent-bridge.ts`, which routes inbound messages through `chatWithAgent(...)`

That split is intentional. Keep transport details inside the adapter and shared routing rules inside the manager and bridge.

## Adapter Rules

- implement `ChannelAdapter`
- emit typed inbound envelopes and adapter events
- keep adapter ids stable and channel names explicit
- normalize provider payloads into `InternalMessage`
- ignore transport-specific noise that would create loops or empty turns

Existing adapters are the reference patterns:

- Telegram: polling-oriented inbound flow
- WhatsApp: webhook-style inbound flow plus Graph API outbound sends
- Discord: gateway event payloads and bot outbound sends

## Do Not Bypass

- identity mapping
- allowlist enforcement
- inbound rate limiting
- lifecycle conversation binding
- policy-aware runtime execution

If a new channel needs metadata, add it to shared session or message metadata instead of forking the bridge logic.

## Verification

At minimum, cover:

- `packages/core/test/channel-manager.test.ts`
- `packages/core/test/channel-agent-bridge.test.ts`

For a new adapter, add both:

- adapter-level tests, for example `packages/core/test/<adapter>-adapter.test.ts`
- runtime integration tests, for example `packages/core/test/<channel>-channel-runtime.test.ts`

Finish with:

```sh
npm run build
npm run test
```
