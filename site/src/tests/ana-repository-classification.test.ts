import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  assertPhase2Classification,
  phase2Classifications,
  phase2SpecialistAgents,
  phase2Tools,
  toPhase2OverridesFile,
} from "@/ana/repositories/classification-policy";
import {
  loadEffectiveRepositoryAudits,
  parseRepositoryOverrides,
} from "@/ana/repositories/registry";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const generatedPath = path.join(repoRoot, "brain/repositories/registry.generated.json");
const overridesPath = path.join(repoRoot, "brain/repositories/registry.overrides.json");

test("Phase 2 policy partitions every public repository into one runtime type", () => {
  const types = Object.values(phase2Classifications).map((entry) => entry.recommendedType);
  assert.deepEqual(
    phase2SpecialistAgents,
    [
      "uset82/ASTROEA",
      "uset82/Thesis-Writer-Kit",
      "uset82/mentora",
      "uset82/pinaculo",
      "uset82/smartapply-app",
      "uset82/StrudelAI",
    ].sort((left, right) => left.localeCompare(right)),
  );
  assert.equal(phase2Tools.includes("uset82/qr-code-generator"), true);
  assert.equal(phase2Tools.includes("uset82/StillasCalculator"), true);
  assert.equal(phase2Tools.includes("uset82/TRAFFICLIGHT"), true);
  assert.equal(types.filter((type) => type === "agent").length, 6);
  assert.equal(Object.keys(phase2Classifications).length, 62);
});

test("committed overrides match the Phase 2 policy and never enable a repository", async () => {
  const committed = parseRepositoryOverrides(
    JSON.parse(await readFile(overridesPath, "utf8")) as unknown,
  );
  const expected = toPhase2OverridesFile();
  assert.deepEqual(committed, expected);
  assert.equal(
    Object.values(committed.overrides).every((override) => override.enabled === false),
    true,
  );
});

test("effective classification assigns approved types without activating specialists", async () => {
  const effective = await loadEffectiveRepositoryAudits({ generatedPath, overridesPath });
  assertPhase2Classification(effective);

  const byName = new Map(effective.map((audit) => [audit.repository, audit]));
  assert.equal(byName.get("uset82/ASTROEA")?.recommendedType, "agent");
  assert.deepEqual(byName.get("uset82/ASTROEA")?.domain, ["astrology"]);
  assert.equal(byName.get("uset82/pinaculo")?.recommendedType, "agent");
  assert.equal(byName.get("uset82/StrudelAI")?.recommendedType, "agent");
  assert.equal(byName.get("uset82/mentora")?.recommendedType, "agent");
  assert.equal(byName.get("uset82/mentora")?.status, "fork");
  assert.equal(byName.get("uset82/smartapply-app")?.recommendedType, "agent");
  assert.equal(byName.get("uset82/Thesis-Writer-Kit")?.recommendedType, "agent");
  assert.equal(byName.get("uset82/qr-code-generator")?.recommendedType, "tool");
  assert.equal(byName.get("uset82/StillasCalculator")?.recommendedType, "tool");
  assert.equal(byName.get("uset82/TRAFFICLIGHT")?.recommendedType, "tool");
  assert.equal(byName.get("uset82/MicrocontrollerPiano")?.recommendedType, "tool");
  assert.equal(
    byName.get("uset82/hvl2025-microcontroller-assignment3")?.recommendedType,
    "knowledge",
  );
  assert.equal(byName.get("uset82/Tetris")?.recommendedType, "knowledge");
  assert.equal(byName.get("uset82/Paper2Video")?.recommendedType, "disabled");
  assert.equal(byName.get("uset82/FreeCAD")?.recommendedType, "disabled");
  assert.equal(byName.get("uset82/portafolio")?.recommendedType, "knowledge");
  assert.deepEqual(byName.get("uset82/portafolio")?.domain, ["portfolio"]);
  assert.equal(
    effective.every((audit) => audit.enabled === false && audit.visibility === "public"),
    true,
  );
});
