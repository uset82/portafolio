import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { BoxGeometry, Cache, Group, Mesh, MeshStandardMaterial, Texture } from "three";

import { createGltfProgressController } from "@/lib/three/gltf-loading-state";
import { disposeGltfAsset, evictGltfCache } from "@/lib/three/gltf-runtime";

const workspaceRoot = process.cwd();

const decoderAssets = {
  "public/three/decoders/draco/draco_decoder.js":
    "8625489da79a805f4f2a7d511c3e52d8b4085608a9d2a4d5f4f9de5db0aea04f",
  "public/three/decoders/draco/draco_decoder.wasm":
    "a680d927bed9cb864ddbd63521868891af2bfbe755092761b4837487618df8ac",
  "public/three/decoders/draco/draco_wasm_wrapper.js":
    "8bb2952d2ba7d67e1414f8df819410cb0434a666be53f671fff75f68843d76f6",
  "public/three/decoders/basis/basis_transcoder.js":
    "8478b5b6d6b74e7d3082b89f6417321d8d1dc0307f2b30d4484bb11b441696a1",
  "public/three/decoders/basis/basis_transcoder.wasm":
    "6cf17dc889352c42e9acf8897107978d127005fe3386c36a0e3845e27967630a",
} as const;

test("vendored Three.js decoder files exist with pinned hashes", () => {
  for (const [relativePath, expectedHash] of Object.entries(decoderAssets)) {
    const absolutePath = path.join(workspaceRoot, relativePath);
    assert.equal(existsSync(absolutePath), true, `${relativePath} must exist`);
    assert.equal(
      createHash("sha256").update(readFileSync(absolutePath)).digest("hex"),
      expectedHash,
    );
  }

  assert.equal(
    existsSync(path.join(workspaceRoot, "public/three/decoders/THREE-LICENSE.txt")),
    true,
  );
});

test("loading progress latches the first fatal URL", () => {
  const controller = createGltfProgressController();
  const snapshots: string[] = [];
  const unsubscribe = controller.subscribe((snapshot) => snapshots.push(snapshot.status));

  controller.manager.itemStart("/models/robot.glb");
  controller.manager.itemError("/models/robot.glb");
  controller.manager.itemStart("/models/astraea.glb");
  controller.manager.itemError("/models/astraea.glb");
  controller.manager.itemEnd("/models/robot.glb");
  controller.manager.itemEnd("/models/astraea.glb");

  assert.deepEqual(controller.getSnapshot(), {
    status: "error",
    loaded: 0,
    total: 1,
    url: "/models/robot.glb",
  });
  assert.deepEqual(snapshots, ["loading", "error"]);
  unsubscribe();
});

test("a fresh controller creates an explicit clean retry attempt", () => {
  const retry = createGltfProgressController();
  retry.manager.itemStart("/models/robot.glb");
  retry.manager.itemEnd("/models/robot.glb");

  assert.deepEqual(retry.getSnapshot(), {
    status: "ready",
    loaded: 1,
    total: 1,
    url: null,
  });
});

test("GLTF disposal releases shared resources exactly once and cache eviction is scoped", () => {
  const geometry = new BoxGeometry();
  const texture = new Texture();
  const material = new MeshStandardMaterial({ map: texture });
  const root = new Group();
  root.add(new Mesh(geometry, material), new Mesh(geometry, material));

  let geometryDisposals = 0;
  let materialDisposals = 0;
  let textureDisposals = 0;
  geometry.dispose = () => geometryDisposals++;
  material.dispose = () => materialDisposals++;
  texture.dispose = () => textureDisposals++;

  const report = disposeGltfAsset({ scene: root, scenes: [root] });
  assert.deepEqual(report, { geometries: 1, materials: 1, textures: 1, skeletons: 0 });
  assert.equal(geometryDisposals, 1);
  assert.equal(materialDisposals, 1);
  assert.equal(textureDisposals, 1);

  Cache.enabled = true;
  Cache.add("/models/robot.glb", { id: "robot" });
  Cache.add("/models/astraea.glb", { id: "astraea" });
  evictGltfCache(["/models/robot.glb"]);
  assert.equal(Cache.get("/models/robot.glb"), undefined);
  assert.deepEqual(Cache.get("/models/astraea.glb"), { id: "astraea" });
  Cache.clear();
});

test("loader source attaches shared Draco, meshopt, KTX2, and per-attempt progress", () => {
  const source = readFileSync(path.join(workspaceRoot, "src/lib/three/gltf-runtime.ts"), "utf8");

  assert.equal(source.match(/new DRACOLoader/g)?.length, 1);
  assert.match(source, /setDecoderPath\(GLTF_DECODER_PATHS\.draco\)/);
  assert.match(source, /setMeshoptDecoder\(MeshoptDecoder\)/);
  assert.match(source, /setTranscoderPath\(GLTF_DECODER_PATHS\.basis\)/);
  assert.match(source, /detectSupport\(renderer\)/);
  assert.match(source, /new GLTFLoader\(manager\)/);
  assert.match(source, /createGltfProgressController\(\)/);
  assert.match(source, /sharedDecoders\?\.draco\.dispose\(\)/);
  assert.match(source, /sharedDecoders\?\.ktx2\.dispose\(\)/);
});
