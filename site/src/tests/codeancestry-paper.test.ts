import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CodeAncestryPaper } from "@/components/codeancestry-paper";
import {
  CODEANCESTRY,
  CODEANCESTRY_HREF,
  type CodeAncestryPaper as Paper,
} from "@/content/codeancestry";
import { CODEANCESTRY_ES } from "@/content/i18n/codeancestry-es";
import { hasTranslation, resolveHref } from "@/lib/i18n";

const english = renderToStaticMarkup(createElement(CodeAncestryPaper));
const spanish = renderToStaticMarkup(createElement(CodeAncestryPaper, { locale: "es" }));

test("the concept paper publishes a proposal and never a running system", () => {
  assert.match(english, /<main id="main-content" class="codeancestry">/);
  assert.equal((english.match(/<h1\b/g) ?? []).length, 1);
  assert.match(english, /Proposal, not a running system/);

  // The four boundary rows are the point of the page: evidence state, system
  // state, adoption, and the provisional name.
  assert.equal((english.match(/class="codeancestry__ledger"/g) ?? []).length, 1);
  assert.equal((english.match(/<dt>\s*<span>/g) ?? []).length, CODEANCESTRY.limits.ledger.length);
  for (const row of CODEANCESTRY.limits.ledger) {
    assert.ok(english.includes(row.value), `the ledger must publish "${row.value}"`);
  }

  // Nothing on the page may read as shipped, adopted, measured, or hosted.
  assert.doesNotMatch(
    english,
    /(?:working prototype|production-ready|live telemetry|now available|in production|our customers|adopted standard)/i,
  );
  assert.doesNotMatch(english, /<(?:img|picture|video|audio|iframe|canvas|form|button|input)\b/);
});

test("every argued section of the paper reaches the page", () => {
  const sections: readonly (keyof Paper)[] = [
    "origin",
    "vocabulary",
    "modes",
    "agent",
    "propagation",
    "architecture",
    "roadmap",
    "questions",
    "limits",
    "close",
  ];

  // One h2 per argued section, and no section quietly dropped from the render.
  assert.equal((english.match(/<h2\b/g) ?? []).length, sections.length);

  for (const entry of [
    ...CODEANCESTRY.vocabulary.entries,
    ...CODEANCESTRY.modes.entries,
    ...CODEANCESTRY.agent.manifest,
    ...CODEANCESTRY.propagation.guardrails,
    ...CODEANCESTRY.architecture.layers,
    ...CODEANCESTRY.roadmap.phases,
    ...CODEANCESTRY.limits.items,
  ]) {
    assert.ok(english.includes(entry.term), `${entry.id} is missing from the page`);
  }

  for (const step of CODEANCESTRY.propagation.pipeline) {
    assert.ok(english.includes(step), `the pipeline step "${step}" is missing`);
  }
  for (const question of CODEANCESTRY.questions.items) {
    assert.ok(english.includes(question.id.toUpperCase()), `${question.id} is missing`);
  }

  // The safety rule the rest of the design depends on has to be legible.
  assert.match(english, /candidate proposal, never an automatic update/);
});

test("the Spanish paper is Spanish, and keeps the same boundary", () => {
  assert.match(spanish, /Propuesta, no un sistema en marcha/);
  assert.match(spanish, /No hay nada funcionando/);
  assert.match(spanish, /Título de trabajo/);

  // Spanish links stay inside Spanish, because both routes exist.
  assert.equal(hasTranslation(CODEANCESTRY_HREF), true);
  assert.equal(resolveHref("es", CODEANCESTRY_HREF), "/es/laboratory/codeancestry");
  assert.match(spanish, /href="\/es\/laboratory"/);
  assert.match(spanish, /href="\/es\/work"/);
  assert.match(spanish, /href="\/es\/contact"/);

  for (const leak of [
    "Concept paper",
    "Working title",
    "Read the concept paper",
    "Back to the Laboratory",
  ]) {
    assert.ok(!spanish.includes(leak), `the Spanish paper still says "${leak}"`);
  }
});

test("both languages carry the same record ids, so neither can drift", () => {
  const ids = (paper: Paper) => [
    ...paper.vocabulary.entries.map((entry) => entry.id),
    ...paper.modes.entries.map((entry) => entry.id),
    ...paper.agent.manifest.map((entry) => entry.id),
    ...paper.propagation.guardrails.map((entry) => entry.id),
    ...paper.propagation.fitness.map((entry) => entry.id),
    ...paper.architecture.layers.map((entry) => entry.id),
    ...paper.roadmap.phases.map((entry) => entry.id),
    ...paper.questions.items.map((item) => item.id),
    ...paper.limits.items.map((entry) => entry.id),
  ];

  assert.deepEqual(ids(CODEANCESTRY_ES), ids(CODEANCESTRY));
  assert.equal(
    CODEANCESTRY_ES.propagation.pipeline.length,
    CODEANCESTRY.propagation.pipeline.length,
  );
  assert.equal(CODEANCESTRY_ES.limits.ledger.length, CODEANCESTRY.limits.ledger.length);
  assert.equal(CODEANCESTRY_ES.origin.paragraphs.length, CODEANCESTRY.origin.paragraphs.length);
});

test("every section hands the grid exactly two children, so nothing wraps under the sticky header", () => {
  // The sections are two-column grids: a sticky header, then one body element.
  // A third child is auto-placed into a second row, which puts it back under
  // the header and overlaps the type — which is exactly what shipped once.
  const sections = english.match(
    /<section class="codeancestry__(?:origin|section)[^"]*"[^>]*>[\s\S]*?<\/section>/g,
  );
  assert.ok(sections);
  assert.equal(sections.length, 9);

  for (const section of sections) {
    const inner = section.replace(/^<section[^>]*>/, "").replace(/<\/section>$/, "");
    let depth = 0;
    let topLevel = 0;
    for (const tag of inner.match(/<\/?[a-z][a-z0-9]*\b[^>]*>/g) ?? []) {
      if (tag.startsWith("</")) {
        depth -= 1;
        continue;
      }
      if (depth === 0) topLevel += 1;
      if (!tag.endsWith("/>") && !/^<(?:br|hr|img|input|meta|link)\b/.test(tag)) depth += 1;
    }
    const name = section.slice(0, section.indexOf(">") + 1);
    assert.equal(topLevel, 2, `${name} has ${topLevel} grid children, expected header + body`);
  }
});

test("the paper route keeps its responsive and reduced-motion path", () => {
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");
  const page = readFileSync(
    path.join(process.cwd(), "src/app/(en)/laboratory/codeancestry/page.tsx"),
    "utf8",
  );

  assert.match(page, /<CodeAncestryPaper/);
  assert.match(styles, /\.codeancestry__hero \{/);
  assert.match(styles, /@media \(max-width: 47\.99rem\)[\s\S]*?\.codeancestry__hero/);
  assert.match(styles, /\.codeancestry__continuation nav \.ui-action\s*\{[\s\S]*?width:\s*100%/);
  assert.match(
    styles,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.codeancestry__lineage-return/,
  );
});
