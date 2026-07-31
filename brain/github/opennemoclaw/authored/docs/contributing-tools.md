<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/docs/contributing-tools.md; checkedOn: 2026-07-31; redactions: 0 -->

# Contributing Tools

Tools are host-defined actions that the shared turn executor can call during a conversation. They are registered in core and executed through the same conversation, policy, and persistence path used by CLI, channels, and the web app.

## Key Files

- `packages/core/src/types/tool.ts`
- `packages/core/src/tools/registry.ts`
- `packages/core/src/tools/builtins.ts`
- `packages/core/src/services/agent-lifecycle-service.ts`
- `packages/core/test/tool-registry.test.ts`
- `packages/core/test/agent-turn-executor.test.ts`

## Tool Contract

A tool implements `ToolDefinition`:

- `name`
- `description`
- `requiredCapabilities`
- `execute(input, context)`

The contract is defined in `packages/core/src/types/tool.ts`. The registry enforces capability checks before executing a tool call.

## Current Registration Model

Built-in tools are returned by `createBuiltInTools()` in `packages/core/src/tools/builtins.ts` and registered by `AgentLifecycleService`.

If you add a new built-in tool:

1. define the tool in `builtins.ts`
2. declare the required capabilities
3. keep input validation explicit
4. return structured output that can be serialized into conversation history

## Design Rules

- Do not bypass policy enforcement if the tool touches network, filesystem, process execution, or memory-adjacent state.
- Keep tool inputs JSON-friendly and validate them early.
- Use agent capabilities as the first permission boundary.
- Keep outputs deterministic enough for tests and downstream inspection.
- Prefer extending the shared registry over hard-coding tool behavior in an agent or adapter.

## Minimal Example

```ts
import type { ToolDefinition } from '../types/index.js';

export const echoTool: ToolDefinition = {
  name: 'echo_text',
  description: 'Return a normalized echo of the input text.',
  requiredCapabilities: [],
  async execute(input) {
    const text = String(input.text ?? '').trim();
    return {
      echoed: text
    };
  }
};
```

## Where Execution Happens

- tool calls are parsed from model output in `packages/core/src/tools/registry.ts`
- executions are persisted to the conversation store
- the turn executor feeds the tool result back into the assistant loop

If you need new execution context, extend the shared tool context instead of inventing a second tool runtime.

## Verification

Cover both registration and runtime behavior:

- `packages/core/test/tool-registry.test.ts`
- `packages/core/test/agent-turn-executor.test.ts`

If the tool depends on a capability-heavy runtime path, also add lifecycle-level coverage.

Finish with:

```sh
npm run build
npm run test
```
