import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { SupportTeaser } from "@/components/support-teaser";
import { CONTRIBUTABLE_REPOS } from "@/content/support";

test("the homepage teaser names only the MIT repositories and one contribute door", () => {
  const markup = renderToStaticMarkup(createElement(SupportTeaser));

  assert.match(markup, /<section class="support-teaser" aria-labelledby="support-teaser-title">/);
  assert.match(markup, /4 MIT repositories/);
  assert.match(markup, /href="\/support"/);
  assert.doesNotMatch(markup, /Buy [Mm]e a [Cc]offee/);

  for (const repo of CONTRIBUTABLE_REPOS) {
    assert.match(markup, new RegExp(repo.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.doesNotMatch(markup, /href="https:\/\/github\.com\/uset82\/[^"]+"/);
  assert.doesNotMatch(markup, /<(?:iframe|form|button)\b/);
});

test("the homepage mounts the support teaser after listen and before the laboratory", () => {
  const homepage = readFileSync(path.join(process.cwd(), "src/app/page.tsx"), "utf8");

  assert.match(homepage, /<SupportTeaser \/>/);
  assert.equal(homepage.indexOf("<MediaTeaser") < homepage.indexOf("<SupportTeaser"), true);
  assert.equal(homepage.indexOf("<SupportTeaser") < homepage.indexOf("laboratory-section"), true);
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
