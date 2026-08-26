import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ConsentEmbed } from "@/components/media";
import { SoundRoom } from "@/components/sound-room";
import {
  MUSIC_PROFILE,
  MUSIC_TRACKS,
  STRUDEL_AI,
  sunoAudioUrl,
  sunoEmbedUrl,
  VIDEO_PROFILE,
  VIDEO_WORKS,
  youtubeEmbedUrl,
} from "@/content/media-library";
import { MUSIC_TRACKS_ES, VIDEO_WORKS_ES } from "@/content/i18n/media-library-es";
import { formatLongDate } from "@/lib/i18n";

test("StrudelAI is the featured public test build", () => {
  const markup = renderToStaticMarkup(createElement(SoundRoom));

  assert.match(markup, /sound-room__feature/);
  assert.match(markup, /StrudelAI/);
  assert.match(markup, /Open for testing/);
  assert.match(markup, new RegExp(STRUDEL_AI.demoUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(markup, new RegExp(STRUDEL_AI.repositoryUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(markup, /people who want to contribute are welcome/i);
});

test("an empty shelf says it is empty and points at the published profile", () => {
  const markup = renderToStaticMarkup(createElement(SoundRoom));

  assert.match(markup, /<main id="main-content" class="sound-room">/);

  if (MUSIC_TRACKS.length === 0) {
    assert.match(markup, /No track is embedded here yet/);
    assert.match(markup, /href="https:\/\/suno\.com\/@uset182"/);
  }

  if (VIDEO_WORKS.length === 0) {
    assert.match(markup, /No video is embedded here yet/);
    assert.match(markup, /href="https:\/\/www\.youtube\.com\/@cucciolo182"/);
  }
});

test("nothing is fetched from anyone before the visitor presses play", () => {
  const markup = renderToStaticMarkup(createElement(SoundRoom));

  assert.doesNotMatch(markup, /<iframe\b/, "an embed may only appear after an explicit click");
  assert.doesNotMatch(markup, /autoplay/, "no player may start on its own");
  assert.match(
    markup,
    /<audio[^>]+preload="none"/,
    "the audio element must hold its request until play",
  );
  assert.doesNotMatch(markup, /<video\b/);
});

test("video embeds use the no-cookie host", () => {
  assert.equal(youtubeEmbedUrl("abc123"), "https://www.youtube-nocookie.com/embed/abc123");
});

test("Suno URLs are built from one song id", () => {
  assert.equal(sunoEmbedUrl("abc123"), "https://suno.com/embed/abc123");
  assert.equal(sunoAudioUrl("abc123"), "https://cdn1.suno.ai/abc123.mp3");
});

test("the published track plays on one press and states its rights", () => {
  const markup = renderToStaticMarkup(createElement(SoundRoom));
  const [track] = MUSIC_TRACKS;

  assert.ok(track?.audioUrl, "the shelved track has no audio to play");
  assert.match(markup, /ABC on Crete Beach/);
  assert.match(markup, /this page grants no reuse rights/);

  // The song plays here, and Suno stays one click away for whoever wants it.
  assert.match(markup, new RegExp(`<audio[^>]+src="${track.audioUrl}"`));
  assert.match(markup, /aria-label="ABC on Crete Beach[^"]*audio player"/);
  assert.match(markup, new RegExp(`href="${track.url}"`));
  assert.match(markup, /Listen on Suno/);
  assert.ok(!markup.includes("Load Suno"), "a direct file needs no provider gate");
});

test("a track is set as a pressing: shelf marks, a deck, and a labelled credit", () => {
  const markup = renderToStaticMarkup(createElement(SoundRoom));

  // The provider is named on the card, the way the video card names YouTube.
  assert.match(markup, /class="sound-room__work-marks"[\s\S]*?ui-status[\s\S]*?Suno/);
  // The player sits in its own recess rather than loose in the card.
  assert.match(markup, /class="sound-room__deck"[\s\S]*?<audio/);
  // The rights line is a labelled credit, not a trailing sentence.
  assert.match(markup, /class="sound-room__credit"/);
  assert.match(markup, /class="sound-room__credit-label">Rights</);
  assert.match(markup, /class="sound-room__work-rights">Made by Carlos with Suno/);
  // The grooves are ornament, so they are hidden from anyone being read to.
  assert.match(markup, /class="sound-room__grooves" aria-hidden="true"/);

  const spanish = renderToStaticMarkup(createElement(SoundRoom, { locale: "es" as const }));
  assert.match(spanish, /class="sound-room__credit-label">Derechos</);
});

test("the Spanish shelf reads in Spanish, player label included", () => {
  const markup = renderToStaticMarkup(createElement(SoundRoom, { locale: "es" as const }));

  assert.match(markup, /Escuchar en Suno/);
  assert.match(markup, /reproductor de audio"/);
  assert.match(markup, /no concede derechos de reutilización/);
  assert.match(markup, /bouzouki siempre por encima/);

  for (const leak of ["audio player", "Listen on Suno", "grants no reuse rights", "Rights"]) {
    assert.ok(!markup.includes(leak), `the Spanish shelf still says "${leak}"`);
  }
});

test("a provider gate that does appear speaks the page's language", () => {
  const spanish = renderToStaticMarkup(
    createElement(ConsentEmbed, {
      provider: "Suno",
      accessibleName: "Una pista, en Suno",
      embedUrl: "https://suno.com/embed/abc123",
      fallbackUrl: "https://suno.com/song/abc123",
      privacyMode: false,
      locale: "es" as const,
    }),
  );

  assert.match(spanish, /Cargar Suno/);
  assert.match(spanish, /Abrir en su sitio/);
  assert.match(spanish, /compartir tu dirección IP/);
  assert.ok(!spanish.includes("Load Suno"), "the Spanish gate still says Load Suno");
  assert.doesNotMatch(spanish, /<iframe\b/, "the gate must not mount the frame by itself");
});

test("every track carries Spanish prose without restating its title or URL", () => {
  for (const track of MUSIC_TRACKS) {
    const copy = MUSIC_TRACKS_ES[track.id];
    assert.ok(copy, `${track.id} has no Spanish entry`);
    assert.ok(copy.licence.length > 0, `${track.id} has no Spanish licence`);
    assert.ok(!copy.description.includes("http"), `${track.id} restates a URL in Spanish`);
  }
});

test("published media profiles are the two Carlos confirmed", () => {
  assert.equal(MUSIC_PROFILE.url, "https://suno.com/@uset182");
  assert.equal(VIDEO_PROFILE.url, "https://www.youtube.com/@cucciolo182");
});

test("only the media Carlos sent is shelved", () => {
  assert.deepEqual(
    MUSIC_TRACKS.map((track) => track.id),
    ["abc-on-crete-beach"],
  );
  assert.deepEqual(
    VIDEO_WORKS.map((work) => work.id),
    ["hedra-seedance-2-5", "the-second-flood", "stillness-frequency-perfect-place"],
  );
});

test("a video's embed, watch URL and share-token-free link agree", () => {
  const [work] = VIDEO_WORKS;

  assert.ok(work, "the video shelf has nothing to render");
  assert.equal(work.videoId, "030X0DYiDS8");
  assert.equal(work.url, `https://www.youtube.com/watch?v=${work.videoId}`);
  assert.ok(!work.url.includes("si="), "a share token must not be published");
  assert.equal(
    youtubeEmbedUrl(work.videoId),
    `https://www.youtube-nocookie.com/embed/${work.videoId}`,
  );
});

test("the published video renders behind a gate, dated in the page's language", () => {
  const english = renderToStaticMarkup(createElement(SoundRoom));
  const spanish = renderToStaticMarkup(createElement(SoundRoom, { locale: "es" as const }));

  assert.match(english, /HEDRA × SEEDANCE 2\.5/);
  assert.match(english, /Published 10 August 2026/);
  assert.match(english, /generated in Hedra with Seedance 2\.5/);
  assert.match(english, /Load YouTube/);
  assert.ok(!english.includes("No video is embedded here yet"), "the shelf is no longer empty");

  assert.match(spanish, /Publicado el 10 de agosto de 2026/);
  assert.match(spanish, /generado en Hedra con Seedance 2\.5/);
  assert.match(spanish, /Cargar YouTube/);
  for (const leak of ["Published 10 August", "Load YouTube", "The song above as a video"]) {
    assert.ok(!spanish.includes(leak), `the Spanish shelf still says "${leak}"`);
  }

  // The provider is still not reached until someone asks for it.
  assert.doesNotMatch(english, /<iframe\b/);
  assert.ok(!english.includes("youtube-nocookie.com/embed"), "the frame URL waits for the click");
});

test("every shelved video carries Spanish prose without restating its title or URL", () => {
  for (const work of VIDEO_WORKS) {
    const copy = VIDEO_WORKS_ES[work.id];
    assert.ok(copy, `${work.id} has no Spanish entry`);
    assert.ok(!copy.description.includes("http"), `${work.id} restates a URL in Spanish`);
    assert.ok(!copy.description.includes(work.title), `${work.id} restates its title in Spanish`);
  }
});

test("a shelved date is stored once as ISO and read in both languages", () => {
  for (const work of VIDEO_WORKS) {
    if (!work.publishedOn) continue;
    assert.match(work.publishedOn, /^\d{4}-\d{2}-\d{2}$/, `${work.id} does not store an ISO date`);
  }

  assert.equal(formatLongDate("2026-08-10", "en"), "10 August 2026");
  assert.equal(formatLongDate("2026-08-10", "es"), "10 de agosto de 2026");
  // A UTC day cannot drift backwards in a western timezone.
  assert.equal(formatLongDate("2026-01-01", "en"), "1 January 2026");
});

test("a track's player and its song page point at the same Suno song", () => {
  for (const track of MUSIC_TRACKS) {
    const songId = track.url.match(/\/song\/([\w-]+)/)?.[1];
    assert.ok(songId, `${track.id} does not link a Suno song page`);
    if (track.audioUrl) {
      assert.equal(track.audioUrl, sunoAudioUrl(songId), `${track.id} plays a different song`);
    }
    if (track.embedUrl) {
      assert.equal(track.embedUrl, sunoEmbedUrl(songId), `${track.id} embeds a different song`);
    }
  }
});

test("every catalogued track carries a published URL and a stated licence", () => {
  for (const track of MUSIC_TRACKS) {
    assert.match(track.url, /^https:\/\//, `${track.id} has no published URL`);
    assert.ok(track.licence.length > 0, `${track.id} has no stated licence`);
  }

  for (const video of VIDEO_WORKS) {
    assert.match(
      video.url,
      /^https:\/\/(?:www\.)?youtube\.com\//,
      `${video.id} is not a YouTube URL`,
    );
    assert.match(video.videoId, /^[\w-]{6,}$/);
  }
});

test("the sound route mounts the room and keeps its responsive rules", () => {
  const page = readFileSync(path.join(process.cwd(), "src/app/(en)/sound/page.tsx"), "utf8");
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(page, /<SoundRoom \/>/);
  assert.match(styles, /\.sound-room__audio\s*\{/);
  // A loaded player must resolve 16:9 from its width. Leaving the gate's
  // min-height in place widens the frame past its card on a phone.
  assert.match(styles, /\.consent-embed__viewport\s*\{[^}]*width:\s*100%/);
  assert.match(
    styles,
    /\.consent-embed:is\(\[data-state="loading"\], \[data-state="ready"\]\) \.consent-embed__viewport,?[^{]*\{\s*min-height:\s*0;/,
  );
  // A poster is already 16:9, so it drops the gate's floor for the same reason.
  assert.match(
    styles,
    /\.consent-embed--poster \.consent-embed__viewport,?[^{]*\{\s*min-height:\s*0;/,
  );
  assert.match(styles, /\.consent-embed__play\s*\{/);
  assert.match(styles, /\.consent-embed__play-glyph\s*\{/);
  assert.match(styles, /\.sound-room__deck\s*\{/);
  assert.match(styles, /\.sound-room__credit\s*\{[^}]*border-top:/);
  assert.match(styles, /\.sound-room__grooves\s*\{/);
  assert.match(styles, /\.sound-room__empty\s*\{/);
  assert.match(styles, /\.sound-room__feature\s*\{/);
  assert.match(styles, /@media \(max-width: 47\.99rem\)[\s\S]*?\.sound-room__hero/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
