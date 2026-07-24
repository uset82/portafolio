import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { SelectedWork, type SelectedWorkItem } from "@/components/selected-work";

const fixture: SelectedWorkItem[] = [
  {
    id: "strudelai",
    title: "StrudelAI",
    tagline: "AI-assisted live coding for layered music exploration.",
    category: "Sound",
    status: "prototype",
    contribution: "Repository maintainer and documented contributor; no sole-authorship claim.",
    href: "https://github.com/uset82/StrudelAI",
    linkLabel: "View repository",
    visualTone: "sage",
  },
  {
    id: "codex-avatar-studio",
    title: "Codex Avatar Studio",
    tagline: "A local animated IDE assistant with SVG-first fallbacks.",
    category: "Creative tools",
    status: "prototype",
    contribution: "Published from Carlos's account; individual implementation remains unassigned.",
    href: "https://github.com/uset82/avatar-studio",
    linkLabel: "View repository",
    visualTone: "clay",
  },
  {
    id: "ifoundyou-dommedag",
    title: "iFoundYou / Dommedag",
    tagline: "An experimental trusted-circle map and communication study.",
    category: "Software",
    status: "experiment",
    contribution: "Repository owner with all visible commits linked to Carlos's confirmed account.",
    href: "https://github.com/uset82/iFoundYou",
    linkLabel: "View repository",
    visualTone: "water",
  },
  {
    id: "opennemoclaw",
    title: "OpenNemoClaw",
    tagline: "A modular local agent framework with Docker and policy controls.",
    category: "AI systems",
    status: "prototype",
    contribution: "Documented contributor alongside another public contributor.",
    href: "https://github.com/uset82/opennemoclaw",
    linkLabel: "View repository",
    visualTone: "walnut",
  },
  {
    id: "webdesigner",
    title: "WebDesigner",
    tagline: "A Codex plugin for structured design, build, and review workflows.",
    category: "Creative tools",
    status: "maintained",
    contribution: "Named author and developer; bundled third-party material remains attributed.",
    href: "https://github.com/uset82/webdesigner",
    linkLabel: "View repository",
    visualTone: "taupe",
  },
];

test("selected work preserves editorial order and evidence labels without unapproved media", () => {
  const markup = renderToStaticMarkup(
    createElement(SelectedWork, {
      eyebrow: "Selected Work / 02",
      heading: "Five systems across one evolving practice.",
      description: "Verified project summaries with explicit contribution and maturity boundaries.",
      items: fixture,
    }),
  );

  const titlePositions = fixture.map((project) => markup.indexOf(project.title));
  assert.ok(titlePositions.every((position) => position >= 0));
  assert.deepEqual(
    titlePositions,
    [...titlePositions].sort((a, b) => a - b),
  );
  assert.equal((markup.match(/<article /g) ?? []).length, 5);
  assert.equal((markup.match(/Contribution<\/span>/g) ?? []).length, 5);
  assert.equal((markup.match(/class="selected-work__project-link"/g) ?? []).length, 5);
  assert.match(markup, /Prototype/);
  assert.match(markup, /Experiment/);
  assert.match(markup, /Maintained/);
  assert.doesNotMatch(markup, /<(?:img|video|audio|iframe)\b/);
});

test("selected work styles keep actions visible across pointer, keyboard, touch, and narrow layouts", () => {
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(styles, /\.selected-work__project:where\(:hover, :focus-within\)/);
  assert.match(styles, /\.selected-work__project-link:active/);
  assert.match(
    styles,
    /\.selected-work__project-link\s*\{[\s\S]*?min-height:\s*var\(--control-height\)/,
  );
  assert.match(styles, /@media \(max-width: 63\.99rem\)[\s\S]*\.selected-work__project/);
  assert.match(styles, /@media \(max-width: 39\.99rem\)[\s\S]*\.selected-work__project/);
});
