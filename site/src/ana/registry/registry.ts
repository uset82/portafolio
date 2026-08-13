import type { AgentJsonDocument } from "../manifest/schemas";
import type { RepositoryAudit, RepositoryDomain } from "../repositories/schemas";
import { AgentRegistryError, selectRuntimeAgentRecords } from "./discovery";
import type { AgentHealthProbe } from "./health";
import {
  agentRegistryRecordSchema,
  type AgentCostEstimate,
  type AgentRegistryRecord,
  type AgentRegistrySkip,
} from "./schemas";

export class AgentRegistry {
  readonly records: readonly AgentRegistryRecord[];

  constructor(records: readonly AgentRegistryRecord[]) {
    const parsed = records.map((record) => {
      const result = agentRegistryRecordSchema.safeParse(record);
      if (!result.success) {
        throw new AgentRegistryError(
          "invalid_record",
          result.error.issues.map((issue) => issue.message).join("; "),
        );
      }
      return result.data;
    });

    const ids = new Set<string>();
    const repositories = new Set<string>();
    for (const record of parsed) {
      if (ids.has(record.id)) {
        throw new AgentRegistryError("duplicate_id", `Duplicate agent id ${record.id}`);
      }
      if (repositories.has(record.repository)) {
        throw new AgentRegistryError(
          "duplicate_repository",
          `Duplicate agent repository ${record.repository}`,
        );
      }
      ids.add(record.id);
      repositories.add(record.repository);
    }

    this.records = Object.freeze(
      parsed.slice().sort((left, right) => left.id.localeCompare(right.id)),
    );
  }

  list(): readonly AgentRegistryRecord[] {
    return this.records;
  }

  getById(id: string): AgentRegistryRecord | undefined {
    return this.records.find((record) => record.id === id);
  }

  findByCapability(capability: string): readonly AgentRegistryRecord[] {
    return this.records.filter((record) => record.capabilities.includes(capability));
  }

  findByDomain(domain: RepositoryDomain): readonly AgentRegistryRecord[] {
    return this.records.filter((record) => record.domains.includes(domain));
  }
}

export async function buildAgentRegistry(options: {
  documents: readonly AgentJsonDocument[];
  audits: readonly RepositoryAudit[];
  healthProbe?: AgentHealthProbe;
  costEstimate?: AgentCostEstimate;
}): Promise<{ registry: AgentRegistry; skipped: AgentRegistrySkip[] }> {
  const { records, skipped } = await selectRuntimeAgentRecords(options);
  return { registry: new AgentRegistry(records), skipped };
}
