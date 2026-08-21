import type { Metadata } from "next";

import { ContactPath } from "@/components/contact-path";
import { rawSiteContent } from "@/content/records";
import { siteContentSchema } from "@/content/schemas";

const siteContent = siteContentSchema.parse(rawSiteContent);

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Carlos Alfredo Carpio Meza's privacy-first contact route with one verified public GitHub profile and no unapproved direct contact details.",
};

export default function ContactPage() {
  return <ContactPath content={siteContent.metadata.footer} />;
}
