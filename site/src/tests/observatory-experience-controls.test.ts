import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  clearObservatoryExperiencePreferences,
  DEFAULT_OBSERVATORY_EXPERIENCE_PREFERENCES,
  OBSERVATORY_PREFERENCES_STORAGE_KEY,
  parseObservatoryExperiencePreferences,
  readObservatoryExperiencePreferences,
  resolveSceneMotionPreference,
  writeObservatoryExperiencePreferences,
  type ExperiencePreferenceStorage,
} from "@/lib/three/experience-preferences";
import { createObservatorySceneStore } from "@/lib/three/scene-state";

function createMemoryStorage(): ExperiencePreferenceStorage & {
  values: Map<string, string>;
} {
  const values = new Map<string, string>();
  return {
    values,
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

test("experience preferences accept only the versioned quality, motion, and pause contract", () => {
  const valid = {
    version: 1,
    quality: "static",
    motion: "reduce",
    paused: true,
  } as const;

  assert.deepEqual(parseObservatoryExperiencePreferences(JSON.stringify(valid)), valid);
  assert.equal(parseObservatoryExperiencePreferences(null), null);
  assert.equal(parseObservatoryExperiencePreferences("{"), null);
  assert.equal(
    parseObservatoryExperiencePreferences(JSON.stringify({ ...valid, version: 2 })),
    null,
  );
  assert.equal(
    parseObservatoryExperiencePreferences(JSON.stringify({ ...valid, quality: "ultra" })),
    null,
  );
  assert.equal(
    parseObservatoryExperiencePreferences(JSON.stringify({ ...valid, motion: "force-motion" })),
    null,
  );
  assert.equal(
    parseObservatoryExperiencePreferences(JSON.stringify({ ...valid, paused: "yes" })),
    null,
  );
});

test("preference storage is explicit, local, removable, and never contains sound activation", () => {
  const storage = createMemoryStorage();
  const preferences = {
    version: 1,
    quality: "reduced",
    motion: "system",
    paused: true,
  } as const;

  assert.equal(readObservatoryExperiencePreferences(storage), null);
  writeObservatoryExperiencePreferences(storage, preferences);
  assert.deepEqual(readObservatoryExperiencePreferences(storage), preferences);
  assert.doesNotMatch(storage.values.get(OBSERVATORY_PREFERENCES_STORAGE_KEY) ?? "", /sound|play/i);

  clearObservatoryExperiencePreferences(storage);
  assert.equal(storage.values.has(OBSERVATORY_PREFERENCES_STORAGE_KEY), false);
});

test("system motion is never overridden while an explicit reduce choice always wins", () => {
  assert.equal(resolveSceneMotionPreference("system", false), "no-preference");
  assert.equal(resolveSceneMotionPreference("system", true), "reduce");
  assert.equal(resolveSceneMotionPreference("reduce", false), "reduce");
  assert.equal(resolveSceneMotionPreference("reduce", true), "reduce");
});

test("scene preference apply and reset remain atomic, mute-first, and preserve unavailable sound", () => {
  const store = createObservatorySceneStore();
  store.dispatch({ type: "sound/unavailable" });
  store.dispatch({
    type: "preferences/apply",
    preferences: {
      version: 1,
      quality: "full",
      motion: "reduce",
      paused: true,
    },
  });

  assert.equal(store.getSnapshot().quality.preference, "full");
  assert.equal(store.getSnapshot().motion.setting, "reduce");
  assert.equal(store.getSnapshot().motion.preference, "reduce");
  assert.equal(store.getSnapshot().motion.userPaused, true);

  store.dispatch({ type: "preferences/reset" });
  assert.equal(
    store.getSnapshot().quality.preference,
    DEFAULT_OBSERVATORY_EXPERIENCE_PREFERENCES.quality,
  );
  assert.equal(
    store.getSnapshot().motion.setting,
    DEFAULT_OBSERVATORY_EXPERIENCE_PREFERENCES.motion,
  );
  assert.equal(store.getSnapshot().motion.userPaused, false);
  assert.deepEqual(store.getSnapshot().sound, { status: "unavailable", muted: true });
});

test("the mounted control source is semantic, discoverable, and keeps every fallback route independent", () => {
  const controlSource = readFileSync(
    path.join(process.cwd(), "src/components/three/observatory-experience-controls.tsx"),
    "utf8",
  );
  const controlStyles = readFileSync(
    path.join(process.cwd(), "src/components/three/observatory-experience-controls.module.css"),
    "utf8",
  );
  const progressiveSource = readFileSync(
    path.join(process.cwd(), "src/components/three/observatory-progressive-experience.tsx"),
    "utf8",
  );
  const homeSource = readFileSync(path.join(process.cwd(), "src/app/page.tsx"), "utf8");
  const headerSource = readFileSync(
    path.join(process.cwd(), "src/components/site-header.tsx"),
    "utf8",
  );

  assert.match(controlSource, /<details/);
  assert.match(controlSource, /id="observatory-experience-settings"/);
  assert.match(controlSource, /<legend>Visual quality<\/legend>/);
  assert.match(controlSource, /<legend>Motion<\/legend>/);
  assert.match(controlSource, /"auto"[\s\S]*"full"[\s\S]*"reduced"[\s\S]*"static"/);
  assert.match(controlSource, /"system"[\s\S]*"reduce"/);
  assert.match(controlSource, /type="radio"/);
  assert.match(controlSource, /aria-pressed=/);
  assert.match(controlSource, /Sound status/);
  assert.match(controlSource, /Reset settings/);
  assert.match(controlSource, /role="status"/);
  assert.match(controlSource, /window\.localStorage/);
  assert.match(controlSource, /window\.addEventListener\("storage"/);
  assert.match(controlSource, /event\.key !== "Escape"/);
  assert.match(controlSource, /Sound always starts off/);
  assert.doesNotMatch(controlSource, /sound\/play|autoplay/);
  assert.match(progressiveSource, /artifacts\.map/);
  assert.match(
    homeSource,
    /<ObservatorySceneRuntimeProvider>[\s\S]*?<SceneReveal>[\s\S]*?<ObservatoryProgressiveExperienceContent[\s\S]*?<\/SceneReveal>[\s\S]*?<ObservatoryExperienceControls \/>/,
  );
  assert.match(headerSource, /href="\/#observatory-experience-settings"/);
  assert.match(controlStyles, /min-height: var\(--control-height\)/);
  assert.match(
    controlStyles,
    /@media \(max-width: 47\.99rem\)[\s\S]*?\.root\s*\{[^}]*position: relative/,
  );
  assert.match(controlStyles, /@media \(prefers-reduced-motion: reduce\)/);
});
