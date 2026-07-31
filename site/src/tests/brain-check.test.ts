import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import test, { afterEach } from "node:test";
import { checkBrain, BrainCheckError } from "../../../scripts/brain-check";
import {
  brainProjectSchema,
  brainPrivateSourcesSchema,
} from "../../../scripts/brain-project-schema";
import {
  publicationStateSchema,
  rightsStateSchema,
  sourceReferenceSchema,
  verificationStateSchema,
} from "@/content/schemas";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

const makeBrain = async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "portfolio-brain-check-"));
  temporaryDirectories.push(root);
  await mkdir(path.join(root, "projects"), { recursive: true });
  return root;
};

const validProject = (overrides: Record<string, unknown> = {}) => ({
  slug: "example-project",
  title: "Example project",
  type: "software",
  status: "prototype",
  public: true,
  publication: "ready",
  verification: "verified",
  rights: "owned",
  summary: "A source-backed example project.",
  github: {
    repo: "uset82/example-project",
    public: true,
    checkedOn: "2026-07-31",
  },
  sourceIds: ["github-uset82"],
  siteRoute: "/work/example-project",
  tags: ["software"],
  ...overrides,
});

const writeProject = async (
  brainRoot: string,
  project: Record<string, unknown> = validProject(),
  {
    notes = "# Notes\n\nOriginal, public project notes.",
    knowledge = "# Architecture\n\nA public architecture note.",
    sources,
  }: { notes?: string | null; knowledge?: string | null; sources?: unknown } = {},
) => {
  const slug = String(project.slug);
  const projectDirectory = path.join(brainRoot, "projects", slug);
  await mkdir(path.join(projectDirectory, "knowledge"), { recursive: true });
  await writeFile(
    path.join(projectDirectory, "project.json"),
    `${JSON.stringify(project, null, 2)}\n`,
  );
  if (notes !== null) await writeFile(path.join(projectDirectory, "NOTES.md"), notes);
  if (knowledge !== null) {
    await writeFile(path.join(projectDirectory, "knowledge", "architecture.md"), knowledge);
  }
  if (sources !== undefined) {
    await writeFile(
      path.join(projectDirectory, "sources.json"),
      `${JSON.stringify(sources, null, 2)}\n`,
    );
  }
  return projectDirectory;
};

const expectBrainFailure = async (brainRoot: string, pattern: RegExp) => {
  await assert.rejects(
    checkBrain(brainRoot),
    (error: unknown) => error instanceof BrainCheckError && pattern.test(error.message),
  );
};

test("brain schema reuses the site's verification, rights, publication, and source ID schemas", () => {
  assert.equal(brainProjectSchema.shape.verification, verificationStateSchema);
  assert.equal(brainProjectSchema.shape.rights, rightsStateSchema);
  assert.equal(brainProjectSchema.shape.publication, publicationStateSchema);
  assert.equal(brainProjectSchema.shape.sourceIds.element, sourceReferenceSchema.shape.id);
});

test("public project passes only with approved rights and public site sources", async () => {
  const brainRoot = await makeBrain();
  await writeProject(brainRoot);
  const result = await checkBrain(brainRoot);
  assert.equal(result.projectCount, 1);

  const pendingRightsRoot = await makeBrain();
  await writeProject(pendingRightsRoot, validProject({ rights: "pending" }));
  await expectBrainFailure(pendingRightsRoot, /public projects require approved rights/);

  const privateSourceRoot = await makeBrain();
  await writeProject(privateSourceRoot, validProject({ sourceIds: ["foundation-decision"] }));
  await expectBrainFailure(privateSourceRoot, /source is missing or is not public/);

  const unknownSourceRoot = await makeBrain();
  await writeProject(unknownSourceRoot, validProject({ sourceIds: ["unknown-source"] }));
  await expectBrainFailure(unknownSourceRoot, /unknown-source/);

  const sourceFreeRoot = await makeBrain();
  await writeProject(sourceFreeRoot, validProject({ sourceIds: [] }));
  await expectBrainFailure(sourceFreeRoot, /at least one sourceId/);
});

test('publication "ready" requires non-empty notes and a knowledge file', async () => {
  const missingNotesRoot = await makeBrain();
  await writeProject(missingNotesRoot, validProject(), { notes: null });
  await expectBrainFailure(missingNotesRoot, /requires a non-empty NOTES\.md/);

  const emptyNotesRoot = await makeBrain();
  await writeProject(emptyNotesRoot, validProject(), { notes: " \n" });
  await expectBrainFailure(emptyNotesRoot, /requires a non-empty NOTES\.md/);

  const missingKnowledgeRoot = await makeBrain();
  await writeProject(missingKnowledgeRoot, validProject(), { knowledge: null });
  await expectBrainFailure(missingKnowledgeRoot, /requires at least one knowledge file/);
});

test("checker keeps project status unchanged and rejects a raised pinaculo status", async () => {
  const brainRoot = await makeBrain();
  const pinaculo = validProject({
    slug: "pinaculo",
    title: "PINÁCULO",
    status: "concept",
    public: false,
    publication: "draft",
    verification: "reference-approved",
    rights: "pending",
    sourceIds: [],
    siteRoute: "/work/pinaculo",
    tags: ["cosmos"],
  });
  const directory = await writeProject(brainRoot, pinaculo, { notes: null, knowledge: null });
  const projectFile = path.join(directory, "project.json");
  const before = await readFile(projectFile, "utf8");
  const result = await checkBrain(brainRoot);
  const after = await readFile(projectFile, "utf8");
  assert.equal(result.projects[0]?.status, "concept");
  assert.equal(after, before);

  const raisedRoot = await makeBrain();
  await writeProject(
    raisedRoot,
    { ...pinaculo, status: "shipped" },
    { notes: null, knowledge: null },
  );
  await expectBrainFailure(raisedRoot, /pinaculo is a concept and its status may not be raised/);
});

test("public project files reject every brain-private reference", async () => {
  for (const [field, content] of [
    ["project", "../brain-private/books/private.pdf"],
    ["notes", "Source: ../../brain-private/scratch/private.md"],
    ["knowledge", "Copied from C:/work/brain-private/chatgpt/export.md"],
  ] as const) {
    const brainRoot = await makeBrain();
    const project = field === "project" ? validProject({ summary: content }) : validProject();
    await writeProject(brainRoot, project, {
      notes: field === "notes" ? content : "# Notes\n\nPublic notes.",
      knowledge: field === "knowledge" ? content : "# Knowledge\n\nPublic knowledge.",
    });
    await expectBrainFailure(brainRoot, /may not reference brain-private/);
  }
});

test("sources.json permits private paths and page locators but rejects quoted content", () => {
  assert.equal(
    brainPrivateSourcesSchema.safeParse({
      version: 1,
      sources: [
        {
          id: "private-book-note",
          path: "../brain-private/books/reference.pdf",
          pageRefs: ["pp. 12-14"],
        },
      ],
    }).success,
    true,
  );

  const withQuote = brainPrivateSourcesSchema.safeParse({
    version: 1,
    sources: [
      {
        id: "private-book-note",
        path: "../brain-private/books/reference.pdf",
        quote: "Copied private source text",
      },
    ],
  });
  assert.equal(withQuote.success, false);
});

test("brain-check CLI prints clear validation errors and exits non-zero", async () => {
  const brainRoot = await makeBrain();
  await writeProject(brainRoot, validProject({ rights: "pending" }));
  const tsxCli = path.join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");
  const checker = path.resolve(process.cwd(), "..", "scripts", "brain-check.ts");
  const result = spawnSync(process.execPath, [tsxCli, checker, "--root", brainRoot], {
    encoding: "utf8",
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Brain check failed with 1 issue/);
  assert.match(result.stderr, /public projects require approved rights/);
});
