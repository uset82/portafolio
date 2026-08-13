import assert from "node:assert/strict";
import test from "node:test";

import {
  guideVisitorPortfolio,
  inferPortfolioLanes,
  isVisitorPortfolioGuide,
} from "@/lib/ai/cc-ai-portfolio-guide";
import { repositoryAuditSchema, type RepositoryAudit } from "@/ana/repositories/schemas";

const audit = (
  overrides: Partial<RepositoryAudit> & Pick<RepositoryAudit, "repository">,
): RepositoryAudit =>
  repositoryAuditSchema.parse({
    hasBackend: false,
    hasAPI: false,
    hasDatabase: false,
    hasLLM: false,
    domain: ["electronics"],
    capabilities: [],
    status: "prototype",
    agentPotential: "low",
    recommendedType: "knowledge",
    visibility: "public",
    enabled: false,
    contentsInspected: true,
    sizeKb: 12,
    manifestFiles: [],
    ...overrides,
  });

const audits = (): RepositoryAudit[] => [
  audit({
    repository: "uset82/StrudelAI",
    domain: ["music"],
    recommendedType: "agent",
    hasLLM: true,
    capabilities: ["live-coding"],
    description: "Live coding music system",
  }),
  audit({
    repository: "uset82/LyriGenie",
    domain: ["music"],
    recommendedType: "agent",
    hasLLM: true,
    description: "Lyric viewing across music platforms",
  }),
  audit({
    repository: "uset82/3Doodle",
    domain: ["3d"],
    recommendedType: "knowledge",
    hasLLM: true,
    description: "Sketch to 3D converter",
  }),
  audit({
    repository: "uset82/thedelegator",
    domain: ["ai-tooling"],
    description: "Coordination-free parallelism for AI coding agents",
  }),
  audit({
    repository: "uset82/TRAFFICLIGHT",
    domain: ["electronics", "embedded"],
    capabilities: ["traffic-light"],
    recommendedType: "tool",
    description: "Traffic-light state machine",
  }),
];

const qualifier = guideVisitorPortfolio({
  message: "Which projects best show Carlos's AI work?",
  audits: audits(),
})!.answer;

test("broad AI questions ask for a preference instead of listing repositories", () => {
  const guided = guideVisitorPortfolio({
    message: "Which projects best show Carlos's AI work?",
    audits: audits(),
  });
  assert.ok(guided);
  assert.equal(isVisitorPortfolioGuide(guided.answer), true);
  assert.match(guided.answer, /Sound/);
  assert.match(guided.answer, /Form/);
  assert.match(guided.answer, /Orchestration/);
  assert.equal(guided.hits.length, 0);
  assert.doesNotMatch(guided.answer, /MATCHES|SOURCES|uset82\/|https:\/\/github.com/i);
});

test("a sound preference recommends one music project and withholds the GitHub list", () => {
  const guided = guideVisitorPortfolio({
    message: "sound",
    history: [
      { role: "user", content: "Which projects best show Carlos's AI work?" },
      { role: "assistant", content: qualifier },
    ],
    audits: audits(),
  });
  assert.ok(guided);
  assert.match(guided.answer, /Start with StrudelAI/);
  assert.match(guided.answer, /open for testing/);
  assert.doesNotMatch(guided.answer, /LyriGenie|3Doodle|MATCHES|uset82\//);
  assert.equal(guided.hits.map((hit) => hit.repository).join(), "uset82/StrudelAI");
});

test("asking for the repo after a recommendation returns one public GitHub link", () => {
  const recommendation = guideVisitorPortfolio({
    message: "sound",
    history: [
      { role: "user", content: "Which projects best show Carlos's AI work?" },
      { role: "assistant", content: qualifier },
    ],
    audits: audits(),
  })!.answer;

  const guided = guideVisitorPortfolio({
    message: "the github",
    history: [
      { role: "user", content: "sound" },
      { role: "assistant", content: recommendation },
    ],
    audits: audits(),
  });
  assert.ok(guided);
  assert.match(guided.answer, /https:\/\/github.com\/uset82\/StrudelAI/);
  assert.match(guided.answer, /not a case study/);
  assert.doesNotMatch(guided.answer, /MATCHES|LyriGenie/);
});

test("another in the same lane names the next project only", () => {
  const recommendation = guideVisitorPortfolio({
    message: "sound",
    history: [
      { role: "user", content: "Which projects best show Carlos's AI work?" },
      { role: "assistant", content: qualifier },
    ],
    audits: audits(),
  })!.answer;

  const guided = guideVisitorPortfolio({
    message: "another",
    history: [
      { role: "user", content: "sound" },
      { role: "assistant", content: recommendation },
    ],
    audits: audits(),
  });
  assert.ok(guided);
  assert.match(guided.answer, /LyriGenie/);
  assert.doesNotMatch(guided.answer, /StrudelAI|MATCHES|https:\/\/github.com/);
});

test("insisting on a catalog still caps the list at three names", () => {
  const guided = guideVisitorPortfolio({
    message: "just list them all",
    history: [
      { role: "user", content: "Which projects best show Carlos's AI work?" },
      { role: "assistant", content: qualifier },
    ],
    audits: audits(),
  });
  assert.ok(guided);
  assert.match(guided.answer, /StrudelAI/);
  assert.match(guided.answer, /3Doodle/);
  assert.match(guided.answer, /thedelegator/);
  assert.doesNotMatch(guided.answer, /TRAFFICLIGHT|MATCHES|https:\/\/github.com/);
  assert.equal(guided.hits.length, 3);
});

test("a specific embedded question recommends one project without a catalog", () => {
  const guided = guideVisitorPortfolio({
    message: "What has Carlos built involving embedded systems?",
    audits: audits(),
  });
  assert.ok(guided);
  assert.match(guided.answer, /TRAFFICLIGHT/);
  assert.doesNotMatch(guided.answer, /StrudelAI|MATCHES|uset82\//);
});

test("biography questions stay out of the visitor guide", () => {
  assert.equal(
    guideVisitorPortfolio({
      message: "Where did you work on your CV?",
      audits: audits(),
    }),
    null,
  );
});

test("sound is a single lane and AI alone is not", () => {
  assert.deepEqual(inferPortfolioLanes("sound please"), ["sound"]);
  assert.deepEqual(inferPortfolioLanes("Which projects best show Carlos's AI work?"), []);
});
