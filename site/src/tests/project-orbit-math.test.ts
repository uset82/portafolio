import assert from "node:assert/strict";
import test from "node:test";

import {
  TAU,
  damp,
  depth01,
  easeInOutCubic,
  getOrbitPosition,
  nodeAngle,
  shortestDelta,
} from "@/components/project-orbit-math";

const approximately = (actual: number, expected: number, message?: string) =>
  assert.ok(
    Math.abs(actual - expected) < 0.000_001,
    message ?? `${actual} should equal ${expected}`,
  );

test("Project Orbit uses one true horizontal ellipse for every moving element", () => {
  const xAxis = getOrbitPosition(0, 7.5, 2.95, 0.16);
  const zAxis = getOrbitPosition(Math.PI / 2, 7.5, 2.95, 0.16);

  approximately(xAxis.x, 7.5);
  approximately(xAxis.z, 0);
  approximately(zAxis.x, 0);
  approximately(zAxis.z, 2.95);
  approximately(zAxis.y, 0.16);
});

test("Project Orbit distributes nodes, chooses the shortest focus route, and maps depth predictably", () => {
  approximately(nodeAngle(3, 10, 0), (3 / 10) * TAU);
  approximately(shortestDelta((350 * Math.PI) / 180, (10 * Math.PI) / 180), Math.PI / 9);
  approximately(depth01(-2.95, 2.95), 0);
  approximately(depth01(0, 2.95), 0.5);
  approximately(depth01(2.95, 2.95), 1);
});

test("Project Orbit focus easing and inertia remain bounded", () => {
  approximately(easeInOutCubic(0), 0);
  approximately(easeInOutCubic(1), 1);
  assert.ok(easeInOutCubic(0.5) > 0 && easeInOutCubic(0.5) < 1);

  const next = damp(0, 1, 6, 1 / 60);
  assert.ok(next > 0 && next < 1);
});
