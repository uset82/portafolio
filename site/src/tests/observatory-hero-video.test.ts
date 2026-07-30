import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ObservatoryHeroVideo } from "@/components/observatory-hero-video";

const readSource = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

test("the hero video never replaces the server-rendered still poster", () => {
  // Nothing is emitted on the server, so the approved poster remains the
  // dominant first paint and the hero works without JavaScript. The emitted
  // homepage is asserted by the immersive build gate, which can load the
  // page's client-only CSS modules.
  assert.equal(renderToStaticMarkup(createElement(ObservatoryHeroVideo)), "");

  const page = readSource("src/app/page.tsx");
  assert.match(page, /src="\/images\/robot-water-poster\.jpg"/);
  assert.equal(
    page.indexOf("/images/robot-water-poster.jpg") < page.indexOf("<ObservatoryHeroVideo />"),
    true,
  );
});

test("the hero clip is silent, continuous, and never a control surface", () => {
  const source = readSource("src/components/observatory-hero-video.tsx");

  assert.match(source, /src=\{HERO_VIDEO_SRC\}/);
  assert.match(source, /"\/videos\/robot-water-sequence\.mp4"/);
  assert.match(source, /poster=\{HERO_VIDEO_POSTER\}/);
  assert.match(source, /preload=\{autoplay \? "auto" : "none"\}/);
  assert.match(source, /muted\n/);
  assert.match(source, /loop\n/);
  assert.match(source, /playsInline\n/);
  assert.match(source, /aria-hidden="true"/);
  assert.doesNotMatch(source, /controls/);
  assert.doesNotMatch(source, /<audio\b/);
  // Reduced motion and save-data suppress autoplay; the clip stays opt-in.
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(source, /saveData/);
  // Playback is suspended offscreen and on a hidden tab.
  assert.match(source, /IntersectionObserver/);
  assert.match(source, /visibilitychange/);
  assert.match(source, /video\.pause\(\)/);
});

test("an ordinary pause never hands the hero back to the still composition", () => {
  const source = readSource("src/components/observatory-hero-video.tsx");

  // Visibility latches on decoded data, so scrolling past the hero or hiding
  // the tab freezes the frame instead of revealing the old still hero.
  assert.match(source, /data-visible=\{rendered\}/);
  assert.match(source, /addEventListener\("loadeddata", onRendered\)/);
  assert.doesNotMatch(source, /data-visible=\{playing\}/);
  assert.doesNotMatch(source, /setRendered\(false\)/);
  assert.match(source, /if \(!mounted\) return null;/);

  // A rejected autoplay recovers on the visitor's first interaction, and a real
  // control appears only when a watched clip is genuinely stopped.
  assert.match(source, /GESTURE_EVENTS/);
  assert.match(source, /playing \|\| !rendered \|\| !inView \? null/);
});

test("the hero video layer covers the poster and yields under reduced motion", () => {
  const styles = readSource("src/app/globals.css");

  assert.match(
    styles,
    /\.observatory-hero-video\s*\{[\s\S]*?position:\s*absolute[\s\S]*?object-fit:\s*cover[\s\S]*?opacity:\s*0/,
  );
  assert.match(styles, /\.observatory-hero-video\[data-visible="true"\]\s*\{\s*opacity:\s*1/);
  assert.match(
    styles,
    /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.observatory-hero-video\s*\{\s*display:\s*none/,
  );
});

test("the held presentation unmounts the artifact overlays", () => {
  const experience = readSource("src/components/three/observatory-progressive-experience.tsx");

  assert.match(experience, /liveCanvasHeld\s*\n?\s*\? null\s*\n?\s*: artifacts\.map/);
  // Selected Systems still reaches every destination the overlays exposed.
  const page = readSource("src/app/page.tsx");
  assert.match(page, /selectedSystems\.map/);
  assert.match(page, /href="\/laboratory"/);
});
