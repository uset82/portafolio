import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ArcadeGameDetail } from "@/components/arcade/arcade-game-detail";
import { ArcadeIndex, type ResolvedArcadeGame } from "@/components/arcade/arcade-index";
import {
  ARCADE_GAMES,
  type ArcadeGame,
  findArcadeGame,
  isArcadeGamePlayable,
  resolveArcadeSource,
} from "@/content/arcade";

const resolveAll = (): ResolvedArcadeGame[] =>
  ARCADE_GAMES.map((game) => ({ ...game, playable: isArcadeGamePlayable(game) }));

test("every game the roster calls playable resolves to something this build can serve", () => {
  for (const game of ARCADE_GAMES) {
    if (!isArcadeGamePlayable(game)) continue;

    const source = resolveArcadeSource(game);
    assert.ok(source, `${game.slug} is playable but resolves to no source`);
    assert.equal(game.status, "playable");

    if (game.source.kind === "same-origin") {
      const asset = path.join(process.cwd(), "public", game.source.path);
      assert.ok(existsSync(asset), `${game.slug} claims ${game.source.path}, which is not present`);
      assert.ok(statSync(asset).size > 0, `${game.slug} points at an empty file`);
    }
  }
});

test("a game that cannot be served says why instead of offering a play button", () => {
  for (const game of ARCADE_GAMES) {
    if (isArcadeGamePlayable(game)) continue;
    assert.ok(
      game.blockedBy && game.blockedBy.length > 20,
      `${game.slug} is not playable and owes a specific reason`,
    );
  }
});

test("an undeployed service never resolves to a URL", () => {
  const football = findArcadeGame("football");
  assert.ok(football);

  // No roster entry is env-backed today, so the service contract is checked
  // against a constructed entry rather than left untested.
  const asService: ArcadeGame = {
    ...football,
    status: "preparing",
    source: { kind: "service", envVar: "NEXT_PUBLIC_FOOTBALL_GAME_URL" },
  };

  const previous = process.env.NEXT_PUBLIC_FOOTBALL_GAME_URL;
  delete process.env.NEXT_PUBLIC_FOOTBALL_GAME_URL;
  assert.equal(resolveArcadeSource(asService), null);
  assert.equal(isArcadeGamePlayable(asService), false);

  process.env.NEXT_PUBLIC_FOOTBALL_GAME_URL = "";
  assert.equal(resolveArcadeSource(asService), null, "an empty variable is not a deployment");

  process.env.NEXT_PUBLIC_FOOTBALL_GAME_URL = "https://football.example.com";
  assert.equal(resolveArcadeSource(asService), "https://football.example.com");

  if (previous === undefined) delete process.env.NEXT_PUBLIC_FOOTBALL_GAME_URL;
  else process.env.NEXT_PUBLIC_FOOTBALL_GAME_URL = previous;
});

test("the arcade index separates playable games from the honest remainder", () => {
  const games = resolveAll();
  const markup = renderToStaticMarkup(createElement(ArcadeIndex, { games }));

  assert.match(markup, /<main id="main-content" class="arcade-index">/);
  assert.match(markup, /MandelBro/);
  assert.match(markup, /Playable now/);
  assert.match(markup, /Documented only/);
  assert.doesNotMatch(
    markup,
    /Waiting on hosting/,
    "every measured game now has a host, so the in-preparation group is empty",
  );
  assert.match(markup, /href="\/arcade\/mandelbro"/);
  assert.match(markup, /href="\/arcade\/jacobgolf"/);
  assert.match(markup, /github\.com\/uset82\/MandelBro/);
  assert.match(markup, /github\.com\/uset82\/Jacobgolf/);

  // The index links to games; it never embeds one.
  assert.doesNotMatch(markup, /<(?:iframe|audio|video)\b/);
});

test("Jacobs Golfspill is playable from its live Netlify host", () => {
  const jacobgolf = findArcadeGame("jacobgolf");
  assert.ok(jacobgolf);
  assert.equal(jacobgolf.source.kind, "external");
  assert.equal(resolveArcadeSource(jacobgolf), "https://jacobgolf.netlify.app/");
  assert.equal(isArcadeGamePlayable(jacobgolf), true);

  const markup = renderToStaticMarkup(
    createElement(ArcadeGameDetail, {
      game: jacobgolf,
      source: resolveArcadeSource(jacobgolf),
    }),
  );

  assert.doesNotMatch(markup, /<iframe\b/, "no frame may exist before an explicit click");
  assert.match(markup, /Play Jacobs Golfspill/);
  assert.match(markup, /my son Jacob made it when he was nine/i, "the credit belongs on the page");
});

test("QubeSolve is playable from its live Netlify host", () => {
  const qubesolve = findArcadeGame("qubesolve");
  assert.ok(qubesolve);
  assert.equal(qubesolve.source.kind, "external");
  assert.equal(resolveArcadeSource(qubesolve), "https://qubesolve.netlify.app/");
  assert.equal(isArcadeGamePlayable(qubesolve), true);

  const markup = renderToStaticMarkup(
    createElement(ArcadeGameDetail, {
      game: qubesolve,
      source: resolveArcadeSource(qubesolve),
    }),
  );

  assert.doesNotMatch(markup, /<iframe\b/, "no frame may exist before an explicit click");
  assert.match(markup, /Play QubeSolve/);
});

test("3Doodle is playable from its live Netlify host", () => {
  const doodle = findArcadeGame("3doodle");
  assert.ok(doodle);
  assert.equal(doodle.source.kind, "external");
  assert.equal(resolveArcadeSource(doodle), "https://3doodle.netlify.app/draw");
  assert.equal(isArcadeGamePlayable(doodle), true);

  const markup = renderToStaticMarkup(
    createElement(ArcadeGameDetail, {
      game: doodle,
      source: resolveArcadeSource(doodle),
    }),
  );

  assert.doesNotMatch(markup, /<iframe/, "no frame may exist before an explicit click");
  assert.match(markup, /Play 3Doodle/);
});

test("the games that were waiting on hosting are served from their live hosts", () => {
  const hosted = [
    ["football", "https://poetic-faun-843df2.netlify.app/"],
    ["monkey-tug-of-war", "https://monkeytugofwar.netlify.app/"],
    ["gimmemycake", "https://gimmemycake.netlify.app/"],
    ["drone-lips", "https://superlative-pony-49581f.netlify.app/"],
  ] as const;

  for (const [slug, url] of hosted) {
    const game = findArcadeGame(slug);
    assert.ok(game, `${slug} is missing from the roster`);
    assert.equal(game.source.kind, "external");
    assert.equal(resolveArcadeSource(game), url);
    assert.equal(isArcadeGamePlayable(game), true);
    assert.equal(game.blockedBy, undefined, `${slug} still carries a blocking reason`);
  }
});

test("no game is left in the waiting-on-hosting state", () => {
  assert.deepEqual(
    ARCADE_GAMES.filter((game) => game.status === "preparing").map((game) => game.slug),
    [],
  );
});

test("the play shell loads nothing before the visitor presses play", () => {
  const mandelbro = findArcadeGame("mandelbro");
  assert.ok(mandelbro);

  const markup = renderToStaticMarkup(
    createElement(ArcadeGameDetail, {
      game: mandelbro,
      source: resolveArcadeSource(mandelbro),
    }),
  );

  assert.doesNotMatch(markup, /<iframe\b/, "no frame may exist before an explicit click");
  assert.match(markup, /has not loaded yet/);
  assert.match(markup, /Play MandelBro/);
});

test("a blocked game renders its reason and no play affordance", () => {
  const reaction = findArcadeGame("reaction-game");
  assert.ok(reaction);

  const markup = renderToStaticMarkup(
    createElement(ArcadeGameDetail, { game: reaction, source: resolveArcadeSource(reaction) }),
  );

  assert.doesNotMatch(markup, /<iframe\b/);
  assert.match(markup, /Why you cannot play this one here/);
  assert.match(markup, /runs on hardware, not in a browser/);
  assert.match(markup, /Not playable here yet/);
});

test("same-origin games run without allow-same-origin, so they cannot reach site storage", () => {
  const shell = readFileSync(
    path.join(process.cwd(), "src/components/arcade/game-frame.tsx"),
    "utf8",
  );

  assert.match(shell, /sameOrigin\s*\?\s*"allow-scripts allow-pointer-lock allow-popups"/);
  assert.match(shell, /allow-scripts allow-same-origin allow-pointer-lock allow-popups/);
  assert.match(shell, /referrerPolicy="strict-origin-when-cross-origin"/);
  assert.doesNotMatch(shell, /allow-top-navigation/);
});

test("the vendored MandelBro build stays self-contained", () => {
  const game = readFileSync(path.join(process.cwd(), "public/games/mandelbro/index.html"), "utf8");

  assert.doesNotMatch(game, /\bfetch\s*\(/);
  assert.doesNotMatch(game, /XMLHttpRequest/);
  assert.doesNotMatch(game, /localStorage|sessionStorage|indexedDB/);
  assert.doesNotMatch(
    game,
    /(?:src|href)="https?:\/\//,
    "the vendored build must not pull assets from another host",
  );
  assert.ok(
    existsSync(path.join(process.cwd(), "public/games/mandelbro/PROVENANCE.md")),
    "a vendored third-party build needs its provenance recorded",
  );
});

test("arcade slugs are unique and routable", () => {
  const slugs = ARCADE_GAMES.map((game) => game.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const slug of slugs) {
    assert.match(slug, /^[a-z0-9-]+$/);
    assert.ok(findArcadeGame(slug));
  }
});
