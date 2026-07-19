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
      kind: "model",
      status: "planned",
      scaleMeters: [18, 7, 14],
      nodes: ["ObservatoryShell", "Architecture", "BasinStructure"],
      clips: [],
      materials: ["observatoryArchitecture", "pinaculo", "astraea", "futureEnergy"],
      lods: lods(45000, 25000, 12000),
      fallback: {
        mode: "full-poster",
        posterUrl,
        description: "Approved full Observatory poster crop",
        domHref: null,
      },
      interaction: null,
      provenance: pendingProvenance("To be authored from the approved mainUI reference pack"),
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
      kind: "model",
      status: "planned-rights-review-required",
      scaleMeters: [1.4, 0.45, 1.4],
      nodes: ["DroneRoot", "DroneBody", "DroneRotors", "DroneInteraction"],
      clips: [{ id: "hover", source: "procedural", required: false }],
      materials: ["astraea", "ceramicRobot", "electronics"],
      lods: lods(12000, 6500, 3000),
      fallback: {
        mode: "omit",
        posterUrl,
        description: "Omitted without information loss",
        domHref: "/laboratory",
      },
      interaction: {
        targetId: "drone",
        accessibleLabel: "Aerial systems",
        action: "focus",
        href: "/laboratory",
        domEquivalent: "Aerial systems summary in the Laboratory route",
      },
      provenance: pendingProvenance("Provider-neutral original model"),
      loadingPriority: "deferred",
    },
    {
      id: "astraea",
      kind: "model",
      status: "planned-rights-review-required",
      scaleMeters: [2.6, 2.8, 1.1],
      nodes: ["AstraeaRoot", "AstraeaRings", "AstraeaStand", "AstraeaInteraction"],
      clips: [
        { id: "ring-focus", source: "procedural", required: true },
        { id: "idle-tick", source: "procedural", required: false },
      ],
      materials: ["astraea", "observatoryArchitecture", "pinaculo", "futureEnergy"],
      lods: lods(22000, 12000, 6000),
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
      provenance: pendingProvenance(
        "Provider-neutral original model based on the approved celestial chart-engine concept",
      ),
      loadingPriority: "on-demand",
    },
    {
      id: "pinaculo",
      kind: "model",
      status: "planned-rights-review-required",
      scaleMeters: [2.7, 0.65, 2.7],
      nodes: ["PinaculoRoot", "PinaculoRing", "PinaculoMarkers", "PinaculoInteraction"],
      clips: [{ id: "marker-focus", source: "procedural", required: true }],
      materials: ["pinaculo", "warmIndicator", "observatoryArchitecture", "electronics"],
      lods: lods(18000, 10000, 4500),
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
      provenance: pendingProvenance(
        "Provider-neutral original model based on the approved numerological-engine concept",
      ),
      loadingPriority: "on-demand",
    },
    {
      id: "sound-lab",
      kind: "model",
      status: "planned-rights-and-audio-review-required",
      scaleMeters: [2.5, 0.75, 1.7],
      nodes: ["SoundLabRoot", "SoundLabControls", "SoundLabInteraction"],
      clips: [{ id: "audio-response", source: "procedural", required: false }],
      materials: ["soundLab", "observatoryArchitecture", "electronics", "astraea"],
      lods: lods(16000, 8500, 4000),
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
      provenance: pendingProvenance(
        "Provider-neutral original model based on the approved harmonic-instrument concept",
      ),
      loadingPriority: "on-demand",
    },
    {
      id: "future-energy",
      kind: "model",
      status: "planned-rights-review-required",
      scaleMeters: [2.5, 2.4, 1.6],
      nodes: ["FutureEnergyRoot", "FutureEnergyVessels", "FutureEnergyInteraction"],
      clips: [{ id: "bounded-flow", source: "procedural", required: false }],
      materials: ["futureEnergy", "astraea", "waterBasin", "waterHighlight"],
      lods: lods(14000, 7500, 3500),
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
      provenance: pendingProvenance(
        "Provider-neutral original model based on the approved adaptive-flow concept",
      ),
      loadingPriority: "on-demand",
    },
    {
      id: "electronics-ai-module",
      kind: "model",
      status: "planned-rights-review-required",
      scaleMeters: [2.2, 1.3, 1.3],
      nodes: ["ElectronicsRoot", "ElectronicsIndicators", "ElectronicsInteraction"],
      clips: [{ id: "status-indicators", source: "procedural", required: false }],
      materials: ["electronics", "astraea", "soundLab", "warmIndicator"],
      lods: lods(11000, 6000),
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
      provenance: pendingProvenance(
        "Provider-neutral original model based on the approved electronics concept",
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
      status: "planned-rights-review-required",
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
      provenance: pendingProvenance(
        "Runtime-authored lights; any HDR environment needs commercial-display rights",
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
