import type { Metadata } from "next";

import { StoryProfile } from "@/components/story-profile";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";

const siteContent = siteContentSchema.parse(rawSiteContent);

export const metadata: Metadata = {
  title: "Historia",
  description:
    "La biografía pública aprobada de Carlos Alfredo Carpio Meza, su práctica de ingeniería creativa y el estado de publicación de su CV con la privacidad por delante.",
  alternates: { canonical: "/es/story", languages: { en: "/story", es: "/es/story" } },
};

export default function StoryPageEs() {
  return (
    <StoryProfile
      name={siteContent.metadata.name}
      content={siteContent.metadata.profileTeaser}
      locale="es"
    />
  );
}
