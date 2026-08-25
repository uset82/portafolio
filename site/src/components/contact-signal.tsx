"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import { cx } from "@/lib/class-names";

const LazyContactSignalScene = dynamic(
  () => import("./contact-signal-scene").then((module) => module.ContactSignalScene),
  { ssr: false, loading: () => null },
);

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
 *   2. The CA²M emblem as a glTF model, loaded client-side, which takes the
 *      monogram's place once it is actually on screen.
 *
 * The monogram is hidden rather than unmounted, so nothing in the disc reflows
 * at the moment the emblem arrives. The rings and their captions belong to both
 * layers and never move.
 */
export function ContactSignal({ topLabel, bottomLabel, emblemLabel }: ContactSignalProps) {
  const discRef = useRef<HTMLDivElement>(null);
  const [shouldMountScene, setShouldMountScene] = useState(false);
  const [emblemReady, setEmblemReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // The disc sits in the first viewport, so this is not really a scroll gate —
  // it is a guard against paying for 1.7 MB and a WebGL context on a route the
  // visitor may be leaving again immediately.
  useEffect(() => {
    const target = discRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      setShouldMountScene(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setShouldMountScene(true);
      },
      { rootMargin: "200px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const handleReady = useCallback(() => setEmblemReady(true), []);

  return (
    <div
      ref={discRef}
      className={cx("contact-path__signal", emblemReady && "contact-path__signal--emblem")}
    >
      <span aria-hidden="true">{topLabel}</span>
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      <strong aria-hidden="true">CC</strong>
      {shouldMountScene ? (
        // R3F writes `width/height: 100%` inline onto its own wrapper, so the
        // emblem is sized and placed by this element instead of by that one.
        <div className="contact-path__signal-emblem">
          <LazyContactSignalScene
            accessibleLabel={emblemLabel}
            onReady={handleReady}
            reducedMotion={reducedMotion}
          />
        </div>
      ) : null}
      <small aria-hidden="true">{bottomLabel}</small>
    </div>
  );
}
