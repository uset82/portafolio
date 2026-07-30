"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";

import { observatoryAssetRegistry } from "@/lib/three/asset-registry";
import type { ObservatoryAsset } from "@/lib/three/asset-registry-schema";
import type { AstraeaDiagnostics } from "@/lib/three/astraea-system";
import type { GltfLoadingAttemptFactory } from "@/lib/three/gltf-runtime";
import {
  createObservatoryDiagnostics,
  type ObservatoryDiagnostics,
} from "@/lib/three/observatory-diagnostics";
import {
  buildProgressiveLoadPlan,
  describeProgressiveSceneStatus,
  OBSERVATORY_LIVE_CANVAS_PRESENTATION,
  type ObservatoryLiveCanvasPresentation,
} from "@/lib/three/progressive-loading";
import type { CameraTransitionDiagnostics } from "@/lib/three/camera-transition";
import type { DroneDiagnostics } from "@/lib/three/drone-system";
import type { ElectronicsAiDiagnostics } from "@/lib/three/electronics-ai-system";
import type { FutureEnergyDiagnostics } from "@/lib/three/future-energy-system";
import type { PinaculoDiagnostics } from "@/lib/three/pinaculo-system";
import type { ThreeRendererDiagnostics } from "@/lib/three/renderer-diagnostics";
import type { RobotDiagnostics } from "@/lib/three/robot-system";
import type { SoundLabDiagnostics } from "@/lib/three/sound-lab-system";
import type { WaterSurfaceDiagnostics } from "@/lib/three/water-system";

import { LazyThreeCanvas } from "./lazy-three-canvas";
import {
  ObservatoryArtifactAccess,
  type ObservatoryArtifactAccessContent,
} from "./observatory-artifact-access";
import { ObservatoryNavigationController } from "./observatory-navigation-controller";
import { useObservatorySceneSnapshot } from "./observatory-scene-provider";
import { ObservatorySceneRuntimeProvider } from "./observatory-scene-runtime-provider";

const LazyObservatoryLiveScene = dynamic(
  () => import("./observatory-live-scene").then((module) => module.ObservatoryLiveScene),
  { ssr: false, loading: () => null },
);

const OBSERVATORY_SCENE_CAPTION_ID = "observatory-scene-caption";
const OBSERVATORY_SCENE_DESCRIPTION =
  "A warm sunlit observatory with a ceramic robot, a sage water basin, and instruments for sound, celestial patterns, numerology, electronics, and energy.";

export type ObservatoryProgressiveExperienceProps = {
  artifacts: readonly ObservatoryArtifactAccessContent[];
  poster: ReactNode;
};

export type ObservatoryProgressiveExperienceContentProps = ObservatoryProgressiveExperienceProps & {
  assets?: readonly ObservatoryAsset[];
  createLoadingAttempt?: GltfLoadingAttemptFactory;
  liveCanvasPresentation?: ObservatoryLiveCanvasPresentation;
  onDiagnosticsReady?: (diagnostics: ThreeRendererDiagnostics | null) => void;
  onObservatoryDiagnosticsReady?: (diagnostics: ObservatoryDiagnostics | null) => void;
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

export function ObservatoryProgressiveExperienceContent({
  artifacts,
  poster,
  assets = observatoryAssetRegistry.assets,
  createLoadingAttempt,
  liveCanvasPresentation,
  onDiagnosticsReady,
  onObservatoryDiagnosticsReady,
  onAstraeaDiagnosticsReady,
  onCameraDiagnosticsReady,
  onDroneDiagnosticsReady,
  onElectronicsAiDiagnosticsReady,
  onFutureEnergyDiagnosticsReady,
  onPinaculoDiagnosticsReady,
  onRobotDiagnosticsReady,
  onSoundLabDiagnosticsReady,
  onWaterDiagnosticsReady,
}: ObservatoryProgressiveExperienceContentProps) {
  const scene = useObservatorySceneSnapshot();
  const plan = useMemo(
    () => buildProgressiveLoadPlan(assets, scene.quality.tier, liveCanvasPresentation),
    [assets, scene.quality.tier, liveCanvasPresentation],
  );
  const status = describeProgressiveSceneStatus(scene, plan);
  const canvasIsReady = plan.canMountCanvas && scene.loading.lifecycle === "ready";
  /* While U.20 holds the Canvas poster-authoritative there is no scene
   * lifecycle to report, so the floating status chip stays unmounted. */
  const liveCanvasHeld =
    (liveCanvasPresentation ?? OBSERVATORY_LIVE_CANVAS_PRESENTATION) === "poster-authoritative";
  const focusedArtifact = scene.selection.artifactId
    ? artifacts.find((artifact) => artifact.artifactId === scene.selection.artifactId)
    : null;
  const rendererDiagnosticsRef = useRef<ThreeRendererDiagnostics | null>(null);
  const cameraDiagnosticsRef = useRef<CameraTransitionDiagnostics | null>(null);
  const robotDiagnosticsRef = useRef<RobotDiagnostics | null>(null);
  const astraeaDiagnosticsRef = useRef<AstraeaDiagnostics | null>(null);
  const pinaculoDiagnosticsRef = useRef<PinaculoDiagnostics | null>(null);
  const soundLabDiagnosticsRef = useRef<SoundLabDiagnostics | null>(null);
  const futureEnergyDiagnosticsRef = useRef<FutureEnergyDiagnostics | null>(null);
  const electronicsAiDiagnosticsRef = useRef<ElectronicsAiDiagnostics | null>(null);
  const droneDiagnosticsRef = useRef<DroneDiagnostics | null>(null);
  const waterDiagnosticsRef = useRef<WaterSurfaceDiagnostics | null>(null);
  const observatoryDiagnosticsRequested = Boolean(onObservatoryDiagnosticsReady);
  const handleRendererDiagnosticsReady = useCallback(
    (diagnostics: ThreeRendererDiagnostics | null) => {
      rendererDiagnosticsRef.current = diagnostics;
      onDiagnosticsReady?.(diagnostics);
    },
    [onDiagnosticsReady],
  );
  const handleCameraDiagnosticsReady = useCallback(
    (diagnostics: CameraTransitionDiagnostics | null) => {
      cameraDiagnosticsRef.current = diagnostics;
      onCameraDiagnosticsReady?.(diagnostics);
    },
    [onCameraDiagnosticsReady],
  );
  const handleAstraeaDiagnosticsReady = useCallback(
    (diagnostics: AstraeaDiagnostics | null) => {
      astraeaDiagnosticsRef.current = diagnostics;
      onAstraeaDiagnosticsReady?.(diagnostics);
    },
    [onAstraeaDiagnosticsReady],
  );
  const handleDroneDiagnosticsReady = useCallback(
    (diagnostics: DroneDiagnostics | null) => {
      droneDiagnosticsRef.current = diagnostics;
      onDroneDiagnosticsReady?.(diagnostics);
    },
    [onDroneDiagnosticsReady],
  );
  const handleElectronicsAiDiagnosticsReady = useCallback(
    (diagnostics: ElectronicsAiDiagnostics | null) => {
      electronicsAiDiagnosticsRef.current = diagnostics;
      onElectronicsAiDiagnosticsReady?.(diagnostics);
    },
    [onElectronicsAiDiagnosticsReady],
  );
  const handleFutureEnergyDiagnosticsReady = useCallback(
    (diagnostics: FutureEnergyDiagnostics | null) => {
      futureEnergyDiagnosticsRef.current = diagnostics;
      onFutureEnergyDiagnosticsReady?.(diagnostics);
    },
    [onFutureEnergyDiagnosticsReady],
  );
  const handlePinaculoDiagnosticsReady = useCallback(
    (diagnostics: PinaculoDiagnostics | null) => {
      pinaculoDiagnosticsRef.current = diagnostics;
      onPinaculoDiagnosticsReady?.(diagnostics);
    },
    [onPinaculoDiagnosticsReady],
  );
  const handleRobotDiagnosticsReady = useCallback(
    (diagnostics: RobotDiagnostics | null) => {
      robotDiagnosticsRef.current = diagnostics;
      onRobotDiagnosticsReady?.(diagnostics);
    },
    [onRobotDiagnosticsReady],
  );
  const handleSoundLabDiagnosticsReady = useCallback(
    (diagnostics: SoundLabDiagnostics | null) => {
      soundLabDiagnosticsRef.current = diagnostics;
      onSoundLabDiagnosticsReady?.(diagnostics);
    },
    [onSoundLabDiagnosticsReady],
  );
  const handleWaterDiagnosticsReady = useCallback(
    (diagnostics: WaterSurfaceDiagnostics | null) => {
      waterDiagnosticsRef.current = diagnostics;
      onWaterDiagnosticsReady?.(diagnostics);
    },
    [onWaterDiagnosticsReady],
  );

  useEffect(() => {
    if (!onObservatoryDiagnosticsReady) return;
    const diagnostics = createObservatoryDiagnostics({
      renderer: () => rendererDiagnosticsRef.current,
      camera: () => cameraDiagnosticsRef.current,
      robot: () => robotDiagnosticsRef.current,
      astraea: () => astraeaDiagnosticsRef.current,
      pinaculo: () => pinaculoDiagnosticsRef.current,
      soundLab: () => soundLabDiagnosticsRef.current,
      futureEnergy: () => futureEnergyDiagnosticsRef.current,
      electronicsAi: () => electronicsAiDiagnosticsRef.current,
      drone: () => droneDiagnosticsRef.current,
      water: () => waterDiagnosticsRef.current,
    });
    onObservatoryDiagnosticsReady(diagnostics);
    return () => onObservatoryDiagnosticsReady(null);
  }, [onObservatoryDiagnosticsReady]);

  return (
    <>
      <ObservatoryNavigationController />
      <figure
        className="observatory-progressive-experience"
        aria-labelledby={OBSERVATORY_SCENE_CAPTION_ID}
      >
        <figcaption id={OBSERVATORY_SCENE_CAPTION_ID} className="visually-hidden">
          {OBSERVATORY_SCENE_DESCRIPTION}
        </figcaption>
        <div
          className="observatory-poster-layer"
          data-scene-layer="poster"
          aria-hidden={canvasIsReady}
        >
          {poster}
        </div>
        {plan.canMountCanvas ? (
          <div
            className="observatory-canvas-layer"
            data-scene-layer="canvas"
            aria-hidden={!canvasIsReady}
          >
            <LazyThreeCanvas
              accessibleDescriptionId={OBSERVATORY_SCENE_CAPTION_ID}
              accessibleLabel="Interactive Submerged Earth Observatory"
              className="observatory-canvas"
              fallback={null}
              {...(onDiagnosticsReady || observatoryDiagnosticsRequested
                ? { onDiagnosticsReady: handleRendererDiagnosticsReady }
                : {})}
            >
              <LazyObservatoryLiveScene
                plan={plan}
                {...(createLoadingAttempt ? { createLoadingAttempt } : {})}
                {...(onAstraeaDiagnosticsReady || observatoryDiagnosticsRequested
                  ? { onAstraeaDiagnosticsReady: handleAstraeaDiagnosticsReady }
                  : {})}
                {...(onCameraDiagnosticsReady || observatoryDiagnosticsRequested
                  ? { onCameraDiagnosticsReady: handleCameraDiagnosticsReady }
                  : {})}
                {...(onDroneDiagnosticsReady || observatoryDiagnosticsRequested
                  ? { onDroneDiagnosticsReady: handleDroneDiagnosticsReady }
                  : {})}
                {...(onElectronicsAiDiagnosticsReady || observatoryDiagnosticsRequested
                  ? { onElectronicsAiDiagnosticsReady: handleElectronicsAiDiagnosticsReady }
                  : {})}
                {...(onFutureEnergyDiagnosticsReady || observatoryDiagnosticsRequested
                  ? { onFutureEnergyDiagnosticsReady: handleFutureEnergyDiagnosticsReady }
                  : {})}
                {...(onPinaculoDiagnosticsReady || observatoryDiagnosticsRequested
                  ? { onPinaculoDiagnosticsReady: handlePinaculoDiagnosticsReady }
                  : {})}
                {...(onRobotDiagnosticsReady || observatoryDiagnosticsRequested
                  ? { onRobotDiagnosticsReady: handleRobotDiagnosticsReady }
                  : {})}
                {...(onSoundLabDiagnosticsReady || observatoryDiagnosticsRequested
                  ? { onSoundLabDiagnosticsReady: handleSoundLabDiagnosticsReady }
                  : {})}
                {...(onWaterDiagnosticsReady || observatoryDiagnosticsRequested
                  ? { onWaterDiagnosticsReady: handleWaterDiagnosticsReady }
                  : {})}
              />
            </LazyThreeCanvas>
          </div>
        ) : null}
        {/* The artifact overlays are the accessible DOM equivalents of the live
         * scene's selectable instruments. While U.20 holds the Canvas they
         * would only be labels stacked over a flat visual, so they stay
         * unmounted; global navigation and Selected Systems already reach every
         * destination they expose. */}
        {liveCanvasHeld
          ? null
          : artifacts.map((artifact) => (
              <ObservatoryArtifactAccess
                key={artifact.artifactId}
                artifact={artifact}
                interactive={canvasIsReady}
              />
            ))}
        <span
          className="visually-hidden"
          data-scene-layer="navigation-status"
          aria-live="polite"
          aria-atomic="true"
        >
          {focusedArtifact && canvasIsReady
            ? `${focusedArtifact.title} focused. Press Escape or activate Return to overview to reset the Observatory camera.`
            : focusedArtifact
              ? `${focusedArtifact.title} requested. The complete poster and destination link remain available while the interactive scene is unavailable.`
              : "Observatory overview."}
        </span>
        {liveCanvasHeld ? null : (
          <div
            className="scene-status"
            data-scene-layer="status"
            aria-label="Observatory scene status"
            aria-live="polite"
          >
            <span aria-hidden="true">●</span> {status}
          </div>
        )}
      </figure>
    </>
  );
}

export function ObservatoryProgressiveExperience(props: ObservatoryProgressiveExperienceProps) {
  return (
    <ObservatorySceneRuntimeProvider>
      <ObservatoryProgressiveExperienceContent {...props} />
    </ObservatorySceneRuntimeProvider>
  );
}
