import { access } from "node:fs/promises";
import path from "node:path";
import { loadAgentJsonFile } from "../manifest/loader";
import { toAgentManifest, type AgentJsonDocument } from "../manifest/schemas";
import { REPO2AGENT_SCAFFOLD_FILES } from "./templates";

export type Repo2AgentValidateResult =
  | { ok: true; document: AgentJsonDocument; missing: string[] }
  | { ok: false; error: string; missing: string[] };

const exists = async (filePath: string) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

export const validateRepo2AgentDirectory = async (
  directory: string,
): Promise<Repo2AgentValidateResult> => {
  const root = path.resolve(directory);
  const missing: string[] = [];
  for (const relative of REPO2AGENT_SCAFFOLD_FILES) {
    if (!(await exists(path.join(root, relative)))) missing.push(relative);
  }
  try {
    const document = await loadAgentJsonFile(path.join(root, "agent.json"));
    toAgentManifest(document);
    if (missing.length > 0) {
      return { ok: false, error: `Missing scaffold files: ${missing.join(", ")}`, missing };
    }
    return { ok: true, document, missing: [] };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Invalid agent.json",
      missing,
    };
  }
};
