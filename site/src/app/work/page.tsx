import type { Metadata } from "next";

import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Work" };

export default function WorkPage() {
  return (
    <PageIntro
      eyebrow="Work"
      title="Selected systems, shown with evidence."
      description="Software, AI, interfaces, and physical-digital experiments will appear here as their source packs, roles, links, and outcomes are verified."
    />
  );
}
