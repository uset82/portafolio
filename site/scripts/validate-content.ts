import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { rawSiteContent } from "../src/content/records";
import { inventoryLedgerSchema, siteContentSchema } from "../src/content/schemas";

const formatIssues = (label: string, issues: { path: PropertyKey[]; message: string }[]) =>
  issues.map((issue) => `${label}.${issue.path.join(".") || "root"}: ${issue.message}`).join("\n");

const inventoryPath = resolve(process.cwd(), "../docs/content/content-inventory.json");
const inventoryInput: unknown = JSON.parse(readFileSync(inventoryPath, "utf8"));
const siteResult = siteContentSchema.safeParse(rawSiteContent);
const inventoryResult = inventoryLedgerSchema.safeParse(inventoryInput);
const failures: string[] = [];
let approvedDisplayRecordCount = 0;
let inventoryEntryCount = 0;

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

negativeContracts.forEach((contract) => {
  if (!contract.passed) failures.push(`Negative contract failed: accepted ${contract.name}.`);
});

if (failures.length > 0) {
  console.error(failures.join("\n\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Content valid: ${approvedDisplayRecordCount} approved display records and ${inventoryEntryCount} inventory entries.`,
  );
  console.log(`Negative contract checks passed: ${negativeContracts.length}.`);
}
