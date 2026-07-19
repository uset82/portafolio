import path from "node:path";

import {
  inspectGlbFile,
  inspectPublishedRegistryAssets,
  loadAssetBudget,
  parseAssetId,
  type AssetInspection,
} from "./three/asset-pipeline";

type Arguments = {
  asset?: string;
  file?: string;
  lod: number;
  json: boolean;
};

function parseArguments(argv: readonly string[]): Arguments {
  const result: Arguments = { lod: 0, json: false };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];
    if (argument === "--asset" && value) {
      result.asset = value;
      index += 1;
    } else if (argument === "--file" && value) {
      result.file = value;
      index += 1;
    } else if (argument === "--lod" && value) {
      result.lod = Number.parseInt(value, 10);
      index += 1;
    } else if (argument === "--json") {
      result.json = true;
    } else if (argument === "--help") {
      console.log(
        "Usage: pnpm assets:check [-- --asset <registry-id> --file <candidate.glb> --lod <0-2> --json]",
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown or incomplete argument: ${argument}`);
    }
  }

  if (!Number.isInteger(result.lod) || result.lod < 0 || result.lod > 2) {
    throw new Error("--lod must be an integer from 0 through 2.");
  }
  if (Boolean(result.asset) !== Boolean(result.file)) {
    throw new Error("--asset and --file must be supplied together.");
  }

  return result;
}

function printSummary(reports: readonly AssetInspection[]) {
  if (reports.length === 0) {
    console.log("3D asset gate ready: 0 public GLB variants; registry assets remain rights-gated.");
    return;
  }

  reports.forEach((report) => {
    console.log(
      `${report.pass ? "PASS" : "FAIL"} ${report.assetId} LOD ${report.lod}: ${report.scene.visibleTriangles} triangles, ${report.materials.length} materials, ${report.textures.length} textures, ${report.fileBytes} bytes`,
    );
    report.issues.forEach((issue) =>
      console.log(`  ${issue.severity}: ${issue.code} — ${issue.message}`),
    );
  });
}

async function main() {
  const arguments_ = parseArguments(process.argv.slice(2));
  let reports: AssetInspection[];

  if (arguments_.asset && arguments_.file) {
    const assetId = parseAssetId(arguments_.asset);
    const budget = await loadAssetBudget(assetId, arguments_.lod);
    reports = [await inspectGlbFile(path.resolve(arguments_.file), budget)];
  } else {
    reports = await inspectPublishedRegistryAssets();
  }

  if (arguments_.json) {
    console.log(JSON.stringify({ version: 1, reports }, null, 2));
  } else {
    printSummary(reports);
  }

  if (reports.some((report) => !report.pass)) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "The 3D asset gate failed.");
  process.exitCode = 1;
});
