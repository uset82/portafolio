import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

function readSource(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

test("Project Orbit renders one instrument and keeps a semantic navigation shell", () => {
  const shell = readSource("src/components/project-orbit.tsx");
  const styles = readSource("src/app/globals.css");

  assert.match(shell, /^"use client";/);
  assert.match(shell, /<ProjectOrbitAtomic/);
  assert.match(shell, /className="project-orbit__instrument"/);

  // One visual layer. A lazily mounted WebGL scene sat on top of the atom and
  // its IntersectionObserver never flipped it on, so it rendered nothing; a
  // second label layer waited for that scene to position it and stacked all
  // eleven labels in the corner instead. Neither may come back.
  assert.doesNotMatch(shell, /IntersectionObserver/);
  assert.doesNotMatch(shell, /data-scene-mounted/);
  assert.doesNotMatch(shell, /className="project-orbit__labels"/);
  assert.doesNotMatch(shell, /RepositoryAtomScene|ProjectOrbitScene/);

  // The atom draws its own pills, so they must be able to receive clicks.
  assert.match(
    styles,
    /\.project-orbit__instrument\s*\{[\s\S]*?position:\s*absolute/,
    "the instrument needs its own layout rule, not the old fallback's",
  );
  assert.doesNotMatch(
    styles.slice(
      styles.indexOf(".project-orbit__instrument"),
      styles.indexOf(".project-orbit__canvas,"),
    ),
    /pointer-events:\s*none/,
    "the instrument carries the interface and must stay clickable",
  );

  assert.match(shell, /<nav className="project-orbit__all" aria-label="All systems">/);
  assert.doesNotMatch(shell, /project-orbit__hint/);
  assert.match(shell, /projects\.map\(\(project\) =>/);
  assert.match(shell, /onFocus=\{\(\) => setSelectedId\(project\.id\)\}/);
  assert.match(shell, /event\.preventDefault\(\);\s*setSelectedId\(project\.id\)/);
  assert.match(shell, /prefers-reduced-motion: reduce/);
});

test("Project Orbit scene uses the approved lazy Three runtime and avoids a raw rendering loop", () => {
  const scene = readSource("src/components/project-orbit-scene.tsx");

  assert.match(scene, /gl\.setClearColor\(0x000000, 0\)/);
  assert.doesNotMatch(scene, /scene\.background/);
  assert.match(scene, /<LazyThreeCanvas/);
  assert.match(scene, /new THREE\.TubeGeometry/);
  assert.match(scene, /<instancedMesh/);
  assert.match(scene, /label\.style\.transform/);
  assert.match(scene, /new THREE\.PMREMGenerator/);
  assert.match(scene, /setRendererToneMappingExposure\(gl, 1\.22\)/);
  assert.match(scene, /canvas\.width = canvas\.height = 256/);
  assert.match(scene, /document\.hidden/);
  assert.match(scene, /visibilitychange/);
  assert.match(scene, /revolutionSeconds/);
  assert.match(scene, /reducedMotion/);
  assert.match(scene, /useGLTF\(ORBIT_LOGO_URL, false, true\)/);
  assert.match(scene, /name="ProjectOrbitLogoPresentation"/);
  assert.match(
    scene,
    /new THREE\.Box3\(\)\.setFromObject\(clone\)\.getCenter\(new THREE\.Vector3\(\)\)/,
  );
  assert.match(scene, /clone\.position\.sub\(center\)/);
  assert.doesNotMatch(scene, /-1\.0976/);
  assert.match(scene, /const ORBIT_LOGO_FORWARD_OFFSET = 0\.14/);
  assert.match(scene, /name="ProjectOrbitLogoForward"/);
  assert.match(scene, /const ORBIT_LOGO_SCALE = 2/);
  assert.match(scene, /const ORBIT_LOGO_LEFT_YAW_DEGREES = 15/);
  assert.match(
    scene,
    /rotation=\{\[ORBIT_LOGO_PRESENTATION_PITCH_RADIANS, ORBIT_LOGO_LEFT_YAW_RADIANS, 0\]\}/,
  );
  assert.match(scene, /const ORBIT_MEDALLION_DIAGONAL_TILT_DEGREES = 15/);
  assert.match(scene, /new THREE\.Vector3\(-1, 1, 0\)\.normalize\(\)/);
  assert.match(scene, /const ORBIT_MEDALLION_USER_DRAG_LIMIT_DEGREES = 18/);
  assert.match(scene, /const ORBIT_MEDALLION_CORE_DEPTH = -0\.62/);
  assert.match(scene, /const ORBIT_MEDALLION_SHEEN_DEPTH = -0\.6/);
  assert.match(scene, /name="ProjectOrbitMedallionDragYaw"/);
  assert.match(scene, /name="ProjectOrbitMedallionRimDiagonalTilt"/);
  assert.match(scene, /name="ProjectOrbitLogoLeftYaw"/);
  assert.match(scene, /centerDragYaw\.current = THREE\.MathUtils\.clamp\(/);
  assert.match(scene, /medallionDragYaw\.rotation\.y = centerDragYaw\.current/);
  assert.match(scene, /medallionRim\.quaternion\.copy\(ORBIT_MEDALLION_DIAGONAL_TILT_QUATERNION\)/);
  assert.match(scene, /const ORBIT_RIM_WOBBLE_SECONDS = 10/);
  assert.match(scene, /rimTiltAxis\.set\(Math\.cos\(wobbleAngle\), Math\.sin\(wobbleAngle\), 0\)/);
  assert.doesNotMatch(scene, /PRECESSION/);
  assert.match(scene, /const ORBIT_LOGO_SPIN_SECONDS = 12/);
  assert.match(scene, /const ORBIT_PAN_LIMIT_X = 3\.2/);
  assert.match(scene, /const ORBIT_PAN_LIMIT_Y = 1\.5/);
  assert.match(scene, /const ORBIT_MEDALLION_BASE_Y = 0\.16/);
  assert.match(scene, /beginDrag\(event, "pan"\)/);
  assert.match(scene, /onDoubleClick=\{resetOrbitPan\}/);
  assert.match(scene, /const ORBIT_CAMERA_FOV_DEGREES = 34/);
  assert.match(scene, /const ORBIT_CAMERA_NARROW_FOV_DEGREES = 38/);
  assert.match(scene, /const ORBIT_CAMERA_FIT_PADDING = 1\.16/);
  assert.match(scene, /Math\.tan\(horizontalFov \/ 2\)/);
  assert.match(scene, /camera\.lookAt\(0, -0\.3, 0\)/);
  assert.match(
    scene,
    /<group ref=\{medallionDragYawRef\} name="ProjectOrbitMedallionDragYaw">[\s\S]*?<group ref=\{medallionRimRef\} name="ProjectOrbitMedallionRimDiagonalTilt">[\s\S]*?<group ref=\{logoSpinRef\} name="ProjectOrbitLogoLeftYaw">[\s\S]*?<ProjectOrbitLogoModel \/>/,
  );
  assert.match(scene, /const ORBIT_MEDALLION_BRASS_RIM_RADIUS = 1\.3/);
  assert.match(scene, /const ORBIT_MEDALLION_GOLD_EDGE_RADIUS = 1\.44/);
  assert.match(scene, /onPointerCancel=\{endDrag\}/);
  assert.doesNotMatch(scene, /medallionMotionElapsedSeconds/);
  assert.doesNotMatch(scene, /rightwardMotion/);
  assert.match(scene, /<ProjectOrbitLogoModel \/>/);
  assert.match(scene, /<Suspense/);
  assert.doesNotMatch(scene, /WebGLRenderer/);
  assert.doesNotMatch(scene, /preserveDrawingBuffer:\s*true/);
  assert.doesNotMatch(scene, /medallion\.rotation/);
});

test("Project Orbit uses a local, optimized 3D CAM² logo derivative", () => {
  const logoPath = path.join(process.cwd(), "public/images/brand/ca2m-logo.glb");
  const pipeline = readSource("scripts/optimize-project-orbit-logo.ts");

  assert.equal(existsSync(logoPath), true);
  assert.ok(statSync(logoPath).size < 7 * 1024 * 1024, "the published logo stays below 7 MiB");
  assert.match(pipeline, /ratio: 0\.06/);
  assert.match(pipeline, /resize: \[1024, 1024\]/);
  assert.match(pipeline, /meshopt/);
});

test("Project Orbit faithfully carries the ten systems supplied by the handoff", () => {
  const content = readSource("src/content/project-orbit.ts");

  for (const name of [
    "ASTRAEA",
    "PINÁCULO",
    "FUTURE ENERGY",
    "SOUND LAB",
    "Repo2Agent",
    "StrudelAI",
    "3Doodle",
    "iFoundYou",
    "Avatar Studio",
    "SmartChatbot",
  ]) {
    assert.match(content, new RegExp(`name: "${name}"`));
  }
  assert.match(content, /radiusX: 7\.5/);
  assert.match(content, /radiusZ: 2\.95/);
  assert.match(content, /bearingBalls: 22/);
  assert.match(content, /revolutionSeconds: 32/);
  assert.match(content, /href: "\/work\/astraea"/);
  assert.match(content, /href: "\/work\/pinaculo"/);
});
