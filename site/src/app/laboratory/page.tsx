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
    "A concept-safe register for Carlos Alfredo Carpio Meza's Future Energy, Electronics / AI, and Aerial systems Laboratory threads, without claims of functioning hardware, live systems, or flight performance.",
};

export default function LaboratoryPage() {
  const electronicsConcept = siteContent.laboratoryConcepts.find(
    (candidate) => candidate.artifactId === "electronics-ai",
  );
  if (!electronicsConcept) {
    throw new Error("The approved Electronics / AI concept record is required.");
  }
  const droneConcept = siteContent.laboratoryConcepts.find(
    (candidate) => candidate.artifactId === "drone",
  );
  if (!droneConcept) {
    throw new Error("The approved Aerial systems concept record is required.");
  }

  return (
    <LaboratoryIndex
      futureEnergy={getFutureEnergyProject()}
      electronicsConcept={electronicsConcept}
      droneConcept={droneConcept}
    />
  );
}
