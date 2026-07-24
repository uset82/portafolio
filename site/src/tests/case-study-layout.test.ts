import assert from "node:assert/strict";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CaseStudyLayout } from "@/components/case-study-layout";
import { projectSchema } from "@/content/schemas";

const conceptProject = projectSchema.parse({
  id: "project-test-concept",
  slug: "test-concept",
  title: "Concept Record",
  tagline: "An explicitly held system",
  category: "cosmos",
  status: "concept",
  featured: true,
  publication: "hold",
  summary: "A held test record used to protect the case-study publication boundary.",
  conceptStatement:
    "This test record represents a concept whose implementation claims are not yet public.",
  owner: "Carlos Carpio",
  verification: "reference-approved",
  rights: "pending",
  sourceIds: ["approved-main-ui"],
  stack: [],
  links: [],
  media: [],
});

const evidenceProject = projectSchema.parse({
  id: "project-test-evidence",
  slug: "test-evidence",
  title: "Evidence Record",
  tagline: "A schema-complete layout fixture",
  category: "software",
  status: "prototype",
  featured: false,
  publication: "ready",
  summary: "A fictional test fixture that exercises every verified case-study layout region.",
  owner: "Carlos Carpio",
  verification: "verified",
  rights: "owned",
  sourceIds: ["test-source"],
  contribution: "Built the typed presentation fixture used only by the layout contract tests.",
  problem: "The reusable layout needs to preserve an evidence-led reading order across viewports.",
  constraints: ["Only verified fields may render", "Narrow screens keep source order"],
  approach:
    "Render optional media, architecture, demo, outcome, learning, stack, and link regions.",
  outcome: "The static markup exposes each approved hierarchy region in deterministic order.",
  learnings: ["Optional evidence should disappear without leaving an empty decorative card."],
  year: 2026,
  stack: ["Next.js", "TypeScript"],
  links: [
    {
      id: "test-repository",
      label: "Repository fixture",
      href: "https://example.com/repository",
      kind: "repository",
      verification: "verified",
      sourceIds: ["test-source"],
      external: true,
    },
  ],
  media: [
    {
      id: "test-image",
      title: "Layout fixture",
      type: "image",
      src: "/images/observatory-poster.png",
      alt: "A test-only observatory layout fixture",
      width: 1600,
      height: 900,
      decorative: false,
      owner: "Carlos Carpio",
      rights: "owned",
      verification: "verified",
      sourceIds: ["test-source"],
      caption: "Test-only evidence caption",
    },
  ],
});

test("held concepts expose the publication boundary without project claims or links", () => {
  const markup = renderToStaticMarkup(
    createElement(CaseStudyLayout, { project: conceptProject, index: "01", group: "Cosmos" }),
  );

  assert.match(markup, /Evidence field \/ intentionally empty/);
  assert.match(markup, /Public media is still held/);
  assert.match(markup, /Publication boundary/);
  assert.doesNotMatch(markup, /Sources and demonstrations/);
  assert.doesNotMatch(markup, /Repository fixture/);
});

test("held concepts may continue into approved related navigation without publishing evidence", () => {
  const markup = renderToStaticMarkup(
    createElement(CaseStudyLayout, {
      project: conceptProject,
      relatedWork: createElement("nav", null, "Approved adjacent systems"),
    }),
  );

  assert.match(markup, /Related work/);
  assert.match(markup, /Approved adjacent systems/);
  assert.match(markup, /Publication boundary[\s\S]*Related work/);
  assert.doesNotMatch(markup, /Sources and demonstrations/);
});

test("verified projects render the complete reusable evidence hierarchy and optional slots", () => {
  const markup = renderToStaticMarkup(
    createElement(CaseStudyLayout, {
      project: evidenceProject,
      architectureVisual: createElement("pre", null, "browser → route → content"),
      demo: createElement("p", null, "Interactive demo fixture"),
      relatedWork: createElement("a", { href: "/work/related-fixture" }, "Related fixture"),
    }),
  );

  const headings = [
    "Contribution",
    "Overview",
    "Problem and constraints",
    "Approach",
    "Process, architecture, and demonstration",
    "Outcome",
    "Learning",
    "Stack",
    "Sources and demonstrations",
    "Related work",
  ];
  let priorIndex = -1;

  for (const heading of headings) {
    const currentIndex = markup.indexOf(`>${heading}<`);
    assert.ok(currentIndex > priorIndex, `${heading} should follow the prior hierarchy region`);
    priorIndex = currentIndex;
  }

  assert.match(markup, /alt="A test-only observatory layout fixture"/);
  assert.match(markup, /browser → route → content/);
  assert.match(markup, /Interactive demo fixture/);
  assert.match(markup, /Repository fixture/);
  assert.match(markup, /target="_blank"/);
  assert.match(markup, /Related fixture/);
});
