"use client";

import dynamic from "next/dynamic";
import { useMemo, type ReactNode } from "react";

import { observatoryAssetRegistry } from "@/lib/three/asset-registry";
import {
  buildProgressiveLoadPlan,
  describeProgressiveSceneStatus,
} from "@/lib/three/progressive-loading";

import { LazyThreeCanvas } from "./lazy-three-canvas";
import { useObservatorySceneSnapshot } from "./observatory-scene-provider";
import { ObservatorySceneRuntimeProvider } from "./observatory-scene-runtime-provider";

const LazyObservatoryLiveScene = dynamic(
  () => import("./observatory-live-scene").then((module) => module.ObservatoryLiveScene),
  { ssr: false, loading: () => null },
);

export type ObservatoryProgressiveExperienceProps = {
  poster: ReactNode;
};

function ProgressiveExperienceContent({ poster }: ObservatoryProgressiveExperienceProps) {
  const scene = useObservatorySceneSnapshot();
  const plan = useMemo(
    () => buildProgressiveLoadPlan(observatoryAssetRegistry.assets, scene.quality.tier),
    [scene.quality.tier],
  );
  const status = describeProgressiveSceneStatus(scene, plan);

  return (
    <div className="observatory-progressive-experience">
      <div className="observatory-poster-layer">{poster}</div>
      {plan.canMountCanvas ? (
        <div className="observatory-canvas-layer" aria-hidden={scene.loading.lifecycle !== "ready"}>
          <LazyThreeCanvas
            accessibleLabel="Interactive Submerged Earth Observatory"
            className="observatory-canvas"
            fallback={null}
          >
            <LazyObservatoryLiveScene plan={plan} />
          </LazyThreeCanvas>
        </div>
      ) : null}
      <div className="scene-status" aria-label="Observatory scene status" aria-live="polite">
        <span aria-hidden="true">●</span> {status}
      </div>
    </div>
  );
}

export function ObservatoryProgressiveExperience(props: ObservatoryProgressiveExperienceProps) {
  return (
    <ObservatorySceneRuntimeProvider>
      <ProgressiveExperienceContent {...props} />
    </ObservatorySceneRuntimeProvider>
  );
}
