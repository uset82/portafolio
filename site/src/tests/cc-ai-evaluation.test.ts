import assert from "node:assert/strict";
import test from "node:test";

import evaluationSetInput from "@/content/cc-ai-evaluation.json";
import publicKnowledgeInput from "@/content/cc-ai-public-knowledge.json";
import { ccAiEvaluationSetSchema, ccAiPublicKnowledgeLedgerSchema } from "@/content/schemas";

test("CACM AI evaluation set covers every required behavior with public-ledger evidence", () => {
  const evaluationSet = ccAiEvaluationSetSchema.parse(evaluationSetInput);
  const knowledgeLedger = ccAiPublicKnowledgeLedgerSchema.parse(publicKnowledgeInput);
  const ledgerFacts = new Set(knowledgeLedger.records.flatMap((record) => record.facts));
  const ledgerSourceIds = new Set(knowledgeLedger.records.flatMap((record) => record.sourceIds));
  const categoryCounts = new Map<string, number>();

  for (const evaluationCase of evaluationSet.cases) {
    categoryCounts.set(
      evaluationCase.category,
      (categoryCounts.get(evaluationCase.category) ?? 0) + 1,
    );
    assert.ok(evaluationCase.expectedFacts.every((fact) => ledgerFacts.has(fact)));
    assert.ok(evaluationCase.requiredSourceIds.every((sourceId) => ledgerSourceIds.has(sourceId)));
  }

  assert.equal(evaluationSet.cases.length, 24);
  assert.deepEqual(Object.fromEntries([...categoryCounts.entries()].sort()), {
    factual: 4,
    multilingual: 4,
    "prompt-injection": 4,
    refusal: 4,
    "source-conflict": 4,
    uncertainty: 4,
  });
  assert.deepEqual(
    new Set(evaluationSet.cases.map((evaluationCase) => evaluationCase.locale)),
    new Set(["en", "es", "no"]),
  );
  assert.equal(evaluationSet.releaseGate.activationAllowed, false);
  assert.equal(evaluationSet.releaseGate.liveModelEvaluationRequired, true);
});

test("CACM AI evaluation schema rejects missing category depth and conflict evidence", () => {
  const parsed = ccAiEvaluationSetSchema.parse(evaluationSetInput);
  const tooFewConflictCases = {
    ...parsed,
    cases: parsed.cases.filter(
      (evaluationCase, index) => evaluationCase.category !== "source-conflict" || index < 22,
    ),
  };
  assert.equal(ccAiEvaluationSetSchema.safeParse(tooFewConflictCases).success, false);

  const missingConflictClaims = {
    ...parsed,
    cases: parsed.cases.map((evaluationCase) =>
      evaluationCase.category === "source-conflict"
        ? { ...evaluationCase, conflictClaims: undefined }
        : evaluationCase,
    ),
  };
  assert.equal(ccAiEvaluationSetSchema.safeParse(missingConflictClaims).success, false);
});
