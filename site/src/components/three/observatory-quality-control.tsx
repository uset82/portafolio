"use client";

import { useId } from "react";

import type { QualityPreference } from "@/lib/three/capability-policy";

import { useObservatoryQualityControl } from "./observatory-capability-controller";
import styles from "./observatory-quality-control.module.css";

const QUALITY_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "full", label: "Full" },
  { value: "reduced", label: "Reduced" },
  { value: "static", label: "Poster" },
] as const satisfies readonly { value: QualityPreference; label: string }[];

const TIER_LABELS = {
  full: "Full",
  reduced: "Reduced",
  static: "Poster",
} as const;

export type ObservatoryQualityControlProps = {
  className?: string;
};

export function ObservatoryQualityControl({ className }: ObservatoryQualityControlProps) {
  const quality = useObservatoryQualityControl();
  const controlId = useId();
  const statusId = `${controlId}-status`;
  const rootClassName = [styles.root, className].filter(Boolean).join(" ");

  return (
    <fieldset className={rootClassName} aria-describedby={statusId}>
      <legend className={styles.legend}>Observatory quality</legend>
      <div className={styles.options}>
        {QUALITY_OPTIONS.map((option) => (
          <label className={styles.option} key={option.value}>
            <input
              className={styles.input}
              type="radio"
              name={`${controlId}-quality`}
              value={option.value}
              checked={quality.preference === option.value}
              onChange={() => quality.setPreference(option.value)}
            />
            <span className={styles.label}>{option.label}</span>
          </label>
        ))}
      </div>
      <p className={styles.status} id={statusId} aria-live="polite">
        Current: {TIER_LABELS[quality.tier]} quality, {quality.source} selection.
      </p>
    </fieldset>
  );
}
