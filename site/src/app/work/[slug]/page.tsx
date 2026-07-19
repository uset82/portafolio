import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageIntro } from "@/components/page-intro";
import { StatusTag } from "@/components/ui";
import { selectedSystems } from "@/content/site";

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

  if (!system) notFound();

  return (
    <PageIntro
      eyebrow={`${system.group} / ${system.index}`}
      title={system.title}
      description={`${system.descriptor}. This named system comes from the approved Observatory composition; its case-study claims and source links remain unpublished until verified.`}
      meta={<StatusTag tone="concept">Concept · source review</StatusTag>}
    />
  );
}
