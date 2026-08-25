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
 * The poster is the same mark, drawn flat: the approved CA²M artwork masked to
 * a single tone, server-rendered in the emblem's exact box. It used to be a CC
 * letterform, which meant the plate visibly showed one mark and then swapped it
 * for another. Now there is nothing to see swap — the mark simply gains
 * dimension — and wherever WebGL or JavaScript never runs, the flat mark is
 * still the right mark rather than a stand-in.
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
      <span className="ca2m-poster story-profile__portrait-poster" aria-hidden="true" />
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
