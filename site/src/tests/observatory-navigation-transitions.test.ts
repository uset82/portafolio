import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  OBSERVATORY_CAMERA_TRANSITION,
  advanceCameraTransition,
  captureCameraTransitionDiagnostics,
  cameraPoseFromView,
  cameraPosesApproximatelyEqual,
  createCameraTransition,
  resolveCameraTransitionDuration,
  resolveCameraTransitionMode,
} from "@/lib/three/camera-transition";
import {
  buildObservatoryFocusHref,
  readObservatoryFocusQuery,
} from "@/lib/three/observatory-navigation";
import { CAMERA_VIEWS } from "@/lib/three/scene-config";

const workspaceRoot = process.cwd();

function readSource(relativePath: string) {
  return readFileSync(path.join(workspaceRoot, relativePath), "utf8");
}

test("camera interpolation is deterministic, bounded, and lands exactly on the requested view", () => {
  const from = cameraPoseFromView(CAMERA_VIEWS.home);
  const to = cameraPoseFromView(CAMERA_VIEWS.astraea);
  let transition = createCameraTransition(7, from, to, CAMERA_VIEWS.astraea.durationMs);
  const first = advanceCameraTransition(transition, Number.POSITIVE_INFINITY);

  assert.equal(first.transition.elapsedMs, transition.elapsedMs);
  assert.deepEqual(first.pose, from);
  assert.equal(first.complete, false);

  let samples = 0;
  while (transition.elapsedMs < transition.durationMs) {
    const frame = advanceCameraTransition(transition, 1_000);
    assert.equal(
      frame.transition.elapsedMs - transition.elapsedMs <=
        OBSERVATORY_CAMERA_TRANSITION.maximumFrameDeltaMs,
      true,
    );
    transition = frame.transition;
    samples += 1;
    if (frame.complete) {
      assert.deepEqual(frame.pose, to);
      break;
    }
  }

  assert.equal(samples > 1, true);
  assert.equal(transition.elapsedMs, transition.durationMs);
});

test("camera motion pauses while hidden and becomes immediate for reduced motion or global pause", () => {
  const base = {
    quality: "full" as const,
    lifecycleReady: true,
    reducedMotion: false,
    userPaused: false,
    documentVisible: true,
  };

  assert.equal(resolveCameraTransitionMode(base), "animated");
  assert.equal(resolveCameraTransitionMode({ ...base, documentVisible: false }), "paused");
  assert.equal(resolveCameraTransitionMode({ ...base, reducedMotion: true }), "immediate");
  assert.equal(resolveCameraTransitionMode({ ...base, userPaused: true }), "immediate");
  assert.equal(resolveCameraTransitionMode({ ...base, quality: "static" }), "immediate");
  assert.equal(
    resolveCameraTransitionDuration(CAMERA_VIEWS.astraea, "reduced") <
      CAMERA_VIEWS.astraea.durationMs,
    true,
  );
});

test("camera diagnostics expose progress, pause, alignment, and interruption evidence", () => {
  const from = cameraPoseFromView(CAMERA_VIEWS.home);
  const to = cameraPoseFromView(CAMERA_VIEWS.astraea);
  const transition = createCameraTransition(7, from, to, CAMERA_VIEWS.astraea.durationMs);
  const frame = advanceCameraTransition(transition, 50);
  const counters = {
    animatedStarted: 1,
    animatedCompleted: 0,
    immediateCompleted: 0,
    interrupted: 0,
  };
  const active = captureCameraTransitionDiagnostics({
    cameraMounted: true,
    view: CAMERA_VIEWS.astraea,
    scenePhase: "transitioning",
    mode: "animated",
    requestId: 7,
    currentPose: frame.pose,
    transition: frame.transition,
    counters,
  });

  assert.equal(active.version, 1);
  assert.equal(active.viewId, "astraea");
  assert.equal(active.alignedWithRequestedView, false);
  assert.equal(active.activeTransition?.requestMatchesScene, true);
  assert.equal(active.activeTransition?.elapsedMs, 50);
  assert.equal(active.activeTransition?.remainingMs, CAMERA_VIEWS.astraea.durationMs - 50);
  assert.equal(active.activeTransition?.rawProgress, 50 / CAMERA_VIEWS.astraea.durationMs);
  assert.equal((active.activeTransition?.easedProgress ?? 0) > 0, true);
  assert.equal(active.remaining.positionMeters > 0, true);
  assert.deepEqual(active.counters, counters);

  const paused = captureCameraTransitionDiagnostics({
    cameraMounted: true,
    view: CAMERA_VIEWS.astraea,
    scenePhase: "transitioning",
    mode: "paused",
    requestId: 7,
    currentPose: frame.pose,
    transition: frame.transition,
    counters,
  });
  assert.equal(paused.mode, "paused");
  assert.equal(paused.activeTransition?.elapsedMs, active.activeTransition?.elapsedMs);

  const interrupted = captureCameraTransitionDiagnostics({
    cameraMounted: true,
    view: CAMERA_VIEWS.pinaculo,
    scenePhase: "requested",
    mode: "animated",
    requestId: 8,
    currentPose: frame.pose,
    transition: frame.transition,
    counters: { ...counters, interrupted: 1 },
  });
  assert.equal(interrupted.activeTransition?.requestMatchesScene, false);
  assert.equal(interrupted.counters.interrupted, 1);

  const settled = captureCameraTransitionDiagnostics({
    cameraMounted: true,
    view: CAMERA_VIEWS.astraea,
    scenePhase: "settled",
    mode: "animated",
    requestId: 7,
    currentPose: to,
    transition: null,
    counters: { ...counters, animatedCompleted: 1 },
  });
  assert.equal(settled.alignedWithRequestedView, true);
  assert.equal(settled.activeTransition, null);
  assert.deepEqual(settled.remaining, {
    positionMeters: 0,
    targetMeters: 0,
    fovDegrees: 0,
    nearMeters: 0,
    farMeters: 0,
  });
  assert.equal(JSON.stringify(settled).includes('"viewId":"astraea"'), true);
  assert.equal(cameraPosesApproximatelyEqual(to, { ...to, near: to.near + 0.01 }), false);
});

test("focus deep links preserve unrelated query state and reject unknown scene targets", () => {
  assert.deepEqual(readObservatoryFocusQuery(""), {
    artifactId: null,
    hasParameter: false,
    valid: true,
  });
  assert.deepEqual(readObservatoryFocusQuery("?focus=astraea"), {
    artifactId: "astraea",
    hasParameter: true,
    valid: true,
  });
  assert.deepEqual(readObservatoryFocusQuery("?focus=unknown"), {
    artifactId: null,
    hasParameter: true,
    valid: false,
  });
  assert.equal(
    buildObservatoryFocusHref("/?source=portfolio#observatory", "sound-lab"),
    "/?source=portfolio&focus=sound-lab#observatory",
  );
  assert.equal(
    buildObservatoryFocusHref("/?source=portfolio&focus=sound-lab#observatory", null),
    "/?source=portfolio#observatory",
  );
});

test("the focus controller owns reversible URL history, Escape, and editable-target protection", () => {
  const controller = readSource("src/components/three/observatory-navigation-controller.tsx");
  const access = readSource("src/components/three/observatory-artifact-access.tsx");
  const progressive = readSource("src/components/three/observatory-progressive-experience.tsx");

  assert.match(controller, /window\.history\.pushState/);
  assert.match(controller, /window\.history\.replaceState/);
  assert.match(controller, /window\.addEventListener\("popstate"/);
  assert.match(controller, /document\.addEventListener\("keydown"/);
  assert.match(controller, /event\.key !== "Escape"/);
  assert.match(controller, /isEditableNavigationTarget/);
  assert.match(controller, /artifact\/clear/);
  assert.doesNotMatch(controller, /router\.push|router\.replace|preventDefault\(\).*Link/);
  assert.match(access, /selected[\s\S]*artifact\/clear[\s\S]*artifact\/select/);
  assert.match(access, /Return to overview/);
  assert.match(progressive, /data-scene-layer="navigation-status"/);
  assert.match(progressive, /Press Escape or activate Return to overview/);
  assert.match(progressive, /complete poster and destination link remain available/);
});

test("camera diagnostics are opt-in and forwarded without a global or second loop", () => {
  const shell = readSource("src/components/three/observatory-scene-shell.tsx");
  const liveScene = readSource("src/components/three/observatory-live-scene.tsx");
  const progressive = readSource("src/components/three/observatory-progressive-experience.tsx");

  assert.match(shell, /captureCameraTransitionDiagnostics/);
  assert.match(shell, /onCameraDiagnosticsReady/);
  assert.match(shell, /countersRef\.current\.interrupted/);
  assert.match(shell, /countersRef\.current\.animatedCompleted/);
  assert.match(liveScene, /onCameraDiagnosticsReady/);
  assert.match(progressive, /onCameraDiagnosticsReady/);
  assert.doesNotMatch(shell, /window\.__|globalThis\.|requestAnimationFrame|useState/);
});

test("primary routes remain native semantic links with a restrained reduced-motion-safe entry", () => {
  const records = readSource("src/content/records.ts");
  const header = readSource("src/components/site-header.tsx");
  const template = readSource("src/app/template.tsx");
  const styles = readSource("src/app/globals.css");
  const routeEntryStart = styles.indexOf("@keyframes route-entry-settle");
  const routeEntryEnd = styles.indexOf("\nbutton,", routeEntryStart);
  const routeEntryStyles = styles.slice(routeEntryStart, routeEntryEnd);

  // The header carries four verbs; Laboratory and Cosmos moved to the footer
  // list. Every route stays reachable — only which list it sits in changed.
  for (const [label, href] of [
    ["Play", "/arcade"],
    ["See", "/work"],
    ["Listen", "/sound"],
    ["About", "/story"],
    ["Laboratory", "/laboratory"],
    ["Cosmos", "/cosmos"],
    ["Support", "/support"],
    ["Contact", "/contact"],
  ] as const) {
    assert.match(records, new RegExp(`"${label}", "${href}"`));
  }
  assert.match(header, /<Link/);
  assert.match(header, /aria-current=\{active \? "page" : undefined\}/);
  assert.doesNotMatch(header, /router\.push|window\.location|preventDefault/);
  assert.match(template, /className="route-transition-shell"/);
  assert.match(styles, /@keyframes route-entry-settle/);
  assert.match(routeEntryStyles, /from\s*\{\s*opacity:\s*0\.01/);
  assert.match(routeEntryStyles, /to\s*\{\s*opacity:\s*1/);
  assert.doesNotMatch(routeEntryStyles, /transform:/);
  assert.match(
    styles,
    /\.observatory-artifact-access__focus\s*\{[\s\S]*min-height:\s*var\(--control-height\)[\s\S]*touch-action:\s*manipulation/,
  );
  assert.match(
    styles,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.route-transition-shell\s*\{[\s\S]*animation:\s*none/,
  );
});
