"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { useGLTF } from "@/components/three/drei-tools";
import { LazyThreeCanvas } from "@/components/three/lazy-three-canvas";
import { naturalPalette } from "@/styles/palette";

/**
 * The CA²M emblem at the centre of the contact signal, struck rather than plated.
 *
 * The first attempt shipped the asset as authored — baked copper PBR, high
 * metalness, a full revolution — and it was wrong three times over. The copper
 * was the most saturated thing on a site built from espresso, buff and sage. The
 * revolution kept presenting a reading monogram off-axis, where its strokes
 * collapse into a knot. And the blown specular ate the letterform edges.
 *
 * So the mark is re-struck in the page's own material: one palette tone over the
 * espresso disc, depth from light and from the mark's own bevels rather than
 * from hue or from any map. It faces the reader and sways a few degrees about
 * that axis, so it never turns edge-on and never stops being legible.
 *
 * `ca2m-logo-signal.glb` is a hard derivative of the same source the Project
 * Orbit nucleus comes from. See `scripts/optimize-contact-signal-logo.ts`.
 */
const SIGNAL_LOGO_URL = "/images/brand/ca2m-logo-signal.glb";

/**
 * The emblem's largest dimension, in world units. Scale is derived from the
 * measured bounding box rather than hand-tuned, so the asset's own proportions
 * cannot change how much of the disc the mark occupies.
 */
const SIGNAL_TARGET_WORLD_SIZE = 2;
/** Half-extent the camera frames, leaving the mark a margin inside its socket. */
const SIGNAL_FRAMED_HALF_EXTENT = 1.16;
/**
 * An optical lift, in world units.
 *
 * The superscript 2 pushes the bounding box upward while contributing almost no
 * visual weight, so a box-centred mark hangs low: the C, A and M that carry the
 * mass sit below the disc's middle. This raises the mark until that mass reads
 * centred, which is what the eye actually measures.
 */
const SIGNAL_OPTICAL_LIFT = 0.07;
/** Long lens: a short one splays the outer strokes and warps the counters. */
const SIGNAL_CAMERA_FOV_DEGREES = 22;

/** The sway, in degrees off face-on. Small enough that the mark always reads. */
const SIGNAL_SWAY_YAW_DEGREES = 13;
const SIGNAL_SWAY_PITCH_DEGREES = 3.6;
/** Two periods that do not divide evenly, so the sway never visibly loops. */
const SIGNAL_SWAY_YAW_SECONDS = 17;
const SIGNAL_SWAY_PITCH_SECONDS = 11;
/** Where a still emblem rests: barely off-square, enough to show it has depth. */
const SIGNAL_RESTING_YAW_DEGREES = -5.5;
const SIGNAL_RESTING_PITCH_DEGREES = 1.6;

const DEGREES = Math.PI / 180;

/**
 * A dark surround carrying one soft light band above the horizon.
 *
 * The band is what the metal sweeps as it sways — a single travelling highlight
 * instead of the hot blob a full bright gradient produced.
 */
function createSignalEnvironmentTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, naturalPalette.orbitEnvHighlight);
  gradient.addColorStop(0.42, naturalPalette.orbitEnvMid);
  gradient.addColorStop(1, naturalPalette.orbitEnvBlack);
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const band = context.createLinearGradient(0, 26, 0, 92);
  band.addColorStop(0, "rgb(236 223 207 / 0%)");
  band.addColorStop(0.5, "rgb(236 223 207 / 62%)");
  band.addColorStop(1, "rgb(236 223 207 / 0%)");
  context.fillStyle = band;
  context.fillRect(0, 26, canvas.width, 66);

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

function SignalEnvironment() {
  const { gl, invalidate } = useThree();

  const environment = useMemo(() => {
    const source = createSignalEnvironmentTexture();
    if (!source) return null;
    const pmrem = new THREE.PMREMGenerator(gl);
    const target = pmrem.fromEquirectangular(source);
    source.dispose();
    pmrem.dispose();
    return target.texture;
  }, [gl]);

  useEffect(() => {
    const previousExposure = gl.toneMappingExposure;
    gl.setClearColor(0x000000, 0);
    // A shade under the site default of 1.08, and well under Project Orbit's
    // 1.22. The disc is one of the darkest surfaces here and the emblem has to
    // sit in it rather than glow out of it.
    setRendererToneMappingExposure(gl, 1.04);
    invalidate();

    return () => {
      setRendererToneMappingExposure(gl, previousExposure);
      invalidate();
    };
  }, [gl, invalidate]);

  useEffect(() => () => environment?.dispose(), [environment]);

  return environment ? <primitive attach="environment" object={environment} /> : null;
}

/**
 * The camera frames a square canvas around a centred mark, so fitting is one
 * calculation: back off until the framed half-extent fits the narrower field.
 */
function SignalCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const setRootState = useThree((state) => state.set);
  const { invalidate, size } = useThree();

  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    const aspect = Math.max(size.width / Math.max(size.height, 1), 0.01);
    const verticalFov = SIGNAL_CAMERA_FOV_DEGREES * DEGREES;
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);
    const distance = SIGNAL_FRAMED_HALF_EXTENT / Math.tan(Math.min(verticalFov, horizontalFov) / 2);

    camera.fov = SIGNAL_CAMERA_FOV_DEGREES;
    camera.aspect = aspect;
    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    setRootState({ camera });
    invalidate();
  }, [invalidate, setRootState, size.height, size.width]);

  return <perspectiveCamera ref={cameraRef} far={40} fov={SIGNAL_CAMERA_FOV_DEGREES} near={0.1} />;
}

function SignalLogoModel() {
  const { scene } = useGLTF(SIGNAL_LOGO_URL, false, true);

  const logo = useMemo(() => {
    const clone = scene.clone(true);

    // Re-strike the mark in one tone. The derivative carries no textures at all
    // — see `scripts/optimize-contact-signal-logo.ts` for why the authored maps
    // were traded for triangles — so this is the mark's entire surface.
    const created: THREE.Material[] = [];
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const struck = new THREE.MeshStandardMaterial({
        // Sand rather than buff: against a sunk, near-black well the lighter
        // tone reads as struck bone-metal instead of merging with the surround.
        color: new THREE.Color(naturalPalette.sand),
        // Enough metal to catch the environment's light band as it sways, matte
        // enough that the highlight stays a sweep instead of clipping to white.
        metalness: 0.52,
        roughness: 0.42,
        envMapIntensity: 0.72,
        // The mark's own bevels carry the form now, so shading must follow the
        // geometry exactly rather than averaging across the hard edges the
        // simplifier was finally allowed to keep.
        flatShading: false,
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
    const fit = SIGNAL_TARGET_WORLD_SIZE / largest;

    clone.position.sub(center);
    clone.scale.setScalar(fit);
    // `position` was set in unscaled space, so it scales with the mark.
    clone.position.multiplyScalar(fit);
    clone.position.y += SIGNAL_OPTICAL_LIFT;

    return { clone, created };
  }, [scene]);

  useEffect(
    () => () => {
      for (const material of logo.created) material.dispose();
    },
    [logo],
  );

  return <primitive object={logo.clone} dispose={null} />;
}

type SignalEmblemProps = {
  reducedMotion: boolean;
  onReady: () => void;
};

function SignalEmblem({ reducedMotion, onReady }: SignalEmblemProps) {
  const swayRef = useRef<THREE.Group>(null);
  const { invalidate } = useThree();

  useEffect(() => {
    onReady();
    invalidate();
  }, [invalidate, onReady]);

  useEffect(() => {
    if (!reducedMotion || !swayRef.current) return;
    swayRef.current.rotation.set(
      SIGNAL_RESTING_PITCH_DEGREES * DEGREES,
      SIGNAL_RESTING_YAW_DEGREES * DEGREES,
      0,
    );
    invalidate();
  }, [invalidate, reducedMotion]);

  useFrame((state) => {
    if (reducedMotion || !swayRef.current) return;
    const seconds = state.clock.getElapsedTime();
    swayRef.current.rotation.y =
      Math.sin((seconds / SIGNAL_SWAY_YAW_SECONDS) * Math.PI * 2) *
      SIGNAL_SWAY_YAW_DEGREES *
      DEGREES;
    swayRef.current.rotation.x =
      Math.sin((seconds / SIGNAL_SWAY_PITCH_SECONDS) * Math.PI * 2) *
      SIGNAL_SWAY_PITCH_DEGREES *
      DEGREES;
    // The canvas runs on `demand`, so a continuous sway has to ask for each next
    // frame itself. A hidden tab stops asking.
    if (!document.hidden) state.invalidate();
  });

  return (
    <group
      ref={swayRef}
      rotation={[SIGNAL_RESTING_PITCH_DEGREES * DEGREES, SIGNAL_RESTING_YAW_DEGREES * DEGREES, 0]}
    >
      <SignalLogoModel />
    </group>
  );
}

export type ContactSignalSceneProps = {
  accessibleLabel: string;
  reducedMotion: boolean;
  /** Fires once the emblem is in the scene, so the poster monogram can retire. */
  onReady: () => void;
};

export function ContactSignalScene({
  accessibleLabel,
  reducedMotion,
  onReady,
}: ContactSignalSceneProps) {
  return (
    <LazyThreeCanvas
      accessibleLabel={accessibleLabel}
      className="contact-path__signal-canvas"
      fallback={null}
    >
      <SignalCamera />
      <SignalEnvironment />
      <ambientLight color={naturalPalette.orbitAmbient} intensity={0.72} />
      {/* Key from upper left, matching where the page's other warm light falls. */}
      <directionalLight color={naturalPalette.sand} intensity={2.05} position={[-2.6, 3.1, 4]} />
      {/* A cool counter-fill, so a monochrome mark does not read as flat brown. */}
      <directionalLight color={naturalPalette.paleSage} intensity={0.5} position={[3.4, -1.8, 1.6]} />
      <Suspense fallback={null}>
        <SignalEmblem onReady={onReady} reducedMotion={reducedMotion} />
      </Suspense>
    </LazyThreeCanvas>
  );
}
