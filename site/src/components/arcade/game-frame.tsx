"use client";

import { useId, useRef, useState } from "react";

import { ActionButton, ActionLink } from "@/components/ui";

type GameFrameProps = {
  title: string;
  /** Resolved source URL. The server decides this; the client never guesses. */
  src: string;
  /** True when the source is on this origin and can run fully isolated. */
  sameOrigin: boolean;
  controls: readonly string[];
  needsCamera: boolean;
};

/**
 * The play shell.
 *
 * Nothing loads until the visitor presses play: no preloaded iframe, no
 * autoplaying audio, no camera request behind their back. Same-origin games run
 * in a sandbox without `allow-same-origin`, which puts them on an opaque origin
 * and denies them access to this site's storage and cookies. A separately
 * hosted service keeps `allow-same-origin` so it can reach its own back end,
 * which is a different origin from this one either way.
 */
export function GameFrame({ title, src, sameOrigin, controls, needsCamera }: GameFrameProps) {
  const [playing, setPlaying] = useState(false);
  const statusId = useId();
  const frameRef = useRef<HTMLIFrameElement>(null);

  const sandbox = sameOrigin
    ? "allow-scripts allow-pointer-lock allow-popups"
    : "allow-scripts allow-same-origin allow-pointer-lock allow-popups";

  return (
    <section className="game-frame" aria-label={`Play ${title}`} aria-describedby={statusId}>
      <div className="game-frame__viewport" data-playing={playing}>
        {playing ? (
          <iframe
            ref={frameRef}
            className="game-frame__surface"
            src={src}
            title={`${title}, playable`}
            sandbox={sandbox}
            allow={needsCamera ? "camera; fullscreen" : "fullscreen"}
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <div className="game-frame__gate">
            <p className="section-label">Ready to play</p>
            <h2>{title}</h2>
            <ul aria-label="Controls">
              {controls.map((control) => (
                <li key={control}>{control}</li>
              ))}
            </ul>
            {needsCamera ? (
              <p className="game-frame__warning">
                This one asks for your camera. Your browser will ask first, and nothing is recorded
                or sent anywhere.
              </p>
            ) : null}
            <div className="game-frame__actions">
              <ActionButton variant="primary" onClick={() => setPlaying(true)}>
                Play {title}
              </ActionButton>
              <ActionLink href={src} target="_blank" rel="noreferrer">
                Open in a new tab <span aria-hidden="true">&#8599;</span>
              </ActionLink>
            </div>
          </div>
        )}
      </div>

      {playing ? (
        <div className="game-frame__bar">
          <ActionButton variant="secondary" onClick={() => setPlaying(false)}>
            Stop and unload
          </ActionButton>
          <ActionLink href={src} target="_blank" rel="noreferrer">
            Open in a new tab <span aria-hidden="true">&#8599;</span>
          </ActionLink>
        </div>
      ) : null}

      <p id={statusId} className="game-frame__status" aria-live="polite">
        {playing
          ? `${title} is loaded and running in an isolated frame.`
          : `${title} has not loaded yet. Nothing runs until you press play.`}
      </p>
    </section>
  );
}
