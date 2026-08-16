const TAU = Math.PI * 2;

export type OrbitPosition = {
  x: number;
  y: number;
  z: number;
};

/** True horizontal ellipse shared by rails, nodes, bearing balls, and spokes. */
export function getOrbitPosition(
  angle: number,
  radiusX: number,
  radiusZ: number,
  y = 0,
): OrbitPosition {
  return {
    x: Math.cos(angle) * radiusX,
    y,
    z: Math.sin(angle) * radiusZ,
  };
}

/**
 * Computes 3D world coordinates for a point on an atomic orbital ring.
 *
 * Rings are authored in their local XY plane — the plane that faces the
 * camera in the front-on composition — and carried into place by the same
 * Euler angles their rail meshes use. three.js composes an 'XYZ' Euler as
 * the matrix product Rx·Ry·Rz, which reaches the vector Z-first, then Y,
 * then X. The same order is applied here so a node computed by this
 * function lands exactly on a rail mesh rotated by the identical Euler;
 * the previous X→Y→Z order let nodes drift off their rails on any ring
 * with a compound rotation.
 */
export function getAtomicOrbitPosition(
  angle: number,
  radiusX: number,
  radiusZ: number,
  rotationEuler: readonly [number, number, number] = [0, 0, 0],
  originY = 0.16,
): OrbitPosition {
  const localX = Math.cos(angle) * radiusX;
  const localY = Math.sin(angle) * radiusZ;
  const localZ = 0;

  const [rx, ry, rz] = rotationEuler;

  // Rotate around Z (in-plane orientation: the diagonals' ±34°)
  const cosZ = Math.cos(rz);
  const sinZ = Math.sin(rz);
  const x1 = localX * cosZ - localY * sinZ;
  const y1 = localX * sinZ + localY * cosZ;
  const z1 = localZ;

  // Rotate around Y (depth lean along the ring's width)
  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);
  const x2 = x1 * cosY + z1 * sinY;
  const y2 = y1;
  const z2 = -x1 * sinY + z1 * cosY;

  // Rotate around X (depth lean along the ring's height)
  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);
  const x3 = x2;
  const y3 = y2 * cosX - z2 * sinX;
  const z3 = y2 * sinX + z2 * cosX;

  return {
    x: x3,
    y: y3 + originY,
    z: z3,
  };
}

export function nodeAngle(index: number, count: number, rotation: number) {
  return rotation + (index / count) * TAU;
}

export function shortestDelta(from: number, to: number) {
  let delta = (to - from) % TAU;
  if (delta > Math.PI) delta -= TAU;
  if (delta < -Math.PI) delta += TAU;
  return delta;
}

/** 0 is on the far edge of the ellipse; 1 is closest to the viewer. */
export function depth01(z: number, radiusZ: number) {
  return (z / radiusZ + 1) / 2;
}

export const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

export function damp(current: number, target: number, speed: number, deltaTime: number) {
  return current + (target - current) * (1 - Math.exp(-speed * deltaTime));
}

export { TAU };
