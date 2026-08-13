import { PAPER2VIDEO_EXCLUDED } from "../domains/catalog";
import type { AgentJsonDocument } from "../manifest/schemas";
import type { RepositoryAudit } from "../repositories/schemas";
import { DOMAIN_AGENTS } from "../domains/catalog";
import {
  ELECTRONICS_TOOL_CARDS,
  STILLAS_TOOL_CARD,
  type Wave2ToolCard,
} from "../specialists/wave2";
import type { DiscoveryDocument, DiscoveryIndex } from "./schemas";

const joinText = (parts: Array<string | undefined>): string =>
  parts.filter((part): part is string => Boolean(part && part.trim())).join("\n");

const apiSchemaText = (document: AgentJsonDocument): string => {
  const inputs = document.inputs
    .map(
      (input) => `${input.name}:${input.type}${input.description ? ` ${input.description}` : ""}`,
    )
    .join("; ");
  const outputs = document.outputs
    .map(
      (output) =>
        `${output.name}:${output.type}${output.description ? ` ${output.description}` : ""}`,
    )
    .join("; ");
  return `inputs ${inputs} outputs ${outputs}`;
};

const isIndexableAudit = (audit: RepositoryAudit): boolean => {
  if (audit.visibility === "private") return false;
  if (audit.recommendedType === "disabled") return false;
  if (audit.repository === PAPER2VIDEO_EXCLUDED) return false;
  return true;
};

const compactFields = (fields: DiscoveryDocument["fields"]): DiscoveryDocument["fields"] => {
  const compact: DiscoveryDocument["fields"] = {};
  if (fields.description) compact.description = fields.description;
  if (fields.capabilities) compact.capabilities = fields.capabilities;
  if (fields.readme) compact.readme = fields.readme;
  if (fields.apiSchema) compact.apiSchema = fields.apiSchema;
  if (fields.toolDescription) compact.toolDescription = fields.toolDescription;
  return compact;
};

const documentFromParts = (
  base: Omit<DiscoveryDocument, "text" | "fields"> & { fields: DiscoveryDocument["fields"] },
): DiscoveryDocument => {
  const fields = compactFields(base.fields);
  return {
    ...base,
    fields,
    text: joinText([
      fields.description,
      fields.capabilities,
      fields.readme,
      fields.apiSchema,
      fields.toolDescription,
    ]),
  };
};

const toolCardDocument = (
  card: Wave2ToolCard,
  agentId: string,
  extras: { domainAgentId?: string } = {},
): DiscoveryDocument =>
  documentFromParts({
    id: `${agentId}:${card.capability}`,
    repository: card.repository,
    executable: card.role === "tool",
    agentId,
    capability: card.capability,
    ...(extras.domainAgentId ? { domainAgentId: extras.domainAgentId } : {}),
    fields: {
      description: card.title,
      capabilities: card.capability,
      toolDescription: joinText([card.summary, ...card.facts, ...(card.relatedRepositories ?? [])]),
    },
  });

const domainDocuments = (): DiscoveryDocument[] => {
  const documents: DiscoveryDocument[] = [];
  for (const domain of DOMAIN_AGENTS) {
    documents.push(
      documentFromParts({
        id: `domain:${domain.id}`,
        repository: `uset82/${domain.id}`,
        executable: false,
        domainAgentId: domain.id,
        fields: {
          description: `${domain.name} domain agent. Members: ${domain.members
            .map((member) => member.repository)
            .join(", ")}.`,
          capabilities: domain.members
            .map((member) => member.capability)
            .filter((capability): capability is string => Boolean(capability))
            .join(" "),
        },
      }),
    );
  }
  return documents;
};

export const buildDiscoveryIndex = (options: {
  audits?: readonly RepositoryAudit[];
  manifests?: readonly AgentJsonDocument[];
  includeHostCatalog?: boolean;
}): DiscoveryIndex => {
  const documents: DiscoveryDocument[] = [];
  const seen = new Set<string>();
  const add = (document: DiscoveryDocument) => {
    if (!document.text.trim() || seen.has(document.id)) return;
    seen.add(document.id);
    documents.push(document);
  };

  if (options.includeHostCatalog !== false) {
    for (const document of domainDocuments()) add(document);
    for (const card of ELECTRONICS_TOOL_CARDS) {
      add(toolCardDocument(card, "electronics-agent", { domainAgentId: "engineering" }));
    }
    add(toolCardDocument(STILLAS_TOOL_CARD, "stillas"));
  }

  for (const manifest of options.manifests ?? []) {
    const capability = manifest.capabilities[0];
    add(
      documentFromParts({
        id: `manifest:${manifest.id}`,
        repository: manifest.repository,
        executable: true,
        agentId: manifest.id,
        ...(capability ? { capability } : {}),
        fields: {
          description: manifest.description,
          capabilities: manifest.capabilities.join(" "),
          apiSchema: apiSchemaText(manifest),
        },
      }),
    );
  }

  for (const audit of options.audits ?? []) {
    if (!isIndexableAudit(audit)) continue;
    add(
      documentFromParts({
        id: `audit:${audit.repository}`,
        repository: audit.repository,
        executable: audit.recommendedType === "agent" || audit.recommendedType === "tool",
        fields: {
          ...(audit.description ? { description: audit.description } : {}),
          ...(audit.capabilities.length > 0 ? { capabilities: audit.capabilities.join(" ") } : {}),
          ...(audit.readme ? { readme: audit.readme } : {}),
        },
      }),
    );
  }

  return { documents };
};
