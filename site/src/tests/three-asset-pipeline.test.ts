import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { Document, NodeIO } from "@gltf-transform/core";

import {
  ASSET_PIPELINE,
  createCompressedVariant,
  inspectGlbBytes,
  inspectPublishedRegistryAssets,
  optimizeGlbBytes,
  verifyCompressedVariant,
  type AssetBudget,
} from "../../scripts/three/asset-pipeline";

const tinyPng = new Uint8Array(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  ),
);

const passingBudget: AssetBudget = {
  assetId: "observatory-shell",
  lod: 0,
  expectedDimensionsMeters: [2, 2, 1],
  expectedNodes: ["ObservatoryShell"],
  expectedAuthoredClips: ["idle"],
  maxTriangles: 4,
  maxMaterials: 2,
  maxTexturePx: 4,
  maxFileBytes: 1024 * 1024,
};

async function createFixtureGlb(options: { negativeScale?: boolean } = {}) {
  const document = new Document();
  const buffer = document.createBuffer("fixture-buffer");
  const positions = document
    .createAccessor("positions")
    .setType("VEC3")
    .setArray(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]))
    .setBuffer(buffer);
  const indices = document
    .createAccessor("indices")
    .setType("SCALAR")
    .setArray(new Uint16Array([0, 1, 2]))
    .setBuffer(buffer);
  const texcoords = document
    .createAccessor("texcoords")
    .setType("VEC2")
    .setArray(new Float32Array([0, 0, 1, 0, 0, 1]))
    .setBuffer(buffer);
  const texture = document
    .createTexture("NaturalTexture")
    .setMimeType("image/png")
    .setImage(tinyPng);
  const material = document.createMaterial("NaturalMaterial").setBaseColorTexture(texture);
  const primitive = document
    .createPrimitive()
    .setAttribute("POSITION", positions)
    .setAttribute("TEXCOORD_0", texcoords)
    .setIndices(indices)
    .setMaterial(material);
  const mesh = document.createMesh("TriangleMesh").addPrimitive(primitive);
  const node = document.createNode("ObservatoryShell").setMesh(mesh);
  if (options.negativeScale) node.setScale([-1, 1, 1]);
  document.createScene("FixtureScene").addChild(node);

  const times = document
    .createAccessor("idle-times")
    .setType("SCALAR")
    .setArray(new Float32Array([0, 1]))
    .setBuffer(buffer);
  const translations = document
    .createAccessor("idle-values")
    .setType("VEC3")
    .setArray(new Float32Array([0, 0, 0, 0.1, 0, 0]))
    .setBuffer(buffer);
  const sampler = document
    .createAnimationSampler()
    .setInput(times)
    .setOutput(translations)
    .setInterpolation("LINEAR");
  const channel = document
    .createAnimationChannel()
    .setSampler(sampler)
    .setTargetNode(node)
    .setTargetPath("translation");
  document.createAnimation("idle").addSampler(sampler).addChannel(channel);

  return new NodeIO().writeBinary(document);
}

test("asset inspector reports validity, dimensions, transforms, animation, material, texture, and triangles", async () => {
  const bytes = await createFixtureGlb();
  const report = await inspectGlbBytes(bytes, passingBudget, "fixture.glb");

  assert.equal(
    report.pass,
    true,
    JSON.stringify({ issues: report.issues, validator: report.validator, nodes: report.nodes }),
  );
  assert.equal(report.validator.errors, 0);
  assert.deepEqual(report.scene.dimensionsMeters, [1, 1, 0]);
  assert.equal(report.scene.visibleTriangles, 1);
  assert.equal(report.scene.drawCalls, 1);
  assert.equal(report.transforms.nodes, 1);
  assert.deepEqual(report.nodes, ["ObservatoryShell"]);
  assert.deepEqual(
    report.animations.map((animation) => animation.name),
    ["idle"],
  );
  assert.deepEqual(report.materials, ["NaturalMaterial"]);
  assert.deepEqual(
    report.textures.map((texture) => [texture.name, texture.width, texture.height]),
    [["NaturalTexture", 1, 1]],
  );
});

test("asset gate rejects contract, transform, and declared budget violations", async () => {
  const bytes = await createFixtureGlb({ negativeScale: true });
  const report = await inspectGlbBytes(bytes, {
    ...passingBudget,
    expectedDimensionsMeters: [0.25, 0.25, 0.25],
    expectedNodes: ["RequiredNode"],
    expectedAuthoredClips: ["required-clip"],
    maxTriangles: 0,
    maxMaterials: 0,
    maxTexturePx: 0,
    maxFileBytes: 1,
  });
  const issueCodes = new Set(report.issues.map((issue) => issue.code));

  assert.equal(report.pass, false);
  assert.equal(issueCodes.has("MISSING_REQUIRED_NODE"), true);
  assert.equal(issueCodes.has("MISSING_REQUIRED_CLIP"), true);
  assert.equal(issueCodes.has("NEGATIVE_SCALE"), true);
  assert.equal(issueCodes.has("TRIANGLE_BUDGET_EXCEEDED"), true);
  assert.equal(issueCodes.has("MATERIAL_BUDGET_EXCEEDED"), true);
  assert.equal(issueCodes.has("TEXTURE_BUDGET_EXCEEDED"), true);
  assert.equal(issueCodes.has("GLB_FILE_BUDGET_EXCEEDED"), true);
  assert.equal(issueCodes.has("DIMENSION_BUDGET_EXCEEDED"), true);
});

test("Meshopt optimization is deterministic and retains the asset contract", async () => {
  const bytes = await createFixtureGlb();
  const first = await optimizeGlbBytes(bytes, passingBudget);
  const second = await optimizeGlbBytes(bytes, passingBudget);
  const digest = (value: Uint8Array) => createHash("sha256").update(value).digest("hex");

  assert.equal(
    first.inspection.pass,
    true,
    JSON.stringify({
      issues: first.inspection.issues,
      validator: first.inspection.validator,
      nodes: first.inspection.nodes,
    }),
  );
  assert.equal(first.inspection.extensions.includes("EXT_meshopt_compression"), true);
  assert.equal(digest(first.output), digest(second.output));
});

test("variant metadata proves input, output, toolchain, and byte-for-byte regeneration", async (t) => {
  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), "portfolio-glb-pipeline-"));
  t.after(async () => rm(temporaryDirectory, { recursive: true, force: true }));
  const inputPath = path.join(temporaryDirectory, "source.glb");
  const outputPath = path.join(temporaryDirectory, "variant.glb");
  await writeFile(inputPath, await createFixtureGlb());

  const created = await createCompressedVariant({ inputPath, outputPath, budget: passingBudget });
  const metadata = JSON.parse(
    await readFile(`${outputPath}.pipeline.json`, "utf8"),
  ) as typeof created.metadata;
  const verification = await verifyCompressedVariant({
    inputPath,
    outputPath,
    budget: passingBudget,
  });

  assert.equal(metadata.pipeline.name, ASSET_PIPELINE.name);
  assert.equal(metadata.output.sha256, created.metadata.output.sha256);
  assert.equal(verification.pass, true, verification.failures.join(", "));
});

test("current rights-gated registry has no public model files to inspect", async () => {
  assert.deepEqual(await inspectPublishedRegistryAssets(), []);
});
