import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  getObservatoryAsset,
  observatoryAssetRegistry,
  observatoryAssetsById,
} from "@/lib/three/asset-registry";
import {
  observatoryAssetRegistrySchema,
  observatoryAssetIds,
  threeMaterialRoles,
  type ObservatoryAssetRegistry,
} from "@/lib/three/asset-registry-schema";
import { threeMaterialPalette } from "@/styles/palette";

const workspaceRoot = process.cwd();

test("runtime registry covers every provider-neutral manifest asset", () => {
  assert.equal(observatoryAssetRegistrySchema.safeParse(observatoryAssetRegistry).success, true);

  const manifest = JSON.parse(
    readFileSync(
      path.resolve(workspaceRoot, "../docs/assets/observatory-3d-manifest.json"),
      "utf8",
    ),
  ) as { assets: Array<{ id: string; lods: number }> };

  assert.deepEqual(
    observatoryAssetRegistry.assets.map((asset) => asset.id).sort(),
    manifest.assets.map((asset) => asset.id).sort(),
  );
  assert.deepEqual(Object.keys(observatoryAssetsById).sort(), [...observatoryAssetIds].sort());

  for (const asset of observatoryAssetRegistry.assets) {
    const manifestAsset = manifest.assets.find((candidate) => candidate.id === asset.id);
    assert.equal(
      asset.lods.length,
      manifestAsset?.lods,
      `${asset.id} LOD count must match manifest`,
    );
  }
});

test("unapproved models expose no URL and every fallback resolves locally", () => {
  for (const asset of observatoryAssetRegistry.assets) {
    assert.equal(asset.provenance.approvedForPublicRuntime, false);
    assert.equal(
      asset.lods.every((lod) => lod.url === null),
      true,
    );

    const fallbackPath = path.join(workspaceRoot, "public", asset.fallback.posterUrl.slice(1));
    assert.equal(existsSync(fallbackPath), true, `${asset.id} fallback poster must exist`);
  }
});

test("registry maps nodes, clips, materials, interactions, provenance, and loading priority", () => {
  assert.deepEqual(Object.keys(threeMaterialPalette).sort(), [...threeMaterialRoles].sort());

  for (const asset of observatoryAssetRegistry.assets) {
    assert.ok(asset.nodes.length >= 1);
    assert.ok(asset.lods.length >= 1);
    assert.ok(asset.provenance.manifestPath.endsWith("observatory-3d-manifest.json"));
    assert.ok(["hero-critical", "deferred", "on-demand"].includes(asset.loadingPriority));

    for (const material of asset.materials) {
      assert.ok(material in threeMaterialPalette);
    }

    if (asset.interaction?.href) {
      assert.equal(asset.interaction.href.startsWith("/"), true);
      assert.equal(asset.fallback.domHref, asset.interaction.href);
    }
  }

  assert.equal(getObservatoryAsset("robot-guide").interaction?.action, "overview");
  assert.equal(getObservatoryAsset("sound-lab").fallback.domHref, "/sound");
});

test("schema rejects a public model URL before provenance approval", () => {
  const unsafeRegistry = structuredClone(observatoryAssetRegistry) as ObservatoryAssetRegistry;
  unsafeRegistry.assets[0]!.lods[0]!.url = "/models/unapproved.glb";

  const result = observatoryAssetRegistrySchema.safeParse(unsafeRegistry);
  assert.equal(result.success, false);

  if (!result.success) {
    assert.match(
      result.error.issues.map((issue) => issue.message).join("\n"),
      /Unapproved assets cannot expose a public runtime URL/,
    );
  }
});

test("schema requires an explicit rights approval and attribution for a public model", () => {
  const candidateRegistry = structuredClone(observatoryAssetRegistry) as ObservatoryAssetRegistry;
  const candidate = candidateRegistry.assets[0]!;
  candidate.lods[0]!.url = "/models/observatory-shell.glb";
  candidate.provenance.approvedForPublicRuntime = true;

  const pendingResult = observatoryAssetRegistrySchema.safeParse(candidateRegistry);
  assert.equal(pendingResult.success, false);

  if (!pendingResult.success) {
    assert.match(
      pendingResult.error.issues.map((issue) => issue.message).join("\n"),
      /Public runtime approval requires an approved or not-applicable rights state/,
    );
  }

  candidate.provenance.rightsState = "approved";
  candidate.provenance.copyrightOwner = "Carlos Carpio";
  candidate.provenance.license = "All rights reserved";

  assert.equal(observatoryAssetRegistrySchema.safeParse(candidateRegistry).success, true);
});
