"use client";

import type { ObservatorySceneProviderProps } from "./observatory-scene-provider";
import { ObservatorySceneProvider } from "./observatory-scene-provider";
import { ObservatoryCapabilityController } from "./observatory-capability-controller";

/**
 * Browser-signal owner that must wrap, not live inside, the optional Canvas.
 * Poster-first mounting can therefore reject unsupported WebGL2 before a
 * renderer is created.
 */
export function ObservatorySceneRuntimeProvider({
  children,
  ...providerProps
}: ObservatorySceneProviderProps) {
  return (
    <ObservatorySceneProvider {...providerProps}>
      <ObservatoryCapabilityController />
      {children}
    </ObservatorySceneProvider>
  );
}
