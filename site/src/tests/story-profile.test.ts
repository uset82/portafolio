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
  assert.equal((markup.match(/<li>/g) ?? []).length, 4);
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

  // Server output is the flat mark. The canvas is client-only, so nothing WebGL
  // may appear here, and the plate must not claim the emblem is present.
  //
  // The poster has to be the SAME mark the model draws. It used to be a CC
  // letterform, which meant the plate visibly showed one mark and then exchanged
  // it for another during the second or so the model took to arrive.
  assert.match(markup, /class="ca2m-poster story-profile__portrait-poster"/);
  assert.doesNotMatch(markup, />CC</);
  assert.doesNotMatch(markup, /<canvas/i);
  assert.doesNotMatch(markup, /story-profile__portrait--emblem/);

  // This slot stands in for a portrait that the same page says is withheld, so
  // the caption has to describe what is actually shown.
  assert.match(markup, /Emblem in place of a portrait/);
  assert.doesNotMatch(markup, /Typographic portrait/);
  // And it must still never become a claim that a photograph is published.
  assert.doesNotMatch(markup, /<(?:img|picture)\b/);

  const plate = readFileSync(path.join(process.cwd(), "src/components/story-portrait.tsx"), "utf8");
  // A pale mark would vanish on the sage plate: this placement is the inversion
  // of the contact disc, not the same treatment retinted.
  assert.match(plate, /surface="light"/);
  assert.doesNotMatch(plate, /surface="dark"/);

  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");
  assert.match(
    styles,
    /\.story-profile__portrait--emblem \.story-profile__portrait-poster\s*\{\s*opacity:\s*0/,
  );
  // Poster and emblem must be declared as one box, so the mark cannot jump.
  assert.match(
    styles,
    /\.story-profile__portrait > \.story-profile__portrait-poster,\s*\n\.story-profile__portrait > \.story-profile__portrait-emblem\s*\{/,
  );
  // The exchange is a dissolve in place, so the mark is never absent from the
  // plate. The emblem used to be held back by the poster's whole fade — right
  // when the poster was a CC letterform and two marks would have overlapped,
  // wrong once both sides draw the same mark, where the pause showed as the mark
  // blinking out and returning half a second later.
  const arrival = styles.match(
    /\.story-profile__portrait--emblem \.story-profile__portrait-emblem \{([\s\S]*?)\n\}/,
  );
  assert.ok(arrival, "the emblem's arrival must be declared");
  assert.match(arrival[1], /opacity:\s*1/);
  assert.doesNotMatch(arrival[1], /transition-delay/);
  // Both halves of the dissolve run at one duration and one easing, so the ink
  // the poster gives up is the ink the model takes on.
  assert.match(
    styles,
    /\.story-profile__portrait-emblem \{\s*opacity: 0;\s*transition: opacity var\(--duration-reveal\) var\(--ease-emphasized\);/,
  );
  assert.match(
    styles,
    /@media \(max-width: 47\.99rem\)[\s\S]*?\.story-profile__portrait-emblem\s*\{/,
  );
});

test("The plate is built outwards from the mark, and nothing crosses it", () => {
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  const markBox = styles.match(
    /\.story-profile__portrait > \.story-profile__portrait-poster,\n\.story-profile__portrait > \.story-profile__portrait-emblem \{([\s\S]*?)\n\}/,
  );
  assert.ok(markBox, "poster and emblem must share one declared box");
  // The mark is the subject of this plate. It used to hang a third of the way
  // down it, which is what read as a mark that had slipped out of place.
  assert.match(markBox[1], /top:\s*50%/);
  assert.match(markBox[1], /left:\s*50%/);

  const ring = styles.match(/\n\.story-profile__portrait i \{([\s\S]*?)\n\}/);
  assert.ok(ring, "the plate's rings must be declared");
  // Concentric with the mark rather than laid across it: the pair of hairlines
  // this replaced ran through the mark at the width the mark itself needed.
  assert.match(ring[1], /top:\s*50%/);
  assert.match(ring[1], /left:\s*50%/);
  assert.match(ring[1], /border-radius:\s*50%/);
  assert.doesNotMatch(ring[1], /height:\s*1px/);
  // Behind the mark, so the well's tint cannot wash over it.
  assert.match(ring[1], /z-index:\s*0/);

  // The decorative circle that the plate's bottom-right corner cropped is gone.
  assert.doesNotMatch(styles, /\.story-profile__portrait::(?:before|after)/);

  // Each caption carries its own rule, which is what hands the mark the field
  // between them.
  assert.match(styles, /\.story-profile__portrait > span \{[\s\S]*?border-bottom:/);
  assert.match(styles, /\.story-profile__portrait small \{[\s\S]*?border-top:/);

  // Narrow: a square plate, because a 16:10 one left no field to centre in, and
  // one ring, because two would have crossed the caption rules to fit.
  assert.match(
    styles,
    /@media \(max-width: 47\.99rem\)[\s\S]*?\.story-profile__portrait \{[\s\S]*?aspect-ratio:\s*1;/,
  );
  assert.match(styles, /\.story-profile__portrait i:first-of-type \{\s*display:\s*none;/);
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
