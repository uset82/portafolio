import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { SoundRoom } from "@/components/sound-room";
import {
  MUSIC_PROFILE,
  MUSIC_TRACKS,
  STRUDEL_AI,
  sunoEmbedUrl,
  VIDEO_PROFILE,
  VIDEO_WORKS,
  youtubeEmbedUrl,
} from "@/content/media-library";
import { MUSIC_TRACKS_ES } from "@/content/i18n/media-library-es";

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

test("no provider is contacted before a visitor asks for one", () => {
  const markup = renderToStaticMarkup(createElement(SoundRoom));

  assert.doesNotMatch(markup, /<iframe\b/, "an embed may only appear after an explicit click");
  assert.doesNotMatch(markup, /autoplay|preload=/);
  assert.doesNotMatch(markup, /<(?:audio|video)\b/);
});

test("video embeds use the no-cookie host", () => {
  assert.equal(youtubeEmbedUrl("abc123"), "https://www.youtube-nocookie.com/embed/abc123");
});

test("music embeds use Suno's own player for the song", () => {
  assert.equal(sunoEmbedUrl("abc123"), "https://suno.com/embed/abc123");
});

test("the published track renders a click-to-load player and states its rights", () => {
  const markup = renderToStaticMarkup(createElement(SoundRoom));
  const [track] = MUSIC_TRACKS;

  assert.ok(track, "the music shelf has nothing to render");
  assert.match(markup, /ABC on Crete Beach/);
  assert.match(markup, /Load Suno/);
  assert.match(markup, /this page grants no reuse rights/);
  assert.match(markup, /consent-embed--audio/, "a track plays in the strip, not a 16:9 stage");
  assert.doesNotMatch(
    markup,
    /<h3[^>]*>[^<]*, on Suno<\/h3>/,
    "the gate must not repeat the title the card already shows",
  );

  // The song page is offered as the escape hatch; the player URL is not
  // requested, or even present, until the visitor loads it.
  assert.match(markup, new RegExp(`href="${track.url}"`));
  assert.ok(!markup.includes("suno.com/embed"), "the player must not be reachable before a click");
});

test("the Spanish shelf reads in Spanish, player gate included", () => {
  const markup = renderToStaticMarkup(createElement(SoundRoom, { locale: "es" as const }));

  assert.match(markup, /Cargar Suno/);
  assert.match(markup, /Abrir en su sitio/);
  assert.match(markup, /no concede derechos de reutilización/);
  assert.match(markup, /bouzouki siempre por encima/);

  for (const leak of ["Load Suno", "Open externally", "grants no reuse rights"]) {
    assert.ok(!markup.includes(leak), `the Spanish shelf still says "${leak}"`);
  }
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

test("only the songs Carlos sent are shelved, and no video is invented yet", () => {
  assert.deepEqual(
    MUSIC_TRACKS.map((track) => track.id),
    ["abc-on-crete-beach"],
  );
  assert.deepEqual(VIDEO_WORKS, []);
});

test("a track's player and its song page point at the same Suno song", () => {
  for (const track of MUSIC_TRACKS) {
    const songId = track.url.match(/\/song\/([\w-]+)/)?.[1];
    assert.ok(songId, `${track.id} does not link a Suno song page`);
    if (track.embedUrl) {
      assert.equal(track.embedUrl, sunoEmbedUrl(songId), `${track.id} plays a different song`);
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
  assert.match(styles, /\.consent-embed--audio \.consent-embed__viewport\s*\{/);
  assert.match(styles, /\.sound-room__empty\s*\{/);
  assert.match(styles, /\.sound-room__feature\s*\{/);
  assert.match(styles, /@media \(max-width: 47\.99rem\)[\s\S]*?\.sound-room__hero/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
