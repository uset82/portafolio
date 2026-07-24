import type { Metadata } from "next";

import { SoundFoundation } from "@/components/sound-foundation";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";

const siteContent = siteContentSchema.parse(rawSiteContent);

export const metadata: Metadata = {
  title: "Sound",
  description:
    "Carlos Carpio's mute-first Sound and moving-image room, with explicit publication, accessibility, rights, and privacy gates.",
};

export default function SoundPage() {
  return <SoundFoundation content={siteContent.metadata.mediaTeaser} />;
}
