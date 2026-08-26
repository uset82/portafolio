"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { useGLTF } from "@/components/three/drei-tools";
import { LazyThreeCanvas } from "@/components/three/lazy-three-canvas";
import { naturalPalette } from "@/styles/palette";

/**
 * The CA²M emblem, struck rather than plated.
 *
 * Shared by the contact signal disc and the story profile plate. The asset was
 * authored as baked copper PBR at high metalness, which is the most saturated
 * thing anywhere near a site built from espresso, buff and sage — so the mark is
 * re-struck at render time in a single palette tone, taking its depth from light
 * and from its own bevels rather than from hue or from any map.
 *
 * It faces the reader and sways a few degrees about that axis. CA²M is a reading
 * monogram: turned off-axis its strokes collapse into each other, so it must
 * never approach edge-on.
 *
 * `ca2m-logo-signal.glb` carries no textures at all. See
 * `scripts/optimize-contact-signal-logo.ts` for why they were traded for
 * triangles.
 */
const EMBLEM_LOGO_URL = "/images/brand/ca2m-logo-signal.glb";

/**
 * The emblem's largest dimension, in world units. Scale is derived from the
 * measured bounding box rather than hand-tuned, so the asset's own proportions
 * cannot change how much of its frame the mark occupies.
 */
const EMBLEM_TARGET_WORLD_SIZE = 2;
/** Half-extent the camera frames, leaving the mark a margin inside its seat. */
const EMBLEM_FRAMED_HALF_EXTENT = 1.16;
/**
 * An optical lift, in world units.
 *
 * The superscript 2 pushes the bounding box upward while contributing almost no
 * visual weight, so a box-centred mark hangs low: the C, A and M that carry the
 * mass sit below the middle. This raises the mark until that mass reads centred,
 * which is what the eye actually measures.
 */
const EMBLEM_OPTICAL_LIFT = 0.07;
/** Long lens: a short one splays the outer strokes and warps the counters. */
const EMBLEM_CAMERA_FOV_DEGREES = 22;

/** The sway, in degrees off face-on. Small enough that the mark always reads. */
const EMBLEM_SWAY_YAW_DEGREES = 13;
const EMBLEM_SWAY_PITCH_DEGREES = 3.6;
/** Two periods that do not divide evenly, so the sway never visibly loops. */
const EMBLEM_SWAY_YAW_SECONDS = 17;
const EMBLEM_SWAY_PITCH_SECONDS = 11;
/** Where a still emblem rests: barely off-square, enough to show it has depth. */
const EMBLEM_RESTING_YAW_DEGREES = -5.5;
const EMBLEM_RESTING_PITCH_DEGREES = 1.6;

const DEGREES = Math.PI / 180;

/**
 * Which ground the emblem is sitting on.
 *
 * A metal object takes its colour from what surrounds it, so the two placements
 * are genuine inversions of each other rather than one treatment retinted. On
 * the espresso contact disc the mark is pale and the surround is dark, and the
 * environment carries a single bright band for it to sweep. On the sage story
 * plate the mark is dark bronze under a bright, papery surround, the way a cast
 * object sits on a light table — a pale mark there would simply disappear.
 */
export type EmblemSurface = "dark" | "light";

type SurfaceTreatment = {
  /** Base colour of the struck mark. */
  color: string;
  metalness: number;
  roughness: number;
  envMapIntensity: number;
  exposure: number;
  ambient: { color: string; intensity: number };
  key: { color: string; intensity: number };
  fill: { color: string; intensity: number };
  /** Vertical stops for the surrounding sphere, brightest first. */
  sky: readonly [string, string, string];
  /** A single soft light band, as a fraction of the surround's height. */
  band: { from: number; to: number; alpha: number } | null;
};

const SURFACES: Record<EmblemSurface, SurfaceTreatment> = {
  dark: {
    color: naturalPalette.sand,
    metalness: 0.52,
    roughness: 0.42,
    envMapIntensity: 0.72,
    // A shade under the site default of 1.08, and well under Project Orbit's
    // 1.22. The disc is one of the darkest surfaces on the site and the emblem
    // has to sit in it rather than glow out of it.
    exposure: 1.04,
    ambient: { color: naturalPalette.orbitAmbient, intensity: 0.72 },
    key: { color: naturalPalette.sand, intensity: 2.05 },
    fill: { color: naturalPalette.paleSage, intensity: 0.5 },
    sky: [
      naturalPalette.orbitEnvHighlight,
      naturalPalette.orbitEnvMid,
      naturalPalette.orbitEnvBlack,
    ],
    band: { from: 0.1, to: 0.36, alpha: 0.62 },
  },
  light: {
    // Dark bronze, not near-black: espresso would read as a flat silhouette on
    // sage, where this keeps enough value range for the bevels to turn.
    color: naturalPalette.deepWood,
    // More metal than the dark placement, because on a bright surround the
    // reflections are what draw the letterforms rather than the diffuse tone.
    metalness: 0.66,
    roughness: 0.3,
    envMapIntensity: 1,
    exposure: 1,
    // Deliberately low. On a bright surround it is tempting to raise ambient to
    // match, but ambient is exactly what erases form: the first pass at 1.05
    // flattened the mark into one brown silhouette. The direction does the work.
    ambient: { color: naturalPalette.stoneSage, intensity: 0.5 },
    key: { color: naturalPalette.warmIvory, intensity: 2.7 },
    fill: { color: naturalPalette.paleSage, intensity: 0.42 },
    // A bright, papery surround: the plate is a light table, so the metal
    // reflects a pale sky and picks up its edges against it.
    sky: [naturalPalette.warmIvory, naturalPalette.parchment, naturalPalette.taupe],
    band: null,
  },
};

function createEmblemEnvironmentTexture(surface: SurfaceTreatment) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, surface.sky[0]);
  gradient.addColorStop(0.42, surface.sky[1]);
  gradient.addColorStop(1, surface.sky[2]);
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (surface.band) {
    // One soft band above the horizon, for the metal to sweep as it turns —
    // a single travelling highlight instead of a hot blob.
    const top = canvas.height * surface.band.from;
    const bottom = canvas.height * surface.band.to;
    const band = context.createLinearGradient(0, top, 0, bottom);
    band.addColorStop(0, "rgb(236 223 207 / 0%)");
    band.addColorStop(0.5, `rgb(236 223 207 / ${Math.round(surface.band.alpha * 100)}%)`);
    band.addColorStop(1, "rgb(236 223 207 / 0%)");
    context.fillStyle = band;
    context.fillRect(0, top, canvas.width, bottom - top);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Exposure has to be set through a plain parameter: assigning it straight onto
 * the renderer trips `react-hooks/immutability`, because `gl` comes off a hook.
 * Project Orbit carries the same helper for the same reason.
 */
function setRendererToneMappingExposure(
  renderer: { toneMappingExposure: number },
  exposure: number,
) {
  renderer.toneMappingExposure = exposure;
}

function EmblemEnvironment({ surface }: { surface: SurfaceTreatment }) {
  const { gl, invalidate } = useThree();

  const environment = useMemo(() => {
    const source = createEmblemEnvironmentTexture(surface);
    if (!source) return null;
    const pmrem = new THREE.PMREMGenerator(gl);
    const target = pmrem.fromEquirectangular(source);
    source.dispose();
    pmrem.dispose();
    return target.texture;
  }, [gl, surface]);

  useEffect(() => {
    const previousExposure = gl.toneMappingExposure;
    gl.setClearColor(0x000000, 0);
    setRendererToneMappingExposure(gl, surface.exposure);
    invalidate();

    return () => {
      setRendererToneMappingExposure(gl, previousExposure);
      invalidate();
    };
  }, [gl, invalidate, surface.exposure]);

  useEffect(() => () => environment?.dispose(), [environment]);

  return environment ? <primitive attach="environment" object={environment} /> : null;
}

/**
 * The camera frames a square canvas around a centred mark, so fitting is one
 * calculation: back off until the framed half-extent fits the narrower field.
 */
function EmblemCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const setRootState = useThree((state) => state.set);
  const { invalidate, size } = useThree();

  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    const aspect = Math.max(size.width / Math.max(size.height, 1), 0.01);
    const verticalFov = EMBLEM_CAMERA_FOV_DEGREES * DEGREES;
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);
    const distance = EMBLEM_FRAMED_HALF_EXTENT / Math.tan(Math.min(verticalFov, horizontalFov) / 2);

    camera.fov = EMBLEM_CAMERA_FOV_DEGREES;
    camera.aspect = aspect;
    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    setRootState({ camera });
    invalidate();
  }, [invalidate, setRootState, size.height, size.width]);

  return <perspectiveCamera ref={cameraRef} far={40} fov={EMBLEM_CAMERA_FOV_DEGREES} near={0.1} />;
}

function EmblemLogoModel({ surface }: { surface: SurfaceTreatment }) {
  const { scene } = useGLTF(EMBLEM_LOGO_URL, false, true);

  const logo = useMemo(() => {
    const clone = scene.clone(true);

    // Re-strike the mark in one tone. The derivative carries no textures, so
    // this is the mark's entire surface.
    const created: THREE.Material[] = [];
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const struck = new THREE.MeshStandardMaterial({
        color: new THREE.Color(surface.color),
        metalness: surface.metalness,
        roughness: surface.roughness,
        envMapIntensity: surface.envMapIntensity,
      });
      created.push(struck);
      child.material = struck;
      child.castShadow = false;
      child.receiveShadow = false;
    });

    // Both centring and scale come from the measured box: the source pivot sits
    // at the asset's bottom edge, and its authored size is arbitrary.
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const largest = Math.max(size.x, size.y, size.z) || 1;
    const fit = EMBLEM_TARGET_WORLD_SIZE / largest;

    clone.position.sub(center);
    clone.scale.setScalar(fit);
    // `position` was set in unscaled space, so it scales with the mark.
    clone.position.multiplyScalar(fit);
    clone.position.y += EMBLEM_OPTICAL_LIFT;

    return { clone, created };
  }, [scene, surface]);

  useEffect(
    () => () => {
      for (const material of logo.created) material.dispose();
    },
    [logo],
  );

  return <primitive object={logo.clone} dispose={null} />;
}

type EmblemBodyProps = {
  surface: SurfaceTreatment;
  reducedMotion: boolean;
  onReady: () => void;
};

function EmblemBody({ surface, reducedMotion, onReady }: EmblemBodyProps) {
  const swayRef = useRef<THREE.Group>(null);
  const { invalidate } = useThree();

  useEffect(() => {
    onReady();
    invalidate();
  }, [invalidate, onReady]);

  useEffect(() => {
    if (!reducedMotion || !swayRef.current) return;
    swayRef.current.rotation.set(
      EMBLEM_RESTING_PITCH_DEGREES * DEGREES,
      EMBLEM_RESTING_YAW_DEGREES * DEGREES,
      0,
    );
    invalidate();
  }, [invalidate, reducedMotion]);

  useFrame((state) => {
    if (reducedMotion || !swayRef.current) return;
    const seconds = state.clock.getElapsedTime();
    swayRef.current.rotation.y =
      Math.sin((seconds / EMBLEM_SWAY_YAW_SECONDS) * Math.PI * 2) *
      EMBLEM_SWAY_YAW_DEGREES *
      DEGREES;
    swayRef.current.rotation.x =
      Math.sin((seconds / EMBLEM_SWAY_PITCH_SECONDS) * Math.PI * 2) *
      EMBLEM_SWAY_PITCH_DEGREES *
      DEGREES;
    // The canvas runs on `demand`, so a continuous sway has to ask for each next
    // frame itself. A hidden tab stops asking.
    if (!document.hidden) state.invalidate();
  });

  return (
    <group
      ref={swayRef}
      rotation={[EMBLEM_RESTING_PITCH_DEGREES * DEGREES, EMBLEM_RESTING_YAW_DEGREES * DEGREES, 0]}
    >
      <EmblemLogoModel surface={surface} />
    </group>
  );
}

export type Ca2mEmblemSceneProps = {
  accessibleLabel: string;
  surface: EmblemSurface;
  reducedMotion: boolean;
  /** Fires once the emblem is in the scene, so the flat poster can retire. */
  onReady: () => void;
};

export function Ca2mEmblemScene({
  accessibleLabel,
  surface,
  reducedMotion,
  onReady,
}: Ca2mEmblemSceneProps) {
  const treatment = SURFACES[surface];

  return (
    <LazyThreeCanvas
      accessibleLabel={accessibleLabel}
      className="ca2m-emblem__canvas"
      fallback={null}
    >
      <EmblemCamera />
      <EmblemEnvironment surface={treatment} />
      <ambientLight color={treatment.ambient.color} intensity={treatment.ambient.intensity} />
      {/* Key from upper left, matching where the page's other warm light falls. */}
      <directionalLight
        color={treatment.key.color}
        intensity={treatment.key.intensity}
        position={[-2.6, 3.1, 4]}
      />
      {/* A counter-fill, so a monochrome mark does not read as one flat tone. */}
      <directionalLight
        color={treatment.fill.color}
        intensity={treatment.fill.intensity}
        position={[3.4, -1.8, 1.6]}
      />
      <Suspense fallback={null}>
        <EmblemBody onReady={onReady} reducedMotion={reducedMotion} surface={treatment} />
      </Suspense>
    </LazyThreeCanvas>
  );
}
