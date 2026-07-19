import type { Metadata } from "next";

import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Laboratory" };

export default function LaboratoryPage() {
  return (
    <PageIntro
      eyebrow="Laboratory"
      title="Experiments where software meets matter."
      description="A working index for AI agents, electronics, future energy, creative tools, and carefully labeled concepts in progress."
    />
  );
}
