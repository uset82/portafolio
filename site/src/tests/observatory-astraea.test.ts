import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ObservatoryArtifactAccess } from "@/components/three/observatory-artifact-access";
import {
  ObservatorySceneProvider,
  type ObservatorySceneProviderProps,
} from "@/components/three/observatory-scene-provider";
import {
  ASTRAEA_DIAGNOSTIC_SETTLE_TOLERANCES,
  OBSERVATORY_ASTRAEA_TECHNICAL_ART,
  captureAstraeaDiagnostics,
  resolveAstraeaPresentation,
  resolveAstraeaRingPose,
} from "@/lib/three/astraea-system";
import { getObservatoryAsset } from "@/lib/three/asset-registry";
import { createObservatorySceneStore } from "@/lib/three/scene-state";
import { naturalPalette } from "@/styles/palette";

const workspaceRoot = process.cwd();

function readSource(relativePath: string) {
  return readFileSync(path.join(workspaceRoot, relativePath), "utf8");
}

test("ASTRAEA is a runtime-authored natural-palette mechanism inside its declared budget", () => {
  const asset = getObservatoryAsset("astraea");
  const { tiers, colors } = OBSERVATORY_ASTRAEA_TECHNICAL_ART;
  const palette = new Set(Object.values(naturalPalette));

  assert.equal(asset.kind, "procedural");
  assert.equal(asset.status, "specified");
  assert.deepEqual(OBSERVATORY_ASTRAEA_TECHNICAL_ART.dimensionsMeters, asset.scaleMeters);
  assert.equal(tiers.full.ringCount, 3);
  assert.equal(tiers.reduced.ringCount, 2);
  assert.equal(tiers.full.maximumTriangles <= asset.lods[0]!.maxTriangles, true);
  assert.equal(tiers.reduced.maximumTriangles <= asset.lods[1]!.maxTriangles, true);
  assert.equal(tiers.full.materials, 4);
  assert.equal(tiers.full.textures, 0);
  assert.equal(tiers.full.renderTargets, 0);
  assert.equal(tiers.full.postPasses, 0);
  assert.equal(tiers.full.shadowCasters, 0);
  assert.equal(OBSERVATORY_ASTRAEA_TECHNICAL_ART.maximumAnimatedFps <= 24, true);
  assert.equal(OBSERVATORY_ASTRAEA_TECHNICAL_ART.interactionNodeName, "AstraeaInteraction");
  assert.equal(asset.nodes.includes(OBSERVATORY_ASTRAEA_TECHNICAL_ART.interactionNodeName), true);
  for (const color of Object.values(colors)) assert.equal(palette.has(color), true);
  assert.deepEqual(OBSERVATORY_ASTRAEA_TECHNICAL_ART.prohibitedDetails, [
    "letters-or-numerals",
    "zodiac-glyphs",
    "pseudo-writing",
    "screen-ui",
    "neon-emission",
    "magical-particles",
  ]);
});

test("ASTRAEA selection has a deterministic mechanical pose and immediate compact equivalent", () => {
  const rest = resolveAstraeaRingPose(0);
  const focus = resolveAstraeaRingPose(1);
  const midpoint = resolveAstraeaRingPose(0.5);

  assert.notDeepEqual(rest, focus);
  assert.equal(midpoint.outer > rest.outer && midpoint.outer < focus.outer, true);
  assert.equal(focus.pointerLift > rest.pointerLift, true);
  assert.deepEqual(resolveAstraeaPresentation("static", "static", false), {
    tier: "poster",
    animated: false,
    settleImmediately: true,
  });
  assert.deepEqual(resolveAstraeaPresentation("full", "full", true), {
    tier: "reduced",
    animated: false,
    settleImmediately: true,
  });
  assert.deepEqual(resolveAstraeaPresentation("full", "reduced", false), {
    tier: "reduced",
    animated: false,
    settleImmediately: true,
  });
  assert.deepEqual(resolveAstraeaPresentation("full", "paused", false), {
    tier: "full",
    animated: false,
    settleImmediately: false,
  });
  assert.deepEqual(resolveAstraeaPresentation("full", "full", false), {
    tier: "full",
    animated: true,
    settleImmediately: false,
  });
});

test("ASTRAEA diagnostics report exact aligned rest and focus poses", () => {
  const presentation = resolveAstraeaPresentation("full", "full", false);
  const restPose = resolveAstraeaRingPose(0);
  const focusPose = resolveAstraeaRingPose(1);
  const rest = captureAstraeaDiagnostics({
    presentation,
    selected: false,
    progress: 0,
    targetProgress: 0,
    pose: restPose,
  });
  const focus = captureAstraeaDiagnostics({
    presentation,
    selected: true,
    progress: 1,
    targetProgress: 1,
    pose: focusPose,
  });

  assert.equal(rest.phase, "settled");
  assert.equal(rest.alignment?.settled, true);
  assert.equal(rest.alignment?.maximumRingErrorRadians, 0);
  assert.equal(rest.alignment?.pointerErrorMeters, 0);
  assert.equal(focus.phase, "settled");
  assert.equal(focus.selected, true);
  assert.equal(focus.targetProgress, 1);
  assert.deepEqual(focus.currentPose, focus.targetPose);
  assert.equal(JSON.stringify(focus).includes('"phase":"settled"'), true);
});

test("ASTRAEA diagnostics distinguish transition, pause, reduced, poster, and malformed state", () => {
  const midpointPose = resolveAstraeaRingPose(0.5);
  const animating = captureAstraeaDiagnostics({
    presentation: resolveAstraeaPresentation("full", "full", false),
    selected: true,
    progress: 0.5,
    targetProgress: 1,
    pose: midpointPose,
  });
  const paused = captureAstraeaDiagnostics({
    presentation: resolveAstraeaPresentation("full", "paused", false),
    selected: true,
    progress: 0.5,
    targetProgress: 1,
    pose: midpointPose,
  });
  const reduced = captureAstraeaDiagnostics({
    presentation: resolveAstraeaPresentation("reduced", "full", false),
    selected: true,
    progress: 1,
    targetProgress: 1,
    pose: resolveAstraeaRingPose(1),
  });
  const poster = captureAstraeaDiagnostics({
    presentation: resolveAstraeaPresentation("static", "static", false),
    selected: false,
    progress: 0,
    targetProgress: 0,
    pose: resolveAstraeaRingPose(0),
  });
  const malformed = captureAstraeaDiagnostics({
    presentation: resolveAstraeaPresentation("full", "full", false),
    selected: true,
    progress: 0.5,
    targetProgress: 1,
    pose: { ...midpointPose, outer: Number.NaN },
  });

  assert.equal(animating.phase, "animating");
  assert.equal(animating.alignment?.settled, false);
  assert.equal(
    animating.alignment!.maximumRingErrorRadians > ASTRAEA_DIAGNOSTIC_SETTLE_TOLERANCES.ringRadians,
    true,
  );
  assert.equal(paused.phase, "paused");
  assert.equal(reduced.phase, "reduced");
  assert.equal(reduced.alignment?.settled, true);
  assert.equal(poster.phase, "poster");
  assert.equal(poster.currentPose, null);
  assert.equal(poster.alignment, null);
  assert.equal(malformed.currentPose, null);
  assert.equal(malformed.alignment, null);
  assert.doesNotThrow(() => JSON.stringify(malformed));
});

test("the ASTRAEA DOM equivalent uses verified project content and the external scene store", () => {
  const store = createObservatorySceneStore();
  store.dispatch({ type: "artifact/select", artifactId: "astraea" });
  const artifact = {
    artifactId: "astraea" as const,
    href: "/work/astraea",
    title: "ASTRAEA",
    descriptor: "Celestial intelligence",
    status: "concept",
    mechanismDescription: "Three marked rings align when focused.",
  };
  const markup = renderToStaticMarkup(
    createElement(
      ObservatorySceneProvider,
      { store } as ObservatorySceneProviderProps,
      createElement(ObservatoryArtifactAccess, { artifact, interactive: true }),
    ),
  );

  assert.match(markup, /data-scene-layer="artifact-access"/);
  assert.match(markup, /data-artifact-id="astraea"/);
  assert.match(markup, /data-selected="true"/);
  assert.match(markup, /href="\/work\/astraea"/);
  assert.match(markup, /Open ASTRAEA — Celestial intelligence/);
  assert.match(markup, /concept/);
  assert.match(markup, /aria-pressed="true"/);
  assert.match(markup, /aria-label="Return ASTRAEA to overview"/);
  assert.match(markup, /Return to overview/);
});

test("the scene owns one bounded ASTRAEA interaction path with no text mesh or perpetual loop", () => {
  const astraeaSource = readSource("src/components/three/observatory-astraea.tsx");
  const shellSource = readSource("src/components/three/observatory-scene-shell.tsx");
  const accessSource = readSource("src/components/three/observatory-artifact-access.tsx");
  const experienceSource = readSource(
    "src/components/three/observatory-progressive-experience.tsx",
  );
  const pageSource = readSource("src/components/home-page.tsx");
  const styles = readSource("src/app/globals.css");

  assert.match(astraeaSource, /useFrame/);
  assert.match(astraeaSource, /window\.setInterval/);
  assert.match(astraeaSource, /window\.setTimeout/);
  assert.match(astraeaSource, /focusDurationMs/);
  assert.match(astraeaSource, /resolveAstraeaRingPose\(progressRef\.current\)/);
  assert.match(astraeaSource, /settleTransition\(\);[\s\S]*invalidate\(\);/);
  assert.match(astraeaSource, /onClick=\{selectAstraea\}/);
  assert.match(astraeaSource, /artifact\/select/);
  assert.match(astraeaSource, /name=\{OBSERVATORY_ASTRAEA_TECHNICAL_ART\.interactionNodeName\}/);
  assert.match(astraeaSource, /visible=\{false\}/);
  assert.match(astraeaSource, /AstraeaRing/);
  assert.match(astraeaSource, /AstraeaFocusPointer/);
  assert.match(astraeaSource, /captureAstraeaDiagnostics/);
  assert.match(astraeaSource, /onDiagnosticsReady\(null\)/);
  assert.doesNotMatch(astraeaSource, /useState|TextGeometry|troika|CanvasTexture|VideoTexture/);
  assert.match(shellSource, /group\.id === "artifacts"/);
  assert.match(shellSource, /<ObservatoryAstraea/);
  assert.match(shellSource, /onAstraeaDiagnosticsReady/);
  assert.match(accessSource, /<Link/);
  assert.match(accessSource, /aria-pressed=\{selected\}/);
  assert.match(experienceSource, /artifacts\.map/);
  assert.match(pageSource, /\["astraea", "pinaculo", "future-energy"\] as const/);
  assert.match(
    styles,
    /@media \(max-width: 47\.99rem\)[\s\S]*\.observatory-artifact-access__focus/,
  );
  assert.match(styles, /\.observatory-artifact-access\s*\{[\s\S]*rgb\(254 244 234 \/ 96%\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
