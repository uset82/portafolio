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
  const navigation = siteContent.navigation.map(({ href, label }) => ({ href, label }));
  const markup = renderToStaticMarkup(
    createElement(SiteFooter, { content: siteContent.metadata.footer, navigation }),
  );
  const contactIndex = markup.indexOf('href="/contact"');
  const githubIndex = markup.indexOf('href="https://github.com/uset82"');
  const workIndex = markup.indexOf('href="/work"');

  assert.match(markup, /<footer class="site-footer" aria-labelledby="footer-contact-title">/);
  assert.match(markup, /Public contact method pending/);
  assert.match(markup, /The contact route remains privacy-first/);
  assert.match(markup, /aria-label="Contact and public profile"/);
  assert.match(markup, /aria-label="Footer navigation"/);
  assert.equal((markup.match(/href="\/contact"/g) ?? []).length, 1);
  assert.equal((markup.match(/href="https:\/\/github\.com\/uset82"/g) ?? []).length, 1);
  assert.ok(contactIndex > -1 && githubIndex > contactIndex && workIndex > githubIndex);
  assert.match(markup, /external site/);
  assert.doesNotMatch(markup, /<(?:form|input|textarea)\b|mailto:|available for hire/i);
});

test("footer styling preserves focus feedback, touch sizes, mobile order, and reduced motion", () => {
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(styles, /\.site-footer:focus-within \.site-footer__signal/);
  assert.match(styles, /\.site-footer__routes nav a:focus-visible/);
  assert.match(styles, /\.site-footer__routes nav a[^}]*min-height:\s*4\.5rem/);
  assert.match(styles, /@media \(max-width: 47\.99rem\)[\s\S]*?\.site-footer__actions/);
  assert.match(styles, /@media \(max-width: 47\.99rem\)[\s\S]*?padding-bottom:\s*7rem/);
  assert.match(styles, /\.site-footer__actions \.ui-action[^}]*width:\s*100%/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
