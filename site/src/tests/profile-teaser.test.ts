import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ProfileTeaser } from "@/components/profile-teaser";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";

test("profile teaser publishes only approved biography and privacy-safe paths", () => {
  const content = siteContentSchema.parse(rawSiteContent).metadata.profileTeaser;
  const markup = renderToStaticMarkup(createElement(ProfileTeaser, { content }));

  assert.match(markup, /aria-labelledby="profile-teaser-title"/);
  assert.match(markup, /href="\/story"/);
  assert.match(markup, /One practice/);
  assert.match(markup, /many ways/);
  assert.match(markup, /The practice behind all of it/);
  assert.match(markup, /Explore profile and CV/);
  assert.match(markup, /AI and electronics/);
  assert.match(markup, /Resilient energy/);
  assert.match(markup, /Music and symbolic systems/);

  assert.doesNotMatch(markup, /presenting verified work separately from prototypes/);
  assert.doesNotMatch(markup, /href="https:\/\/github\.com\/uset82"/);
  assert.equal((markup.match(/<li>/g) ?? []).length, 0);

  // What the section must never do, whatever it looks like.
  assert.doesNotMatch(markup, /<(?:img|picture)\b/);
  assert.doesNotMatch(markup, /(?:download|\.pdf|mailto:|street address|phone number)/i);
});

test("profile teaser component preserves responsive, focus, and touch-safe styling", () => {
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(styles, /\.profile-teaser__heading/);
  assert.match(styles, /\.profile-teaser__link:hover/);
  assert.match(styles, /\.profile-teaser__link:focus-visible/);
  assert.match(styles, /\.profile-teaser__blend/);
  assert.match(styles, /@media \(max-width: 47\.99rem\)[\s\S]*?\.profile-teaser__copy/);
});
