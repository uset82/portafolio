import path from "node:path";
import { pathToFileURL } from "node:url";
import { invokeRepoAgent, type RepoAgent } from "../protocol/agent";
import { validateRepo2AgentDirectory } from "./validate";

type ScaffoldModule = {
  createScaffoldAgent: () => RepoAgent;
};

export type Repo2AgentTestResult =
  { ok: true; agentId: string; summary: string } | { ok: false; error: string };

export const testRepo2AgentDirectory = async (directory: string): Promise<Repo2AgentTestResult> => {
  const validated = await validateRepo2AgentDirectory(directory);
  if (!validated.ok) return { ok: false, error: validated.error };
  const href = pathToFileURL(path.resolve(directory, "agent/index.ts")).href;
  const loaded = (await import(href)) as ScaffoldModule;
  const agent = loaded.createScaffoldAgent();
  const capability = validated.document.capabilities[0];
  if (!capability) return { ok: false, error: "Scaffold agent.json has no capabilities." };
  const response = await invokeRepoAgent(agent, {
    requestId: "repo2agent-test",
    capability,
    input: {},
  });
  if (response.status !== "success") {
    return { ok: false, error: response.summary };
  }
  return { ok: true, agentId: response.agentId, summary: response.summary };
};
