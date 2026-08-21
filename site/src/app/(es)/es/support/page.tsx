import type { Metadata } from "next";

import { SupportRoom } from "@/components/support-room";
import { resolveTipUrl } from "@/content/support";

export const metadata: Metadata = {
  title: "Apoyo",
  description:
    "Contribuye a los repositorios con licencia MIT de Carlos Alfredo Carpio Meza, o invítale un café. Las dos cosas son opcionales; los juegos, la música y el código siguen siendo gratis igualmente.",
  alternates: { canonical: "/es/support", languages: { en: "/support", es: "/es/support" } },
};

export default function SupportPageEs() {
  return <SupportRoom tipUrl={resolveTipUrl()} locale="es" />;
}
