import type { Metadata } from "next";

import { CosmosFoundation } from "@/components/cosmos-foundation";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";

const siteContent = siteContentSchema.parse(rawSiteContent);

export const metadata: Metadata = {
  title: "Cosmos",
  description:
    "Prueba ASTROEA, una app de astrología inspirada en astro.com, y Pináculo, una app de numerología con interpretaciones que se apoyan en Carl Jung. Práctica creativa y personal: no es consejo científico, médico ni predictivo.",
  alternates: { canonical: "/es/cosmos", languages: { en: "/cosmos", es: "/es/cosmos" } },
};

export default function CosmosPageEs() {
  return <CosmosFoundation content={siteContent.metadata.personalTeaser} locale="es" />;
}
