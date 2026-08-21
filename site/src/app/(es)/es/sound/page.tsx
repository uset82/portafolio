import type { Metadata } from "next";

import { SoundRoom } from "@/components/sound-room";

export const metadata: Metadata = {
  title: "Sonido",
  description:
    "Música desde Suno, vídeo en YouTube y StrudelAI abierto para probar. Los reproductores solo se cargan al hacer clic.",
  alternates: { canonical: "/es/sound", languages: { en: "/sound", es: "/es/sound" } },
};

export default function SoundPageEs() {
  return <SoundRoom locale="es" />;
}
