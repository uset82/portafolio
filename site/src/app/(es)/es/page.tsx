import type { Metadata } from "next";

import { HomePage } from "@/components/home-page";

export const metadata: Metadata = {
  alternates: { canonical: "/es", languages: { en: "/", es: "/es" } },
};

export default function HomeEs() {
  return <HomePage locale="es" />;
}
