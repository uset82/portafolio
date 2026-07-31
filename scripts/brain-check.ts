import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rawSiteContent } from "../site/src/content/records";
import {
  brainPrivateSourcesSchema,
  brainProjectSchema,
  type BrainProject,
} from "./brain-project-schema";

const APPROVED_PUBLIC_RIGHTS = new Set([
  "owned",
  "permission-granted",
  "permissive-license",
  "attribution-required",
  "not-applicable",
]);

const PRIVATE_REFERENCE_PATTERN =
  /(?:^|[\\/])brain-private(?:[\\/]|$)|\bbrain-private\b/i;

export type BrainCheckIssue = {
  file: string;
  message: string;
};

export type BrainCheckResult = {
  projectCount: number;
  projects: readonly BrainProject[];
};

export class BrainCheckError extends Error {
  readonly issues: readonly BrainCheckIssue[];

  constructor(issues: readonly BrainCheckIssue[]) {
    super(
      `Brain check failed with ${issues.length} issue${issues.length === 1 ? "" : "s"}:\n${issues
        .map((issue) => `- ${issue.file}: ${issue.message}`)
        .join("\n")}`,
    );
    this.name = "BrainCheckError";
    this.issues = issues;
  }
}

const toDisplayPath = (brainRoot: string, filePath: string) =>
  path.relative(brainRoot, filePath).replaceAll(path.sep, "/") || ".";

const readText = async (filePath: string) => readFile(filePath, "utf8");

const readJson = async (filePath: string) =>
  JSON.parse(await readText(filePath)) as unknown;

async function collectFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectFiles(entryPath);
      return entry.isFile() ? [entryPath] : [];
    }),
  );
  return files.flat().sort((left, right) => left.localeCompare(right));
}

async function directoryExists(directory: string): Promise<boolean> {
  try {
    await readdir(directory);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

const addPrivateReferenceIssue = (
  issues: BrainCheckIssue[],
  brainRoot: string,
  filePath: string,
  text: string,
) => {
  if (!PRIVATE_REFERENCE_PATTERN.test(text)) return;
  issues.push({
    file: toDisplayPath(brainRoot, filePath),
    message: "public project content may not reference brain-private",
  });
};

const formatZodPath = (segments: readonly PropertyKey[]) =>
  segments.length === 0 ? "record" : segments.map(String).join(".");

async function checkProject(
  brainRoot: string,
  projectDirectory: string,
  publicSourceIds: ReadonlySet<string>,
): Promise<{ project?: BrainProject; issues: BrainCheckIssue[] }> {
  const issues: BrainCheckIssue[] = [];
  const projectFile = path.join(projectDirectory, "project.json");
  const projectDisplayPath = toDisplayPath(brainRoot, projectFile);
  let projectText: string;
  let rawProject: unknown;

  try {
    projectText = await readText(projectFile);
    rawProject = JSON.parse(projectText) as unknown;
  } catch (error) {
    issues.push({
      file: projectDisplayPath,
      message:
        error instanceof SyntaxError
          ? `invalid JSON: ${error.message}`
          : "project.json is required",
    });
    return { issues };
  }

  addPrivateReferenceIssue(issues, brainRoot, projectFile, projectText);

  const parsedProject = brainProjectSchema.safeParse(rawProject);
  if (!parsedProject.success) {
    parsedProject.error.issues.forEach((issue) => {
      issues.push({
        file: projectDisplayPath,
        message: `${formatZodPath(issue.path)}: ${issue.message}`,
      });
    });
    return { issues };
  }

  const project = parsedProject.data;
  const directorySlug = path.basename(projectDirectory);
  if (project.slug !== directorySlug) {
    issues.push({
      file: projectDisplayPath,
      message: `slug must match directory name ${directorySlug}`,
    });
  }

  if (project.public) {
    if (!APPROVED_PUBLIC_RIGHTS.has(project.rights)) {
      issues.push({
        file: projectDisplayPath,
        message: `public projects require approved rights; received ${project.rights}`,
      });
    }

    if (project.sourceIds.length === 0) {
      issues.push({
        file: projectDisplayPath,
        message: "public projects require at least one sourceId",
      });
    }

    project.sourceIds.forEach((sourceId) => {
      if (!publicSourceIds.has(sourceId)) {
        issues.push({
          file: projectDisplayPath,
          message: `sourceIds.${sourceId}: source is missing or is not public in site/src/content/records.ts`,
        });
      }
    });
  }

  const notesFile = path.join(projectDirectory, "NOTES.md");
  let notesText: string | undefined;
  try {
    notesText = await readText(notesFile);
    addPrivateReferenceIssue(issues, brainRoot, notesFile, notesText);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const knowledgeDirectory = path.join(projectDirectory, "knowledge");
  const knowledgeFiles = (await directoryExists(knowledgeDirectory))
    ? (await collectFiles(knowledgeDirectory)).filter(
        (file) => path.basename(file) !== ".gitkeep",
      )
    : [];

  await Promise.all(
    knowledgeFiles.map(async (file) => {
      addPrivateReferenceIssue(issues, brainRoot, file, await readText(file));
    }),
  );

  if (project.publication === "ready") {
    if (!notesText?.trim()) {
      issues.push({
        file: toDisplayPath(brainRoot, notesFile),
        message: 'publication "ready" requires a non-empty NOTES.md',
      });
    }
    if (knowledgeFiles.length === 0) {
      issues.push({
        file: toDisplayPath(brainRoot, knowledgeDirectory),
        message: 'publication "ready" requires at least one knowledge file',
      });
    }
  }

  const sourcesFile = path.join(projectDirectory, "sources.json");
  try {
    const parsedSources = brainPrivateSourcesSchema.safeParse(
      await readJson(sourcesFile),
    );
    if (!parsedSources.success) {
      parsedSources.error.issues.forEach((issue) => {
        issues.push({
          file: toDisplayPath(brainRoot, sourcesFile),
          message: `${formatZodPath(issue.path)}: ${issue.message}`,
        });
      });
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      issues.push({
        file: toDisplayPath(brainRoot, sourcesFile),
        message:
          error instanceof SyntaxError
            ? `invalid JSON: ${error.message}`
            : String(error),
      });
    }
  }

  return { project, issues };
}

export async function checkBrain(
  brainRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "brain",
  ),
): Promise<BrainCheckResult> {
  const projectsRoot = path.join(brainRoot, "projects");
  const projectEntries = await readdir(projectsRoot, { withFileTypes: true });
  const projectDirectories = projectEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(projectsRoot, entry.name))
    .sort((left, right) => left.localeCompare(right));
  const publicSourceIds = new Set(
    rawSiteContent.sources
      .filter((source) => source.public)
      .map((source) => source.id),
  );
  const checkedProjects = await Promise.all(
    projectDirectories.map((directory) =>
      checkProject(brainRoot, directory, publicSourceIds),
    ),
  );
  const issues = checkedProjects.flatMap((checked) => checked.issues);

  if (issues.length > 0) throw new BrainCheckError(issues);

  const projects = checkedProjects.flatMap((checked) =>
    checked.project ? [checked.project] : [],
  );
  return { projectCount: projects.length, projects };
}

const parseBrainRootArgument = (arguments_: readonly string[]) => {
  if (arguments_.length === 0) return undefined;
  if (arguments_.length === 2 && arguments_[0] === "--root" && arguments_[1]) {
    return path.resolve(arguments_[1]);
  }
  throw new Error("Usage: brain-check.ts [--root <brain-directory>]");
};

const isDirectRun =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]).toLowerCase() ===
    fileURLToPath(import.meta.url).toLowerCase();

if (isDirectRun) {
  checkBrain(parseBrainRootArgument(process.argv.slice(2)))
    .then((result) => {
      console.log(
        `Brain valid: ${result.projectCount} project${result.projectCount === 1 ? "" : "s"}.`,
      );
    })
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
