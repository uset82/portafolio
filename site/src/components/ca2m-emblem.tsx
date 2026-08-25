"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import type { EmblemSurface } from "./ca2m-emblem-scene";

const LazyCa2mEmblemScene = dynamic(
  () => import("./ca2m-emblem-scene").then((module) => module.Ca2mEmblemScene),
  { ssr: false, loading: () => null },
);

export type Ca2mEmblemProps = {
  /** What the emblem is, for anyone who reaches it as an image. */
  label: string;
  /** Which ground it sits on. See `EmblemSurface`. */
  surface: EmblemSurface;
  /** Placement class owned by the host route. */
  className: string;
  /** Fires once the emblem is on screen, so the host's flat poster can retire. */
  onReady: () => void;
};

/**
 * The client boundary around the CA²M emblem.
 *
 * Every route that shows the emblem shows a flat poster first — the contact
 * disc its monogram, the story plate its typographic study — and that poster is
 * what a visitor keeps for good if JavaScript never runs or WebGL is
 * unavailable. This owns the decision to upgrade it, and nothing else: the host
 * owns its own markup, its own poster, and what it does with `onReady`.
 *
 * R3F writes `width/height: 100%` inline onto its own wrapper, so placement has
 * to happen on this element rather than on that one.
 */
export function Ca2mEmblem({ label, surface, className, onReady }: Ca2mEmblemProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Both placements sit in the first viewport, so this is not really a scroll
  // gate — it is a guard against paying for 808 KB and a WebGL context on a
  // route the visitor may be leaving again immediately.
  useEffect(() => {
    const target = frameRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      setShouldMount(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setShouldMount(true);
      },
      { rootMargin: "200px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const handleReady = useCallback(() => onReady(), [onReady]);

  return (
    <div ref={frameRef} className={className}>
      {shouldMount ? (
        <LazyCa2mEmblemScene
          accessibleLabel={label}
          onReady={handleReady}
          reducedMotion={reducedMotion}
          surface={surface}
        />
      ) : null}
    </div>
  );
}
