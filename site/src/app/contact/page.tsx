import type { Metadata } from "next";

import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <PageIntro
      eyebrow="Contact"
      title="Let’s turn a difficult idea into a working system."
      description="The final email and contact behavior will appear here once Carlos confirms the public address, availability wording, and privacy preference."
    />
  );
}
