import { GitHubApiError, redactCredentialLikeValues } from "../../../../scripts/brain-sync-github";

export const GITHUB_OWNER = "uset82";
export const MAX_README_CHARS = 800;
export const MAX_MANIFEST_BYTES = 256_000;
export const MAX_MANIFEST_FILES = 8;

export interface AnaGitHubClient {
  get<T>(endpoint: string): Promise<T>;
}

export type DiscoveredRepository = {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  fork: boolean;
  private: boolean;
  visibility: "public" | "private";
  sizeKb: number;
  defaultBranch: string;
  homepage: string | null;
  topics: readonly string[];
  htmlUrl: string;
  language: string | null;
};

export type RepositoryInspection = {
  repository: DiscoveredRepository;
  contentsInspected: boolean;
  treePaths: readonly string[];
  manifests: Readonly<Record<string, string>>;
  readme?: string;
};

type GitHubRepoPayload = {
  owner: { login: string };
  name: string;
  full_name: string;
  fork: boolean;
  private: boolean;
  visibility?: string;
  size: number;
  description: string | null;
  topics?: readonly string[];
  default_branch: string;
  homepage: string | null;
  html_url: string;
  language: string | null;
};

type GitHubTree = {
  tree: readonly { path: string; type: string; size?: number }[];
  truncated: boolean;
};

type GitHubEncodedContent = {
  type?: string;
  content?: string;
  encoding?: string;
  path?: string;
  size?: number;
};

const EXCLUDED_PATH_SEGMENTS = new Set([
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

const SAFE_MANIFEST_BASENAMES = new Set([
  "cargo.toml",
  "composer.json",
  "docker-compose.yaml",
  "docker-compose.yml",
  "dockerfile",
  "gemfile",
  "go.mod",
  "package.json",
  "pipfile",
  "pyproject.toml",
  "requirements.txt",
]);

const SAFE_MANIFEST_PATHS = new Set([
  "astro.config.mjs",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "prisma/schema.prisma",
  "svelte.config.js",
  "vite.config.ts",
]);

const FORBIDDEN_CONTENT_PATTERN =
  /(?:^|\/)(?:\.env(?:\..+)?$|.*(?:credentials|secrets).*(?:\.(?:json|ya?ml|txt|env))?$|.*\.pem$|.*\.key$|id_rsa(?:\.pub)?$)/i;

export const isForbiddenContentPath = (sourcePath: string) =>
  FORBIDDEN_CONTENT_PATTERN.test(sourcePath.replaceAll("\\", "/"));

const normalizeSourcePath = (sourcePath: string) => sourcePath.replaceAll("\\", "/");

const pathSegments = (sourcePath: string) =>
  normalizeSourcePath(sourcePath).split("/").filter(Boolean);

export const isSafeManifestPath = (sourcePath: string) => {
  const normalized = normalizeSourcePath(sourcePath);
  if (isForbiddenContentPath(normalized)) return false;
  const segments = pathSegments(normalized);
  if (segments.some((segment) => EXCLUDED_PATH_SEGMENTS.has(segment.toLowerCase()))) {
    return false;
  }
  const basename = segments.at(-1)?.toLowerCase();
  if (!basename) return false;
  if (SAFE_MANIFEST_BASENAMES.has(basename)) return true;
  return SAFE_MANIFEST_PATHS.has(normalized.toLowerCase());
};

export const selectSafeManifests = (treePaths: readonly string[]) =>
  [...treePaths]
    .filter(isSafeManifestPath)
    .sort((left, right) => {
      const depth = pathSegments(left).length - pathSegments(right).length;
      return depth !== 0 ? depth : left.localeCompare(right);
    })
    .slice(0, MAX_MANIFEST_FILES);

const isMissingContent = (error: unknown) =>
  error instanceof GitHubApiError && (error.status === 404 || error.status === 409);

const truncateText = (value: string, maxChars: number) => {
  const collapsed = value.replace(/\s+/g, " ").trim();
  if (collapsed.length <= maxChars) return collapsed;
  return `${collapsed.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
};

const decodeEncodedContent = (encoded: GitHubEncodedContent, source: string) => {
  if (encoded.type !== undefined && encoded.type !== "file") {
    throw new Error(`Refusing non-file GitHub content for ${source}`);
  }
  if (encoded.encoding !== "base64" || typeof encoded.content !== "string") {
    throw new Error(`Unsupported GitHub content encoding for ${source}`);
  }
  if (encoded.size !== undefined && encoded.size > MAX_MANIFEST_BYTES) {
    throw new Error(`GitHub content exceeds ${MAX_MANIFEST_BYTES} bytes: ${source}`);
  }
  const bytes = Buffer.from(encoded.content.replaceAll(/\s/g, ""), "base64");
  if (bytes.byteLength > MAX_MANIFEST_BYTES) {
    throw new Error(`GitHub content exceeds ${MAX_MANIFEST_BYTES} bytes: ${source}`);
  }
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  if (text.includes("\u0000")) throw new Error(`GitHub content is not text: ${source}`);
  return redactCredentialLikeValues(text.replace(/^\uFEFF/, "")).text;
};

const mapRepository = (payload: GitHubRepoPayload): DiscoveredRepository => ({
  owner: payload.owner.login,
  name: payload.name,
  fullName: payload.full_name,
  description: payload.description,
  fork: payload.fork,
  private: payload.private,
  visibility: payload.private || payload.visibility === "private" ? "private" : "public",
  sizeKb: payload.size,
  defaultBranch: payload.default_branch,
  homepage: payload.homepage,
  topics: [...(payload.topics ?? [])],
  htmlUrl: payload.html_url,
  language: payload.language,
});

async function paginateRepositories(client: AnaGitHubClient, endpointPrefix: string) {
  const repositories: DiscoveredRepository[] = [];
  for (let page = 1; ; page += 1) {
    const batch = await client.get<GitHubRepoPayload[]>(`${endpointPrefix}&page=${page}`);
    repositories.push(...batch.map(mapRepository));
    if (batch.length < 100) return repositories;
  }
}

export async function listOwnedRepositories(
  client: AnaGitHubClient,
  owner = GITHUB_OWNER,
): Promise<DiscoveredRepository[]> {
  try {
    const currentUser = await client.get<{ login: string }>("/user");
    if (currentUser.login.toLowerCase() === owner.toLowerCase()) {
      return paginateRepositories(
        client,
        "/user/repos?affiliation=owner&sort=full_name&direction=asc&per_page=100",
      );
    }
  } catch (error) {
    if (!isMissingContent(error) && !(error instanceof GitHubApiError && error.status === 401)) {
      throw error;
    }
  }

  return paginateRepositories(
    client,
    `/users/${encodeURIComponent(owner)}/repos?type=owner&sort=full_name&direction=asc&per_page=100`,
  );
}

const fetchOptional = async <T>(
  client: AnaGitHubClient,
  endpoint: string,
): Promise<T | undefined> => {
  try {
    return await client.get<T>(endpoint);
  } catch (error) {
    if (isMissingContent(error)) return undefined;
    throw error;
  }
};

export async function collectRepositoryInspection(
  client: AnaGitHubClient,
  repository: DiscoveredRepository,
): Promise<RepositoryInspection> {
  if (repository.private || repository.visibility === "private") {
    return {
      repository,
      contentsInspected: false,
      treePaths: [],
      manifests: {},
    };
  }

  const ownerPath = encodeURIComponent(repository.owner);
  const repoPath = encodeURIComponent(repository.name);
  const branch = encodeURIComponent(repository.defaultBranch);
  const [readme, tree] = await Promise.all([
    fetchOptional<GitHubEncodedContent>(
      client,
      `/repos/${ownerPath}/${repoPath}/readme?ref=${branch}`,
    ),
    fetchOptional<GitHubTree>(
      client,
      `/repos/${ownerPath}/${repoPath}/git/trees/${branch}?recursive=1`,
    ),
  ]);

  const treePaths = (tree?.tree ?? [])
    .filter((entry) => entry.type === "blob")
    .map((entry) => entry.path)
    .sort((left, right) => left.localeCompare(right));
  const manifestPaths = selectSafeManifests(treePaths);
  const manifestEntries = await Promise.all(
    manifestPaths.map(async (sourcePath) => {
      const encoded = await fetchOptional<GitHubEncodedContent>(
        client,
        `/repos/${ownerPath}/${repoPath}/contents/${sourcePath
          .split("/")
          .map(encodeURIComponent)
          .join("/")}?ref=${branch}`,
      );
      if (!encoded) return undefined;
      try {
        return [
          sourcePath,
          decodeEncodedContent(encoded, `${repository.fullName}/${sourcePath}`),
        ] as const;
      } catch {
        return undefined;
      }
    }),
  );

  const manifests = Object.fromEntries(
    manifestEntries.filter((entry): entry is readonly [string, string] => entry !== undefined),
  );
  const inspection: RepositoryInspection = {
    repository,
    contentsInspected: true,
    treePaths,
    manifests,
  };
  if (readme) {
    inspection.readme = truncateText(
      decodeEncodedContent(readme, `${repository.fullName}/${readme.path ?? "README.md"}`),
      MAX_README_CHARS,
    );
  }
  return inspection;
}

export async function mapWithConcurrency<T, U>(
  values: readonly T[],
  concurrency: number,
  mapper: (value: T, index: number) => Promise<U>,
): Promise<U[]> {
  const results = new Array<U>(values.length);
  let nextIndex = 0;
  const workers = Array.from(
    { length: Math.min(Math.max(1, concurrency), Math.max(values.length, 1)) },
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
