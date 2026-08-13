import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GhCliGitHubClient } from "./brain-sync-github";
import { auditRepositories } from "../site/src/ana/repositories/auditor";
import {
  collectRepositoryInspection,
  GITHUB_OWNER,
  listOwnedRepositories,
  mapWithConcurrency,
  type AnaGitHubClient,
} from "../site/src/ana/repositories/github";
import {
  assertPublicRegistrySafety,
  parseRepositoryRegistry,
  serializeRepositoryRegistry,
} from "../site/src/ana/repositories/registry";
import type { RepositoryRegistry } from "../site/src/ana/repositories/schemas";

const GENERATED_BY = "ana:audit-repositories" as const;

export type AnaRepositoryAuditOptions = {
  client?: AnaGitHubClient;
  outputRoot?: string;
  owner?: string;
  generatedAt?: string;
  concurrency?: number;
};

export type AnaRepositoryAuditResult = {
  publicCount: number;
  privateCount: number;
  writtenPublic: boolean;
  writtenPrivate: boolean;
};

const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const assertSafeOutputRoot = (outputRoot: string) => {
  const resolved = path.resolve(outputRoot);
  if (
    path.basename(resolved).toLowerCase() !== "repositories" ||
    path.basename(path.dirname(resolved)).toLowerCase() !== "brain"
  ) {
    throw new Error(
      "ANA registry output must be a brain/repositories directory",
    );
  }
};

const jsonText = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

export async function auditOwnedRepositories(
  options: AnaRepositoryAuditOptions = {},
): Promise<AnaRepositoryAuditResult> {
  const owner = options.owner ?? GITHUB_OWNER;
  const generatedAt =
    options.generatedAt ?? new Date().toISOString().slice(0, 10);
  const concurrency = options.concurrency ?? 4;
  const outputRoot = path.resolve(
    options.outputRoot ??
      path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "..",
        "brain",
        "repositories",
      ),
  );
  if (!isIsoDate(generatedAt))
    throw new Error(`Invalid generatedAt date: ${generatedAt}`);
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 8) {
    throw new Error("Audit concurrency must be an integer from 1 to 8");
  }
  assertSafeOutputRoot(outputRoot);

  const client = options.client ?? new GhCliGitHubClient();
  const discovered = await listOwnedRepositories(client, owner);
  const inspections = await mapWithConcurrency(
    discovered,
    concurrency,
    (repository) => collectRepositoryInspection(client, repository),
  );
  const audits = auditRepositories(inspections);
  const publicAudits = audits.filter((audit) => audit.visibility === "public");
  const privateAudits = audits.filter(
    (audit) => audit.visibility === "private",
  );

  const publicRegistry = parseRepositoryRegistry({
    schemaVersion: 1,
    generatedBy: GENERATED_BY,
    generatedAt,
    owner,
    source: "github-api",
    repositoryCount: publicAudits.length,
    repositories: publicAudits,
  } satisfies RepositoryRegistry);
  assertPublicRegistrySafety(publicRegistry);

  await mkdir(outputRoot, { recursive: true });
  await writeFile(
    path.join(outputRoot, "registry.generated.json"),
    serializeRepositoryRegistry(publicRegistry),
    "utf8",
  );

  let writtenPrivate = false;
  if (privateAudits.length > 0) {
    const privateRegistry = parseRepositoryRegistry({
      schemaVersion: 1,
      generatedBy: GENERATED_BY,
      generatedAt,
      owner,
      source: "github-api",
      repositoryCount: privateAudits.length,
      repositories: privateAudits,
    } satisfies RepositoryRegistry);
    if (
      privateRegistry.repositories.some(
        (audit) => audit.contentsInspected || audit.readme,
      )
    ) {
      throw new Error(
        "Private repository audits must not include inspected contents",
      );
    }
    await writeFile(
      path.join(outputRoot, "registry.private.generated.json"),
      jsonText(privateRegistry),
      "utf8",
    );
    writtenPrivate = true;
  }

  return {
    publicCount: publicAudits.length,
    privateCount: privateAudits.length,
    writtenPublic: true,
    writtenPrivate,
  };
}

const parseGeneratedAt = (arguments_: readonly string[]) => {
  if (arguments_.length === 0) return undefined;
  if (
    arguments_.length === 2 &&
    arguments_[0] === "--checked-on" &&
    arguments_[1]
  ) {
    return arguments_[1];
  }
  throw new Error("Usage: ana-audit-repositories.ts [--checked-on YYYY-MM-DD]");
};

const isDirectRun =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]).toLowerCase() ===
    fileURLToPath(import.meta.url).toLowerCase();

if (isDirectRun) {
  const generatedAt = parseGeneratedAt(process.argv.slice(2));
  auditOwnedRepositories(generatedAt ? { generatedAt } : {})
    .then((result) => {
      console.log(
        `ANA repository audit wrote ${result.publicCount} public repositories.` +
          (result.privateCount > 0
            ? ` ${result.privateCount} private repositories were counted without content inspection.`
            : ""),
      );
    })
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
