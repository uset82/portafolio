import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { ImageUtils, Logger, NodeIO, Verbosity } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  dedup,
  getGLPrimitiveCount,
  meshopt,
  prune,
  simplify,
  textureCompress,
  weld,
} from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";

const workspaceRoot = path.resolve(process.cwd(), "..");
const sourcePath = path.join(workspaceRoot, "imagesandvideo", "logo.glb");
const outputPath = path.join(workspaceRoot, "site", "public", "images", "brand", "ca2m-logo.glb");

function sha256(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function createIo() {
  await Promise.all([MeshoptEncoder.ready, MeshoptSimplifier.ready]);
  return new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    "meshopt.decoder": MeshoptDecoder,
    "meshopt.encoder": MeshoptEncoder,
  });
}

async function inspectLogo(filePath: string) {
  const bytes = new Uint8Array(await readFile(filePath));
  const document = await (await createIo()).readBinary(bytes);
  const visibleTriangles = document
    .getRoot()
    .listMeshes()
    .flatMap((mesh) => mesh.listPrimitives())
    .reduce((total, primitive) => total + getGLPrimitiveCount(primitive), 0);
  const textures = document
    .getRoot()
    .listTextures()
    .map((texture) => {
      const image = texture.getImage();
      const size = image ? ImageUtils.getSize(image, texture.getMimeType()) : null;
      return {
        bytes: image?.byteLength ?? 0,
        mimeType: texture.getMimeType(),
        name: texture.getName() || "unnamed-texture",
        size: size ? `${size[0]}x${size[1]}` : null,
      };
    });

  return {
    bytes: bytes.byteLength,
    extensions: document
      .getRoot()
      .listExtensionsUsed()
      .map((extension) => extension.extensionName),
    sha256: sha256(bytes),
    textures,
    visibleTriangles,
  };
}

async function main() {
  if (process.argv.includes("--inspect")) {
    console.log(JSON.stringify(await inspectLogo(outputPath), null, 2));
    return;
  }
  if (await exists(outputPath)) {
    throw new Error(`Refusing to overwrite existing logo derivative: ${outputPath}`);
  }

  const input = new Uint8Array(await readFile(sourcePath));
  const io = await createIo();
  const document = await io.readBinary(input);
  document.setLogger(new Logger(Verbosity.SILENT));

  // This medallion asset occupies only a small portion of the Orbit canvas. A
  // 1.5M-triangle model with three 4K maps is therefore reduced to a 90K-triangle,
  // 1024px PBR derivative while retaining its normal and metal/roughness detail.
  await document.transform(
    dedup({ keepUniqueNames: true }),
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.06, error: 0.012 }),
    textureCompress({ targetFormat: "png", resize: [1024, 1024] }),
    prune({
      keepAttributes: true,
      keepExtras: true,
      keepLeaves: true,
      keepSolidTextures: true,
    }),
    meshopt({ encoder: MeshoptEncoder, level: "medium" }),
  );

  const output = await io.writeBinary(document);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, output);

  console.log(
    JSON.stringify(
      {
        input: { bytes: input.byteLength, sha256: sha256(input) },
        output: await inspectLogo(outputPath),
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Unable to optimize the Project Orbit logo.",
  );
  process.exitCode = 1;
});
