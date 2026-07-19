import type { ObservatoryAsset, ObservatoryAssetId } from "./asset-registry-schema";
import type { SceneGroupId, SceneQualityTier } from "./scene-config";
import { SCENE_GROUPS } from "./scene-config";
import type { ObservatorySceneState } from "./scene-state";

export type ProgressiveAssetEntry = {
  assetId: ObservatoryAssetId;
  url: string;
  lodLevel: number;
  groupId: SceneGroupId;
  priority: "hero-critical" | "deferred" | "on-demand";
  interactionTargetId: string | null;
};

export type ProgressiveLoadPlan = {
  quality: SceneQualityTier;
  heroCritical: readonly ProgressiveAssetEntry[];
  deferred: readonly ProgressiveAssetEntry[];
  onDemand: readonly ProgressiveAssetEntry[];
  missingHeroCritical: readonly ObservatoryAssetId[];
  canMountCanvas: boolean;
};

function findGroupId(assetId: ObservatoryAssetId): SceneGroupId {
  const group = Object.values(SCENE_GROUPS).find((candidate) =>
    (candidate.assetIds as readonly ObservatoryAssetId[]).includes(assetId),
  );
  if (!group) throw new Error(`No scene group owns Observatory asset: ${assetId}`);
  return group.id;
}

function selectLod(asset: ObservatoryAsset, quality: SceneQualityTier) {
  if (quality === "static") return null;
  const candidates = quality === "full" ? asset.lods : [...asset.lods].reverse();
  return candidates.find((lod) => lod.url !== null) ?? null;
}

export function buildProgressiveLoadPlan(
  assets: readonly ObservatoryAsset[],
  quality: SceneQualityTier,
): ProgressiveLoadPlan {
  const entries: ProgressiveAssetEntry[] = [];
  const missingHeroCritical: ObservatoryAssetId[] = [];

  for (const asset of assets) {
    if (asset.kind !== "model") continue;
    const lod = selectLod(asset, quality);

    if (!lod) {
      if (asset.loadingPriority === "hero-critical") missingHeroCritical.push(asset.id);
      continue;
    }

    entries.push({
      assetId: asset.id,
      url: lod.url!,
      lodLevel: lod.level,
      groupId: findGroupId(asset.id),
      priority: asset.loadingPriority,
      interactionTargetId: asset.interaction?.targetId ?? null,
    });
  }

  return {
    quality,
    heroCritical: entries.filter((entry) => entry.priority === "hero-critical"),
    deferred: entries.filter((entry) => entry.priority === "deferred"),
    onDemand: entries.filter((entry) => entry.priority === "on-demand"),
    missingHeroCritical,
    canMountCanvas: quality !== "static" && missingHeroCritical.length === 0,
  };
}

export function findOnDemandEntry(plan: ProgressiveLoadPlan, interactionTargetId: string | null) {
  if (!interactionTargetId) return null;
  return plan.onDemand.find((entry) => entry.interactionTargetId === interactionTargetId) ?? null;
}

export function describeProgressiveSceneStatus(
  scene: ObservatorySceneState,
  plan: ProgressiveLoadPlan,
) {
  if (scene.capabilities.webgl2 === "unknown") {
    return "Poster mode · checking device support";
  }
  if (scene.capabilities.webgl2 === "unsupported") {
    return "Poster mode · interactive scene unavailable";
  }
  if (scene.quality.tier === "static") {
    return "Poster mode · optimized for this device";
  }
  if (plan.missingHeroCritical.length > 0) {
    return "Poster mode · immersive assets awaiting approval";
  }
  if (scene.loading.lifecycle === "preparing") {
    const total = Math.max(scene.loading.total, 1);
    return `Preparing Observatory · ${Math.min(scene.loading.loaded, total)} of ${total}`;
  }
  if (scene.loading.lifecycle === "error" || scene.loading.lifecycle === "context-lost") {
    return "Poster mode · interactive scene could not be prepared";
  }
  if (scene.loading.lifecycle === "ready") {
    return "Interactive Observatory prepared behind the poster";
  }
  return "Poster mode · immersive scene ready to prepare";
}
