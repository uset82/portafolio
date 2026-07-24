import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, relative, resolve } from "node:path";

import { rawSiteContent } from "../src/content/records";
import ccAiEvaluationSetInput from "../src/content/cc-ai-evaluation.json";
import ccAiPublicKnowledgeLedgerInput from "../src/content/cc-ai-public-knowledge.json";
import {
  assetLicensingRegisterSchema,
  ccAiEvaluationSetSchema,
  ccAiPublicKnowledgeLedgerSchema,
  flagshipProjectSummaryLedgerSchema,
  inventoryLedgerSchema,
  localMediaClearanceRegisterSchema,
  projectLinkRegisterSchema,
  projectMediaInventorySchema,
  siteContentSchema,
  unresolvedContentBlockerLedgerSchema,
  voiceAndCopyContractSchema,
} from "../src/content/schemas";

const formatIssues = (label: string, issues: { path: PropertyKey[]; message: string }[]) =>
  issues.map((issue) => `${label}.${issue.path.join(".") || "root"}: ${issue.message}`).join("\n");

const sourceExtensions = new Set([".ts", ".tsx"]);

function collectRuntimeSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const candidate = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "tests" || entry.name === "testing") return [];
      return collectRuntimeSourceFiles(candidate);
    }
    return sourceExtensions.has(extname(entry.name)) ? [candidate] : [];
  });
}

const inventoryPath = resolve(process.cwd(), "../docs/content/content-inventory.json");
const inventoryInput: unknown = JSON.parse(readFileSync(inventoryPath, "utf8"));
const flagshipSummaryPath = resolve(
  process.cwd(),
  "../docs/content/flagship-project-summaries.json",
);
const flagshipSummaryInput: unknown = JSON.parse(readFileSync(flagshipSummaryPath, "utf8"));
const projectLinkRegisterPath = resolve(
  process.cwd(),
  "../docs/content/project-link-register.json",
);
const projectLinkRegisterInput: unknown = JSON.parse(readFileSync(projectLinkRegisterPath, "utf8"));
const projectMediaInventoryPath = resolve(
  process.cwd(),
  "../docs/content/project-media-inventory.json",
);
const projectMediaInventoryInput: unknown = JSON.parse(
  readFileSync(projectMediaInventoryPath, "utf8"),
);
const voiceAndCopyContractPath = resolve(
  process.cwd(),
  "../docs/content/voice-and-copy-contract.json",
);
const voiceAndCopyContractInput: unknown = JSON.parse(
  readFileSync(voiceAndCopyContractPath, "utf8"),
);
const voiceAndCopyGuidePath = resolve(process.cwd(), "../docs/content/voice-and-copy-guide.md");
const voiceAndCopyGuideInput = readFileSync(voiceAndCopyGuidePath, "utf8");
const assetLicensingRegisterPath = resolve(
  process.cwd(),
  "../docs/content/asset-licensing-register.json",
);
const assetLicensingRegisterInput: unknown = JSON.parse(
  readFileSync(assetLicensingRegisterPath, "utf8"),
);
const localMediaClearanceRegisterPath = resolve(
  process.cwd(),
  "../docs/content/local-media-clearance-register.json",
);
const localMediaClearanceRegisterInput: unknown = JSON.parse(
  readFileSync(localMediaClearanceRegisterPath, "utf8"),
);
const unresolvedContentBlockerLedgerPath = resolve(
  process.cwd(),
  "../docs/content/unresolved-content-blockers.json",
);
const unresolvedContentBlockerLedgerInput: unknown = JSON.parse(
  readFileSync(unresolvedContentBlockerLedgerPath, "utf8"),
);
const ccAiEvaluationGuidePath = resolve(process.cwd(), "../docs/content/cc-ai-evaluation-set.md");
const siteResult = siteContentSchema.safeParse(rawSiteContent);
const inventoryResult = inventoryLedgerSchema.safeParse(inventoryInput);
const flagshipSummaryResult = flagshipProjectSummaryLedgerSchema.safeParse(flagshipSummaryInput);
const projectLinkRegisterResult = projectLinkRegisterSchema.safeParse(projectLinkRegisterInput);
const projectMediaInventoryResult = projectMediaInventorySchema.safeParse(
  projectMediaInventoryInput,
);
const voiceAndCopyContractResult = voiceAndCopyContractSchema.safeParse(voiceAndCopyContractInput);
const assetLicensingRegisterResult = assetLicensingRegisterSchema.safeParse(
  assetLicensingRegisterInput,
);
const localMediaClearanceRegisterResult = localMediaClearanceRegisterSchema.safeParse(
  localMediaClearanceRegisterInput,
);
const unresolvedContentBlockerLedgerResult = unresolvedContentBlockerLedgerSchema.safeParse(
  unresolvedContentBlockerLedgerInput,
);
const ccAiPublicKnowledgeLedgerResult = ccAiPublicKnowledgeLedgerSchema.safeParse(
  ccAiPublicKnowledgeLedgerInput,
);
const ccAiEvaluationSetResult = ccAiEvaluationSetSchema.safeParse(ccAiEvaluationSetInput);
const failures: string[] = [];
let approvedDisplayRecordCount = 0;
let inventoryEntryCount = 0;
let heldFlagshipSummaryCount = 0;
let auditedProjectLinkCount = 0;
let reusableProjectMediaCount = 0;
let blockedProjectMediaCandidateCount = 0;
let deferredNonProjectAssetCount = 0;
let voiceStatusLabelCount = 0;
let assetLicensingDecisionCount = 0;
let heldLaunchAssetCount = 0;
let localMediaClearanceCount = 0;
let unresolvedContentBlockerCount = 0;
let productionContentBlockerCount = 0;
let publicKnowledgeRecordCount = 0;
let publicKnowledgeExclusionCount = 0;
let ccAiEvaluationCaseCount = 0;

const expectedFlagshipSelection = [
  "strudelai",
  "codex-avatar-studio",
  "ifoundyou-dommedag",
  "opennemoclaw",
  "webdesigner",
];

if (!siteResult.success) {
  failures.push(formatIssues("siteContent", siteResult.error.issues));
} else {
  approvedDisplayRecordCount = siteResult.data.projects.length;
}

if (!inventoryResult.success) {
  failures.push(formatIssues("contentInventory", inventoryResult.error.issues));
} else {
  inventoryEntryCount = inventoryResult.data.items.length;
}

if (!flagshipSummaryResult.success) {
  failures.push(formatIssues("flagshipProjectSummaries", flagshipSummaryResult.error.issues));
} else {
  heldFlagshipSummaryCount = flagshipSummaryResult.data.projects.length;

  if (flagshipSummaryResult.data.selection.join("|") !== expectedFlagshipSelection.join("|")) {
    failures.push(
      `flagshipProjectSummaries.selection: expected ${expectedFlagshipSelection.join(", ")}`,
    );
  }

  flagshipSummaryResult.data.projects.forEach((project, index) => {
    const sourcePackPath = resolve(process.cwd(), "..", project.sourcePack);
    if (!existsSync(sourcePackPath)) {
      failures.push(
        `flagshipProjectSummaries.projects.${index}.sourcePack: missing ${project.sourcePack}`,
      );
    }
  });
}

if (!projectLinkRegisterResult.success) {
  failures.push(formatIssues("projectLinkRegister", projectLinkRegisterResult.error.issues));
} else {
  auditedProjectLinkCount = projectLinkRegisterResult.data.links.length;

  projectLinkRegisterResult.data.links.forEach((link, index) => {
    if (!expectedFlagshipSelection.includes(link.projectId)) {
      failures.push(
        `projectLinkRegister.links.${index}.projectId: unknown flagship project ${link.projectId}`,
      );
    }
  });
}

if (flagshipSummaryResult.success && projectLinkRegisterResult.success) {
  const auditedLinksByUrl = new Map(
    projectLinkRegisterResult.data.links.map((link) => [link.requestedUrl, link]),
  );
  const summaryUrls = new Set<string>();

  flagshipSummaryResult.data.projects.forEach((project, projectIndex) => {
    project.links.forEach((link, linkIndex) => {
      summaryUrls.add(link.href);
      const auditedLink = auditedLinksByUrl.get(link.href);

      if (!auditedLink) {
        failures.push(
          `flagshipProjectSummaries.projects.${projectIndex}.links.${linkIndex}: no audited link-register entry for ${link.href}`,
        );
        return;
      }

      if (
        auditedLink.projectId !== project.id ||
        auditedLink.kind !== link.kind ||
        auditedLink.status !== "verified" ||
        auditedLink.publication !== "include"
      ) {
        failures.push(
          `projectLinkRegister.${auditedLink.id}: does not match the verified ${project.id} ${link.kind} summary action`,
        );
      }
    });
  });

  projectLinkRegisterResult.data.links.forEach((link, index) => {
    if (link.publication === "include" && !summaryUrls.has(link.requestedUrl)) {
      failures.push(
        `projectLinkRegister.links.${index}: included action is missing from the flagship summaries`,
      );
    }
  });
}

if (!projectMediaInventoryResult.success) {
  failures.push(formatIssues("projectMediaInventory", projectMediaInventoryResult.error.issues));
} else {
  reusableProjectMediaCount = projectMediaInventoryResult.data.reusableProjectMediaCount;
  blockedProjectMediaCandidateCount = projectMediaInventoryResult.data.candidates.filter(
    (candidate) => candidate.decision !== "include",
  ).length;
  deferredNonProjectAssetCount = projectMediaInventoryResult.data.deferredNonProjectAssets.length;

  const mediaProjectIds = projectMediaInventoryResult.data.projects.map(
    (project) => project.projectId,
  );
  if (mediaProjectIds.join("|") !== expectedFlagshipSelection.join("|")) {
    failures.push(
      `projectMediaInventory.projects: expected ${expectedFlagshipSelection.join(", ")}`,
    );
  }

  projectMediaInventoryResult.data.projects.forEach((project, index) => {
    const sourcePackPath = resolve(process.cwd(), "..", project.sourcePack);
    if (!existsSync(sourcePackPath)) {
      failures.push(
        `projectMediaInventory.projects.${index}.sourcePack: missing ${project.sourcePack}`,
      );
    }
  });
}

if (flagshipSummaryResult.success && projectMediaInventoryResult.success) {
  flagshipSummaryResult.data.projects.forEach((summary, index) => {
    const mediaDecision = projectMediaInventoryResult.data.projects[index];
    if (!mediaDecision || mediaDecision.projectId !== summary.id) return;

    if (summary.mediaDecision === "exclude" && mediaDecision.reusableMedia.length > 0) {
      failures.push(
        `projectMediaInventory.projects.${index}.reusableMedia: summary still excludes all project media`,
      );
    }
  });
}

if (!voiceAndCopyContractResult.success) {
  failures.push(formatIssues("voiceAndCopyContract", voiceAndCopyContractResult.error.issues));
} else {
  voiceStatusLabelCount = voiceAndCopyContractResult.data.statusLabels.length;

  const canonicalTechnologyNames = new Set(
    voiceAndCopyContractResult.data.technologyNames.map((technology) => technology.canonical),
  );
  const requiredTechnologyNames = [
    "CC AI",
    "OpenRouter",
    "Next.js",
    "Three.js",
    "WebDesigner",
    "StrudelAI",
    "Codex Avatar Studio",
    "iFoundYou / Dommedag",
    "OpenNemoClaw",
    "Hunyuan 3D",
  ];
  requiredTechnologyNames.forEach((technology) => {
    if (!canonicalTechnologyNames.has(technology)) {
      failures.push(`voiceAndCopyContract.technologyNames: missing ${technology}`);
    }
  });
}

const requiredVoiceGuideHeadings = [
  "## Core voice",
  "## Point of view",
  "## Capitalization and titles",
  "## Punctuation and numbers",
  "## Technology and product names",
  "## Project status labels",
  "## Prohibited unsupported claims",
  "## Page and component patterns",
  "## UI, error, and accessibility copy",
  "## Review checklist",
];
requiredVoiceGuideHeadings.forEach((heading) => {
  if (!voiceAndCopyGuideInput.includes(heading)) {
    failures.push(`voiceAndCopyGuide: missing ${heading}`);
  }
});

if (!assetLicensingRegisterResult.success) {
  failures.push(formatIssues("assetLicensingRegister", assetLicensingRegisterResult.error.issues));
} else {
  assetLicensingDecisionCount = assetLicensingRegisterResult.data.assets.length;
  heldLaunchAssetCount = assetLicensingRegisterResult.data.assets.filter(
    (asset) => asset.launchCritical && asset.decision === "hold",
  ).length;

  const assetIds = new Set(assetLicensingRegisterResult.data.assets.map((asset) => asset.id));
  const requiredAssetIds = [
    "runtime-observatory-poster",
    "nextjs-starter-favicon",
    "cormorant-garamond-font",
    "manrope-font",
    "threejs-decoder-bundle",
    "repository-authored-visual-runtime",
    "repository-authored-cc-mark",
  ];
  requiredAssetIds.forEach((assetId) => {
    if (!assetIds.has(assetId)) {
      failures.push(`assetLicensingRegister.assets: missing ${assetId}`);
    }
  });

  const recordedPaths = assetLicensingRegisterResult.data.assets.flatMap((asset) => asset.paths);
  const requiredRuntimePaths = [
    "site/public/images/observatory-poster.png",
    "site/src/app/favicon.ico",
    "site/public/three/decoders/",
  ];
  requiredRuntimePaths.forEach((runtimePath) => {
    if (!recordedPaths.includes(runtimePath)) {
      failures.push(`assetLicensingRegister.paths: missing ${runtimePath}`);
    }
  });

  const localMediaGroup = assetLicensingRegisterResult.data.assets.find(
    (asset) => asset.id === "local-observatory-monogram-media",
  );
  if (!localMediaGroup || localMediaGroup.decision !== "exclude") {
    failures.push(
      "assetLicensingRegister.local-observatory-monogram-media: local media must stay excluded until runtime clearance is complete",
    );
  }

  const sourceRoot = resolve(process.cwd(), "src");
  const allowedContentSchemaPath = resolve(sourceRoot, "content/schemas.ts");
  const localMediaReferences = collectRuntimeSourceFiles(sourceRoot)
    .filter((file) => file !== allowedContentSchemaPath)
    .filter((file) => /\bimagesandvideo[\\/]/i.test(readFileSync(file, "utf8")))
    .map((file) => relative(process.cwd(), file));

  if (localMediaReferences.length > 0) {
    failures.push(
      `local media runtime boundary: pending imagesandvideo assets are referenced by ${localMediaReferences.join(", ")}`,
    );
  }
}

const sha256 = (path: string) =>
  createHash("sha256").update(readFileSync(path)).digest("hex").toUpperCase();
const posterPath = resolve(process.cwd(), "public/images/observatory-poster.png");
const posterReferencePath = resolve(process.cwd(), "../docs/design/reference/mainUI-approved.png");
const faviconPath = resolve(process.cwd(), "src/app/favicon.ico");
const expectedPosterHash = "B4E11D325297CEB8FFB021866FFA2903B316D5D2443DEF67BA890B4B3F3058BF";
const expectedFaviconHash = "2B8AD2D33455A8F736FC3A8EBF8F0BDEA8848AD4C0DB48A2833BD0F9CD775932";

if (
  sha256(posterPath) !== expectedPosterHash ||
  sha256(posterReferencePath) !== expectedPosterHash
) {
  failures.push("assetLicensingRegister.runtime-observatory-poster: hash mismatch");
}
if (sha256(faviconPath) !== expectedFaviconHash) {
  failures.push("assetLicensingRegister.nextjs-starter-favicon: hash mismatch");
}

if (!localMediaClearanceRegisterResult.success) {
  failures.push(
    formatIssues("localMediaClearanceRegister", localMediaClearanceRegisterResult.error.issues),
  );
} else {
  localMediaClearanceCount = localMediaClearanceRegisterResult.data.assets.length;

  if (
    localMediaClearanceRegisterResult.data.status !== "runtime-approved" &&
    localMediaClearanceRegisterResult.data.assets.some((asset) => asset.decision !== "exclude")
  ) {
    failures.push(
      "localMediaClearanceRegister.assets: every local-media file must remain excluded while runtime clearance is held",
    );
  }

  const localMediaRoot = resolve(process.cwd(), "../imagesandvideo");
  if (!existsSync(localMediaRoot)) {
    failures.push("localMediaClearanceRegister: imagesandvideo directory is missing");
  } else {
    const repositoryRoot = resolve(process.cwd(), "..");
    const actualPaths = readdirSync(localMediaRoot, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) =>
        relative(repositoryRoot, resolve(localMediaRoot, entry.name)).replaceAll("\\", "/"),
      )
      .sort();
    const recordedPaths = localMediaClearanceRegisterResult.data.assets
      .map((asset) => asset.path)
      .sort();

    if (JSON.stringify(recordedPaths) !== JSON.stringify(actualPaths)) {
      failures.push(
        `localMediaClearanceRegister.assets: expected exact local-media inventory ${actualPaths.join(", ")}`,
      );
    }

    localMediaClearanceRegisterResult.data.assets.forEach((asset) => {
      const assetPath = resolve(repositoryRoot, asset.path);
      if (!existsSync(assetPath)) {
        failures.push(`localMediaClearanceRegister.${asset.id}: missing ${asset.path}`);
        return;
      }

      if (statSync(assetPath).size !== asset.bytes) {
        failures.push(`localMediaClearanceRegister.${asset.id}: byte-length mismatch`);
      }
      if (sha256(assetPath) !== asset.sha256) {
        failures.push(`localMediaClearanceRegister.${asset.id}: SHA-256 mismatch`);
      }
    });
  }
}

const requiredLicensePaths = [
  "LICENSES/FONTS-OFL-1.1.txt",
  "LICENSES/NEXTJS-MIT.txt",
  "public/three/decoders/THREE-LICENSE.txt",
  "THIRD_PARTY_NOTICES.md",
];
requiredLicensePaths.forEach((licensePath) => {
  if (!existsSync(resolve(process.cwd(), licensePath))) {
    failures.push(`assetLicensingRegister.licenses: missing site/${licensePath}`);
  }
});

if (!unresolvedContentBlockerLedgerResult.success) {
  failures.push(
    formatIssues("unresolvedContentBlockers", unresolvedContentBlockerLedgerResult.error.issues),
  );
} else {
  unresolvedContentBlockerCount = unresolvedContentBlockerLedgerResult.data.blockers.length;
  productionContentBlockerCount = unresolvedContentBlockerLedgerResult.data.blockers.filter(
    (blocker) => blocker.priority === "production-blocker",
  ).length;

  const blockerIds = new Set(
    unresolvedContentBlockerLedgerResult.data.blockers.map((blocker) => blocker.id),
  );
  const requiredBlockerIds = [
    "observatory-poster-public-rights",
    "public-contact-and-availability",
    "strudelai-publication-gates",
    "avatar-studio-publication-gates",
    "ifoundyou-publication-gates",
    "opennemoclaw-publication-gates",
    "webdesigner-publication-gates",
    "public-resume-download",
    "portrait-and-brand-assets",
    "project-media-assets",
    "music-and-sound-lab-inputs",
    "video-launch-set",
    "trips-and-hobbies-launch-set",
    "observatory-concept-status",
    "public-three-d-candidates",
    "cc-ai-public-knowledge-and-evaluation",
    "v1-content-and-asset-freeze",
  ];
  requiredBlockerIds.forEach((blockerId) => {
    if (!blockerIds.has(blockerId)) {
      failures.push(`unresolvedContentBlockers.blockers: missing ${blockerId}`);
    }
  });

  if (inventoryResult.success) {
    const inventoryIds = new Set(inventoryResult.data.items.map((item) => item.id));
    unresolvedContentBlockerLedgerResult.data.blockers.forEach((blocker, blockerIndex) => {
      blocker.sourceInventoryIds.forEach((inventoryId, sourceIndex) => {
        if (!inventoryIds.has(inventoryId)) {
          failures.push(
            `unresolvedContentBlockers.blockers.${blockerIndex}.sourceInventoryIds.${sourceIndex}: unknown inventory ID ${inventoryId}`,
          );
        }
      });
    });
  }
}

if (!ccAiPublicKnowledgeLedgerResult.success) {
  failures.push(formatIssues("ccAiPublicKnowledge", ccAiPublicKnowledgeLedgerResult.error.issues));
} else {
  publicKnowledgeRecordCount = ccAiPublicKnowledgeLedgerResult.data.records.length;
  publicKnowledgeExclusionCount = ccAiPublicKnowledgeLedgerResult.data.exclusions.length;

  const expectedRecordIds = ["profile-carlos-carpio", "public-contact-links"];
  if (
    ccAiPublicKnowledgeLedgerResult.data.records.map((record) => record.id).join("|") !==
    expectedRecordIds.join("|")
  ) {
    failures.push(
      `ccAiPublicKnowledge.records: expected exact approved order ${expectedRecordIds.join(", ")}`,
    );
  }

  if (siteResult.success) {
    if (
      JSON.stringify(siteResult.data.knowledgeRecords) !==
      JSON.stringify(ccAiPublicKnowledgeLedgerResult.data.records)
    ) {
      failures.push("ccAiPublicKnowledge.records: runtime records differ from the approved ledger");
    }
  }

  if (inventoryResult.success) {
    const inventoryIds = new Set(inventoryResult.data.items.map((item) => item.id));
    ccAiPublicKnowledgeLedgerResult.data.exclusions.forEach((exclusion, exclusionIndex) => {
      exclusion.sourceInventoryIds.forEach((inventoryId, sourceIndex) => {
        if (!inventoryIds.has(inventoryId)) {
          failures.push(
            `ccAiPublicKnowledge.exclusions.${exclusionIndex}.sourceInventoryIds.${sourceIndex}: unknown inventory ID ${inventoryId}`,
          );
        }
      });
    });
  }
}

if (!ccAiEvaluationSetResult.success) {
  failures.push(formatIssues("ccAiEvaluation", ccAiEvaluationSetResult.error.issues));
} else {
  ccAiEvaluationCaseCount = ccAiEvaluationSetResult.data.cases.length;

  if (!existsSync(ccAiEvaluationGuidePath)) {
    failures.push("ccAiEvaluation.guide: missing docs/content/cc-ai-evaluation-set.md");
  }

  if (ccAiPublicKnowledgeLedgerResult.success) {
    const ledgerRecordIds = new Set(
      ccAiPublicKnowledgeLedgerResult.data.records.map((record) => record.id),
    );
    const ledgerFacts = new Set(
      ccAiPublicKnowledgeLedgerResult.data.records.flatMap((record) => record.facts),
    );
    const ledgerSourceIds = new Set(
      ccAiPublicKnowledgeLedgerResult.data.records.flatMap((record) => record.sourceIds),
    );

    ccAiEvaluationSetResult.data.knowledgeRecordIds.forEach((recordId, index) => {
      if (!ledgerRecordIds.has(recordId)) {
        failures.push(
          `ccAiEvaluation.knowledgeRecordIds.${index}: unknown public record ID ${recordId}`,
        );
      }
    });

    ccAiEvaluationSetResult.data.cases.forEach((evaluationCase, caseIndex) => {
      evaluationCase.expectedFacts.forEach((fact, factIndex) => {
        if (!ledgerFacts.has(fact)) {
          failures.push(
            `ccAiEvaluation.cases.${caseIndex}.expectedFacts.${factIndex}: fact is not present verbatim in the public ledger`,
          );
        }
      });
      evaluationCase.requiredSourceIds.forEach((sourceId, sourceIndex) => {
        if (!ledgerSourceIds.has(sourceId)) {
          failures.push(
            `ccAiEvaluation.cases.${caseIndex}.requiredSourceIds.${sourceIndex}: source ${sourceId} is not approved by the public ledger`,
          );
        }
      });
    });
  }
}

const negativeContracts = [
  {
    name: "a missing required project title",
    passed: !siteContentSchema.safeParse({
      ...rawSiteContent,
      projects: rawSiteContent.projects.map((project, index) =>
        index === 0 ? { ...project, title: "" } : project,
      ),
    }).success,
  },
  {
    name: "an evidence project without evidence fields",
    passed: !siteContentSchema.safeParse({
      ...rawSiteContent,
      projects: rawSiteContent.projects.map((project, index) =>
        index === 0 ? { ...project, status: "shipped" } : project,
      ),
    }).success,
  },
  {
    name: "an unverified inventory item without stated gaps",
    passed: !inventoryLedgerSchema.safeParse({
      version: 1,
      reviewedOn: "2026-07-19",
      items: [
        {
          id: "invalid-record",
          type: "project",
          title: "Invalid record",
          owner: "Portfolio team",
          source: "Test fixture",
          verification: "needs-source-review",
          rights: "pending",
          missingFields: [],
          priority: "later",
          launchDecision: "hold",
          requestedAction: "Supply verified source material.",
          fallback: "Keep the item unpublished.",
          launchImpact: "No impact while held.",
        },
      ],
    }).success,
  },
];

if (flagshipSummaryResult.success) {
  negativeContracts.push({
    name: "a flagship summary without bounded contribution copy",
    passed: !flagshipProjectSummaryLedgerSchema.safeParse({
      ...flagshipSummaryResult.data,
      projects: flagshipSummaryResult.data.projects.map((project, index) =>
        index === 0 ? { ...project, contribution: "" } : project,
      ),
    }).success,
  });

  negativeContracts.push({
    name: "a selected flagship project without a corresponding summary",
    passed: !flagshipProjectSummaryLedgerSchema.safeParse({
      ...flagshipSummaryResult.data,
      projects: flagshipSummaryResult.data.projects.slice(0, -1),
    }).success,
  });
}

if (projectLinkRegisterResult.success) {
  const brokenLinkIndex = projectLinkRegisterResult.data.links.findIndex(
    (link) => link.status === "broken",
  );
  negativeContracts.push({
    name: "a known broken project link marked for publication",
    passed:
      brokenLinkIndex >= 0 &&
      !projectLinkRegisterSchema.safeParse({
        ...projectLinkRegisterResult.data,
        links: projectLinkRegisterResult.data.links.map((link, index) =>
          index === brokenLinkIndex ? { ...link, publication: "include" } : link,
        ),
      }).success,
  });
}

if (projectMediaInventoryResult.success) {
  negativeContracts.push({
    name: "rights-pending unmeasured project media marked for inclusion",
    passed: !projectMediaInventorySchema.safeParse({
      ...projectMediaInventoryResult.data,
      candidates: projectMediaInventoryResult.data.candidates.map((candidate, index) =>
        index === 0 ? { ...candidate, decision: "include" } : candidate,
      ),
    }).success,
  });
}

if (voiceAndCopyContractResult.success) {
  negativeContracts.push({
    name: "a voice contract missing one canonical project-status label",
    passed: !voiceAndCopyContractSchema.safeParse({
      ...voiceAndCopyContractResult.data,
      statusLabels: voiceAndCopyContractResult.data.statusLabels.slice(0, -1),
    }).success,
  });
}

if (assetLicensingRegisterResult.success) {
  negativeContracts.push({
    name: "an asset register marked ready while a launch-critical asset is held",
    passed: !assetLicensingRegisterSchema.safeParse({
      ...assetLicensingRegisterResult.data,
      releaseDecision: "ready",
      assets: assetLicensingRegisterResult.data.assets.map((asset) =>
        asset.id === "runtime-observatory-poster"
          ? { ...asset, decision: "hold", launchCritical: true }
          : asset,
      ),
    }).success,
  });
}

if (localMediaClearanceRegisterResult.success) {
  negativeContracts.push({
    name: "a held local-media asset marked for inclusion before runtime approval",
    passed: !localMediaClearanceRegisterSchema.safeParse({
      ...localMediaClearanceRegisterResult.data,
      assets: localMediaClearanceRegisterResult.data.assets.map((asset, index) =>
        index === 0 ? { ...asset, decision: "include" } : asset,
      ),
    }).success,
  });
}

if (unresolvedContentBlockerLedgerResult.success) {
  negativeContracts.push({
    name: "an unresolved content blocker without a fallback",
    passed: !unresolvedContentBlockerLedgerSchema.safeParse({
      ...unresolvedContentBlockerLedgerResult.data,
      blockers: unresolvedContentBlockerLedgerResult.data.blockers.map((blocker, index) =>
        index === 0 ? { ...blocker, fallback: "" } : blocker,
      ),
    }).success,
  });

  negativeContracts.push({
    name: "a production blocker treated as a deferred enhancement",
    passed: !unresolvedContentBlockerLedgerSchema.safeParse({
      ...unresolvedContentBlockerLedgerResult.data,
      blockers: unresolvedContentBlockerLedgerResult.data.blockers.map((blocker) =>
        blocker.priority === "production-blocker"
          ? { ...blocker, status: "deferred-with-fallback" }
          : blocker,
      ),
    }).success,
  });
}

if (ccAiPublicKnowledgeLedgerResult.success) {
  negativeContracts.push({
    name: "a public CC AI knowledge record without a source",
    passed: !ccAiPublicKnowledgeLedgerSchema.safeParse({
      ...ccAiPublicKnowledgeLedgerResult.data,
      records: ccAiPublicKnowledgeLedgerResult.data.records.map((record, index) =>
        index === 0 ? { ...record, sourceIds: [] } : record,
      ),
    }).success,
  });
}

if (ccAiEvaluationSetResult.success) {
  negativeContracts.push({
    name: "a CC AI evaluation set with fewer than three source-conflict cases",
    passed: !ccAiEvaluationSetSchema.safeParse({
      ...ccAiEvaluationSetResult.data,
      cases: ccAiEvaluationSetResult.data.cases.filter(
        (evaluationCase, index) =>
          evaluationCase.category !== "source-conflict" || index === 20 || index === 21,
      ),
    }).success,
  });
}

negativeContracts.forEach((contract) => {
  if (!contract.passed) failures.push(`Negative contract failed: accepted ${contract.name}.`);
});

if (failures.length > 0) {
  console.error(failures.join("\n\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Content valid: ${approvedDisplayRecordCount} approved display records, ${heldFlagshipSummaryCount} held flagship summary drafts, ${auditedProjectLinkCount} audited project links, ${reusableProjectMediaCount} reusable project media, ${blockedProjectMediaCandidateCount} blocked project-media candidates, ${deferredNonProjectAssetCount} deferred local reference assets, ${voiceStatusLabelCount} voice/status labels, ${assetLicensingDecisionCount} asset-license decisions with ${heldLaunchAssetCount} launch hold, ${localMediaClearanceCount} hash-pinned ownership-recorded local-media records, ${unresolvedContentBlockerCount} unresolved content blockers with ${productionContentBlockerCount} production blockers, ${publicKnowledgeRecordCount} public CC AI records with ${publicKnowledgeExclusionCount} explicit exclusions, ${ccAiEvaluationCaseCount} specified CC AI evaluation cases, and ${inventoryEntryCount} inventory entries.`,
  );
  console.log(`Negative contract checks passed: ${negativeContracts.length}.`);
}
