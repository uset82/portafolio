import { ConsentEmbed } from "@/components/media";
import { ActionLink, StatusTag } from "@/components/ui";
import {
  MUSIC_PROFILE,
  MUSIC_TRACKS,
  SOUND_ROOM,
  SOUND_SYSTEMS,
  VIDEO_PROFILE,
  VIDEO_WORKS,
  youtubeEmbedUrl,
} from "@/content/media-library";
import {
  localizeSoundSystem,
  localizeTrack,
  localizeVideo,
  MUSIC_PROFILE_ES,
  SOUND_ROOM_ES,
  VIDEO_PROFILE_ES,
} from "@/content/i18n/media-library-es";
import { ui } from "@/content/i18n/ui";
import { formatLongDate, resolveHref, type Locale } from "@/lib/i18n";

/**
 * The page reads as one numbered catalogue — systems, then Music, then Video —
 * so a system's folio is its position, not a constant. The label used to be the
 * literal string "System / 00", which was right while one system existed and
 * silently stamped 00 on every one of them once a second arrived.
 */
const formatFolio = (order: number) => String(order).padStart(2, "0");

/**
 * The Sound room.
 *
 * Two shelves, music and video, plus interactive sound systems. An empty shelf
 * states that it is empty and points at the public profile rather than inventing
 * a track list.
 *
 * A track with a direct audio file plays through the browser's own control, so
 * one press is enough and no provider's application is loaded. A work that only
 * exists as a provider embed keeps the click-to-load gate. Either way nothing is
 * requested from anyone until the visitor acts.
 */
export function SoundRoom({ locale = "en" }: { locale?: Locale }) {
  const copy = ui(locale).sound;
  const es = locale === "es";
  const room = es ? SOUND_ROOM_ES : SOUND_ROOM;
  const music = es ? { ...MUSIC_PROFILE, ...MUSIC_PROFILE_ES } : MUSIC_PROFILE;
  const video = es ? { ...VIDEO_PROFILE, ...VIDEO_PROFILE_ES } : VIDEO_PROFILE;
  const tracks = MUSIC_TRACKS.map((track) => localizeTrack(track, locale));
  const videos = VIDEO_WORKS.map((work) => localizeVideo(work, locale));
  const systems = SOUND_SYSTEMS.map((system) => localizeSoundSystem(system, locale));
  const hasTracks = tracks.length > 0;
  const hasVideos = videos.length > 0;

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

      {systems.map((system, order) => {
        const folio = formatFolio(order);

        return (
          <section
            key={system.id}
            className="sound-room__feature"
            aria-labelledby={`sound-room-${system.id}-title`}
          >
            <div className="sound-room__rail">
              <p className="section-label">{copy.systemLabel(folio)}</p>
              {/* The folio is the label again at reading scale, for the eye
                  alone: the section label above it already says the number, so
                  a second announcement would only repeat it. */}
              <span className="sound-room__folio" aria-hidden="true">
                {folio}
              </span>
              <StatusTag tone="ready">{system.status}</StatusTag>
            </div>

            <div className="sound-room__identity">
              <h2 id={`sound-room-${system.id}-title`}>{system.title}</h2>
              <p>{system.summary}</p>
              <nav aria-label={system.title}>
                <ActionLink
                  variant="primary"
                  href={system.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {system.demoLabel} <span aria-hidden="true">&#8599;</span>
                </ActionLink>
                <ActionLink
                  variant="secondary"
                  href={system.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {system.repositoryLabel} <span aria-hidden="true">&#8599;</span>
                </ActionLink>
              </nav>
            </div>
          </section>
        );
      })}

      <section className="sound-room__shelf" aria-labelledby="sound-room-music-title">
        <header>
          <p className="section-label">{copy.musicLabel}</p>
          <h2 id="sound-room-music-title">{copy.musicHeading}</h2>
          <p>{music.description}</p>
        </header>

        {hasTracks ? (
          <ul className="sound-room__works" aria-label={copy.musicAria}>
            {tracks.map((track) => (
              <li key={track.id} className="sound-room__track">
                {/* Grooves, the way a pressing has them. Ornament, not a readout. */}
                <span className="sound-room__grooves" aria-hidden="true" />
                <div className="sound-room__work-head">
                  <div className="sound-room__work-marks">
                    <StatusTag>{MUSIC_PROFILE.platform}</StatusTag>
                    {track.publishedOn ? (
                      <p>{copy.published(formatLongDate(track.publishedOn, locale))}</p>
                    ) : null}
                  </div>
                  <h3>{track.title}</h3>
                </div>
                {track.description ? (
                  <p className="sound-room__work-body">{track.description}</p>
                ) : null}
                {track.audioUrl ? (
                  <div className="sound-room__deck">
                    {/* No client JavaScript: the browser's own control is the player. */}
                    <audio
                      className="sound-room__audio"
                      src={track.audioUrl}
                      controls
                      preload="none"
                      aria-label={copy.playerLabel(track.title)}
                    />
                    <ActionLink href={track.url} target="_blank" rel="noreferrer">
                      {copy.listenOn(MUSIC_PROFILE.platform)}{" "}
                      <span aria-hidden="true">&#8599;</span>
                    </ActionLink>
                  </div>
                ) : track.embedUrl ? (
                  <ConsentEmbed
                    provider={MUSIC_PROFILE.platform}
                    accessibleName={copy.onPlatform(track.title, MUSIC_PROFILE.platform)}
                    embedUrl={track.embedUrl}
                    fallbackUrl={track.url}
                    privacyMode={false}
                    locale={locale}
                  />
                ) : (
                  <ActionLink variant="secondary" href={track.url} target="_blank" rel="noreferrer">
                    {copy.listenOn(MUSIC_PROFILE.platform)} <span aria-hidden="true">&#8599;</span>
                  </ActionLink>
                )}
                <footer className="sound-room__credit">
                  <p className="sound-room__credit-label">{copy.rightsLabel}</p>
                  <small className="sound-room__work-rights">{track.licence}</small>
                </footer>
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
            {videos.map((work) => (
              <li key={work.id}>
                <div className="sound-room__work-head">
                  <h3>{work.title}</h3>
                  {work.publishedOn ? (
                    <p>{copy.published(formatLongDate(work.publishedOn, locale))}</p>
                  ) : null}
                </div>
                {work.description ? (
                  <p className="sound-room__work-body">{work.description}</p>
                ) : null}
                <ConsentEmbed
                  provider={VIDEO_PROFILE.platform}
                  accessibleName={copy.onPlatform(work.title, VIDEO_PROFILE.platform)}
                  embedUrl={youtubeEmbedUrl(work.videoId, { autoplay: true })}
                  fallbackUrl={work.url}
                  privacyMode
                  {...(work.poster ? { poster: work.poster } : {})}
                  locale={locale}
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
