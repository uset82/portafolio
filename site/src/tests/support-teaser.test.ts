import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { SupportTeaser } from "@/components/support-teaser";
import { CONTRIBUTABLE_REPOS } from "@/content/support";

test("the homepage teaser counts the MIT repositories without listing them", () => {
  const markup = renderToStaticMarkup(createElement(SupportTeaser));

  assert.match(markup, /<section class="support-teaser" aria-labelledby="support-teaser-title">/);
  assert.match(markup, /4 MIT repositories/);
  assert.match(markup, /href="\/support"/);
  assert.doesNotMatch(markup, /Buy [Mm]e a [Cc]offee/);

  // /support carries the list. Repeating four names here made the click
  // redundant, so the teaser states the count and leaves the list where it can
  // be acted on.
  for (const repo of CONTRIBUTABLE_REPOS) {
    assert.ok(
      !markup.includes(repo.name),
      `${repo.name} is listed on both the teaser and /support`,
    );
  }

  assert.doesNotMatch(markup, /href="https:\/\/github\.com\/uset82\/[^"]+"/);
  assert.doesNotMatch(markup, /<(?:iframe|form|button)\b/);
});

test("the homepage mounts the support teaser as the third door", () => {
  const homepage = readFileSync(path.join(process.cwd(), "src/app/page.tsx"), "utf8");

  assert.match(homepage, /<SupportTeaser \/>/);
  assert.equal(homepage.indexOf("<MediaTeaser") < homepage.indexOf("<SupportTeaser"), true);
  assert.equal(homepage.indexOf("<SupportTeaser") < homepage.indexOf("<ProfileTeaser"), true);
});

test("the support teaser carries responsive and reduced-motion paths", () => {
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(styles, /\.support-teaser:hover \.support-teaser__mark/);
  assert.match(styles, /@media \(max-width: 61\.99rem\)[\s\S]*?\.support-teaser\s*\{/);
  assert.match(styles, /\.support-teaser__action\s*\{[\s\S]*?width:\s*100%/);
  assert.match(
    styles,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.support-teaser__mark[\s\S]*?transform:\s*none/,
  );
});
