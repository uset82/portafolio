"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import type { QualityPreference, QualityReasonCode } from "@/lib/three/capability-policy";
import {
  clearObservatoryExperiencePreferences,
  DEFAULT_OBSERVATORY_EXPERIENCE_PREFERENCES,
  OBSERVATORY_PREFERENCES_STORAGE_KEY,
  OBSERVATORY_PREFERENCES_VERSION,
  parseObservatoryExperiencePreferences,
  readObservatoryExperiencePreferences,
  writeObservatoryExperiencePreferences,
  type SceneMotionSetting,
} from "@/lib/three/experience-preferences";
import { SOUND_LAB_AUDIO_CONTRACT } from "@/lib/three/sound-lab-system";

import { useObservatoryExperienceControl } from "./observatory-capability-controller";
import styles from "./observatory-experience-controls.module.css";

const QUALITY_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "full", label: "Full" },
  { value: "reduced", label: "Reduced" },
  { value: "static", label: "Poster" },
] as const satisfies readonly { value: QualityPreference; label: string }[];

const MOTION_OPTIONS = [
  { value: "system", label: "Follow system" },
  { value: "reduce", label: "Reduce motion" },
] as const satisfies readonly { value: SceneMotionSetting; label: string }[];

const TIER_LABELS = {
  full: "Full",
  reduced: "Reduced",
  static: "Poster",
} as const;

const QUALITY_REASON_LABELS: Record<QualityReasonCode, string> = {
  "webgl2-unknown": "Interactive support is being checked; the poster remains available.",
  "webgl2-unsupported": "WebGL2 is unavailable, so the complete poster experience remains.",
  "manual-static": "Poster was selected manually.",
  "manual-reduced": "Reduced quality was selected manually.",
  "manual-full": "Full quality was selected manually.",
  "reduced-data": "Auto chose Poster because reduced-data mode is active.",
  "slow-connection": "Auto chose Poster for the current connection.",
  "reduced-motion": "Auto chose Reduced quality to respect the system motion preference.",
  "low-battery": "Auto chose Reduced quality for the current battery state.",
  "narrow-viewport": "Auto chose Reduced quality for this viewport.",
  "high-mobile-dpr": "Auto chose Reduced quality for this high-density viewport.",
  "limited-memory": "Auto chose Reduced quality for the available device memory.",
  "limited-cpu": "Auto chose Reduced quality for the available processors.",
  "moderate-connection": "Auto chose Reduced quality for the current connection.",
  "balanced-default": "Auto selected the full interactive tier.",
};

export function ObservatoryExperienceControls() {
  const {
    quality,
    motion,
    setQualityPreference,
    setMotionSetting,
    setPaused: updatePaused,
    applyPreferences,
    resetPreferences,
    markSoundUnavailable,
  } = useObservatoryExperienceControl();
  const qualityGroupId = useId();
  const motionGroupId = useId();
  const statusId = useId();
  const summaryRef = useRef<HTMLElement>(null);
  const explicitPreferenceRef = useRef(false);
  const hydratedRef = useRef(false);
  const storageAvailableRef = useRef(true);
  const [open, setOpen] = useState(false);
  const closeAndRestoreFocus = useCallback(() => {
    setOpen(false);
    window.requestAnimationFrame(() => summaryRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!SOUND_LAB_AUDIO_CONTRACT.playerAvailable) {
      markSoundUnavailable();
    }
  }, [markSoundUnavailable]);

  useEffect(() => {
    try {
      const rawPreferences = window.localStorage.getItem(OBSERVATORY_PREFERENCES_STORAGE_KEY);
      const stored = readObservatoryExperiencePreferences(window.localStorage);
      if (stored) {
        explicitPreferenceRef.current = true;
        applyPreferences(stored);
      } else if (rawPreferences !== null) {
        clearObservatoryExperiencePreferences(window.localStorage);
      }
    } catch {
      storageAvailableRef.current = false;
    } finally {
      hydratedRef.current = true;
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== OBSERVATORY_PREFERENCES_STORAGE_KEY) return;
      if (event.newValue === null) {
        explicitPreferenceRef.current = false;
        resetPreferences();
        return;
      }
      const preferences = parseObservatoryExperiencePreferences(event.newValue);
      if (!preferences) return;
      explicitPreferenceRef.current = true;
      applyPreferences(preferences);
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [applyPreferences, resetPreferences]);

  useEffect(() => {
    if (!hydratedRef.current || !storageAvailableRef.current || !explicitPreferenceRef.current) {
      return;
    }
    try {
      writeObservatoryExperiencePreferences(window.localStorage, {
        version: OBSERVATORY_PREFERENCES_VERSION,
        quality: quality.preference,
        motion: motion.setting,
        paused: motion.userPaused,
      });
    } catch {
      storageAvailableRef.current = false;
    }
  }, [motion.setting, motion.userPaused, quality.preference]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeAndRestoreFocus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeAndRestoreFocus, open]);

  function setQuality(preference: QualityPreference) {
    explicitPreferenceRef.current = true;
    setQualityPreference(preference);
  }

  function setMotion(setting: SceneMotionSetting) {
    explicitPreferenceRef.current = true;
    setMotionSetting(setting);
  }

  function setPaused(paused: boolean) {
    explicitPreferenceRef.current = true;
    updatePaused(paused);
  }

  function reset() {
    explicitPreferenceRef.current = false;
    try {
      clearObservatoryExperiencePreferences(window.localStorage);
    } catch {
      storageAvailableRef.current = false;
    }
    resetPreferences();
  }

  const currentTier = TIER_LABELS[quality.tier];
  const currentReason = QUALITY_REASON_LABELS[quality.reasons[0] ?? "webgl2-unknown"];
  const motionStatus = motion.userPaused
    ? "Scene motion paused."
    : motion.preference === "reduce"
      ? "Reduced motion active."
      : "Standard scene motion active.";
  const defaultSettings =
    quality.preference === DEFAULT_OBSERVATORY_EXPERIENCE_PREFERENCES.quality &&
    motion.setting === DEFAULT_OBSERVATORY_EXPERIENCE_PREFERENCES.motion &&
    motion.userPaused === DEFAULT_OBSERVATORY_EXPERIENCE_PREFERENCES.paused;

  return (
    <details
      className={styles.root}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary
        ref={summaryRef}
        id="observatory-experience-settings"
        className={styles.summary}
        aria-describedby={statusId}
      >
        <span>Experience</span>
        <strong>{currentTier}</strong>
      </summary>

      <div className={styles.panel}>
        <header className={styles.header}>
          <div>
            <p>Observatory controls</p>
            <h2>Tune the experience</h2>
          </div>
          <button type="button" onClick={closeAndRestoreFocus}>
            Close
          </button>
        </header>

        <fieldset className={styles.group}>
          <legend>Visual quality</legend>
          <div className={styles.options} data-columns="four">
            {QUALITY_OPTIONS.map((option) => (
              <label className={styles.option} key={option.value}>
                <input
                  type="radio"
                  name={`${qualityGroupId}-quality`}
                  value={option.value}
                  checked={quality.preference === option.value}
                  onChange={() => setQuality(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <p>{currentReason}</p>
        </fieldset>

        <fieldset className={styles.group}>
          <legend>Motion</legend>
          <div className={styles.options} data-columns="two">
            {MOTION_OPTIONS.map((option) => (
              <label className={styles.option} key={option.value}>
                <input
                  type="radio"
                  name={`${motionGroupId}-motion`}
                  value={option.value}
                  checked={motion.setting === option.value}
                  onChange={() => setMotion(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <button
            className={styles.pause}
            type="button"
            aria-pressed={motion.userPaused}
            onClick={() => setPaused(!motion.userPaused)}
          >
            {motion.userPaused ? "Resume scene motion" : "Pause scene motion"}
          </button>
          <p>{motionStatus}</p>
        </fieldset>

        <section className={styles.sound} aria-labelledby={`${statusId}-sound`}>
          <div>
            <h3 id={`${statusId}-sound`}>Sound</h3>
            <p>Muted and unavailable until approved tracks and credits are published.</p>
          </div>
          <Link href="/sound">Sound status</Link>
        </section>

        <footer className={styles.footer}>
          <button type="button" disabled={defaultSettings} onClick={reset}>
            Reset settings
          </button>
          <p>
            Quality, reduced-motion, and pause choices are stored on this device when browser
            storage is available. Sound always starts off.
          </p>
        </footer>
      </div>

      <span
        className="visually-hidden"
        id={statusId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {currentTier} visual quality. {motionStatus} Sound unavailable.
      </span>
    </details>
  );
}
