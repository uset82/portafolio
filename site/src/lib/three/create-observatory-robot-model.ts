import {
  AnimationClip,
  BufferGeometry,
  CylinderGeometry,
  Euler,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  QuaternionKeyframeTrack,
  SphereGeometry,
  Vector3,
  VectorKeyframeTrack,
  type Material,
} from "three";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";

import { OBSERVATORY_ROBOT_TECHNICAL_ART } from "./robot-system";

type RobotModelTier = "full" | "reduced";
type Vector3Tuple = readonly [number, number, number];

export type ObservatoryRobotModel = {
  scene: Group;
  animations: readonly AnimationClip[];
  diagnostics: {
    tier: RobotModelTier;
    triangles: number;
    drawCalls: number;
    materialCount: number;
    textureCount: 0;
    clipNames: readonly string[];
    fidelityClaim: "stylized-approximation-only";
  };
  dispose: () => void;
};

const CANDIDATE = OBSERVATORY_ROBOT_TECHNICAL_ART.proceduralCandidate;
const Y_AXIS = new Vector3(0, 1, 0);

/**
 * Canonical kneeling pose in meters, model space, Y-up, facing -Z toward the
 * basin. The guide kneels on its right knee, plants its left foot, rests its
 * right hand on the floor, and lowers its left hand until the fingertips reach
 * the water. Every anchor is authored; no captured, scanned, or generated data
 * participates.
 */
const POSE = {
  pelvis: [0, 0.46, 0.02],
  chest: [0, 0.79, -0.15],
  neck: [0, 1, -0.23],
  head: [0.01, 1.07, -0.29],
  contactShoulder: [-0.21, 0.9, -0.2],
  contactElbow: [-0.26, 0.6, -0.44],
  contactWrist: [-0.22, 0.22, -0.6],
  contactFingertip: [-0.2, 0.03, -0.66],
  supportShoulder: [0.21, 0.92, -0.16],
  supportElbow: [0.3, 0.62, -0.32],
  supportWrist: [0.3, 0.24, -0.42],
  supportPalm: [0.3, 0.07, -0.47],
  kneelingHip: [0.135, 0.44, 0.02],
  kneelingKnee: [0.16, 0.11, -0.22],
  kneelingToe: [0.17, 0.07, 0.3],
  plantedHip: [-0.135, 0.44, 0.02],
  plantedKnee: [-0.17, 0.47, -0.3],
  plantedAnkle: [-0.19, 0.1, -0.34],
  plantedToe: [-0.2, 0.05, -0.5],
} as const satisfies Record<string, Vector3Tuple>;

function vector(tuple: Vector3Tuple) {
  return new Vector3(tuple[0], tuple[1], tuple[2]);
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

/**
 * A tapered limb shell laid between two authored joint anchors. Geometry owns
 * the length so every object scale stays at 1 and remains safe to animate.
 */
function createLimbShell({
  name,
  from,
  to,
  radiusStart,
  radiusEnd,
  radialSegments,
  material,
  geometries,
}: {
  name: string;
  from: Vector3Tuple;
  to: Vector3Tuple;
  radiusStart: number;
  radiusEnd: number;
  radialSegments: number;
  material: Material;
  geometries: Set<BufferGeometry>;
}) {
  const start = vector(from);
  const end = vector(to);
  const direction = end.clone().sub(start);
  const length = Math.max(direction.length(), 0.001);
  const geometry = new CylinderGeometry(radiusEnd, radiusStart, length, radialSegments, 1, false);
  const mesh = new Mesh(geometry, material);
  mesh.name = name;
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(Y_AXIS, direction.normalize());
  mesh.castShadow = false;
  geometries.add(geometry);
  return mesh;
}

function createJointShell({
  name,
  position,
  radius,
  widthSegments,
  heightSegments,
  scale,
  material,
  geometries,
}: {
  name: string;
  position: Vector3Tuple;
  radius: number;
  widthSegments: number;
  heightSegments: number;
  scale?: Vector3Tuple;
  material: Material;
  geometries: Set<BufferGeometry>;
}) {
  const geometry = new SphereGeometry(radius, widthSegments, heightSegments);
  if (scale) geometry.scale(scale[0], scale[1], scale[2]);
  const mesh = new Mesh(geometry, material);
  mesh.name = name;
  mesh.position.copy(vector(position));
  mesh.castShadow = false;
  geometries.add(geometry);
  return mesh;
}

/** Re-parents authored model-space children under a pivot without moving them. */
function attachToPivot(pivot: Group, origin: Vector3Tuple, children: readonly Object3D[]) {
  const pivotOrigin = vector(origin);
  children.forEach((child) => {
    child.position.sub(pivotOrigin);
    pivot.add(child);
  });
}

function quaternionTrack(
  nodeName: string,
  times: readonly number[],
  eulers: readonly Vector3Tuple[],
) {
  const values: number[] = [];
  const quaternion = new Quaternion();
  const euler = new Euler();
  eulers.forEach(([x, y, z]) => {
    euler.set(x, y, z);
    quaternion.setFromEuler(euler);
    values.push(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
  });
  return new QuaternionKeyframeTrack(`${nodeName}.quaternion`, [...times], values);
}

function uniformScaleTrack(nodeName: string, times: readonly number[], scales: readonly number[]) {
  const values = scales.flatMap((scale) => [scale, scale, scale]);
  return new VectorKeyframeTrack(`${nodeName}.scale`, [...times], values);
}

/**
 * Three authored clips matching the approved procedural motion language: a
 * mechanical breath with sparse sub-degree joint corrections, one bounded head
 * acknowledgement, and one slow water-contact articulation. Every amplitude
 * stays far below the specified 1.5-degree idle correction limit so the
 * fingertip never visibly leaves the authored water contact.
 */
function createRobotClips(): readonly AnimationClip[] {
  const motion = CANDIDATE.motion;

  const idle = new AnimationClip("idle", motion.idleCycleSeconds, [
    uniformScaleTrack("RobotChestPivot", [0, 3, 6, 9, 12], [1, 1.006, 1, 1.004, 1]),
    quaternionTrack(
      "RobotHead",
      [0, 6.4, 7.6, 12],
      [
        [0, 0, 0],
        [0, 0.012, 0],
        [-0.008, 0.005, 0],
        [0, 0, 0],
      ],
    ),
    quaternionTrack(
      "RobotShoulderContact",
      [0, 4, 8, 12],
      [
        [0, 0, 0],
        [0.006, 0, 0],
        [-0.004, 0, 0],
        [0, 0, 0],
      ],
    ),
  ]);

  const headAcknowledgement = new AnimationClip(
    "head-acknowledgement",
    motion.headAcknowledgementSeconds,
    [
      quaternionTrack(
        "RobotHead",
        [0, 0.5, 1.1, 1.6],
        [
          [0, 0, 0],
          [-motion.maximumHeadPitchRadians * 0.5, motion.maximumHeadYawRadians * 0.55, 0],
          [-motion.maximumHeadPitchRadians * 0.75, motion.maximumHeadYawRadians * 0.4, 0],
          [0, 0, 0],
        ],
      ),
    ],
  );

  const fingerWaterContact = new AnimationClip("finger-water-contact", motion.waterContactSeconds, [
    quaternionTrack(
      "RobotContactHand",
      [0, 0.9, 1.7, 2.6],
      [
        [0, 0, 0],
        [0.07, 0, 0.016],
        [-0.042, 0, -0.011],
        [0, 0, 0],
      ],
    ),
  ]);

  return [idle, headAcknowledgement, fingerWaterContact];
}

/**
 * Builds the rights-safe, runtime-authored Observatory guide candidate. No
 * external mesh, texture, HDR, or generated asset participates; every color
 * resolves through the locked natural palette and every clip is authored in
 * code. The result satisfies the same node/clip/bounds runtime contract that
 * `inspectRobotAssetContract` enforces for an imported model.
 */
export function createObservatoryRobotModel(tier: RobotModelTier): ObservatoryRobotModel {
  const reduced = tier === "reduced";
  const technicalTier = CANDIDATE.tiers[tier];
  const colors = CANDIDATE.colors;
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();

  const ceramic = new MeshStandardMaterial({
    name: "RobotCeramicShell",
    color: colors.ceramic,
    roughness: 0.68,
    metalness: 0,
  });
  const ceramicShadow = new MeshStandardMaterial({
    name: "RobotCeramicUndershell",
    color: colors.ceramicShadow,
    roughness: 0.8,
    metalness: 0.04,
  });
  const armature = new MeshStandardMaterial({
    name: "RobotArmatureJoints",
    color: colors.armature,
    roughness: 0.62,
    metalness: 0.32,
  });
  const walnutDetail = new MeshStandardMaterial({
    name: "RobotWalnutDetail",
    color: colors.detail,
    roughness: 0.7,
    metalness: 0.12,
  });
  [ceramic, ceramicShadow, armature, walnutDetail].forEach((material) => materials.add(material));

  const shellSegments = technicalTier.shellSegments;
  const limbSegments = technicalTier.limbSegments;

  const root = new Group();
  root.name = "RobotRoot";

  const body = new Group();
  body.name = "RobotBody";
  root.add(body);

  // Pelvis, waist segment, and spine column build a segmented mechanical
  // core instead of one inflated volume.
  body.add(
    createJointShell({
      name: "RobotPelvisShell",
      position: POSE.pelvis,
      radius: 0.15,
      widthSegments: shellSegments,
      heightSegments: Math.max(6, Math.round(shellSegments * 0.7)),
      scale: [1, 0.7, 0.85],
      material: ceramicShadow,
      geometries,
    }),
    createJointShell({
      name: "RobotWaistSegment",
      position: [
        (POSE.pelvis[0] + POSE.chest[0]) / 2,
        (POSE.pelvis[1] + POSE.chest[1]) / 2,
        (POSE.pelvis[2] + POSE.chest[2]) / 2,
      ],
      radius: 0.125,
      widthSegments: Math.max(8, shellSegments - 2),
      heightSegments: Math.max(6, Math.round(shellSegments * 0.55)),
      scale: [1, 0.72, 0.86],
      material: ceramicShadow,
      geometries,
    }),
    createLimbShell({
      name: "RobotSpineColumn",
      from: POSE.pelvis,
      to: POSE.chest,
      radiusStart: 0.08,
      radiusEnd: 0.065,
      radialSegments: limbSegments,
      material: armature,
      geometries,
    }),
  );

  // Chest pivot owns the authored mechanical breath.
  const chestPivot = new Group();
  chestPivot.name = "RobotChestPivot";
  chestPivot.position.copy(vector(POSE.chest));
  attachToPivot(chestPivot, POSE.chest, [
    createJointShell({
      name: "RobotTorsoShell",
      position: POSE.chest,
      radius: 0.225,
      widthSegments: shellSegments,
      heightSegments: Math.max(7, Math.round(shellSegments * 0.72)),
      scale: [0.96, 0.86, 0.76],
      material: ceramic,
      geometries,
    }),
    createJointShell({
      name: "RobotChestPlate",
      position: [POSE.chest[0], POSE.chest[1] + 0.02, POSE.chest[2] - 0.11],
      radius: 0.175,
      widthSegments: Math.max(8, shellSegments - 2),
      heightSegments: Math.max(6, Math.round(shellSegments * 0.6)),
      scale: [1, 0.82, 0.42],
      material: ceramicShadow,
      geometries,
    }),
    createLimbShell({
      name: "RobotCollarRing",
      from: [POSE.neck[0], POSE.neck[1] - 0.045, POSE.neck[2] + 0.01],
      to: [POSE.neck[0], POSE.neck[1] - 0.005, POSE.neck[2]],
      radiusStart: 0.082,
      radiusEnd: 0.068,
      radialSegments: Math.max(8, limbSegments),
      material: armature,
      geometries,
    }),
  ]);
  body.add(chestPivot);

  // Head pivot at the neck: the static neck base owns the authored bow toward
  // the basin so the animated RobotHead node keeps an identity rest pose for
  // the mixer; clips compose their bounded corrections on top of the bow.
  const neckBase = new Group();
  neckBase.name = "RobotNeckBase";
  neckBase.position.copy(vector(POSE.neck));
  neckBase.rotation.x = -0.36;
  const head = new Group();
  head.name = "RobotHead";
  attachToPivot(head, POSE.neck, [
    createLimbShell({
      name: "RobotNeckJoint",
      from: POSE.neck,
      to: [POSE.head[0], POSE.head[1] - 0.01, POSE.head[2] + 0.01],
      radiusStart: 0.055,
      radiusEnd: 0.048,
      radialSegments: Math.max(6, limbSegments - 2),
      material: armature,
      geometries,
    }),
    createJointShell({
      name: "RobotHeadShell",
      position: POSE.head,
      radius: 0.118,
      widthSegments: shellSegments,
      heightSegments: Math.max(7, Math.round(shellSegments * 0.72)),
      scale: [0.88, 1.0, 1.14],
      material: ceramic,
      geometries,
    }),
    createJointShell({
      name: "RobotHeadCrownCap",
      position: [POSE.head[0], POSE.head[1] + 0.072, POSE.head[2] + 0.012],
      radius: 0.082,
      widthSegments: Math.max(8, shellSegments - 2),
      heightSegments: Math.max(5, Math.round(shellSegments * 0.5)),
      scale: [0.92, 0.5, 1.05],
      material: ceramicShadow,
      geometries,
    }),
    createJointShell({
      name: "RobotHeadVisorRecess",
      position: [POSE.head[0], POSE.head[1] - 0.024, POSE.head[2] - 0.082],
      radius: 0.078,
      widthSegments: Math.max(8, shellSegments - 2),
      heightSegments: Math.max(5, Math.round(shellSegments * 0.5)),
      scale: [1, 0.55, 0.42],
      material: armature,
      geometries,
    }),
  ]);
  neckBase.add(head);
  body.add(neckBase);

  // Contact arm: shoulder pivot down to the fingertips that meet the water.
  const contactShoulder = new Group();
  contactShoulder.name = "RobotShoulderContact";
  contactShoulder.position.copy(vector(POSE.contactShoulder));
  attachToPivot(contactShoulder, POSE.contactShoulder, [
    createJointShell({
      name: "RobotShoulderContactShell",
      position: POSE.contactShoulder,
      radius: 0.088,
      widthSegments: Math.max(8, shellSegments - 2),
      heightSegments: Math.max(6, Math.round(shellSegments * 0.55)),
      material: ceramic,
      geometries,
    }),
    createLimbShell({
      name: "RobotUpperArmContact",
      from: POSE.contactShoulder,
      to: POSE.contactElbow,
      radiusStart: 0.062,
      radiusEnd: 0.05,
      radialSegments: limbSegments,
      material: ceramic,
      geometries,
    }),
    createJointShell({
      name: "RobotElbowContact",
      position: POSE.contactElbow,
      radius: 0.055,
      widthSegments: Math.max(7, shellSegments - 4),
      heightSegments: Math.max(5, Math.round(shellSegments * 0.45)),
      material: armature,
      geometries,
    }),
    createLimbShell({
      name: "RobotForearmContact",
      from: POSE.contactElbow,
      to: POSE.contactWrist,
      radiusStart: 0.05,
      radiusEnd: 0.038,
      radialSegments: limbSegments,
      material: ceramic,
      geometries,
    }),
  ]);

  // The hand pivot owns the slow water-contact articulation; its children are
  // authored relative to the wrist so rotation happens about the wrist joint.
  const contactHand = new Group();
  contactHand.name = "RobotContactHand";
  contactHand.position.copy(vector(POSE.contactWrist)).sub(vector(POSE.contactShoulder));

  const wristJoint = createJointShell({
    name: "RobotContactWrist",
    position: [0, 0, 0],
    radius: 0.045,
    widthSegments: Math.max(7, shellSegments - 4),
    heightSegments: Math.max(5, Math.round(shellSegments * 0.45)),
    material: armature,
    geometries,
  });
  const palmCenter: Vector3Tuple = [
    (POSE.contactFingertip[0] - POSE.contactWrist[0]) * 0.42,
    (POSE.contactFingertip[1] - POSE.contactWrist[1]) * 0.42 + 0.012,
    (POSE.contactFingertip[2] - POSE.contactWrist[2]) * 0.42,
  ];
  const contactPalm = createJointShell({
    name: "RobotContactPalm",
    position: palmCenter,
    radius: 0.06,
    widthSegments: Math.max(8, shellSegments - 4),
    heightSegments: Math.max(6, Math.round(shellSegments * 0.5)),
    scale: [0.86, 0.68, 1.05],
    material: ceramic,
    geometries,
  });

  const fingerCount = technicalTier.contactFingers;
  const fingerGeometry = new CylinderGeometry(
    0.008,
    0.013,
    0.082,
    Math.max(4, limbSegments - 4),
    1,
    false,
  );
  geometries.add(fingerGeometry);
  const fingers = new InstancedMesh(fingerGeometry, armature, fingerCount);
  fingers.name = "RobotContactFingers";
  fingers.castShadow = false;
  const fingerMatrix = new Matrix4();
  const fingerQuaternion = new Quaternion();
  const fingerScale = new Vector3(1, 1, 1);
  const fingerDirection = vector(POSE.contactFingertip).sub(vector(POSE.contactWrist)).normalize();
  fingerQuaternion.setFromUnitVectors(Y_AXIS, fingerDirection);
  for (let index = 0; index < fingerCount; index += 1) {
    const spread = (index - (fingerCount - 1) / 2) * 0.026;
    const fingerPosition = vector(POSE.contactFingertip)
      .add(new Vector3(spread, 0.035, Math.abs(spread) * 0.35))
      .sub(vector(POSE.contactWrist));
    fingerMatrix.compose(fingerPosition, fingerQuaternion, fingerScale);
    fingers.setMatrixAt(index, fingerMatrix);
  }
  fingers.instanceMatrix.needsUpdate = true;
  fingers.computeBoundingSphere();

  // The exact anchor the presentation solver aligns to the basin water target.
  const handContact = new Object3D();
  handContact.name = "RobotHandContact";
  handContact.position.copy(vector(POSE.contactFingertip).sub(vector(POSE.contactWrist)));
  handContact.userData = {
    role: "hand-water-contact",
    authoredTargetMeters: [...OBSERVATORY_ROBOT_TECHNICAL_ART.handWaterTargetMeters],
  };

  contactHand.add(wristJoint, contactPalm, fingers, handContact);
  contactShoulder.add(contactHand);
  body.add(contactShoulder);

  // Support arm: planted on the floor, deliberately unanimated.
  const supportArm = new Group();
  supportArm.name = "RobotShoulderSupport";
  supportArm.position.copy(vector(POSE.supportShoulder));
  attachToPivot(supportArm, POSE.supportShoulder, [
    createJointShell({
      name: "RobotShoulderSupportShell",
      position: POSE.supportShoulder,
      radius: 0.088,
      widthSegments: Math.max(8, shellSegments - 2),
      heightSegments: Math.max(6, Math.round(shellSegments * 0.55)),
      material: ceramic,
      geometries,
    }),
    createLimbShell({
      name: "RobotUpperArmSupport",
      from: POSE.supportShoulder,
      to: POSE.supportElbow,
      radiusStart: 0.062,
      radiusEnd: 0.05,
      radialSegments: limbSegments,
      material: ceramic,
      geometries,
    }),
    createLimbShell({
      name: "RobotForearmSupport",
      from: POSE.supportElbow,
      to: POSE.supportWrist,
      radiusStart: 0.05,
      radiusEnd: 0.04,
      radialSegments: limbSegments,
      material: ceramic,
      geometries,
    }),
    createLimbShell({
      name: "RobotHandSupport",
      from: POSE.supportWrist,
      to: POSE.supportPalm,
      radiusStart: 0.04,
      radiusEnd: 0.05,
      radialSegments: Math.max(6, limbSegments - 2),
      material: ceramic,
      geometries,
    }),
    createJointShell({
      name: "RobotSupportPalm",
      position: POSE.supportPalm,
      radius: 0.062,
      widthSegments: Math.max(8, shellSegments - 4),
      heightSegments: Math.max(6, Math.round(shellSegments * 0.5)),
      scale: [0.9, 0.55, 1],
      material: ceramicShadow,
      geometries,
    }),
  ]);
  body.add(supportArm);

  // Kneeling leg (right knee down) and planted leg (left foot forward).
  const kneelingLeg = new Group();
  kneelingLeg.name = "RobotLegKneeling";
  kneelingLeg.position.copy(vector(POSE.kneelingHip));
  attachToPivot(kneelingLeg, POSE.kneelingHip, [
    createLimbShell({
      name: "RobotThighKneeling",
      from: POSE.kneelingHip,
      to: POSE.kneelingKnee,
      radiusStart: 0.095,
      radiusEnd: 0.078,
      radialSegments: limbSegments,
      material: ceramic,
      geometries,
    }),
    createJointShell({
      name: "RobotKneeKneeling",
      position: POSE.kneelingKnee,
      radius: 0.082,
      widthSegments: Math.max(7, shellSegments - 4),
      heightSegments: Math.max(5, Math.round(shellSegments * 0.45)),
      material: armature,
      geometries,
    }),
    createLimbShell({
      name: "RobotShinKneeling",
      from: POSE.kneelingKnee,
      to: POSE.kneelingToe,
      radiusStart: 0.075,
      radiusEnd: 0.055,
      radialSegments: limbSegments,
      material: ceramic,
      geometries,
    }),
  ]);
  body.add(kneelingLeg);

  const plantedLeg = new Group();
  plantedLeg.name = "RobotLegPlanted";
  plantedLeg.position.copy(vector(POSE.plantedHip));
  attachToPivot(plantedLeg, POSE.plantedHip, [
    createLimbShell({
      name: "RobotThighPlanted",
      from: POSE.plantedHip,
      to: POSE.plantedKnee,
      radiusStart: 0.095,
      radiusEnd: 0.08,
      radialSegments: limbSegments,
      material: ceramic,
      geometries,
    }),
    createJointShell({
      name: "RobotKneePlanted",
      position: POSE.plantedKnee,
      radius: 0.082,
      widthSegments: Math.max(7, shellSegments - 4),
      heightSegments: Math.max(5, Math.round(shellSegments * 0.45)),
      material: armature,
      geometries,
    }),
    createLimbShell({
      name: "RobotShinPlanted",
      from: POSE.plantedKnee,
      to: POSE.plantedAnkle,
      radiusStart: 0.072,
      radiusEnd: 0.052,
      radialSegments: limbSegments,
      material: ceramic,
      geometries,
    }),
    createLimbShell({
      name: "RobotFootPlanted",
      from: POSE.plantedAnkle,
      to: POSE.plantedToe,
      radiusStart: 0.058,
      radiusEnd: 0.042,
      radialSegments: Math.max(6, limbSegments - 2),
      material: ceramicShadow,
      geometries,
    }),
  ]);
  body.add(plantedLeg);

  // Restrained walnut fasteners along the chest seam.
  if (technicalTier.fasteners > 0) {
    const fastenerGeometry = new SphereGeometry(0.012, reduced ? 5 : 7, reduced ? 4 : 6);
    geometries.add(fastenerGeometry);
    const fasteners = new InstancedMesh(fastenerGeometry, walnutDetail, technicalTier.fasteners);
    fasteners.name = "RobotSeamFasteners";
    fasteners.castShadow = false;
    const fastenerMatrix = new Matrix4();
    for (let index = 0; index < technicalTier.fasteners; index += 1) {
      const angle = (index / technicalTier.fasteners) * Math.PI * 2;
      fastenerMatrix.makeTranslation(
        POSE.chest[0] + Math.cos(angle) * 0.16,
        POSE.chest[1] + Math.sin(angle) * 0.12,
        POSE.chest[2] - 0.13,
      );
      fasteners.setMatrixAt(index, fastenerMatrix);
    }
    fasteners.instanceMatrix.needsUpdate = true;
    fasteners.computeBoundingSphere();
    body.add(fasteners);
  }

  const interaction = new Object3D();
  interaction.name = "RobotInteraction";
  interaction.position.copy(vector(CANDIDATE.interactionAnchorMeters));
  interaction.userData = {
    interactionTargetId: CANDIDATE.interactionTargetId,
    accessibleLabel: CANDIDATE.accessibleLabel,
    action: "overview",
  };
  root.add(interaction);

  root.userData = {
    assetStrategy: CANDIDATE.assetStrategy,
    fidelityClaim: CANDIDATE.fidelityClaim,
    animationNodes: ["RobotChestPivot", "RobotHead", "RobotShoulderContact", "RobotContactHand"],
    contactNode: handContact.name,
  };

  const animations = createRobotClips();
  const inspection = inspectModel(root);

  if (inspection.triangles > technicalTier.maximumTriangles) {
    throw new Error(
      `Robot ${tier} model exceeds its ${technicalTier.maximumTriangles}-triangle budget.`,
    );
  }
  if (inspection.drawCalls > technicalTier.maximumDrawCalls) {
    throw new Error(
      `Robot ${tier} model exceeds its ${technicalTier.maximumDrawCalls}-draw-call budget.`,
    );
  }
  if (inspection.materialCount > technicalTier.materials) {
    throw new Error(`Robot ${tier} model exceeds its ${technicalTier.materials}-material budget.`);
  }

  return {
    scene: root,
    animations,
    diagnostics: {
      tier,
      triangles: inspection.triangles,
      drawCalls: inspection.drawCalls,
      materialCount: inspection.materialCount,
      textureCount: 0,
      clipNames: animations.map((clip) => clip.name),
      fidelityClaim: "stylized-approximation-only",
    },
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    },
  };
}

export type ObservatoryRobotGltfAsset = {
  gltf: GLTF;
  diagnostics: ObservatoryRobotModel["diagnostics"];
  dispose: () => void;
};

/**
 * Wraps the runtime-authored guide in the exact GLTF shape the existing robot
 * runtime consumes, so `ObservatoryRobot`, `inspectRobotAssetContract`, the
 * diagnostics facade, and the MVP gate stay unchanged. The single cast below
 * mirrors the sanctioned test-double cast: only `scene` and `animations` are
 * ever read by the runtime.
 */
export function createObservatoryRobotGltfAsset(tier: RobotModelTier): ObservatoryRobotGltfAsset {
  const model = createObservatoryRobotModel(tier);
  const gltf = {
    scene: model.scene,
    scenes: [model.scene],
    animations: [...model.animations],
    cameras: [],
    asset: { generator: "portfolio-observatory-runtime-authored", version: "2.0" },
    parser: {},
    userData: { runtimeAuthored: true, tier },
  } as unknown as GLTF;

  return { gltf, diagnostics: model.diagnostics, dispose: model.dispose };
}
