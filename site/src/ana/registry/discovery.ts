import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { loadAgentJsonFile } from "../manifest/loader";
import { toAgentManifest, type AgentJsonDocument } from "../manifest/schemas";
import type { RepositoryAudit } from "../repositories/schemas";
import { availabilityFromHealth, noAdapterHealthProbe, type AgentHealthProbe } from "./health";
import {
  agentRegistryRecordSchema,
  type AgentCostEstimate,
  type AgentRegistryRecord,
  type AgentRegistrySkip,
  type AgentRegistrySkipReason,
} from "./schemas";

export class AgentRegistryError extends Error {
  readonly code: "duplicate_id" | "duplicate_repository" | "private_enabled" | "invalid_record";

  constructor(code: AgentRegistryError["code"], message: string) {
    super(message);
    this.name = "AgentRegistryError";
    this.code = code;
  }
}

const skippedDirectoryNames = new Set([".git", ".next", "node_modules"]);

const skip = (
  repository: string,
  reason: AgentRegistrySkipReason,
  id?: string,
): AgentRegistrySkip => (id ? { repository, id, reason } : { repository, reason });

export const DEFAULT_AGENT_MANIFESTS_RELATIVE_PATH = "brain/repositories/manifests";

export async function discoverAgentJsonFiles(rootDirectory: string): Promise<string[]> {
  try {
    await stat(rootDirectory);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }

  const collect = async (directory: string): Promise<string[]> => {
    const entries = await readdir(directory, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      if (skippedDirectoryNames.has(entry.name)) continue;
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await collect(entryPath)));
        continue;
      }
      if (entry.isFile() && entry.name === "agent.json") {
        files.push(entryPath);
      }
    }
    return files;
  };

  return collect(rootDirectory);
}

export async function loadDiscoveredDocuments(
  rootDirectory: string,
): Promise<readonly AgentJsonDocument[]> {
  const files = await discoverAgentJsonFiles(rootDirectory);
  return Promise.all(files.map((filePath) => loadAgentJsonFile(filePath)));
}

export const admitAgentDocument = (
  document: AgentJsonDocument,
  audit: RepositoryAudit | undefined,
): AgentRegistrySkipReason | "accept" => {
  if (!audit) return "unknown-repository";
  if (audit.visibility === "private") {
    if (audit.enabled) {
      throw new AgentRegistryError(
        "private_enabled",
        `Private repository ${audit.repository} cannot be enabled for runtime lookup`,
      );
    }
    return "private";
  }
  if (audit.recommendedType === "disabled") return "disabled-type";
  if (audit.recommendedType === "knowledge") return "knowledge-type";
  if (!audit.enabled) return "not-enabled";
  if (audit.recommendedType !== document.type) return "type-mismatch";
  return "accept";
};

export async function selectRuntimeAgentRecords(options: {
  documents: readonly AgentJsonDocument[];
  audits: readonly RepositoryAudit[];
  healthProbe?: AgentHealthProbe;
  costEstimate?: AgentCostEstimate;
}): Promise<{ records: AgentRegistryRecord[]; skipped: AgentRegistrySkip[] }> {
  const healthProbe = options.healthProbe ?? noAdapterHealthProbe;
  const costEstimate = options.costEstimate ?? "unknown";
  const auditsByRepository = new Map(options.audits.map((audit) => [audit.repository, audit]));
  const seenIds = new Set<string>();
  const seenRepositories = new Set<string>();
  const records: AgentRegistryRecord[] = [];
  const skipped: AgentRegistrySkip[] = [];

  for (const document of options.documents) {
    if (seenIds.has(document.id)) {
      throw new AgentRegistryError("duplicate_id", `Duplicate agent id ${document.id}`);
    }
    if (seenRepositories.has(document.repository)) {
      throw new AgentRegistryError(
        "duplicate_repository",
        `Duplicate agent repository ${document.repository}`,
      );
    }
    seenIds.add(document.id);
    seenRepositories.add(document.repository);

    const audit = auditsByRepository.get(document.repository);
    const decision = admitAgentDocument(document, audit);
    if (decision !== "accept") {
      skipped.push(skip(document.repository, decision, document.id));
      continue;
    }

    const manifest = toAgentManifest(document);
    const health = await healthProbe({ id: document.id, repository: document.repository });
    const parsed = agentRegistryRecordSchema.safeParse({
      id: document.id,
      type: document.type,
      repository: document.repository,
      version: document.version,
      availability: availabilityFromHealth(health),
      health,
      permissions: manifest.permissions,
      privacyLevel: manifest.sensitivity,
      latencyEstimateMs: manifest.timeoutMs,
      costEstimate,
      domains: manifest.domains,
      capabilities: manifest.capabilities,
      manifest,
    });
    if (!parsed.success) {
      throw new AgentRegistryError(
        "invalid_record",
        parsed.error.issues.map((issue) => issue.message).join("; "),
      );
    }
    records.push(parsed.data);
  }

  return { records, skipped };
}
