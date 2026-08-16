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
  const footer = siteContentSchema.parse(rawSiteContent).metadata.footer;
  const markup = renderToStaticMarkup(createElement(ProfileTeaser, { content, footer }));

  assert.match(markup, /aria-labelledby="profile-teaser-title"/);
  assert.match(markup, /Engineer · Inventor · Creative Technologist/);
  // /story publishes the biography in full; the teaser must not reprint it.
  assert.doesNotMatch(markup, /presenting verified work separately from prototypes/);
  assert.match(markup, /written out rather than\s+summarised here/);
  assert.equal((markup.match(/<li>/g) ?? []).length, 3);
  assert.match(markup, /href="\/story"/);
  // The footer directly below carries GitHub and its own CC mark on every page.
  // Duplicating them here read as two closing sections rather than one.
  assert.doesNotMatch(markup, /href="https:\/\/github\.com\/uset82"/);
  assert.doesNotMatch(markup, /profile-teaser__mark/);
  // The decorative monogram is gone: the footer already carries the identity,
  // and two marks one above the other read as two closing sections.
  assert.doesNotMatch(markup, /profile-teaser__mark/);
  // The invitation lives here now, so the close is one section, not two.
  assert.match(markup, /Work together/);
  assert.match(markup, /href="\/contact"/);
  assert.doesNotMatch(markup, /<(?:img|picture)\b/);
  assert.doesNotMatch(markup, /(?:download|\.pdf|mailto:|street address|phone number)/i);
});

test("homepage mounts the profile teaser with responsive, focus, and touch-safe styling", () => {
  const homepage = readFileSync(path.join(process.cwd(), "src/app/page.tsx"), "utf8");
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(
    homepage,
    /<ProfileTeaser content=\{metadata\.profileTeaser\} footer=\{metadata\.footer\} \/>/,
  );
  assert.match(styles, /\.profile-teaser__invite\s*\{/);
  assert.match(styles, /@media \(max-width: 47\.99rem\)[\s\S]*?\.profile-teaser/);
});
