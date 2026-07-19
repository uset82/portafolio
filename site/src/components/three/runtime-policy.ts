import type { CanvasProps } from "@react-three/fiber";

export const THREE_DPR_RANGE = [1, 1.5] as const;
export const THREE_FRAMELOOP: NonNullable<CanvasProps["frameloop"]> = "demand";

export const THREE_GL_OPTIONS = {
  alpha: true,
  antialias: true,
  depth: true,
  powerPreference: "high-performance",
  preserveDrawingBuffer: false,
} as const;
