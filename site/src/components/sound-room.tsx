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

/**
 * The Sound room.
 *
 * Two shelves, music and video, both real and both currently empty. An
 * empty shelf states that it is empty and points at the public profile; it does
 * not invent a track list. When entries arrive in `media-library.ts` they render
 * here as click-to-load players, so no provider is contacted until a visitor
 * asks for one.
 */
export function SoundRoom() {
  const hasTracks = MUSIC_TRACKS.length > 0;
  const hasVideos = VIDEO_WORKS.length > 0;

  return (
    <main id="main-content" className="sound-room">
      <section className="sound-room__hero" aria-labelledby="sound-room-title">
        <div className="sound-room__rail">
          <p className="section-label">{SOUND_ROOM.eyebrow}</p>
        </div>

        <div className="sound-room__identity">
          <p>Suno, YouTube, and a live-coding system</p>
          <h1 id="sound-room-title">{SOUND_ROOM.heading}</h1>
          <strong>{SOUND_ROOM.description}</strong>
          <small>{SOUND_ROOM.playbackNote}</small>
        </div>
      </section>

      <section className="sound-room__feature" aria-labelledby="sound-room-strudel-title">
        <header>
          <p className="section-label">System / 00</p>
          <StatusTag tone="ready">{STRUDEL_AI.status}</StatusTag>
          <h2 id="sound-room-strudel-title">{STRUDEL_AI.title}</h2>
          <p>{STRUDEL_AI.summary}</p>
        </header>
        <nav aria-label="StrudelAI public paths">
          <ActionLink variant="primary" href={STRUDEL_AI.demoUrl} target="_blank" rel="noreferrer">
            {STRUDEL_AI.demoLabel} <span aria-hidden="true">&#8599;</span>
          </ActionLink>
          <ActionLink
            variant="secondary"
            href={STRUDEL_AI.repositoryUrl}
            target="_blank"
            rel="noreferrer"
          >
            {STRUDEL_AI.repositoryLabel} <span aria-hidden="true">&#8599;</span>
          </ActionLink>
        </nav>
      </section>

      <section className="sound-room__shelf" aria-labelledby="sound-room-music-title">
        <header>
          <p className="section-label">Music / 01</p>
          <h2 id="sound-room-music-title">Tracks.</h2>
          <p>{MUSIC_PROFILE.description}</p>
        </header>

        {hasTracks ? (
          <ul className="sound-room__works" aria-label="Music tracks">
            {MUSIC_TRACKS.map((track) => (
              <li key={track.id}>
                <div className="sound-room__work-head">
                  <h3>{track.title}</h3>
                  {track.publishedOn ? <p>Published {track.publishedOn}</p> : null}
                </div>
                {track.description ? (
                  <p className="sound-room__work-body">{track.description}</p>
                ) : null}
                {track.embedUrl ? (
                  <ConsentEmbed
                    provider={MUSIC_PROFILE.platform}
                    accessibleName={`${track.title}, on ${MUSIC_PROFILE.platform}`}
                    embedUrl={track.embedUrl}
                    fallbackUrl={track.url}
                    privacyMode={false}
                  />
                ) : (
                  <ActionLink variant="secondary" href={track.url} target="_blank" rel="noreferrer">
                    Listen on {MUSIC_PROFILE.platform} <span aria-hidden="true">&#8599;</span>
                  </ActionLink>
                )}
                <small className="sound-room__work-rights">{track.licence}</small>
              </li>
            ))}
          </ul>
        ) : (
          <div className="sound-room__empty">
            <p>{SOUND_ROOM.emptyState.music}</p>
            <ActionLink variant="primary" href={MUSIC_PROFILE.url} target="_blank" rel="noreferrer">
              Listen on {MUSIC_PROFILE.platform} <span aria-hidden="true">&#8599;</span>
            </ActionLink>
          </div>
        )}
      </section>

      <section className="sound-room__shelf" aria-labelledby="sound-room-video-title">
        <header>
          <p className="section-label">Video / 02</p>
          <h2 id="sound-room-video-title">Video.</h2>
          <p>{VIDEO_PROFILE.description}</p>
        </header>

        {hasVideos ? (
          <ul className="sound-room__works" aria-label="Video works">
            {VIDEO_WORKS.map((video) => (
              <li key={video.id}>
                <div className="sound-room__work-head">
                  <h3>{video.title}</h3>
                  {video.publishedOn ? <p>Published {video.publishedOn}</p> : null}
                </div>
                {video.description ? (
                  <p className="sound-room__work-body">{video.description}</p>
                ) : null}
                <ConsentEmbed
                  provider={VIDEO_PROFILE.platform}
                  accessibleName={`${video.title}, on ${VIDEO_PROFILE.platform}`}
                  embedUrl={youtubeEmbedUrl(video.videoId)}
                  fallbackUrl={video.url}
                  privacyMode
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="sound-room__empty">
            <p>{SOUND_ROOM.emptyState.video}</p>
            <ActionLink variant="primary" href={VIDEO_PROFILE.url} target="_blank" rel="noreferrer">
              Watch on {VIDEO_PROFILE.platform} <span aria-hidden="true">&#8599;</span>
            </ActionLink>
          </div>
        )}
      </section>

      <section className="sound-room__onward" aria-labelledby="sound-room-onward-title">
        <h2 id="sound-room-onward-title">If something here was worth your time.</h2>
        <p>
          The music stays free either way. There is a game to play next door, and a way to give
          something back if you want to.
        </p>
        <nav aria-label="Sound route alternatives">
          <ActionLink variant="primary" href="/arcade">
            Play a game
          </ActionLink>
          <ActionLink variant="secondary" href="/support">
            Support the work
          </ActionLink>
          <ActionLink href="/work">Explore Work</ActionLink>
        </nav>
      </section>
    </main>
  );
}
