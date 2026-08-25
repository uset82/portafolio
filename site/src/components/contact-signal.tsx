"use client";

import { useCallback, useState } from "react";

import { Ca2mEmblem } from "@/components/ca2m-emblem";
import { cx } from "@/lib/class-names";

export type ContactSignalProps = {
  /** Ring caption above the emblem. */
  topLabel: string;
  /** Ring caption below the emblem. */
  bottomLabel: string;
  /** What the emblem is, for anyone who reaches it as an image. */
  emblemLabel: string;
};

/**
 * The signal disc in the contact hero.
 *
 * Two layers, in this order:
 *
 *   1. The concentric rings and the flat CC monogram, server-rendered. This is
 *      what a visitor sees immediately and what they keep for good if
 *      JavaScript never runs or WebGL is unavailable.
 *   2. The CA²M emblem as a glTF model, which takes the monogram's place once it
 *      is actually on screen.
 *
 * The monogram is hidden rather than unmounted, so nothing in the disc reflows
 * at the moment the emblem arrives. The rings and their captions belong to both
 * layers; with the emblem present they re-space and the innermost becomes the
 * well the mark is struck in.
 */
export function ContactSignal({ topLabel, bottomLabel, emblemLabel }: ContactSignalProps) {
  const [emblemReady, setEmblemReady] = useState(false);
  const handleReady = useCallback(() => setEmblemReady(true), []);

  return (
    <div className={cx("contact-path__signal", emblemReady && "contact-path__signal--emblem")}>
      <span aria-hidden="true">{topLabel}</span>
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      <strong aria-hidden="true">CC</strong>
      <Ca2mEmblem
        className="contact-path__signal-emblem"
        label={emblemLabel}
        onReady={handleReady}
        surface="dark"
      />
      <small aria-hidden="true">{bottomLabel}</small>
    </div>
  );
}
