import { AnimationClip, BoxGeometry, Group, Mesh, MeshBasicMaterial, SphereGeometry } from "three";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";

import { getObservatoryAsset, observatoryAssetRegistry } from "@/lib/three/asset-registry";
import {
  observatoryAssetRegistrySchema,
  type ObservatoryAssetRegistry,
} from "@/lib/three/asset-registry-schema";
import { GltfAssetLoadError, type GltfLoadingAttemptFactory } from "@/lib/three/gltf-runtime";
import type { GltfLoadingSnapshot } from "@/lib/three/gltf-loading-state";

export const OBSERVATORY_TEST_ASSET_ROOT = "/three/test";

export function createObservatoryTestRegistry(): ObservatoryAssetRegistry {
  // The production robot is runtime-authored, but the imported-model loading
  // path must stay covered for a future sculpted rights-cleared GLB, so the
  // test registry deliberately keeps the robot as a URL-loaded model double.
  return observatoryAssetRegistrySchema.parse({
    ...observatoryAssetRegistry,
    assets: observatoryAssetRegistry.assets.map((asset) =>
      asset.kind === "model" || asset.id === "robot-guide"
        ? {
            ...asset,
            kind: "model",
            status: "specified",
            lods: asset.lods.map((lod) => ({
              ...lod,
              url: `${OBSERVATORY_TEST_ASSET_ROOT}/${asset.id}-lod-${lod.level}.glb`,
            })),
            provenance: {
              ...asset.provenance,
              owner: "Repository test suite",
              sourceDescription: "Repository-only deterministic synthetic GLB test double",
              author: "Repository test suite",
              copyrightOwner: null,
              license: null,
              termsSnapshot: null,
              rightsState: "not-applicable",
              approvedForPublicRuntime: true,
            },
          }
        : asset,
    ),
  });
}

function assetIdFromUrl(url: string) {
  return observatoryAssetRegistry.assets.find((asset) => url.includes(`/${asset.id}-lod-`))?.id;
}

export function createObservatoryTestGltf(url: string): GLTF {
  const scene = new Group();
  scene.name = `TestDouble:${url.split("/").at(-1) ?? "asset"}`;
  scene.userData = { testDouble: true, sourceUrl: url };
  const assetId = assetIdFromUrl(url);
  const asset = assetId ? getObservatoryAsset(assetId) : null;
  let animations: AnimationClip[] = [];

  if (asset?.id === "robot-guide") {
    const root = new Group();
    root.name = "RobotRoot";

    const body = new Group();
    body.name = "RobotBody";
    body.position.y = 0.8;
    body.add(new Mesh(new BoxGeometry(0.72, 1.2, 0.54), new MeshBasicMaterial()));

    const head = new Group();
    head.name = "RobotHead";
    head.position.y = 1.52;
    head.add(new Mesh(new SphereGeometry(0.28, 8, 6), new MeshBasicMaterial()));

    const handContact = new Group();
    handContact.name = "RobotHandContact";
    handContact.position.set(-0.54, 0.06, 0.34);

    const interaction = new Group();
    interaction.name = "RobotInteraction";
    interaction.position.set(0, 1.05, 0.08);

    root.add(body, head, handContact, interaction);
    scene.add(root);
    animations = asset.clips.map((clip) => new AnimationClip(clip.id, 1, []));
  }

  return {
    scene,
    scenes: [scene],
    animations,
    cameras: [],
    asset: { generator: "portfolio-observatory-test-double", version: "2.0" },
    parser: {},
    userData: { testDouble: true, sourceUrl: url },
  } as unknown as GLTF;
}

export type ObservatoryGltfAttemptDoubleOptions = {
  failUrls?: readonly string[];
  createAsset?: (url: string) => GLTF;
};

export function createObservatoryGltfAttemptDouble({
  failUrls = [],
  createAsset = createObservatoryTestGltf,
}: ObservatoryGltfAttemptDoubleOptions = {}) {
  const failures = new Set(failUrls);
  const requestedUrls: string[] = [];
  let attemptCount = 0;
  let abortCount = 0;

  const createLoadingAttempt: GltfLoadingAttemptFactory = () => {
    attemptCount += 1;
    let used = false;
    let aborted = false;
    let snapshot: GltfLoadingSnapshot = { status: "idle", loaded: 0, total: 0, url: null };
    const listeners = new Set<(value: GltfLoadingSnapshot) => void>();
    const publish = (value: GltfLoadingSnapshot) => {
      snapshot = value;
      listeners.forEach((listener) => listener(value));
    };

    return {
      getSnapshot: () => snapshot,
      subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      abort() {
        aborted = true;
        abortCount += 1;
      },
      async load(urls) {
        if (used) throw new Error("Create a new test loading attempt before retrying.");
        if (urls.length === 0) throw new Error("A test loading attempt needs at least one URL.");
        if (aborted) throw new DOMException("The test loading attempt was aborted.", "AbortError");
        used = true;

        const assets: GLTF[] = [];
        for (const [index, url] of urls.entries()) {
          requestedUrls.push(url);
          publish({ status: "loading", loaded: index, total: urls.length, url });
          if (failures.has(url)) {
            publish({ status: "error", loaded: index, total: urls.length, url });
            throw new GltfAssetLoadError(url);
          }
          assets.push(createAsset(url));
        }

        publish({ status: "ready", loaded: urls.length, total: urls.length, url: null });
        return assets;
      },
    };
  };

  return {
    createLoadingAttempt,
    requestedUrls,
    get attemptCount() {
      return attemptCount;
    },
    get abortCount() {
      return abortCount;
    },
  };
}
