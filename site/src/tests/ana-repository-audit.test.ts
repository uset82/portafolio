import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test, { afterEach } from "node:test";
import { fileURLToPath } from "node:url";
import { GitHubApiError, type GitHubClient } from "../../../scripts/brain-sync-github";
import { auditOwnedRepositories } from "../../../scripts/ana-audit-repositories";
import { applyRegistryOverrides, auditRepositories } from "@/ana/repositories/auditor";
import {
  classifyRepository,
  inferCapabilities,
  inferDomains,
  inferFlags,
  inferFramework,
} from "@/ana/repositories/classifier";
import {
  collectRepositoryInspection,
  isForbiddenContentPath,
  isSafeManifestPath,
  listOwnedRepositories,
  selectSafeManifests,
  type DiscoveredRepository,
} from "@/ana/repositories/github";
import {
  assertPublicRegistrySafety,
  loadEffectiveRepositoryAudits,
  parseRepositoryOverrides,
  parseRepositoryRegistry,
} from "@/ana/repositories/registry";
import { repositoryAuditSchema } from "@/ana/repositories/schemas";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

const discovered = (
  overrides: Partial<DiscoveredRepository> & Pick<DiscoveredRepository, "name">,
): DiscoveredRepository => ({
  owner: "uset82",
  fullName: `uset82/${overrides.name}`,
  description: null,
  fork: false,
  private: false,
  visibility: "public",
  sizeKb: 800,
  defaultBranch: "main",
  homepage: null,
  topics: [],
  htmlUrl: `https://github.com/uset82/${overrides.name}`,
  language: "TypeScript",
  ...overrides,
});

const encoded = (content: string, sourcePath?: string) => ({
  type: "file",
  content: Buffer.from(content).toString("base64"),
  encoding: "base64",
  size: Buffer.byteLength(content),
  ...(sourcePath ? { path: sourcePath } : {}),
});

class FixtureGitHubClient implements GitHubClient {
  constructor(
    readonly repositories: DiscoveredRepository[],
    readonly files: ReadonlyMap<string, string>,
  ) {}

  async get<T>(endpoint: string): Promise<T> {
    if (endpoint === "/user") return { login: "uset82" } as T;
    if (endpoint.startsWith("/user/repos?")) {
      return this.repositories.map((repository) => ({
        owner: { login: repository.owner },
        name: repository.name,
        full_name: repository.fullName,
        fork: repository.fork,
        private: repository.private,
        visibility: repository.visibility,
        size: repository.sizeKb,
        description: repository.description,
        topics: repository.topics,
        default_branch: repository.defaultBranch,
        homepage: repository.homepage,
        html_url: repository.htmlUrl,
        language: repository.language,
      })) as T;
    }

    const readmeMatch = endpoint.match(/^\/repos\/uset82\/([^/]+)\/readme\?/);
    if (readmeMatch?.[1]) {
      const content = this.files.get(`${readmeMatch[1]}/README.md`);
      if (!content) throw new GitHubApiError(endpoint, "missing readme", 404);
      return encoded(content, "README.md") as T;
    }

    const treeMatch = endpoint.match(/^\/repos\/uset82\/([^/]+)\/git\/trees\//);
    if (treeMatch?.[1]) {
      const prefix = `${treeMatch[1]}/`;
      return {
        truncated: false,
        tree: [...this.files.keys()]
          .filter((filePath) => filePath.startsWith(prefix))
          .map((filePath) => ({
            path: filePath.slice(prefix.length),
            type: "blob",
            size: 40,
          })),
      } as T;
    }

    const contentMatch = endpoint.match(/^\/repos\/uset82\/([^/]+)\/contents\/(.+)\?ref=/);
    if (contentMatch?.[1] && contentMatch[2]) {
      const sourcePath = decodeURIComponent(contentMatch[2]);
      const content = this.files.get(`${contentMatch[1]}/${sourcePath}`);
      if (!content) throw new GitHubApiError(endpoint, "missing content", 404);
      return encoded(content, sourcePath) as T;
    }

    throw new GitHubApiError(endpoint, `Fixture endpoint not found: ${endpoint}`, 404);
  }
}

test("safe manifest selection ignores secrets and vendor paths", () => {
  assert.equal(isForbiddenContentPath(".env"), true);
  assert.equal(isForbiddenContentPath("backend/.env.local"), true);
  assert.equal(isForbiddenContentPath("secrets.json"), true);
  assert.equal(isSafeManifestPath("package.json"), true);
  assert.equal(isSafeManifestPath("backend/requirements.txt"), true);
  assert.equal(isSafeManifestPath("node_modules/package.json"), false);
  assert.deepEqual(selectSafeManifests(["src/index.ts", "package.json", ".env"]), ["package.json"]);
});

test("ASTROEA-like inspection infers an astrology agent candidate without enabling it", () => {
  const inspection = {
    repository: discovered({
      name: "ASTROEA",
      description: "Professional astrology platform",
      language: "TypeScript",
    }),
    contentsInspected: true,
    treePaths: [
      "backend/main.py",
      "backend/requirements.txt",
      "backend/routers/charts.py",
      "frontend/package.json",
      "docker-compose.yml",
    ],
    manifests: {
      "backend/requirements.txt": "fastapi\nopenai\n",
      "frontend/package.json": JSON.stringify({ dependencies: { react: "19.0.0" } }),
    },
    readme:
      "ASTRAEA generates natal charts, transits, synastry, and AI interpretation via OpenRouter.",
  };
  const flags = inferFlags(inspection);
  const domain = inferDomains(inspection);
  const capabilities = inferCapabilities(inspection);
  const classification = classifyRepository(inspection, {
    flags,
    domain,
    capabilities,
  });
  const [audit] = auditRepositories([inspection]);

  assert.equal(flags.hasBackend, true);
  assert.equal(flags.hasAPI, true);
  assert.equal(flags.hasLLM, true);
  assert.equal(domain.includes("astrology"), true);
  assert.ok(capabilities.includes("natal-chart"));
  assert.ok(capabilities.includes("synastry"));
  assert.equal(classification.recommendedType, "agent");
  assert.equal(classification.agentPotential, "high");
  assert.equal(audit?.enabled, false);
  assert.equal(audit?.visibility, "public");
});

test("pinaculo-like inspection infers a numerology agent candidate", () => {
  const inspection = {
    repository: discovered({
      name: "pinaculo",
      description: "Sistema de numerología del pináculo",
    }),
    contentsInspected: true,
    treePaths: ["package.json", "src/app/page.tsx"],
    manifests: {
      "package.json": JSON.stringify({ dependencies: { next: "15.0.0" } }),
    },
    readme: "Numerología del Pináculo with master numbers and life cycles.",
  };
  const classification = classifyRepository(inspection, {
    flags: inferFlags(inspection),
    domain: inferDomains(inspection),
    capabilities: inferCapabilities(inspection),
  });
  assert.deepEqual(inferDomains(inspection), ["numerology"]);
  assert.equal(inferFramework(inspection), "next");
  assert.equal(classification.recommendedType, "agent");
  assert.equal(classification.status, "prototype");
});

test("StrudelAI-like inspection infers a music agent candidate", () => {
  const inspection = {
    repository: discovered({ name: "StrudelAI", homepage: "https://example.test/strudel" }),
    contentsInspected: true,
    treePaths: ["package.json", "src/app/api/chat/route.ts"],
    manifests: {
      "package.json": JSON.stringify({
        dependencies: { "@openrouter/sdk": "0.1.0", next: "16.0.0" },
      }),
    },
    readme: "StrudelAI live coding generative music with voice control.",
  };
  const flags = inferFlags(inspection);
  const classification = classifyRepository(inspection, {
    flags,
    domain: inferDomains(inspection),
    capabilities: inferCapabilities(inspection),
  });
  assert.equal(flags.hasLLM, true);
  assert.equal(flags.hasAPI, true);
  assert.ok(inferDomains(inspection).includes("music"));
  assert.equal(classification.recommendedType, "agent");
});

test("deterministic utilities become tools, empty and fork repos stay disabled", () => {
  const qr = {
    repository: discovered({ name: "qr-code-generator", sizeKb: 120, language: "JavaScript" }),
    contentsInspected: true,
    treePaths: ["package.json", "index.js"],
    manifests: { "package.json": JSON.stringify({ dependencies: {} }) },
    readme: "Generate a QR code in the browser.",
  };
  const empty = {
    repository: discovered({ name: "mini", sizeKb: 0, language: null }),
    contentsInspected: true,
    treePaths: [],
    manifests: {},
  };
  const fork = {
    repository: discovered({ name: "FreeCAD", fork: true, sizeKb: 2_000_000, language: "C++" }),
    contentsInspected: true,
    treePaths: ["README.md"],
    manifests: {},
    readme: "Upstream FreeCAD fork.",
  };

  assert.equal(
    classifyRepository(qr, {
      flags: inferFlags(qr),
      domain: inferDomains(qr),
      capabilities: inferCapabilities(qr),
    }).recommendedType,
    "tool",
  );
  assert.equal(
    classifyRepository(empty, {
      flags: inferFlags(empty),
      domain: inferDomains(empty),
      capabilities: inferCapabilities(empty),
    }).status,
    "empty",
  );
  assert.equal(
    classifyRepository(fork, {
      flags: inferFlags(fork),
      domain: inferDomains(fork),
      capabilities: inferCapabilities(fork),
    }).recommendedType,
    "disabled",
  );
});

test("normalized name collisions are marked duplicate", () => {
  const first = {
    repository: discovered({ name: "DealDash", sizeKb: 120 }),
    contentsInspected: true,
    treePaths: ["index.js"],
    manifests: {},
    readme: "A deal app.",
  };
  const second = {
    repository: discovered({ name: "DealDash-", sizeKb: 120 }),
    contentsInspected: true,
    treePaths: ["index.js"],
    manifests: {},
    readme: "A deal app.",
  };
  const audits = auditRepositories([first, second]);
  const duplicate = audits.find((audit) => audit.repository === "uset82/DealDash-");
  const canonical = audits.find((audit) => audit.repository === "uset82/DealDash");
  assert.equal(duplicate?.status, "duplicate");
  assert.equal(duplicate?.recommendedType, "disabled");
  assert.equal(canonical?.status, "prototype");
});

test("empty GitHub repositories with HTTP 409 are inspected as empty trees", async () => {
  class EmptyRepoClient implements GitHubClient {
    async get<T>(endpoint: string): Promise<T> {
      if (endpoint.includes("/git/trees/") || endpoint.includes("/readme")) {
        throw new GitHubApiError(endpoint, "Git Repository is empty.", 409);
      }
      throw new GitHubApiError(endpoint, `unexpected ${endpoint}`, 500);
    }
  }

  const inspection = await collectRepositoryInspection(
    new EmptyRepoClient(),
    discovered({ name: "CALLKIRO", sizeKb: 0, language: null }),
  );
  assert.equal(inspection.contentsInspected, true);
  assert.deepEqual(inspection.treePaths, []);
  assert.equal(inspection.readme, undefined);
});

test("manual overrides replace generated classification and never leak into schema-invalid data", () => {
  const generated = repositoryAuditSchema.parse({
    repository: "uset82/ASTROEA",
    hasBackend: true,
    hasAPI: true,
    hasDatabase: false,
    hasLLM: true,
    domain: ["astrology"],
    capabilities: ["natal-chart"],
    status: "prototype",
    agentPotential: "high",
    recommendedType: "agent",
    visibility: "public",
    enabled: false,
    contentsInspected: true,
    sizeKb: 800,
    manifestFiles: ["backend/requirements.txt"],
  });
  const [merged] = applyRegistryOverrides([generated], {
    "uset82/ASTROEA": {
      enabled: false,
      recommendedType: "agent",
      notes: "Future proof of concept. Not activated in Phase 1.",
    },
  });
  assert.equal(merged?.enabled, false);
  assert.equal(merged?.recommendedType, "agent");
  assert.equal(merged?.repository, "uset82/ASTROEA");
});

test("private repositories are listed without reading contents and stay out of the public registry", async () => {
  const credential = "fixture-credential-like-value";
  const client = new FixtureGitHubClient(
    [
      discovered({ name: "ASTROEA" }),
      discovered({
        name: "secret-lab",
        private: true,
        visibility: "private",
        description: "must not be copied",
      }),
    ],
    new Map([
      [
        "ASTROEA/README.md",
        `# ASTRAEA\nNatal charts and OpenRouter interpretation.\nOPENROUTER_API_KEY=${credential}`,
      ],
      ["ASTROEA/package.json", JSON.stringify({ dependencies: { next: "16.0.0" } })],
      ["secret-lab/README.md", "private source that must never be fetched"],
      ["secret-lab/.env", "SECRET=should-not-fetch"],
    ]),
  );

  const listed = await listOwnedRepositories(client);
  assert.equal(listed.length, 2);
  const privateInspection = await collectRepositoryInspection(
    client,
    listed.find((repository) => repository.private) ??
      discovered({ name: "secret-lab", private: true, visibility: "private" }),
  );
  assert.equal(privateInspection.contentsInspected, false);
  assert.deepEqual(privateInspection.treePaths, []);
  assert.equal(privateInspection.readme, undefined);

  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "ana-registry-"));
  temporaryDirectories.push(outputRoot);
  const brainRoot = path.join(outputRoot, "brain", "repositories");
  await mkdir(brainRoot, { recursive: true });
  const result = await auditOwnedRepositories({
    client,
    outputRoot: brainRoot,
    generatedAt: "2026-08-12",
  });
  assert.equal(result.publicCount, 1);
  assert.equal(result.privateCount, 1);

  const publicRegistry = parseRepositoryRegistry(
    JSON.parse(await readFile(path.join(brainRoot, "registry.generated.json"), "utf8")) as unknown,
  );
  assertPublicRegistrySafety(publicRegistry);
  assert.equal(publicRegistry.repositories[0]?.repository, "uset82/ASTROEA");
  assert.equal(publicRegistry.repositories[0]?.enabled, false);
  assert.match(publicRegistry.repositories[0]?.readme ?? "", /ASTRAEA/);
  assert.doesNotMatch(
    JSON.stringify(publicRegistry),
    /fixture-credential-like-value|must not be copied|private source/,
  );

  const privateRegistry = parseRepositoryRegistry(
    JSON.parse(
      await readFile(path.join(brainRoot, "registry.private.generated.json"), "utf8"),
    ) as unknown,
  );
  assert.equal(privateRegistry.repositories[0]?.repository, "uset82/secret-lab");
  assert.equal(privateRegistry.repositories[0]?.contentsInspected, false);
  assert.equal(privateRegistry.repositories[0]?.readme, undefined);
});

test("committed public registry validates and keeps the first proof-of-concept repos disabled", async () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
  const generatedPath = path.join(repoRoot, "brain/repositories/registry.generated.json");
  const overridesPath = path.join(repoRoot, "brain/repositories/registry.overrides.json");
  const generated = parseRepositoryRegistry(
    JSON.parse(await readFile(generatedPath, "utf8")) as unknown,
  );
  const overrides = parseRepositoryOverrides(
    JSON.parse(await readFile(overridesPath, "utf8")) as unknown,
  );
  assertPublicRegistrySafety(generated);
  assert.equal(generated.source, "github-api");
  const names = new Set(generated.repositories.map((audit) => audit.repository));
  assert.equal(names.has("uset82/ASTROEA"), true);
  assert.equal(names.has("uset82/pinaculo"), true);
  assert.equal(names.has("uset82/StrudelAI"), true);
  assert.equal(
    generated.repositories.every((audit) => audit.enabled === false),
    true,
  );
  const effective = await loadEffectiveRepositoryAudits({ generatedPath, overridesPath });
  const astraea = effective.find((audit) => audit.repository === "uset82/ASTROEA");
  assert.equal(astraea?.enabled, false);
  assert.equal(overrides.schemaVersion, 1);
});
