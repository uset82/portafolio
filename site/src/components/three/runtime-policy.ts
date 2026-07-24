import type { CanvasProps } from "@react-three/fiber";
import { ACESFilmicToneMapping, SRGBColorSpace, type WebGLRenderer } from "three";

import { OBSERVATORY_ENVIRONMENT_TECHNICAL_ART } from "@/lib/three/observatory-environment";

export const THREE_DPR_RANGE = [1, 1.5] as const;
export const THREE_FRAMELOOP: NonNullable<CanvasProps["frameloop"]> = "demand";

export const THREE_GL_OPTIONS = {
  alpha: true,
  antialias: true,
  depth: true,
  powerPreference: "high-performance",
  preserveDrawingBuffer: false,
} as const;

export function configureThreeRenderer(renderer: WebGLRenderer) {
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = OBSERVATORY_ENVIRONMENT_TECHNICAL_ART.renderer.exposure;
}
