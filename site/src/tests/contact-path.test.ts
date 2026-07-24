import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ContactPath } from "@/components/contact-path";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";

test("Contact exposes one verified public profile without inventing a direct contact channel", () => {
  const content = siteContentSchema.parse(rawSiteContent).metadata.footer;
  const markup = renderToStaticMarkup(createElement(ContactPath, { content }));

  assert.match(markup, /<main id="main-content" class="contact-path">/);
  assert.match(markup, /Let’s turn a difficult idea into a working system\./);
  assert.match(markup, /Public contact method pending/);
  assert.match(markup, /One verified profile\. No hidden inbox\./);
  assert.match(markup, /href="https:\/\/github\.com\/uset82"/);
  assert.equal((markup.match(/href="https:\/\/github\.com\/uset82"/g) ?? []).length, 1);
  assert.match(markup, /not as a response-time, availability, employment, or booking promise/);
  assert.equal((markup.match(/<dt>/g) ?? []).length, 4);
  assert.match(markup, /Public email/);
  assert.match(markup, /Not published/);
  assert.match(markup, /href="\/work"/);
  assert.match(markup, /href="\/story"/);
  assert.doesNotMatch(markup, /<(?:form|input|textarea|select|button|address)\b/);
  assert.doesNotMatch(markup, /(?:mailto:|tel:|street address|phone number)/i);
});

test("Contact keeps a cardless responsive hierarchy with touch and reduced-motion safeguards", () => {
  const page = readFileSync(path.join(process.cwd(), "src/app/contact/page.tsx"), "utf8");
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(page, /<ContactPath/);
  assert.match(styles, /\.contact-path__hero:focus-within \.contact-path__signal/);
  assert.match(styles, /\.contact-path__hero:hover \.contact-path__signal/);
  assert.match(styles, /\.contact-path__privacy dl > div\s*\{[\s\S]*?min-height:\s*5\.25rem/);
  assert.match(styles, /@media \(max-width: 47\.99rem\)[\s\S]*?\.contact-path__hero/);
  assert.match(styles, /\.contact-path__continuation \.ui-action\s*\{[\s\S]*?width:\s*100%/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(page, /PageIntro|RecoveryState/);
});
