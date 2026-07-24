import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ProjectRegister } from "@/components/project-register";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";

const content = siteContentSchema.parse(rawSiteContent);

test("project register renders every validated project as an ordered, linkable concept", () => {
  const markup = renderToStaticMarkup(
    createElement(ProjectRegister, { projects: content.projects }),
  );
  const titles = content.projects.map((project) => project.title);
  const titlePositions = titles.map((title) => markup.indexOf(title));

  assert.match(markup, /<main id="main-content" class="work-index">/);
  assert.match(markup, /<nav class="project-register" aria-label="Project register">/);
  assert.equal(
    (markup.match(/class="project-register__row"/g) ?? []).length,
    content.projects.length,
  );
  assert.deepEqual(
    titlePositions,
    [...titlePositions].sort((left, right) => left - right),
  );

  for (const project of content.projects) {
    assert.equal((markup.match(new RegExp(`href="/work/${project.slug}"`, "g")) ?? []).length, 1);
    assert.match(markup, new RegExp(project.presentation?.group ?? "Work"));
    assert.match(markup, new RegExp(project.category, "i"));
  }

  assert.equal((markup.match(/Concept/g) ?? []).length >= content.projects.length, true);
  assert.match(markup, /no shipped result, ownership claim, or outcome is implied/i);
  assert.doesNotMatch(markup, /<(?:img|video|audio|iframe|button|form|input)\b/);
  assert.doesNotMatch(markup, /(?:mailto:|https?:\/\/)/);
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
