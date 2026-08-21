import type { Locale } from "@/lib/i18n";

/**
 * Spanish wording for the three Laboratory threads.
 *
 * The evidence boundaries are the point of this page, so they are translated
 * as carefully as the headings: a concept must read as a concept in both
 * languages, and no claim may become stronger in translation.
 */
export const FUTURE_ENERGY_ES = {
  title: "Future Energy",
  tagline: "Sistemas de flujo adaptativo",
  summary:
    "Un hilo del Laboratorio sobre sistemas de energía resiliente. No es un producto lanzado, ni un dispositivo en funcionamiento, ni un servicio de energía en vivo en este sitio.",
  conceptStatement:
    "Future Energy es un hilo del Laboratorio sobre sistemas de energía resiliente. Aquí no se presenta como un dispositivo en funcionamiento, un servicio en vivo ni un caso de estudio publicado.",
} as const;

export const LAB_CONCEPTS_ES: Record<
  string,
  { title: string; descriptor: string; statusLabel: string; summary: string; boundary: string }
> = {
  "electronics-ai": {
    title: "Electrónica / IA",
    descriptor: "Concepto modular protegido",
    statusLabel: "Solo concepto",
    summary:
      "Un concepto visual y de navegación del Laboratorio para trabajo de electrónica modular e IA: no es un ordenador en funcionamiento, ni una placa propietaria, ni un modelo entrenado, ni un sistema en vivo.",
    boundary:
      "No se afirma rendimiento de hardware, inferencia de IA, datos en vivo, disponibilidad de producto ni la propiedad de un dispositivo fabricado.",
  },
  drone: {
    title: "Sistemas aéreos",
    descriptor: "Concepto de dron con cámara y rotores protegidos",
    statusLabel: "Solo concepto",
    summary:
      "Un concepto visual y de navegación del Laboratorio para un dron con cámara y rotores protegidos, con un ciclo de estabilización escaso y acotado: no es una aeronave en funcionamiento ni un sistema autónomo.",
    boundary:
      "No se afirma rendimiento de vuelo, operación autónoma, controlador de vuelo en funcionamiento, capacidad de cámara, madurez de producción ni la propiedad de hardware de dron fabricado.",
  },
};

type Concept = {
  artifactId: string;
  title: string;
  descriptor: string;
  statusLabel: string;
  summary: string;
  boundary: string;
};

export function localizeLaboratory<
  E extends { title: string; tagline: string; summary: string; conceptStatement: string },
  A extends Concept,
  B extends Concept,
>(futureEnergy: E, electronics: A, drone: B, locale: Locale) {
  if (locale === "en") return { futureEnergy, electronics, drone };

  const localizeConcept = <T extends Concept>(concept: T): T => {
    const copy = LAB_CONCEPTS_ES[concept.artifactId];
    return copy ? { ...concept, ...copy } : concept;
  };

  return {
    futureEnergy: { ...futureEnergy, ...FUTURE_ENERGY_ES },
    electronics: localizeConcept(electronics),
    drone: localizeConcept(drone),
  };
}
