import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import { observatoryAssetRegistry } from "../src/lib/three/asset-registry";
import { observatoryAssetRegistrySchema } from "../src/lib/three/asset-registry-schema";
import { inspectPublishedRegistryAssets } from "./three/asset-pipeline";

type ManifestAsset = {
  id: string;
  status: string;
  scaleMeters: [number, number, number];
  lods: number;
  budget: {
    triangles: number;
    materials: number;
    textureMaxPx: number;
    glbMb: number;
  };
};

type AssetManifest = {
  version: number;
  units: string;
  coordinateSystem: string;
  sceneBudgets: Record<string, Record<string, number>>;
  assets: ManifestAsset[];
};

const siteRoot = process.cwd();
const repositoryRoot = path.resolve(siteRoot, "..");
const buildRoot = path.join(siteRoot, ".next");

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function collectFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory);
  const files: string[] = [];
  for (const entry of entries) {
    const candidate = path.join(directory, entry);
    if ((await stat(candidate)).isDirectory()) files.push(...(await collectFiles(candidate)));
    else files.push(candidate);
  }
  return files;
}

async function validateAssetContracts() {
  const registry = observatoryAssetRegistrySchema.parse(observatoryAssetRegistry);
  const manifest = JSON.parse(
    await readFile(path.join(repositoryRoot, "docs/assets/observatory-3d-manifest.json"), "utf8"),
  ) as AssetManifest;

  invariant(manifest.version === 1, "The Observatory asset manifest version must be 1.");
  invariant(manifest.units === registry.units, "Manifest and registry units differ.");
  invariant(
    manifest.coordinateSystem === registry.coordinateSystem,
    "Manifest and registry coordinate systems differ.",
  );
  invariant(
    manifest.assets.length === registry.assets.length,
    "Manifest and registry asset counts differ.",
  );

  for (const [tier, budget] of Object.entries(manifest.sceneBudgets)) {
    for (const [name, value] of Object.entries(budget)) {
      invariant(
        Number.isFinite(value) && value >= 0,
        `Scene budget ${tier}.${name} must be a non-negative number.`,
      );
    }
  }

  for (const registryAsset of registry.assets) {
    const manifestAsset = manifest.assets.find((asset) => asset.id === registryAsset.id);
    invariant(manifestAsset, `Manifest is missing asset ${registryAsset.id}.`);
    invariant(
      manifestAsset.status === registryAsset.status,
      `Manifest status differs for ${registryAsset.id}.`,
    );
    invariant(
      JSON.stringify(manifestAsset.scaleMeters) === JSON.stringify(registryAsset.scaleMeters),
      `Manifest scale differs for ${registryAsset.id}.`,
    );
    invariant(
      manifestAsset.lods === registryAsset.lods.length,
      `Manifest LOD count differs for ${registryAsset.id}.`,
    );
    invariant(
      manifestAsset.budget.triangles === registryAsset.lods[0]?.maxTriangles,
      `Manifest triangle budget differs for ${registryAsset.id}.`,
    );
    for (const [name, value] of Object.entries(manifestAsset.budget)) {
      invariant(
        Number.isFinite(value) && value >= 0,
        `Asset budget ${registryAsset.id}.${name} must be a non-negative number.`,
      );
    }
  }

  const reports = await inspectPublishedRegistryAssets();
  const failed = reports.filter((report) => !report.pass);
  invariant(
    failed.length === 0,
    `Published GLB validation failed: ${failed.map((report) => report.assetId).join(", ")}`,
  );

  return { manifestAssets: manifest.assets.length, publicGlbs: reports.length };
}

async function validateClientChunks() {
  const staticRoot = path.join(buildRoot, "static");
  const textFiles = (await collectFiles(staticRoot)).filter((file) =>
    [".css", ".js", ".json", ".map"].includes(path.extname(file)),
  );
  invariant(textFiles.length > 0, "No production client chunks were found.");

  const forbidden = [
    { label: "OpenRouter SDK", pattern: /@openrouter\/sdk/ },
    { label: "OpenRouter key variable", pattern: /OPENROUTER_API_KEY/ },
    { label: "CC AI server enable flag", pattern: /CC_AI_ENABLED/ },
    { label: "OpenRouter key prefix", pattern: /sk-or-(?:v1-)?[a-z0-9_-]{8,}/i },
    { label: "CC AI test model", pattern: /test\/deterministic-model/ },
    { label: "Observatory test URL", pattern: /\/three\/test\// },
    { label: "Observatory test generator", pattern: /portfolio-observatory-test-double/ },
  ];

  for (const file of textFiles) {
    const contents = await readFile(file, "utf8");
    for (const rule of forbidden) {
      invariant(
        !rule.pattern.test(contents),
        `${rule.label} leaked into ${path.relative(siteRoot, file)}.`,
      );
    }
  }

  return textFiles.length;
}

async function validateFallbackRender() {
  const homepagePath = path.join(buildRoot, "server/app/index.html");
  const homepage = await readFile(homepagePath, "utf8");
  const required = [
    '<main id="main-content"',
    "I turn hidden patterns into working systems.",
    "observatory-poster.png",
    "A warm sunlit observatory with a ceramic robot touching a sage-colored water basin",
    "Poster mode · checking device support",
    "<noscript>",
    ".scene-reveal",
    "opacity: 1 !important",
  ];

  required.forEach((token) =>
    invariant(homepage.includes(token), `The built homepage fallback is missing: ${token}`),
  );
  invariant(!/<canvas\b/i.test(homepage), "The prerendered fallback must not contain Canvas.");
  invariant(
    !homepage.includes("observatory-canvas-layer"),
    "The rights-gated prerender must not mount the Canvas layer.",
  );
  invariant(
    homepage.indexOf("observatory-poster.png") <
      homepage.indexOf("Poster mode · checking device support"),
    "The poster must precede the scene status in the prerendered fallback.",
  );
}

async function main() {
  const assetSummary = await validateAssetContracts();
  const clientFiles = await validateClientChunks();
  await validateFallbackRender();
  console.log(
    `Immersive build valid: ${assetSummary.manifestAssets} manifest assets, ${assetSummary.publicGlbs} public GLBs, ${clientFiles} client files, and one semantic poster fallback.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "The immersive build gate failed.");
  process.exitCode = 1;
});
