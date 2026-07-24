"use client";

import { useEffect } from "react";

import {
  buildObservatoryFocusHref,
  isEditableNavigationTarget,
  readObservatoryFocusQuery,
} from "@/lib/three/observatory-navigation";

import { useObservatorySceneStore } from "./observatory-scene-provider";

function currentRelativeHref() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function historyStateWithFocus(artifactId: string | null) {
  const currentState =
    window.history.state && typeof window.history.state === "object" ? window.history.state : {};
  return { ...currentState, observatoryFocus: artifactId };
}

export function ObservatoryNavigationController() {
  const store = useObservatorySceneStore();

  useEffect(() => {
    let applyingLocation = false;
    let selectedArtifact = store.getSnapshot().selection.artifactId;

    const applyLocation = () => {
      const query = readObservatoryFocusQuery(window.location.search);
      if (!query.valid) {
        window.history.replaceState(
          historyStateWithFocus(null),
          "",
          buildObservatoryFocusHref(currentRelativeHref(), null),
        );
      }

      const nextArtifact = query.valid ? query.artifactId : null;
      if (store.getSnapshot().selection.artifactId === nextArtifact) return;
      applyingLocation = true;
      store.dispatch(
        nextArtifact
          ? { type: "artifact/select", artifactId: nextArtifact }
          : { type: "artifact/clear" },
      );
      selectedArtifact = store.getSnapshot().selection.artifactId;
      applyingLocation = false;
    };

    const unsubscribe = store.subscribe(() => {
      const nextArtifact = store.getSnapshot().selection.artifactId;
      if (nextArtifact === selectedArtifact) return;
      selectedArtifact = nextArtifact;
      if (applyingLocation) return;

      const currentQuery = readObservatoryFocusQuery(window.location.search);
      if (currentQuery.valid && currentQuery.artifactId === nextArtifact) return;
      window.history.pushState(
        historyStateWithFocus(nextArtifact),
        "",
        buildObservatoryFocusHref(currentRelativeHref(), nextArtifact),
      );
    });

    const onPopState = () => applyLocation();
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.key !== "Escape" ||
        isEditableNavigationTarget(event.target) ||
        store.getSnapshot().selection.artifactId === null
      ) {
        return;
      }
      event.preventDefault();
      store.dispatch({ type: "artifact/clear" });
    };

    window.addEventListener("popstate", onPopState);
    document.addEventListener("keydown", onKeyDown);
    applyLocation();

    return () => {
      unsubscribe();
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [store]);

  return null;
}
