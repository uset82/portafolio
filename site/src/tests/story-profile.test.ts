import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { StoryProfile } from "@/components/story-profile";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";

test("Story publishes the approved profile and an explicit privacy-safe CV boundary", () => {
  const metadata = siteContentSchema.parse(rawSiteContent).metadata;
  const markup = renderToStaticMarkup(
    createElement(StoryProfile, {
      name: metadata.name,
      content: metadata.profileTeaser,
    }),
  );

  assert.match(markup, /<main id="main-content" class="story-profile">/);
  assert.match(markup, /<h1 id="story-profile-title">Carlos Alfredo Carpio Meza<\/h1>/);
  assert.match(markup, /Engineer · Inventor · Creative Technologist/);
  assert.match(markup, /presenting verified work separately from prototypes/);
  assert.match(markup, /Biography approved/);
  assert.equal((markup.match(/<li>/g) ?? []).length, 3);
  assert.match(markup, /Experience, education, and skills remain withheld/);
  assert.match(markup, /href="\/work"/);
  assert.match(markup, /href="\/contact"/);
  assert.match(markup, /href="https:\/\/github\.com\/uset82"/);
  assert.match(markup, /external site/);
  assert.doesNotMatch(markup, /<article\b/);
  assert.doesNotMatch(markup, /<(?:img|picture|address)\b/);
  assert.doesNotMatch(markup, /<a[^>]+(?:download|\.pdf|mailto:|tel:)/i);
  assert.doesNotMatch(markup, /(?:birth date|citizenship|street address|phone number)/i);
});

test("Story keeps a cardless responsive composition with touch and reduced-motion safeguards", () => {
  const page = readFileSync(path.join(process.cwd(), "src/app/story/page.tsx"), "utf8");
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(page, /<StoryProfile/);
  // The hero and practice list are not interactive, so they must not wear
  // hover affordances: the design-QA pass removed the portrait lift and the
  // row-indent shift as fake interactivity signals.
  assert.doesNotMatch(styles, /\.story-profile__hero:hover \.story-profile__portrait/);
  assert.doesNotMatch(styles, /\.story-profile__practice:hover li/);
  assert.match(styles, /\.story-profile__practice li\s*\{[\s\S]*?min-height:\s*6\.25rem/);
  assert.match(styles, /@media \(max-width: 47\.99rem\)[\s\S]*?\.story-profile__hero/);
  assert.match(styles, /\.story-profile__actions \.ui-action\s*\{[\s\S]*?width:\s*100%/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(page, /PageIntro|RecoveryState/);
});
