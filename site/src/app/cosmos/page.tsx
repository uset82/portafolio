import type { Metadata } from "next";

import { CosmosFoundation } from "@/components/cosmos-foundation";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";

const siteContent = siteContentSchema.parse(rawSiteContent);

export const metadata: Metadata = {
  title: "Cosmos",
  description:
    "Try Pináculo, a numerology app with interpretations that draw on Carl Jung, and read ASTROEA, an astrology repository inspired by astro.com. Creative and personal practice—not scientific, medical, or predictive advice.",
};

export default function CosmosPage() {
  return <CosmosFoundation content={siteContent.metadata.personalTeaser} />;
}
