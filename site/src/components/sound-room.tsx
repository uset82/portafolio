import { ConsentEmbed } from "@/components/media";
import { ActionLink, StatusTag } from "@/components/ui";
import {
  MUSIC_PROFILE,
  MUSIC_TRACKS,
  SOUND_ROOM,
  STRUDEL_AI,
  VIDEO_PROFILE,
  VIDEO_WORKS,
  youtubeEmbedUrl,
} from "@/content/media-library";
import {
  MUSIC_PROFILE_ES,
  SOUND_ROOM_ES,
  STRUDEL_AI_ES,
  VIDEO_PROFILE_ES,
} from "@/content/i18n/media-library-es";
import { ui } from "@/content/i18n/ui";
import { resolveHref, type Locale } from "@/lib/i18n";

/**
 * The Sound room.
 *
 * Two shelves, music and video, both real and both currently empty. An
 * empty shelf states that it is empty and points at the public profile; it does
 * not invent a track list. When entries arrive in `media-library.ts` they render
 * here as click-to-load players, so no provider is contacted until a visitor
 * asks for one.
 */
export function SoundRoom({ locale = "en" }: { locale?: Locale }) {
  const copy = ui(locale).sound;
  const es = locale === "es";
  const room = es ? SOUND_ROOM_ES : SOUND_ROOM;
  const strudel = es ? { ...STRUDEL_AI, ...STRUDEL_AI_ES } : STRUDEL_AI;
  const music = es ? { ...MUSIC_PROFILE, ...MUSIC_PROFILE_ES } : MUSIC_PROFILE;
  const video = es ? { ...VIDEO_PROFILE, ...VIDEO_PROFILE_ES } : VIDEO_PROFILE;
  const hasTracks = MUSIC_TRACKS.length > 0;
  const hasVideos = VIDEO_WORKS.length > 0;

  return (
    <main id="main-content" className="sound-room">
      <section className="sound-room__hero" aria-labelledby="sound-room-title">
        <div className="sound-room__rail">
          <p className="section-label">{room.eyebrow}</p>
        </div>

        <div className="sound-room__identity">
          <p>{copy.identity}</p>
          <h1 id="sound-room-title">{room.heading}</h1>
          <strong>{room.description}</strong>
          <small>{room.playbackNote}</small>
        </div>
      </section>

      <section className="sound-room__feature" aria-labelledby="sound-room-strudel-title">
        <header>
          <p className="section-label">{copy.systemLabel}</p>
          <StatusTag tone="ready">{strudel.status}</StatusTag>
          <h2 id="sound-room-strudel-title">{strudel.title}</h2>
          <p>{strudel.summary}</p>
        </header>
        <nav aria-label={copy.strudelPathsAria}>
          <ActionLink variant="primary" href={STRUDEL_AI.demoUrl} target="_blank" rel="noreferrer">
            {strudel.demoLabel} <span aria-hidden="true">&#8599;</span>
          </ActionLink>
          <ActionLink
            variant="secondary"
            href={STRUDEL_AI.repositoryUrl}
            target="_blank"
            rel="noreferrer"
          >
            {strudel.repositoryLabel} <span aria-hidden="true">&#8599;</span>
          </ActionLink>
        </nav>
      </section>

      <section className="sound-room__shelf" aria-labelledby="sound-room-music-title">
        <header>
          <p className="section-label">{copy.musicLabel}</p>
          <h2 id="sound-room-music-title">{copy.musicHeading}</h2>
          <p>{music.description}</p>
        </header>

        {hasTracks ? (
          <ul className="sound-room__works" aria-label={copy.musicAria}>
            {MUSIC_TRACKS.map((track) => (
              <li key={track.id}>
                <div className="sound-room__work-head">
                  <h3>{track.title}</h3>
                  {track.publishedOn ? <p>{copy.published(track.publishedOn)}</p> : null}
                </div>
                {track.description ? (
                  <p className="sound-room__work-body">{track.description}</p>
                ) : null}
                {track.embedUrl ? (
                  <ConsentEmbed
                    provider={MUSIC_PROFILE.platform}
                    accessibleName={copy.onPlatform(track.title, MUSIC_PROFILE.platform)}
                    embedUrl={track.embedUrl}
                    fallbackUrl={track.url}
                    privacyMode={false}
                  />
                ) : (
                  <ActionLink variant="secondary" href={track.url} target="_blank" rel="noreferrer">
                    {copy.listenOn(MUSIC_PROFILE.platform)} <span aria-hidden="true">&#8599;</span>
                  </ActionLink>
                )}
                <small className="sound-room__work-rights">{track.licence}</small>
              </li>
            ))}
          </ul>
        ) : (
          <div className="sound-room__empty">
            <p>{room.emptyState.music}</p>
            <ActionLink variant="primary" href={MUSIC_PROFILE.url} target="_blank" rel="noreferrer">
              {copy.listenOn(MUSIC_PROFILE.platform)} <span aria-hidden="true">&#8599;</span>
            </ActionLink>
          </div>
        )}
      </section>

      <section className="sound-room__shelf" aria-labelledby="sound-room-video-title">
        <header>
          <p className="section-label">{copy.videoLabel}</p>
          <h2 id="sound-room-video-title">{copy.videoHeading}</h2>
          <p>{video.description}</p>
        </header>

        {hasVideos ? (
          <ul className="sound-room__works" aria-label={copy.videoAria}>
            {VIDEO_WORKS.map((video) => (
              <li key={video.id}>
                <div className="sound-room__work-head">
                  <h3>{video.title}</h3>
                  {video.publishedOn ? <p>{copy.published(video.publishedOn)}</p> : null}
                </div>
                {video.description ? (
                  <p className="sound-room__work-body">{video.description}</p>
                ) : null}
                <ConsentEmbed
                  provider={VIDEO_PROFILE.platform}
                  accessibleName={copy.onPlatform(video.title, VIDEO_PROFILE.platform)}
                  embedUrl={youtubeEmbedUrl(video.videoId)}
                  fallbackUrl={video.url}
                  privacyMode
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="sound-room__empty">
            <p>{room.emptyState.video}</p>
            <ActionLink variant="primary" href={VIDEO_PROFILE.url} target="_blank" rel="noreferrer">
              {copy.watchOn(VIDEO_PROFILE.platform)} <span aria-hidden="true">&#8599;</span>
            </ActionLink>
          </div>
        )}
      </section>

      <section className="sound-room__onward" aria-labelledby="sound-room-onward-title">
        <h2 id="sound-room-onward-title">{copy.onwardHeading}</h2>
        <p>{copy.onwardBody}</p>
        <nav aria-label={copy.alternativesAria}>
          <ActionLink variant="primary" href={resolveHref(locale, "/arcade")}>
            {copy.playAGame}
          </ActionLink>
          <ActionLink variant="secondary" href={resolveHref(locale, "/support")}>
            {copy.supportTheWork}
          </ActionLink>
          <ActionLink href={resolveHref(locale, "/work")}>{copy.exploreWork}</ActionLink>
        </nav>
      </section>
    </main>
  );
}
