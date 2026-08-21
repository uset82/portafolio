import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { SupportTeaser } from "@/components/support-teaser";
import { OPEN_SOURCE, SUPPORT_TEASER } from "@/content/support";

test("the homepage teaser welcomes visitors onto GitHub without listing unlicensed repos as contribute", () => {
  const markup = renderToStaticMarkup(createElement(SupportTeaser));

  assert.match(markup, /<section class="support-teaser" aria-labelledby="support-teaser-title">/);
  assert.match(markup, /Come in and look through the work\./);
  assert.match(markup, /href="\/support"/);
  assert.match(
    markup,
    new RegExp(`href="${OPEN_SOURCE.repositoriesUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`),
  );
  assert.match(markup, /tab=repositories/);
  assert.doesNotMatch(markup, /Buy [Mm]e a [Cc]offee/);

  for (const thread of SUPPORT_TEASER.threads) {
    assert.match(markup, new RegExp(thread));
  }

  assert.doesNotMatch(markup, /href="https:\/\/github\.com\/uset82\/[^"?]+"/);
  assert.doesNotMatch(markup, /<(?:iframe|form|button)\b/);
});

test("the homepage mounts the support teaser after listen and before personal", () => {
  const homepage = readFileSync(path.join(process.cwd(), "src/components/home-page.tsx"), "utf8");

  assert.match(homepage, /<SupportTeaser locale=\{locale\} \/>/);
  assert.equal(homepage.indexOf("<MediaTeaser") < homepage.indexOf("<SupportTeaser"), true);
  assert.equal(homepage.indexOf("<SupportTeaser") < homepage.indexOf("<PersonalTeaser"), true);
  assert.doesNotMatch(homepage, /laboratory-section/);
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
