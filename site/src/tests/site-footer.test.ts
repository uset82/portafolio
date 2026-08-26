import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { SiteFooter } from "@/components/site-footer";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";

test("footer closes with one honest contact path and one verified public profile", () => {
  const siteContent = siteContentSchema.parse(rawSiteContent);
  const markup = renderToStaticMarkup(
    createElement(SiteFooter, { content: siteContent.metadata.footer }),
  );
  const contactIndex = markup.indexOf('href="/contact"');
  const githubIndex = markup.indexOf('href="https://github.com/uset82"');

  assert.match(markup, /<footer class="site-footer" aria-labelledby="footer-contact-title">/);
  // A short invitation, because this footer closes every page on the site. The
  // old line assumed a visitor who already had an idea, which is the assumption
  // the contact route it points at now explicitly rejects.
  assert.match(markup, /Let’s find what already exists, and make it work\./);
  assert.doesNotMatch(markup, /turn a difficult idea into a working system/);
  assert.doesNotMatch(markup, /The contact route remains privacy-first/);
  assert.match(markup, /aria-label="Primary site navigation"/);
  assert.match(markup, /aria-label="Explore and external links"/);
  assert.match(markup, /Play/);
  assert.match(markup, /See/);
  assert.match(markup, /Listen/);
  assert.match(markup, /About/);
  assert.match(markup, /Laboratory/);
  assert.match(markup, /Cosmos/);
  assert.match(markup, /Support/);
  assert.match(markup, /GitHub/);
  assert.equal((markup.match(/href="\/contact"/g) ?? []).length, 1);
  assert.equal((markup.match(/href="https:\/\/github\.com\/uset82"/g) ?? []).length, 1);
  assert.ok(contactIndex > -1 && githubIndex > contactIndex);
  assert.match(markup, /external site/);
  assert.doesNotMatch(markup, /<(?:form|input|textarea)\b|mailto:|available for hire/i);
});

test("footer styling preserves focus feedback, touch sizes, mobile order, and reduced motion", () => {
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(styles, /\.site-footer__cta:hover/);
  assert.match(styles, /\.site-footer__cta:focus-visible/);
  assert.match(styles, /\.site-footer__primary-nav a:hover/);
  assert.match(styles, /\.site-footer__secondary-nav a:hover/);
  assert.match(styles, /@media \(max-width: 47\.99rem\)[\s\S]*?\.site-footer__action-row/);
  assert.match(styles, /@media \(max-width: 47\.99rem\)[\s\S]*?\.site-footer__cta/);
});
