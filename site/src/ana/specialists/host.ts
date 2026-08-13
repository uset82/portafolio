import { defineRepoAgent, type RepoAgent } from "../protocol/agent";
import type { AgentHealth, AgentRequest, AgentResponse } from "../protocol/schemas";
import { toAgentManifest, type AgentJsonDocument } from "../manifest/schemas";
import { utcTimestamp } from "../registry/health";
import { REMOTE_CODE_NOT_EXECUTED } from "./labels";
import type { Wave2ToolCard } from "./wave2";

export type HostEngine = {
  health: () => Promise<AgentHealth["status"]>;
  execute: (request: AgentRequest) => Promise<unknown>;
};

const githubHref = (repository: string) => `https://github.com/${repository}`;

export const createHostEngineAgent = (
  document: AgentJsonDocument,
  options: { engine?: HostEngine } = {},
): RepoAgent => {
  const manifest = toAgentManifest(document);
  const engine = options.engine;

  return defineRepoAgent({
    manifest: () => manifest,
    health: async (): Promise<AgentHealth> => {
      const status = engine ? await engine.health() : "unavailable";
      return {
        agentId: manifest.id,
        status,
        checkedAt: utcTimestamp(),
        message:
          status === "healthy"
            ? `${manifest.name} host adapter is available`
            : REMOTE_CODE_NOT_EXECUTED,
      };
    },
    execute: async (request): Promise<AgentResponse> => {
      const started = Date.now();
      if (!engine) {
        return {
          agentId: manifest.id,
          status: "failed",
          result: null,
          summary: REMOTE_CODE_NOT_EXECUTED,
          runtimeMs: Date.now() - started,
        };
      }
      const result = await engine.execute(request);
      return {
        agentId: manifest.id,
        status: "success",
        result,
        summary: `${manifest.name} ${request.capability} via injected host engine.`,
        evidence: [
          {
            kind: "repository",
            label: manifest.repository,
            href: githubHref(manifest.repository),
          },
          { kind: "capability", label: request.capability },
        ],
        runtimeMs: Date.now() - started,
      };
    },
  });
};

export const createCatalogToolAgent = (
  document: AgentJsonDocument,
  cards: readonly Wave2ToolCard[],
): RepoAgent => {
  const manifest = toAgentManifest(document);
  const byCapability = new Map(cards.map((card) => [card.capability, card]));

  return defineRepoAgent({
    manifest: () => manifest,
    health: async (): Promise<AgentHealth> => ({
      agentId: manifest.id,
      status: "healthy",
      checkedAt: utcTimestamp(),
      message: `${manifest.name} host catalog is available. Remote repository code is not executed.`,
    }),
    execute: async (request): Promise<AgentResponse> => {
      const started = Date.now();
      const card = byCapability.get(request.capability);
      if (!card) {
        return {
          agentId: manifest.id,
          status: "failed",
          result: null,
          summary: `No host catalog card for ${request.capability}.`,
          runtimeMs: Date.now() - started,
        };
      }

      const result: Record<string, unknown> = {
        capability: card.capability,
        repository: card.repository,
        role: card.role,
        title: card.title,
        summary: card.summary,
        facts: [...card.facts],
      };
      if (card.relatedRepositories) {
        result.relatedRepositories = [...card.relatedRepositories];
      }

      return {
        agentId: manifest.id,
        status: "success",
        result,
        summary: card.summary,
        assumptions: [
          "Host catalog facts come from the public README/audit. Formulas and firmware are not executed here.",
        ],
        evidence: [
          {
            kind: "repository",
            label: card.repository,
            href: githubHref(card.repository),
          },
          { kind: "capability", label: request.capability },
        ],
        confidence: 1,
        runtimeMs: Date.now() - started,
      };
    },
  });
};
