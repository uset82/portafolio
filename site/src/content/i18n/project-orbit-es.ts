import type { OrbitProject } from "@/content/project-orbit";
import type { Locale } from "@/lib/i18n";

/**
 * Spanish overlay for the Project Orbit roster.
 *
 * Names are proper nouns and stay as they are; only the one-line description
 * and the category label are restated, keyed by project id.
 */
const ORBIT_ES: Record<string, { description: string; category: string }> = {
  astraea: {
    description: "Inteligencia celeste: lectura de cartas y trabajo con patrones cósmicos.",
    category: "Astrología",
  },
  pinaculo: {
    description: "Motor numerológico construido sobre el método del pináculo.",
    category: "Numerología",
  },
  "future-energy": {
    description: "Sistemas de flujo adaptativo para energía e infraestructura.",
    category: "Energía",
  },
  "sound-lab": {
    description: "La base del sonido: instrumentos, sesiones y publicaciones.",
    category: "Música",
  },
  arcade: {
    description: "Juegos a los que puedes jugar aquí, y el estado honesto del resto.",
    category: "Juegos",
  },
  repo2agent: {
    description: "Convierte un repositorio en un agente con el que ANA puede razonar.",
    category: "Investigación",
  },
  strudelai: {
    description: "Patrones de música generativa escritos como código en vivo.",
    category: "Música",
  },
  "3doodle": {
    description: "Dibuja en tres dimensiones directamente en el navegador.",
    category: "Creativo",
  },
  ifoundyou: {
    description: "Encontrar personas y cosas a través de señales compartidas.",
    category: "Herramienta",
  },
  "avatar-studio": {
    description: "Estudio de voz y semejanza para presentadores sintéticos.",
    category: "IA",
  },
  smartchatbot: {
    description: "La capa conversacional de CACM AI sobre todo el portafolio.",
    category: "IA",
  },
};

export function localizeOrbitProject(project: OrbitProject, locale: Locale): OrbitProject {
  if (locale === "en") return project;

  const copy = ORBIT_ES[project.id];
  if (!copy) return project;

  return { ...project, description: copy.description, category: copy.category };
}
