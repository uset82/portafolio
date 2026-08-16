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
 * The point is evaluated on the ring's local ellipse and rotated by its 3D Euler angles.
 */
export function getAtomicOrbitPosition(
  angle: number,
  radiusX: number,
  radiusZ: number,
  rotationEuler: readonly [number, number, number] = [0, 0, 0],
  originY = 0.16,
): OrbitPosition {
  const localX = Math.cos(angle) * radiusX;
  const localY = 0;
  const localZ = Math.sin(angle) * radiusZ;

  const [rx, ry, rz] = rotationEuler;

  // Rotate around X
  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);
  const x1 = localX;
  const y1 = localY * cosX - localZ * sinX;
  const z1 = localY * sinX + localZ * cosX;

  // Rotate around Y
  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);
  const x2 = x1 * cosY + z1 * sinY;
  const y2 = y1;
  const z2 = -x1 * sinY + z1 * cosY;

  // Rotate around Z
  const cosZ = Math.cos(rz);
  const sinZ = Math.sin(rz);
  const x3 = x2 * cosZ - y2 * sinZ;
  const y3 = x2 * sinZ + y2 * cosZ;
  const z3 = z2;

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
