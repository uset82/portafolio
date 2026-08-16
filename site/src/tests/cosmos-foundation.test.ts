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

  assert.match(markup, /<main id="main-content" class="cosmos-foundation">/);
  assert.match(markup, /Personal systems for observing patterns and meaning\./);
  assert.match(markup, /Two apps you can look through/);
  assert.match(markup, />ASTROEA<\/h3>/);
  assert.match(markup, />Pináculo<\/h3>/);
  assert.match(markup, />Travel notes<\/h3>/);
  assert.match(markup, /https:\/\/github.com\/uset82\/ASTROEA/);
  assert.match(markup, /https:\/\/github.com\/uset82\/pinaculo/);
  assert.match(markup, /https:\/\/pinaculo\.netlify\.app\//);
  assert.match(markup, /astro\.com/);
  assert.match(markup, /Carl Jung/);
  assert.match(markup, /does not collect names or birth dates/);
  assert.equal((markup.match(/<dt>/g) ?? []).length, 4);
  assert.match(
    markup,
    /Creative and personal practice—not scientific, medical, or predictive advice/,
  );
  assert.doesNotMatch(
    markup,
    /<(?:img|picture|video|audio|iframe|canvas|map|time|address|form|button)\b/,
  );
  assert.doesNotMatch(markup, /(?:latitude|longitude|street address|postal code|itinerary item)/i);
  assert.equal(astraeaApp.tryUrl, null);
  assert.equal(pinaculoApp.tryUrl, "https://pinaculo.netlify.app/");
});

test("Cosmos keeps a cardless responsive atlas with touch and reduced-motion safeguards", () => {
  const page = readFileSync(path.join(process.cwd(), "src/app/cosmos/page.tsx"), "utf8");
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(page, /<CosmosFoundation/);
  assert.match(styles, /\.cosmos-foundation__hero:focus-within \.cosmos-foundation__atlas/);
  assert.match(styles, /\.cosmos-foundation__hero:hover \.cosmos-foundation__atlas/);
  assert.match(styles, /\.cosmos-foundation__practices li\s*\{[\s\S]*?min-height:\s*8\.5rem/);
  assert.match(styles, /@media \(max-width: 47\.99rem\)[\s\S]*?\.cosmos-foundation__hero/);
  assert.match(styles, /\.cosmos-foundation__boundary nav \.ui-action\s*\{[\s\S]*?width:\s*100%/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(page, /PageIntro|RecoveryState/);
});
