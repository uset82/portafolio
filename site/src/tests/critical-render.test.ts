import assert from "node:assert/strict";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import SoundPage from "@/app/sound/page";

test("the Sound preparation route renders a useful semantic fallback", () => {
  const markup = renderToStaticMarkup(createElement(SoundPage));

  assert.match(markup, /<main id="main-content"/);
  assert.match(markup, /<h1[^>]*>Music, harmonic instruments, and responsive systems\.<\/h1>/);
  assert.match(markup, /id="media-readiness-title">Playback foundation<\/h2>/);
  assert.match(markup, /Awaiting sources/);
  assert.match(markup, /Provider remains unloaded until the visitor gives consent/);
  assert.doesNotMatch(markup, /<(?:audio|video|iframe)\b/);
});
