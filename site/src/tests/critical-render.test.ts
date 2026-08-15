import assert from "node:assert/strict";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import NotFound from "@/app/not-found";
import SoundPage from "@/app/sound/page";
import StoryPage from "@/app/story/page";
import WorkPage from "@/app/work/page";
import { HeroReveal, HeroRevealItem, SceneReveal } from "@/components/hero-reveal";

test("hero reveal markup fails open without inline hidden styles", () => {
  const markup = renderToStaticMarkup(
    createElement(
      "div",
      null,
      createElement(SceneReveal, null, createElement("span", null, "Observatory visual")),
      createElement(
        HeroReveal,
        null,
        createElement(HeroRevealItem, null, createElement("h1", null, "Portfolio identity")),
      ),
    ),
  );

  assert.match(markup, /class="scene-reveal"/);
  assert.match(markup, /class="hero-copy"/);
  assert.match(markup, /class="hero-reveal-item"/);
  assert.doesNotMatch(markup, /style=/);
  assert.doesNotMatch(markup, /aria-hidden/);
});

test("the Sound route renders both shelves without contacting a provider", () => {
  const markup = renderToStaticMarkup(createElement(SoundPage));

  assert.match(markup, /<main id="main-content"/);
  assert.match(markup, /<h1[^>]*>Sound and moving image as pattern, memory, and response\.<\/h1>/);
  assert.match(markup, /id="sound-room-music-title">Tracks\./);
  assert.match(markup, /id="sound-room-video-title">Video\./);
  assert.match(markup, /Players are click-to-load/);
  // Server markup stays inert: a provider is reached only after a click.
  assert.doesNotMatch(markup, /<(?:audio|video|iframe)\b/);
});

test("the recovery state keeps 404 visitors oriented with two known routes", () => {
  const markup = renderToStaticMarkup(createElement(NotFound));

  assert.match(markup, /<main id="main-content" class="recovery-page">/);
  assert.match(markup, /<h1[^>]*>This instrument is outside the observatory\.<\/h1>/);
  assert.match(markup, /<nav[^>]*aria-label="Recovery options"/);
  assert.match(markup, /href="\/"/);
  assert.match(markup, /href="\/work"/);
  assert.match(markup, /Nothing is lost/);
});

test("the Work route exposes every validated project without premature filters", () => {
  const markup = renderToStaticMarkup(createElement(WorkPage));

  assert.doesNotMatch(markup, /<(?:button|form|input)\b/);
  assert.doesNotMatch(markup, /filter/i);
  assert.match(markup, /A working register of systems and ideas/);
  // Built work leads; the three Observatory concepts keep their own section
  // below it, so a designed idea never reads as a shipped result.
  assert.equal((markup.match(/class="work-register__project"/g) ?? []).length, 10);
  assert.equal((markup.match(/class="work-register__concept-index"/g) ?? []).length, 3);
  assert.ok(markup.indexOf("work-register__shipped") < markup.indexOf("work-register__concepts"));
  assert.match(markup, /href="\/work\/astraea"/);
  assert.match(markup, /href="\/work\/pinaculo"/);
  assert.match(markup, /href="\/work\/future-energy"/);
});

test("the Story route never exposes the private résumé as a download", () => {
  const markup = renderToStaticMarkup(createElement(StoryPage));

  assert.match(markup, /<h1 id="story-profile-title">Carlos Alfredo Carpio Meza<\/h1>/);
  assert.match(markup, /A web-first CV, released carefully\./);
  assert.match(markup, /Experience, education, and skills remain withheld/);
  assert.doesNotMatch(markup, /<a[^>]+(?:download|\.pdf|resume|résumé)/i);
  assert.doesNotMatch(markup, /CARLOS CARPIO RESUME/i);
});
