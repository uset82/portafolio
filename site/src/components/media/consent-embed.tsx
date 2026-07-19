"use client";

import Image from "next/image";
import { useId, useState } from "react";

import { ActionButton, ActionLink, StatusTag } from "@/components/ui";
import { cx } from "@/lib/class-names";

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
};

type EmbedState = "idle" | "loading" | "ready" | "error";

const defaultSandbox = "allow-scripts allow-same-origin allow-presentation";
const defaultAllow = "fullscreen; picture-in-picture";

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
}: ConsentEmbedProps) {
  const [state, setState] = useState<EmbedState>("idle");
  const [attempt, setAttempt] = useState(0);
  const noticeId = useId();
  const statusId = useId();
  const hasFrame = state === "loading" || state === "ready";

  const loadProvider = () => {
    setAttempt((current) => current + 1);
    setState("loading");
  };

  const notice =
    privacyNotice ??
    `Loading ${provider} may share your IP address and browser information with that provider.`;

  return (
    <section
      className={cx("consent-embed media-frame", className)}
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
        ) : (
          <>
            {poster ? (
              <Image
                className="consent-embed__poster"
                src={poster.src}
                alt={poster.alt}
                width={poster.width}
                height={poster.height}
                sizes="(max-width: 48rem) 100vw, 60vw"
              />
            ) : (
              <div className="consent-embed__placeholder" aria-hidden="true">
                <span>CC</span>
              </div>
            )}
            <div className="consent-embed__gate">
              <StatusTag tone={privacyMode ? "concept" : "hold"}>
                {privacyMode ? "Privacy-enhanced URL" : "External provider"}
              </StatusTag>
              <h3>{accessibleName}</h3>
              {state === "error" ? (
                <div className="media-message media-message--error" role="alert">
                  <p>{provider} did not respond. You can retry or use the approved source.</p>
                </div>
              ) : null}
              <div className="consent-embed__actions">
                <ActionButton variant="primary" onClick={loadProvider}>
                  {state === "error" ? `Retry ${provider}` : `Load ${provider}`}
                </ActionButton>
                <ActionLink href={fallbackUrl} target="_blank" rel="noreferrer">
                  Open externally <span aria-hidden="true">↗</span>
                </ActionLink>
              </div>
            </div>
          </>
        )}
      </div>
      <p id={noticeId} className="consent-embed__notice">
        {notice}
      </p>
      <p id={statusId} className="consent-embed__status" aria-live="polite">
        {state === "loading" ? `${provider} is loading…` : null}
        {state === "ready" ? `${provider} is loaded. Its own privacy policy now applies.` : null}
      </p>
    </section>
  );
}
