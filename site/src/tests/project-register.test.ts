import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ProjectRegister } from "@/components/project-register";
import { GITHUB_REGISTER, GITHUB_REGISTER_META } from "@/content/github-register";

const PRIVATE_REPOSITORY_NAMES = [
  "brain-private",
  "marcoloco",
  "ecco8-circular-luxe",
  "rentme",
  "ask-bank-ai",
  "masterHVL",
  "diagram-pixel-perfect-clone",
  "tragatelo-food-facts",
] as const;

test("project register renders every public GitHub repository as an ordered, linkable row", () => {
  const markup = renderToStaticMarkup(createElement(ProjectRegister));
  const titles = GITHUB_REGISTER.map((repository) => repository.title);
  const titlePositions = titles.map((title) => markup.indexOf(`>${title}<`));

  assert.match(markup, /<main id="main-content" class="work-index">/);
  assert.match(
    markup,
    /<nav class="project-register project-register--github" aria-label="Project register">/,
  );
  assert.equal(GITHUB_REGISTER_META.count, 62);
  assert.equal(GITHUB_REGISTER.length, 62);
  assert.equal((markup.match(/class="project-register__row"/g) ?? []).length, 62);
  assert.deepEqual(
    titlePositions,
    [...titlePositions].sort((left, right) => left - right),
  );

  for (const repository of GITHUB_REGISTER) {
    assert.equal((markup.match(new RegExp(`href="${repository.url}"`, "g")) ?? []).length, 1);
  }

  assert.match(markup, /public repositories/);
  assert.match(markup, /The public GitHub register/);
  assert.match(markup, /ASTROEA/);
  assert.match(markup, /Pináculo/);
  assert.match(markup, /StrudelAI/);
  assert.match(markup, /thedelegator/);
  assert.match(markup, /href="\/cosmos"/);
  assert.doesNotMatch(markup, /Observatory concepts|Open concept/);
  assert.doesNotMatch(markup, /href="\/work\/future-energy"/);
  for (const name of PRIVATE_REPOSITORY_NAMES) {
    assert.doesNotMatch(markup, new RegExp(name));
  }
  assert.doesNotMatch(markup, /<(?:img|video|audio|iframe|button|form|input)\b/);
  assert.doesNotMatch(markup, /(?:mailto:)/);
});

test("project register is readable without animation and keeps focus, touch, and mobile contracts", () => {
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(styles, /\.project-register__row:where\(:hover, :focus-within\)/);
  assert.match(
    styles,
    /\.project-register__link\s*\{[\s\S]*?min-height:\s*var\(--control-height\)/,
  );
  assert.match(styles, /\.project-register__link:active/);
  assert.match(styles, /@media \(max-width: 63\.99rem\)[\s\S]*?\.project-register__row/);
  assert.match(styles, /@media \(max-width: 39\.99rem\)[\s\S]*?\.project-register__link/);
  assert.doesNotMatch(
    styles,
    /\.project-register(?:__row|__identity|__evidence|__link)?\s*\{[^}]*animation:/,
  );
});
