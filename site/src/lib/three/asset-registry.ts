import type {
  ObservatoryAsset,
  ObservatoryAssetId,
  ObservatoryAssetRegistry,
} from "./asset-registry-schema";

const posterUrl = "/images/observatory-poster.png";
const manifestPath = "docs/assets/observatory-3d-manifest.json";

function lods(...maxTriangles: number[]) {
  return maxTriangles.map((triangleBudget, level) => ({
    level,
    url: null,
    maxTriangles: triangleBudget,
  }));
}

function pendingProvenance(sourceDescription: string) {
  return {
    owner: "Carlos Carpio",
    sourceDescription,
    manifestPath,
    author: null,
    copyrightOwner: null,
    license: null,
    termsSnapshot: null,
    rightsState: "pending" as const,
    approvedForPublicRuntime: false,
  };
}

function authoredRuntimeProvenance(sourceDescription: string) {
  return {
    owner: "Carlos Carpio",
    sourceDescription,
    manifestPath,
    author: null,
    copyrightOwner: null,
    license: null,
    termsSnapshot: null,
    rightsState: "not-applicable" as const,
    approvedForPublicRuntime: false,
  };
}

export const observatoryAssetRegistry = {
  version: 1,
  units: "meters",
  coordinateSystem: "Y-up",
  assets: [
    {
      id: "observatory-shell",
      kind: "procedural",
      status: "specified",
      scaleMeters: [18, 7, 14],
      nodes: ["ObservatoryShell", "Architecture", "BasinStructure"],
      clips: [],
      materials: ["observatoryArchitecture", "pinaculo", "astraea", "futureEnergy"],
      lods: lods(18_000, 7_500, 0),
      fallback: {
        mode: "full-poster",
        posterUrl,
        description: "Approved full Observatory poster crop",
        domHref: null,
      },
      interaction: null,
      provenance: authoredRuntimeProvenance(
        "Runtime-authored cutaway room, oculus, windows, and basin architecture from the approved reference pack",
      ),
      loadingPriority: "hero-critical",
    },
    {
      id: "water-basin",
      kind: "procedural",
      status: "planned",
      scaleMeters: [9, 0.25, 7],
      nodes: ["WaterSurface", "WaterCollider"],
      clips: [{ id: "bounded-ripples", source: "procedural", required: false }],
      materials: ["waterBasin", "waterHighlight"],
      lods: lods(4096),
      fallback: {
        mode: "poster-region",
        posterUrl,
        description: "Static sage-water region in the approved poster",
        domHref: null,
      },
      interaction: {
        targetId: "water",
        accessibleLabel: "Water basin",
        action: "pause-scene",
        href: null,
        domEquivalent: "Water description and the global scene pause control",
      },
      provenance: authoredRuntimeProvenance(
        "Runtime-authored plane using the approved natural material reference",
      ),
      loadingPriority: "hero-critical",
    },
    {
      id: "robot-guide",
      kind: "model",
      status: "planned-rights-review-required",
      scaleMeters: [1.2, 1.7, 1.1],
      nodes: ["RobotRoot", "RobotBody", "RobotHead", "RobotHandContact", "RobotInteraction"],
      clips: [
        { id: "idle", source: "authored", required: true },
        { id: "head-acknowledgement", source: "authored", required: true },
        { id: "finger-water-contact", source: "authored", required: true },
      ],
      materials: ["ceramicRobot", "ceramicRobotShadow", "electronics", "soundLab"],
      lods: lods(45000, 25000, 12000),
      fallback: {
        mode: "poster-region",
        posterUrl,
        description: "Robot-focused crop preserving the hand and water contact",
        domHref: null,
      },
      interaction: {
        targetId: "robot-guide",
        accessibleLabel: "Observatory guide",
        action: "overview",
        href: null,
        domEquivalent: "Observatory guide button returning to the wide overview",
      },
      provenance: pendingProvenance(
        "Provider-neutral original model to be created from approved reference guidance",
      ),
      loadingPriority: "hero-critical",
    },
    {
      id: "drone",
      kind: "procedural",
      status: "specified",
      scaleMeters: [1.4, 0.45, 1.4],
      nodes: [
        "DroneRoot",
        "DroneUpperCeramicShell",
        "DroneEmbeddedArms",
        "DroneRotorGuards",
        "DroneCameraGimbal",
        "DroneCollisionProxy",
        "DroneInteraction",
      ],
      clips: [{ id: "hover", source: "procedural", required: true }],
      materials: ["ceramicRobot", "ceramicRobotShadow", "astraea", "electronics", "waterBasin"],
      lods: lods(9000, 3800, 0),
      fallback: {
        mode: "dom-only",
        posterUrl,
        description: "Laboratory Aerial systems entry and approved Observatory poster context",
        domHref: "/laboratory",
      },
      interaction: {
        targetId: "drone",
        accessibleLabel: "Aerial systems",
        action: "focus",
        href: "/laboratory",
        domEquivalent: "Aerial systems summary in the Laboratory route",
      },
      provenance: authoredRuntimeProvenance(
        "Runtime-authored guarded camera-drone geometry based on the approved reference pack; stylized approximation only",
      ),
      loadingPriority: "on-demand",
    },
    {
      id: "astraea",
      kind: "procedural",
      status: "specified",
      scaleMeters: [2.6, 2.8, 1.1],
      nodes: ["AstraeaRoot", "AstraeaRings", "AstraeaStand", "AstraeaInteraction"],
      clips: [
        { id: "ring-focus", source: "procedural", required: true },
        { id: "idle-tick", source: "procedural", required: false },
      ],
      materials: ["astraea", "observatoryArchitecture", "pinaculo", "futureEnergy"],
      lods: lods(5000, 1800, 0),
      fallback: {
        mode: "dom-only",
        posterUrl,
        description: "DOM project entry with the ASTRAEA poster detail",
        domHref: "/work/astraea",
      },
      interaction: {
        targetId: "astraea",
        accessibleLabel: "ASTRAEA — Celestial intelligence",
        action: "focus",
        href: "/work/astraea",
        domEquivalent: "ASTRAEA project link and status text",
      },
      provenance: authoredRuntimeProvenance(
        "Runtime-authored celestial chart geometry based on the approved reference pack",
      ),
      loadingPriority: "on-demand",
    },
    {
      id: "pinaculo",
      kind: "procedural",
      status: "specified",
      scaleMeters: [2.7, 0.65, 2.7],
      nodes: ["PinaculoRoot", "PinaculoRing", "PinaculoMarkers", "PinaculoInteraction"],
      clips: [{ id: "marker-focus", source: "procedural", required: true }],
      materials: ["pinaculo", "warmIndicator", "observatoryArchitecture", "electronics"],
      lods: lods(5600, 2400, 0),
      fallback: {
        mode: "dom-only",
        posterUrl,
        description: "DOM project entry with the PINÁCULO poster detail",
        domHref: "/work/pinaculo",
      },
      interaction: {
        targetId: "pinaculo",
        accessibleLabel: "PINÁCULO — Numerological engine",
        action: "focus",
        href: "/work/pinaculo",
        domEquivalent: "PINÁCULO project link and status text",
      },
      provenance: authoredRuntimeProvenance(
        "Runtime-authored 24-position pattern mechanism based on the approved Observatory concept",
      ),
      loadingPriority: "on-demand",
    },
    {
      id: "sound-lab",
      kind: "procedural",
      status: "specified-audio-review-required",
      scaleMeters: [2.5, 0.75, 1.7],
      nodes: ["SoundLabRoot", "SoundLabControls", "SoundLabInteraction"],
      clips: [
        { id: "focus-response", source: "procedural", required: true },
        { id: "audio-response", source: "procedural", required: false },
      ],
      materials: ["soundLab", "observatoryArchitecture", "electronics", "astraea", "futureEnergy"],
      lods: lods(6500, 2700, 0),
      fallback: {
        mode: "dom-only",
        posterUrl,
        description: "Accessible DOM audio foundation and approved poster",
        domHref: "/sound",
      },
      interaction: {
        targetId: "sound-lab",
        accessibleLabel: "Sound Lab — Harmonic instrument",
        action: "focus",
        href: "/sound",
        domEquivalent: "Manual Sound route controls with source-readiness status",
      },
      provenance: authoredRuntimeProvenance(
        "Runtime-authored harmonic-instrument geometry based on the approved reference pack",
      ),
      loadingPriority: "on-demand",
    },
    {
      id: "future-energy",
      kind: "procedural",
      status: "specified",
      scaleMeters: [2.5, 2.4, 1.6],
      nodes: [
        "FutureEnergyRoot",
        "FutureEnergyVessels",
        "FutureEnergyPumps",
        "FutureEnergyCellStack",
        "FutureEnergyInteraction",
      ],
      clips: [{ id: "circuit-focus", source: "procedural", required: true }],
      materials: ["futureEnergy", "astraea", "waterBasin", "soundLab", "observatoryArchitecture"],
      lods: lods(8200, 3600, 0),
      fallback: {
        mode: "dom-only",
        posterUrl,
        description: "DOM project entry with the Future Energy poster detail",
        domHref: "/work/future-energy",
      },
      interaction: {
        targetId: "future-energy",
        accessibleLabel: "Future Energy — Adaptive flow systems",
        action: "focus",
        href: "/work/future-energy",
        domEquivalent: "Future Energy project link and status text",
      },
      provenance: authoredRuntimeProvenance(
        "Runtime-authored dual-circuit flow-battery concept based on the approved reference pack",
      ),
      loadingPriority: "on-demand",
    },
    {
      id: "electronics-ai-module",
      kind: "procedural",
      status: "specified",
      scaleMeters: [2.2, 1.3, 1.3],
      nodes: [
        "ElectronicsRoot",
        "ElectronicsChassis",
        "ElectronicsProtectedModules",
        "ElectronicsIndicators",
        "ElectronicsInteraction",
      ],
      clips: [{ id: "indicator-focus", source: "procedural", required: true }],
      materials: [
        "electronics",
        "futureEnergy",
        "soundLab",
        "warmIndicator",
        "observatoryArchitecture",
      ],
      lods: lods(6200, 2600, 0),
      fallback: {
        mode: "dom-only",
        posterUrl,
        description: "Laboratory route and poster detail",
        domHref: "/laboratory",
      },
      interaction: {
        targetId: "electronics-ai",
        accessibleLabel: "Electronics and AI systems",
        action: "focus",
        href: "/laboratory",
        domEquivalent: "Electronics and AI summary in the Laboratory route",
      },
      provenance: authoredRuntimeProvenance(
        "Runtime-authored protected electronics concept based on the approved reference pack",
      ),
      loadingPriority: "on-demand",
    },
    {
      id: "props-and-plants",
      kind: "model",
      status: "planned-rights-review-required",
      scaleMeters: [8, 4, 5],
      nodes: ["PropsRoot", "Plants", "Books", "Instruments"],
      clips: [],
      materials: ["futureEnergy", "pinaculo", "ceramicRobot", "observatoryArchitecture"],
      lods: lods(10000, 5000),
      fallback: {
        mode: "omit",
        posterUrl,
        description: "Omitted without information loss",
        domHref: null,
      },
      interaction: null,
      provenance: pendingProvenance(
        "To be authored or sourced under compatible commercial-display terms",
      ),
      loadingPriority: "deferred",
    },
    {
      id: "lighting-environment",
      kind: "environment",
      status: "specified",
      scaleMeters: [18, 7, 14],
      nodes: ["LightingEnvironment"],
      clips: [],
      materials: ["observatoryArchitecture", "waterHighlight"],
      lods: lods(0),
      fallback: {
        mode: "full-poster",
        posterUrl,
        description: "Approved poster exposure and reflections",
        domHref: null,
      },
      interaction: null,
      provenance: authoredRuntimeProvenance(
        "Runtime-authored warm local light rig with no HDR or external environment texture",
      ),
      loadingPriority: "hero-critical",
    },
    {
      id: "camera-rig",
      kind: "camera",
      status: "specified",
      scaleMeters: [0, 0, 0],
      nodes: ["CameraRig", "CameraTarget"],
      clips: [
        { id: "home", source: "procedural", required: true },
        { id: "artifact-focus", source: "procedural", required: true },
      ],
      materials: [],
      lods: lods(0),
      fallback: {
        mode: "full-poster",
        posterUrl,
        description: "Responsive approved poster crops",
        domHref: null,
      },
      interaction: null,
      provenance: authoredRuntimeProvenance("Runtime-authored from the approved storyboard"),
      loadingPriority: "hero-critical",
    },
  ],
} satisfies ObservatoryAssetRegistry;

export const observatoryAssetsById = Object.freeze(
  Object.fromEntries(observatoryAssetRegistry.assets.map((asset) => [asset.id, asset])),
) as Readonly<Record<ObservatoryAssetId, ObservatoryAsset>>;

export function getObservatoryAsset(assetId: ObservatoryAssetId) {
  return observatoryAssetsById[assetId];
}
