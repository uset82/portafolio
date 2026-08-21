import type { Metadata, Viewport } from "next";

import { SiteDocument } from "@/components/site-document";

import "../globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  title: {
    default: "Carlos Alfredo Carpio Meza — Ingeniero, inventor, tecnólogo creativo",
    template: "%s — Carlos Alfredo Carpio Meza",
  },
  description:
    "Carlos Alfredo Carpio Meza convierte patrones ocultos de la IA, la electrónica, la energía del futuro, la música, la astrología y la numerología en sistemas que funcionan.",
  alternates: {
    canonical: "/es",
    languages: {
      en: "/",
      es: "/es",
    },
  },
};

export default function SpanishRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteDocument locale="es">{children}</SiteDocument>;
}
