import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseAgentJsonDocument } from "../manifest/loader";
import {
  PROTECTED_AGENT_IDS,
  PROTECTED_REPOSITORIES,
  REPO2AGENT_SCAFFOLD_FILES,
  scaffoldAgentIndex,
  scaffoldAgentJson,
  scaffoldAgentSchemas,
  scaffoldAgentTest,
  scaffoldAgentTools,
  scaffoldAgentsMd,
  type Repo2AgentInitOptions,
} from "./templates";

const exists = async (filePath: string) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

export const assertNotProtectedSpecialist = (id: string, repository: string) => {
  if ((PROTECTED_AGENT_IDS as readonly string[]).includes(id)) {
    throw new Error(`Refusing to scaffold or register protected specialist ${id}.`);
  }
  if ((PROTECTED_REPOSITORIES as readonly string[]).includes(repository)) {
    throw new Error(`Refusing to modify protected remote ${repository}.`);
  }
};

export const initRepo2Agent = async (
  options: Repo2AgentInitOptions,
): Promise<{ directory: string; files: string[] }> => {
  assertNotProtectedSpecialist(options.id, options.repository);
  parseAgentJsonDocument(JSON.parse(scaffoldAgentJson(options)) as unknown);
  const directory = path.resolve(options.directory);
  if (!options.force && (await exists(path.join(directory, "agent.json")))) {
    throw new Error(`agent.json already exists in ${directory}`);
  }
  await mkdir(path.join(directory, "agent"), { recursive: true });
  await mkdir(path.join(directory, "tests"), { recursive: true });
  const files: Record<(typeof REPO2AGENT_SCAFFOLD_FILES)[number], string> = {
    "agent.json": scaffoldAgentJson(options),
    "AGENTS.md": scaffoldAgentsMd(options),
    "agent/index.ts": scaffoldAgentIndex(options),
    "agent/schemas.ts": scaffoldAgentSchemas(options),
    "agent/tools.ts": scaffoldAgentTools(),
    "tests/agent.test.ts": scaffoldAgentTest(options),
  };
  for (const relative of REPO2AGENT_SCAFFOLD_FILES) {
    await writeFile(path.join(directory, relative), files[relative], "utf8");
  }
  return { directory, files: [...REPO2AGENT_SCAFFOLD_FILES] };
};
