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
