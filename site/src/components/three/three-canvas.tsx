"use client";

import { Canvas } from "@react-three/fiber";
import type { ReactNode } from "react";

import { THREE_DPR_RANGE, THREE_FRAMELOOP, THREE_GL_OPTIONS } from "./runtime-policy";

export type ThreeCanvasProps = {
  accessibleLabel: string;
  children?: ReactNode;
  className?: string;
  fallback: ReactNode;
};

/**
 * Internal Canvas owner. Application code must import LazyThreeCanvas instead,
 * keeping WebGL out of server rendering and the initial semantic route bundle.
 */
export function ThreeCanvas({ accessibleLabel, children, className, fallback }: ThreeCanvasProps) {
  return (
    <Canvas
      aria-label={accessibleLabel}
      className={className}
      dpr={[...THREE_DPR_RANGE]}
      fallback={fallback}
      frameloop={THREE_FRAMELOOP}
      gl={THREE_GL_OPTIONS}
      role="img"
      shadows={false}
    >
      {children}
    </Canvas>
  );
}
