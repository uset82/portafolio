import type { Metadata } from "next";

import { ProjectRegister } from "@/components/project-register";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";

const siteContent = siteContentSchema.parse(rawSiteContent);

export const metadata: Metadata = {
  title: "Work",
  description:
    "A navigable register of Carlos Alfredo Carpio Meza's validated Observatory concepts, labeled by their current evidence state.",
};

export default function WorkPage() {
  return <ProjectRegister projects={siteContent.projects} />;
}
