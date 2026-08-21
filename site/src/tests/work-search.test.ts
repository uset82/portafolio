import assert from "node:assert/strict";
import test from "node:test";

import { GITHUB_REGISTER, GITHUB_REGISTER_GROUPS } from "@/content/github-register";
import { getWorkSearchLocationSnapshot, writeWorkSearchLocation } from "@/lib/work-search-location";
import {
  isWorkSearchActive,
  matchingWorkIds,
  normalizeWorkSearchText,
  parseWorkSearchFacet,
  workEntryMatches,
} from "@/lib/work-search";

function groupFor(name: string) {
  const group = GITHUB_REGISTER_GROUPS.find((item) =>
    item.repositories.some((repository) => repository.name === name),
  );
  assert.ok(group, `missing group for ${name}`);
  return group;
}

function entryFor(name: string) {
  const repository = GITHUB_REGISTER.find((item) => item.name === name);
  assert.ok(repository, `missing repository ${name}`);
  return repository;
}

test("work search normalizes punctuation and diacritics", () => {
  assert.equal(normalizeWorkSearchText("  Pináculo! "), "pinaculo");
  assert.equal(parseWorkSearchFacet("playable"), "playable");
  assert.equal(parseWorkSearchFacet("astrology"), "astrology");
  assert.equal(parseWorkSearchFacet("games"), "all");
  assert.equal(isWorkSearchActive("", "all"), false);
  assert.equal(isWorkSearchActive("astro", "all"), true);
  assert.equal(isWorkSearchActive("", "playable"), true);
});

test("astro and astrology queries keep ASTROEA and Pináculo", () => {
  const astroea = entryFor("ASTROEA");
  const pinaculo = entryFor("pinaculo");
  const astroGroup = groupFor("ASTROEA");
  const games = groupFor("Jacobgolf");
  const golf = entryFor("Jacobgolf");

  assert.equal(workEntryMatches(astroea, astroGroup, "astro"), true);
  assert.equal(workEntryMatches(pinaculo, astroGroup, "astro"), true);
  assert.equal(workEntryMatches(astroea, astroGroup, "astraia"), true);
  assert.equal(workEntryMatches(pinaculo, astroGroup, "numerology"), true);
  assert.equal(workEntryMatches(golf, games, "astro"), false);

  const astrologyIds = matchingWorkIds(GITHUB_REGISTER_GROUPS, "", "astrology");
  assert.equal(astrologyIds.size, 2);
  assert.equal(astrologyIds.has(astroea.id), true);
  assert.equal(astrologyIds.has(pinaculo.id), true);
});

test("playable queries keep live try links and ignore display-like words", () => {
  const golf = entryFor("Jacobgolf");
  const games = groupFor("Jacobgolf");
  const astroea = entryFor("ASTROEA");
  const astroGroup = groupFor("ASTROEA");
  const stillas = entryFor("StillasCalculator");
  const tools = groupFor("StillasCalculator");
  const tetris = entryFor("Tetris");
  const forks = groupFor("Tetris");

  assert.equal(workEntryMatches(golf, games, "play"), true);
  assert.equal(workEntryMatches(astroea, astroGroup, "playable"), true);
  assert.equal(workEntryMatches(stillas, tools, "try"), true);
  assert.equal(workEntryMatches(tetris, forks, "play"), false);
  assert.equal(workEntryMatches(golf, games, "golf"), true);

  const playableIds = matchingWorkIds(GITHUB_REGISTER_GROUPS, "", "playable");
  const liveCount = GITHUB_REGISTER.filter((repository) => repository.tryUrl).length;
  assert.equal(playableIds.size, liveCount);
  assert.equal(playableIds.has(golf.id), true);
  assert.equal(playableIds.has(astroea.id), true);
  assert.equal(playableIds.has(tetris.id), false);
});

test("combined playable astrology search keeps only the two cosmos apps", () => {
  const matches = matchingWorkIds(GITHUB_REGISTER_GROUPS, "astro", "playable");
  const names = GITHUB_REGISTER.filter((repository) => matches.has(repository.id)).map(
    (repository) => repository.name,
  );

  assert.deepEqual([...names].sort(), ["ASTROEA", "pinaculo"]);
});

test("work search location writes q and show without replacing the snapshot on no-op reads", () => {
  const originalLocation = globalThis.location;
  const originalHistory = globalThis.history;
  const href = { value: "https://carloscarpio.up.railway.app/work" };
  const historyCalls: string[] = [];

  Object.defineProperty(globalThis, "location", {
    configurable: true,
    value: {
      get href() {
        return href.value;
      },
      get pathname() {
        return new URL(href.value).pathname;
      },
      get search() {
        return new URL(href.value).search;
      },
      get hash() {
        return new URL(href.value).hash;
      },
    },
  });
  Object.defineProperty(globalThis, "history", {
    configurable: true,
    value: {
      replaceState(_state: unknown, _unused: string, next: string) {
        historyCalls.push(next);
        href.value = `https://carloscarpio.up.railway.app${next}`;
      },
    },
  });

  try {
    writeWorkSearchLocation("astro", "playable");
    const first = getWorkSearchLocationSnapshot();
    const second = getWorkSearchLocationSnapshot();
    assert.equal(first.query, "astro");
    assert.equal(first.facet, "playable");
    assert.equal(first, second);
    assert.deepEqual(historyCalls, ["/work?q=astro&show=playable"]);
    writeWorkSearchLocation("", "all");
    assert.equal(getWorkSearchLocationSnapshot().query, "");
    assert.equal(getWorkSearchLocationSnapshot().facet, "all");
  } finally {
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: originalLocation,
    });
    Object.defineProperty(globalThis, "history", {
      configurable: true,
      value: originalHistory,
    });
  }
});
