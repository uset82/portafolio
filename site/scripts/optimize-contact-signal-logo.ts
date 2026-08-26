import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { Logger, NodeIO, Verbosity } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  dedup,
  getGLPrimitiveCount,
  meshopt,
  prune,
  simplify,
  weld,
} from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";

const workspaceRoot = path.resolve(process.cwd(), "..");
const sourcePath = path.join(workspaceRoot, "imagesandvideo", "logo.glb");
const outputPath = path.join(
  workspaceRoot,
  "site",
  "public",
  "images",
  "brand",
  "ca2m-logo-signal.glb",
);

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

  return {
    bytes: bytes.byteLength,
    extensions: document
      .getRoot()
      .listExtensionsUsed()
      .map((extension) => extension.extensionName),
    sha256: sha256(bytes),
    textures: document.getRoot().listTextures().length,
    visibleTriangles,
  };
}

async function main() {
  if (process.argv.includes("--inspect")) {
    console.log(JSON.stringify(await inspectLogo(outputPath), null, 2));
    return;
  }
  if ((await exists(outputPath)) && !process.argv.includes("--force")) {
    throw new Error(
      `Refusing to overwrite existing logo derivative: ${outputPath}\nPass --force to regenerate it.`,
    );
  }

  const input = new Uint8Array(await readFile(sourcePath));
  const io = await createIo();
  const document = await io.readBinary(input);
  document.setLogger(new Logger(Verbosity.SILENT));

  // Every texture goes. The contact signal re-strikes this mark in a single
  // palette tone at render time, so the authored copper base colour and its
  // metal/roughness maps are never sampled. The normal map goes with them, and
  // that is the important one: it was baked against the 1.5M-triangle original,
  // so on a decimated mesh it describes a surface that is no longer there and
  // shades the strokes into wax.
  //
  // Those maps were 1.49 MB of a 1.72 MB file. Spent on triangles instead, the
  // same budget buys a mark with edges.
  for (const material of document.getRoot().listMaterials()) {
    material.setBaseColorTexture(null);
    material.setNormalTexture(null);
    material.setMetallicRoughnessTexture(null);
    material.setOcclusionTexture(null);
    material.setEmissiveTexture(null);
  }

  await document.transform(
    dedup({ keepUniqueNames: true }),
    weld(),
    // CA²M is thin strokes, sharp counters and fine bevels, and an early pass at
    // ratio 0.015 with a 2% error tolerance rounded all of it off. The correction
    // to that overshot: at ratio 0.06 the quota, not the error, is what stopped
    // the simplifier — 1.5M triangles times 0.06 is exactly the 89,998 it
    // produced, so it never reached the 0.004 it was allowed and the budget was
    // never tested against anything.
    //
    // Tested, it is far too large. The mark is drawn into 162 CSS pixels on the
    // story plate, and the renderer caps device pixel ratio at 1.5, so 243 pixels
    // is the most it ever occupies — 89,998 triangles is three of them per pixel.
    // Rendered through the shipped scene and compared pixel by pixel against that
    // derivative, this ratio differs by a mean of 2.6/255, and by 2.5/255 when
    // both are drawn at 420 pixels instead. Holding steady as the render grows is
    // the part that matters: the residual is a slight shift in where the specular
    // highlights fall, not a silhouette coming apart, which is the failure the
    // 2% pass had. Below roughly 10K the error tolerance becomes binding and the
    // curve flattens, so there is little left to win by cutting further.
    //
    // 808 KB to 198 KB. On the story route the model is fetched while the visitor
    // is still reading, and that is the budget which decides whether it arrives
    // before they scroll to it.
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.012, error: 0.002 }),
    prune({
      keepAttributes: false,
      keepExtras: true,
      keepLeaves: false,
      keepSolidTextures: false,
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
    error instanceof Error ? error.message : "Unable to optimize the contact signal logo.",
  );
  process.exitCode = 1;
});
