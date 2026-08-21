import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { LaboratoryIndex } from "@/components/laboratory-index";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema, type LaboratoryConcept, type Project } from "@/content/schemas";

const siteContent = siteContentSchema.parse(rawSiteContent);

function getFutureEnergy(): Extract<Project, { status: "concept" | "preparation" }> {
  const project = siteContent.projects.find((candidate) => candidate.slug === "future-energy");
  assert.ok(project && "conceptStatement" in project);
  return project;
}

function getElectronicsConcept(): Extract<LaboratoryConcept, { artifactId: "electronics-ai" }> {
  const concept = siteContent.laboratoryConcepts.find(
    (candidate): candidate is Extract<LaboratoryConcept, { artifactId: "electronics-ai" }> =>
      candidate.artifactId === "electronics-ai",
  );
  assert.ok(concept);
  return concept;
}

function getDroneConcept(): Extract<LaboratoryConcept, { artifactId: "drone" }> {
  const concept = siteContent.laboratoryConcepts.find(
    (candidate): candidate is Extract<LaboratoryConcept, { artifactId: "drone" }> =>
      candidate.artifactId === "drone",
  );
  assert.ok(concept);
  return concept;
}

test("Laboratory exposes three bounded concepts without claiming working hardware, live AI, or flight", () => {
  assert.equal(siteContent.laboratoryConcepts.length, 2);
  assert.equal(
    siteContentSchema.safeParse({
      ...rawSiteContent,
      laboratoryConcepts: [
        rawSiteContent.laboratoryConcepts[0],
        rawSiteContent.laboratoryConcepts[0],
      ],
    }).success,
    false,
  );
  const markup = renderToStaticMarkup(
    createElement(LaboratoryIndex, {
      futureEnergy: getFutureEnergy(),
      electronicsConcept: getElectronicsConcept(),
      droneConcept: getDroneConcept(),
    }),
  );

  assert.match(markup, /<main id="main-content" class="laboratory-index">/);
  assert.match(markup, /Experiments where software meets matter\./);
  assert.match(markup, /Evidence boundary active/);
  assert.equal((markup.match(/class="laboratory-index__entry /g) ?? []).length, 3);
  assert.match(markup, />Future Energy<\/h3>/);
  assert.match(markup, />Electronics \/ AI<\/h3>/);
  assert.match(markup, />Aerial systems<\/h3>/);
  assert.equal((markup.match(/Concept only/g) ?? []).length, 2);
  assert.match(markup, /visual and navigational Laboratory concept/);
  assert.match(
    markup,
    /not a functioning computer, proprietary board, trained model, or live system/,
  );
  assert.match(markup, /No hardware performance, AI inference, live data/);
  assert.match(markup, /not a functioning aircraft or autonomous system/);
  assert.match(markup, /No flight performance, autonomous operation, working flight controller/);
  assert.equal((markup.match(/<dt>/g) ?? []).length, 4);
  assert.match(markup, /href="\/work\/future-energy"/);
  assert.match(markup, /href="\/work"/);
  assert.match(markup, /href="\/contact"/);
  assert.doesNotMatch(markup, /<(?:img|picture|video|audio|iframe|canvas|form|button)\b/);
  assert.doesNotMatch(
    markup,
    /(?:working prototype|production-ready|measured output|live telemetry|autonomous flight)/i,
  );
});

test("Laboratory keeps a cardless responsive workbench with touch and reduced-motion safeguards", () => {
  const page = readFileSync(path.join(process.cwd(), "src/app/(en)/laboratory/page.tsx"), "utf8");
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
