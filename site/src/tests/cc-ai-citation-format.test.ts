import assert from "node:assert/strict";
import test from "node:test";

import { stripSourceCitations } from "@/lib/ai/cc-ai-service";

const SOURCES = ["profile-carlos-carpio", "approved-public-profile", "github-uset82"];

test("citation markers are removed in every delimiter the models emit", () => {
  const cases: Array<[string, string]> = [
    // Plain square brackets, as the system prompt asks for.
    ["Carlos is an engineer [profile-carlos-carpio].", "Carlos is an engineer."],
    // The full-width form that reached the live panel.
    ["Hello! How can I help you?【source-id:profile-carlos-carpio】", "Hello! How can I help you?"],
    // Parenthesised and labelled variants.
    ["He works across AI (source: approved-public-profile).", "He works across AI."],
    ["See his code [source-id: github-uset82]", "See his code"],
    // Several ids in one marker.
    [
      "Carlos explores AI [profile-carlos-carpio, github-uset82] and energy.",
      "Carlos explores AI and energy.",
    ],
    // Repeated citations across sentences.
    ["One [profile-carlos-carpio]. Two [approved-public-profile].", "One. Two."],
  ];

  for (const [input, expected] of cases) {
    assert.equal(stripSourceCitations(input, SOURCES), expected);
  }
});

test("brackets that are not approved citations are preserved", () => {
  const keep = [
    "The status is [concept] until evidence is published.",
    "Carlos uses TypeScript [strict mode] across the portfolio.",
    "Ranges like [1, 2] stay intact.",
  ];

  for (const text of keep) {
    assert.equal(stripSourceCitations(text, SOURCES), text);
  }
});

test("stripping never empties an answer or leaves stray punctuation gaps", () => {
  assert.equal(stripSourceCitations("Answer.", SOURCES), "Answer.");
  assert.equal(stripSourceCitations("Answer.", []), "Answer.");
  // A marker directly before punctuation must not leave a floating space.
  assert.equal(
    stripSourceCitations("Carlos builds systems [github-uset82], and writes.", SOURCES),
    "Carlos builds systems, and writes.",
  );
});
