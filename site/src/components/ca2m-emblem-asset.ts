/**
 * Where the emblem's model lives.
 *
 * It sits on its own so the light client boundary in `ca2m-emblem.tsx` can name
 * the asset — and start fetching it — without importing the scene. Importing the
 * scene for a string would pull three, @react-three/fiber and drei into the
 * page's first-load bundle, which is exactly what loading that scene on demand
 * exists to avoid.
 */
export const EMBLEM_LOGO_URL = "/images/brand/ca2m-logo-signal.glb";
