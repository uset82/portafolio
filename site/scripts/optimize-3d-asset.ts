import { access, mkdir } from "node:fs/promises";
import path from "node:path";

import {
  createCompressedVariant,
  loadAssetBudget,
  parseAssetId,
  verifyCompressedVariant,
} from "./three/asset-pipeline";

type Arguments = {
  asset?: string;
  input?: string;
  output?: string;
  metadata?: string;
  lod: number;
  force: boolean;
  verify: boolean;
};

function parseArguments(argv: readonly string[]): Arguments {
  const result: Arguments = { lod: 0, force: false, verify: false };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];
    if (argument === "--asset" && value) {
      result.asset = value;
      index += 1;
    } else if (argument === "--input" && value) {
      result.input = value;
      index += 1;
    } else if (argument === "--output" && value) {
      result.output = value;
      index += 1;
    } else if (argument === "--metadata" && value) {
      result.metadata = value;
      index += 1;
    } else if (argument === "--lod" && value) {
      result.lod = Number.parseInt(value, 10);
      index += 1;
    } else if (argument === "--force") {
      result.force = true;
    } else if (argument === "--verify") {
      result.verify = true;
    } else if (argument === "--help") {
      console.log(
        "Usage: pnpm assets:optimize -- --asset <registry-id> --input <source.glb> --output <variant.glb> [--lod <0-2>] [--metadata <file>] [--force]",
      );
      console.log(
        "Verify: pnpm assets:verify-variant -- --asset <registry-id> --input <source.glb> --output <variant.glb> [--metadata <file>]",
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown or incomplete argument: ${argument}`);
    }
  }

  if (!result.asset || !result.input || !result.output) {
    throw new Error("--asset, --input, and --output are required.");
  }
  if (!Number.isInteger(result.lod) || result.lod < 0 || result.lod > 2) {
    throw new Error("--lod must be an integer from 0 through 2.");
  }

  return result;
}

async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const arguments_ = parseArguments(process.argv.slice(2));
  const assetId = parseAssetId(arguments_.asset!);
  const inputPath = path.resolve(arguments_.input!);
  const outputPath = path.resolve(arguments_.output!);
  const metadataPath = arguments_.metadata ? path.resolve(arguments_.metadata) : undefined;
  const resolvedMetadataPath = metadataPath ?? `${outputPath}.pipeline.json`;
  const budget = await loadAssetBudget(assetId, arguments_.lod);
  const paths = { inputPath, outputPath, budget, ...(metadataPath ? { metadataPath } : {}) };

  if (inputPath === outputPath) {
    throw new Error("Input and output must be different files.");
  }
  if (resolvedMetadataPath === inputPath || resolvedMetadataPath === outputPath) {
    throw new Error("Metadata must use a path distinct from the input and output GLBs.");
  }

  if (arguments_.verify) {
    const verification = await verifyCompressedVariant(paths);
    console.log(
      verification.pass
        ? `PASS ${assetId} LOD ${arguments_.lod}: output is byte-reproducible and budget-valid.`
        : `FAIL ${assetId} LOD ${arguments_.lod}: ${verification.failures.join(", ")}`,
    );
    if (!verification.pass) process.exitCode = 1;
    return;
  }

  if (!arguments_.force && ((await exists(outputPath)) || (await exists(resolvedMetadataPath)))) {
    throw new Error(
      "Output or pipeline metadata already exists. Choose another path or pass --force explicitly.",
    );
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await mkdir(path.dirname(resolvedMetadataPath), { recursive: true });
  const result = await createCompressedVariant(paths);
  console.log(
    `PASS ${assetId} LOD ${arguments_.lod}: wrote ${result.metadata.output.bytes} bytes with ${result.metadata.output.sha256}.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "The 3D optimization command failed.");
  process.exitCode = 1;
});
