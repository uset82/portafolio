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
  VIDEO_PROFILE,
  VIDEO_WORKS,
  youtubeEmbedUrl,
} from "@/content/media-library";

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

test("published media profiles are the two Carlos confirmed", () => {
  assert.equal(MUSIC_PROFILE.url, "https://suno.com/@uset182");
  assert.equal(VIDEO_PROFILE.url, "https://www.youtube.com/@cucciolo182");
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
  const page = readFileSync(path.join(process.cwd(), "src/app/sound/page.tsx"), "utf8");
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(page, /<SoundRoom \/>/);
  assert.match(styles, /\.sound-room__empty\s*\{/);
  assert.match(styles, /\.sound-room__feature\s*\{/);
  assert.match(styles, /@media \(max-width: 47\.99rem\)[\s\S]*?\.sound-room__hero/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
