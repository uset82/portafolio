import type { Metadata } from "next";

import { StoryProfile } from "@/components/story-profile";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";

const siteContent = siteContentSchema.parse(rawSiteContent);

export const metadata: Metadata = {
  title: "Story",
  description:
    "Carlos Carpio's approved public biography, creative-engineering practice, and privacy-safe CV publication status.",
};

export default function StoryPage() {
  return (
    <StoryProfile name={siteContent.metadata.name} content={siteContent.metadata.profileTeaser} />
  );
}
