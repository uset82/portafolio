"use client";

import Link from "next/link";
import { useId } from "react";

import type { SceneArtifactId } from "@/lib/three/scene-config";

import {
  useObservatorySceneSnapshot,
  useObservatorySceneStore,
} from "./observatory-scene-provider";

export type ObservatoryArtifactAccessContent = {
  artifactId: SceneArtifactId;
  href: string;
  title: string;
  descriptor: string;
  status: string;
  mechanismDescription: string;
};

export function ObservatoryArtifactAccess({
  artifact,
  interactive,
}: {
  artifact: ObservatoryArtifactAccessContent;
  interactive: boolean;
}) {
  const scene = useObservatorySceneSnapshot();
  const store = useObservatorySceneStore();
  const descriptionId = useId();
  const selected = scene.selection.artifactId === artifact.artifactId;

  return (
    <div
      className="observatory-artifact-access"
      data-scene-layer="artifact-access"
      data-artifact-id={artifact.artifactId}
      data-selected={selected}
    >
      <span className="observatory-artifact-access__status">{artifact.status}</span>
      <Link
        className="observatory-artifact-access__link"
        href={artifact.href}
        aria-label={`Open ${artifact.title} — ${artifact.descriptor}`}
        aria-describedby={descriptionId}
      >
        <strong>{artifact.title}</strong>
        <span>{artifact.descriptor}</span>
        <i aria-hidden="true">↗</i>
      </Link>
      <span className="visually-hidden" id={descriptionId}>
        {artifact.mechanismDescription}
      </span>
      {interactive ? (
        <button
          className="observatory-artifact-access__focus"
          type="button"
          aria-pressed={selected}
          aria-describedby={descriptionId}
          onClick={() =>
            store.dispatch(
              selected
                ? { type: "artifact/clear" }
                : { type: "artifact/select", artifactId: artifact.artifactId },
            )
          }
        >
          {selected ? "Return to overview" : "Focus instrument"}
        </button>
      ) : null}
    </div>
  );
}
