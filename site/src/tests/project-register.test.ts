import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ProjectRegister } from "@/components/project-register";
import {
  GITHUB_REGISTER,
  GITHUB_REGISTER_GROUPS,
  GITHUB_REGISTER_META,
} from "@/content/github-register";
import { matchingWorkIds } from "@/lib/work-search";

const PRIVATE_REPOSITORY_NAMES = [
  "brain-private",
  "marcoloco",
  "ecco8-circular-luxe",
  "rentme",
  "ask-bank-ai",
  "masterHVL",
  "diagram-pixel-perfect-clone",
  "tragatelo-food-facts",
] as const;

test("every public repository is classified into exactly one Work group", () => {
  const groupedNames = GITHUB_REGISTER_GROUPS.flatMap((group) =>
    group.repositories.map((repository) => repository.name),
  );

  assert.equal(GITHUB_REGISTER_META.count, 62);
  assert.equal(GITHUB_REGISTER.length, 62);
  assert.equal(groupedNames.length, 62);
  assert.deepEqual(
    [...groupedNames].sort(),
    [...GITHUB_REGISTER.map((repository) => repository.name)].sort(),
  );
  assert.equal(new Set(groupedNames).size, 62);
  assert.deepEqual(
    GITHUB_REGISTER_GROUPS.map((group) => group.id),
    [
      "tools",
      "ai",
      "games",
      "music",
      "design",
      "websites",
      "hardware",
      "astrology",
      "business",
      "creative",
      "academic",
      "forks",
      "starts",
    ],
  );
});

test("project register renders grouped public repositories as ordered, linkable rows", () => {
  const markup = renderToStaticMarkup(createElement(ProjectRegister));

  assert.match(markup, /<main id="main-content" class="work-index">/);
  assert.match(markup, /aria-label="Work groups"/);
  assert.equal(GITHUB_REGISTER_META.count, 62);
  assert.equal((markup.match(/class="project-register__row"/g) ?? []).length, 62);
  assert.equal((markup.match(/class="project-register__group"/g) ?? []).length, 13);

  for (const group of GITHUB_REGISTER_GROUPS) {
    assert.match(markup, new RegExp(`id="work-group-${group.id}"`));
    assert.match(markup, new RegExp(`href="#work-group-${group.id}"`));
    assert.match(markup, new RegExp(`>${group.title}<`));
    assert.match(markup, new RegExp(`>${group.chartLabel}<`));
  }

  for (const repository of GITHUB_REGISTER) {
    assert.equal((markup.match(new RegExp(`href="${repository.url}"`, "g")) ?? []).length, 1);
    assert.match(
      markup,
      new RegExp(`<h3 id="project-register-${repository.id}-title">${repository.title}</h3>`),
    );
  }

  assert.match(markup, /public repositories/);
  assert.match(markup, /Work from 2022 to now/);
  assert.match(markup, /building since 2022/);
  assert.match(markup, /You are welcome to try what is open/);
  assert.match(markup, /href="\/cosmos"/);
  assert.match(markup, /href="\/support"/);
  assert.match(markup, />Try</);
  assert.match(markup, />Contribute</);
  assert.doesNotMatch(markup, /Observatory concepts|Open concept/);
  assert.doesNotMatch(markup, /href="\/work\/future-energy"/);
  for (const name of PRIVATE_REPOSITORY_NAMES) {
    assert.doesNotMatch(markup, new RegExp(name));
  }
  assert.match(markup, /role="search"/);
  assert.match(markup, /type="search"/);
  assert.match(markup, />Playable</);
  assert.match(markup, />Astrology</);
  assert.doesNotMatch(markup, /<(?:img|video|audio|iframe)\b/);
  assert.doesNotMatch(markup, /(?:mailto:)/);
});

test("Jacobgolf is a playable game in the Games group, not an unfilled start", () => {
  const jacobgolf = GITHUB_REGISTER.find((repository) => repository.name === "Jacobgolf");
  const games = GITHUB_REGISTER_GROUPS.find((group) => group.id === "games");
  const starts = GITHUB_REGISTER_GROUPS.find((group) => group.id === "starts");
  const markup = renderToStaticMarkup(createElement(ProjectRegister));

  assert.ok(jacobgolf);
  assert.ok(games);
  assert.ok(starts);
  assert.equal(jacobgolf.title, "Jacobs Golfspill");
  assert.equal(jacobgolf.tryUrl, "https://jacobgolf.netlify.app/");
  assert.equal(jacobgolf.roomHref, "/arcade/jacobgolf");
  assert.equal(
    games.repositories.some((repository) => repository.name === "Jacobgolf"),
    true,
  );
  assert.equal(
    starts.repositories.some((repository) => repository.name === "Jacobgolf"),
    false,
  );
  assert.match(markup, /href="https:\/\/jacobgolf\.netlify\.app\/"/);
  assert.match(markup, /href="\/arcade\/jacobgolf"/);
});

test("StillasCalculator is a tools row with the live site Carlos provided", () => {
  const stillas = GITHUB_REGISTER.find((repository) => repository.name === "StillasCalculator");
  const tools = GITHUB_REGISTER_GROUPS.find((group) => group.id === "tools");
  const markup = renderToStaticMarkup(createElement(ProjectRegister));

  assert.ok(stillas);
  assert.ok(tools);
  assert.equal(stillas.tryUrl, "https://stillascalculator.netlify.app/");
  assert.equal(stillas.tryLabel, "Open StillasCalculator");
  assert.equal(
    tools.repositories.some((repository) => repository.name === "StillasCalculator"),
    true,
  );
  assert.match(markup, /href="https:\/\/stillascalculator\.netlify\.app\/"/);
  assert.doesNotMatch(markup, /<(?:iframe)\b/);
});

test("QubeSolve is a playable game in the Games group with the live Netlify solver", () => {
  const qubesolve = GITHUB_REGISTER.find((repository) => repository.name === "QubeSolve");
  const games = GITHUB_REGISTER_GROUPS.find((group) => group.id === "games");
  const markup = renderToStaticMarkup(createElement(ProjectRegister));

  assert.ok(qubesolve);
  assert.ok(games);
  assert.equal(qubesolve.title, "QubeSolve");
  assert.equal(qubesolve.tryUrl, "https://qubesolve.netlify.app/");
  assert.equal(qubesolve.tryLabel, "Solve with QubeSolve");
  assert.equal(qubesolve.roomHref, "/arcade/qubesolve");
  assert.equal(
    games.repositories.some((repository) => repository.name === "QubeSolve"),
    true,
  );
  assert.match(markup, /href="https:\/\/qubesolve\.netlify\.app\/"/);
  assert.match(markup, /href="\/arcade\/qubesolve"/);
});

test("3Doodle links to the live drawing app and to its arcade room", () => {
  const doodle = GITHUB_REGISTER.find((repository) => repository.name === "3Doodle");
  const markup = renderToStaticMarkup(createElement(ProjectRegister));

  assert.ok(doodle);
  assert.equal(doodle.tryUrl, "https://3doodle.netlify.app/draw");
  assert.equal(doodle.tryLabel, "Draw with 3Doodle");
  assert.equal(doodle.roomHref, "/arcade/3doodle");
  assert.match(markup, /href="https:\/\/3doodle\.netlify\.app\/draw"/);
  assert.match(markup, /href="\/arcade\/3doodle"/);
});

test("EFFATA links to the live product scanner and says it needs the camera", () => {
  const effata = GITHUB_REGISTER.find((repository) => repository.name === "EFFATA");
  const markup = renderToStaticMarkup(createElement(ProjectRegister));

  assert.ok(effata);
  assert.equal(effata.tryUrl, "https://effata.netlify.app/");
  assert.equal(effata.tryLabel, "Scan with EFFATA");
  assert.match(effata.description, /camera access/);
  assert.match(markup, /href="https:\/\/effata\.netlify\.app\/"/);
});

test("opennemoclaw links to the live personal agent framework app", () => {
  const opennemoclaw = GITHUB_REGISTER.find((repository) => repository.name === "opennemoclaw");
  const opennemoclawsite = GITHUB_REGISTER.find(
    (repository) => repository.name === "opennemoclawsite",
  );
  const markup = renderToStaticMarkup(createElement(ProjectRegister));

  assert.ok(opennemoclaw);
  assert.ok(opennemoclawsite);
  assert.equal(opennemoclaw.title, "OpenNemoClaw");
  assert.equal(opennemoclaw.tryUrl, "https://opennemoclaw.netlify.app/");
  assert.equal(opennemoclaw.tryLabel, "Open OpenNemoClaw");
  assert.equal(opennemoclawsite.tryUrl, "https://opennemoclaw.netlify.app/");
  assert.match(markup, /href="https:\/\/opennemoclaw\.netlify\.app\/"/);
});

test("pacha is the Pasha restaurant site in Website creation", () => {
  const pacha = GITHUB_REGISTER.find((repository) => repository.name === "pacha");
  const websites = GITHUB_REGISTER_GROUPS.find((group) => group.id === "websites");
  const design = GITHUB_REGISTER_GROUPS.find((group) => group.id === "design");
  const markup = renderToStaticMarkup(createElement(ProjectRegister));

  assert.ok(pacha);
  assert.ok(websites);
  assert.ok(design);
  assert.equal(pacha.title, "Pasha");
  assert.equal(pacha.tryUrl, "https://pasharestaurant.netlify.app/");
  assert.equal(pacha.tryLabel, "Open Pasha");
  assert.equal(
    websites.repositories.some((repository) => repository.name === "pacha"),
    true,
  );
  assert.equal(
    design.repositories.some((repository) => repository.name === "pacha"),
    false,
  );
  assert.match(markup, /href="https:\/\/pasharestaurant\.netlify\.app\/"/);
  assert.doesNotMatch(markup, /Strandgaten|5004/);
});

test("chaclacayo is a Website creation row with the live site, without private contact details", () => {
  const chaclacayo = GITHUB_REGISTER.find((repository) => repository.name === "chaclacayo");
  const websites = GITHUB_REGISTER_GROUPS.find((group) => group.id === "websites");
  const markup = renderToStaticMarkup(createElement(ProjectRegister));

  assert.ok(chaclacayo);
  assert.ok(websites);
  assert.equal(chaclacayo.title, "Chaclacayo");
  assert.equal(chaclacayo.tryUrl, "https://chaclacayo.netlify.app/");
  assert.equal(chaclacayo.tryLabel, "Open Chaclacayo");
  assert.equal(
    websites.repositories.some((repository) => repository.name === "chaclacayo"),
    true,
  );
  assert.match(markup, />Website creation</);
  assert.match(markup, /href="https:\/\/chaclacayo\.netlify\.app\/"/);
  assert.doesNotMatch(markup, /hotmail|450 41 112|\+47|Alfonso Cobi[aá]n|350,?000|Mz\.?\s*B/i);
});

test("work search keeps every row in the DOM and hides non-matches", () => {
  const astro = renderToStaticMarkup(createElement(ProjectRegister, { initialQuery: "astro" }));
  const playable = renderToStaticMarkup(
    createElement(ProjectRegister, { initialFacet: "playable" }),
  );
  const empty = renderToStaticMarkup(
    createElement(ProjectRegister, { initialQuery: "zzzxnotarepository" }),
  );
  const astroIds = matchingWorkIds(GITHUB_REGISTER_GROUPS, "astro", "all");
  const playableIds = matchingWorkIds(GITHUB_REGISTER_GROUPS, "", "playable");

  assert.equal((astro.match(/class="project-register__row"/g) ?? []).length, 62);
  assert.equal((astro.match(/class="project-register__row"[^>]*hidden/g) ?? []).length, 60);
  assert.match(astro, /href="https:\/\/astraia\.netlify\.app\/"/);
  assert.match(astro, /href="https:\/\/pinaculo\.netlify\.app\/"/);
  assert.match(astro, />Try ASTROEA</);
  assert.match(astro, />Try Pináculo</);
  assert.equal(astroIds.size, 2);
  assert.equal(
    (playable.match(/class="project-register__row"[^>]*hidden/g) ?? []).length,
    62 - playableIds.size,
  );
  assert.match(playable, /aria-pressed="true">Playable</);
  assert.match(empty, /No public repositories match/);
  assert.match(empty, /Clear the search to see the full register/);
  assert.equal((empty.match(/class="project-register__row"[^>]*hidden/g) ?? []).length, 62);
});

test("project register is readable without animation and keeps focus, touch, and mobile contracts", () => {
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(styles, /\.project-register__row:where\(:hover, :focus-within\)/);
  assert.match(
    styles,
    /\.project-register__link\s*\{[\s\S]*?min-height:\s*var\(--control-height\)/,
  );
  assert.match(styles, /\.project-register__link:active/);
  assert.match(styles, /@media \(max-width: 63\.99rem\)[\s\S]*?\.project-register__row/);
  assert.match(styles, /@media \(max-width: 39\.99rem\)[\s\S]*?\.project-register__link/);
  assert.match(
    styles,
    /\.work-index__search-field\s*\{[\s\S]*?min-height:\s*var\(--control-height\)/,
  );
  assert.match(
    styles,
    /\.work-index__search-chip\s*\{[\s\S]*?min-height:\s*var\(--control-height\)/,
  );
  assert.match(
    styles,
    /@media \(max-width: 39\.99rem\)[\s\S]*?\.work-index__search input\[type="search"\][\s\S]*?font-size:\s*16px/,
  );
  assert.doesNotMatch(
    styles,
    /\.project-register(?:__row|__identity|__evidence|__link)?\s*\{[^}]*animation:/,
  );
  assert.doesNotMatch(styles, /\.work-index__search[^{]*\{[^}]*animation:/);
});
