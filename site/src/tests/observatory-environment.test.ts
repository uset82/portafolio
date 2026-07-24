import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { ACESFilmicToneMapping, SRGBColorSpace, type WebGLRenderer } from "three";

import { configureThreeRenderer } from "@/components/three/runtime-policy";
import {
  OBSERVATORY_ENVIRONMENT_TECHNICAL_ART,
  resolveObservatoryEnvironmentPresentation,
} from "@/lib/three/observatory-environment";
import { CAMERA_VIEWS, OBSERVATORY_LIGHT_RIG } from "@/lib/three/scene-config";
import { naturalPalette } from "@/styles/palette";

const workspaceRoot = process.cwd();

function readSource(relativePath: string) {
  return readFileSync(path.join(workspaceRoot, relativePath), "utf8");
}

test("the Observatory environment contract preserves the approved shot and natural materials", () => {
  const contract = OBSERVATORY_ENVIRONMENT_TECHNICAL_ART;
  const materialValues = Object.values(contract.materials);

  assert.match(contract.visualThesis, /linen plaster.*sage.*walnut.*pewter/i);
  assert.match(contract.shot.focalLengthIntent, /35–45mm/);
  assert.deepEqual(CAMERA_VIEWS.home.position, [10.5, 5.4, 15.5]);
  assert.deepEqual(CAMERA_VIEWS.home.target, [1.4, 1.05, 0]);
  assert.equal(contract.renderer.background, "transparent");
  assert.equal(contract.renderer.shadows, false);
  assert.equal(contract.renderer.postPasses, 0);
  assert.equal(contract.assetStrategy, "procedural-threejs-no-external-textures");

  for (const requiredColor of [
    naturalPalette.offWhite,
    naturalPalette.buff,
    naturalPalette.paleSage,
    naturalPalette.linen,
    naturalPalette.walnut,
    naturalPalette.pewter,
  ]) {
    assert.equal(materialValues.includes(requiredColor), true);
  }
  assert.equal(
    materialValues.filter((value) => value === naturalPalette.espresso).length,
    1,
    "espresso must remain one controlled structural-shadow role",
  );
});

test("full and reduced environment tiers preserve composition inside the scene budgets", () => {
  const contract = OBSERVATORY_ENVIRONMENT_TECHNICAL_ART;
  const full = resolveObservatoryEnvironmentPresentation("full");
  const reduced = resolveObservatoryEnvironmentPresentation("reduced");

  assert.ok(full);
  assert.ok(reduced);
  assert.equal(resolveObservatoryEnvironmentPresentation("static"), null);
  assert.equal(full.windowAngles.length, 5);
  assert.equal(reduced.windowAngles.length, 3);
  assert.equal(full.wallRibAngles.length > reduced.wallRibAngles.length, true);
  assert.equal(full.roofBeamAngles.length > reduced.roofBeamAngles.length, true);
  for (const angle of [
    ...full.wallRibAngles,
    ...full.roofBeamAngles,
    ...reduced.wallRibAngles,
    ...reduced.roofBeamAngles,
  ]) {
    assert.equal(
      angle >= contract.openArc.start + contract.structureArcInset &&
        angle <= contract.openArc.start + contract.openArc.length - contract.structureArcInset,
      true,
      "structural repetitions must stay clear of the authored open-front sightline",
    );
  }

  assert.equal(full.budget.maximumDrawCalls <= 120, true);
  assert.equal(full.budget.maximumTriangles <= 180_000, true);
  assert.equal(full.budget.maximumMaterials <= 24, true);
  assert.equal(reduced.budget.maximumDrawCalls <= 70, true);
  assert.equal(reduced.budget.maximumTriangles <= 90_000, true);
  assert.equal(reduced.budget.maximumMaterials <= 16, true);
  assert.equal(full.budget.maximumTextures, 0);
  assert.equal(reduced.budget.maximumTextures, 0);
  assert.deepEqual(
    OBSERVATORY_LIGHT_RIG.filter((light) => light.kind === "directional").map(
      (light) => light.castShadow,
    ),
    [false, false, false],
  );
});

test("renderer presentation has one owner and applies the warm scene exposure", () => {
  const renderer = {} as WebGLRenderer;
  configureThreeRenderer(renderer);

  assert.equal(renderer.outputColorSpace, SRGBColorSpace);
  assert.equal(renderer.toneMapping, ACESFilmicToneMapping);
  assert.equal(
    renderer.toneMappingExposure,
    OBSERVATORY_ENVIRONMENT_TECHNICAL_ART.renderer.exposure,
  );

  const canvasSource = readSource("src/components/three/three-canvas.tsx");
  const policySource = readSource("src/components/three/runtime-policy.ts");
  assert.match(
    canvasSource,
    /onCreated=\{\(\{ gl, scene \}\) => \{[\s\S]*configureThreeRenderer\(gl\);[\s\S]*createThreeRendererDiagnostics\(\{ renderer: gl, scene \}\)/,
  );
  assert.match(policySource, /renderer\.outputColorSpace = SRGBColorSpace/);
  assert.match(policySource, /renderer\.toneMapping = ACESFilmicToneMapping/);
});

test("the scene mounts one authored cutaway environment without runtime asset or frame-loop noise", () => {
  const environmentSource = readSource("src/components/three/observatory-environment.tsx");
  const sceneSource = readSource("src/components/three/observatory-scene-shell.tsx");

  for (const authoredSurface of [
    "ObservatoryPlasterWall",
    "ObservatoryRoofAnnulus",
    "ObservatoryRoundWindowBay",
    "ObservatoryBasinStoneRim",
    "ObservatoryOculusGlass",
  ]) {
    assert.match(environmentSource, new RegExp(authoredSurface));
  }

  assert.match(environmentSource, /new MeshStandardMaterial/);
  assert.match(environmentSource, /material\.dispose\(\)/);
  assert.doesNotMatch(environmentSource, /useFrame|TextureLoader|useGLTF|castShadow/);
  assert.match(
    sceneSource,
    /group\.id === "architecture"[\s\S]*<ObservatoryEnvironment quality=\{scene\.quality\.tier\}/,
  );
});
