import type { QualityPreference } from "./capability-policy";

export const OBSERVATORY_PREFERENCES_STORAGE_KEY = "carlos-observatory-preferences-v1";
export const OBSERVATORY_PREFERENCES_VERSION = 1;

export type SceneMotionSetting = "system" | "reduce";

export type ObservatoryExperiencePreferences = {
  version: typeof OBSERVATORY_PREFERENCES_VERSION;
  quality: QualityPreference;
  motion: SceneMotionSetting;
  paused: boolean;
};

export type ExperiencePreferenceStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const DEFAULT_OBSERVATORY_EXPERIENCE_PREFERENCES: ObservatoryExperiencePreferences = {
  version: OBSERVATORY_PREFERENCES_VERSION,
  quality: "auto",
  motion: "system",
  paused: false,
};

const qualityPreferences = new Set<QualityPreference>(["auto", "full", "reduced", "static"]);
const motionSettings = new Set<SceneMotionSetting>(["system", "reduce"]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export function parseObservatoryExperiencePreferences(
  rawValue: string | null,
): ObservatoryExperiencePreferences | null {
  if (rawValue === null) return null;

  let value: unknown;
  try {
    value = JSON.parse(rawValue);
  } catch {
    return null;
  }

  if (
    !isRecord(value) ||
    value.version !== OBSERVATORY_PREFERENCES_VERSION ||
    typeof value.quality !== "string" ||
    !qualityPreferences.has(value.quality as QualityPreference) ||
    typeof value.motion !== "string" ||
    !motionSettings.has(value.motion as SceneMotionSetting) ||
    typeof value.paused !== "boolean"
  ) {
    return null;
  }

  return {
    version: OBSERVATORY_PREFERENCES_VERSION,
    quality: value.quality as QualityPreference,
    motion: value.motion as SceneMotionSetting,
    paused: value.paused,
  };
}

export function readObservatoryExperiencePreferences(
  storage: ExperiencePreferenceStorage,
): ObservatoryExperiencePreferences | null {
  return parseObservatoryExperiencePreferences(
    storage.getItem(OBSERVATORY_PREFERENCES_STORAGE_KEY),
  );
}

export function writeObservatoryExperiencePreferences(
  storage: ExperiencePreferenceStorage,
  preferences: ObservatoryExperiencePreferences,
) {
  storage.setItem(OBSERVATORY_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
}

export function clearObservatoryExperiencePreferences(storage: ExperiencePreferenceStorage) {
  storage.removeItem(OBSERVATORY_PREFERENCES_STORAGE_KEY);
}

export function resolveSceneMotionPreference(
  setting: SceneMotionSetting,
  systemReducedMotion: boolean,
): "no-preference" | "reduce" {
  return setting === "reduce" || systemReducedMotion ? "reduce" : "no-preference";
}
