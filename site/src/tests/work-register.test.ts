import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { WorkRegister } from "@/components/work-register";
import { FLAGSHIP_PROJECTS, flagshipThreads } from "@/content/flagship";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";

const concepts = siteContentSchema.parse(rawSiteContent).projects;
const render = () => renderToStaticMarkup(createElement(WorkRegister, { concepts }));

test("built work is presented separately from concepts, and first", () => {
  const markup = render();

  assert.match(markup, /<main id="main-content" class="work-register">/);
  assert.equal((markup.match(/class="work-register__project"/g) ?? []).length, 10);
  assert.equal(concepts.length, 3);
  assert.ok(
    markup.indexOf("work-register__shipped") < markup.indexOf("work-register__concepts"),
    "shipped work must precede concepts",
  );
  assert.match(markup, /Named, designed, and not yet built/);
});

test("every flagship entry states its languages, licence and source", () => {
  const markup = render();

  for (const project of FLAGSHIP_PROJECTS) {
    assert.match(markup, new RegExp(project.name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")));
    assert.match(markup, new RegExp(project.repository.replace(/\//g, "\\/")));
    assert.ok(project.languages.length > 0, `${project.id} must name what it is built with`);
    assert.match(project.lastPushed, /^\d{4}-\d{2}-\d{2}$/);
  }

  // An absent licence is stated, never quietly omitted.
  assert.match(markup, /No licence file yet/);
});

test("a fork is labelled as a fork rather than passed off as original work", () => {
  const mentora = FLAGSHIP_PROJECTS.find((project) => project.id === "mentora");
  assert.ok(mentora);
  assert.equal(mentora.authorship, "fork-primary-developer");
  assert.ok(mentora.contributionNote, "a fork owes an explicit framing note");
  assert.match(mentora.contributionNote, /fork/i);

  const markup = render();
  assert.match(markup, /fork of a college project/i);
  assert.match(markup, /primary developer/i);
});

test("no flagship entry claims a live URL it does not have", () => {
  for (const project of FLAGSHIP_PROJECTS) {
    if (project.liveUrl === undefined) continue;
    assert.match(project.liveUrl, /^https:\/\//);
  }

  const withLive = FLAGSHIP_PROJECTS.filter((project) => project.liveUrl);
  assert.equal(withLive.length, 1, "only StrudelAI has a published live build today");
  assert.equal(withLive[0]?.id, "strudelai");
});

test("the register shows range rather than ten of the same thing", () => {
  const threads = flagshipThreads();
  assert.ok(threads.length >= 7, `expected a broad spread, got ${threads.length} threads`);

  const languages = new Set(FLAGSHIP_PROJECTS.flatMap((project) => project.languages));
  for (const expected of ["Rust", "Dart", "VHDL", "C++", "Python", "TypeScript"]) {
    assert.ok(languages.has(expected), `${expected} should appear somewhere in the register`);
  }
});

test("flagship facts stay traceable to the synced repository records", () => {
  const brainRoot = path.join(process.cwd(), "../brain/github");

  for (const project of FLAGSHIP_PROJECTS) {
    if (project.authorship === "fork-primary-developer") continue;

    const repoName = project.repository.split("/").pop();
    assert.ok(repoName);
    assert.ok(
      existsSync(path.join(brainRoot, repoName, "meta.json")),
      `${project.id} claims facts with no synced record at brain/github/${repoName}`,
    );
  }
});

test("the concept section keeps its evidence boundary", () => {
  const markup = render();

  assert.equal((markup.match(/class="work-register__concept-index"/g) ?? []).length, 3);
  assert.match(markup, /href="\/work\/astraea"/);
  assert.match(markup, /href="\/work\/pinaculo"/);
  assert.match(markup, /href="\/work\/future-energy"/);
  assert.match(markup, /nothing here implies a shipped result/i);
});

test("the work register carries a narrow-viewport path", () => {
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(styles, /@media \(max-width: 47\.99rem\)[\s\S]*?\.work-register__hero/);
  assert.match(styles, /\.work-register__concept-list article\s*\{[\s\S]*?grid-template-columns/);
});
