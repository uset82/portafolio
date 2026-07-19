"use client";

import dynamic from "next/dynamic";

import type { ThreeCanvasProps } from "./three-canvas";

const ClientThreeCanvas = dynamic<ThreeCanvasProps>(
  () => import("./three-canvas").then((module) => module.ThreeCanvas),
  {
    loading: () => null,
    ssr: false,
  },
);

/**
 * Client-only WebGL boundary. Its caller must keep the semantic poster visible
 * until the optional scene reports that its required assets are ready.
 */
export function LazyThreeCanvas(props: ThreeCanvasProps) {
  return <ClientThreeCanvas {...props} />;
}
