"use client";

import { useFrame, useLoader, useThree, type ThreeEvent } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

import { LazyThreeCanvas } from "@/components/three/lazy-three-canvas";
import { useGLTF } from "@/components/three/drei-tools";
import {
  ATOMIC_ORBIT_RINGS,
  ORBIT_CONFIG,
  type AtomicRingDefinition,
  type OrbitIcon,
  type OrbitProject,
} from "@/content/project-orbit";
import { naturalPalette } from "@/styles/palette";

import {
  damp,
  depth01,
  easeInOutCubic,
  getAtomicOrbitPosition,
  shortestDelta,
  TAU,
} from "./project-orbit-math";

type ProjectOrbitSceneProps = {
  inView: boolean;
  projects: readonly OrbitProject[];
  reducedMotion: boolean;
  selectedId: string | null;
  labelRefs: MutableRefObject<Array<HTMLButtonElement | null>>;
  onOpen: (project: OrbitProject) => void;
  onSelect: (projectId: string | null) => void;
  /** Fired once the scene owns the layout, so the shell can retire the SVG
   * fallback and hand the label buttons over. Until this fires, the SVG is the
   * instrument and the scene must not be assumed to be on screen. */
  onReady?: (ready: boolean) => void;
};

type FocusState = {
  from: number;
  to: number;
  startedAt: number;
} | null;

const BRASS = new THREE.Color(naturalPalette.orbitBrass);
const BRIGHT_BRASS = new THREE.Color(naturalPalette.orbitBrightBrass);
const IVORY = naturalPalette.orbitIvory;
const DOTS_PER_NODE = 6;
const ORBIT_LOGO_URL = "/images/brand/ca2m-logo.glb";
const ORBIT_LOGO_SCALE = 2;
/* The forward push lives OUTSIDE the spin group: keeping it inside made the
 * spinning logo orbit a small circle instead of turning about its own center. */
const ORBIT_LOGO_FORWARD_OFFSET = 0.14;
const ORBIT_LOGO_PRESENTATION_PITCH_RADIANS = 0.035;
const ORBIT_LOGO_LEFT_YAW_DEGREES = 15;
const ORBIT_LOGO_LEFT_YAW_RADIANS = (-ORBIT_LOGO_LEFT_YAW_DEGREES * Math.PI) / 180;
/* The rim ring just around the emblem rotates as a gyroscope wobble: the
 * ~15° lean stays constant while the lean DIRECTION travels around the view
 * axis, starting from the left side. The ring therefore visibly rotates but
 * never sweeps edge-on across the logo — the earlier full vertical-axis sweep
 * did, and it read as a dark shadow band over the emblem. */
const ORBIT_MEDALLION_DIAGONAL_TILT_DEGREES = 15;
const ORBIT_MEDALLION_DIAGONAL_TILT_RADIANS =
  (ORBIT_MEDALLION_DIAGONAL_TILT_DEGREES * Math.PI) / 180;
const ORBIT_MEDALLION_DIAGONAL_TILT_QUATERNION = new THREE.Quaternion().setFromAxisAngle(
  new THREE.Vector3(-1, 1, 0).normalize(),
  ORBIT_MEDALLION_DIAGONAL_TILT_RADIANS,
);
/** One clockwise trip of the rim's lean direction; reduced motion holds the static left lean. */
const ORBIT_RIM_WOBBLE_SECONDS = 10;
/** The (-1, 1, 0) left-lean axis expressed as an angle in the view plane. */
const ORBIT_RIM_TILT_AXIS_START_RADIANS = (3 * Math.PI) / 4;
const ORBIT_MEDALLION_USER_DRAG_LIMIT_DEGREES = 18;
const ORBIT_MEDALLION_USER_DRAG_LIMIT_RADIANS =
  (ORBIT_MEDALLION_USER_DRAG_LIMIT_DEGREES * Math.PI) / 180;
/** One stately revolution period constant for the CAM² emblem. */
const ORBIT_LOGO_SPIN_SECONDS = 12;
/* Dragging the emblem or its rim repositions the medallion only; the big
 * repository ring stays put. The clamp keeps the medallion recoverable on
 * screen, and double-clicking it re-centers it on the zero point. */
const ORBIT_PAN_LIMIT_X = 3.2;
const ORBIT_PAN_LIMIT_Y = 1.5;
const ORBIT_CAMERA_FOV_DEGREES = 34;
const ORBIT_CAMERA_NARROW_FOV_DEGREES = 38;
const ORBIT_CAMERA_FIT_PADDING = 1.16;
const ORBIT_MEDALLION_BASE_Y = 0.16;
/** The nucleus reads heavy at full size against the ring span; this trims it
 * without touching the logo's own geometry or the rings around it. */
const ORBIT_MEDALLION_SCALE = 0.78;

/**
 * How much of full size the instrument runs at, for a given viewport width.
 *
 * This replaced a single `width < 760 ? 0.9 : 1` step, which meant every width
 * from a small laptop to a wide monitor got the identical world and only two
 * sizes existed in total. Interpolating instead keeps the rings inside the
 * frame at the in-between widths where the step left them cramped.
 */
function orbitWorldScale(width: number) {
  return THREE.MathUtils.clamp(THREE.MathUtils.mapLinear(width, 420, 1180, 0.68, 1), 0.68, 1);
}
const ORBIT_MEDALLION_BRASS_RIM_RADIUS = 1.3;
const ORBIT_MEDALLION_GOLD_EDGE_RADIUS = 1.44;
const ORBIT_MEDALLION_CORE_RADIUS = 1.47;
const ORBIT_MEDALLION_CORE_DEPTH = -0.62;
const ORBIT_MEDALLION_SHEEN_DEPTH = -0.6;

function ProjectOrbitLogoModel() {
  const { scene } = useGLTF(ORBIT_LOGO_URL, false, true);
  // The source pivot sits at the asset's bottom edge. Instead of a hand-tuned
  // offset, the clone's measured bounding-box center is moved onto the origin,
  // so the logo shares one exact center point with the rim, core, and glow —
  // and every rotation (spin, presentation, drag yaw) turns about that point.
  const logo = useMemo(() => {
    const clone = scene.clone(true);
    const center = new THREE.Box3().setFromObject(clone).getCenter(new THREE.Vector3());
    clone.position.sub(center);
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const lift = (material: THREE.Material) => {
        const next = material.clone();
        if ("envMapIntensity" in next) next.envMapIntensity = 1.45;
        return next;
      };
      child.material = Array.isArray(child.material)
        ? child.material.map(lift)
        : lift(child.material);
    });
    return clone;
  }, [scene]);

  return (
    <group
      name="ProjectOrbitLogoPresentation"
      rotation={[ORBIT_LOGO_PRESENTATION_PITCH_RADIANS, ORBIT_LOGO_LEFT_YAW_RADIANS, 0]}
      scale={ORBIT_LOGO_SCALE}
      userData={{
        canonicalTransformOwner: "ca2m-logo.glb",
        presentationTransformOwner: "ProjectOrbitLogoPresentation",
      }}
    >
      <primitive object={logo} dispose={null} />
    </group>
  );
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function createRailGeometry(radiusX: number, radiusZ: number, tubeRadius: number) {
  const points = new THREE.EllipseCurve(0, 0, radiusX, radiusZ, 0, Math.PI * 2, false, 0)
    .getPoints(220)
    .map((point) => new THREE.Vector3(point.x, 0, point.y));
  return new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points, true, "centripetal", 0.5),
    260,
    tubeRadius,
    12,
    true,
  );
}

function drawIcon(context: CanvasRenderingContext2D, icon: OrbitIcon) {
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 5.5;
  context.strokeStyle = IVORY;
  context.fillStyle = IVORY;

  switch (icon) {
    case "constellation": {
      const points: ReadonlyArray<readonly [number, number]> = [
        [28, 84],
        [46, 58],
        [70, 70],
        [92, 44],
        [58, 34],
        [40, 46],
      ];
      context.beginPath();
      points.forEach(([x, y], index) => {
        if (index) context.lineTo(x, y);
        else context.moveTo(x, y);
      });
      context.stroke();
      context.beginPath();
      context.moveTo(70, 70);
      context.lineTo(74, 96);
      context.stroke();
      [...points, [74, 96]].forEach(([x, y]) => {
        context.beginPath();
        context.arc(x, y, 3.6, 0, Math.PI * 2);
        context.fill();
      });
      break;
    }
    case "pyramid":
      context.beginPath();
      context.arc(64, 64, 40, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.moveTo(64, 34);
      context.lineTo(88, 88);
      context.lineTo(40, 88);
      context.closePath();
      context.stroke();
      context.beginPath();
      context.moveTo(52, 68);
      context.lineTo(76, 68);
      context.stroke();
      break;
    case "bolt":
      context.beginPath();
      context.moveTo(74, 24);
      context.lineTo(44, 70);
      context.lineTo(62, 70);
      context.lineTo(54, 104);
      context.lineTo(86, 58);
      context.lineTo(68, 58);
      context.closePath();
      context.stroke();
      break;
    case "waveform":
      [22, 44, 64, 38, 54, 26].forEach((height, index) => {
        const x = 26 + index * 15;
        context.beginPath();
        context.moveTo(x, 64 - height / 2);
        context.lineTo(x, 64 + height / 2);
        context.stroke();
      });
      break;
    case "robot":
      context.beginPath();
      context.moveTo(64, 22);
      context.lineTo(64, 36);
      context.stroke();
      roundRect(context, 30, 36, 68, 56, 14);
      context.stroke();
      context.beginPath();
      context.arc(50, 62, 5, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.arc(78, 62, 5, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.moveTo(50, 78);
      context.lineTo(78, 78);
      context.stroke();
      break;
    case "code":
      context.beginPath();
      context.moveTo(48, 36);
      context.lineTo(27, 64);
      context.lineTo(48, 92);
      context.moveTo(80, 36);
      context.lineTo(101, 64);
      context.lineTo(80, 92);
      context.moveTo(72, 30);
      context.lineTo(56, 98);
      context.stroke();
      break;
    case "cube":
      context.beginPath();
      context.moveTo(64, 26);
      context.lineTo(98, 46);
      context.lineTo(98, 84);
      context.lineTo(64, 104);
      context.lineTo(30, 84);
      context.lineTo(30, 46);
      context.closePath();
      context.moveTo(30, 46);
      context.lineTo(64, 67);
      context.lineTo(98, 46);
      context.moveTo(64, 67);
      context.lineTo(64, 104);
      context.stroke();
      break;
    case "pin":
      context.beginPath();
      context.arc(64, 64, 40, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.arc(64, 54, 12, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.arc(64, 92, 24, Math.PI * 1.18, Math.PI * 1.82);
      context.stroke();
      break;
    case "mic":
      roundRect(context, 52, 24, 24, 46, 12);
      context.stroke();
      context.beginPath();
      context.arc(64, 66, 24, 0, Math.PI);
      context.stroke();
      context.beginPath();
      context.moveTo(64, 90);
      context.lineTo(64, 104);
      context.moveTo(48, 104);
      context.lineTo(80, 104);
      context.stroke();
      break;
    case "chat":
      roundRect(context, 24, 34, 80, 54, 16);
      context.stroke();
      context.beginPath();
      context.moveTo(46, 88);
      context.lineTo(42, 104);
      context.lineTo(62, 88);
      context.stroke();
      [46, 64, 82].forEach((x) => {
        context.beginPath();
        context.arc(x, 60, 4, 0, Math.PI * 2);
        context.fill();
      });
      break;
  }
}

function createIconTexture(icon: OrbitIcon) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const context = canvas.getContext("2d");
  if (context) {
    context.scale(2, 2);
    drawIcon(context, icon);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

function createOrbitEnvironmentTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, naturalPalette.orbitBrightBrass);
  gradient.addColorStop(0.28, naturalPalette.orbitBearing);
  gradient.addColorStop(0.52, naturalPalette.orbitBrass);
  gradient.addColorStop(0.76, naturalPalette.orbitBronze);
  gradient.addColorStop(1, naturalPalette.espresso);
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgb(255 224 172 / 90%)";
  context.fillRect(0, 44, canvas.width, 52);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function setRendererToneMappingExposure(
  renderer: { toneMappingExposure: number },
  exposure: number,
) {
  renderer.toneMappingExposure = exposure;
}

function configureLogoTexture(texture: THREE.Texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
}

function createMedallionSheenTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const gradient = context.createRadialGradient(96, 78, 4, 128, 128, 132);
  gradient.addColorStop(0, "rgb(255 244 222 / 50%)");
  gradient.addColorStop(0.34, "rgb(255 219 168 / 15%)");
  gradient.addColorStop(1, "rgb(255 200 140 / 0%)");
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(128, 128, 128, 0, Math.PI * 2);
  context.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createMedallionGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const gradient = context.createRadialGradient(128, 128, 8, 128, 128, 128);
  gradient.addColorStop(0, "rgb(255 232 188 / 72%)");
  gradient.addColorStop(0.2, "rgb(233 178 105 / 28%)");
  gradient.addColorStop(0.5, "rgb(160 104 48 / 9%)");
  gradient.addColorStop(1, "rgb(90 55 20 / 0%)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function TransparentOrbitBackdrop() {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    gl.setClearColor(0x000000, 0);
  }, [gl]);

  return null;
}

function OrbitEnvironment() {
  const { gl, invalidate } = useThree();
  const environment = useMemo(() => {
    const sourceTexture = createOrbitEnvironmentTexture();
    if (!sourceTexture) return null;

    const pmrem = new THREE.PMREMGenerator(gl);
    const target = pmrem.fromEquirectangular(sourceTexture);
    sourceTexture.dispose();
    pmrem.dispose();
    return target.texture;
  }, [gl]);

  useEffect(() => {
    const previousExposure = gl.toneMappingExposure;
    setRendererToneMappingExposure(gl, 1.22);
    invalidate();

    return () => {
      setRendererToneMappingExposure(gl, previousExposure);
      invalidate();
    };
  }, [gl, invalidate]);

  useEffect(
    () => () => {
      environment?.dispose();
    },
    [environment],
  );

  return environment ? <primitive attach="environment" object={environment} /> : null;
}

function OrbitCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const setRootState = useThree((state) => state.set);
  const { invalidate, size } = useThree();

  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    const narrow = size.width < 760;
    const worldScale = orbitWorldScale(size.width);
    const aspect = Math.max(size.width / Math.max(size.height, 1), 0.01);
    const fov = narrow ? ORBIT_CAMERA_NARROW_FOV_DEGREES : ORBIT_CAMERA_FOV_DEGREES;
    const verticalFov = THREE.MathUtils.degToRad(fov);
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);
    const distWidth =
      (ORBIT_CONFIG.radiusX * worldScale * ORBIT_CAMERA_FIT_PADDING) / Math.tan(horizontalFov / 2);
    const distHeight =
      ((ORBIT_CONFIG.radiusZ * worldScale + 1.15) * ORBIT_CAMERA_FIT_PADDING) /
      Math.tan(verticalFov / 2);
    const distance = Math.max(8.2, distWidth, distHeight);

    camera.fov = fov;
    camera.aspect = aspect;
    camera.position.set(0, distance * 0.788, distance * 0.616);
    camera.lookAt(0, -0.3, 0);
    camera.updateProjectionMatrix();
    setRootState({ camera });
    invalidate();
  }, [invalidate, setRootState, size.height, size.width]);

  return <perspectiveCamera ref={cameraRef} fov={ORBIT_CAMERA_FOV_DEGREES} near={0.1} far={100} />;
}

function OrbitScene({
  inView,
  projects,
  reducedMotion,
  selectedId,
  labelRefs,
  onOpen,
  onSelect,
  onReady,
}: ProjectOrbitSceneProps) {
  const { camera: viewCamera, invalidate, size } = useThree();

  /* Reaching this point means the Three chunk loaded, WebGL was granted and the
   * canvas exists, so the scene — not the SVG — owns the instrument from here.
   * Reporting it lets the shell retire the fallback instead of drawing both. */
  useEffect(() => {
    onReady?.(true);
    return () => onReady?.(false);
  }, [onReady]);
  const worldScale = orbitWorldScale(size.width);
  const nodeRefs = useRef<Array<THREE.Group | null>>([]);
  const ringMaterialRefs = useRef<Array<THREE.MeshStandardMaterial | null>>([]);
  const edgeMaterialRefs = useRef<Array<THREE.MeshStandardMaterial | null>>([]);
  const haloMaterialRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const railMaterialRefs = useRef<Array<THREE.MeshStandardMaterial | null>>([]);
  const medallionSheenRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const medallionGlowRef = useRef<THREE.SpriteMaterial | null>(null);
  const coreLightRef = useRef<THREE.PointLight | null>(null);
  const dotMaterialRef = useRef<THREE.PointsMaterial | null>(null);
  const bearingRef = useRef<THREE.InstancedMesh | null>(null);
  const medallionRef = useRef<THREE.Group | null>(null);
  const medallionDragYawRef = useRef<THREE.Group | null>(null);
  const medallionRimRef = useRef<THREE.Group | null>(null);
  const logoSpinRef = useRef<THREE.Group | null>(null);
  const entranceStartedAt = useRef(0);
  const centerDragYaw = useRef(0);
  const pan = useRef({ x: 0, y: 0 });
  const projectedPosition = useMemo(() => new THREE.Vector3(), []);
  const medallionWorld = useMemo(() => new THREE.Vector3(), []);
  const rimTiltAxis = useMemo(() => new THREE.Vector3(), []);
  const interaction = useRef({
    dragging: false,
    lastX: 0,
    lastY: 0,
    mode: "rotate" as "rotate" | "pan",
    moved: 0,
    pointerId: -1,
    wasDragged: false,
  });
  const orbit = useRef({
    focus: null as FocusState,
    hoveredId: null as string | null,
    rotation: -Math.PI / 2,
    selectedId: null as string | null,
    speedScale: 1,
    velocity: 0,
  });
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const logoTexture = useLoader(THREE.TextureLoader, "/images/brand/ca2m-mark.png");
  const iconTextures = useMemo(
    () => projects.map((project) => createIconTexture(project.icon)),
    [projects],
  );
  const atomicRingsData = useMemo(() => {
    return ATOMIC_ORBIT_RINGS.map((ring) => {
      const mainRail = createRailGeometry(ring.radiusX, ring.radiusZ, 0.046);
      const innerRail = createRailGeometry(ring.radiusX - 0.28, ring.radiusZ - 0.22, 0.024);
      const outerRail = createRailGeometry(ring.radiusX + 0.22, ring.radiusZ + 0.18, 0.02);
      return {
        ...ring,
        mainRail,
        innerRail,
        outerRail,
      };
    });
  }, []);
  const dotGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(projects.length * DOTS_PER_NODE * 3), 3),
    );
    return geometry;
  }, [projects.length]);
  const dotPositionAttributeRef = useRef(
    dotGeometry.getAttribute("position") as THREE.BufferAttribute,
  );
  const medallionSheenTexture = useMemo(() => createMedallionSheenTexture(), []);
  const medallionGlowTexture = useMemo(() => createMedallionGlowTexture(), []);

  useEffect(() => {
    configureLogoTexture(logoTexture);
    return () => iconTextures.forEach((texture) => texture.dispose());
  }, [iconTextures, logoTexture]);

  useEffect(
    () => () => {
      dotGeometry.dispose();
      medallionSheenTexture?.dispose();
      medallionGlowTexture?.dispose();
    },
    [dotGeometry, medallionGlowTexture, medallionSheenTexture],
  );

  useEffect(() => {
    const active = orbit.current;
    if (active.selectedId === selectedId) return;

    active.selectedId = selectedId;
    active.velocity = 0;
    if (selectedId) {
      const index = projects.findIndex((project) => project.id === selectedId);
      if (index >= 0) {
        const target = ORBIT_CONFIG.focusAngle - (index / projects.length) * Math.PI * 2;
        active.focus = {
          from: active.rotation,
          to: active.rotation + shortestDelta(active.rotation, target),
          startedAt: performance.now(),
        };
      }
    } else {
      active.focus = null;
    }
    invalidate();
  }, [invalidate, projects, selectedId]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden) invalidate();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [invalidate]);

  useEffect(() => {
    if (inView) invalidate();
  }, [inView, invalidate, reducedMotion]);

  const selectProject = (project: OrbitProject) => {
    if (interaction.current.wasDragged) {
      interaction.current.wasDragged = false;
      return;
    }
    if (orbit.current.selectedId === project.id) {
      onOpen(project);
      return;
    }
    onSelect(project.id);
  };

  const beginDrag = (event: ThreeEvent<PointerEvent>, mode: "rotate" | "pan" = "rotate") => {
    event.stopPropagation();
    interaction.current.dragging = true;
    interaction.current.lastX = event.clientX;
    interaction.current.lastY = event.clientY;
    interaction.current.mode = mode;
    interaction.current.moved = 0;
    interaction.current.pointerId = event.pointerId;
    interaction.current.wasDragged = false;
    orbit.current.focus = null;
    orbit.current.velocity = 0;
    const pointerTarget = event.nativeEvent.currentTarget;
    if (pointerTarget instanceof HTMLElement) {
      pointerTarget.setPointerCapture(event.pointerId);
    }
    invalidate();
  };

  const moveDrag = (event: ThreeEvent<PointerEvent>) => {
    const drag = interaction.current;
    if (!drag.dragging || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.lastX;
    const deltaY = event.clientY - drag.lastY;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.moved += Math.abs(deltaX) + Math.abs(deltaY);
    if (drag.moved > ORBIT_CONFIG.dragThresholdPx) drag.wasDragged = true;
    if (drag.wasDragged) {
      if (drag.mode === "pan") {
        // Convert the pointer delta into world units on the z=0 plane so the
        // instrument follows the cursor one-to-one at any viewport size.
        const worldPerPixel =
          (2 *
            viewCamera.position.length() *
            Math.tan((ORBIT_CAMERA_FOV_DEGREES * Math.PI) / 360)) /
          Math.max(size.height, 1);
        pan.current.x = THREE.MathUtils.clamp(
          pan.current.x + deltaX * worldPerPixel,
          -ORBIT_PAN_LIMIT_X,
          ORBIT_PAN_LIMIT_X,
        );
        pan.current.y = THREE.MathUtils.clamp(
          pan.current.y - deltaY * worldPerPixel,
          -ORBIT_PAN_LIMIT_Y,
          ORBIT_PAN_LIMIT_Y,
        );
      } else {
        const step = -deltaX * 0.0042;
        orbit.current.rotation += step;
        orbit.current.velocity = step;
        centerDragYaw.current = THREE.MathUtils.clamp(
          centerDragYaw.current + step,
          -ORBIT_MEDALLION_USER_DRAG_LIMIT_RADIANS,
          ORBIT_MEDALLION_USER_DRAG_LIMIT_RADIANS,
        );
      }
    }
    invalidate();
  };

  const resetOrbitPan = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    pan.current.x = 0;
    pan.current.y = 0;
    invalidate();
  };

  const endDrag = (event: ThreeEvent<PointerEvent>) => {
    const drag = interaction.current;
    if (!drag.dragging || drag.pointerId !== event.pointerId) return;
    drag.dragging = false;
    drag.pointerId = -1;
    const pointerTarget = event.nativeEvent.currentTarget;
    if (pointerTarget instanceof HTMLElement && pointerTarget.hasPointerCapture(event.pointerId)) {
      pointerTarget.releasePointerCapture(event.pointerId);
    }
    invalidate();
  };

  useFrame((state, deltaTime) => {
    const camera = state.camera;
    const active = orbit.current;
    const drag = interaction.current;
    const now = performance.now();
    const isVisible = inView && !document.hidden;
    const delta = Math.min(deltaTime, 0.05);
    if (inView && entranceStartedAt.current === 0) entranceStartedAt.current = now;
    const entranceProgress = reducedMotion
      ? 1
      : entranceStartedAt.current
        ? Math.min(1, (now - entranceStartedAt.current) / 1400)
        : 1;
    const entrance = easeInOutCubic(entranceProgress);

    if (active.focus) {
      const duration = reducedMotion ? 160 : ORBIT_CONFIG.focusDurationMs;
      const progress = Math.min(1, (now - active.focus.startedAt) / duration);
      active.rotation =
        active.focus.from + (active.focus.to - active.focus.from) * easeInOutCubic(progress);
      if (progress === 1) active.focus = null;
    } else if (!drag.dragging && Math.abs(active.velocity) > 0.00002) {
      active.rotation += active.velocity;
      active.velocity *= ORBIT_CONFIG.inertiaDamping;
    } else if (isVisible && !reducedMotion && !active.selectedId && !drag.dragging) {
      const targetSpeed = active.hoveredId ? ORBIT_CONFIG.hoverSlowFactor : 1;
      active.speedScale = damp(active.speedScale, targetSpeed, 6, delta);
      active.rotation +=
        ((Math.PI * 2) / ORBIT_CONFIG.revolutionSeconds) * delta * active.speedScale;
    }

    const medallion = medallionRef.current;
    if (medallion) {
      // The user may carry the medallion anywhere; rim and logo stay
      // concentric because both rotate about this shared zero point.
      medallion.position.set(pan.current.x, ORBIT_MEDALLION_BASE_Y + pan.current.y, 0);
      medallion.lookAt(camera.position);
      medallion.scale.setScalar((0.6 + entrance * 0.4) * worldScale * ORBIT_MEDALLION_SCALE);
    }
    const medallionDragYaw = medallionDragYawRef.current;
    if (medallionDragYaw) medallionDragYaw.rotation.y = centerDragYaw.current;
    const medallionRim = medallionRimRef.current;
    if (medallionRim) {
      if (reducedMotion) {
        medallionRim.quaternion.copy(ORBIT_MEDALLION_DIAGONAL_TILT_QUATERNION);
      } else {
        const wobbleAngle =
          ORBIT_RIM_TILT_AXIS_START_RADIANS - ((now / (ORBIT_RIM_WOBBLE_SECONDS * 1000)) % 1) * TAU;
        rimTiltAxis.set(Math.cos(wobbleAngle), Math.sin(wobbleAngle), 0);
        medallionRim.quaternion.setFromAxisAngle(
          rimTiltAxis,
          ORBIT_MEDALLION_DIAGONAL_TILT_RADIANS,
        );
      }
    }
    const logoSpin = logoSpinRef.current;
    if (logoSpin) {
      // The CAM² emblem remains stationary and front-facing
      void ORBIT_LOGO_SPIN_SECONDS;
      logoSpin.rotation.y = 0;
    }
    const breathe = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(now / 3400);
    if (medallionSheenRef.current) {
      medallionSheenRef.current.opacity = (0.7 + breathe * 0.3) * entrance;
    }
    if (medallionGlowRef.current) {
      medallionGlowRef.current.opacity = (0.22 + breathe * 0.09) * entrance;
    }
    if (coreLightRef.current) coreLightRef.current.intensity = (3.4 + breathe * 0.8) * entrance;
    railMaterialRefs.current.forEach((material, index) => {
      if (material) material.opacity = entranceProgress > 0.12 + index * 0.06 ? 1 : 0;
    });

    /* The nucleus in screen space. Labels are placed relative to it and culled
     * against it, so both need it before any node is laid out. */
    medallionWorld.set(0, ORBIT_MEDALLION_BASE_Y, 0).project(camera);
    const medallionScreen = {
      x: (medallionWorld.x * 0.5 + 0.5) * size.width,
      y: (-medallionWorld.y * 0.5 + 0.5) * size.height,
    };
    const medallionScreenRadius = Math.min(size.width, size.height) * 0.17;

    /* How far forward a node must be for its label to earn space, scaled by how
     * much room there is. Labels keep their pixel size while the world shrinks,
     * so a canvas that comfortably holds eleven at 1400px cannot hold them at
     * 900px — nudging them apart is not enough, some have to stand down. */
    const depthCut = THREE.MathUtils.clamp(
      THREE.MathUtils.mapLinear(size.width, 1180, 760, 0, 0.55),
      0,
      0.55,
    );

    const labelLayouts: Array<{
      label: HTMLButtonElement;
      visible: boolean;
      x: number;
      y: number;
      radialX: number;
      depth: number;
      selected: boolean;
      hovered: boolean;
      occluded: boolean;
    }> = [];

    projects.forEach((project, index) => {
      const node = nodeRefs.current[index];
      if (!node) return;
      const ringDef: AtomicRingDefinition =
        ATOMIC_ORBIT_RINGS.find((r) => r.projectIds.includes(project.id)) ??
        (ATOMIC_ORBIT_RINGS[1] as AtomicRingDefinition);
      const projectIndexOnRing = ringDef.projectIds.indexOf(project.id);
      const baseAngle =
        ringDef.initialNodeAngles[projectIndexOnRing] ??
        (projectIndexOnRing / ringDef.projectIds.length) * TAU;
      const ringSpeed =
        ringDef.id === "vertical"
          ? 0.75
          : ringDef.id === "horizontal"
            ? 1.0
            : ringDef.id === "diagonal-a"
              ? 0.88
              : -0.92;
      const angle = baseAngle + active.rotation * ringSpeed;

      const position = getAtomicOrbitPosition(
        angle,
        ringDef.radiusX * worldScale,
        ringDef.radiusZ * worldScale,
        ringDef.rotationEuler,
        ORBIT_MEDALLION_BASE_Y,
      );
      const depth = depth01(position.z, 3.2 * worldScale);
      const selected = project.id === active.selectedId;
      const hovered = project.id === active.hoveredId;
      const nodeEntrance = Math.min(1, Math.max(0, (entranceProgress - index * 0.045) * 3.4));
      const targetScale =
        (0.84 + depth * 0.26) * (selected ? 1.16 : hovered ? 1.08 : 1) * worldScale * nodeEntrance;
      const currentScale = Number(node.userData.orbitScale ?? targetScale);
      const nextScale = damp(currentScale, Math.max(0.001, targetScale), 12, delta);
      node.userData.orbitScale = nextScale;
      node.position.set(position.x, position.y, position.z);
      node.scale.setScalar(nextScale);
      node.lookAt(camera.position);

      const glow = selected ? 1 : hovered ? 0.7 : project.featured ? 0.22 : 0;
      // A restrained lift toward the medallion rim's brass: slightly higher
      // color floor and a faint emissive so the rings read lit, not neon.
      const ringMaterial = ringMaterialRefs.current[index];
      if (ringMaterial) {
        ringMaterial.color
          .lerpColors(BRASS, BRIGHT_BRASS, 0.22 + glow * 0.65)
          .multiplyScalar(0.9 + depth * 0.18);
        ringMaterial.emissiveIntensity = 0.08 + depth * 0.05 + glow * 0.22;
      }
      const edgeMaterial = edgeMaterialRefs.current[index];
      if (edgeMaterial) {
        edgeMaterial.color.copy(BRIGHT_BRASS).multiplyScalar(0.82 + depth * 0.18);
        edgeMaterial.emissiveIntensity = 0.07 + depth * 0.04 + glow * 0.15;
      }
      const halo = haloMaterialRefs.current[index];
      if (halo) {
        halo.opacity =
          ((project.featured ? 0.16 + (reducedMotion ? 0 : Math.sin(now / 900) * 0.05) : 0) +
            glow * 0.3) *
          entrance;
      }

      for (let dotIndex = 0; dotIndex < DOTS_PER_NODE; dotIndex += 1) {
        const progress = 0.34 + (dotIndex / (DOTS_PER_NODE - 1)) * 0.52;
        dotPositionAttributeRef.current.setXYZ(
          index * DOTS_PER_NODE + dotIndex,
          position.x * (1 - progress),
          position.y * (1 - progress) + ORBIT_MEDALLION_BASE_Y * progress,
          position.z * (1 - progress),
        );
      }

      const label = labelRefs.current[index];
      if (label) {
        projectedPosition.copy(position).project(camera);
        const screenX = (projectedPosition.x * 0.5 + 0.5) * size.width;
        const screenY = (-projectedPosition.y * 0.5 + 0.5) * size.height;

        /* Push the label away from the nucleus along the radial direction on
         * screen, rather than along whichever world axis happened to dominate.
         * The old axis rule sent labels for nodes near the centre straight over
         * the medallion, which is how FUTURE ENERGY ended up covering the
         * logo. */
        const radialX = screenX - medallionScreen.x;
        const radialY = screenY - medallionScreen.y;
        const radialLength = Math.hypot(radialX, radialY) || 1;
        const offset = 58 * nextScale;

        labelLayouts.push({
          label,
          x: screenX + (radialX / radialLength) * offset,
          y: screenY + (radialY / radialLength) * offset,
          radialX: radialX / radialLength,
          depth,
          selected,
          hovered,
          /* Behind the medallion plane and inside its screen disc: the node is
           * genuinely occluded, so its label must not float over the logo. */
          occluded: depth < 0.5 && radialLength < medallionScreenRadius,
          visible:
            selected ||
            hovered ||
            (depth > depthCut && !(depth < 0.5 && radialLength < medallionScreenRadius)),
        });
      }
    });

    /* Keep every label inside the canvas. A node at the far edge of its orbit
     * projected past the bottom of the stage and its label rode along, landing
     * on top of the All systems list underneath. This runs BEFORE collision
     * resolution: clamping afterwards pushed separated labels back together at
     * the edges and reintroduced the overlaps the pass had just removed. */
    const edgeInsetX = 92;
    const edgeInsetY = 26;
    const minY = edgeInsetY;
    const maxY = size.height - edgeInsetY;
    labelLayouts.forEach((layout) => {
      layout.x = Math.min(Math.max(layout.x, edgeInsetX), size.width - edgeInsetX);
      layout.y = Math.min(Math.max(layout.y, minY), maxY);
    });

    /* Second pass. Labels are laid out per node, but whether two of them
     * collide is only knowable once every position is known. Nudge overlapping
     * pairs apart vertically, nearest-to-camera winning, so a label never sits
     * on another one. Front-to-back order also decides who moves. */
    labelLayouts.sort((a, b) => b.depth - a.depth);

    /* Only labels that will actually be drawn take part. Including hidden ones
     * let an invisible label absorb a nudge that a visible pair needed, which
     * is why separation still failed at 900px after the pass was made
     * iterative. */
    const contesting = labelLayouts.filter((layout) => layout.visible);

    /* Each label's own box. A fixed horizontal window guessed at this and got
     * it wrong: pills run from about 80px to 140px wide, so two labels 100px
     * apart still overlapped while the window said they could not. Measuring is
     * eleven `offsetWidth` reads per frame, which is cheap next to being
     * wrong. */
    const boxes = contesting.map((layout) => ({
      layout,
      halfWidth: layout.label.offsetWidth / 2,
      halfHeight: layout.label.offsetHeight / 2,
      /* The anchor decides which way the box extends from the layout point. */
      centreOffsetX:
        layout.radialX < -0.3
          ? -layout.label.offsetWidth / 2
          : layout.radialX > 0.3
            ? layout.label.offsetWidth / 2
            : 0,
    }));

    const separation = 6;

    /* Separating one pair can push a label onto a third, so a single sweep
     * leaves chains unresolved at narrow widths. Repeat until nothing moves,
     * with a hard cap so a frame can never spin here. */
    for (let pass = 0; pass < 4; pass += 1) {
      let moved = false;
      for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
          const a = boxes[i]!;
          const b = boxes[j]!;
          const aCentreX = a.layout.x + a.centreOffsetX;
          const bCentreX = b.layout.x + b.centreOffsetX;
          if (Math.abs(aCentreX - bCentreX) >= a.halfWidth + b.halfWidth) continue;

          const gap = b.layout.y - a.layout.y;
          const needed = a.halfHeight + b.halfHeight + separation;
          if (Math.abs(gap) >= needed) continue;

          /* Push away from the nearer label, but flip the direction when that
           * would leave the canvas, so a label at the edge separates inward
           * instead of being clamped back onto its neighbour. */
          const away = gap >= 0 ? 1 : -1;
          const push = (needed - Math.abs(gap)) * away;
          const target = b.layout.y + push;
          const next = target > maxY || target < minY ? b.layout.y - push : target;
          const clamped = Math.min(Math.max(next, minY), maxY);
          if (clamped !== b.layout.y) {
            b.layout.y = clamped;
            moved = true;
          }
        }
      }
      if (!moved) break;
    }

    labelLayouts.forEach((layout) => {
      const { label, selected, hovered, depth, occluded } = layout;
      const active = selected || hovered;
      /* How far forward a node must be for its label to earn space, scaled by
       * how much room there is. Labels keep their pixel size while the world
       * shrinks, so a canvas that comfortably holds eleven at 1400px cannot
       * hold them at 900px — nudging them apart is not enough, some have to
       * stand down. This used to be a single 760px step, which is why the
       * in-between widths stayed crowded. */
      const depthCut = THREE.MathUtils.clamp(
        THREE.MathUtils.mapLinear(size.width, 1180, 760, 0, 0.55),
        0,
        0.55,
      );
      const visibility =
        occluded && !active ? 0 : active ? 1 : depth > depthCut ? 0.58 + depth * 0.42 : 0;

      const translate =
        layout.radialX < -0.3
          ? "translate(-100%, -50%)"
          : layout.radialX > 0.3
            ? "translate(0, -50%)"
            : "translate(-50%, -50%)";

      label.style.transform = `translate(${layout.x}px, ${layout.y}px) ${translate}`;
      label.style.opacity = String(visibility * entrance);
      label.style.zIndex = String(100 + Math.round(depth * 100));
      label.dataset.active = String(active);
    });

    dotPositionAttributeRef.current.needsUpdate = true;
    if (dotMaterialRef.current) dotMaterialRef.current.opacity = 0.8 * entrance;

    const bearing = bearingRef.current;
    if (bearing) {
      const totalBalls = size.width < 760 ? 16 : ORBIT_CONFIG.bearingBalls;
      let ballIdx = 0;
      ATOMIC_ORBIT_RINGS.forEach((ringDef, ringIndex) => {
        const ballsOnRing = Math.floor(totalBalls / ATOMIC_ORBIT_RINGS.length);
        for (let i = 0; i < ballsOnRing; i += 1) {
          const ballAngle =
            (i / ballsOnRing) * TAU +
            active.rotation * (ringIndex % 2 === 0 ? 1.35 : -1.35) +
            ringIndex * 0.45;
          const ballPos = getAtomicOrbitPosition(
            ballAngle,
            ringDef.radiusX * worldScale,
            ringDef.radiusZ * worldScale,
            ringDef.rotationEuler,
            ORBIT_MEDALLION_BASE_Y,
          );
          dummy.position.set(ballPos.x, ballPos.y, ballPos.z);
          dummy.scale.setScalar(worldScale * entrance * 0.85);
          dummy.updateMatrix();
          bearing.setMatrixAt(ballIdx, dummy.matrix);
          ballIdx += 1;
        }
      });
      bearing.count = ballIdx;
      bearing.instanceMatrix.needsUpdate = true;
    }

    const needsAnotherFrame =
      isVisible &&
      (Boolean(active.focus) ||
        drag.dragging ||
        Math.abs(active.velocity) > 0.00002 ||
        entranceProgress < 1 ||
        !reducedMotion);
    if (needsAnotherFrame) state.invalidate();
  });

  return (
    <group>
      <TransparentOrbitBackdrop />
      <OrbitCamera />
      <OrbitEnvironment />
      <ambientLight color={naturalPalette.orbitAmbient} intensity={0.82} />
      <directionalLight
        color={naturalPalette.orbitKeyLight}
        intensity={1.9}
        position={[-4.5, 8, 7]}
      />
      <directionalLight
        color={naturalPalette.orbitRimLight}
        intensity={1.05}
        position={[6, 3.5, -6]}
      />
      <pointLight
        ref={coreLightRef}
        color={naturalPalette.orbitCoreLight}
        intensity={4.2}
        distance={11}
        decay={2.1}
        position={[0, 0.7, 2.4]}
      />

      <group
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <mesh
          position={[0, -0.12, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={() => {
            if (!interaction.current.wasDragged) onSelect(null);
            interaction.current.wasDragged = false;
          }}
          onPointerLeave={() => {
            orbit.current.hoveredId = null;
          }}
        >
          <planeGeometry args={[28, 14]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        <group>
          {atomicRingsData.map((ring, ringIndex) => (
            <group
              key={ring.id}
              rotation={ring.rotationEuler}
              position={[0, ORBIT_MEDALLION_BASE_Y, 0]}
            >
              <mesh geometry={ring.outerRail} scale={worldScale}>
                <meshStandardMaterial
                  color={naturalPalette.orbitBronze}
                  envMapIntensity={1.25}
                  metalness={0.92}
                  roughness={0.36}
                  transparent
                />
              </mesh>
              <mesh geometry={ring.mainRail} scale={worldScale}>
                <meshStandardMaterial
                  ref={(material) => {
                    railMaterialRefs.current[ringIndex] = material;
                  }}
                  color={naturalPalette.orbitBrass}
                  envMapIntensity={1.4}
                  metalness={0.96}
                  roughness={0.25}
                  transparent
                />
              </mesh>
              <mesh geometry={ring.innerRail} scale={worldScale}>
                <meshStandardMaterial
                  color={naturalPalette.orbitBronze}
                  envMapIntensity={1.25}
                  metalness={0.92}
                  roughness={0.36}
                  transparent
                />
              </mesh>
              {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((spacerAngle, sIdx) => {
                const sx = Math.cos(spacerAngle) * ring.radiusX * worldScale;
                const sz = Math.sin(spacerAngle) * ring.radiusZ * worldScale;
                return (
                  <mesh
                    key={sIdx}
                    position={[sx, 0, sz]}
                    rotation={[0, -spacerAngle, 0]}
                    scale={worldScale}
                  >
                    <boxGeometry args={[0.08, 0.06, 0.44]} />
                    <meshStandardMaterial
                      color={naturalPalette.orbitBrightBrass}
                      metalness={0.95}
                      roughness={0.22}
                    />
                  </mesh>
                );
              })}
            </group>
          ))}
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={worldScale}>
            <torusGeometry args={[1, 0.004, 4, 200]} />
            <meshBasicMaterial color={naturalPalette.taupe} opacity={0.1} transparent />
          </mesh>

          <points geometry={dotGeometry}>
            <pointsMaterial
              ref={dotMaterialRef}
              color={naturalPalette.taupe}
              size={0.07}
              transparent
              opacity={0.8}
              depthWrite={false}
            />
          </points>

          <instancedMesh
            ref={bearingRef}
            args={[undefined, undefined, ORBIT_CONFIG.bearingBalls]}
            frustumCulled={false}
          >
            <sphereGeometry args={[0.088, 18, 12]} />
            <meshStandardMaterial
              color={naturalPalette.orbitBearing}
              metalness={1}
              roughness={0.14}
            />
          </instancedMesh>

          <group
            ref={medallionRef}
            position={[0, ORBIT_MEDALLION_BASE_Y, 0]}
            onPointerDown={(event) => beginDrag(event, "pan")}
            onDoubleClick={resetOrbitPan}
            onClick={(event) => {
              event.stopPropagation();
              if (!interaction.current.wasDragged) {
                const target =
                  document.getElementById("work-group-websites") ||
                  document.getElementById("main-content");
                if (target && window.location.pathname.startsWith("/work")) {
                  target.scrollIntoView({ behavior: "smooth" });
                } else {
                  window.location.assign("/work#work-group-websites");
                }
              }
            }}
            onPointerOver={(event) => {
              event.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "auto";
            }}
          >
            {/* The halo rides inside the medallion so it follows a user drag,
             * but it must never widen the medallion's pointer target. */}
            <sprite position={[0, 0, -0.05]} scale={[4.8, 4.8, 1]} raycast={() => null}>
              <spriteMaterial
                ref={medallionGlowRef}
                map={medallionGlowTexture}
                transparent
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                opacity={0.34}
              />
            </sprite>
            {/* Core and sheen sit OUTSIDE the drag yaw: they live 0.6 behind
             * the origin, so yawing them swung their centers sideways and the
             * ring stopped being concentric with the logo. */}
            <mesh position={[0, 0, ORBIT_MEDALLION_CORE_DEPTH]}>
              <circleGeometry args={[ORBIT_MEDALLION_CORE_RADIUS, 72]} />
              <meshStandardMaterial
                color={naturalPalette.espresso}
                metalness={0.38}
                roughness={0.48}
              />
            </mesh>
            <mesh position={[0, 0, ORBIT_MEDALLION_SHEEN_DEPTH]}>
              <circleGeometry args={[ORBIT_MEDALLION_CORE_RADIUS - 0.02, 64]} />
              <meshBasicMaterial
                ref={medallionSheenRef}
                map={medallionSheenTexture}
                transparent
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
            <group ref={medallionDragYawRef} name="ProjectOrbitMedallionDragYaw">
              <group ref={medallionRimRef} name="ProjectOrbitMedallionRimDiagonalTilt">
                <mesh>
                  <torusGeometry args={[ORBIT_MEDALLION_BRASS_RIM_RADIUS, 0.07, 18, 96]} />
                  <meshStandardMaterial
                    color={naturalPalette.orbitBrass}
                    envMapIntensity={1.35}
                    metalness={0.95}
                    roughness={0.28}
                  />
                </mesh>
                <mesh>
                  <torusGeometry args={[ORBIT_MEDALLION_GOLD_EDGE_RADIUS, 0.018, 10, 96]} />
                  <meshStandardMaterial
                    color={naturalPalette.orbitBrightBrass}
                    envMapIntensity={1.35}
                    metalness={0.95}
                    roughness={0.28}
                  />
                </mesh>
              </group>
              <group name="ProjectOrbitLogoForward" position={[0, 0, ORBIT_LOGO_FORWARD_OFFSET]}>
                <group ref={logoSpinRef} name="ProjectOrbitLogoLeftYaw">
                  <Suspense
                    fallback={
                      <mesh>
                        <planeGeometry args={[1.9, 1.9]} />
                        <meshBasicMaterial map={logoTexture} transparent />
                      </mesh>
                    }
                  >
                    <ProjectOrbitLogoModel />
                  </Suspense>
                </group>
              </group>
            </group>
            <pointLight
              color={naturalPalette.orbitCoreLight}
              intensity={2.8}
              distance={7}
              position={[0, 0.5, 1.4]}
            />
          </group>

          {projects.map((project, index) => (
            <group
              key={project.id}
              ref={(node) => {
                nodeRefs.current[index] = node;
              }}
              onClick={(event) => {
                event.stopPropagation();
                selectProject(project);
              }}
              onDoubleClick={(event) => {
                event.stopPropagation();
                if (!interaction.current.wasDragged) onOpen(project);
              }}
              onPointerOver={(event) => {
                event.stopPropagation();
                orbit.current.hoveredId = project.id;
                invalidate();
              }}
              onPointerOut={(event) => {
                event.stopPropagation();
                if (orbit.current.hoveredId === project.id) {
                  orbit.current.hoveredId = null;
                  invalidate();
                }
              }}
            >
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.56, 0.56, 0.13, 48]} />
                <meshStandardMaterial
                  color={naturalPalette.espresso}
                  metalness={0.42}
                  roughness={0.46}
                />
              </mesh>
              {/* The same two-ring structure as the medallion: a full brass
               * torus with the rim's segment quality plus a thin bright gold
               * outer edge, so the small rings match its shape and shine. */}
              <mesh position={[0, 0, 0.08]}>
                <torusGeometry args={[0.575, 0.05, 18, 96]} />
                <meshStandardMaterial
                  ref={(material) => {
                    ringMaterialRefs.current[index] = material;
                  }}
                  color={naturalPalette.orbitBrass}
                  emissive={naturalPalette.orbitBrass}
                  emissiveIntensity={0.05}
                  metalness={0.95}
                  roughness={0.28}
                />
              </mesh>
              <mesh position={[0, 0, 0.08]}>
                <torusGeometry args={[0.66, 0.014, 10, 96]} />
                <meshStandardMaterial
                  ref={(material) => {
                    edgeMaterialRefs.current[index] = material;
                  }}
                  color={naturalPalette.orbitBrightBrass}
                  emissive={naturalPalette.orbitBrightBrass}
                  emissiveIntensity={0.04}
                  metalness={0.95}
                  roughness={0.28}
                />
              </mesh>
              <mesh position={[0, 0, 0.07]}>
                <circleGeometry args={[0.53, 48]} />
                <meshStandardMaterial
                  color={naturalPalette.espresso}
                  metalness={0.38}
                  roughness={0.48}
                />
              </mesh>
              <mesh position={[0, 0, 0.095]}>
                <planeGeometry args={[0.68, 0.68]} />
                <meshBasicMaterial map={iconTextures[index] ?? null} transparent opacity={1} />
              </mesh>
              <mesh position={[0, 0, 0.018]}>
                <ringGeometry args={[0.63, 0.76, 64]} />
                <meshBasicMaterial
                  ref={(material) => {
                    haloMaterialRefs.current[index] = material;
                  }}
                  color={naturalPalette.orbitHalo}
                  depthWrite={false}
                  opacity={project.featured ? 0.16 : 0}
                  transparent
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}

export function ProjectOrbitScene(props: ProjectOrbitSceneProps) {
  return (
    <LazyThreeCanvas
      accessibleLabel="Project Orbit: an interactive constellation of Carlos Carpio's systems"
      className="project-orbit__three-canvas"
      fallback={null}
    >
      <OrbitScene {...props} />
    </LazyThreeCanvas>
  );
}
