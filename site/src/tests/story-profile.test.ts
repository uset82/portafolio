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
  const page = readFileSync(path.join(process.cwd(), "src/app/(en)/story/page.tsx"), "utf8");
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

test("The story plate upgrades its CC study to the emblem without losing the poster", () => {
  const metadata = siteContentSchema.parse(rawSiteContent).metadata;
  const markup = renderToStaticMarkup(
    createElement(StoryProfile, {
      name: metadata.name,
      content: metadata.profileTeaser,
    }),
  );

  // Server output is the flat study. The canvas is client-only, so nothing
  // WebGL may appear here, and the plate must not claim the emblem is present.
  assert.match(markup, /<strong aria-hidden="true">CC<\/strong>/);
  assert.doesNotMatch(markup, /<canvas/i);
  assert.doesNotMatch(markup, /story-profile__portrait--emblem/);

  // This slot stands in for a portrait that the same page says is withheld, so
  // the caption has to describe what is actually shown.
  assert.match(markup, /Emblem in place of a portrait/);
  assert.doesNotMatch(markup, /Typographic portrait/);
  // And it must still never become a claim that a photograph is published.
  assert.doesNotMatch(markup, /<(?:img|picture)\b/);

  const plate = readFileSync(
    path.join(process.cwd(), "src/components/story-portrait.tsx"),
    "utf8",
  );
  // A pale mark would vanish on the sage plate: this placement is the inversion
  // of the contact disc, not the same treatment retinted.
  assert.match(plate, /surface="light"/);
  assert.doesNotMatch(plate, /surface="dark"/);

  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");
  assert.match(styles, /\.story-profile__portrait--emblem strong\s*\{\s*opacity:\s*0/);
  // The poster must be gone before the emblem arrives. Without the delay the
  // emblem is already a third faded in while the CC is still on the plate, and
  // the two show as a pair of stacked marks rather than one replacing the other.
  assert.match(
    styles,
    /\.story-profile__portrait--emblem \.story-profile__portrait-emblem\s*\{[\s\S]*?transition-delay:\s*var\(--duration-base\)/,
  );
  assert.match(
    styles,
    /@media \(max-width: 47\.99rem\)[\s\S]*?\.story-profile__portrait-emblem\s*\{/,
  );
});

test("Both emblem placements share one scene, and each names its own ground", () => {
  const scene = readFileSync(
    path.join(process.cwd(), "src/components/ca2m-emblem-scene.tsx"),
    "utf8",
  );

  // One asset, one scene, two treatments. A second copy of this scene is how
  // the two placements would quietly drift apart.
  assert.match(scene, /export type EmblemSurface = "dark" \| "light"/);
  assert.match(scene, /const SURFACES: Record<EmblemSurface, SurfaceTreatment>/);

  // Every colour in both treatments has to come from the palette contract,
  // otherwise `palette:check` cannot see it.
  const literals = scene.match(/#[0-9a-fA-F]{3,8}/g) ?? [];
  assert.deepEqual(literals, [], `the scene must hold no colour literals: ${literals.join(", ")}`);
});
