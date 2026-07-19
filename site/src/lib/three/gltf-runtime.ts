import {
  BufferGeometry,
  Cache,
  Material,
  Mesh,
  SkinnedMesh,
  Texture,
  type Object3D,
  type WebGLRenderer,
} from "three";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";

import { createGltfProgressController } from "./gltf-loading-state";

export const GLTF_DECODER_PATHS = {
  draco: "/three/decoders/draco/",
  basis: "/three/decoders/basis/",
} as const;

type SharedDecoders = {
  draco: DRACOLoader;
  ktx2: KTX2Loader;
  renderer: WebGLRenderer;
};

let sharedDecoders: SharedDecoders | null = null;

function createSharedDecoders(renderer: WebGLRenderer): SharedDecoders {
  const draco = new DRACOLoader().setDecoderPath(GLTF_DECODER_PATHS.draco).setWorkerLimit(2);
  const ktx2 = new KTX2Loader()
    .setTranscoderPath(GLTF_DECODER_PATHS.basis)
    .setWorkerLimit(2)
    .detectSupport(renderer);

  return { draco, ktx2, renderer };
}

function getSharedDecoders(renderer: WebGLRenderer) {
  if (!sharedDecoders) {
    sharedDecoders = createSharedDecoders(renderer);
    return sharedDecoders;
  }

  if (sharedDecoders.renderer !== renderer) {
    sharedDecoders.ktx2.dispose();
    sharedDecoders.ktx2 = new KTX2Loader()
      .setTranscoderPath(GLTF_DECODER_PATHS.basis)
      .setWorkerLimit(2)
      .detectSupport(renderer);
    sharedDecoders.renderer = renderer;
  }

  return sharedDecoders;
}

function createConfiguredLoader(
  renderer: WebGLRenderer,
  manager: ReturnType<typeof createGltfProgressController>["manager"],
) {
  const decoders = getSharedDecoders(renderer);

  return new GLTFLoader(manager)
    .setDRACOLoader(decoders.draco)
    .setMeshoptDecoder(MeshoptDecoder)
    .setKTX2Loader(decoders.ktx2);
}

export class GltfAssetLoadError extends Error {
  readonly url: string;

  constructor(url: string, options?: ErrorOptions) {
    super("The optional 3D asset could not be prepared.", options);
    this.name = "GltfAssetLoadError";
    this.url = url;
  }
}

export type GltfLoadingAttempt = {
  getSnapshot: ReturnType<typeof createGltfProgressController>["getSnapshot"];
  subscribe: ReturnType<typeof createGltfProgressController>["subscribe"];
  abort: () => void;
  load: (urls: readonly string[]) => Promise<GLTF[]>;
};

export type GltfLoadingAttemptFactory = (renderer: WebGLRenderer) => GltfLoadingAttempt;

export const createGltfLoadingAttempt: GltfLoadingAttemptFactory = (renderer) => {
  Cache.enabled = true;

  const progress = createGltfProgressController();
  const loader = createConfiguredLoader(renderer, progress.manager);
  let used = false;

  return {
    getSnapshot: progress.getSnapshot,
    subscribe: progress.subscribe,
    abort() {
      progress.manager.abort();
    },
    async load(urls: readonly string[]) {
      if (used) {
        throw new Error("Create a new GLTF loading attempt before retrying.");
      }
      if (urls.length === 0) {
        throw new Error("A GLTF loading attempt needs at least one asset URL.");
      }

      used = true;

      return Promise.all(
        urls.map(async (url) => {
          try {
            return await loader.loadAsync(url);
          } catch (error) {
            progress.fail(url);
            throw new GltfAssetLoadError(url, { cause: error });
          }
        }),
      );
    },
  };
};

export function evictGltfCache(urls: readonly string[]) {
  urls.forEach((url) => Cache.remove(url));
}

type ClosableImage = { close?: () => void };

export function disposeGltfAsset(gltf: Pick<GLTF, "scene" | "scenes">) {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  const images = new Set<ClosableImage>();
  const skeletons = new Set<SkinnedMesh["skeleton"]>();

  const collectTexture = (value: unknown) => {
    if (!(value instanceof Texture) || textures.has(value)) {
      return;
    }

    textures.add(value);
    const image = value.source.data as ClosableImage | undefined;
    if (image && typeof image === "object") {
      images.add(image);
    }
  };

  const collectMaterial = (material: Material) => {
    if (materials.has(material)) {
      return;
    }

    materials.add(material);
    Object.values(material).forEach(collectTexture);

    const uniforms = (material as Material & { uniforms?: Record<string, { value?: unknown }> })
      .uniforms;
    Object.values(uniforms ?? {}).forEach((uniform) => collectTexture(uniform.value));
  };

  const collectObject = (object: Object3D) => {
    if (object instanceof Mesh) {
      geometries.add(object.geometry);
      const meshMaterials = Array.isArray(object.material) ? object.material : [object.material];
      meshMaterials.forEach(collectMaterial);
    }

    if (object instanceof SkinnedMesh) {
      skeletons.add(object.skeleton);
    }
  };

  new Set([gltf.scene, ...gltf.scenes]).forEach((scene) => scene.traverse(collectObject));

  skeletons.forEach((skeleton) => skeleton.dispose());
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  textures.forEach((texture) => texture.dispose());
  images.forEach((image) => image.close?.());

  return {
    geometries: geometries.size,
    materials: materials.size,
    textures: textures.size,
    skeletons: skeletons.size,
  };
}

export function disposeGltfRuntime() {
  sharedDecoders?.draco.dispose();
  sharedDecoders?.ktx2.dispose();
  sharedDecoders = null;
  Cache.clear();
}
