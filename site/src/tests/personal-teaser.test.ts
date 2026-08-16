import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PersonalTeaser } from "@/components/personal-teaser";
import { COSMOS_APPS, pinaculoApp } from "@/content/cosmos";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";

test("personal teaser names the public apps without publishing private stories", () => {
  const content = siteContentSchema.parse(rawSiteContent).metadata.personalTeaser;
  const markup = renderToStaticMarkup(createElement(PersonalTeaser, { content }));

  assert.match(markup, /<section class="personal-teaser" aria-labelledby="personal-teaser-title">/);
  assert.match(markup, /Come in and try the two apps\./);
  assert.match(markup, /Two apps you can look through/);
  assert.match(markup, /aria-label="Apps and practices in Cosmos"/);
  assert.equal((markup.match(/<li>/g) ?? []).length, 3);
  assert.match(markup, /ASTROEA/);
  assert.match(markup, /Pináculo/);
  assert.match(markup, /Travel notes/);
  assert.match(markup, /https:\/\/github.com\/uset82\/ASTROEA/);
  assert.match(markup, /https:\/\/github.com\/uset82\/pinaculo/);
  assert.match(markup, new RegExp(pinaculoApp.tryUrl!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(markup, /not scientific, medical, or predictive advice/);
  assert.match(markup, /href="\/cosmos"/);
  assert.doesNotMatch(markup, /<(?:img|picture|video|iframe|map|time|address|form)\b/);
  assert.doesNotMatch(markup, /(?:latitude|longitude|street address|postal code)/i);
  assert.equal(COSMOS_APPS.length, 2);
});

test("homepage mounts the copy-first responsive teaser with focus and reduced-motion feedback", () => {
  const homepage = readFileSync(path.join(process.cwd(), "src/app/page.tsx"), "utf8");
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");
  const personalIndex = homepage.indexOf("<PersonalTeaser");
  const profileIndex = homepage.indexOf("<ProfileTeaser");

  assert.ok(personalIndex > -1);
  assert.ok(profileIndex > personalIndex);
  assert.match(styles, /\.personal-teaser:focus-within \.personal-teaser__field/);
  assert.match(styles, /\.personal-teaser:hover \.personal-teaser__field/);
  assert.match(styles, /\.personal-teaser__themes li[^}]*min-height:\s*4rem/);
  assert.match(styles, /@media \(max-width: 47\.99rem\)[\s\S]*?\.personal-teaser/);
  assert.match(styles, /\.personal-teaser__action[^}]*width:\s*100%/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
