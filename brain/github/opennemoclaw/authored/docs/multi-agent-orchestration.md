<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/docs/multi-agent-orchestration.md; checkedOn: 2026-07-31; redactions: 0 -->

# Supervisor/Worker Orchestration

`SupervisorWorkerOrchestrator` adds multi-agent coordination on top of the existing `AgentLifecycleService.chatWithAgent(...)` path. That means supervisor and worker turns reuse the same conversations, persistence, policies, tools, and runtime behavior already used by the CLI, channels, HTTP API, and web client.

## Usage

```ts
import {
  AgentLifecycleService,
  SupervisorWorkerOrchestrator
} from '@nemoclaw/core';

const lifecycleService = new AgentLifecycleService({
  // normal NemoClaw lifecycle dependencies
});

const orchestrator = new SupervisorWorkerOrchestrator({
  lifecycleService
});

const result = await orchestrator.run({
  supervisor: 'lead-agent',
  workers: ['researcher', 'implementer'],
  prompt: 'Prepare a release-readiness recommendation.',
  onEvent: (event) => {
    console.log(event.type, event.metadata);
  }
});

console.log(result.finalResponse);
```

## Runtime Contract

- The supervisor receives the original user request plus prior worker outputs and is instructed to return exactly one JSON object.
- Delegation uses `{"action":"delegate","worker":"worker-name","task":"specific task","context":"optional context","reason":"optional why"}`.
- Finalization uses `{"action":"final","response":"final answer","summary":"optional summary"}`.
- If the supervisor answers in plain text instead of valid JSON, the orchestrator treats that response as the final answer instead of trying to delegate again.
- Each worker gets the original request, the assigned task, optional supervisor context, and prior worker results, then responds in plain text.

## Result Shape

`run(...)` returns:

- the orchestration id
- the supervisor conversation id
- per-worker conversation ids
- a step log of delegated tasks and worker responses
- the final supervisor response
- emitted orchestration events such as `orchestration.started`, `supervisor.responded`, `worker.completed`, and `orchestration.completed`

## Verification

The core test suite includes `packages/core/test/supervisor-worker-orchestrator.test.ts` to cover delegation, plain-text fallback, forced-final behavior, and invalid-worker rejection.
