import type { SceneQualityTier } from "./scene-config";

export type WebGL2Support = "unknown" | "supported" | "unsupported";
export type EffectiveConnectionType = "slow-2g" | "2g" | "3g" | "4g" | "unknown";
export type QualityPreference = "auto" | SceneQualityTier;

export type BrowserCapabilitySnapshot = {
  webgl2: WebGL2Support;
  viewport: {
    width: number;
    height: number;
  };
  devicePixelRatio: number;
  deviceMemoryGb: number | null;
  hardwareConcurrency: number | null;
  reducedMotion: boolean;
  reducedData: boolean;
  effectiveConnectionType: EffectiveConnectionType | null;
  battery: {
    charging: boolean;
    level: number;
  } | null;
};

export const QUALITY_REASON_CODES = [
  "webgl2-unknown",
  "webgl2-unsupported",
  "manual-static",
  "manual-reduced",
  "manual-full",
  "reduced-data",
  "slow-connection",
  "reduced-motion",
  "low-battery",
  "narrow-viewport",
  "high-mobile-dpr",
  "limited-memory",
  "limited-cpu",
  "moderate-connection",
  "balanced-default",
] as const;
export type QualityReasonCode = (typeof QUALITY_REASON_CODES)[number];

export type QualityDecision = {
  tier: SceneQualityTier;
  source: "automatic" | "manual";
  preference: QualityPreference;
  reasons: readonly QualityReasonCode[];
};

export const INITIAL_BROWSER_CAPABILITY_SNAPSHOT: BrowserCapabilitySnapshot = {
  webgl2: "unknown",
  viewport: { width: 0, height: 0 },
  devicePixelRatio: 1,
  deviceMemoryGb: null,
  hardwareConcurrency: null,
  reducedMotion: false,
  reducedData: false,
  effectiveConnectionType: null,
  battery: null,
};

export const INITIAL_QUALITY_DECISION: QualityDecision = {
  tier: "static",
  source: "automatic",
  preference: "auto",
  reasons: ["webgl2-unknown"],
};

export type WebGL2CanvasProbe = {
  getContext: (contextId: "webgl2", options?: WebGLContextAttributes) => unknown;
};

export function detectWebGL2Support(createCanvas: () => WebGL2CanvasProbe): WebGL2Support {
  try {
    const canvas = createCanvas();
    return canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true })
      ? "supported"
      : "unsupported";
  } catch {
    return "unsupported";
  }
}

function manualReason(preference: Exclude<QualityPreference, "auto">): QualityReasonCode {
  if (preference === "static") return "manual-static";
  if (preference === "reduced") return "manual-reduced";
  return "manual-full";
}

export function resolveQualityDecision(
  snapshot: BrowserCapabilitySnapshot,
  preference: QualityPreference,
): QualityDecision {
  if (snapshot.webgl2 === "unknown") {
    return {
      tier: "static",
      source: "automatic",
      preference,
      reasons: ["webgl2-unknown"],
    };
  }

  if (snapshot.webgl2 === "unsupported") {
    return {
      tier: "static",
      source: "automatic",
      preference,
      reasons: ["webgl2-unsupported"],
    };
  }

  if (preference !== "auto") {
    return {
      tier: preference,
      source: "manual",
      preference,
      reasons: [manualReason(preference)],
    };
  }

  if (snapshot.reducedData) {
    return {
      tier: "static",
      source: "automatic",
      preference,
      reasons: ["reduced-data"],
    };
  }

  if (snapshot.effectiveConnectionType === "slow-2g" || snapshot.effectiveConnectionType === "2g") {
    return {
      tier: "static",
      source: "automatic",
      preference,
      reasons: ["slow-connection"],
    };
  }

  const reasons: QualityReasonCode[] = [];
  if (snapshot.reducedMotion) reasons.push("reduced-motion");
  if (snapshot.battery && !snapshot.battery.charging && snapshot.battery.level <= 0.2) {
    reasons.push("low-battery");
  }
  if (snapshot.viewport.width < 768) reasons.push("narrow-viewport");
  if (snapshot.viewport.width < 1_024 && snapshot.devicePixelRatio > 2) {
    reasons.push("high-mobile-dpr");
  }
  if (snapshot.deviceMemoryGb !== null && snapshot.deviceMemoryGb <= 4) {
    reasons.push("limited-memory");
  }
  if (snapshot.hardwareConcurrency !== null && snapshot.hardwareConcurrency <= 4) {
    reasons.push("limited-cpu");
  }
  if (snapshot.effectiveConnectionType === "3g") reasons.push("moderate-connection");

  return reasons.length > 0
    ? { tier: "reduced", source: "automatic", preference, reasons }
    : {
        tier: "full",
        source: "automatic",
        preference,
        reasons: ["balanced-default"],
      };
}
