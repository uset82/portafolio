"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/* The approved Observatory clip is the hero's moving visual. It layers over the
 * approved still poster, which stays the server-rendered first paint, so the
 * hero never depends on JavaScript, a decoded video, or a network round trip to
 * show its dominant image. Playback is silent (the derivative has no audio
 * track), continuous, and suspended whenever the hero is offscreen or the tab is
 * hidden.
 *
 * Visibility is deliberately latched to "the clip has decoded a frame", not to
 * "the clip is playing right now". Tying it to playback meant every ordinary
 * pause — scrolling past the hero, switching tabs — faded the clip out and
 * brought the old still composition back, which read as the site reverting.
 * A pause now simply freezes the current frame.
 *
 * Autoplay is a request, not a guarantee: browsers may reject `play()` on their
 * own policy. Playback is retried on the visitor's first interaction, and a real
 * Play control appears if the clip never starts — which is also how
 * reduced-motion and save-data visitors can opt in. */

const HERO_VIDEO_SRC = "/videos/robot-water-sequence.mp4";
const HERO_VIDEO_POSTER = "/images/robot-water-poster.jpg";
const GESTURE_EVENTS = ["pointerdown", "keydown", "touchstart", "wheel"] as const;
const subscribeToHydration = () => () => undefined;
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

function autoplayAllowed() {
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    ?.saveData;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches && saveData !== true;
}

export function ObservatoryHeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inViewRef = useRef(true);
  const [autoplay, setAutoplay] = useState(true);
  const [rendered, setRendered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [inView, setInView] = useState(true);
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  // Client-only: the server-rendered hero stays the approved still poster, so
  // a no-JavaScript visitor never downloads the clip.
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const resolve = () => setAutoplay(autoplayAllowed());
    resolve();
    motionQuery.addEventListener("change", resolve);
    return () => motionQuery.removeEventListener("change", resolve);
  }, []);

  const attemptPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || document.visibilityState !== "visible" || !inViewRef.current) return;
    video.muted = true;
    void video.play().catch(() => undefined);
  }, []);

  useEffect(() => {
    // `mounted` is a dependency because the element does not exist on the
    // hydration render: without it this effect ran once against a null ref and
    // never attached playback, leaving the still poster up forever.
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;

    // Latched: once a frame exists the clip owns the hero and never hands it
    // back to the still composition.
    const onRendered = () => setRendered(true);
    const onPlaying = () => {
      setRendered(true);
      setPlaying(true);
    };
    const onStopped = () => setPlaying(false);
    const onVisibility = () => {
      if (document.visibilityState === "visible") attemptPlay();
      else video.pause();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries.some((entry) => entry.isIntersecting);
        setInView(inViewRef.current);
        if (inViewRef.current) attemptPlay();
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

    // A blocked autoplay recovers on the first real interaction anywhere.
    const onGesture = () => attemptPlay();
    if (autoplay) {
      attemptPlay();
      GESTURE_EVENTS.forEach((name) =>
        document.addEventListener(name, onGesture, { passive: true }),
      );
    }

    return () => {
      observer.disconnect();
      video.removeEventListener("loadeddata", onRendered);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onStopped);
      document.removeEventListener("visibilitychange", onVisibility);
      GESTURE_EVENTS.forEach((name) => document.removeEventListener(name, onGesture));
      video.pause();
    };
  }, [attemptPlay, autoplay, mounted]);

  if (!mounted) return null;

  return (
    <>
      <video
        ref={videoRef}
        className="observatory-hero-video"
        data-visible={rendered}
        src={HERO_VIDEO_SRC}
        poster={HERO_VIDEO_POSTER}
        // Reduced-motion and save-data visitors fetch nothing until they ask.
        preload={autoplay ? "auto" : "none"}
        muted
        loop
        playsInline
        tabIndex={-1}
        aria-hidden="true"
      />
      {/* Only when the visitor is actually looking at a stopped clip — not for
       * the deliberate offscreen pause. */}
      {playing || !rendered || !inView ? null : (
        <button
          type="button"
          className="observatory-hero-video__play"
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            video.muted = true;
            void video.play().catch(() => undefined);
          }}
        >
          <span aria-hidden="true">▶</span> Play the Observatory sequence
        </button>
      )}
    </>
  );
}
