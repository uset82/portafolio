import {
  BufferGeometry,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  type Material,
} from "three";

import { OBSERVATORY_DRONE_TECHNICAL_ART } from "./drone-system";

type DroneModelTier = "full" | "reduced";

export type ObservatoryDroneModel = {
  root: Group;
  rotorPivots: readonly Group[];
  cameraGimbal: Group;
  diagnostics: {
    tier: DroneModelTier;
    triangles: number;
    drawCalls: number;
    materialCount: number;
    textureCount: 0;
    actionReady: true;
    fidelityClaim: "stylized-approximation-only";
  };
  dispose: () => void;
};

const Y_AXIS = new Vector3(0, 1, 0);
const ROTOR_POSITIONS = [
  [-0.45, 0, -0.45],
  [0.45, 0, -0.45],
  [0.45, 0, 0.45],
  [-0.45, 0, 0.45],
] as const;

function createRotorPaddleGeometry() {
  const geometry = new BufferGeometry();
  const positions: number[] = [];
  const indices: number[] = [];

  for (let bladeIndex = 0; bladeIndex < 4; bladeIndex += 1) {
    const angle = (bladeIndex * Math.PI) / 2;
    const directionX = Math.cos(angle);
    const directionZ = Math.sin(angle);
    const perpendicularX = -directionZ;
    const perpendicularZ = directionX;
    const innerRadius = 0.045;
    const outerRadius = 0.205;
    const innerHalfWidth = 0.032;
    const outerHalfWidth = 0.062;
    const vertexOffset = positions.length / 3;

    positions.push(
      directionX * innerRadius + perpendicularX * innerHalfWidth,
      0,
      directionZ * innerRadius + perpendicularZ * innerHalfWidth,
      directionX * outerRadius + perpendicularX * outerHalfWidth,
      0,
      directionZ * outerRadius + perpendicularZ * outerHalfWidth,
      directionX * outerRadius - perpendicularX * outerHalfWidth,
      0,
      directionZ * outerRadius - perpendicularZ * outerHalfWidth,
      directionX * innerRadius - perpendicularX * innerHalfWidth,
      0,
      directionZ * innerRadius - perpendicularZ * innerHalfWidth,
    );
    indices.push(
      vertexOffset,
      vertexOffset + 1,
      vertexOffset + 2,
      vertexOffset,
      vertexOffset + 2,
      vertexOffset + 3,
    );
  }

  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.name = "DroneProtectedRotorPaddlesGeometry";
  return geometry;
}

function createRepeatedCylinder(
  name: string,
  geometry: BufferGeometry,
  material: Material,
  positions: typeof ROTOR_POSITIONS,
  y: number,
) {
  const instances = new InstancedMesh(geometry, material, positions.length);
  instances.name = name;
  const matrix = new Matrix4();
  positions.forEach(([x, , z], index) => {
    matrix.makeTranslation(x, y, z);
    instances.setMatrixAt(index, matrix);
  });
  instances.instanceMatrix.needsUpdate = true;
  instances.computeBoundingSphere();
  instances.castShadow = false;
  return instances;
}

function countGeometryTriangles(geometry: BufferGeometry) {
  return geometry.index
    ? geometry.index.count / 3
    : (geometry.getAttribute("position")?.count ?? 0) / 3;
}

function inspectModel(root: Group) {
  let triangles = 0;
  let drawCalls = 0;
  const materials = new Set<Material>();

  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const multiplier = object instanceof InstancedMesh ? object.count : 1;
    triangles += countGeometryTriangles(object.geometry) * multiplier;
    drawCalls += 1;
    const meshMaterials = Array.isArray(object.material) ? object.material : [object.material];
    meshMaterials.forEach((material) => materials.add(material));
  });

  return { triangles, drawCalls, materialCount: materials.size };
}

export function createObservatoryDroneModel(tier: DroneModelTier): ObservatoryDroneModel {
  const reduced = tier === "reduced";
  const technicalTier = OBSERVATORY_DRONE_TECHNICAL_ART.tiers[tier];
  const colors = OBSERVATORY_DRONE_TECHNICAL_ART.colors;
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const root = new Group();
  root.name = "DroneRoot";

  const ceramic = new MeshStandardMaterial({
    name: "DroneCeramic",
    color: colors.ceramic,
    roughness: 0.72,
    metalness: 0,
  });
  const ceramicShadow = new MeshStandardMaterial({
    name: "DroneCeramicShadow",
    color: colors.ceramicShadow,
    roughness: 0.82,
    metalness: 0,
  });
  const pewter = new MeshStandardMaterial({
    name: "DroneAgedPewter",
    color: colors.pewter,
    roughness: 0.54,
    metalness: 0.58,
  });
  const joint = new MeshStandardMaterial({
    name: "DroneEspressoJoints",
    color: colors.joint,
    roughness: 0.78,
    metalness: 0.08,
    side: DoubleSide,
  });
  const cameraGlass = new MeshPhysicalMaterial({
    name: "DroneCameraGlass",
    color: colors.cameraGlass,
    roughness: 0.16,
    metalness: 0.12,
    clearcoat: 0.42,
    clearcoatRoughness: 0.2,
  });
  [ceramic, ceramicShadow, pewter, joint, cameraGlass].forEach((material) =>
    materials.add(material),
  );

  const bodySegments = technicalTier.bodySegments;
  const upperBodyGeometry = new SphereGeometry(0.36, bodySegments, reduced ? 10 : 16).scale(
    1,
    0.48,
    0.78,
  );
  const lowerBodyGeometry = new SphereGeometry(0.31, bodySegments, reduced ? 8 : 14).scale(
    1,
    0.36,
    0.74,
  );
  const upperBody = new Mesh(upperBodyGeometry, ceramic);
  upperBody.name = "DroneUpperCeramicShell";
  upperBody.position.y = 0.035;
  const lowerBody = new Mesh(lowerBodyGeometry, ceramicShadow);
  lowerBody.name = "DroneLowerCeramicShell";
  lowerBody.position.y = -0.075;
  root.add(upperBody, lowerBody);
  geometries.add(upperBodyGeometry);
  geometries.add(lowerBodyGeometry);

  const seamGeometry = new TorusGeometry(0.3, 0.018, reduced ? 6 : 8, technicalTier.guardSegments);
  const seam = new Mesh(seamGeometry, pewter);
  seam.name = "DroneEquatorialPanelSeam";
  seam.rotation.x = Math.PI / 2;
  seam.position.y = -0.035;
  root.add(seam);
  geometries.add(seamGeometry);

  const serviceCapGeometry = new CylinderGeometry(0.105, 0.13, 0.035, reduced ? 12 : 20);
  const serviceCap = new Mesh(serviceCapGeometry, pewter);
  serviceCap.name = "DroneUpperServiceCap";
  serviceCap.position.y = 0.205;
  root.add(serviceCap);
  geometries.add(serviceCapGeometry);

  const armGeometry = new CylinderGeometry(0.055, 0.073, 1, reduced ? 7 : 10);
  const arms = new InstancedMesh(armGeometry, pewter, ROTOR_POSITIONS.length);
  arms.name = "DroneEmbeddedArms";
  const armMatrix = new Matrix4();
  const armQuaternion = new Quaternion();
  const armPosition = new Vector3();
  const armDirection = new Vector3();
  const armScale = new Vector3(1, 1, 1);
  ROTOR_POSITIONS.forEach(([x, , z], index) => {
    const outer = new Vector3(x, -0.005, z);
    const inner = outer.clone().multiplyScalar(0.42);
    armDirection.copy(outer).sub(inner);
    const length = armDirection.length();
    armPosition.copy(inner).add(outer).multiplyScalar(0.5);
    armQuaternion.setFromUnitVectors(Y_AXIS, armDirection.normalize());
    armScale.set(1, length, 1);
    armMatrix.compose(armPosition, armQuaternion, armScale);
    arms.setMatrixAt(index, armMatrix);
  });
  arms.instanceMatrix.needsUpdate = true;
  arms.computeBoundingSphere();
  arms.castShadow = false;
  root.add(arms);
  geometries.add(armGeometry);

  const socketGeometry = new CylinderGeometry(0.095, 0.095, 0.085, reduced ? 8 : 12);
  const sockets = new InstancedMesh(socketGeometry, joint, ROTOR_POSITIONS.length);
  sockets.name = "DroneArmSocketCollars";
  ROTOR_POSITIONS.forEach(([x, , z], index) => {
    const socketPosition = new Vector3(x * 0.42, -0.005, z * 0.42);
    armDirection.set(x, 0, z).normalize();
    armQuaternion.setFromUnitVectors(Y_AXIS, armDirection);
    armMatrix.compose(socketPosition, armQuaternion, new Vector3(1, 1, 1));
    sockets.setMatrixAt(index, armMatrix);
  });
  sockets.instanceMatrix.needsUpdate = true;
  sockets.computeBoundingSphere();
  sockets.castShadow = false;
  root.add(sockets);
  geometries.add(socketGeometry);

  const guardGeometry = new TorusGeometry(
    0.235,
    0.018,
    reduced ? 6 : 8,
    technicalTier.guardSegments,
  );
  guardGeometry.rotateX(Math.PI / 2);
  const guards = createRepeatedCylinder(
    "DroneRotorGuards",
    guardGeometry,
    pewter,
    ROTOR_POSITIONS,
    0.025,
  );
  root.add(guards);
  geometries.add(guardGeometry);

  const motorGeometry = new CylinderGeometry(0.075, 0.082, 0.11, reduced ? 10 : 16);
  const motors = createRepeatedCylinder(
    "DroneRotorMotorCaps",
    motorGeometry,
    joint,
    ROTOR_POSITIONS,
    0.005,
  );
  root.add(motors);
  geometries.add(motorGeometry);

  const rotorGeometry = createRotorPaddleGeometry();
  geometries.add(rotorGeometry);
  const rotorPivots = ROTOR_POSITIONS.map(([x, , z], index) => {
    const pivot = new Group();
    pivot.name = `DroneRotorPivot${index + 1}`;
    pivot.position.set(x, 0.07, z);
    pivot.userData = {
      animationRole: "rotor",
      axis: [0, 1, 0],
      socketId: `rotor-motor-${index + 1}`,
      guardRadiusMeters: 0.235,
    };
    const paddles = new Mesh(rotorGeometry, joint);
    paddles.name = `DroneProtectedRotorPaddles${index + 1}`;
    paddles.castShadow = false;
    pivot.add(paddles);
    root.add(pivot);
    return pivot;
  });

  const gimbalPivot = new Group();
  gimbalPivot.name = "DroneCameraGimbal";
  gimbalPivot.position.set(0, -0.17, -0.22);
  gimbalPivot.userData = {
    animationRole: "camera-gimbal",
    axis: [1, 0, 0],
    socketId: "lower-shell-camera-socket",
    rotationLimitsRadians: [-0.14, 0.08],
  };
  const cameraHousingGeometry = new SphereGeometry(0.12, reduced ? 14 : 22, reduced ? 9 : 14).scale(
    1,
    0.82,
    0.9,
  );
  const cameraHousing = new Mesh(cameraHousingGeometry, pewter);
  cameraHousing.name = "DroneCameraHousing";
  const lensGeometry = new CylinderGeometry(0.067, 0.067, 0.025, reduced ? 14 : 24);
  lensGeometry.rotateX(Math.PI / 2);
  const lens = new Mesh(lensGeometry, cameraGlass);
  lens.name = "DroneCameraLens";
  lens.position.z = -0.1;
  gimbalPivot.add(cameraHousing, lens);
  root.add(gimbalPivot);
  geometries.add(cameraHousingGeometry);
  geometries.add(lensGeometry);

  const fastenerGeometry = new SphereGeometry(0.014, reduced ? 5 : 7, reduced ? 4 : 6);
  const fasteners = new InstancedMesh(fastenerGeometry, pewter, technicalTier.fasteners);
  fasteners.name = "DroneHullFastenerRing";
  const fastenerMatrix = new Matrix4();
  for (let index = 0; index < technicalTier.fasteners; index += 1) {
    const angle = (index / technicalTier.fasteners) * Math.PI * 2;
    fastenerMatrix.makeTranslation(Math.cos(angle) * 0.305, -0.034, Math.sin(angle) * 0.238);
    fasteners.setMatrixAt(index, fastenerMatrix);
  }
  fasteners.instanceMatrix.needsUpdate = true;
  fasteners.computeBoundingSphere();
  fasteners.castShadow = false;
  root.add(fasteners);
  geometries.add(fastenerGeometry);

  const collisionProxy = new Object3D();
  collisionProxy.name = "DroneCollisionProxy";
  collisionProxy.userData = {
    colliderType: "compound-spheres",
    bodySphere: { center: [0, -0.01, 0], radius: 0.38 },
    rotorSpheres: ROTOR_POSITIONS.map(([x, , z]) => ({
      center: [x, 0.03, z],
      radius: 0.245,
    })),
    isTrigger: false,
  };
  root.add(collisionProxy);

  const interaction = new Object3D();
  interaction.name = "DroneInteraction";
  interaction.userData = {
    interactionTargetId: OBSERVATORY_DRONE_TECHNICAL_ART.interactionTargetId,
    accessibleLabel: OBSERVATORY_DRONE_TECHNICAL_ART.accessibleLabel,
    href: OBSERVATORY_DRONE_TECHNICAL_ART.href,
  };
  root.add(interaction);

  root.userData = {
    actionReady: true,
    fidelityClaim: OBSERVATORY_DRONE_TECHNICAL_ART.fidelityClaim,
    animationNodes: ["DroneRoot", ...rotorPivots.map((pivot) => pivot.name), gimbalPivot.name],
    sockets: [
      "arm-socket-1",
      "arm-socket-2",
      "arm-socket-3",
      "arm-socket-4",
      "lower-shell-camera-socket",
    ],
    colliderNode: collisionProxy.name,
    destruction: { breakable: false, fractureGroups: [] },
  };

  const inspection = inspectModel(root);
  if (inspection.triangles > technicalTier.maximumTriangles) {
    throw new Error(
      `Drone ${tier} model exceeds its ${technicalTier.maximumTriangles}-triangle budget.`,
    );
  }
  if (inspection.drawCalls > technicalTier.maximumDrawCalls) {
    throw new Error(
      `Drone ${tier} model exceeds its ${technicalTier.maximumDrawCalls}-draw-call budget.`,
    );
  }

  return {
    root,
    rotorPivots,
    cameraGimbal: gimbalPivot,
    diagnostics: {
      tier,
      triangles: inspection.triangles,
      drawCalls: inspection.drawCalls,
      materialCount: inspection.materialCount,
      textureCount: 0,
      actionReady: true,
      fidelityClaim: "stylized-approximation-only",
    },
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    },
  };
}
