import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { MediaTeaser } from "@/components/media-teaser";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";

test("media teaser communicates identity and approval state without creating a player", () => {
  const content = siteContentSchema.parse(rawSiteContent).metadata.mediaTeaser;
  const markup = renderToStaticMarkup(createElement(MediaTeaser, { content }));

  assert.match(markup, /<section class="media-teaser" aria-labelledby="media-teaser-title">/);
  assert.match(markup, /Music you can hear, and video you can watch\./);
  assert.match(markup, /Listen when you are ready/);
  assert.match(markup, /aria-label="Music and video"/);
  assert.match(markup, />Music</);
  assert.match(markup, />Video</);
  assert.doesNotMatch(markup, /Moving image/);
  assert.doesNotMatch(markup, /StrudelAI/);
  assert.match(markup, /class="media-teaser__mark"/);
  assert.doesNotMatch(markup, />11</);
  assert.match(markup, /href="\/sound"/);
  assert.doesNotMatch(markup, /<(?:audio|video|iframe|button)\b/);
  assert.doesNotMatch(markup, /(?:autoplay|preload|controls)=/);
});

test("homepage mounts the responsive teaser with focus and reduced-motion-safe feedback", () => {
  const homepage = readFileSync(path.join(process.cwd(), "src/app/page.tsx"), "utf8");
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(homepage, /<MediaTeaser content=\{metadata\.mediaTeaser\} \/>/);
  assert.doesNotMatch(homepage, /sound-section|sound-index/);
  assert.match(styles, /\.media-teaser:focus-within \.media-teaser__instrument/);
  assert.match(styles, /\.media-teaser:hover \.media-teaser__instrument/);
  assert.match(styles, /\.media-teaser:hover \.media-teaser__vinyl/);
  assert.match(styles, /\.media-teaser__formats li[^}]*min-height:\s*3\.5rem/);
  assert.match(styles, /\.media-teaser__action[^}]*width:\s*100%/);
  assert.match(
    styles,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.media-teaser__vinyl[\s\S]*?transform:\s*none/,
  );
});
