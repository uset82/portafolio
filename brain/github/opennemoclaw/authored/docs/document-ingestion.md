<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/opennemoclaw/blob/main/docs/document-ingestion.md; checkedOn: 2026-07-31; redactions: 0 -->

# Document Ingestion And RAG

`AgentLifecycleService.ingestDocument(...)` lets you store document chunks in the same LanceDB-backed memory path already used for episodic recall. Later `chatWithAgent(...)` calls automatically retrieve relevant document chunks and inject them into the agent system prompt as `Relevant document knowledge:`.

## Ingest Inline Text

```ts
import { AgentLifecycleService } from '@nemoclaw/core';

const service = new AgentLifecycleService({
  // normal NemoClaw lifecycle dependencies
});

await service.ingestDocument('knowledge-agent', {
  title: 'Atlas Notes',
  content: `
    Project Atlas uses LanceDB for document retrieval.
    Azure OpenAI handles synthesis over recalled chunks.
  `
});
```

## Ingest A Local File

```ts
await service.ingestDocument('knowledge-agent', {
  filePath: 'C:/docs/runbook.md'
});
```

## Behavior

- Documents are chunked on the host before persistence.
- Each chunk is stored as a `document` memory record with metadata such as `documentId`, `sourceName`, `chunkIndex`, and `totalChunks`.
- Retrieval reuses the normal `MemoryStore.searchMemories(...)` path, so document recall stays inside the existing policy-aware runtime model.
- Conversational memory and document recall are rendered separately in the prompt as `Relevant memory from earlier conversations:` and `Relevant document knowledge:`.

## Current Scope

- The ingestion path supports inline text and UTF-8 local files.
- HTML files are converted to plain text with lightweight tag stripping before chunking.
- Rich binary formats such as PDF and DOCX are not handled yet in this phase.

## Verification

The core suite covers:

- `packages/core/test/document-ingestion-service.test.ts` for chunking, file ingestion, and LanceDB-backed retrieval
- `packages/core/test/agent-lifecycle-service.test.ts` for lifecycle-level ingestion plus later chat recall
