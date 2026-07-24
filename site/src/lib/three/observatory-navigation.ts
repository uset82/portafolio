import { SCENE_ARTIFACT_IDS, type SceneArtifactId } from "./scene-config";

const artifactIds = new Set<string>(SCENE_ARTIFACT_IDS);

export const OBSERVATORY_FOCUS_QUERY_KEY = "focus";

export type ObservatoryFocusQuery = {
  artifactId: SceneArtifactId | null;
  hasParameter: boolean;
  valid: boolean;
};

export function readObservatoryFocusQuery(search: string): ObservatoryFocusQuery {
  const params = new URLSearchParams(search);
  const value = params.get(OBSERVATORY_FOCUS_QUERY_KEY);
  const hasParameter = params.has(OBSERVATORY_FOCUS_QUERY_KEY);

  if (!hasParameter) return { artifactId: null, hasParameter: false, valid: true };
  if (!value || !artifactIds.has(value)) {
    return { artifactId: null, hasParameter: true, valid: false };
  }
  return {
    artifactId: value as SceneArtifactId,
    hasParameter: true,
    valid: true,
  };
}

export function buildObservatoryFocusHref(currentHref: string, artifactId: SceneArtifactId | null) {
  const url = new URL(currentHref, "https://portfolio.local");
  if (artifactId) url.searchParams.set(OBSERVATORY_FOCUS_QUERY_KEY, artifactId);
  else url.searchParams.delete(OBSERVATORY_FOCUS_QUERY_KEY);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function isEditableNavigationTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}
