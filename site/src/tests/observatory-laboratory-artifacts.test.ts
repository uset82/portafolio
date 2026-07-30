import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ObservatoryArtifactAccess } from "@/components/three/observatory-artifact-access";
import {
  ObservatorySceneProvider,
  type ObservatorySceneProviderProps,
} from "@/components/three/observatory-scene-provider";
import {
  ELECTRONICS_AI_MODULE_CONTRACT,
  OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART,
  captureElectronicsAiDiagnostics,
  resolveElectronicsAiMechanismPose,
  resolveElectronicsAiPresentation,
} from "@/lib/three/electronics-ai-system";
import {
  FLOW_BATTERY_CIRCUITS,
  OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART,
  captureFutureEnergyDiagnostics,
  resolveFutureEnergyMechanismPose,
  resolveFutureEnergyPresentation,
} from "@/lib/three/future-energy-system";
import { getObservatoryAsset } from "@/lib/three/asset-registry";
import { createObservatorySceneStore } from "@/lib/three/scene-state";
import { naturalPalette } from "@/styles/palette";

const workspaceRoot = process.cwd();

function readSource(relativePath: string) {
  return readFileSync(path.join(workspaceRoot, relativePath), "utf8");
}

test("Future Energy declares two independent closed circuits within its natural-palette budget", () => {
  const asset = getObservatoryAsset("future-energy");
  const { tiers, colors, circuits } = OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART;
  const palette = new Set(Object.values(naturalPalette));

  assert.equal(asset.kind, "procedural");
  assert.equal(asset.status, "specified");
  assert.deepEqual(OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART.dimensionsMeters, asset.scaleMeters);
  assert.equal(
    OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART.interactionNodeName,
    "FutureEnergyInteraction",
  );
  assert.equal(
    asset.nodes.includes(OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART.interactionNodeName),
    true,
  );
  assert.equal(circuits.count, 2);
  assert.equal(circuits.independent, true);
  assert.equal(circuits.sharedStackSeparatePorts, true);
  assert.equal(
    FLOW_BATTERY_CIRCUITS.every((circuit) => circuit.closed),
    true,
  );
  assert.equal(
    FLOW_BATTERY_CIRCUITS.every((circuit) => circuit.connectsToCircuitIds.length === 0),
    true,
  );
  assert.equal(new Set(FLOW_BATTERY_CIRCUITS.map((circuit) => circuit.reservoirNode)).size, 2);
  assert.equal(new Set(FLOW_BATTERY_CIRCUITS.map((circuit) => circuit.pumpNode)).size, 2);
  assert.equal(new Set(FLOW_BATTERY_CIRCUITS.map((circuit) => circuit.stackPortNode)).size, 2);
  for (const circuit of FLOW_BATTERY_CIRCUITS) {
    assert.equal(asset.nodes.includes(circuit.reservoirNode), true);
    assert.equal(asset.nodes.includes(circuit.pumpNode), true);
    assert.equal(asset.nodes.includes(circuit.stackPortNode), true);
  }
  assert.equal(tiers.full.maximumTriangles <= asset.lods[0]!.maxTriangles, true);
  assert.equal(tiers.reduced.maximumTriangles <= asset.lods[1]!.maxTriangles, true);
  assert.equal(tiers.full.maximumDrawCalls <= 22, true);
  assert.equal(tiers.reduced.maximumDrawCalls, 17);
  assert.equal(OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART.maximumAnimatedFps <= 24, true);
  assert.equal(tiers.full.materials, 5);
  assert.equal(tiers.full.textures, 0);
  assert.equal(tiers.full.renderTargets, 0);
  assert.equal(tiers.full.postPasses, 0);
  assert.equal(tiers.full.shadowCasters, 0);
  for (const color of Object.values(colors)) assert.equal(palette.has(color), true);
});

test("Future Energy focus is bounded and reduced or compact paths settle immediately", () => {
  const rest = resolveFutureEnergyMechanismPose(0);
  const focus = resolveFutureEnergyMechanismPose(1);

  assert.equal(rest.sagePumpRotation, 0);
  assert.equal(Math.abs(rest.teaPumpRotation), 0);
  assert.equal(focus.sagePumpRotation > 0, true);
  assert.equal(focus.teaPumpRotation < 0, true);
  assert.equal(focus.sageSurfaceTilt, -focus.teaSurfaceTilt);
  assert.equal(focus.serviceLatchLift > rest.serviceLatchLift, true);
  assert.deepEqual(resolveFutureEnergyPresentation("static", "static", false), {
    tier: "poster",
    animated: false,
    settleImmediately: true,
  });
  assert.deepEqual(resolveFutureEnergyPresentation("full", "full", true), {
    tier: "reduced",
    animated: false,
    settleImmediately: true,
  });
  assert.deepEqual(resolveFutureEnergyPresentation("full", "reduced", false), {
    tier: "reduced",
    animated: false,
    settleImmediately: true,
  });
  assert.deepEqual(resolveFutureEnergyPresentation("full", "paused", false), {
    tier: "full",
    animated: false,
    settleImmediately: false,
  });
});

test("Future Energy diagnostics prove exact rest and focus alignment with two independent circuits", () => {
  const presentation = resolveFutureEnergyPresentation("full", "full", false);
  const rest = captureFutureEnergyDiagnostics({
    presentation,
    selected: false,
    progress: 0,
    targetProgress: 0,
    pose: resolveFutureEnergyMechanismPose(0),
  });
  const focus = captureFutureEnergyDiagnostics({
    presentation,
    selected: true,
    progress: 1,
    targetProgress: 1,
    pose: resolveFutureEnergyMechanismPose(1),
  });

  for (const snapshot of [rest, focus]) {
    assert.equal(snapshot.version, 1);
    assert.equal(snapshot.phase, "settled");
    assert.equal(snapshot.alignment?.settled, true);
    assert.equal(snapshot.alignment?.progressError, 0);
    assert.equal(snapshot.alignment?.sagePumpErrorRadians, 0);
    assert.equal(snapshot.alignment?.teaPumpErrorRadians, 0);
    assert.equal(snapshot.alignment?.sageSurfaceErrorRadians, 0);
    assert.equal(snapshot.alignment?.teaSurfaceErrorRadians, 0);
    assert.equal(snapshot.alignment?.serviceLatchErrorMeters, 0);
    assert.deepEqual(snapshot.circuits, {
      circuitCount: 2,
      allClosed: true,
      independent: true,
      crossConnectionCount: 0,
      distinctReservoirCount: 2,
      distinctPumpCount: 2,
      distinctStackPortCount: 2,
    });
  }
  assert.deepEqual(rest.currentPose, resolveFutureEnergyMechanismPose(0));
  assert.deepEqual(focus.currentPose, resolveFutureEnergyMechanismPose(1));
});

test("Future Energy diagnostics distinguish transition and fallback states without fabricating pose", () => {
  const transition = captureFutureEnergyDiagnostics({
    presentation: resolveFutureEnergyPresentation("full", "full", false),
    selected: true,
    progress: 0.4,
    targetProgress: 1,
    pose: resolveFutureEnergyMechanismPose(0.4),
  });
  const paused = captureFutureEnergyDiagnostics({
    presentation: resolveFutureEnergyPresentation("full", "paused", false),
    selected: true,
    progress: 0.4,
    targetProgress: 1,
    pose: resolveFutureEnergyMechanismPose(0.4),
  });
  const reduced = captureFutureEnergyDiagnostics({
    presentation: resolveFutureEnergyPresentation("reduced", "full", false),
    selected: true,
    progress: 1,
    targetProgress: 1,
    pose: resolveFutureEnergyMechanismPose(1),
  });
  const poster = captureFutureEnergyDiagnostics({
    presentation: resolveFutureEnergyPresentation("static", "static", false),
    selected: false,
    progress: 0,
    targetProgress: 0,
    pose: resolveFutureEnergyMechanismPose(0),
  });
  const malformed = captureFutureEnergyDiagnostics({
    presentation: resolveFutureEnergyPresentation("full", "full", false),
    selected: false,
    progress: Number.NaN,
    targetProgress: 2,
    pose: { ...resolveFutureEnergyMechanismPose(0), serviceLatchLift: Number.NaN },
  });

  assert.equal(transition.phase, "animating");
  assert.equal(transition.alignment?.settled, false);
  assert.equal(paused.phase, "paused");
  assert.equal(reduced.phase, "reduced");
  assert.equal(reduced.alignment?.settled, true);
  assert.equal(poster.phase, "poster");
  assert.equal(poster.currentPose, null);
  assert.equal(poster.alignment, null);
  assert.equal(malformed.progress, null);
  assert.equal(malformed.targetProgress, null);
  assert.equal(malformed.currentPose, null);
  assert.equal(malformed.targetPose, null);
  assert.equal(malformed.alignment, null);
});

test("Electronics and AI remains a protected non-functioning concept with a non-flashing cue", () => {
  const asset = getObservatoryAsset("electronics-ai-module");
  const { tiers, colors, controls } = OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART;
  const palette = new Set(Object.values(naturalPalette));
  const rest = resolveElectronicsAiMechanismPose(0);
  const focus = resolveElectronicsAiMechanismPose(1);

  assert.equal(asset.kind, "procedural");
  assert.equal(asset.status, "specified");
  assert.deepEqual(OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART.dimensionsMeters, asset.scaleMeters);
  assert.equal(
    OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART.interactionNodeName,
    "ElectronicsInteraction",
  );
  assert.equal(
    asset.nodes.includes(OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART.interactionNodeName),
    true,
  );
  assert.equal(ELECTRONICS_AI_MODULE_CONTRACT.functioningHardwareClaim, false);
  assert.equal(ELECTRONICS_AI_MODULE_CONTRACT.aiInferenceClaim, false);
  assert.equal(ELECTRONICS_AI_MODULE_CONTRACT.liveDataClaim, false);
  assert.equal(ELECTRONICS_AI_MODULE_CONTRACT.protectedModules, true);
  assert.equal(ELECTRONICS_AI_MODULE_CONTRACT.rapidFlashing, false);
  assert.equal(controls.fullBoards, 3);
  assert.equal(controls.fullGrilleBars, 14);
  assert.equal(controls.cableSockets, 4);
  assert.equal(focus.controlRotation > rest.controlRotation, true);
  assert.equal(focus.servicePanelLift > rest.servicePanelLift, true);
  assert.equal(focus.indicatorLift > rest.indicatorLift, true);
  assert.equal(tiers.full.maximumTriangles <= asset.lods[0]!.maxTriangles, true);
  assert.equal(tiers.reduced.maximumTriangles <= asset.lods[1]!.maxTriangles, true);
  assert.equal(tiers.full.maximumDrawCalls <= 20, true);
  assert.equal(tiers.reduced.maximumDrawCalls <= 15, true);
  assert.equal(OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART.maximumAnimatedFps <= 24, true);
  assert.equal(tiers.full.materials, 5);
  assert.equal(tiers.full.textures, 0);
  assert.deepEqual(resolveElectronicsAiPresentation("full", "full", true), {
    tier: "reduced",
    animated: false,
    settleImmediately: true,
  });
  assert.deepEqual(resolveElectronicsAiPresentation("full", "full", false), {
    tier: "full",
    animated: true,
    settleImmediately: false,
  });
  for (const color of Object.values(colors)) assert.equal(palette.has(color), true);
});

test("Electronics and AI diagnostics prove exact mechanism alignment and the concept-only contract", () => {
  const presentation = resolveElectronicsAiPresentation("full", "full", false);
  const rest = captureElectronicsAiDiagnostics({
    presentation,
    selected: false,
    progress: 0,
    targetProgress: 0,
    pose: resolveElectronicsAiMechanismPose(0),
  });
  const focus = captureElectronicsAiDiagnostics({
    presentation,
    selected: true,
    progress: 1,
    targetProgress: 1,
    pose: resolveElectronicsAiMechanismPose(1),
  });

  for (const snapshot of [rest, focus]) {
    assert.equal(snapshot.version, 1);
    assert.equal(snapshot.phase, "settled");
    assert.equal(snapshot.alignment?.settled, true);
    assert.equal(snapshot.alignment?.progressError, 0);
    assert.equal(snapshot.alignment?.controlErrorRadians, 0);
    assert.equal(snapshot.alignment?.servicePanelErrorMeters, 0);
    assert.equal(snapshot.alignment?.indicatorErrorMeters, 0);
    assert.deepEqual(snapshot.conceptContract, ELECTRONICS_AI_MODULE_CONTRACT);
  }
  assert.deepEqual(rest.currentPose, resolveElectronicsAiMechanismPose(0));
  assert.deepEqual(focus.currentPose, resolveElectronicsAiMechanismPose(1));
});

test("Electronics and AI diagnostics distinguish transition and fallback states without fabricated claims", () => {
  const transition = captureElectronicsAiDiagnostics({
    presentation: resolveElectronicsAiPresentation("full", "full", false),
    selected: true,
    progress: 0.35,
    targetProgress: 1,
    pose: resolveElectronicsAiMechanismPose(0.35),
  });
  const paused = captureElectronicsAiDiagnostics({
    presentation: resolveElectronicsAiPresentation("full", "paused", false),
    selected: true,
    progress: 0.35,
    targetProgress: 1,
    pose: resolveElectronicsAiMechanismPose(0.35),
  });
  const reduced = captureElectronicsAiDiagnostics({
    presentation: resolveElectronicsAiPresentation("reduced", "full", false),
    selected: true,
    progress: 1,
    targetProgress: 1,
    pose: resolveElectronicsAiMechanismPose(1),
  });
  const poster = captureElectronicsAiDiagnostics({
    presentation: resolveElectronicsAiPresentation("static", "static", false),
    selected: false,
    progress: 0,
    targetProgress: 0,
    pose: resolveElectronicsAiMechanismPose(0),
  });
  const malformed = captureElectronicsAiDiagnostics({
    presentation: resolveElectronicsAiPresentation("full", "full", false),
    selected: false,
    progress: Number.NaN,
    targetProgress: 3,
    pose: { ...resolveElectronicsAiMechanismPose(0), indicatorLift: Number.NaN },
  });

  assert.equal(transition.phase, "animating");
  assert.equal(transition.alignment?.settled, false);
  assert.equal(paused.phase, "paused");
  assert.equal(reduced.phase, "reduced");
  assert.equal(reduced.alignment?.settled, true);
  assert.equal(poster.phase, "poster");
  assert.equal(poster.currentPose, null);
  assert.equal(poster.alignment, null);
  assert.equal(malformed.progress, null);
  assert.equal(malformed.targetProgress, null);
  assert.equal(malformed.currentPose, null);
  assert.equal(malformed.targetPose, null);
  assert.equal(malformed.alignment, null);
  assert.equal(malformed.conceptContract.aiInferenceClaim, false);
  assert.equal(malformed.conceptContract.liveDataClaim, false);
});

test("both Laboratory artifacts retain truthful links and complete DOM equivalents", () => {
  const store = createObservatorySceneStore();
  store.dispatch({ type: "artifact/select", artifactId: "electronics-ai" });
  const artifacts = [
    {
      artifactId: "future-energy" as const,
      href: "/work/future-energy",
      title: "Future Energy",
      descriptor: "Adaptive flow systems",
      status: "concept",
      mechanismDescription:
        "Two independent closed liquid circuits meet separate sides of one central stack; this is not a performance claim.",
    },
    {
      artifactId: "electronics-ai" as const,
      href: "/laboratory",
      title: "Electronics / AI",
      descriptor: "Protected modular concept",
      status: "concept",
      mechanismDescription:
        "Protected modules and a blank mechanical status window identify a concept only; no functioning AI hardware is claimed.",
    },
  ];
  const markup = renderToStaticMarkup(
    createElement(
      ObservatorySceneProvider,
      { store } as ObservatorySceneProviderProps,
      createElement(
        Fragment,
        null,
        ...artifacts.map((artifact) =>
          createElement(ObservatoryArtifactAccess, {
            key: artifact.artifactId,
            artifact,
            interactive: true,
          }),
        ),
      ),
    ),
  );

  assert.match(markup, /data-artifact-id="future-energy"/);
  assert.match(markup, /href="\/work\/future-energy"/);
  assert.match(markup, /Open Future Energy — Adaptive flow systems/);
  assert.match(markup, /aria-label="Focus Future Energy instrument"/);
  assert.match(markup, /Two independent closed liquid circuits/);
  assert.match(markup, /data-artifact-id="electronics-ai"/);
  assert.match(markup, /data-artifact-id="electronics-ai" data-selected="true"/);
  assert.match(markup, /href="\/laboratory"/);
  assert.match(markup, /Open Electronics \/ AI — Protected modular concept/);
  assert.match(markup, /no functioning AI hardware is claimed/);
  assert.match(markup, /aria-label="Return Electronics \/ AI to overview"/);
});

test("the scene owns one bounded procedural instance of each Laboratory artifact", () => {
  const futureSource = readSource("src/components/three/observatory-future-energy.tsx");
  const electronicsSource = readSource("src/components/three/observatory-electronics-ai.tsx");
  const shellSource = readSource("src/components/three/observatory-scene-shell.tsx");
  const pageSource = readSource("src/app/page.tsx");
  const styles = readSource("src/app/globals.css");
  const manifest = readSource("../docs/assets/observatory-3d-manifest.json");

  assert.match(futureSource, /CatmullRomCurve3/);
  assert.match(futureSource, /InstancedMesh/);
  assert.match(futureSource, /FutureEnergySageReservoir/);
  assert.match(futureSource, /FutureEnergyTeaReservoir/);
  assert.match(futureSource, /name=\{circuit\.stackPortNode\}/);
  assert.match(futureSource, /includesStackPortInstances: true/);
  assert.match(futureSource, /FutureEnergySagePumpCue/);
  assert.match(futureSource, /FutureEnergyTeaPumpCue/);
  assert.match(futureSource, /useFrame/);
  assert.match(futureSource, /window\.setInterval/);
  assert.match(futureSource, /window\.setTimeout/);
  assert.match(futureSource, /settleTransition/);
  assert.match(futureSource, /progressRef\.current = targetProgressRef\.current/);
  assert.match(futureSource, /onClick=\{selectFutureEnergy\}/);
  assert.match(
    futureSource,
    /name=\{OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART\.interactionNodeName\}[\s\S]*visible=\{false\}[\s\S]*<boxGeometry args=\{\[2\.7, 2\.5, 1\.8\]\}/,
  );
  assert.doesNotMatch(futureSource, /const initialPose/);
  assert.match(electronicsSource, /InstancedMesh/);
  assert.match(electronicsSource, /ElectronicsProtectiveGrille/);
  assert.match(electronicsSource, /name="ElectronicsIndicators"/);
  assert.match(electronicsSource, /ElectronicsBlankStatusWindow/);
  assert.match(electronicsSource, /settleTransition/);
  assert.match(electronicsSource, /progressRef\.current = targetProgressRef\.current/);
  assert.match(electronicsSource, /onClick=\{selectElectronicsAi\}/);
  assert.match(
    electronicsSource,
    /name=\{OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART\.interactionNodeName\}[\s\S]*visible=\{false\}[\s\S]*<boxGeometry args=\{\[2\.4, 1\.4, 1\.5\]\}/,
  );
  assert.doesNotMatch(electronicsSource, /const initialPose/);
  assert.doesNotMatch(
    futureSource + electronicsSource,
    /useState|TextGeometry|troika|CanvasTexture|VideoTexture|shaderMaterial|emissive=/,
  );
  assert.equal((shellSource.match(/<ObservatoryFutureEnergy/g) ?? []).length, 1);
  assert.equal((shellSource.match(/<ObservatoryElectronicsAi/g) ?? []).length, 1);
  assert.match(shellSource, /onFutureEnergyDiagnosticsReady/);
  assert.match(shellSource, /onElectronicsAiDiagnosticsReady/);
  assert.match(pageSource, /siteContent\.laboratoryConcepts/);
  assert.match(pageSource, /artifactId: concept\.artifactId/);
  assert.doesNotMatch(
    pageSource,
    /artifactId: "electronics-ai"[\s\S]{0,300}status: projectArtifacts\[2\]!\.status/,
  );
  assert.match(
    styles,
    /\.observatory-artifact-access\[data-artifact-id="future-energy"\][\s\S]*top:/,
  );
  assert.match(
    styles,
    /\.observatory-artifact-access\[data-artifact-id="electronics-ai"\][\s\S]*top:/,
  );
  assert.match(
    styles,
    /\.observatory-artifact-access\[data-artifact-id="future-energy"\]\[data-selected="true"\][\s\S]*left:\s*clamp/,
  );
  assert.match(
    styles,
    /\.observatory-artifact-access\[data-artifact-id="electronics-ai"\]\[data-selected="true"\][\s\S]*right:\s*clamp/,
  );
  assert.match(
    styles,
    /observatory-canvas-layer\[aria-hidden="false"\][\s\S]*data-selected="false"[\s\S]*visibility:\s*hidden/,
  );
  assert.match(
    styles,
    /@media \(max-width: 64rem\)[\s\S]*data-artifact-id="future-energy"[\s\S]*display:\s*none/,
  );
  assert.match(manifest, /"id": "future-energy"[\s\S]*"status": "specified"/);
  assert.match(manifest, /"id": "electronics-ai-module"[\s\S]*"status": "specified"/);
});
