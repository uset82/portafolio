import type { Metadata } from "next";

import { LaboratoryIndex } from "@/components/laboratory-index";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema, type Project } from "@/content/schemas";

const siteContent = siteContentSchema.parse(rawSiteContent);

function getFutureEnergyProject(): Extract<Project, { status: "concept" | "preparation" }> {
  const project = siteContent.projects.find((candidate) => candidate.slug === "future-energy");
  if (!project || !("conceptStatement" in project)) {
    throw new Error("Future Energy concept record is required for the Laboratory route");
  }
  return project;
}

export const metadata: Metadata = {
  title: "Laboratory",
  description:
    "A concept-safe register for Carlos Carpio's Future Energy and Electronics / AI Observatory mechanisms, without claims of functioning hardware or live systems.",
};

export default function LaboratoryPage() {
  return <LaboratoryIndex futureEnergy={getFutureEnergyProject()} />;
}
