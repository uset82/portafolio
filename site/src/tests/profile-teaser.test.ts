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
  assert.match(markup, /Engineer · Inventor · Creative Technologist/);
  assert.match(markup, /presenting verified work separately from prototypes/);
  assert.equal((markup.match(/<li>/g) ?? []).length, 3);
  assert.match(markup, /href="\/story"/);
  assert.match(markup, /href="https:\/\/github\.com\/uset82"/);
  assert.match(markup, /external site/);
  assert.doesNotMatch(markup, /<(?:img|picture)\b/);
  assert.doesNotMatch(markup, /(?:download|\.pdf|mailto:|street address|phone number)/i);
});

test("homepage mounts the profile teaser with responsive, focus, and touch-safe styling", () => {
  const homepage = readFileSync(path.join(process.cwd(), "src/app/page.tsx"), "utf8");
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(homepage, /<ProfileTeaser content=\{metadata\.profileTeaser\} \/>/);
  assert.match(styles, /\.profile-teaser:focus-within \.profile-teaser__mark/);
  assert.match(styles, /\.profile-teaser:hover \.profile-teaser__mark/);
  assert.match(
    styles,
    /\.profile-teaser__threads li\s*\{[\s\S]*?min-height:\s*var\(--control-height\)/,
  );
  assert.match(styles, /@media \(max-width: 47\.99rem\)[\s\S]*?\.profile-teaser/);
});
