"use client";

import { useCallback, useState } from "react";

import { Ca2mEmblem } from "@/components/ca2m-emblem";
import { cx } from "@/lib/class-names";

export type StoryPortraitProps = {
  /** Plate caption above the mark. */
  topLabel: string;
  /** Plate caption below the mark. */
  bottomLabel: string;
  /** What the emblem is, for anyone who reaches it as an image. */
  emblemLabel: string;
};

/**
 * The plate that stands where a portrait would go on the story route.
 *
 * The record section of this page states plainly that Carlos's portrait is held
 * for review, so this slot has always shown a mark rather than a face. That is
 * the point of it, and the emblem keeps it: still not a photograph, still an
 * identity standing in for one.
 *
 * The flat CC study is the poster and stays server-rendered, exactly as on the
 * contact disc. It fades rather than unmounting, so the plate cannot reflow when
 * the emblem arrives, and it remains the whole picture wherever WebGL or
 * JavaScript never runs.
 */
export function StoryPortrait({ topLabel, bottomLabel, emblemLabel }: StoryPortraitProps) {
  const [emblemReady, setEmblemReady] = useState(false);
  const handleReady = useCallback(() => setEmblemReady(true), []);

  return (
    <div
      className={cx(
        "story-profile__portrait",
        emblemReady && "story-profile__portrait--emblem",
      )}
    >
      <span aria-hidden="true">{topLabel}</span>
      <strong aria-hidden="true">CC</strong>
      <Ca2mEmblem
        className="story-profile__portrait-emblem"
        label={emblemLabel}
        onReady={handleReady}
        surface="light"
      />
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      <small aria-hidden="true">{bottomLabel}</small>
    </div>
  );
}
