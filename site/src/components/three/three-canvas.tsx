"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, type ReactNode } from "react";

import {
  createThreeRendererDiagnostics,
  type ThreeRendererDiagnostics,
} from "@/lib/three/renderer-diagnostics";

import {
  THREE_DPR_RANGE,
  THREE_FRAMELOOP,
  THREE_GL_OPTIONS,
  configureThreeRenderer,
} from "./runtime-policy";

export type ThreeCanvasProps = {
  accessibleDescriptionId?: string;
  accessibleLabel: string;
  children?: ReactNode;
  className?: string;
  fallback: ReactNode;
  onDiagnosticsReady?: (diagnostics: ThreeRendererDiagnostics | null) => void;
};

/**
 * Internal Canvas owner. Application code must import LazyThreeCanvas instead,
 * keeping WebGL out of server rendering and the initial semantic route bundle.
 */
export function ThreeCanvas({
  accessibleDescriptionId,
  accessibleLabel,
  children,
  className,
  fallback,
  onDiagnosticsReady,
}: ThreeCanvasProps) {
  const diagnosticsRef = useRef<ThreeRendererDiagnostics | null>(null);

  useEffect(() => {
    if (diagnosticsRef.current) {
      onDiagnosticsReady?.(diagnosticsRef.current);
    }

    return () => {
      onDiagnosticsReady?.(null);
    };
  }, [onDiagnosticsReady]);

  return (
    <Canvas
      aria-describedby={accessibleDescriptionId}
      aria-label={accessibleLabel}
      className={className}
      dpr={[...THREE_DPR_RANGE]}
      fallback={fallback}
      frameloop={THREE_FRAMELOOP}
      gl={THREE_GL_OPTIONS}
      onCreated={({ gl, scene }) => {
        configureThreeRenderer(gl);
        const diagnostics = createThreeRendererDiagnostics({ renderer: gl, scene });
        diagnosticsRef.current = diagnostics;
        onDiagnosticsReady?.(diagnostics);
      }}
      role="img"
      shadows={false}
    >
      {children}
    </Canvas>
  );
}
