import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { assertNotProtectedSpecialist } from "./init";
import { validateRepo2AgentDirectory } from "./validate";

export type Repo2AgentRegisterResult =
  { ok: true; path: string; enabled: false; published: false } | { ok: false; error: string };

export const registerRepo2AgentDirectory = async (
  directory: string,
  options: { manifestsRoot: string },
): Promise<Repo2AgentRegisterResult> => {
  const validated = await validateRepo2AgentDirectory(directory);
  if (!validated.ok) return { ok: false, error: validated.error };
  try {
    assertNotProtectedSpecialist(validated.document.id, validated.document.repository);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Protected specialist" };
  }
  const destination = path.join(
    path.resolve(options.manifestsRoot),
    validated.document.id,
    "agent.json",
  );
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, `${JSON.stringify(validated.document, null, 2)}\n`, "utf8");
  return { ok: true, path: destination, enabled: false, published: false };
};

export const publishRepo2Agent = (): { ok: false; error: string } => ({
  ok: false,
  error: "Repo2Agent is not published. npm publish is not authorized in this phase.",
});
