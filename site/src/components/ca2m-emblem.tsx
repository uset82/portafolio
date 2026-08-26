"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState } from "react";
import { preload } from "react-dom";

import { EMBLEM_LOGO_URL } from "@/components/ca2m-emblem-asset";

import type { EmblemSurface } from "./ca2m-emblem-scene";
import type { ReactNode } from "react";

const LazyCa2mEmblemScene = dynamic(
  () => import("./ca2m-emblem-scene").then((module) => module.Ca2mEmblemScene),
  { ssr: false, loading: () => null },
);

/**
 * Keeps a failed emblem to itself.
 *
 * The scene throws during render if its chunk or its 808 KB model does not
 * arrive — a dropped request on a phone is enough. Unhandled, that throw reaches
 * the route, and Next replaces the whole page with its client error screen: the
 * biography, the privacy statement and the contact channel all lost because a
 * decorative mark could not be drawn. Caught here it costs exactly the mark.
 * `onReady` never fires, so the flat poster the model was going to replace stays
 * where it is, which is the same thing a visitor without WebGL keeps.
 */
class EmblemFailureBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  static getDerivedStateFromError() {
    return { failed: true };
  }

  override state = { failed: false };

  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

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
 * what a visitor keeps for good if JavaScript never runs, WebGL is unavailable,
 * or the model never arrives. This owns the decision to upgrade it, and nothing
 * else: the host owns its own markup, its own poster, and what it does with
 * `onReady`.
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
    // Ask for the model at the same moment as the chunk, rather than leaving the
    // chunk to ask once it has arrived and run. Those two waits used to be paid
    // one after the other: at 4 Mbit the chunk landed at 2.2s and the model only
    // then started, so the emblem arrived at 4.2s. Started together, 3.6s.
    //
    // It sits on this decision rather than in render deliberately. Declared in
    // render it goes into the server's HTML and starts a second earlier, which
    // measured about 0.2s off the emblem — but it would then fetch 808 KB for
    // every visitor, including the one this gate exists to spare and everyone
    // who never gets an emblem at all because JavaScript or WebGL is missing.
    //
    // `crossOrigin` is not about origins. It is what makes this request's
    // credentials mode match the one three's `FileLoader` uses, without which
    // the browser treats the preload as a different request and fetches the
    // model twice.
    const mount = () => {
      preload(EMBLEM_LOGO_URL, { as: "fetch", crossOrigin: "anonymous", fetchPriority: "low" });
      setShouldMount(true);
    };

    const target = frameRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      mount();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) mount();
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
        <EmblemFailureBoundary>
          <LazyCa2mEmblemScene
            accessibleLabel={label}
            onReady={handleReady}
            reducedMotion={reducedMotion}
            surface={surface}
          />
        </EmblemFailureBoundary>
      ) : null}
    </div>
  );
}
