"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";

import {
  findOnDemandEntry,
  type ProgressiveAssetEntry,
  type ProgressiveLoadPlan,
} from "@/lib/three/progressive-loading";
import {
  createGltfLoadingAttempt,
  disposeGltfAsset,
  evictGltfCache,
} from "@/lib/three/gltf-runtime";

import { useObservatorySceneStore } from "./observatory-scene-provider";
import { ObservatorySceneShell } from "./observatory-scene-shell";

type IdleWindow = Window &
  typeof globalThis & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

export type ObservatoryLiveSceneProps = {
  plan: ProgressiveLoadPlan;
};

export function ObservatoryLiveScene({ plan }: ObservatoryLiveSceneProps) {
  const renderer = useThree((state) => state.gl);
  const store = useObservatorySceneStore();
  const loadedAssets = useRef(new Map<string, GLTF>());

  useEffect(() => {
    const attempts = new Set<ReturnType<typeof createGltfLoadingAttempt>>();
    const loadingUrls = new Set<string>();
    const loadedUrls = loadedAssets.current;
    const idleWindow = window as IdleWindow;
    let disposed = false;
    let idleHandle: number | null = null;
    let timeoutHandle: number | null = null;

    const loadEntries = async (entries: readonly ProgressiveAssetEntry[], fatal: boolean) => {
      const pendingEntries = entries.filter(
        (entry) => !loadedUrls.has(entry.url) && !loadingUrls.has(entry.url),
      );
      if (pendingEntries.length === 0) return true;

      pendingEntries.forEach((entry) => loadingUrls.add(entry.url));
      const clearQueuedEntries = () =>
        pendingEntries.forEach((entry) => loadingUrls.delete(entry.url));
      let allLoaded = true;

      for (const [index, entry] of pendingEntries.entries()) {
        const attempt = createGltfLoadingAttempt(renderer);
        attempts.add(attempt);

        try {
          const [gltf] = await attempt.load([entry.url]);
          if (!gltf) throw new Error("The asset loader returned no scene.");
          if (disposed) {
            disposeGltfAsset(gltf);
            clearQueuedEntries();
            return false;
          }
          loadedUrls.set(entry.url, gltf);
          if (fatal) {
            store.dispatch({
              type: "loading/progress",
              loaded: index + 1,
              total: pendingEntries.length,
              activeGroup: entry.groupId,
            });
          }
        } catch {
          allLoaded = false;
          if (fatal && !disposed) {
            clearQueuedEntries();
            store.dispatch({
              type: "loading/fail",
              error: {
                code: "asset-load",
                message: "The interactive Observatory could not be prepared.",
                recoverable: true,
                assetId: entry.assetId,
              },
            });
            return false;
          }
        } finally {
          attempt.abort();
          attempts.delete(attempt);
          loadingUrls.delete(entry.url);
        }
      }

      return allLoaded;
    };

    const scheduleDeferred = () => {
      const loadDeferred = () => void loadEntries(plan.deferred, false);
      if (idleWindow.requestIdleCallback) {
        idleHandle = idleWindow.requestIdleCallback(loadDeferred, { timeout: 1_500 });
      } else {
        timeoutHandle = window.setTimeout(loadDeferred, 350);
      }
    };

    const loadHero = async () => {
      store.dispatch({
        type: "loading/start",
        total: plan.heroCritical.length,
        activeGroup: plan.heroCritical[0]?.groupId ?? null,
      });
      const ready = await loadEntries(plan.heroCritical, true);
      if (!disposed && ready) {
        store.dispatch({ type: "loading/ready" });
        scheduleDeferred();
      }
    };

    const loadSelected = () => {
      const selected = store.getSnapshot().selection.artifactId;
      const entry = findOnDemandEntry(plan, selected);
      if (entry) void loadEntries([entry], false);
    };

    const unsubscribeStore = store.subscribe(loadSelected);
    void loadHero();
    loadSelected();

    return () => {
      disposed = true;
      unsubscribeStore();
      attempts.forEach((attempt) => attempt.abort());
      if (idleHandle !== null) idleWindow.cancelIdleCallback?.(idleHandle);
      if (timeoutHandle !== null) window.clearTimeout(timeoutHandle);
      loadedUrls.forEach(disposeGltfAsset);
      evictGltfCache(
        [...plan.heroCritical, ...plan.deferred, ...plan.onDemand].map((entry) => entry.url),
      );
      loadedUrls.clear();
    };
  }, [plan, renderer, store]);

  return <ObservatorySceneShell />;
}
