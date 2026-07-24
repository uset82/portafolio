import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { LaboratoryIndex } from "@/components/laboratory-index";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema, type Project } from "@/content/schemas";

function getFutureEnergy(): Extract<Project, { status: "concept" | "preparation" }> {
  const project = siteContentSchema
    .parse(rawSiteContent)
    .projects.find((candidate) => candidate.slug === "future-energy");
  assert.ok(project && "conceptStatement" in project);
  return project;
}

test("Laboratory exposes two bounded concepts without claiming working hardware or live AI", () => {
  const markup = renderToStaticMarkup(
    createElement(LaboratoryIndex, { futureEnergy: getFutureEnergy() }),
  );

  assert.match(markup, /<main id="main-content" class="laboratory-index">/);
  assert.match(markup, /Experiments where software meets matter\./);
  assert.match(markup, /Evidence boundary active/);
  assert.equal((markup.match(/class="laboratory-index__entry /g) ?? []).length, 2);
  assert.match(markup, />Future Energy<\/h3>/);
  assert.match(markup, />Electronics \/ AI<\/h3>/);
  assert.match(markup, /approved visual and navigational concept only/);
  assert.match(
    markup,
    /not a functioning computer, proprietary board, trained model, or live system/,
  );
  assert.match(markup, /No hardware performance, AI inference, live data/);
  assert.equal((markup.match(/<dt>/g) ?? []).length, 4);
  assert.match(markup, /href="\/work\/future-energy"/);
  assert.match(markup, /href="\/work"/);
  assert.match(markup, /href="\/contact"/);
  assert.doesNotMatch(markup, /<(?:img|picture|video|audio|iframe|canvas|form|button)\b/);
  assert.doesNotMatch(
    markup,
    /(?:working prototype|production-ready|measured output|live telemetry)/i,
  );
});

test("Laboratory keeps a cardless responsive workbench with touch and reduced-motion safeguards", () => {
  const page = readFileSync(path.join(process.cwd(), "src/app/laboratory/page.tsx"), "utf8");
  const styles = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  assert.match(page, /<LaboratoryIndex/);
  assert.match(styles, /\.laboratory-index__hero:focus-within \.laboratory-index__bench/);
  assert.match(styles, /\.laboratory-index__hero:hover \.laboratory-index__bench/);
  assert.match(styles, /\.laboratory-index__entry\s*\{[\s\S]*?min-height:\s*16rem/);
  assert.match(styles, /@media \(max-width: 47\.99rem\)[\s\S]*?\.laboratory-index__hero/);
  assert.match(
    styles,
    /\.laboratory-index__continuation nav \.ui-action\s*\{[\s\S]*?width:\s*100%/,
  );
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(page, /PageIntro|RecoveryState/);
});
