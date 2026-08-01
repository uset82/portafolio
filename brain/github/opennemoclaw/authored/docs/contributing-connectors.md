<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/docs/contributing-connectors.md; checkedOn: 2026-07-31; redactions: 0 -->

# Contributing Connectors

The connectors package owns external transport and provider integrations. Today it includes the HTTP connector used by tools and the OpenRouter inference provider used by the lifecycle path.

## Key Files

- `packages/connectors/src/http-connector.ts`
- `packages/connectors/src/openrouter-provider.ts`
- `packages/connectors/src/registry.ts`
- `packages/connectors/src/index.ts`
- `packages/cli/src/lifecycle.ts`
- `packages/connectors/test/http-connector.test.ts`
- `packages/connectors/test/openrouter-provider.test.ts`

## Two Integration Shapes

There are two common contribution paths:

- connector implementations that satisfy the core connector contracts
- inference providers that satisfy the core inference-provider contracts

The current CLI lifecycle wiring creates the default inference provider in `packages/cli/src/lifecycle.ts`. If you add a new provider, update that selection path and the diagnostics flow that depends on it.

## Connector Rules

- Enforce policy checks before outbound network requests when the connector is runtime-bound.
- Keep auth configuration explicit in the typed config schema.
- Normalize response shapes so tools and services do not need connector-specific branches.
- Surface retryable versus terminal failures clearly.
- Avoid embedding user-specific configuration defaults in the connector package.

## HTTP Connector Notes

`HttpConnector` is the main reference implementation.

- it validates config through the shared HTTP connector schema
- it performs policy-aware request authorization when a binding is provided
- it exposes both request/response and streaming paths

Use it as the reference when adding another connector with runtime-bound policy enforcement.

## Inference Provider Notes

`OpenRouterProvider` is the current reference provider.

- it maps provider errors into `NemoClawError`
- it retries retryable failures with exponential backoff
- it exposes health, model listing, chat completion, and streaming

Any new provider should match that observability surface so `status`, `logs`, and lifecycle diagnostics stay coherent.

## Verification

At minimum, cover:

- `packages/connectors/test/http-connector.test.ts`
- `packages/connectors/test/openrouter-provider.test.ts`

If you change lifecycle selection or diagnostics, also add or update coverage in:

- `packages/cli/test/commands.test.ts`
- `packages/core/test/agent-lifecycle-service.test.ts`

Finish with:

```sh
npm run build
npm run test
```
