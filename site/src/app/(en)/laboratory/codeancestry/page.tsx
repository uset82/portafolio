import type { Metadata } from "next";

import { CodeAncestryPaper } from "@/components/codeancestry-paper";
import { CODEANCESTRY } from "@/content/codeancestry";

export const metadata: Metadata = {
  title: CODEANCESTRY.meta.title,
  description: CODEANCESTRY.meta.description,
};

export default function CodeAncestryPage() {
  return <CodeAncestryPaper />;
}
