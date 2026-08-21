import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CosmosFoundation } from "@/components/cosmos-foundation";
import { astraeaApp, pinaculoApp } from "@/content/cosmos";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";

test("Cosmos features the public apps without publishing a private story or collecting birth data", () => {
  const content = siteContentSchema.parse(rawSiteContent).metadata.personalTeaser;
  const markup = renderToStaticMarkup(createElement(CosmosFoundation, { content }));

  assert.match(markup, /cosmos-mark__peak/);
  assert.match(markup, /Personal systems for observing patterns and meaning\./);
  assert.match(markup, /Two apps you can try/);
  assert.match(markup, />ASTROEA<\/h3>/);
  assert.match(markup, />Pináculo<\/h3>/);
  assert.doesNotMatch(markup, /Travel notes|>Travel</);
  assert.match(markup, /https:\/\/github.com\/uset82\/ASTROEA/);
  assert.match(markup, /https:\/\/github.com\/uset82\/pinaculo/);
  assert.match(markup, /https:\/\/astraia\.netlify\.app\//);
  assert.match(markup, /https:\/\/pinaculo\.netlify\.app\//);
  assert.match(markup, /astro\.com/);
  assert.match(markup, /Carl Jung/);
  assert.match(markup, /does not collect names or birth dates/);
  assert.match(markup, /href="\/work"/);
  assert.match(markup, /href="\/story"/);
  assert.doesNotMatch(markup, /<dt>|HOLD|Publication boundary|Available now/);
  assert.match(
    markup,
    /Creative and personal practice—not scientific, medical, or predictive advice/,
  );
  assert.doesNotMatch(
    markup,
    /<(?:img|picture|video|audio|iframe|canvas|map|time|address|form|button)\b/,
  );
  assert.doesNotMatch(markup, /(?:latitude|longitude|street address|postal code|itinerary item)/i);
  assert.equal(astraeaApp.tryUrl, "https://astraia.netlify.app/");
  assert.equal(pinaculoApp.tryUrl, "https://pinaculo.netlify.app/");
});

test("Cosmos keeps a cardless responsive atlas with touch and reduced-motion safeguards", () => {
  const page = readFileSync(path.join(process.cwd(), "src/app/(en)/cosmos/page.tsx"), "utf8");
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(page, /<CosmosFoundation/);
  assert.match(styles, /\.cosmos-foundation__hero:focus-within \.cosmos-foundation__atlas/);
  assert.match(styles, /\.cosmos-foundation__hero:hover \.cosmos-foundation__atlas/);
  assert.match(
    styles,
    /\.cosmos-foundation__practices li\s*\{[\s\S]*?grid-template-columns:\s*2\.5rem max-content minmax\(12rem, 1fr\) max-content auto/,
  );
  assert.match(styles, /\.cosmos-foundation__practices li\s*\{[\s\S]*?min-height:\s*8\.5rem/);
  assert.match(styles, /\.cosmos-foundation__practices h3\s*\{[\s\S]*?white-space:\s*nowrap/);
  assert.match(styles, /@media \(max-width: 47\.99rem\)[\s\S]*?\.cosmos-foundation__hero/);
  assert.match(styles, /\.cosmos-foundation__close nav \.ui-action\s*\{[\s\S]*?width:\s*100%/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(page, /PageIntro|RecoveryState/);
});
