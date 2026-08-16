import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ArcadeTeaser } from "@/components/arcade/arcade-teaser";
import { ARCADE_GAMES, findArcadeGame, isArcadeGamePlayable } from "@/content/arcade";

const playable = ARCADE_GAMES.filter(isArcadeGamePlayable);

test("the homepage teaser counts games without repeating the arcade list", () => {
  const markup = renderToStaticMarkup(
    createElement(ArcadeTeaser, { playable, total: ARCADE_GAMES.length }),
  );

  assert.match(markup, /<section class="arcade-teaser" aria-labelledby="arcade-teaser-title">/);
  assert.match(markup, new RegExp(`${playable.length} playable now`));
  assert.match(markup, /href="\/arcade"/);
  assert.doesNotMatch(markup, /arcade-teaser__titles/);

  for (const game of ARCADE_GAMES) {
    assert.doesNotMatch(markup, new RegExp(`href="/arcade/${game.slug}"`));
    assert.ok(
      !markup.includes(game.title),
      `${game.title} is named on both the teaser and /arcade`,
    );
  }

  // The teaser is a promise, not a player.
  assert.doesNotMatch(markup, /<(?:iframe|audio|video|canvas)\b/);
});

test("the teaser degrades honestly when nothing resolves", () => {
  const markup = renderToStaticMarkup(
    createElement(ArcadeTeaser, { playable: [], total: ARCADE_GAMES.length }),
  );

  assert.match(markup, new RegExp(`${ARCADE_GAMES.length} games, none hosted yet`));
  assert.doesNotMatch(markup, /playable now/);
  assert.match(markup, /href="\/arcade"/, "the route stays reachable even with nothing to play");
});

test("the homepage mounts the teaser from resolved roster data", () => {
  const homepage = readFileSync(path.join(process.cwd(), "src/app/page.tsx"), "utf8");

  assert.match(homepage, /const playableGames = ARCADE_GAMES\.filter\(isArcadeGamePlayable\)/);
  assert.match(homepage, /<ArcadeTeaser playable=\{playableGames\} total=\{ARCADE_GAMES\.length\}/);
  assert.equal(homepage.indexOf("<ArcadeTeaser") < homepage.indexOf("<MediaTeaser"), true);
  assert.equal(homepage.indexOf("<MediaTeaser") < homepage.indexOf("<SupportTeaser"), true);
});

test("the arcade teaser carries responsive and reduced-motion paths", () => {
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(styles, /\.arcade-teaser:hover \.arcade-teaser__cabinet/);
  assert.match(styles, /@media \(max-width: 61\.99rem\)[\s\S]*?\.arcade-teaser\s*\{/);
  assert.match(styles, /\.arcade-teaser__action\s*\{[\s\S]*?width:\s*100%/);
  assert.match(
    styles,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.arcade-teaser__cabinet[\s\S]*?transform:\s*none/,
  );
});

test("the homepage no longer describes sound as permanently silent", () => {
  const teaser = readFileSync(path.join(process.cwd(), "src/components/media-teaser.tsx"), "utf8");

  assert.doesNotMatch(teaser, /Playback remains off|Silent study/);
  assert.match(teaser, /Press play to hear it/);
});

test("MandelBro is the game the teaser can currently promise", () => {
  const mandelbro = findArcadeGame("mandelbro");
  assert.ok(mandelbro);
  assert.ok(isArcadeGamePlayable(mandelbro));
  assert.ok(playable.some((game) => game.id === mandelbro.id));
});
