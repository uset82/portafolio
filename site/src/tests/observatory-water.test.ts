import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  OBSERVATORY_WATER_FRAGMENT_SHADER,
  OBSERVATORY_WATER_SIMPLE_FRAGMENT_SHADER,
  OBSERVATORY_WATER_SIMPLE_VERTEX_SHADER,
  OBSERVATORY_WATER_TECHNICAL_ART,
  OBSERVATORY_WATER_VERTEX_SHADER,
  WATER_RIPPLE_MODES,
  WaterRippleController,
  captureWaterSurfaceDiagnostics,
  isWaterRipplePointInside,
  resolveWaterPresentation,
  worldToWaterLocalPoint,
} from "@/lib/three/water-system";
import { OBSERVATORY_ROBOT_TECHNICAL_ART } from "@/lib/three/robot-system";
import { naturalPalette } from "@/styles/palette";

const workspaceRoot = process.cwd();

function readSource(relativePath: string) {
  return readFileSync(path.join(workspaceRoot, relativePath), "utf8");
}

test("water tiers stay inside the structural desktop and mobile surface budget", () => {
  const { tiers, structuralBudget, colors } = OBSERVATORY_WATER_TECHNICAL_ART;
  const paletteValues = new Set(Object.values(naturalPalette));

  assert.equal(tiers.shader.triangles, tiers.shader.segments[0] * tiers.shader.segments[1] * 2);
  assert.equal(tiers.simple.triangles, 2);
  assert.equal(tiers.shader.triangles <= structuralBudget.maximumShaderTriangles, true);
  assert.equal(tiers.simple.triangles <= structuralBudget.maximumSimpleTriangles, true);
  assert.equal(tiers.shader.drawCalls <= structuralBudget.maximumDrawCalls, true);
  assert.equal(tiers.simple.drawCalls <= structuralBudget.maximumDrawCalls, true);
  assert.equal(tiers.shader.textures, structuralBudget.maximumTextures);
  assert.equal(tiers.shader.renderTargets, structuralBudget.maximumRenderTargets);
  assert.equal(tiers.shader.postPasses, structuralBudget.maximumPostPasses);
  assert.equal(tiers.shader.maximumAnimatedFps <= 30, true);
  assert.equal(tiers.shader.reflection, "analytic-fresnel-and-directional-glint");
  assert.equal(tiers.shader.refraction, "analytic-depth-cue-no-scene-sampling");
  assert.equal(tiers.simple.refraction, "none");
  assert.deepEqual(tiers.poster, {
    triangles: 0,
    drawCalls: 0,
    geometries: 0,
    materials: 0,
    textures: 0,
    renderTargets: 0,
    postPasses: 0,
    shadowCasters: 0,
    maximumAnimatedFps: 0,
    reflection: "poster-artwork",
    refraction: "poster-artwork",
  });

  for (const color of Object.values(colors)) assert.equal(paletteValues.has(color), true);
});

test("robot contact and pointer presses share one bounded ripple controller", () => {
  const robotLocal = worldToWaterLocalPoint(OBSERVATORY_ROBOT_TECHNICAL_ART.handWaterTargetMeters);
  const controller = new WaterRippleController();
  const initial = controller.snapshot(0);

  assert.deepEqual(initial.origins[0], robotLocal);
  assert.equal(initial.modes[0], WATER_RIPPLE_MODES.repeating);
  assert.equal(initial.lifetimesSeconds[0], 1.2);
  assert.equal(controller.addPointerRipple([0.2, -0.3], 0), true);
  assert.equal(controller.addPointerRipple([0.4, -0.2], 0.05), false);
  assert.equal(controller.addPointerRipple([0.4, -0.2], 0.15), true);

  const active = controller.snapshot(0.15);
  assert.equal(active.modes.filter((mode) => mode === WATER_RIPPLE_MODES.transient).length, 2);
  assert.equal(controller.snapshot(1.36).modes[1], WATER_RIPPLE_MODES.inactive);
  assert.equal(controller.snapshot(1.36).modes[0], WATER_RIPPLE_MODES.repeating);
});

test("pointer ripple bounds reject the feathered edge and cap transient slots", () => {
  const controller = new WaterRippleController();

  assert.equal(isWaterRipplePointInside([0, 0]), true);
  assert.equal(isWaterRipplePointInside([6.9, 0]), false);
  assert.equal(controller.addPointerRipple([6.9, 0], 0), false);
  for (let index = 0; index < 6; index += 1) {
    assert.equal(controller.addPointerRipple([index * 0.1, 0], index * 0.15), true);
  }

  const snapshot = controller.snapshot(0.75);
  assert.equal(snapshot.modes.length, 5);
  assert.equal(snapshot.modes.filter((mode) => mode === WATER_RIPPLE_MODES.transient).length, 4);
});

test("water diagnostics explain accepted input, rejection reasons, and ripple decay", () => {
  const controller = new WaterRippleController();

  assert.deepEqual(controller.tryAddPointerRipple([Number.NaN, 0], 0), {
    accepted: false,
    reason: "non-finite",
    slot: null,
  });
  assert.deepEqual(controller.tryAddPointerRipple([6.9, 0], 0), {
    accepted: false,
    reason: "outside-bounds",
    slot: null,
  });
  assert.deepEqual(controller.tryAddPointerRipple([0.2, -0.3], 0), {
    accepted: true,
    reason: "accepted",
    slot: 1,
  });
  assert.deepEqual(controller.tryAddPointerRipple([0.4, -0.2], 0.05), {
    accepted: false,
    reason: "cooldown",
    slot: null,
  });

  const active = controller.diagnostics(0.6);
  assert.equal(active.version, 1);
  assert.equal(active.activeRippleCount, 2);
  assert.equal(active.robotRipple.cycle, 0.5);
  assert.deepEqual(active.pointerRipples[0]?.origin, [0.2, -0.3]);
  assert.equal(active.pointerRipples[0]?.ageSeconds, 0.6);
  assert.equal(active.pointerRipples[0]?.normalizedAge, 0.5);
  assert.equal(active.pointerRipples[0]?.remainingSeconds, 0.6);
  assert.equal(active.pointerRipples[0]?.envelope, 0.5);
  assert.deepEqual(active.input, {
    accepted: 1,
    rejectedNonFinite: 1,
    rejectedOutsideBounds: 1,
    rejectedCooldown: 1,
    lastAcceptedAtSeconds: 0,
    nextPointerSlot: 2,
  });

  const expired = controller.diagnostics(1.21);
  assert.equal(expired.activeRippleCount, 1);
  assert.deepEqual(expired.pointerRipples, []);
  assert.deepEqual(expired.input, active.input);
});

test("surface diagnostics expose shader state without activating reduced or poster tiers", () => {
  const controller = new WaterRippleController();
  controller.addPointerRipple([0.2, -0.3], 0);

  const animated = captureWaterSurfaceDiagnostics({
    presentation: resolveWaterPresentation("full", "full"),
    atSeconds: 0.6,
    controller,
  });
  assert.equal(animated.presentation.tier, "shader");
  assert.equal(animated.inputEnabled, true);
  assert.equal(animated.atSeconds, 0.6);
  assert.equal(animated.controller?.activeRippleCount, 2);

  const paused = captureWaterSurfaceDiagnostics({
    presentation: resolveWaterPresentation("full", "paused"),
    atSeconds: 0.6,
    controller,
  });
  assert.equal(paused.presentation.tier, "shader");
  assert.equal(paused.inputEnabled, false);
  assert.equal(paused.atSeconds, 0.6);
  assert.equal(paused.controller?.activeRippleCount, 2);

  for (const presentation of [
    resolveWaterPresentation("reduced", "full"),
    resolveWaterPresentation("static", "static"),
  ]) {
    const fallback = captureWaterSurfaceDiagnostics({
      presentation,
      atSeconds: 10,
      controller,
    });
    assert.equal(fallback.inputEnabled, false);
    assert.equal(fallback.atSeconds, 0);
    assert.equal(fallback.controller, null);
  }
});

test("quality and motion resolve to shader, simple, frozen, or poster behavior", () => {
  assert.deepEqual(resolveWaterPresentation("static", "static"), {
    tier: "poster",
    animated: false,
  });
  assert.deepEqual(resolveWaterPresentation("reduced", "full"), {
    tier: "simple",
    animated: false,
  });
  assert.deepEqual(resolveWaterPresentation("full", "reduced"), {
    tier: "simple",
    animated: false,
  });
  assert.deepEqual(resolveWaterPresentation("full", "paused"), {
    tier: "shader",
    animated: false,
  });
  assert.deepEqual(resolveWaterPresentation("full", "full"), {
    tier: "shader",
    animated: true,
  });
});

test("the full water shader contains bounded ripples and analytic light reflection without texture or render-target sampling", () => {
  const combinedShader = `${OBSERVATORY_WATER_VERTEX_SHADER}\n${OBSERVATORY_WATER_FRAGMENT_SHADER}`;

  assert.match(OBSERVATORY_WATER_VERTEX_SHADER, /float waterHeight/);
  assert.match(OBSERVATORY_WATER_VERTEX_SHADER, /float rippleField/);
  assert.match(OBSERVATORY_WATER_VERTEX_SHADER, /uRippleOrigins\[5\]/);
  assert.doesNotMatch(
    OBSERVATORY_WATER_VERTEX_SHADER,
    /\bfloat\s+active\b/,
    "the shader must not declare the reserved GLSL identifier active",
  );
  assert.match(OBSERVATORY_WATER_VERTEX_SHADER, /for \(int index = 0; index < 5/);
  assert.match(OBSERVATORY_WATER_VERTEX_SHADER, /sin\(/);
  assert.match(OBSERVATORY_WATER_VERTEX_SHADER, /exp\(/);
  assert.match(OBSERVATORY_WATER_FRAGMENT_SHADER, /reflect\(/);
  assert.match(OBSERVATORY_WATER_FRAGMENT_SHADER, /refract\(/);
  assert.match(OBSERVATORY_WATER_FRAGMENT_SHADER, /refractionDepthCue/);
  assert.match(OBSERVATORY_WATER_FRAGMENT_SHADER, /float fresnel/);
  assert.match(OBSERVATORY_WATER_FRAGMENT_SHADER, /tonemapping_fragment/);
  assert.match(OBSERVATORY_WATER_FRAGMENT_SHADER, /colorspace_fragment/);
  assert.doesNotMatch(combinedShader, /sampler(?:2D|Cube)|texture2D|textureCube/);
});

test("the reduced water material feathers one still two-triangle surface without texture sampling", () => {
  const combinedShader = `${OBSERVATORY_WATER_SIMPLE_VERTEX_SHADER}\n${OBSERVATORY_WATER_SIMPLE_FRAGMENT_SHADER}`;

  assert.match(OBSERVATORY_WATER_SIMPLE_FRAGMENT_SHADER, /edgeFeather/);
  assert.match(OBSERVATORY_WATER_SIMPLE_FRAGMENT_SHADER, /quietReflection/);
  assert.doesNotMatch(combinedShader, /uTime|sin\(|sampler(?:2D|Cube)|texture2D|textureCube/);
});

test("the scene integrates one demand-rendered water owner with no React frame state or render target", () => {
  const waterSource = readSource("src/components/three/observatory-water-surface.tsx");
  const shellSource = readSource("src/components/three/observatory-scene-shell.tsx");
  const liveSceneSource = readSource("src/components/three/observatory-live-scene.tsx");
  const progressiveSource = readSource(
    "src/components/three/observatory-progressive-experience.tsx",
  );

  assert.match(waterSource, /useFrame/);
  assert.match(waterSource, /window\.setInterval\(invalidate/);
  assert.match(waterSource, /maximumAnimatedFps/);
  assert.match(waterSource, /new WaterRippleController/);
  assert.match(waterSource, /onPointerDown=\{addPointerRipple\}/);
  assert.match(waterSource, /nativeEvent\.isPrimary/);
  assert.match(waterSource, /worldToLocal\(event\.point\.clone\(\)\)/);
  assert.match(waterSource, /applyRippleSnapshot/);
  assert.match(waterSource, /captureWaterSurfaceDiagnostics/);
  assert.match(waterSource, /onDiagnosticsReady/);
  assert.doesNotMatch(waterSource, /meshStandardMaterial/);
  assert.match(waterSource, /presentation\.tier === "poster"/);
  assert.doesNotMatch(
    waterSource,
    /useState|\.dispatch\(|WebGLRenderTarget|MeshReflectorMaterial|window\.__|globalThis\./,
  );
  assert.match(shellSource, /group\.id === "water" \? \(\s*<ObservatoryWaterSurface/);
  assert.match(shellSource, /onWaterDiagnosticsReady/);
  assert.match(liveSceneSource, /onWaterDiagnosticsReady/);
  assert.match(progressiveSource, /onWaterDiagnosticsReady/);
});
