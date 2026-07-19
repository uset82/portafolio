import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  ImageUtils,
  Logger,
  NodeIO,
  Verbosity,
  type Document,
  type Node,
  type Scene,
} from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  dedup,
  getBounds,
  getGLPrimitiveCount,
  inspect,
  meshopt,
  prune,
  resample,
} from "@gltf-transform/functions";
import draco3d from "draco3dgltf";
import { validateBytes, type ValidationMessage } from "gltf-validator";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";
import { z } from "zod";

import { getObservatoryAsset, observatoryAssetRegistry } from "@/lib/three/asset-registry";
import {
  observatoryAssetIdSchema,
  type ObservatoryAssetId,
} from "@/lib/three/asset-registry-schema";

const manifestSchema = z
  .object({
    assets: z.array(
      z
        .object({
          id: observatoryAssetIdSchema,
          budget: z
            .object({
              triangles: z.number().int().nonnegative(),
              materials: z.number().int().nonnegative(),
              textureMaxPx: z.number().int().nonnegative(),
              glbMb: z.number().nonnegative(),
            })
            .strict(),
        })
        .passthrough(),
    ),
  })
  .passthrough();

export const ASSET_PIPELINE = {
  version: 1,
  name: "observatory-meshopt-v1",
  gltfTransform: "4.4.1",
  gltfValidator: "2.0.0-dev.3.10",
  draco3d: "1.5.7",
  meshoptimizer: "1.2.0",
  meshoptLevel: "medium",
} as const;

export type AssetBudget = {
  assetId: ObservatoryAssetId;
  lod: number;
  expectedDimensionsMeters: readonly [number, number, number];
  expectedNodes: readonly string[];
  expectedAuthoredClips: readonly string[];
  maxTriangles: number;
  maxMaterials: number;
  maxTexturePx: number;
  maxFileBytes: number;
};

export type AssetGateIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
};

export type AssetInspection = {
  version: 1;
  assetId: ObservatoryAssetId;
  lod: number;
  source: string;
  sha256: string;
  fileBytes: number;
  validator: {
    errors: number;
    warnings: number;
    infos: number;
    hints: number;
    messages: Array<
      Pick<ValidationMessage, "code" | "message" | "severity"> & { pointer: string | null }
    >;
  };
  scene: {
    scenes: number;
    dimensionsMeters: [number, number, number];
    visibleTriangles: number;
    drawCalls: number;
  };
  transforms: {
    nodes: number;
    translated: number;
    rotated: number;
    scaled: number;
    negativeScale: number;
    zeroScale: number;
  };
  nodes: string[];
  animations: Array<{ name: string; channels: number; keyframes: number; durationSeconds: number }>;
  materials: string[];
  textures: Array<{
    name: string;
    mimeType: string;
    width: number | null;
    height: number | null;
    bytes: number;
    estimatedVramBytes: number | null;
  }>;
  extensions: string[];
  budget: {
    maxTriangles: number;
    maxMaterials: number;
    maxTexturePx: number;
    maxFileBytes: number;
  };
  issues: AssetGateIssue[];
  pass: boolean;
};

export type VariantMetadata = {
  version: 1;
  pipeline: typeof ASSET_PIPELINE;
  assetId: ObservatoryAssetId;
  lod: number;
  input: { file: string; sha256: string; bytes: number };
  output: { file: string; sha256: string; bytes: number };
  inspection: { pass: boolean; errors: number; warnings: number; extensions: string[] };
};

let ioPromise: Promise<NodeIO> | null = null;

async function createNodeIo() {
  await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
  const [dracoDecoder, dracoEncoder] = await Promise.all([
    draco3d.createDecoderModule(),
    draco3d.createEncoderModule(),
  ]);

  return new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    "draco3d.decoder": dracoDecoder,
    "draco3d.encoder": dracoEncoder,
    "meshopt.decoder": MeshoptDecoder,
    "meshopt.encoder": MeshoptEncoder,
  });
}

function getNodeIo() {
  ioPromise ??= createNodeIo();
  return ioPromise;
}

function sha256(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

function roundMetric(value: number) {
  return Number(value.toFixed(4));
}

function vectorIs(value: readonly number[], expected: readonly number[]) {
  return value.every((entry, index) => Math.abs(entry - (expected[index] ?? 0)) <= 1e-6);
}

function getTransformMetrics(nodes: readonly Node[]) {
  const metrics = {
    nodes: nodes.length,
    translated: 0,
    rotated: 0,
    scaled: 0,
    negativeScale: 0,
    zeroScale: 0,
  };

  nodes.forEach((node) => {
    const translation = node.getTranslation();
    const rotation = node.getRotation();
    const scale = node.getScale();

    if (!vectorIs(translation, [0, 0, 0])) metrics.translated += 1;
    if (!vectorIs(rotation, [0, 0, 0, 1])) metrics.rotated += 1;
    if (!vectorIs(scale, [1, 1, 1])) metrics.scaled += 1;
    if (scale.some((entry) => entry < 0)) metrics.negativeScale += 1;
    if (scale.some((entry) => Math.abs(entry) <= 1e-8)) metrics.zeroScale += 1;
  });

  return metrics;
}

function countNodeGeometry(node: Node) {
  const mesh = node.getMesh();
  if (!mesh) return { triangles: 0, drawCalls: 0 };

  return mesh.listPrimitives().reduce(
    (total, primitive) => {
      const mode = primitive.getMode();
      if (mode === 4 || mode === 5 || mode === 6) {
        total.triangles += getGLPrimitiveCount(primitive);
      }
      total.drawCalls += 1;
      return total;
    },
    { triangles: 0, drawCalls: 0 },
  );
}

function getSceneGeometry(scene: Scene) {
  const result = { triangles: 0, drawCalls: 0 };
  scene.traverse((node) => {
    const nodeGeometry = countNodeGeometry(node);
    result.triangles += nodeGeometry.triangles;
    result.drawCalls += nodeGeometry.drawCalls;
  });
  return result;
}

function getSceneMetrics(document: Document) {
  const scenes = document.getRoot().listScenes();
  const bounds = scenes.map((scene) => getBounds(scene));
  const validBounds = bounds.filter((bound) =>
    [...bound.min, ...bound.max].every((entry) => Number.isFinite(entry)),
  );

  const min = [0, 0, 0];
  const max = [0, 0, 0];
  if (validBounds.length > 0) {
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(...validBounds.map((bound) => bound.min[axis] ?? 0));
      max[axis] = Math.max(...validBounds.map((bound) => bound.max[axis] ?? 0));
    }
  }

  const geometry = scenes.map(getSceneGeometry);
  return {
    scenes: scenes.length,
    dimensionsMeters: [
      roundMetric((max[0] ?? 0) - (min[0] ?? 0)),
      roundMetric((max[1] ?? 0) - (min[1] ?? 0)),
      roundMetric((max[2] ?? 0) - (min[2] ?? 0)),
    ] as [number, number, number],
    visibleTriangles: Math.max(0, ...geometry.map((entry) => entry.triangles)),
    drawCalls: Math.max(0, ...geometry.map((entry) => entry.drawCalls)),
  };
}

function addBudgetIssues(
  issues: AssetGateIssue[],
  inspection: Pick<
    AssetInspection,
    "fileBytes" | "scene" | "materials" | "textures" | "transforms"
  >,
  budget: AssetBudget,
) {
  if (inspection.fileBytes > budget.maxFileBytes) {
    issues.push({
      severity: "error",
      code: "GLB_FILE_BUDGET_EXCEEDED",
      message: `${inspection.fileBytes} bytes exceeds the ${budget.maxFileBytes}-byte GLB budget`,
    });
  }
  if (inspection.scene.visibleTriangles > budget.maxTriangles) {
    issues.push({
      severity: "error",
      code: "TRIANGLE_BUDGET_EXCEEDED",
      message: `${inspection.scene.visibleTriangles} visible triangles exceeds the ${budget.maxTriangles}-triangle LOD budget`,
    });
  }
  if (inspection.materials.length > budget.maxMaterials) {
    issues.push({
      severity: "error",
      code: "MATERIAL_BUDGET_EXCEEDED",
      message: `${inspection.materials.length} materials exceeds the ${budget.maxMaterials}-material budget`,
    });
  }

  inspection.textures.forEach((texture) => {
    if (texture.width === null || texture.height === null) {
      issues.push({
        severity: "error",
        code: "TEXTURE_DIMENSIONS_UNKNOWN",
        message: `${texture.name} does not expose inspectable dimensions`,
      });
      return;
    }
    if (Math.max(texture.width, texture.height) > budget.maxTexturePx) {
      issues.push({
        severity: "error",
        code: "TEXTURE_BUDGET_EXCEEDED",
        message: `${texture.name} is ${texture.width}×${texture.height}, above the ${budget.maxTexturePx}px limit`,
      });
    }
  });

  inspection.scene.dimensionsMeters.forEach((dimension, axis) => {
    const expected = budget.expectedDimensionsMeters[axis] ?? 0;
    if (expected > 0 && dimension > expected * 1.1) {
      issues.push({
        severity: "error",
        code: "DIMENSION_BUDGET_EXCEEDED",
        message: `Axis ${axis} measures ${dimension}m, above the ${roundMetric(expected * 1.1)}m tolerance`,
      });
    }
  });

  if (inspection.transforms.negativeScale > 0) {
    issues.push({
      severity: "error",
      code: "NEGATIVE_SCALE",
      message: `${inspection.transforms.negativeScale} node transforms use negative scale`,
    });
  }
  if (inspection.transforms.zeroScale > 0) {
    issues.push({
      severity: "error",
      code: "ZERO_SCALE",
      message: `${inspection.transforms.zeroScale} node transforms use a zero scale axis`,
    });
  }
}

export async function loadAssetBudget(
  assetId: ObservatoryAssetId,
  lod: number,
  repositoryRoot = path.resolve(process.cwd(), ".."),
): Promise<AssetBudget> {
  const manifestPath = path.join(repositoryRoot, "docs/assets/observatory-3d-manifest.json");
  const manifest = manifestSchema.parse(JSON.parse(await readFile(manifestPath, "utf8")));
  const manifestAsset = manifest.assets.find((asset) => asset.id === assetId);
  const registryAsset = getObservatoryAsset(assetId);
  const registryLod = registryAsset.lods[lod];

  if (!manifestAsset || !registryLod) {
    throw new Error(`No declared 3D budget exists for ${assetId} LOD ${lod}.`);
  }

  return {
    assetId,
    lod,
    expectedDimensionsMeters: registryAsset.scaleMeters,
    expectedNodes: registryAsset.nodes,
    expectedAuthoredClips: registryAsset.clips
      .filter((clip) => clip.required && clip.source === "authored")
      .map((clip) => clip.id),
    maxTriangles: registryLod.maxTriangles,
    maxMaterials: manifestAsset.budget.materials,
    maxTexturePx: manifestAsset.budget.textureMaxPx,
    maxFileBytes: Math.round(manifestAsset.budget.glbMb * 1024 * 1024),
  };
}

export async function inspectGlbBytes(
  bytes: Uint8Array,
  budget: AssetBudget,
  source = "candidate.glb",
): Promise<AssetInspection> {
  const validation = await validateBytes(bytes, {
    uri: source,
    format: "glb",
    maxIssues: 0,
    writeTimestamp: false,
  });
  const document = await (await getNodeIo()).readBinary(bytes);
  const root = document.getRoot();
  const scene = getSceneMetrics(document);
  const transforms = getTransformMetrics(root.listNodes());
  const nodeNames = root
    .listNodes()
    .map((node) => node.getName())
    .sort();
  const animationReport = inspect(document)
    .animations.properties.map((animation) => ({
      name: animation.name,
      channels: animation.channels,
      keyframes: animation.keyframes,
      durationSeconds: roundMetric(animation.duration),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const materials = root
    .listMaterials()
    .map((material) => material.getName())
    .sort();
  const textures = root
    .listTextures()
    .map((texture) => {
      const image = texture.getImage();
      const mimeType = texture.getMimeType();
      const size = image ? ImageUtils.getSize(image, mimeType) : null;
      return {
        name: texture.getName() || texture.getURI() || "unnamed-texture",
        mimeType,
        width: size?.[0] ?? null,
        height: size?.[1] ?? null,
        bytes: image?.byteLength ?? 0,
        estimatedVramBytes: image ? ImageUtils.getVRAMByteLength(image, mimeType) : null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  const extensions = root
    .listExtensionsUsed()
    .map((extension) => extension.extensionName)
    .sort();
  const issues: AssetGateIssue[] = [];

  if (validation.issues.numErrors > 0) {
    issues.push({
      severity: "error",
      code: "KHRONOS_VALIDATION_FAILED",
      message: `${validation.issues.numErrors} glTF specification errors were reported`,
    });
  }

  budget.expectedNodes.forEach((expectedNode) => {
    if (!nodeNames.includes(expectedNode)) {
      issues.push({
        severity: "error",
        code: "MISSING_REQUIRED_NODE",
        message: `Required node ${expectedNode} is missing`,
      });
    }
  });
  budget.expectedAuthoredClips.forEach((expectedClip) => {
    if (!animationReport.some((animation) => animation.name === expectedClip)) {
      issues.push({
        severity: "error",
        code: "MISSING_REQUIRED_CLIP",
        message: `Required authored clip ${expectedClip} is missing`,
      });
    }
  });
  if (nodeNames.some((name) => name.length === 0)) {
    issues.push({
      severity: "error",
      code: "UNNAMED_NODE",
      message: "Every exported node must have a stable name",
    });
  }
  if (materials.some((name) => name.length === 0)) {
    issues.push({
      severity: "warning",
      code: "UNNAMED_MATERIAL",
      message: "Every exported material should have a stable name",
    });
  }

  const partialInspection = {
    fileBytes: bytes.byteLength,
    scene,
    transforms,
    materials,
    textures,
  };
  addBudgetIssues(issues, partialInspection, budget);
  issues.sort((a, b) => a.code.localeCompare(b.code) || a.message.localeCompare(b.message));

  return {
    version: 1,
    assetId: budget.assetId,
    lod: budget.lod,
    source,
    sha256: sha256(bytes),
    fileBytes: bytes.byteLength,
    validator: {
      errors: validation.issues.numErrors,
      warnings: validation.issues.numWarnings,
      infos: validation.issues.numInfos,
      hints: validation.issues.numHints,
      messages: validation.issues.messages
        .map((message) => ({
          code: message.code,
          message: message.message,
          severity: message.severity,
          pointer: message.pointer ?? null,
        }))
        .sort((a, b) => a.severity - b.severity || a.code.localeCompare(b.code)),
    },
    scene,
    transforms,
    nodes: nodeNames,
    animations: animationReport,
    materials,
    textures,
    extensions,
    budget: {
      maxTriangles: budget.maxTriangles,
      maxMaterials: budget.maxMaterials,
      maxTexturePx: budget.maxTexturePx,
      maxFileBytes: budget.maxFileBytes,
    },
    issues,
    pass: !issues.some((issue) => issue.severity === "error"),
  };
}

export async function inspectGlbFile(filePath: string, budget: AssetBudget) {
  const bytes = new Uint8Array(await readFile(filePath));
  return inspectGlbBytes(bytes, budget, path.basename(filePath));
}

export async function inspectPublishedRegistryAssets() {
  const reports: AssetInspection[] = [];

  for (const asset of observatoryAssetRegistry.assets) {
    for (const lod of asset.lods) {
      const publicUrl = lod.url as string | null;
      if (!publicUrl) continue;
      const budget = await loadAssetBudget(asset.id, lod.level);
      const filePath = path.join(process.cwd(), "public", publicUrl.slice(1));
      reports.push(await inspectGlbFile(filePath, budget));
    }
  }

  return reports;
}

export async function optimizeGlbBytes(bytes: Uint8Array, budget: AssetBudget) {
  await MeshoptEncoder.ready;
  const io = await getNodeIo();
  const document = await io.readBinary(bytes);
  document.setLogger(new Logger(Verbosity.SILENT));

  await document.transform(
    resample({ cleanup: false }),
    dedup({ keepUniqueNames: true }),
    prune({
      keepAttributes: true,
      keepExtras: true,
      keepLeaves: true,
      keepSolidTextures: true,
    }),
    meshopt({ encoder: MeshoptEncoder, level: ASSET_PIPELINE.meshoptLevel }),
  );

  document
    .getRoot()
    .listNodes()
    .filter((node) => node.getName().length === 0)
    .forEach((node, index) => node.setName(`${budget.assetId}Generated${index + 1}`));

  const output = await io.writeBinary(document);
  const inspection = await inspectGlbBytes(
    output,
    budget,
    `${budget.assetId}-lod${budget.lod}.glb`,
  );
  return { output, inspection };
}

export async function createCompressedVariant(options: {
  inputPath: string;
  outputPath: string;
  metadataPath?: string;
  budget: AssetBudget;
}) {
  const input = new Uint8Array(await readFile(options.inputPath));
  const { output, inspection } = await optimizeGlbBytes(input, options.budget);
  if (!inspection.pass) {
    throw new Error(
      `Optimized asset failed the gate: ${inspection.issues.map((issue) => issue.code).join(", ")}`,
    );
  }

  const metadata: VariantMetadata = {
    version: 1,
    pipeline: ASSET_PIPELINE,
    assetId: options.budget.assetId,
    lod: options.budget.lod,
    input: {
      file: path.basename(options.inputPath),
      sha256: sha256(input),
      bytes: input.byteLength,
    },
    output: {
      file: path.basename(options.outputPath),
      sha256: sha256(output),
      bytes: output.byteLength,
    },
    inspection: {
      pass: inspection.pass,
      errors: inspection.validator.errors,
      warnings: inspection.validator.warnings,
      extensions: inspection.extensions,
    },
  };

  await writeFile(options.outputPath, output);
  await writeFile(
    options.metadataPath ?? `${options.outputPath}.pipeline.json`,
    `${JSON.stringify(metadata, null, 2)}\n`,
    "utf8",
  );

  return { metadata, inspection };
}

export async function verifyCompressedVariant(options: {
  inputPath: string;
  outputPath: string;
  metadataPath?: string;
  budget: AssetBudget;
}) {
  const [input, output, metadataText] = await Promise.all([
    readFile(options.inputPath),
    readFile(options.outputPath),
    readFile(options.metadataPath ?? `${options.outputPath}.pipeline.json`, "utf8"),
  ]);
  const metadata = JSON.parse(metadataText) as VariantMetadata;
  const regenerated = await optimizeGlbBytes(new Uint8Array(input), options.budget);
  const failures: string[] = [];

  if (JSON.stringify(metadata.pipeline) !== JSON.stringify(ASSET_PIPELINE)) {
    failures.push("pipeline-toolchain");
  }
  if (metadata.assetId !== options.budget.assetId || metadata.lod !== options.budget.lod) {
    failures.push("asset-budget-identity");
  }
  if (metadata.input.sha256 !== sha256(input)) failures.push("input-hash");
  if (metadata.input.bytes !== input.byteLength) failures.push("input-bytes");
  if (metadata.output.sha256 !== sha256(output)) failures.push("output-hash");
  if (metadata.output.bytes !== output.byteLength) failures.push("output-bytes");
  if (sha256(regenerated.output) !== sha256(output)) failures.push("reproducible-output-hash");
  if (!regenerated.inspection.pass) failures.push("asset-gate");

  return { pass: failures.length === 0, failures, inspection: regenerated.inspection };
}

export function parseAssetId(value: string) {
  return observatoryAssetIdSchema.parse(value);
}
