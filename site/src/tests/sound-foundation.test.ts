import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { SoundFoundation } from "@/components/sound-foundation";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";

test("Sound publishes an honest mute-first format and approval record without fake media", () => {
  const content = siteContentSchema.parse(rawSiteContent).metadata.mediaTeaser;
  const markup = renderToStaticMarkup(createElement(SoundFoundation, { content }));

  assert.match(markup, /<main id="main-content" class="sound-foundation">/);
  assert.match(markup, /Music, harmonic instruments, and responsive systems\./);
  assert.match(markup, /Awaiting approved sources/);
  assert.equal((markup.match(/Format in preparation/g) ?? []).length, 2);
  assert.match(markup, />Music<\/h3>/);
  assert.match(markup, />Moving image<\/h3>/);
  assert.equal((markup.match(/<dt>/g) ?? []).length, 4);
  assert.match(markup, /Source and rights/);
  assert.match(markup, /Accessible context/);
  assert.match(markup, /Mute-first/);
  assert.match(markup, /Consent first/);
  assert.match(markup, /No track catalog, video, autoplay, waveform, analyser, embed/);
  assert.match(markup, /href="\/work"/);
  assert.match(markup, /href="\/contact"/);
  assert.doesNotMatch(markup, /<(?:audio|video|iframe|img|picture|canvas|form|button)\b/);
  assert.doesNotMatch(markup, /(?:soundcloud|spotify|youtube|vimeo)\.com/i);
});

test("Sound keeps a cardless responsive score with touch and reduced-motion safeguards", () => {
  const page = readFileSync(path.join(process.cwd(), "src/app/sound/page.tsx"), "utf8");
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(page, /<SoundFoundation/);
  assert.match(styles, /\.sound-foundation__hero:focus-within \.sound-foundation__instrument/);
  assert.match(styles, /\.sound-foundation__hero:hover \.sound-foundation__instrument/);
  assert.match(styles, /\.sound-foundation__formats li\s*\{[\s\S]*?min-height:\s*8\.5rem/);
  assert.match(styles, /@media \(max-width: 47\.99rem\)[\s\S]*?\.sound-foundation__hero/);
  assert.match(styles, /\.sound-foundation__boundary nav \.ui-action\s*\{[\s\S]*?width:\s*100%/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(page, /PageIntro|RecoveryState|MediaReadiness/);
});
