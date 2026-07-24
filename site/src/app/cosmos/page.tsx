import type { Metadata } from "next";

import { CosmosFoundation } from "@/components/cosmos-foundation";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";

const siteContent = siteContentSchema.parse(rawSiteContent);

export const metadata: Metadata = {
  title: "Cosmos",
  description:
    "Carlos Carpio's privacy-first space for future travel notes, astrology studies, and numerology studies, framed as creative and personal practice.",
};

export default function CosmosPage() {
  return <CosmosFoundation content={siteContent.metadata.personalTeaser} />;
}
