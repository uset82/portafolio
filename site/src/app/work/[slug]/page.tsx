import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaseStudyJourney } from "@/components/case-study-journey";
import { CaseStudyLayout } from "@/components/case-study-layout";
import { selectedSystems, siteContent } from "@/content/site";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return selectedSystems.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const system = selectedSystems.find((item) => item.slug === slug);
  return system ? { title: system.title } : {};
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const system = selectedSystems.find((item) => item.slug === slug);
  const project = siteContent.projects.find((item) => item.slug === slug);

  if (!system || !project) notFound();

  const listedSystems = selectedSystems.filter((item) => item.status !== "concept");

  return (
    <CaseStudyLayout
      project={project}
      index={system.index}
      group={system.group}
      relatedWork={<CaseStudyJourney currentSlug={slug} systems={listedSystems} />}
    />
  );
}
