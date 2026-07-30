"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";

import { getObservatoryAsset } from "@/lib/three/asset-registry";
import type { ObservatoryAssetId } from "@/lib/three/asset-registry-schema";
import type { AstraeaDiagnostics } from "@/lib/three/astraea-system";
import { createObservatoryRobotGltfAsset } from "@/lib/three/create-observatory-robot-model";
import type { CameraTransitionDiagnostics } from "@/lib/three/camera-transition";
import type { DroneDiagnostics } from "@/lib/three/drone-system";
import type { ElectronicsAiDiagnostics } from "@/lib/three/electronics-ai-system";
import type { FutureEnergyDiagnostics } from "@/lib/three/future-energy-system";
import type { PinaculoDiagnostics } from "@/lib/three/pinaculo-system";
import {
  findOnDemandEntry,
  type ProgressiveAssetEntry,
  type ProgressiveLoadPlan,
} from "@/lib/three/progressive-loading";
import {
  createGltfLoadingAttempt,
  disposeGltfAsset,
  evictGltfCache,
  type GltfLoadingAttempt,
  type GltfLoadingAttemptFactory,
} from "@/lib/three/gltf-runtime";
import { assertRobotAssetContract, type RobotDiagnostics } from "@/lib/three/robot-system";
import type { SoundLabDiagnostics } from "@/lib/three/sound-lab-system";
import type { WaterSurfaceDiagnostics } from "@/lib/three/water-system";

import {
  useObservatorySceneSnapshot,
  useObservatorySceneStore,
} from "./observatory-scene-provider";
import { ObservatorySceneShell } from "./observatory-scene-shell";

type IdleWindow = Window &
  typeof globalThis & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

export type ObservatoryLiveSceneProps = {
  plan: ProgressiveLoadPlan;
  createLoadingAttempt?: GltfLoadingAttemptFactory;
  onAstraeaDiagnosticsReady?: (diagnostics: AstraeaDiagnostics | null) => void;
  onCameraDiagnosticsReady?: (diagnostics: CameraTransitionDiagnostics | null) => void;
  onDroneDiagnosticsReady?: (diagnostics: DroneDiagnostics | null) => void;
  onElectronicsAiDiagnosticsReady?: (diagnostics: ElectronicsAiDiagnostics | null) => void;
  onFutureEnergyDiagnosticsReady?: (diagnostics: FutureEnergyDiagnostics | null) => void;
  onPinaculoDiagnosticsReady?: (diagnostics: PinaculoDiagnostics | null) => void;
  onRobotDiagnosticsReady?: (diagnostics: RobotDiagnostics | null) => void;
  onSoundLabDiagnosticsReady?: (diagnostics: SoundLabDiagnostics | null) => void;
  onWaterDiagnosticsReady?: (diagnostics: WaterSurfaceDiagnostics | null) => void;
};

export function ObservatoryLiveScene({
  plan,
  createLoadingAttempt = createGltfLoadingAttempt,
  onAstraeaDiagnosticsReady,
  onCameraDiagnosticsReady,
  onDroneDiagnosticsReady,
  onElectronicsAiDiagnosticsReady,
  onFutureEnergyDiagnosticsReady,
  onPinaculoDiagnosticsReady,
  onRobotDiagnosticsReady,
  onSoundLabDiagnosticsReady,
  onWaterDiagnosticsReady,
}: ObservatoryLiveSceneProps) {
  const renderer = useThree((state) => state.gl);
  const store = useObservatorySceneStore();
  const scene = useObservatorySceneSnapshot();
  const loadedAssetsByUrl = useRef(new Map<string, GLTF>());
  const [presentedAssets, setPresentedAssets] = useState<ReadonlyMap<ObservatoryAssetId, GLTF>>(
    () => new Map(),
  );
  const proceduralRobotTier = scene.quality.tier === "full" ? "full" : "reduced";

  // The approved rights-safe guide is authored at runtime, so it joins the
  // presented-asset map at render time; the model loading path remains
  // available for a future sculpted rights-cleared GLB without contract
  // changes, and a loaded model asset always takes precedence.
  const proceduralRobot = useMemo(
    () =>
      getObservatoryAsset("robot-guide").kind === "procedural"
        ? createObservatoryRobotGltfAsset(proceduralRobotTier)
        : null,
    [proceduralRobotTier],
  );

  useEffect(() => {
    if (!proceduralRobot) return;
    return () => proceduralRobot.dispose();
  }, [proceduralRobot]);

  const combinedAssets = useMemo(() => {
    if (!proceduralRobot || presentedAssets.has("robot-guide")) return presentedAssets;
    const next = new Map(presentedAssets);
    next.set("robot-guide", proceduralRobot.gltf);
    return next;
  }, [presentedAssets, proceduralRobot]);

  useEffect(() => {
    const attempts = new Set<GltfLoadingAttempt>();
    const loadingUrls = new Set<string>();
    const loadedUrls = loadedAssetsByUrl.current;
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
        const attempt = createLoadingAttempt(renderer);
        attempts.add(attempt);

        try {
          const [gltf] = await attempt.load([entry.url]);
          if (!gltf) throw new Error("The asset loader returned no scene.");
          if (disposed) {
            disposeGltfAsset(gltf);
            clearQueuedEntries();
            return false;
          }
          if (entry.assetId === "robot-guide") {
            try {
              assertRobotAssetContract(gltf);
            } catch (error) {
              disposeGltfAsset(gltf);
              throw error;
            }
          }
          loadedUrls.set(entry.url, gltf);
          setPresentedAssets((current) => {
            const next = new Map(current);
            next.set(entry.assetId, gltf);
            return next;
          });
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
  }, [createLoadingAttempt, plan, renderer, store]);

  return (
    <ObservatorySceneShell
      loadedAssets={combinedAssets}
      {...(onAstraeaDiagnosticsReady ? { onAstraeaDiagnosticsReady } : {})}
      {...(onCameraDiagnosticsReady ? { onCameraDiagnosticsReady } : {})}
      {...(onDroneDiagnosticsReady ? { onDroneDiagnosticsReady } : {})}
      {...(onElectronicsAiDiagnosticsReady ? { onElectronicsAiDiagnosticsReady } : {})}
      {...(onFutureEnergyDiagnosticsReady ? { onFutureEnergyDiagnosticsReady } : {})}
      {...(onPinaculoDiagnosticsReady ? { onPinaculoDiagnosticsReady } : {})}
      {...(onRobotDiagnosticsReady ? { onRobotDiagnosticsReady } : {})}
      {...(onSoundLabDiagnosticsReady ? { onSoundLabDiagnosticsReady } : {})}
      {...(onWaterDiagnosticsReady ? { onWaterDiagnosticsReady } : {})}
    />
  );
}
