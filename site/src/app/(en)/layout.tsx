import type { Metadata, Viewport } from "next";

import { SiteDocument } from "@/components/site-document";
import { siteUrl } from "@/lib/site-url";

import "../globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Carlos Alfredo Carpio Meza — Engineer, Inventor, Creative Technologist",
    template: "%s — Carlos Alfredo Carpio Meza",
  },
  description:
    "Carlos Alfredo Carpio Meza turns hidden patterns across AI, electronics, future energy, music, astrology, and numerology into working systems.",
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      es: "/es",
    },
  },
};

export default function EnglishRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteDocument locale="en">{children}</SiteDocument>;
}
