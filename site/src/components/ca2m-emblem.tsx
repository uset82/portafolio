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
 * The Network Information API, which is not in the DOM lib because it is not on
 * a standards track. Only the two fields that say "do not spend my data" are
 * declared, and both are optional: outside Chromium there is no `connection` at
 * all, and the absence has to read as "no objection" rather than as thrift.
 */
type ThriftyNavigator = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
};

/**
 * Keeps a failed emblem to itself.
 *
 * The scene throws during render if its chunk or its model does not arrive — a
 * dropped request on a phone is enough. Unhandled, that throw reaches
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

  // Fetching the emblem and building it are two decisions, and they used to be
  // one. Both were taken when the plate came within 200px of the viewport, on
  // the assumption — written into this file — that both placements sit in the
  // first viewport and the gate would therefore fire on load. On a phone they do
  // not: on a 454x674 viewport the story plate starts at y=790, below the fold.
  // So the gate behaved as a real scroll gate, and every byte was spent after
  // the visitor had already arrived at the plate and was looking at it. Measured
  // on the deployed site, scrolling there kicked off 917 KB in one go and the
  // mark took another 1.2s to appear on a fast connection. That wait is the
  // delay, and it was arranged to happen in the worst possible place.
  //
  // Split, each half can happen when it should. The bytes are asked for while
  // the visitor is still reading the top of the page, using time that was idle
  // anyway; the WebGL context is still built only for someone about to see it.
  useEffect(() => {
    let warmed = false;
    // The chunk and the model, asked for together. Left to itself the chunk asks
    // for the model only once it has arrived and run, so the two waits are paid
    // one after the other.
    //
    // `crossOrigin` is not about origins. It is what makes this request's
    // credentials mode match the one three's `FileLoader` uses, without which
    // the browser treats the preload as a different request and fetches the
    // model twice.
    const warm = () => {
      if (warmed) return;
      warmed = true;
      preload(EMBLEM_LOGO_URL, { as: "fetch", crossOrigin: "anonymous", fetchPriority: "low" });
      void import("./ca2m-emblem-scene").catch(() => {
        // A warm-up that fails costs nothing: the real import runs again when the
        // scene mounts, and if that fails too the boundary below keeps the poster.
      });
    };

    const mount = () => {
      warm();
      setShouldMount(true);
    };

    // Someone who asked to be spared the bytes, or is on a connection where
    // 446 KB of decoration would compete with the text, keeps the old behaviour:
    // nothing is fetched until the plate is actually approaching.
    const connection = (navigator as ThriftyNavigator).connection;
    const thrifty =
      connection?.saveData === true || /(^|-)2g$/.test(connection?.effectiveType ?? "");

    // Idle rather than immediate, so the warm-up queues behind the page's own
    // work instead of competing with it. The timeout is the ceiling for a page
    // that never goes idle.
    let idleHandle: number | undefined;
    let timerHandle: number | undefined;
    if (!thrifty) {
      if (typeof window.requestIdleCallback === "function") {
        idleHandle = window.requestIdleCallback(warm, { timeout: 2000 });
      } else {
        timerHandle = window.setTimeout(warm, 900);
      }
    }

    const cancelWarmUp = () => {
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      if (timerHandle !== undefined) window.clearTimeout(timerHandle);
    };

    const target = frameRef.current;
    if (!target || typeof IntersectionObserver === "undefined") {
      mount();
      return cancelWarmUp;
    }

    // Wider than the 200px it was. Mounting is no longer where the bytes are
    // spent, so the only thing bought here is starting the parse and the WebGL
    // context before the plate lands, rather than once it already has.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) mount();
      },
      { rootMargin: "600px" },
    );
    observer.observe(target);
    return () => {
      observer.disconnect();
      cancelWarmUp();
    };
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
