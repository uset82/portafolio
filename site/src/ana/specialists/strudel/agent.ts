import { defineRepoAgent, type RepoAgent } from "../../protocol/agent";
import type { AgentHealth, AgentResponse } from "../../protocol/schemas";
import { toAgentManifest } from "../../manifest/schemas";
import { utcTimestamp } from "../../registry/health";
import { createMusicEngineFromEnv, type MusicEngine } from "./engine";
import { strudelAgentJson } from "./manifest";

const manifest = toAgentManifest(strudelAgentJson);

const failed = (summary: string, runtimeMs: number): AgentResponse => ({
  agentId: manifest.id,
  status: "failed",
  result: null,
  summary,
  runtimeMs,
});

export const createStrudelAgent = (options: { musicEngine?: MusicEngine } = {}): RepoAgent => {
  const musicEngine = options.musicEngine ?? createMusicEngineFromEnv();

  return defineRepoAgent({
    manifest: () => manifest,
    health: async (): Promise<AgentHealth> => {
      const status = await musicEngine.health();
      return {
        agentId: manifest.id,
        status,
        checkedAt: utcTimestamp(),
        message:
          status === "healthy"
            ? "StrudelAI music engine is reachable"
            : "StrudelAI music engine is not configured or unreachable",
      };
    },
    execute: async (request) => {
      const started = Date.now();
      const prompt = request.input.prompt;
      if (typeof prompt !== "string" || prompt.trim().length === 0) {
        return failed("pattern-generate needs a prompt string.", Date.now() - started);
      }
      const bpm = typeof request.input.bpm === "number" ? request.input.bpm : undefined;
      try {
        const tracks = await musicEngine.generate({
          prompt,
          ...(bpm === undefined ? {} : { bpm }),
        });
        return {
          agentId: manifest.id,
          status: "success",
          result: { tracks },
          summary:
            "Generated track-separated Strudel patterns via the StrudelAI music-agent pipeline.",
          evidence: [
            {
              kind: "repository",
              label: manifest.repository,
              href: "https://github.com/uset82/StrudelAI",
            },
            { kind: "capability", label: request.capability },
          ],
          runtimeMs: Date.now() - started,
        };
      } catch (error) {
        return failed(
          error instanceof Error ? error.message : "StrudelAI music engine failed",
          Date.now() - started,
        );
      }
    },
  });
};
