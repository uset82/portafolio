import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CaseStudyJourney, getProjectJourney } from "@/components/case-study-journey";
import type { SelectedSystem } from "@/content/site";

const systems: SelectedSystem[] = [
  {
    index: "01",
    slug: "astraea",
    title: "ASTRAEA",
    descriptor: "Celestial intelligence",
    group: "Cosmos",
    status: "concept",
  },
  {
    index: "02",
    slug: "pinaculo",
    title: "PINÁCULO",
    descriptor: "Numerological engine",
    group: "Cosmos",
    status: "concept",
  },
  {
    index: "03",
    slug: "future-energy",
    title: "Future Energy",
    descriptor: "Adaptive flow systems",
    group: "Laboratory",
    status: "concept",
  },
];

test("project journey follows the approved linear system order without wrapping", () => {
  assert.deepEqual(getProjectJourney(systems, "astraea"), {
    previous: null,
    next: systems[1],
  });
  assert.deepEqual(getProjectJourney(systems, "pinaculo"), {
    previous: systems[0],
    next: systems[2],
  });
  assert.deepEqual(getProjectJourney(systems, "future-energy"), {
    previous: systems[1],
    next: null,
  });
  assert.equal(getProjectJourney(systems, "missing"), null);
});

test("rendered journey names adjacent systems, omits the current route, and keeps a Work exit", () => {
  const markup = renderToStaticMarkup(
    createElement(CaseStudyJourney, { currentSlug: "pinaculo", systems }),
  );

  assert.match(markup, /aria-label="Related project navigation"/);
  assert.match(markup, /aria-label="Previous system: ASTRAEA"/);
  assert.match(markup, /href="\/work\/astraea"/);
  assert.match(markup, /aria-label="Next system: Future Energy"/);
  assert.match(markup, /href="\/work\/future-energy"/);
  assert.match(markup, /href="\/work"/);
  assert.doesNotMatch(markup, /href="\/work\/pinaculo"/);
  assert.doesNotMatch(markup, /target="_blank"/);
});

test("case-study journey styling preserves focus, reduced motion, touch size, and mobile reflow", () => {
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(styles, /\.case-study-journey__link[^}]*min-height:\s*9\.5rem/);
  assert.match(styles, /\.case-study-journey__link--previous:is\(:hover, :focus-visible\)/);
  assert.match(styles, /\.case-study-journey__link--next:is\(:hover, :focus-visible\)/);
  assert.match(styles, /\.case-study-journey__link[^}]*grid-column:\s*1/);
  assert.match(styles, /\.case-study-journey__exit[^}]*width:\s*100%/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
