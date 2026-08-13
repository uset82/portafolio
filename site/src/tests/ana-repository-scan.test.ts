import assert from "node:assert/strict";
import test from "node:test";
import { buildAgentRegistry } from "@/ana/registry";
import { parseAgentJsonDocument } from "@/ana/manifest";
import { auditRepository } from "@/ana/repositories/auditor";
import { inferCapabilities, inferDomains } from "@/ana/repositories/classifier";
import {
  activateDiscoveredCapability,
  formatCapabilityDiscoveryNotice,
  proposeCapability,
  reviewProposal,
} from "@/ana/repositories/proposals";
import { scanOwnedRepositories } from "@/ana/repositories/scanner";
import type { DiscoveredRepository, RepositoryInspection } from "@/ana/repositories/github";
import { repositoryAuditSchema, type RepositoryAudit } from "@/ana/repositories/schemas";

const discovered = (
  overrides: Partial<DiscoveredRepository> & Pick<DiscoveredRepository, "name">,
): DiscoveredRepository => ({
  owner: "uset82",
  fullName: `uset82/${overrides.name}`,
  description: null,
  fork: false,
  private: false,
  visibility: "public",
  sizeKb: 800,
  defaultBranch: "main",
  homepage: null,
  topics: [],
  htmlUrl: `https://github.com/uset82/${overrides.name}`,
  language: "TypeScript",
  ...overrides,
});

const inspection = (
  repository: DiscoveredRepository,
  extras: Partial<
    Pick<RepositoryInspection, "readme" | "treePaths" | "manifests" | "contentsInspected">
  > = {},
): RepositoryInspection => ({
  repository,
  contentsInspected: extras.contentsInspected ?? true,
  treePaths: extras.treePaths ?? ["README.md", "src/model.ts"],
  manifests: extras.manifests ?? { "package.json": '{"name":"fixture"}' },
  ...(extras.readme ? { readme: extras.readme } : {}),
});

const knownAudit = (repository: string): RepositoryAudit =>
  repositoryAuditSchema.parse({
    repository,
    hasBackend: false,
    hasAPI: false,
    hasDatabase: false,
    hasLLM: false,
    domain: ["astrology"],
    capabilities: ["natal-chart"],
    status: "prototype",
    agentPotential: "high",
    recommendedType: "agent",
    visibility: "public",
    enabled: false,
    contentsInspected: true,
    sizeKb: 100,
    manifestFiles: ["package.json"],
  });

test("scan finds new owned public repositories and does not treat known ones as new", () => {
  const listed = [
    discovered({ name: "ASTROEA" }),
    discovered({ name: "new-energy-project", description: "Energy modeling sandbox" }),
    discovered({ name: "secret-lab", private: true, visibility: "private" }),
  ];
  const scan = scanOwnedRepositories({
    listed,
    knownAudits: [knownAudit("uset82/ASTROEA")],
    inspections: [
      inspection(listed[1] as DiscoveredRepository, {
        readme: "Energy systems project with simulation, battery analysis, and energy modeling.",
      }),
    ],
  });
  assert.deepEqual(scan.newPublic, ["uset82/new-energy-project"]);
  assert.equal(scan.newPrivateCount, 1);
  assert.deepEqual(scan.missingFromGithub, []);
  assert.equal(
    scan.audits.every((audit) => audit.enabled === false),
    true,
  );
  assert.equal(
    scan.proposals.every((proposal) => proposal.enabled === false),
    true,
  );
});

test("a new energy repository infers capabilities and proposes agent.json", () => {
  const repo = discovered({
    name: "new-energy-project",
    description: "Energy systems sandbox",
  });
  const viewed = inspection(repo, {
    readme: "Energy systems project with simulation, battery analysis, and energy modeling.",
  });
  assert.deepEqual(inferDomains(viewed), ["energy"]);
  assert.deepEqual(inferCapabilities(viewed), [
    "battery-analysis",
    "energy-modeling",
    "simulation",
  ]);
  const audit = auditRepository(viewed);
  assert.equal(audit.recommendedType, "agent");
  assert.equal(audit.enabled, false);
  const proposal = proposeCapability(audit);
  assert.equal(proposal.status, "proposed");
  assert.equal(proposal.enabled, false);
  assert.equal(proposal.suggestedAgent, "Energy Systems Agent");
  assert.deepEqual(proposal.capabilities, ["battery-analysis", "energy-modeling", "simulation"]);
  assert.equal(proposal.document?.schema, "repo2agent/v1");
  assert.equal(proposal.document?.id, "new-energy-project");
  assert.equal(proposal.document?.permissions.includes("write"), false);
  assert.equal(proposal.document?.permissions.includes("external-action"), false);
  const notice = formatCapabilityDiscoveryNotice(proposal);
  assert.match(notice, /NEW CAPABILITY DISCOVERED/);
  assert.match(notice, /new-energy-project/);
  assert.match(notice, /Energy Systems Agent/);
  assert.match(notice, /- simulation/);
  assert.match(notice, /- battery analysis/);
  assert.match(notice, /- energy modeling/);
  assert.match(notice, /\[Approve\]/);
  assert.match(notice, /\[Edit\]/);
  assert.match(notice, /\[Ignore\]/);
});

test("knowledge, empty, and private repositories do not receive proposed agent.json", () => {
  const knowledge = proposeCapability(
    repositoryAuditSchema.parse({
      repository: "uset82/notes",
      hasBackend: false,
      hasAPI: false,
      hasDatabase: false,
      hasLLM: false,
      domain: ["web"],
      capabilities: [],
      status: "prototype",
      agentPotential: "low",
      recommendedType: "knowledge",
      visibility: "public",
      enabled: false,
      contentsInspected: true,
      sizeKb: 40,
      manifestFiles: ["README.md"],
    }),
  );
  const empty = proposeCapability(
    repositoryAuditSchema.parse({
      repository: "uset82/blank",
      hasBackend: false,
      hasAPI: false,
      hasDatabase: false,
      hasLLM: false,
      domain: [],
      capabilities: [],
      status: "empty",
      agentPotential: "none",
      recommendedType: "disabled",
      visibility: "public",
      enabled: false,
      contentsInspected: true,
      sizeKb: 1,
      manifestFiles: [],
    }),
  );
  const privateRepo = proposeCapability(
    repositoryAuditSchema.parse({
      repository: "uset82/secret-lab",
      hasBackend: false,
      hasAPI: false,
      hasDatabase: false,
      hasLLM: false,
      domain: ["energy"],
      capabilities: ["simulation"],
      status: "prototype",
      agentPotential: "high",
      recommendedType: "agent",
      visibility: "private",
      enabled: false,
      contentsInspected: false,
      sizeKb: 200,
      manifestFiles: [],
    }),
  );
  assert.equal(knowledge.skipReason, "knowledge");
  assert.equal(knowledge.document, undefined);
  assert.equal(empty.skipReason, "empty");
  assert.equal(empty.document, undefined);
  assert.equal(privateRepo.skipReason, "private");
  assert.equal(privateRepo.document, undefined);
});

test("human approval is required and never auto-activates unreviewed code", async () => {
  const repo = discovered({ name: "new-energy-project" });
  const proposal = proposeCapability(
    auditRepository(
      inspection(repo, {
        readme: "Energy systems project with simulation, battery analysis, and energy modeling.",
      }),
    ),
  );
  assert.deepEqual(activateDiscoveredCapability(proposal), {
    activated: false,
    reason: "unreviewed-code",
  });

  const ignored = reviewProposal(proposal, { action: "ignore", notes: "Not a specialist yet." });
  assert.equal(ignored.status, "ignored");
  assert.equal(ignored.enabled, false);
  assert.equal(ignored.document, undefined);

  const approved = reviewProposal(proposal, { action: "approve" });
  assert.equal(approved.status, "approved");
  assert.equal(approved.enabled, false);
  assert.deepEqual(activateDiscoveredCapability(approved), {
    activated: false,
    reason: "approval-does-not-enable",
  });

  const edited = reviewProposal(proposal, {
    action: "edit",
    document: parseAgentJsonDocument({
      ...proposal.document,
      name: "Edited Energy Agent",
      capabilities: ["simulation"],
    }),
  });
  assert.equal(edited.status, "edited");
  assert.equal(edited.enabled, false);
  assert.equal(edited.suggestedAgent, "Edited Energy Agent");

  const { registry, skipped } = await buildAgentRegistry({
    documents: [approved.document!],
    audits: [
      repositoryAuditSchema.parse({
        repository: "uset82/new-energy-project",
        hasBackend: false,
        hasAPI: false,
        hasDatabase: false,
        hasLLM: false,
        domain: ["energy"],
        capabilities: ["simulation", "battery-analysis", "energy-modeling"],
        status: "prototype",
        agentPotential: "high",
        recommendedType: "agent",
        visibility: "public",
        enabled: false,
        contentsInspected: true,
        sizeKb: 800,
        manifestFiles: ["package.json"],
      }),
    ],
  });
  assert.deepEqual(registry.list(), []);
  assert.equal(skipped[0]?.reason, "not-enabled");
});

test("scan does not rewrite known specialist remotes or enable them", () => {
  const listed = [
    discovered({ name: "ASTROEA" }),
    discovered({ name: "pinaculo" }),
    discovered({ name: "StrudelAI" }),
  ];
  const scan = scanOwnedRepositories({
    listed,
    knownAudits: [
      knownAudit("uset82/ASTROEA"),
      knownAudit("uset82/pinaculo"),
      knownAudit("uset82/StrudelAI"),
    ],
  });
  assert.deepEqual(scan.newPublic, []);
  assert.deepEqual(scan.proposals, []);
  assert.equal(scan.audits.length, 0);
});
