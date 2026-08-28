import type { Metadata } from "next";

import { CodeAncestryPaper } from "@/components/codeancestry-paper";
import { CODEANCESTRY_ES } from "@/content/i18n/codeancestry-es";

export const metadata: Metadata = {
  title: CODEANCESTRY_ES.meta.title,
  description: CODEANCESTRY_ES.meta.description,
};

export default function CodeAncestryPageEs() {
  return <CodeAncestryPaper locale="es" />;
}
