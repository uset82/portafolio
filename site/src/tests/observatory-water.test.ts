import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  OBSERVATORY_WATER_FRAGMENT_SHADER,
  OBSERVATORY_WATER_TECHNICAL_ART,
  OBSERVATORY_WATER_VERTEX_SHADER,
  resolveWaterPresentation,
} from "@/lib/three/water-system";
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
  });

  for (const color of Object.values(colors)) assert.equal(paletteValues.has(color), true);
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
  assert.match(OBSERVATORY_WATER_VERTEX_SHADER, /sin\(/);
  assert.match(OBSERVATORY_WATER_VERTEX_SHADER, /exp\(/);
  assert.match(OBSERVATORY_WATER_FRAGMENT_SHADER, /reflect\(/);
  assert.match(OBSERVATORY_WATER_FRAGMENT_SHADER, /float fresnel/);
  assert.match(OBSERVATORY_WATER_FRAGMENT_SHADER, /tonemapping_fragment/);
  assert.match(OBSERVATORY_WATER_FRAGMENT_SHADER, /colorspace_fragment/);
  assert.doesNotMatch(combinedShader, /sampler(?:2D|Cube)|texture2D|textureCube/);
});

test("the scene integrates one demand-rendered water owner with no React frame state or render target", () => {
  const waterSource = readSource("src/components/three/observatory-water-surface.tsx");
  const shellSource = readSource("src/components/three/observatory-scene-shell.tsx");

  assert.match(waterSource, /useFrame/);
  assert.match(waterSource, /window\.setInterval\(invalidate/);
  assert.match(waterSource, /maximumAnimatedFps/);
  assert.match(waterSource, /meshStandardMaterial/);
  assert.match(waterSource, /presentation\.tier === "poster"/);
  assert.doesNotMatch(waterSource, /useState|\.dispatch\(|WebGLRenderTarget|MeshReflectorMaterial/);
  assert.match(shellSource, /group\.id === "water" \? <ObservatoryWaterSurface/);
});
