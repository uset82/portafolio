import assert from "node:assert/strict";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { SupportRoom } from "@/components/support-room";
import { CONTRIBUTABLE_REPOS, TIP, resolveTipUrl } from "@/content/support";

test("only explicitly licensed repositories are offered for contribution", () => {
  assert.ok(CONTRIBUTABLE_REPOS.length > 0);
  for (const repo of CONTRIBUTABLE_REPOS) {
    assert.equal(repo.license, "MIT", `${repo.name} is offered without an open-source licence`);
    assert.match(repo.repository, /^https:\/\/github\.com\/uset82\//);
    assert.match(repo.issuesUrl, /^https:\/\/github\.com\/uset82\/.+\/issues$/);
  }
});

test("no tip destination is invented when none is configured", () => {
  const previous = process.env[TIP.envVar];

  delete process.env[TIP.envVar];
  assert.equal(resolveTipUrl(), null);

  process.env[TIP.envVar] = "   ";
  assert.equal(resolveTipUrl(), null, "whitespace is not a destination");

  process.env[TIP.envVar] = "https://buymeacoffee.com/example";
  assert.equal(resolveTipUrl(), "https://buymeacoffee.com/example");

  if (previous === undefined) delete process.env[TIP.envVar];
  else process.env[TIP.envVar] = previous;
});

test("the tip card is absent until a destination exists", () => {
  const withoutTip = renderToStaticMarkup(createElement(SupportRoom, { tipUrl: null }));

  assert.match(withoutTip, /<main id="main-content" class="support-room">/);
  assert.doesNotMatch(withoutTip, /buymeacoffee/i);
  assert.doesNotMatch(withoutTip, /support-room__tip/);
  assert.match(withoutTip, /repositories are open to contribution today/);

  const withTip = renderToStaticMarkup(
    createElement(SupportRoom, { tipUrl: "https://buymeacoffee.com/example" }),
  );

  assert.match(withTip, /href="https:\/\/buymeacoffee\.com\/example"/);
  assert.match(withTip, /Buy me a coffee on Buy Me a Coffee/);
});

test("the licensing gap is stated rather than hidden", () => {
  const markup = renderToStaticMarkup(createElement(SupportRoom, { tipUrl: null }));

  assert.match(markup, /37 of my 42 own repositories still have no licence file/);
  assert.match(markup, /all rights reserved/);
});

test("every outbound repository link is safe to open", () => {
  const markup = renderToStaticMarkup(createElement(SupportRoom, { tipUrl: null }));
  const targets = markup.match(/<a[^>]*target="_blank"[^>]*>/g) ?? [];

  assert.ok(targets.length > 0);
  for (const anchor of targets) {
    assert.match(anchor, /rel="noreferrer"/, `missing rel on ${anchor}`);
  }
});

test("the hero counts only the ways the page actually offers", () => {
  const withoutTip = renderToStaticMarkup(createElement(SupportRoom, { tipUrl: null }));
  const withTip = renderToStaticMarkup(
    createElement(SupportRoom, { tipUrl: "https://buymeacoffee.com/example" }),
  );

  // Without a destination the page must not advertise a coffee it cannot serve.
  assert.doesNotMatch(withoutTip, /coffee/i);
  assert.match(withoutTip, /One way, entirely optional/);
  assert.match(withoutTip, /There is one way to give something back/);

  // With one configured, both routes are named.
  assert.match(withTip, /Two ways, both optional/);
  assert.match(withTip, /buy me a coffee/i);
});
