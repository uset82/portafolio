import type { Metadata } from "next";

import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Story" };

export default function StoryPage() {
  return (
    <PageIntro
      eyebrow="Story"
      title="The person behind the systems."
      description="Biography, experience, education, skills, and a résumé path will be added from user-confirmed CV material without invented dates or claims."
    />
  );
}
