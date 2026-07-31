import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test, { afterEach } from "node:test";
import {
  GitHubApiError,
  isAuthoredDocumentPath,
  redactCredentialLikeValues,
  selectRepositories,
  syncGitHubBrain,
  type GitHubClient,
  type GitHubRepository,
} from "../../../scripts/brain-sync-github";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

const repository = (
  overrides: Partial<GitHubRepository> & Pick<GitHubRepository, "name">,
): GitHubRepository => ({
  owner: { login: "uset82" },
  full_name: `uset82/${overrides.name}`,
  fork: false,
  private: false,
  visibility: "public",
  size: 500,
  description: "An authored music system.",
  topics: ["music", "ai"],
  license: { spdx_id: "MIT" },
  homepage: "https://example.test/strudel",
  default_branch: "main",
  pushed_at: "2026-07-30T12:00:00Z",
  html_url: `https://github.com/uset82/${overrides.name}`,
  ...overrides,
});

const encoded = (content: string, sourcePath?: string) => ({
  content: Buffer.from(content).toString("base64"),
  encoding: "base64",
  ...(sourcePath ? { path: sourcePath } : {}),
});

class FixtureGitHubClient implements GitHubClient {
  readonly credential = [`eyJ${"a".repeat(20)}`, `eyJ${"b".repeat(20)}`, "c".repeat(20)].join(".");
  readme = `# StrudelAI\n\nA source-owned README.\n\nANON_KEY=${this.credential}\n`;
  truncated = false;

  readonly repositories = [
    Object.assign(repository({ name: "StrudelAI" }), {
      stargazers_count: 99,
      forks_count: 12,
      watchers_count: 98,
      open_issues_count: 7,
    }),
    repository({ name: "forked", fork: true }),
    repository({ name: "small", size: 49 }),
    repository({ name: "private-project", private: true, visibility: "private" }),
    repository({ name: "other-owner", owner: { login: "someone-else" } }),
  ];

  private readonly blobs = new Map([
    ["agents", "# Agent guidance\n\nUse verified project facts."],
    ["architecture", "# Architecture\n\nA documented pipeline."],
    ["diary", "# Project diary\n\nAn authored decision log."],
    ["dictionary", "# Strudel dictionary\n\nOwned terminology."],
    ["plan", "# Release plan\n\nA bounded plan."],
    ["fix", "# Auth fix\n\nA debugging record."],
    ["design", "# Design\n\nA design-system note."],
  ]);

  async get<T>(endpoint: string): Promise<T> {
    if (endpoint === "/user") return { login: "uset82" } as T;
    if (endpoint.startsWith("/users/uset82/repos?")) return this.repositories as T;
    if (endpoint === "/repos/uset82/StrudelAI/languages") {
      return { TypeScript: 900, JavaScript: 100 } as T;
    }
    if (endpoint.startsWith("/repos/uset82/StrudelAI/readme?")) {
      return encoded(this.readme, "README.md") as T;
    }
    if (endpoint.startsWith("/repos/uset82/StrudelAI/git/trees/")) {
      return {
        truncated: this.truncated,
        tree: [
          { path: "AGENTS.md", type: "blob", sha: "agents", size: 55 },
          { path: "nested/AGENTS.md", type: "blob", sha: "agents", size: 55 },
          {
            path: "docs/architecture.md",
            type: "blob",
            sha: "architecture",
            size: 48,
          },
          { path: "docs/diagram.png", type: "blob", sha: "image", size: 30 },
          { path: "PROJECT_DIARY.md", type: "blob", sha: "diary", size: 50 },
          {
            path: "STRUDEL_DICTIONARY.md",
            type: "blob",
            sha: "dictionary",
            size: 45,
          },
          { path: "RELEASE_PLAN.md", type: "blob", sha: "plan", size: 30 },
          { path: "AUTH_FIX_01.md", type: "blob", sha: "fix", size: 30 },
          { path: "design.md", type: "blob", sha: "design", size: 35 },
          { path: "README.md", type: "blob", sha: "readme", size: 42 },
        ],
      } as T;
    }
    const blobMatch = endpoint.match(/^\/repos\/uset82\/StrudelAI\/git\/blobs\/(.+)$/);
    if (blobMatch?.[1]) {
      const content = this.blobs.get(decodeURIComponent(blobMatch[1]));
      if (content) return encoded(content) as T;
    }
    throw new GitHubApiError(endpoint, `Fixture endpoint not found: ${endpoint}`, 404);
  }
}

const makeRoots = async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "portfolio-brain-sync-"));
  temporaryDirectories.push(root);
  const brainRoot = path.join(root, "brain");
  const outputRoot = path.join(brainRoot, "github");
  await mkdir(path.join(outputRoot, "_forks"), { recursive: true });
  await mkdir(path.join(brainRoot, "projects", "authored"), { recursive: true });
  await writeFile(path.join(outputRoot, "_forks", "mentora.json"), "hand authored fork\n");
  await writeFile(path.join(outputRoot, "manual-note.md"), "hand authored note\n");
  await writeFile(
    path.join(brainRoot, "projects", "authored", "NOTES.md"),
    "hand authored project\n",
  );
  return { brainRoot, outputRoot };
};

const snapshotFiles = async (directory: string, relativeDirectory = "") => {
  const snapshots = new Map<string, string>();
  const current = relativeDirectory ? path.join(directory, relativeDirectory) : directory;
  for (const entry of await readdir(current, { withFileTypes: true })) {
    const relativePath = relativeDirectory ? path.join(relativeDirectory, entry.name) : entry.name;
    if (entry.isDirectory()) {
      const nested = await snapshotFiles(directory, relativePath);
      nested.forEach((content, filePath) => snapshots.set(filePath, content));
    } else if (entry.isFile()) {
      snapshots.set(relativePath, await readFile(path.join(directory, relativePath), "utf8"));
    }
  }
  return snapshots;
};

test("repository filtering excludes forks, small repositories, private repositories, and other owners", () => {
  const client = new FixtureGitHubClient();
  assert.deepEqual(
    selectRepositories(client.repositories).map((entry) => entry.name),
    ["StrudelAI"],
  );
});

test("authored document matching covers agent, docs, diary, plan, fix, dictionary, and design files", () => {
  for (const sourcePath of [
    "AGENTS.md",
    "nested/agents.md",
    "docs/architecture.md",
    "PROJECT_DIARY.md",
    "RELEASE_PLAN.md",
    "AUTH_FIX_01.md",
    "STRUDEL_DICTIONARY.md",
    "design.md",
  ]) {
    assert.equal(isAuthoredDocumentPath(sourcePath), true, sourcePath);
  }
  assert.equal(isAuthoredDocumentPath("README.md"), false);
  assert.equal(isAuthoredDocumentPath("docs/diagram.png"), false);
  assert.equal(
    isAuthoredDocumentPath(".agent/opendraft/vendor/packages/web/src/routes/docs/about.md"),
    false,
  );
  assert.equal(isAuthoredDocumentPath("node_modules/package/docs/README.md"), false);
});

test("credential-like values are redacted without retaining their source value", () => {
  const credential = [`eyJ${"x".repeat(20)}`, `eyJ${"y".repeat(20)}`, "z".repeat(20)].join(".");
  const result = redactCredentialLikeValues(`ANON_KEY=${credential}`);
  assert.equal(result.redactionCount >= 1, true);
  assert.doesNotMatch(result.text, new RegExp(credential));
  assert.match(result.text, /ANON_KEY=\[REDACTED credential-like value\]/);
});

test("sync writes only generated GitHub snapshots, excludes volatile counts, and is idempotent", async () => {
  const { brainRoot, outputRoot } = await makeRoots();
  const client = new FixtureGitHubClient();
  const first = await syncGitHubBrain({
    client,
    outputRoot,
    checkedOn: "2026-07-31",
    expectedRepositoryCount: 1,
    concurrency: 2,
  });
  assert.equal(first.repositoryCount, 1);
  assert.equal(first.authoredDocumentCount, 7);
  assert.equal(first.unchanged, false);

  const inventoryText = await readFile(path.join(outputRoot, "inventory.json"), "utf8");
  const metaText = await readFile(path.join(outputRoot, "StrudelAI", "meta.json"), "utf8");
  const serializedOutput = `${inventoryText}\n${metaText}`;
  assert.doesNotMatch(serializedOutput, /stargazers|stars|forks_count|watchers|open_issues/i);
  const inventory = JSON.parse(inventoryText) as {
    repositoryCount: number;
    filters: { visibility: string; fork: boolean; minimumSizeKb: number };
  };
  assert.deepEqual(inventory, {
    ...inventory,
    repositoryCount: 1,
    filters: { visibility: "public", fork: false, minimumSizeKb: 50 },
  });
  const readme = await readFile(path.join(outputRoot, "StrudelAI", "README.snapshot.md"), "utf8");
  assert.match(readme, /checkedOn: 2026-07-31; redactions: [1-9]\d*/);
  assert.doesNotMatch(readme, new RegExp(client.credential));
  assert.match(
    await readFile(path.join(outputRoot, "StrudelAI", "authored", "STRUDEL_DICTIONARY.md"), "utf8"),
    /checkedOn: 2026-07-31/,
  );
  await assert.rejects(readFile(path.join(outputRoot, "forked", "meta.json"), "utf8"), /ENOENT/);

  const before = await snapshotFiles(brainRoot);
  const second = await syncGitHubBrain({
    client,
    outputRoot,
    checkedOn: "2026-08-01",
    expectedRepositoryCount: 1,
    concurrency: 2,
  });
  const after = await snapshotFiles(brainRoot);
  assert.deepEqual(after, before);
  assert.deepEqual(second, {
    repositoryCount: 1,
    authoredDocumentCount: 7,
    writtenFileCount: 0,
    removedFileCount: 0,
    unchanged: true,
  });
  assert.equal(
    await readFile(path.join(outputRoot, "_forks", "mentora.json"), "utf8"),
    "hand authored fork\n",
  );
  assert.equal(
    await readFile(path.join(outputRoot, "manual-note.md"), "utf8"),
    "hand authored note\n",
  );
  assert.equal(
    await readFile(path.join(brainRoot, "projects", "authored", "NOTES.md"), "utf8"),
    "hand authored project\n",
  );
});

test("sync fails closed on repository-count drift and truncated GitHub trees", async () => {
  const countRoots = await makeRoots();
  await assert.rejects(
    syncGitHubBrain({
      client: new FixtureGitHubClient(),
      outputRoot: countRoots.outputRoot,
      checkedOn: "2026-07-31",
    }),
    /Expected 42.*received 1/,
  );

  const treeRoots = await makeRoots();
  const truncatedClient = new FixtureGitHubClient();
  truncatedClient.truncated = true;
  await assert.rejects(
    syncGitHubBrain({
      client: truncatedClient,
      outputRoot: treeRoots.outputRoot,
      checkedOn: "2026-07-31",
      expectedRepositoryCount: 1,
    }),
    /truncated tree for uset82\/StrudelAI/,
  );
  assert.deepEqual((await readdir(treeRoots.outputRoot)).sort(), ["_forks", "manual-note.md"]);
});
