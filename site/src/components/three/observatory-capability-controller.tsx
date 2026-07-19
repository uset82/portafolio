"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  INITIAL_BROWSER_CAPABILITY_SNAPSHOT,
  detectWebGL2Support,
  resolveQualityDecision,
  type BrowserCapabilitySnapshot,
  type EffectiveConnectionType,
  type QualityPreference,
} from "@/lib/three/capability-policy";

import {
  useObservatorySceneSnapshot,
  useObservatorySceneStore,
} from "./observatory-scene-provider";

type NetworkInformationLike = EventTarget & {
  effectiveType?: string;
  saveData?: boolean;
};

type BatteryManagerLike = EventTarget & {
  charging: boolean;
  level: number;
};

type NavigatorWithCapabilityHints = Navigator & {
  connection?: NetworkInformationLike;
  deviceMemory?: number;
  getBattery?: () => Promise<BatteryManagerLike>;
};

const EFFECTIVE_CONNECTION_TYPES = new Set<EffectiveConnectionType>([
  "slow-2g",
  "2g",
  "3g",
  "4g",
  "unknown",
]);

function positiveFinite(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

function normalizeConnectionType(value: string | undefined): EffectiveConnectionType | null {
  return value && EFFECTIVE_CONNECTION_TYPES.has(value as EffectiveConnectionType)
    ? (value as EffectiveConnectionType)
    : null;
}

function readBrowserCapabilitySnapshot(
  webgl2: BrowserCapabilitySnapshot["webgl2"],
  reducedMotion: boolean,
  connection: NetworkInformationLike | undefined,
  battery: BatteryManagerLike | null,
): BrowserCapabilitySnapshot {
  const navigatorWithHints = navigator as NavigatorWithCapabilityHints;
  const batteryLevel =
    battery && Number.isFinite(battery.level) ? Math.min(1, Math.max(0, battery.level)) : null;

  return {
    webgl2,
    viewport: {
      width: Math.max(0, Math.round(window.innerWidth)),
      height: Math.max(0, Math.round(window.innerHeight)),
    },
    devicePixelRatio: positiveFinite(window.devicePixelRatio) ?? 1,
    deviceMemoryGb: positiveFinite(navigatorWithHints.deviceMemory),
    hardwareConcurrency: positiveFinite(navigator.hardwareConcurrency),
    reducedMotion,
    reducedData: connection?.saveData === true,
    effectiveConnectionType: normalizeConnectionType(connection?.effectiveType),
    battery:
      battery && batteryLevel !== null ? { charging: battery.charging, level: batteryLevel } : null,
  };
}

export function ObservatoryCapabilityController() {
  const scene = useObservatorySceneSnapshot();
  const store = useObservatorySceneStore();
  const [snapshot, setSnapshot] = useState(INITIAL_BROWSER_CAPABILITY_SNAPSHOT);
  const decision = useMemo(
    () => resolveQualityDecision(snapshot, scene.quality.preference),
    [scene.quality.preference, snapshot],
  );

  useEffect(() => {
    const navigatorWithHints = navigator as NavigatorWithCapabilityHints;
    const connection = navigatorWithHints.connection;
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const webgl2 = detectWebGL2Support(() => document.createElement("canvas"));
    let battery: BatteryManagerLike | null = null;
    let disposed = false;
    let scheduledFrame: number | null = null;

    const updateSnapshot = () => {
      scheduledFrame = null;
      if (disposed) return;
      setSnapshot(
        readBrowserCapabilitySnapshot(webgl2, reducedMotionQuery.matches, connection, battery),
      );
    };
    const scheduleSnapshot = () => {
      if (scheduledFrame !== null || disposed) return;
      scheduledFrame = window.requestAnimationFrame(updateSnapshot);
    };
    const updateVisibility = () => {
      store.dispatch({ type: "motion/visibility", visible: document.visibilityState !== "hidden" });
    };
    const attachBattery = (nextBattery: BatteryManagerLike) => {
      if (disposed) return;
      battery = nextBattery;
      battery.addEventListener("chargingchange", scheduleSnapshot);
      battery.addEventListener("levelchange", scheduleSnapshot);
      scheduleSnapshot();
    };

    window.addEventListener("resize", scheduleSnapshot, { passive: true });
    reducedMotionQuery.addEventListener("change", scheduleSnapshot);
    connection?.addEventListener("change", scheduleSnapshot);
    document.addEventListener("visibilitychange", updateVisibility);
    updateVisibility();
    updateSnapshot();

    if (navigatorWithHints.getBattery) {
      void navigatorWithHints
        .getBattery()
        .then(attachBattery)
        .catch(() => undefined);
    }

    return () => {
      disposed = true;
      if (scheduledFrame !== null) window.cancelAnimationFrame(scheduledFrame);
      window.removeEventListener("resize", scheduleSnapshot);
      reducedMotionQuery.removeEventListener("change", scheduleSnapshot);
      connection?.removeEventListener("change", scheduleSnapshot);
      document.removeEventListener("visibilitychange", updateVisibility);
      battery?.removeEventListener("chargingchange", scheduleSnapshot);
      battery?.removeEventListener("levelchange", scheduleSnapshot);
    };
  }, [store]);

  useEffect(() => {
    store.dispatch({ type: "capabilities/apply", snapshot, decision });
    store.dispatch({
      type: "motion/preference",
      preference: snapshot.reducedMotion ? "reduce" : "no-preference",
    });
  }, [decision, snapshot, store]);

  return null;
}

export function useObservatoryQualityControl() {
  const scene = useObservatorySceneSnapshot();
  const store = useObservatorySceneStore();
  const setPreference = useCallback(
    (preference: QualityPreference) => {
      store.dispatch({ type: "quality/preference", preference });
    },
    [store],
  );

  return {
    preference: scene.quality.preference,
    tier: scene.quality.tier,
    source: scene.quality.source,
    reasons: scene.quality.reasons,
    setPreference,
  };
}
