"use client";

import Image from "next/image";
import { useId, useState } from "react";

import { ActionButton, ActionLink, StatusTag } from "@/components/ui";
import { ui } from "@/content/i18n/ui";
import { cx } from "@/lib/class-names";
import type { Locale } from "@/lib/i18n";

type EmbedPoster = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type ConsentEmbedProps = {
  provider: string;
  accessibleName: string;
  embedUrl: string;
  fallbackUrl: string;
  privacyMode: boolean;
  poster?: EmbedPoster;
  privacyNotice?: string;
  allow?: string;
  sandbox?: string;
  className?: string;
  locale?: Locale;
};

type EmbedState = "idle" | "loading" | "ready" | "error";

const defaultSandbox = "allow-scripts allow-same-origin allow-presentation";
/**
 * `autoplay` is delegated because a provider's own play button lives inside a
 * cross-origin frame, and Chrome withholds playback from a frame that was never
 * granted the permission. It cannot surprise anyone: the frame is only mounted
 * after the visitor has asked for it by name.
 */
const defaultAllow = "autoplay; fullscreen; picture-in-picture";
/**
 * A media card runs nearly the width of its column, so a narrower estimate here
 * buys a smaller file and a visibly soft poster. Slight over-fetching is the
 * cheaper mistake for an image the visitor is being asked to look at.
 */
const posterSizes = "(max-width: 48rem) 100vw, 80vw";

export function ConsentEmbed({
  provider,
  accessibleName,
  embedUrl,
  fallbackUrl,
  privacyMode,
  poster,
  privacyNotice,
  allow = defaultAllow,
  sandbox = defaultSandbox,
  className,
  locale = "en",
}: ConsentEmbedProps) {
  const copy = ui(locale).mediaEmbed;
  const [state, setState] = useState<EmbedState>("idle");
  const [attempt, setAttempt] = useState(0);
  const noticeId = useId();
  const statusId = useId();
  const hasFrame = state === "loading" || state === "ready";

  const loadProvider = () => {
    setAttempt((current) => current + 1);
    setState("loading");
  };

  const notice = privacyNotice ?? copy.notice(provider);
  /**
   * With a poster the frame shows the work itself, so the poster is the button
   * and the consent copy sits under it. Without one there is nothing to look
   * at, so the gate states what it is and what pressing it will do.
   */
  const posterIsGate = Boolean(poster) && state !== "error";

  return (
    <section
      className={cx(
        "consent-embed media-frame",
        posterIsGate && "consent-embed--poster",
        className,
      )}
      data-state={state}
      aria-label={accessibleName}
      aria-describedby={`${noticeId} ${statusId}`}
    >
      <div className="consent-embed__viewport">
        {hasFrame ? (
          <iframe
            key={attempt}
            className="consent-embed__frame"
            src={embedUrl}
            title={accessibleName}
            loading="lazy"
            allow={allow}
            sandbox={sandbox}
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            onLoad={() => setState("ready")}
            onError={() => setState("error")}
          />
        ) : posterIsGate && poster ? (
          <button
            type="button"
            className="consent-embed__play"
            onClick={loadProvider}
            aria-label={copy.loadAndPlay(provider)}
          >
            <Image
              className="consent-embed__poster"
              src={poster.src}
              alt={poster.alt}
              width={poster.width}
              height={poster.height}
              sizes={posterSizes}
            />
            <span className="consent-embed__play-glyph" aria-hidden="true" />
          </button>
        ) : (
          <>
            {poster ? (
              <Image
                className="consent-embed__poster"
                src={poster.src}
                alt={poster.alt}
                width={poster.width}
                height={poster.height}
                sizes={posterSizes}
              />
            ) : (
              <div className="consent-embed__placeholder" aria-hidden="true">
                <span>CC</span>
              </div>
            )}
            <div className="consent-embed__gate">
              <StatusTag tone={privacyMode ? "concept" : "hold"}>
                {privacyMode ? copy.privacyEnhanced : copy.externalProvider}
              </StatusTag>
              <h3>{accessibleName}</h3>
              {state === "error" ? (
                <div className="media-message media-message--error" role="alert">
                  <p>{copy.noResponse(provider)}</p>
                </div>
              ) : null}
              <div className="consent-embed__actions">
                <ActionButton variant="primary" onClick={loadProvider}>
                  {state === "error" ? copy.retry(provider) : copy.load(provider)}
                </ActionButton>
                <ActionLink href={fallbackUrl} target="_blank" rel="noreferrer">
                  {copy.openExternally} <span aria-hidden="true">↗</span>
                </ActionLink>
              </div>
            </div>
          </>
        )}
      </div>
      {posterIsGate ? (
        <div className="consent-embed__meta">
          <StatusTag tone={privacyMode ? "concept" : "hold"}>
            {privacyMode ? copy.privacyEnhanced : copy.externalProvider}
          </StatusTag>
          <ActionLink href={fallbackUrl} target="_blank" rel="noreferrer">
            {copy.openExternally} <span aria-hidden="true">&#8599;</span>
          </ActionLink>
        </div>
      ) : null}
      <p id={noticeId} className="consent-embed__notice">
        {notice}
      </p>
      <p id={statusId} className="consent-embed__status" aria-live="polite">
        {state === "loading" ? copy.loading(provider) : null}
        {state === "ready" ? copy.ready(provider) : null}
      </p>
    </section>
  );
}
