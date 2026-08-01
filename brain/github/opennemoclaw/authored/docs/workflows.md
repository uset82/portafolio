<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/docs/workflows.md; checkedOn: 2026-07-31; redactions: 0 -->

# Scheduled And Event-Driven Workflows

`WorkflowRuntimeService` runs scheduled and event-driven workflows on top of the existing `AgentLifecycleService.startAgent(...)` and `chatWithAgent(...)` path. Workflow runs use the same runtime, tools, persistence, memory, and policy enforcement as normal chat turns.

## Event-Driven Runs

```ts
import {
  AgentLifecycleService,
  WorkflowRuntimeService
} from '@nemoclaw/core';

const lifecycleService = new AgentLifecycleService({
  // normal NemoClaw lifecycle dependencies
});

const workflows = new WorkflowRuntimeService({
  lifecycleService
});

await workflows.triggerEventWorkflow({
  agent: 'ops-agent',
  eventName: 'github.webhook',
  source: 'github',
  prompt: 'Summarize and triage this webhook.',
  payload: {
    action: 'opened',
    severity: 'high'
  },
  externalConversationKey: 'incident:123'
});
```

## Scheduled Runs

Agents can define schedule settings in blueprint or config data:

```yaml
agent:
  schedule:
    enabled: true
    interval: 60000
    prompt: Check the queue depth and summarize the status.
```

Or with cron:

```yaml
agent:
  schedule:
    enabled: true
    cron: "*/5 * * * *"
    prompt: Produce a heartbeat summary.
```

Then register the schedules:

```ts
await workflows.startConfiguredSchedules();
```

## Behavior

- Scheduled workflows support either `interval` or 5-field cron expressions.
- Each workflow run is persisted as a normal conversation turn with workflow metadata in the conversation record.
- Event workflows can reuse a conversation thread through `externalConversationKey`.
- Scheduled runs automatically skip overlapping executions for the same agent instead of piling up concurrent runs.

## Verification

The core suite covers:

- `packages/core/test/workflow-runtime-service.test.ts` for event-driven, interval, and cron-triggered runs
- `packages/core/test/local-blueprint-resolver.test.ts` for schedule propagation from blueprints into resolved agent configs
