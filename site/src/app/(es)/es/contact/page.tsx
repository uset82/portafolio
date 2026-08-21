import type { Metadata } from "next";

import { ContactPath } from "@/components/contact-path";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";

const siteContent = siteContentSchema.parse(rawSiteContent);

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "La vía de contacto de Carlos Alfredo Carpio Meza, con la privacidad por delante: un perfil público verificado de GitHub y ningún dato de contacto directo sin aprobar.",
  alternates: { canonical: "/es/contact", languages: { en: "/contact", es: "/es/contact" } },
};

export default function ContactPageEs() {
  return <ContactPath content={siteContent.metadata.footer} locale="es" />;
}
