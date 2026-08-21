import assert from "node:assert/strict";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ArcadeIndex, type ResolvedArcadeGame } from "@/components/arcade/arcade-index";
import { ARCADE_GAMES, isArcadeGamePlayable } from "@/content/arcade";
import { ARCADE_GAMES_ES, localizeArcadeGame } from "@/content/i18n/arcade-es";
import { UI } from "@/content/i18n/ui";
import {
  alternateHref,
  hasTranslation,
  localeHref,
  resolveHref,
  splitLocale,
  LOCALES,
} from "@/lib/i18n";

const digits = (value: string) => value.match(/\d+(?:[.,]\d+)?/g) ?? [];

test("English routes keep their unprefixed paths and Spanish sits under /es", () => {
  assert.equal(localeHref("en", "/arcade"), "/arcade");
  assert.equal(localeHref("es", "/arcade"), "/es/arcade");
  assert.equal(localeHref("es", "/"), "/es");
  assert.equal(localeHref("en", "/"), "/");

  // External and fragment links are never rewritten.
  assert.equal(localeHref("es", "https://github.com/uset82"), "https://github.com/uset82");
  assert.equal(localeHref("es", "#selected-systems"), "#selected-systems");
});

test("a pathname resolves to the locale that owns it", () => {
  assert.deepEqual(splitLocale("/es/arcade"), { locale: "es", path: "/arcade" });
  assert.deepEqual(splitLocale("/es"), { locale: "es", path: "/" });
  assert.deepEqual(splitLocale("/arcade"), { locale: "en", path: "/arcade" });
  assert.deepEqual(splitLocale("/"), { locale: "en", path: "/" });
});

test("the language switch points at the same page in the other language", () => {
  assert.equal(alternateHref("en", "/arcade/jacobgolf"), "/es/arcade/jacobgolf");
  assert.equal(alternateHref("es", "/es/arcade/jacobgolf"), "/arcade/jacobgolf");
  assert.equal(alternateHref("en", "/"), "/es");
  assert.equal(alternateHref("es", "/es"), "/");
});

test("a Spanish page links to English for routes that are not translated yet", () => {
  assert.equal(hasTranslation("/arcade"), true);
  assert.equal(hasTranslation("/arcade/football"), true);
  assert.equal(hasTranslation("/"), true);

  // Untranslated routes send the reader to the English page rather than a 404.
  assert.equal(resolveHref("es", "/arcade"), "/es/arcade");
  assert.equal(
    resolveHref("es", "/work"),
    "/work",
    "a route with no Spanish page must not be given an /es prefix",
  );
});

test("every arcade game has Spanish copy", () => {
  for (const game of ARCADE_GAMES) {
    const copy = ARCADE_GAMES_ES[game.id];
    assert.ok(copy, `${game.id} has no Spanish entry`);
    assert.equal(
      copy.controls.length,
      game.controls.length,
      `${game.id} lists a different number of controls in Spanish`,
    );
    assert.ok(
      game.blockedBy === undefined || copy.blockedBy !== undefined,
      `${game.id} is blocked in English but not in Spanish`,
    );
  }
});

test("translated sizes keep the measured numbers", () => {
  for (const game of ARCADE_GAMES) {
    const spanish = localizeArcadeGame(game, "es");
    assert.deepEqual(
      digits(spanish.builtSize).map((value) => value.replace(",", ".")),
      digits(game.builtSize).map((value) => value.replace(",", ".")),
      `${game.id} states a different measurement in Spanish`,
    );

    // The measured record itself is never restated by the overlay.
    assert.equal(spanish.measuredOn, game.measuredOn);
    assert.equal(spanish.repository, game.repository);
    assert.deepEqual(spanish.source, game.source);
    assert.equal(spanish.status, game.status);
  }
});

test("the interface dictionary carries the same keys in both languages", () => {
  const shape = (value: unknown, trail: string): string[] => {
    if (typeof value !== "object" || value === null) return [`${trail}:${typeof value}`];
    return Object.entries(value).flatMap(([key, nested]) => shape(nested, `${trail}.${key}`));
  };

  const [first, ...rest] = LOCALES.map((locale) => shape(UI[locale], locale.toUpperCase()));
  assert.ok(first);
  for (const other of rest) {
    assert.deepEqual(
      other.map((entry) => entry.slice(entry.indexOf("."))),
      first.map((entry) => entry.slice(entry.indexOf("."))),
    );
  }
});

test("the Spanish arcade renders Spanish, not English with Spanish content", () => {
  const games: ResolvedArcadeGame[] = ARCADE_GAMES.map((game) => ({
    ...localizeArcadeGame(game, "es"),
    playable: isArcadeGamePlayable(game),
  }));
  const markup = renderToStaticMarkup(createElement(ArcadeIndex, { games, locale: "es" }));

  assert.match(markup, /Jugable ahora/);
  assert.match(markup, /Juega ahora/);
  assert.match(markup, /Motor/);
  assert.match(markup, /Jugar a Jacobs Golfspill/);
  assert.match(markup, /href="\/es\/arcade\/jacobgolf"/);

  for (const leak of ["Playable now", "Play now", "Built size", "Back to the arcade"]) {
    assert.ok(!markup.includes(leak), `the Spanish arcade still says "${leak}"`);
  }
});

test("the English arcade is untouched by the translation layer", () => {
  const games: ResolvedArcadeGame[] = ARCADE_GAMES.map((game) => ({
    ...game,
    playable: isArcadeGamePlayable(game),
  }));
  const markup = renderToStaticMarkup(createElement(ArcadeIndex, { games }));

  assert.match(markup, /Playable now/);
  assert.match(markup, /href="\/arcade\/jacobgolf"/);
  assert.ok(!markup.includes("/es/arcade"), "the English arcade must not link into /es");
});
