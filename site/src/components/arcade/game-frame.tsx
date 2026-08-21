"use client";

import { useId, useRef, useState } from "react";

import { ActionButton, ActionLink } from "@/components/ui";
import { ui } from "@/content/i18n/ui";
import type { Locale } from "@/lib/i18n";

type GameFrameProps = {
  title: string;
  /** Resolved source URL. The server decides this; the client never guesses. */
  src: string;
  /** True when the source is on this origin and can run fully isolated. */
  sameOrigin: boolean;
  controls: readonly string[];
  needsCamera: boolean;
  locale?: Locale;
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
export function GameFrame({
  title,
  src,
  sameOrigin,
  controls,
  needsCamera,
  locale = "en",
}: GameFrameProps) {
  const copy = ui(locale).gameFrame;
  const [playing, setPlaying] = useState(false);
  const statusId = useId();
  const frameRef = useRef<HTMLIFrameElement>(null);

  const sandbox = sameOrigin
    ? "allow-scripts allow-pointer-lock allow-popups"
    : "allow-scripts allow-same-origin allow-pointer-lock allow-popups";

  return (
    <section className="game-frame" aria-label={copy.playAria(title)} aria-describedby={statusId}>
      <div className="game-frame__viewport" data-playing={playing}>
        {playing ? (
          <iframe
            ref={frameRef}
            className="game-frame__surface"
            src={src}
            title={copy.frameTitle(title)}
            sandbox={sandbox}
            allow={needsCamera ? "camera; fullscreen" : "fullscreen"}
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <div className="game-frame__gate">
            <p className="section-label">{copy.ready}</p>
            <h2>{title}</h2>
            <ul aria-label={copy.controlsAria}>
              {controls.map((control) => (
                <li key={control}>{control}</li>
              ))}
            </ul>
            {needsCamera ? <p className="game-frame__warning">{copy.cameraWarning}</p> : null}
            <div className="game-frame__actions">
              <ActionButton variant="primary" onClick={() => setPlaying(true)}>
                {copy.play(title)}
              </ActionButton>
              <ActionLink href={src} target="_blank" rel="noreferrer">
                {copy.openInNewTab} <span aria-hidden="true">&#8599;</span>
              </ActionLink>
            </div>
          </div>
        )}
      </div>

      {playing ? (
        <div className="game-frame__bar">
          <ActionButton variant="secondary" onClick={() => setPlaying(false)}>
            {copy.stop}
          </ActionButton>
          <ActionLink href={src} target="_blank" rel="noreferrer">
            {copy.openInNewTab} <span aria-hidden="true">&#8599;</span>
          </ActionLink>
        </div>
      ) : null}

      <p id={statusId} className="game-frame__status" aria-live="polite">
        {playing ? copy.running(title) : copy.idle(title)}
      </p>
    </section>
  );
}
