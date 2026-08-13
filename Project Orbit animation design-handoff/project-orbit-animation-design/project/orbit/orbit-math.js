// Shared ellipse math. Every moving part — nodes, bearing balls, highlights —
// reads its position from here so they always ride the same track.

export function getOrbitPosition(angle, radiusX, radiusZ, y = 0) {
  return { x: Math.cos(angle) * radiusX, y, z: Math.sin(angle) * radiusZ };
}

export function nodeAngle(index, count, rotation) {
  return rotation + (index / count) * Math.PI * 2;
}

// Shortest signed distance from `from` to `to` on a circle.
export function shortestDelta(from, to) {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// 0 = far side of the ellipse, 1 = nearest the viewer.
export function depth01(z, radiusZ) {
  return (z / radiusZ + 1) / 2;
}

export const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Frame-rate independent approach.
export function damp(current, target, speed, dt) {
  return current + (target - current) * (1 - Math.exp(-speed * dt));
}
