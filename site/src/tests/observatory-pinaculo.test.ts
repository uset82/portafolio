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
import { getObservatoryAsset } from "@/lib/three/asset-registry";
import {
  OBSERVATORY_PINACULO_TECHNICAL_ART,
  PINACULO_DIAGNOSTIC_SETTLE_TOLERANCES,
  PINACULO_MASTER_GROOVE_COUNT,
  PINACULO_MASTER_PATTERN_STATIONS,
  PINACULO_POSITION_COUNT,
  capturePinaculoDiagnostics,
  resolvePinaculoMechanismPose,
  resolvePinaculoPresentation,
} from "@/lib/three/pinaculo-system";
import { createObservatorySceneStore } from "@/lib/three/scene-state";
import { naturalPalette } from "@/styles/palette";

const workspaceRoot = process.cwd();

function readSource(relativePath: string) {
  return readFileSync(path.join(workspaceRoot, relativePath), "utf8");
}

function relativeLuminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
}

function contrastRatio(foreground: string, background: string) {
  const light = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const dark = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (light + 0.05) / (dark + 0.05);
}

test("PINÁCULO preserves 24 positions and restrained 11/22/33 pattern stations", () => {
  const asset = getObservatoryAsset("pinaculo");
  const { tiers, colors } = OBSERVATORY_PINACULO_TECHNICAL_ART;
  const palette = new Set(Object.values(naturalPalette));

  assert.equal(asset.kind, "procedural");
  assert.equal(asset.status, "specified");
  assert.equal(PINACULO_POSITION_COUNT, 24);
  assert.deepEqual(
    PINACULO_MASTER_PATTERN_STATIONS.map((station) => station.reference),
    [11, 22, 33],
  );
  assert.deepEqual(
    PINACULO_MASTER_PATTERN_STATIONS.map((station) => station.groovesPerMarker),
    [1, 2, 3],
  );
  assert.equal(PINACULO_MASTER_GROOVE_COUNT, 12);
  assert.equal(
    PINACULO_MASTER_PATTERN_STATIONS.every(
      (station) =>
        station.markerIndices.length === 2 &&
        station.markerIndices.every((index) => index >= 0 && index < PINACULO_POSITION_COUNT),
    ),
    true,
  );
  assert.deepEqual(OBSERVATORY_PINACULO_TECHNICAL_ART.dimensionsMeters, asset.scaleMeters);
  assert.equal(tiers.full.markerCount, 24);
  assert.equal(tiers.reduced.markerCount, 24);
  assert.equal(tiers.full.maximumTriangles <= asset.lods[0]!.maxTriangles, true);
  assert.equal(tiers.reduced.maximumTriangles <= asset.lods[1]!.maxTriangles, true);
  assert.equal(tiers.full.maximumDrawCalls <= 12, true);
  assert.equal(tiers.full.materials, 4);
  assert.equal(tiers.full.textures, 0);
  assert.equal(tiers.full.renderTargets, 0);
  assert.equal(tiers.full.postPasses, 0);
  assert.equal(tiers.full.shadowCasters, 0);
  assert.equal(OBSERVATORY_PINACULO_TECHNICAL_ART.maximumAnimatedFps <= 24, true);
  assert.equal(OBSERVATORY_PINACULO_TECHNICAL_ART.interactionNodeName, "PinaculoInteraction");
  assert.equal(asset.nodes.includes(OBSERVATORY_PINACULO_TECHNICAL_ART.interactionNodeName), true);
  assert.equal(contrastRatio(colors.buff, colors.walnut) >= 3, true);
  for (const color of Object.values(colors)) assert.equal(palette.has(color), true);
});

test("PINÁCULO selection advances one position while compact and reduced paths settle immediately", () => {
  const rest = resolvePinaculoMechanismPose(0);
  const focus = resolvePinaculoMechanismPose(1);

  assert.equal(rest.carrierRotation, 0);
  assert.equal(
    focus.carrierRotation,
    (Math.PI * 2) / OBSERVATORY_PINACULO_TECHNICAL_ART.positionCount,
  );
  assert.equal(focus.latchLift > rest.latchLift, true);
  assert.deepEqual(resolvePinaculoPresentation("static", "static", false), {
    tier: "poster",
    animated: false,
    settleImmediately: true,
  });
  assert.deepEqual(resolvePinaculoPresentation("full", "full", true), {
    tier: "reduced",
    animated: false,
    settleImmediately: true,
  });
  assert.deepEqual(resolvePinaculoPresentation("full", "reduced", false), {
    tier: "reduced",
    animated: false,
    settleImmediately: true,
  });
  assert.deepEqual(resolvePinaculoPresentation("full", "paused", false), {
    tier: "full",
    animated: false,
    settleImmediately: false,
  });
  assert.deepEqual(resolvePinaculoPresentation("full", "full", false), {
    tier: "full",
    animated: true,
    settleImmediately: false,
  });
});

test("PINÁCULO diagnostics prove exact settled rest and one-position focus states", () => {
  const presentation = resolvePinaculoPresentation("full", "full", false);
  const rest = capturePinaculoDiagnostics({
    presentation,
    selected: false,
    progress: 0,
    targetProgress: 0,
    pose: resolvePinaculoMechanismPose(0),
  });
  const focus = capturePinaculoDiagnostics({
    presentation,
    selected: true,
    progress: 1,
    targetProgress: 1,
    pose: resolvePinaculoMechanismPose(1),
  });

  assert.equal(rest.phase, "settled");
  assert.equal(rest.positionCount, 24);
  assert.equal(rest.currentPositionOffset, 0);
  assert.equal(rest.alignment?.settled, true);
  assert.equal(focus.phase, "settled");
  assert.equal(focus.selected, true);
  assert.equal(focus.targetPositionOffset, 1);
  assert.equal(focus.currentPositionOffset, 1);
  assert.equal(focus.currentPose?.carrierRotation, (Math.PI * 2) / PINACULO_POSITION_COUNT);
  assert.equal(focus.alignment?.carrierErrorRadians, 0);
  assert.equal(focus.alignment?.latchErrorMeters, 0);
  assert.equal(JSON.stringify(focus).includes('"currentPositionOffset":1'), true);
});

test("PINÁCULO diagnostics distinguish transition, pause, reduced, poster, and malformed state", () => {
  const midpointPose = resolvePinaculoMechanismPose(0.5);
  const animating = capturePinaculoDiagnostics({
    presentation: resolvePinaculoPresentation("full", "full", false),
    selected: true,
    progress: 0.5,
    targetProgress: 1,
    pose: midpointPose,
  });
  const paused = capturePinaculoDiagnostics({
    presentation: resolvePinaculoPresentation("full", "paused", false),
    selected: true,
    progress: 0.5,
    targetProgress: 1,
    pose: midpointPose,
  });
  const reduced = capturePinaculoDiagnostics({
    presentation: resolvePinaculoPresentation("reduced", "full", false),
    selected: true,
    progress: 1,
    targetProgress: 1,
    pose: resolvePinaculoMechanismPose(1),
  });
  const poster = capturePinaculoDiagnostics({
    presentation: resolvePinaculoPresentation("static", "static", false),
    selected: false,
    progress: 0,
    targetProgress: 0,
    pose: resolvePinaculoMechanismPose(0),
  });
  const malformed = capturePinaculoDiagnostics({
    presentation: resolvePinaculoPresentation("full", "full", false),
    selected: true,
    progress: 0.5,
    targetProgress: 1,
    pose: { ...midpointPose, latchLift: Number.NaN },
  });

  assert.equal(animating.phase, "animating");
  assert.equal(animating.alignment?.settled, false);
  assert.equal(
    animating.alignment!.carrierErrorRadians > PINACULO_DIAGNOSTIC_SETTLE_TOLERANCES.carrierRadians,
    true,
  );
  assert.equal(paused.phase, "paused");
  assert.equal(reduced.phase, "reduced");
  assert.equal(reduced.alignment?.settled, true);
  assert.equal(poster.phase, "poster");
  assert.equal(poster.currentPositionOffset, null);
  assert.equal(poster.currentPose, null);
  assert.equal(poster.alignment, null);
  assert.equal(malformed.currentPose, null);
  assert.equal(malformed.alignment, null);
  assert.doesNotThrow(() => JSON.stringify(malformed));
});

test("the PINÁCULO DOM equivalent exposes verified concept identity and mechanism meaning", () => {
  const store = createObservatorySceneStore();
  store.dispatch({ type: "artifact/select", artifactId: "pinaculo" });
  const artifact = {
    artifactId: "pinaculo" as const,
    href: "/work/pinaculo",
    title: "PINÁCULO",
    descriptor: "Numerological engine",
    status: "concept",
    mechanismDescription:
      "A 24-position ring uses paired one-, two-, and three-groove markers as restrained references to 11, 22, and 33.",
  };
  const markup = renderToStaticMarkup(
    createElement(
      ObservatorySceneProvider,
      { store } as ObservatorySceneProviderProps,
      createElement(ObservatoryArtifactAccess, { artifact, interactive: true }),
    ),
  );

  assert.match(markup, /data-artifact-id="pinaculo"/);
  assert.match(markup, /data-selected="true"/);
  assert.match(markup, /href="\/work\/pinaculo"/);
  assert.match(markup, /Open PINÁCULO — Numerological engine/);
  assert.match(markup, /24-position ring/);
  assert.match(markup, /11, 22, and 33/);
  assert.match(markup, /aria-pressed="true"/);
  assert.match(markup, /aria-label="Return PINÁCULO to overview"/);
  assert.match(markup, /Return to overview/);
});

test("the scene owns one instanced, bounded PINÁCULO path without numeric or glyph meshes", () => {
  const pinaculoSource = readSource("src/components/three/observatory-pinaculo.tsx");
  const systemSource = readSource("src/lib/three/pinaculo-system.ts");
  const shellSource = readSource("src/components/three/observatory-scene-shell.tsx");
  const accessSource = readSource("src/components/three/observatory-artifact-access.tsx");
  const pageSource = readSource("src/app/page.tsx");
  const styles = readSource("src/app/globals.css");

  assert.match(pinaculoSource, /InstancedMesh/);
  assert.match(pinaculoSource, /setMatrixAt/);
  assert.match(pinaculoSource, /PINACULO_POSITION_COUNT/);
  assert.match(pinaculoSource, /PINACULO_MASTER_PATTERN_STATIONS/);
  assert.match(
    pinaculoSource,
    /name="PinaculoMasterPatternGrooves"[\s\S]*material=\{materials\.buff\}[\s\S]*<boxGeometry args=\{\[0\.012, 0\.01, 0\.05\]\}/,
  );
  assert.match(pinaculoSource, /useFrame/);
  assert.match(pinaculoSource, /window\.setInterval/);
  assert.match(pinaculoSource, /window\.setTimeout/);
  assert.match(pinaculoSource, /focusDurationMs/);
  assert.match(pinaculoSource, /resolvePinaculoMechanismPose\(\s*progressRef\.current/);
  assert.match(pinaculoSource, /settleTransition\(\);[\s\S]*invalidate\(\);/);
  assert.match(pinaculoSource, /onClick=\{selectPinaculo\}/);
  assert.match(pinaculoSource, /artifact\/select/);
  assert.match(pinaculoSource, /name=\{OBSERVATORY_PINACULO_TECHNICAL_ART\.interactionNodeName\}/);
  assert.match(pinaculoSource, /visible=\{false\}/);
  assert.match(pinaculoSource, /<boxGeometry args=\{\[2\.7, 0\.65, 2\.7\]\}/);
  assert.match(pinaculoSource, /capturePinaculoDiagnostics/);
  assert.match(pinaculoSource, /onDiagnosticsReady\(null\)/);
  assert.doesNotMatch(
    pinaculoSource,
    /useState|TextGeometry|troika|CanvasTexture|VideoTexture|shaderMaterial/,
  );
  assert.doesNotMatch(systemSource, /predicts|prediction|scientifically valid/i);
  assert.match(shellSource, /<ObservatoryPinaculo/);
  assert.match(shellSource, /onPinaculoDiagnosticsReady/);
  assert.match(accessSource, /artifactId: artifact\.artifactId/);
  assert.match(pageSource, /artifactId[\s\S]*mechanismDescription/);
  assert.match(
    styles,
    /\.observatory-artifact-access\[data-artifact-id="pinaculo"\][\s\S]*bottom:/,
  );
  assert.match(
    styles,
    /@media \(max-width: 47\.99rem\)[\s\S]*data-artifact-id="pinaculo"[\s\S]*display:\s*none/,
  );
  assert.match(
    styles,
    /@media \(min-width: 64\.01rem\) and \(max-width: 88\.75rem\)[\s\S]*data-artifact-id="sound-lab"[\s\S]*display:\s*none/,
  );
  assert.match(
    styles,
    /observatory-progressive-experience:has\([\s\S]*data-selected="true"[\s\S]*data-selected="false"[\s\S]*visibility:\s*hidden/,
  );
  assert.match(pageSource, /artifacts=\{observatoryArtifacts\}/);
});
