import { AGENT_JSON_SCHEMA_V1 } from "../manifest/schemas";
import type { AgentJsonType } from "../manifest/schemas";
import type { RepositoryDomain } from "../repositories/schemas";

export const PROTECTED_AGENT_IDS = ["astraea", "pinaculo", "strudel"] as const;
export const PROTECTED_REPOSITORIES = [
  "uset82/ASTROEA",
  "uset82/pinaculo",
  "uset82/StrudelAI",
] as const;

export const REPO2AGENT_SCAFFOLD_FILES = [
  "agent.json",
  "AGENTS.md",
  "agent/index.ts",
  "agent/schemas.ts",
  "agent/tools.ts",
  "tests/agent.test.ts",
] as const;

export type Repo2AgentInitOptions = {
  directory: string;
  id: string;
  name: string;
  repository: string;
  domain: RepositoryDomain;
  capability: string;
  type: AgentJsonType;
  force?: boolean;
};

const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

export const scaffoldAgentJson = (options: Repo2AgentInitOptions): string =>
  json({
    schema: AGENT_JSON_SCHEMA_V1,
    type: options.type,
    id: options.id,
    name: options.name,
    repository: options.repository,
    version: "0.0.0",
    description: `${options.name} scaffold. Remote repository code is not executed. Not enabled.`,
    domains: [options.domain],
    capabilities: [options.capability],
    inputs: [{ name: "prompt", type: "string", required: false }],
    outputs: [{ name: "result", type: "object" }],
    permissions: ["read", "compute"],
    sensitivity: "public",
    execution: "local-function",
    timeoutMs: 5_000,
  });

export const scaffoldAgentsMd = (options: Repo2AgentInitOptions): string =>
  `# ${options.name}

Repo2Agent specialist scaffold for \`${options.repository}\`.

- Contract: \`agent.json\` (\`repo2agent/v1\`) plus \`manifest()\`, \`health()\`, and \`execute()\`.
- Default permissions are read + compute. Do not add write, network, or external-action here.
- Do not execute unreviewed repository source from this stub.
- Copying this file into the portfolio does not enable the specialist. Runtime lookup still
  requires a human-approved \`enabled: true\` audit.

Commands:

\`\`\`bash
npx repo2agent validate
npx repo2agent test
npx repo2agent register
\`\`\`

\`register\` copies \`agent.json\` into a manifests root. It never publishes a package and never
sets \`enabled: true\`.
`;

export const scaffoldAgentIndex = (options: Repo2AgentInitOptions): string =>
  `import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const document = JSON.parse(
  readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "agent.json"), "utf8"),
) as {
  id: string;
  name: string;
  repository: string;
  version: string;
  description: string;
  domains: string[];
  capabilities: string[];
  inputs: { name: string; type: string; required: boolean }[];
  outputs: { name: string; type: string }[];
  permissions: string[];
  sensitivity: string;
  execution: string;
  timeoutMs: number;
};

export const createScaffoldAgent = () => ({
  manifest: () => ({
    id: document.id,
    name: document.name,
    repository: document.repository,
    version: document.version,
    description: document.description,
    domains: document.domains,
    capabilities: document.capabilities,
    inputs: document.inputs,
    outputs: document.outputs,
    permissions: document.permissions,
    sensitivity: document.sensitivity,
    execution: document.execution,
    timeoutMs: document.timeoutMs,
  }),
  health: async () => ({
    agentId: document.id,
    status: "healthy",
    checkedAt: new Date().toISOString(),
    message: "${options.name} scaffold is local. Remote code is not executed.",
  }),
  execute: async (request: { capability: string; input: Record<string, unknown> }) => ({
    agentId: document.id,
    status: "success",
    result: { ok: true, capability: request.capability },
    summary: "${options.name} scaffold does not execute remote repository code.",
    runtimeMs: 1,
  }),
});
`;

export const scaffoldAgentSchemas = (options: Repo2AgentInitOptions): string =>
  `export const agentId = ${JSON.stringify(options.id)};
export const capability = ${JSON.stringify(options.capability)};
export const domain = ${JSON.stringify(options.domain)};
`;

export const scaffoldAgentTools = (): string =>
  `export const tools: readonly { name: string; capability: string }[] = [];
`;

export const scaffoldAgentTest = (options: Repo2AgentInitOptions): string =>
  `import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createScaffoldAgent } from "../agent/index.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("agent.json is a repo2agent/v1 scaffold", async () => {
  const document = JSON.parse(await readFile(path.join(root, "agent.json"), "utf8")) as {
    schema: string;
    id: string;
    capabilities: string[];
  };
  assert.equal(document.schema, "repo2agent/v1");
  assert.equal(document.id, ${JSON.stringify(options.id)});
  assert.deepEqual(document.capabilities, [${JSON.stringify(options.capability)}]);
});

test("scaffold agent returns its own id and does not run remote code", async () => {
  const agent = createScaffoldAgent();
  const response = await agent.execute({
    capability: ${JSON.stringify(options.capability)},
    input: {},
  });
  assert.equal(response.agentId, ${JSON.stringify(options.id)});
  assert.equal(response.status, "success");
  assert.match(response.summary, /does not execute remote repository code/);
});
`;
