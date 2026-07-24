import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";

import { getObservatoryAsset } from "@/lib/three/asset-registry";
import {
  referencePackManifestSchema,
  threeProvenanceRegisterSchema,
} from "@/lib/three/reference-pack-schema";

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

type ReferencePackSummary = {
  sheets: number;
  assets: number;
  provenanceCandidates: number;
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

function formatSchemaIssues(issues: { path: PropertyKey[]; message: string }[]) {
  return issues.map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`).join("\n");
}

function sha256(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex").toUpperCase();
}

function readPngDimensions(bytes: Buffer) {
  const signature = "89504e470d0a1a0a";
  if (
    bytes.length < 24 ||
    bytes.subarray(0, 8).toString("hex") !== signature ||
    bytes.subarray(12, 16).toString("ascii") !== "IHDR"
  ) {
    throw new Error("Reference sheet is not a valid PNG with an IHDR header.");
  }
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function validateReferencePacks(): ReferencePackSummary {
  const workspaceRoot = path.resolve(process.cwd(), "..");
  const manifestPath = path.resolve(
    workspaceRoot,
    "docs/assets/reference-packs/reference-pack-manifest.json",
  );
  const manifestInput: unknown = JSON.parse(readFileSync(manifestPath, "utf8"));
  const result = referencePackManifestSchema.safeParse(manifestInput);
  if (!result.success) {
    throw new Error(
      `Reference-pack manifest is invalid:\n${formatSchemaIssues(result.error.issues)}`,
    );
  }

  const manifest = result.data;
  const promptDocumentPath = path.resolve(workspaceRoot, manifest.promptDocument);
  const promptDocument = readFileSync(promptDocumentPath, "utf8");
  const provenanceRegisterPath = path.resolve(
    workspaceRoot,
    "docs/assets/3d-provenance-register.json",
  );
  const provenanceInput: unknown = JSON.parse(readFileSync(provenanceRegisterPath, "utf8"));
  const provenanceResult = threeProvenanceRegisterSchema.safeParse(provenanceInput);
  if (!provenanceResult.success) {
    throw new Error(
      `3D provenance register is invalid:\n${formatSchemaIssues(provenanceResult.error.issues)}`,
    );
  }
  const provenanceRegister = provenanceResult.data;
  const termsReview = readFileSync(
    path.resolve(workspaceRoot, provenanceRegister.termsReviewPath),
    "utf8",
  );

  const palettePath = path.resolve(workspaceRoot, manifest.paletteReference.path);
  if (sha256(readFileSync(palettePath)) !== manifest.paletteReference.sha256) {
    throw new Error(
      "Reference-pack palette source hash does not match the approved visual reference.",
    );
  }

  manifest.sheets.forEach((sheet) => {
    if (!sheet.file.startsWith("docs/assets/reference-packs/")) {
      throw new Error(`${sheet.id} must remain in the internal reference-pack directory.`);
    }
    const filePath = path.resolve(workspaceRoot, sheet.file);
    const bytes = readFileSync(filePath);
    const dimensions = readPngDimensions(bytes);
    if (statSync(filePath).size !== sheet.bytes) {
      throw new Error(`${sheet.id} byte count does not match its manifest record.`);
    }
    if (sha256(bytes) !== sheet.sha256) {
      throw new Error(`${sheet.id} SHA-256 does not match its manifest record.`);
    }
    if (dimensions.width !== sheet.width || dimensions.height !== sheet.height) {
      throw new Error(`${sheet.id} PNG dimensions do not match its manifest record.`);
    }

    sheet.promptIds.forEach((promptId) => {
      if (!promptDocument.includes(`## ${promptId}\n`)) {
        throw new Error(`${sheet.id} references missing prompt ${promptId}.`);
      }
    });
    sheet.sourceImages.forEach((source) => {
      if (sha256(readFileSync(path.resolve(workspaceRoot, source.path))) !== source.sha256) {
        throw new Error(`${sheet.id} source image ${source.path} has changed.`);
      }
    });
  });

  manifest.assets.forEach((asset) => {
    const runtimeScale = getObservatoryAsset(asset.id).scaleMeters;
    if (runtimeScale.join("|") !== asset.targetScaleMeters.join("|")) {
      throw new Error(`${asset.id} reference scale differs from the runtime registry.`);
    }
  });

  const candidatesBySheet = new Map(
    provenanceRegister.candidates.map((candidate) => [candidate.sheetId, candidate]),
  );
  manifest.sheets.forEach((sheet) => {
    const candidate = candidatesBySheet.get(sheet.id);
    if (!candidate) {
      throw new Error(`${sheet.id} has no provenance candidate record.`);
    }
    if (candidate.file !== sheet.file || candidate.sha256 !== sheet.sha256) {
      throw new Error(`${sheet.id} provenance file or hash differs from its reference manifest.`);
    }
    if (candidate.promptIds.join("|") !== sheet.promptIds.join("|")) {
      throw new Error(`${sheet.id} provenance prompt chain differs from its reference manifest.`);
    }
    candidate.sourceImages.forEach((source) => {
      if (sha256(readFileSync(path.resolve(workspaceRoot, source.path))) !== source.sha256) {
        throw new Error(`${sheet.id} provenance source image ${source.path} has changed.`);
      }
    });
    candidate.terms.snapshotIds.forEach((snapshotId) => {
      if (!termsReview.includes(`\`${snapshotId}\``)) {
        throw new Error(`${sheet.id} references missing terms snapshot ${snapshotId}.`);
      }
    });
  });

  return {
    sheets: manifest.sheets.length,
    assets: manifest.assets.length,
    provenanceCandidates: provenanceRegister.candidates.length,
  };
}

function printSummary(reports: readonly AssetInspection[], referencePacks: ReferencePackSummary) {
  if (reports.length === 0) {
    console.log(
      `3D asset gate ready: 0 public GLB variants; ${referencePacks.sheets} internal reference sheets cover ${referencePacks.assets} rights-gated registry assets with ${referencePacks.provenanceCandidates} complete candidate provenance records.`,
    );
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
  const referencePacks = validateReferencePacks();
  let reports: AssetInspection[];

  if (arguments_.asset && arguments_.file) {
    const assetId = parseAssetId(arguments_.asset);
    const budget = await loadAssetBudget(assetId, arguments_.lod);
    reports = [await inspectGlbFile(path.resolve(arguments_.file), budget)];
  } else {
    reports = await inspectPublishedRegistryAssets();
  }

  if (arguments_.json) {
    console.log(JSON.stringify({ version: 1, referencePacks, reports }, null, 2));
  } else {
    printSummary(reports, referencePacks);
  }

  if (reports.some((report) => !report.pass)) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "The 3D asset gate failed.");
  process.exitCode = 1;
});
