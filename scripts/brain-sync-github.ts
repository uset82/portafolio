import { execFile } from "node:child_process";
import {
  mkdir,
  readFile,
  readdir,
  rmdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

export const GITHUB_OWNER = "uset82";
export const MINIMUM_REPOSITORY_SIZE_KB = 50;
export const EXPECTED_REPOSITORY_COUNT = 42;

const GENERATED_BY = "brain:sync-github";
const MAX_AUTHORED_DOCUMENT_BYTES = 1_000_000;
const GH_API_VERSION = "2022-11-28";
const execFileAsync = promisify(execFile);

export type GitHubRepository = {
  owner: { login: string };
  name: string;
  full_name: string;
  fork: boolean;
  private: boolean;
  visibility?: string;
  size: number;
  description: string | null;
  topics?: readonly string[];
  license: { spdx_id: string | null } | null;
  homepage: string | null;
  default_branch: string;
  pushed_at: string | null;
  html_url: string;
};

type GitHubTreeEntry = {
  path: string;
  type: "blob" | "tree" | "commit";
  sha: string;
  size?: number;
};

type GitHubTree = {
  tree: readonly GitHubTreeEntry[];
  truncated: boolean;
};

type GitHubEncodedContent = {
  content: string;
  encoding: string;
  path?: string;
};

export interface GitHubClient {
  get<T>(endpoint: string): Promise<T>;
}

export class GitHubApiError extends Error {
  readonly endpoint: string;
  readonly status: number | undefined;

  constructor(endpoint: string, message: string, status?: number) {
    super(message);
    this.name = "GitHubApiError";
    this.endpoint = endpoint;
    this.status = status;
  }
}

export class GhCliGitHubClient implements GitHubClient {
  async get<T>(endpoint: string): Promise<T> {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const { stdout } = await execFileAsync(
          "gh",
          [
            "api",
            "-H",
            "Accept: application/vnd.github+json",
            "-H",
            `X-GitHub-Api-Version: ${GH_API_VERSION}`,
            endpoint,
          ],
          { encoding: "utf8", maxBuffer: 50 * 1024 * 1024, timeout: 30_000 },
        );
        return JSON.parse(stdout) as T;
      } catch (error) {
        const failure = error as Error & { stderr?: string };
        const details = failure.stderr?.trim() || failure.message;
        const statusMatch = details.match(/HTTP (\d{3})/i);
        const status = statusMatch ? Number(statusMatch[1]) : undefined;
        const retryable =
          status === undefined || status === 429 || status >= 500;
        if (retryable && attempt < 3) {
          await delay(attempt * 500);
          continue;
        }
        throw new GitHubApiError(
          endpoint,
          `GitHub API request failed for ${endpoint}: ${details}`,
          status,
        );
      }
    }
    throw new Error(`GitHub API retry loop exhausted for ${endpoint}`);
  }
}

export type GitHubBrainSyncOptions = {
  client?: GitHubClient;
  outputRoot?: string;
  owner?: string;
  checkedOn?: string;
  expectedRepositoryCount?: number;
  concurrency?: number;
};

export type GitHubBrainSyncResult = {
  repositoryCount: number;
  authoredDocumentCount: number;
  writtenFileCount: number;
  removedFileCount: number;
  unchanged: boolean;
};

type GeneratedRepository = {
  repository: GitHubRepository;
  files: ReadonlyMap<string, string>;
  checkedOn: string;
  authoredDocumentCount: number;
};

const normalizeLineEndings = (value: string) => value.replaceAll("\r\n", "\n");

const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const assertSafeSegment = (segment: string, label: string) => {
  if (
    !segment ||
    segment === "." ||
    segment === ".." ||
    segment.toLowerCase() === ".git" ||
    /[<>:"/\\|?*\u0000-\u001f]/.test(segment) ||
    /[. ]$/.test(segment)
  ) {
    throw new Error(`Unsafe ${label} path segment: ${JSON.stringify(segment)}`);
  }
};

const assertSafeRepositoryName = (name: string) => {
  assertSafeSegment(name, "repository");
  if (!/^[A-Za-z0-9._-]+$/.test(name)) {
    throw new Error(
      `Unsafe repository directory name: ${JSON.stringify(name)}`,
    );
  }
};

const normalizeSourcePath = (sourcePath: string) => {
  const normalized = sourcePath.replaceAll("\\", "/");
  if (normalized.startsWith("/") || normalized.includes("//")) {
    throw new Error(`Unsafe GitHub source path: ${JSON.stringify(sourcePath)}`);
  }
  normalized
    .split("/")
    .forEach((segment) => assertSafeSegment(segment, "source"));
  return normalized;
};

const safeOutputPath = (outputRoot: string, relativePath: string) => {
  const normalized = normalizeSourcePath(relativePath);
  const resolvedRoot = path.resolve(outputRoot);
  const resolved = path.resolve(resolvedRoot, ...normalized.split("/"));
  const relative = path.relative(resolvedRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to access a path outside ${resolvedRoot}`);
  }
  return resolved;
};

const assertSafeOutputRoot = (outputRoot: string) => {
  const resolved = path.resolve(outputRoot);
  if (
    path.basename(resolved).toLowerCase() !== "github" ||
    path.basename(path.dirname(resolved)).toLowerCase() !== "brain"
  ) {
    throw new Error("GitHub sync output must be a brain/github directory");
  }
};

const jsonText = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

const previousJsonCheckedOn = (previous: string | undefined) => {
  if (!previous) return undefined;
  try {
    const checkedOn = (JSON.parse(previous) as { checkedOn?: unknown })
      .checkedOn;
    return typeof checkedOn === "string" && isIsoDate(checkedOn)
      ? checkedOn
      : undefined;
  } catch {
    return undefined;
  }
};

const previousMarkdownCheckedOn = (previous: string | undefined) => {
  const match = previous?.match(
    /^<!-- generatedBy: brain:sync-github; source: .+; checkedOn: (\d{4}-\d{2}-\d{2}); redactions: \d+ -->/,
  );
  return match?.[1];
};

const renderStableJson = (
  previous: string | undefined,
  checkedOn: string,
  makeValue: (stamp: string) => unknown,
) => {
  const oldStamp = previousJsonCheckedOn(previous);
  if (oldStamp) {
    const oldCandidate = jsonText(makeValue(oldStamp));
    if (oldCandidate === previous) return previous;
  }
  return jsonText(makeValue(checkedOn));
};

const renderStampedMarkdown = (
  previous: string | undefined,
  checkedOn: string,
  source: string,
  body: string,
  redactionCount: number,
) => {
  const normalizedBody = normalizeLineEndings(body).replace(/\n*$/, "");
  const render = (stamp: string) =>
    `<!-- generatedBy: ${GENERATED_BY}; source: ${source}; checkedOn: ${stamp}; redactions: ${redactionCount} -->\n\n${normalizedBody}\n`;
  const oldStamp = previousMarkdownCheckedOn(previous);
  if (oldStamp) {
    const oldCandidate = render(oldStamp);
    if (oldCandidate === previous) return previous;
  }
  return render(checkedOn);
};

export const redactCredentialLikeValues = (value: string) => {
  let text = value;
  let redactionCount = 0;
  const replace = (
    pattern: RegExp,
    replacement: string | ((match: string, ...groups: string[]) => string),
  ) => {
    text = text.replace(pattern, (...arguments_: string[]) => {
      redactionCount += 1;
      return typeof replacement === "string"
        ? replacement
        : replacement(arguments_[0] ?? "", ...arguments_.slice(1));
    });
  };

  replace(
    /((?:api[_-]?key|token|secret|password|passwd|private[_-]?key|anon[_-]?key)\s*[:=]\s*)(["']?)([^\s"'`]+)\2/gi,
    (_match, prefix) => `${prefix}[REDACTED credential-like value]`,
  );
  replace(
    /([?&](?:access_token|api_key|token|key)=)[^&\s)]+/gi,
    (_match, prefix) => `${prefix}[REDACTED credential-like value]`,
  );
  replace(
    /(authorization\s*:\s*bearer\s+)[A-Za-z0-9._~-]{12,}/gi,
    (_match, prefix) => `${prefix}[REDACTED credential-like value]`,
  );
  replace(
    /\b(?:github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|sk-(?:or-v1-)?[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{20,})\b/g,
    "[REDACTED credential-like value]",
  );
  replace(
    /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
    "[REDACTED credential-like value]",
  );
  return { text, redactionCount };
};

const decodeText = (encoded: GitHubEncodedContent, source: string) => {
  if (encoded.encoding !== "base64") {
    throw new Error(`Unsupported encoding ${encoded.encoding} for ${source}`);
  }
  const bytes = Buffer.from(encoded.content.replaceAll(/\s/g, ""), "base64");
  if (bytes.byteLength > MAX_AUTHORED_DOCUMENT_BYTES) {
    throw new Error(`Authored document exceeds 1 MB: ${source}`);
  }
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  if (text.includes("\u0000"))
    throw new Error(`Authored document is not text: ${source}`);
  return text.replace(/^\uFEFF/, "");
};

const textDocumentExtensions = new Set([
  ".adoc",
  ".md",
  ".mdx",
  ".rst",
  ".txt",
]);

const excludedAuthoredPathSegments = new Set([
  ".git",
  ".next",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "third-party",
  "third_party",
  "vendor",
  "vendors",
]);

export const isAuthoredDocumentPath = (sourcePath: string) => {
  const normalized = sourcePath.replaceAll("\\", "/");
  const normalizedLower = normalized.toLowerCase();
  const segments = normalizedLower.split("/");
  if (
    segments.some((segment) => excludedAuthoredPathSegments.has(segment)) ||
    normalizedLower.includes("/.agent/opendraft/") ||
    normalizedLower.startsWith(".agent/opendraft/")
  ) {
    return false;
  }
  const basename = path.posix.basename(normalized);
  const isNamedDocument =
    /^agents\.md$/i.test(basename) ||
    /_DIARY\.md$/i.test(basename) ||
    /_PLAN\.md$/i.test(basename) ||
    /_FIX.*\.md$/i.test(basename) ||
    /_DICTIONARY\.md$/i.test(basename) ||
    /^design\.md$/i.test(basename);
  const isDocsDocument =
    /(^|\/)docs\//i.test(normalized) &&
    textDocumentExtensions.has(path.posix.extname(basename).toLowerCase());
  return isNamedDocument || isDocsDocument;
};

export const selectRepositories = (
  repositories: readonly GitHubRepository[],
  owner = GITHUB_OWNER,
) =>
  repositories
    .filter(
      (repository) =>
        repository.owner.login.toLowerCase() === owner.toLowerCase() &&
        repository.fork === false &&
        repository.private === false &&
        (repository.visibility === undefined ||
          repository.visibility === "public") &&
        repository.size >= MINIMUM_REPOSITORY_SIZE_KB,
    )
    .sort((left, right) =>
      left.name.localeCompare(right.name, "en", { sensitivity: "base" }),
    );

async function mapWithConcurrency<T, U>(
  values: readonly T[],
  concurrency: number,
  mapper: (value: T, index: number) => Promise<U>,
): Promise<U[]> {
  const results = new Array<U>(values.length);
  let nextIndex = 0;
  const workers = Array.from(
    { length: Math.min(Math.max(1, concurrency), values.length) },
    async () => {
      while (nextIndex < values.length) {
        const index = nextIndex++;
        const value = values[index];
        if (value !== undefined) results[index] = await mapper(value, index);
      }
    },
  );
  await Promise.all(workers);
  return results;
}

const getAllOwnedRepositories = async (client: GitHubClient, owner: string) => {
  const repositories: GitHubRepository[] = [];
  for (let page = 1; ; page += 1) {
    const batch = await client.get<GitHubRepository[]>(
      `/users/${encodeURIComponent(owner)}/repos?type=owner&sort=full_name&direction=asc&per_page=100&page=${page}`,
    );
    repositories.push(...batch);
    if (batch.length < 100) return repositories;
  }
};

const fetchOptionalReadme = async (
  client: GitHubClient,
  repository: GitHubRepository,
) => {
  const endpoint = `/repos/${encodeURIComponent(repository.owner.login)}/${encodeURIComponent(repository.name)}/readme?ref=${encodeURIComponent(repository.default_branch)}`;
  try {
    return await client.get<GitHubEncodedContent>(endpoint);
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404)
      return undefined;
    throw error;
  }
};

const githubFileUrl = (repository: GitHubRepository, sourcePath: string) =>
  `${repository.html_url}/blob/${encodeURIComponent(repository.default_branch)}/${sourcePath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;

const isManagedContent = (relativePath: string, content: string) =>
  relativePath === ".gitkeep" ||
  content.startsWith(`<!-- generatedBy: ${GENERATED_BY};`) ||
  content.includes(`"generatedBy": "${GENERATED_BY}"`);

async function collectExistingFiles(
  outputRoot: string,
  relativeDirectory = "",
): Promise<Map<string, string>> {
  const directory = relativeDirectory
    ? safeOutputPath(outputRoot, relativeDirectory)
    : outputRoot;
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return new Map();
    throw error;
  }

  const files = new Map<string, string>();
  for (const entry of entries) {
    const relativePath = relativeDirectory
      ? `${relativeDirectory}/${entry.name}`
      : entry.name;
    if (!relativeDirectory && entry.name === "_forks") continue;
    if (entry.isSymbolicLink()) {
      throw new Error(
        `Refusing to follow symlink in generated tree: ${relativePath}`,
      );
    }
    if (entry.isDirectory()) {
      const nested = await collectExistingFiles(outputRoot, relativePath);
      nested.forEach((content, filePath) => files.set(filePath, content));
    } else if (entry.isFile()) {
      files.set(
        relativePath,
        await readFile(safeOutputPath(outputRoot, relativePath), "utf8"),
      );
    }
  }
  return files;
}

async function pruneEmptyDirectories(
  outputRoot: string,
  relativeDirectory = "",
): Promise<boolean> {
  const directory = relativeDirectory
    ? safeOutputPath(outputRoot, relativeDirectory)
    : outputRoot;
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || (!relativeDirectory && entry.name === "_forks"))
      continue;
    const child = relativeDirectory
      ? `${relativeDirectory}/${entry.name}`
      : entry.name;
    await pruneEmptyDirectories(outputRoot, child);
  }
  if (!relativeDirectory) return false;
  if ((await readdir(directory)).length > 0) return false;
  await rmdir(directory);
  return true;
}

async function reconcileFiles(
  outputRoot: string,
  existingFiles: ReadonlyMap<string, string>,
  desiredFiles: ReadonlyMap<string, string>,
) {
  let writtenFileCount = 0;
  let removedFileCount = 0;

  for (const [relativePath, content] of [...desiredFiles].sort(
    ([left], [right]) => left.localeCompare(right),
  )) {
    const existing = existingFiles.get(relativePath);
    if (existing === content) continue;
    if (existing !== undefined && !isManagedContent(relativePath, existing)) {
      throw new Error(
        `Refusing to overwrite unmanaged file: brain/github/${relativePath}`,
      );
    }
    const destination = safeOutputPath(outputRoot, relativePath);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, content, "utf8");
    writtenFileCount += 1;
  }

  for (const [relativePath, content] of [...existingFiles].sort(
    ([left], [right]) => right.localeCompare(left),
  )) {
    if (
      desiredFiles.has(relativePath) ||
      !isManagedContent(relativePath, content)
    )
      continue;
    await unlink(safeOutputPath(outputRoot, relativePath));
    removedFileCount += 1;
  }

  await pruneEmptyDirectories(outputRoot);
  return { writtenFileCount, removedFileCount };
}

const readPreviousInventoryStamps = (
  existingFiles: ReadonlyMap<string, string>,
) => {
  const inventory = existingFiles.get("inventory.json");
  if (!inventory) return new Map<string, string>();
  try {
    const parsed = JSON.parse(inventory) as {
      repositories?: readonly { name?: unknown; checkedOn?: unknown }[];
    };
    return new Map(
      (parsed.repositories ?? []).flatMap((repository) =>
        typeof repository.name === "string" &&
        typeof repository.checkedOn === "string" &&
        isIsoDate(repository.checkedOn)
          ? [[repository.name, repository.checkedOn] as const]
          : [],
      ),
    );
  } catch {
    return new Map<string, string>();
  }
};

async function generateRepository(
  client: GitHubClient,
  repository: GitHubRepository,
  existingFiles: ReadonlyMap<string, string>,
  previousRepositoryStamp: string | undefined,
  checkedOn: string,
  concurrency: number,
): Promise<GeneratedRepository> {
  assertSafeRepositoryName(repository.name);
  const repoPath = encodeURIComponent(repository.name);
  const ownerPath = encodeURIComponent(repository.owner.login);
  const [languages, readme, tree] = await Promise.all([
    client.get<Record<string, number>>(
      `/repos/${ownerPath}/${repoPath}/languages`,
    ),
    fetchOptionalReadme(client, repository),
    client.get<GitHubTree>(
      `/repos/${ownerPath}/${repoPath}/git/trees/${encodeURIComponent(repository.default_branch)}?recursive=1`,
    ),
  ]);
  if (tree.truncated) {
    throw new Error(
      `GitHub returned a truncated tree for ${repository.full_name}`,
    );
  }

  const seenAuthoredBlobs = new Set<string>();
  const authoredEntries = tree.tree
    .filter(
      (entry) =>
        entry.type === "blob" &&
        isAuthoredDocumentPath(entry.path) &&
        (entry.size === undefined || entry.size <= MAX_AUTHORED_DOCUMENT_BYTES),
    )
    .sort(
      (left, right) =>
        left.path.length - right.path.length ||
        left.path.localeCompare(right.path),
    )
    .filter((entry) => {
      if (seenAuthoredBlobs.has(entry.sha)) return false;
      seenAuthoredBlobs.add(entry.sha);
      return true;
    })
    .sort((left, right) => left.path.localeCompare(right.path));
  const authoredDocuments = await mapWithConcurrency(
    authoredEntries,
    concurrency,
    async (entry) => {
      const sourcePath = normalizeSourcePath(entry.path);
      const encoded = await client.get<GitHubEncodedContent>(
        `/repos/${ownerPath}/${repoPath}/git/blobs/${encodeURIComponent(entry.sha)}`,
      );
      const decoded = decodeText(
        encoded,
        `${repository.full_name}/${sourcePath}`,
      );
      return { sourcePath, ...redactCredentialLikeValues(decoded) };
    },
  );

  const files = new Map<string, string>();
  const metaPath = `${repository.name}/meta.json`;
  const orderedLanguages = Object.fromEntries(
    Object.entries(languages)
      .filter(
        (entry): entry is [string, number] =>
          typeof entry[0] === "string" && Number.isFinite(entry[1]),
      )
      .sort(([left], [right]) => left.localeCompare(right)),
  );
  files.set(
    metaPath,
    renderStableJson(existingFiles.get(metaPath), checkedOn, (stamp) => ({
      schemaVersion: 1,
      generatedBy: GENERATED_BY,
      repository: repository.full_name,
      description: repository.description,
      topics: [...(repository.topics ?? [])].sort((left, right) =>
        left.localeCompare(right),
      ),
      languages: orderedLanguages,
      licenseSpdx: repository.license?.spdx_id ?? null,
      homepage: repository.homepage || null,
      defaultBranch: repository.default_branch,
      pushedAt: repository.pushed_at,
      githubUrl: repository.html_url,
      checkedOn: stamp,
    })),
  );

  if (readme) {
    const readmePath = `${repository.name}/README.snapshot.md`;
    const sourcePath = normalizeSourcePath(readme.path ?? "README.md");
    const sanitizedReadme = redactCredentialLikeValues(
      decodeText(readme, `${repository.full_name}/${sourcePath}`),
    );
    files.set(
      readmePath,
      renderStampedMarkdown(
        existingFiles.get(readmePath),
        checkedOn,
        githubFileUrl(repository, sourcePath),
        sanitizedReadme.text,
        sanitizedReadme.redactionCount,
      ),
    );
  }

  for (const document of authoredDocuments) {
    const relativePath = `${repository.name}/authored/${document.sourcePath}`;
    files.set(
      relativePath,
      renderStampedMarkdown(
        existingFiles.get(relativePath),
        checkedOn,
        githubFileUrl(repository, document.sourcePath),
        document.text,
        document.redactionCount,
      ),
    );
  }

  const prefix = `${repository.name}/`;
  const generatedFilesChanged =
    [...files].some(
      ([filePath, content]) => existingFiles.get(filePath) !== content,
    ) ||
    [...existingFiles].some(
      ([filePath, content]) =>
        filePath.startsWith(prefix) &&
        !files.has(filePath) &&
        isManagedContent(filePath, content),
    );
  return {
    repository,
    files,
    checkedOn: generatedFilesChanged
      ? checkedOn
      : (previousRepositoryStamp ?? checkedOn),
    authoredDocumentCount: authoredDocuments.length,
  };
}

export async function syncGitHubBrain(
  options: GitHubBrainSyncOptions = {},
): Promise<GitHubBrainSyncResult> {
  const owner = options.owner ?? GITHUB_OWNER;
  const checkedOn = options.checkedOn ?? new Date().toISOString().slice(0, 10);
  const expectedRepositoryCount =
    options.expectedRepositoryCount ?? EXPECTED_REPOSITORY_COUNT;
  const concurrency = options.concurrency ?? 4;
  const outputRoot = path.resolve(
    options.outputRoot ??
      path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "..",
        "brain",
        "github",
      ),
  );
  if (!isIsoDate(checkedOn))
    throw new Error(`Invalid checkedOn date: ${checkedOn}`);
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 8) {
    throw new Error("Sync concurrency must be an integer from 1 to 8");
  }
  assertSafeOutputRoot(outputRoot);

  const client = options.client ?? new GhCliGitHubClient();
  const currentUser = await client.get<{ login: string }>("/user");
  if (currentUser.login.toLowerCase() !== owner.toLowerCase()) {
    throw new Error(
      `gh must be authenticated as ${owner}; received ${currentUser.login}`,
    );
  }
  const repositories = selectRepositories(
    await getAllOwnedRepositories(client, owner),
    owner,
  );
  if (repositories.length !== expectedRepositoryCount) {
    throw new Error(
      `Expected ${expectedRepositoryCount} public, owned, non-fork repositories >= ${MINIMUM_REPOSITORY_SIZE_KB} KB; received ${repositories.length}`,
    );
  }

  await mkdir(outputRoot, { recursive: true });
  const existingFiles = await collectExistingFiles(outputRoot);
  const previousRepositoryStamps = readPreviousInventoryStamps(existingFiles);
  const generatedRepositories = await mapWithConcurrency(
    repositories,
    concurrency,
    (repository) =>
      generateRepository(
        client,
        repository,
        existingFiles,
        previousRepositoryStamps.get(repository.name),
        checkedOn,
        concurrency,
      ),
  );

  const desiredFiles = new Map<string, string>();
  generatedRepositories.forEach((generated) =>
    generated.files.forEach((content, filePath) =>
      desiredFiles.set(filePath, content),
    ),
  );
  const inventoryPath = "inventory.json";
  desiredFiles.set(
    inventoryPath,
    renderStableJson(existingFiles.get(inventoryPath), checkedOn, (stamp) => ({
      schemaVersion: 1,
      generatedBy: GENERATED_BY,
      owner,
      filters: {
        visibility: "public",
        fork: false,
        minimumSizeKb: MINIMUM_REPOSITORY_SIZE_KB,
      },
      repositoryCount: generatedRepositories.length,
      repositories: generatedRepositories.map((generated) => ({
        name: generated.repository.name,
        fullName: generated.repository.full_name,
        directory: generated.repository.name,
        checkedOn: generated.checkedOn,
      })),
      checkedOn: stamp,
    })),
  );

  const { writtenFileCount, removedFileCount } = await reconcileFiles(
    outputRoot,
    existingFiles,
    desiredFiles,
  );
  return {
    repositoryCount: generatedRepositories.length,
    authoredDocumentCount: generatedRepositories.reduce(
      (total, repository) => total + repository.authoredDocumentCount,
      0,
    ),
    writtenFileCount,
    removedFileCount,
    unchanged: writtenFileCount === 0 && removedFileCount === 0,
  };
}

const parseCheckedOn = (arguments_: readonly string[]) => {
  if (arguments_.length === 0) return undefined;
  if (
    arguments_.length === 2 &&
    arguments_[0] === "--checked-on" &&
    arguments_[1]
  ) {
    return arguments_[1];
  }
  throw new Error("Usage: brain-sync-github.ts [--checked-on YYYY-MM-DD]");
};

const isDirectRun =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]).toLowerCase() ===
    fileURLToPath(import.meta.url).toLowerCase();

if (isDirectRun) {
  const checkedOn = parseCheckedOn(process.argv.slice(2));
  syncGitHubBrain(checkedOn ? { checkedOn } : {})
    .then((result) => {
      console.log(
        result.unchanged
          ? `GitHub brain unchanged: ${result.repositoryCount} repositories and ${result.authoredDocumentCount} authored documents.`
          : `GitHub brain synced: ${result.repositoryCount} repositories, ${result.authoredDocumentCount} authored documents, ${result.writtenFileCount} files written, ${result.removedFileCount} stale files removed.`,
      );
    })
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
