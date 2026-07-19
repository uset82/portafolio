"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";

import {
  CAMERA_VIEWS,
  OBSERVATORY_ENVIRONMENT,
  OBSERVATORY_LIGHT_RIG,
  SCENE_GROUPS,
  SCENE_OWNERSHIP,
} from "@/lib/three/scene-config";
import { canRenderObservatoryScene, resolveSceneMotionMode } from "@/lib/three/scene-state";

import {
  useObservatorySceneSnapshot,
  useObservatorySceneStore,
} from "./observatory-scene-provider";

function ObservatoryCamera() {
  const cameraRef = useRef<PerspectiveCamera>(null);
  const scene = useObservatorySceneSnapshot();
  const store = useObservatorySceneStore();
  const setRootState = useThree((state) => state.set);
  const invalidate = useThree((state) => state.invalidate);
  const view = CAMERA_VIEWS[scene.camera.view];

  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;

    camera.position.set(view.position[0], view.position[1], view.position[2]);
    camera.fov = view.fov;
    camera.near = view.near;
    camera.far = view.far;
    camera.lookAt(view.target[0], view.target[1], view.target[2]);
    camera.updateProjectionMatrix();
    setRootState({ camera });
    invalidate();

    if (scene.camera.phase === "requested") {
      store.dispatch({ type: "camera/settled", requestId: scene.camera.requestId });
    }
  }, [invalidate, scene.camera.phase, scene.camera.requestId, setRootState, store, view]);

  return (
    <perspectiveCamera
      ref={cameraRef}
      name="ObservatoryCamera"
      fov={view.fov}
      near={view.near}
      far={view.far}
      position={[...view.position]}
    />
  );
}

function ObservatoryLights() {
  return (
    <group name="ObservatoryLightRig" userData={{ owner: SCENE_OWNERSHIP.scene }}>
      {OBSERVATORY_LIGHT_RIG.map((light) =>
        light.kind === "hemisphere" ? (
          <hemisphereLight
            key={light.id}
            name="ObservatoryHemisphereLight"
            color={light.color}
            groundColor={light.groundColor}
            intensity={light.intensity}
          />
        ) : (
          <directionalLight
            key={light.id}
            name={`Observatory${light.id}Light`}
            color={light.color}
            intensity={light.intensity}
            position={[...light.position]}
            castShadow={light.castShadow}
          />
        ),
      )}
    </group>
  );
}

export function ObservatorySceneShell() {
  const scene = useObservatorySceneSnapshot();
  const sceneVisible = canRenderObservatoryScene(scene);
  const motionMode = resolveSceneMotionMode(scene);

  return (
    <>
      <ObservatoryCamera />
      <ObservatoryLights />
      <group
        name="ObservatorySceneRoot"
        visible={sceneVisible}
        userData={{
          owner: SCENE_OWNERSHIP.scene,
          environment: OBSERVATORY_ENVIRONMENT.mode,
          qualityTier: scene.quality.tier,
          motionMode,
          selectedArtifact: scene.selection.artifactId,
        }}
      >
        {Object.values(SCENE_GROUPS).map((group) => (
          <group
            key={group.id}
            name={group.name}
            userData={{
              groupId: group.id,
              loadingPriority: group.loadingPriority,
              assetIds: [...group.assetIds],
            }}
          />
        ))}
      </group>
    </>
  );
}
