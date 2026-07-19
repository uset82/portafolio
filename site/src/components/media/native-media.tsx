"use client";

import { useId, useState } from "react";

import { ActionLink } from "@/components/ui";
import { cx } from "@/lib/class-names";

export type CaptionTrack = {
  src: string;
  srcLang: string;
  label: string;
  default?: boolean;
};

type NativeMediaBaseProps = {
  title: string;
  src: string;
  credit: string;
  rightsLabel: string;
  fallbackUrl: string;
  durationLabel?: string;
  transcript?: string;
  transcriptHref?: string;
  className?: string;
};

type NativeAudioProps = NativeMediaBaseProps & {
  kind: "audio";
};

type NativeVideoProps = NativeMediaBaseProps & {
  kind: "video";
  poster: string;
  width: number;
  height: number;
  captions?: CaptionTrack[];
};

export type NativeMediaProps = NativeAudioProps | NativeVideoProps;

export function NativeMedia(props: NativeMediaProps) {
  const [hasError, setHasError] = useState(false);
  const descriptionId = useId();
  const errorId = useId();
  const transcriptId = useId();
  const mediaLabel = `${props.title} ${props.kind} player`;

  const player =
    props.kind === "video" ? (
      <video
        className="native-media__element"
        src={props.src}
        poster={props.poster}
        width={props.width}
        height={props.height}
        controls
        muted
        playsInline
        preload="none"
        aria-label={mediaLabel}
        aria-describedby={`${descriptionId}${hasError ? ` ${errorId}` : ""}`}
        onCanPlay={() => setHasError(false)}
        onError={() => setHasError(true)}
      >
        {props.captions?.map((caption) => (
          <track
            key={`${caption.srcLang}-${caption.label}`}
            kind="captions"
            src={caption.src}
            srcLang={caption.srcLang}
            label={caption.label}
            default={caption.default}
          />
        ))}
      </video>
    ) : (
      <audio
        className="native-media__element native-media__element--audio"
        src={props.src}
        controls
        muted
        preload="none"
        aria-label={mediaLabel}
        aria-describedby={`${descriptionId}${hasError ? ` ${errorId}` : ""}`}
        onCanPlay={() => setHasError(false)}
        onError={() => setHasError(true)}
      />
    );

  return (
    <figure className={cx("native-media media-frame", props.className)}>
      <div className="native-media__player">{player}</div>
      <figcaption className="native-media__caption">
        <div className="native-media__heading">
          <div>
            <p className="section-label">{props.kind}</p>
            <h3>{props.title}</h3>
          </div>
          {props.durationLabel ? <span>{props.durationLabel}</span> : null}
        </div>
        <p id={descriptionId} className="native-media__policy">
          Playback begins only when selected and starts muted. {props.credit} · {props.rightsLabel}
        </p>
        {hasError ? (
          <div id={errorId} className="media-message media-message--error" role="alert">
            <p>This media could not be loaded here.</p>
            <ActionLink href={props.fallbackUrl} target="_blank" rel="noreferrer">
              Open the approved source <span aria-hidden="true">↗</span>
            </ActionLink>
          </div>
        ) : null}
        {props.transcript || props.transcriptHref ? (
          <details className="native-media__transcript" id={transcriptId}>
            <summary>Transcript</summary>
            {props.transcript ? <p>{props.transcript}</p> : null}
            {props.transcriptHref ? (
              <ActionLink href={props.transcriptHref} target="_blank" rel="noreferrer">
                Read the complete transcript <span aria-hidden="true">↗</span>
              </ActionLink>
            ) : null}
          </details>
        ) : null}
      </figcaption>
    </figure>
  );
}
