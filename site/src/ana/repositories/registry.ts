import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyRegistryOverrides } from "./auditor";
import {
  repositoryOverridesSchema,
  repositoryRegistrySchema,
  type RepositoryAudit,
  type RepositoryOverrides,
  type RepositoryRegistry,
} from "./schemas";
export const GENERATED_REGISTRY_RELATIVE_PATH = "brain/repositories/registry.generated.json";
export const OVERRIDES_REGISTRY_RELATIVE_PATH = "brain/repositories/registry.overrides.json";
export const PRIVATE_REGISTRY_RELATIVE_PATH = "brain/repositories/registry.private.generated.json";

export const defaultBrainRepositoriesRoot = (from = fileURLToPath(import.meta.url)) => {
  const candidates = [
    path.resolve(path.dirname(from), "../../../../brain/repositories"),
    path.resolve(process.cwd(), "../brain/repositories"),
    path.resolve(process.cwd(), "brain/repositories"),
  ];
  return (
    candidates.find((candidate) => existsSync(path.join(candidate, "registry.generated.json"))) ??
    candidates[0]!
  );
};

export const parseRepositoryRegistry = (value: unknown): RepositoryRegistry =>
  repositoryRegistrySchema.parse(value);

export const parseRepositoryOverrides = (value: unknown): RepositoryOverrides =>
  repositoryOverridesSchema.parse(value);

export const serializeRepositoryRegistry = (registry: RepositoryRegistry) =>
  `${JSON.stringify(registry, null, 2)}\n`;

export async function loadRepositoryRegistry(filePath: string): Promise<RepositoryRegistry> {
  return parseRepositoryRegistry(JSON.parse(await readFile(filePath, "utf8")) as unknown);
}

export async function loadRepositoryOverrides(filePath: string): Promise<RepositoryOverrides> {
  return parseRepositoryOverrides(JSON.parse(await readFile(filePath, "utf8")) as unknown);
}

export async function loadEffectiveRepositoryAudits(options: {
  generatedPath: string;
  overridesPath: string;
}): Promise<readonly RepositoryAudit[]> {
  const [generated, overrides] = await Promise.all([
    loadRepositoryRegistry(options.generatedPath),
    loadRepositoryOverrides(options.overridesPath),
  ]);
  return applyRegistryOverrides(generated.repositories, overrides.overrides);
}

export const loadEffectiveRepositoryAuditsSync = (options: {
  generatedPath: string;
  overridesPath: string;
}): readonly RepositoryAudit[] => {
  const generated = parseRepositoryRegistry(
    JSON.parse(readFileSync(options.generatedPath, "utf8")) as unknown,
  );
  const overrides = parseRepositoryOverrides(
    JSON.parse(readFileSync(options.overridesPath, "utf8")) as unknown,
  );
  return applyRegistryOverrides(generated.repositories, overrides.overrides);
};

export const assertPublicRegistrySafety = (registry: RepositoryRegistry) => {
  if (registry.repositories.some((audit) => audit.visibility === "private")) {
    throw new Error("Public repository registry must not include private repositories");
  }
  if (registry.repositories.some((audit) => audit.enabled)) {
    throw new Error("Generated repository registry must not auto-enable repositories");
  }
};
