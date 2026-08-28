import type { Metadata } from "next";

import { CodeAncestryPaper } from "@/components/codeancestry-paper";
import { CODEANCESTRY } from "@/content/codeancestry";

export const metadata: Metadata = {
  title: CODEANCESTRY.meta.title,
  description: CODEANCESTRY.meta.description,
  alternates: {
    canonical: "/laboratory/codeancestry",
    languages: { en: "/laboratory/codeancestry", es: "/es/laboratory/codeancestry" },
  },
};

export default function CodeAncestryPage() {
  return <CodeAncestryPaper />;
}
