import type { Metadata } from "next";

import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Cosmos" };

export default function CosmosPage() {
  return (
    <PageIntro
      eyebrow="Cosmos"
      title="Personal systems for observing patterns and meaning."
      description="Astrology and numerology are presented here as Carlos’s creative and personal practices—not as scientific, medical, or predictive claims."
    />
  );
}
