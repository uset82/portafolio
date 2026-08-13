import { readFile } from "node:fs/promises";
import {
  AGENT_JSON_SCHEMA_V1,
  agentJsonV1Schema,
  supportedAgentJsonSchemas,
  toAgentManifest,
  type AgentJsonDocument,
} from "./schemas";
import type { AgentManifest } from "../protocol/schemas";

export class AgentJsonError extends Error {
  readonly code: "invalid_json" | "invalid_document" | "unsupported_schema" | "file_not_found";

  constructor(code: AgentJsonError["code"], message: string) {
    super(message);
    this.name = "AgentJsonError";
    this.code = code;
  }
}

const formatZodError = (error: { issues: readonly { path: PropertyKey[]; message: string }[] }) =>
  error.issues
    .map(
      (issue) =>
        `${issue.path.length === 0 ? "record" : issue.path.map(String).join(".")}: ${issue.message}`,
    )
    .join("; ");

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseAgentJsonV1 = (value: unknown): AgentJsonDocument => {
  const parsed = agentJsonV1Schema.safeParse(value);
  if (!parsed.success) {
    throw new AgentJsonError("invalid_document", formatZodError(parsed.error));
  }
  return parsed.data;
};

const agentJsonParsers: Record<string, (value: unknown) => AgentJsonDocument> = {
  [AGENT_JSON_SCHEMA_V1]: parseAgentJsonV1,
};

export const isSupportedAgentJsonSchema = (schema: string): boolean => schema in agentJsonParsers;

export const parseAgentJsonDocument = (value: unknown): AgentJsonDocument => {
  if (!isRecord(value)) {
    throw new AgentJsonError("invalid_document", "agent.json must be an object");
  }

  const schema = value.schema;
  if (typeof schema !== "string" || schema.length === 0) {
    throw new AgentJsonError("invalid_document", "agent.json requires a schema field");
  }

  const parser = agentJsonParsers[schema];
  if (!parser) {
    throw new AgentJsonError(
      "unsupported_schema",
      `Unsupported agent.json schema ${schema}. Supported: ${supportedAgentJsonSchemas.join(", ")}`,
    );
  }

  return parser(value);
};

export const parseAgentJsonText = (text: string): AgentJsonDocument => {
  let value: unknown;
  try {
    value = JSON.parse(text) as unknown;
  } catch {
    throw new AgentJsonError("invalid_json", "agent.json is not valid JSON");
  }
  return parseAgentJsonDocument(value);
};

export async function loadAgentJsonFile(filePath: string): Promise<AgentJsonDocument> {
  let text: string;
  try {
    text = await readFile(filePath, "utf8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new AgentJsonError("file_not_found", `agent.json not found at ${filePath}`);
    }
    throw error;
  }
  return parseAgentJsonText(text);
}

export async function loadAgentManifestFromFile(filePath: string): Promise<AgentManifest> {
  return toAgentManifest(await loadAgentJsonFile(filePath));
}
