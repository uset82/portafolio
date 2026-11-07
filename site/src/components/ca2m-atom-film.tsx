"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { ui } from "@/content/i18n/ui";
import type { Locale } from "@/lib/i18n";

/**
 * The Maya edition of the CA²M Project Orbit atom.
 *
 * The still is a server-rendered image: it is the first paint, the
 * no-JavaScript view and the reduced-motion resting pose. The ten-second
 * Arnold render is an optional overlay that fades in only after a real frame
 * has decoded. Reduced-motion and save-data visitors are never given autoplay;
 * they get an explicit Play control instead. Playback pauses offscreen and in
 * hidden tabs, and autoplay blocked by browser policy recovers on a gesture.
 *
 * This is the exported film of the rebuilt atom, not a second interactive
 * instrument: the project links stay in <ProjectOrbit> directly below.
 */

const FILM_SRC = "/videos/ca2m-atom-maya.mp4";
const FILM_POSTER = "/images/ca2m-atom-maya-poster.jpg";
const GESTURE_EVENTS = ["pointerdown", "keydown", "touchstart", "wheel"] as const;

export type Ca2mAtomFilmProps = {
  locale?: Locale;
};

function motionAllowed() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches && connection?.saveData !== true
  );
}

export function Ca2mAtomFilm({ locale = "en" }: Ca2mAtomFilmProps) {
  const copy = ui(locale).atomFilm;
  const videoRef = useRef<HTMLVideoElement>(null);
  const inViewRef = useRef(false);
  const [allowed, setAllowed] = useState(false);
  const [optedIn, setOptedIn] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [inView, setInView] = useState(false);

  const canPlay = allowed || optedIn;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAllowed(motionAllowed());
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const attemptPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || document.visibilityState !== "visible" || !inViewRef.current) return;
    video.muted = true;
    void video.play().catch(() => undefined);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;

    // Latched: once a frame exists the clip owns the frame and a pause simply
    // freezes that frame instead of flashing the still back in.
    const onRendered = () => setRendered(true);
    const onPlaying = () => {
      setRendered(true);
      setPlaying(true);
    };
    const onStopped = () => setPlaying(false);
    const onVisibility = () => {
      if (document.visibilityState === "visible" && canPlay) attemptPlay();
      else video.pause();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries.some((entry) => entry.isIntersecting);
        setInView(inViewRef.current);
        if (inViewRef.current && canPlay) attemptPlay();
        else video.pause();
      },
      { threshold: 0.01 },
    );
    observer.observe(video);

    video.addEventListener("loadeddata", onRendered);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onStopped);
    document.addEventListener("visibilitychange", onVisibility);
    if (video.readyState >= 2) setRendered(true);

    // Autoplay is a request, not a guarantee. Only motion-allowed visitors get
    // the gesture retry; reduced-motion visitors must press Play themselves.
    const onGesture = () => attemptPlay();
    if (allowed) {
      GESTURE_EVENTS.forEach((name) =>
        document.addEventListener(name, onGesture, { passive: true }),
      );
    }

    // A visitor can turn reduced motion on while the clip is already running.
    // Pause here and let the JSX derive visibility from `canPlay`, so the frame
    // hands back to the still without a synchronous setState inside an effect.
    if (!canPlay) video.pause();

    return () => {
      observer.disconnect();
      video.removeEventListener("loadeddata", onRendered);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onStopped);
      document.removeEventListener("visibilitychange", onVisibility);
      GESTURE_EVENTS.forEach((name) => document.removeEventListener(name, onGesture));
      video.pause();
    };
  }, [allowed, canPlay, attemptPlay]);

  const play = () => {
    setOptedIn(true);
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    void video.play().catch(() => undefined);
  };

  return (
    <section className="ca2m-atom-film" aria-labelledby="ca2m-atom-film-title">
      {/* The heading stays in the document so the section keeps a landmark name
       * and an outline entry, but it is no longer painted: on /work the atom
       * speaks for itself. */}
      <h2 id="ca2m-atom-film-title" className="visually-hidden">
        {copy.title}
      </h2>

      <figure className="ca2m-atom-film__figure">
        <div className="ca2m-atom-film__frame">
          <Image
            className="ca2m-atom-film__still"
            src={FILM_POSTER}
            alt={copy.alt}
            width={1600}
            height={900}
            sizes="(max-width: 62rem) 100vw, 60rem"
            priority
          />
          <video
            ref={videoRef}
            className="ca2m-atom-film__video"
            data-visible={rendered && canPlay}
            src={FILM_SRC}
            poster={FILM_POSTER}
            preload={canPlay ? "auto" : "none"}
            muted
            loop
            playsInline
            tabIndex={-1}
            aria-hidden="true"
          />
          {inView && !playing ? (
            <button type="button" className="ca2m-atom-film__play" onClick={play}>
              <span aria-hidden="true">▶</span> {copy.play}
            </button>
          ) : null}
        </div>
      </figure>
    </section>
  );
}
