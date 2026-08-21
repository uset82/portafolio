import type { GithubWorkEntry, WorkGroupId } from "@/content/github-register";
import type { Locale } from "@/lib/i18n";

/**
 * Spanish overlay for the public GitHub register.
 *
 * Only the wording this site authors is translated. A repository's own GitHub
 * description is upstream text written in English, and restating it in Spanish
 * here would quietly present a translation as the repository's own words, so
 * those are left exactly as GitHub returns them.
 */

/** Group headings. The English record already carries a Spanish chart label. */
export const WORK_GROUP_TITLES_ES: Record<WorkGroupId, string> = {
  tools: "Herramientas y utilidades",
  ai: "IA y agentes",
  games: "Juegos",
  music: "Música y audio",
  design: "Diseño y web",
  websites: "Creación de sitios",
  hardware: "Hardware y embebido",
  astrology: "Astrología y numerología",
  business: "Negocio y SaaS",
  creative: "Creativo y 3D",
  academic: "Escritura académica",
  forks: "Forks",
  starts: "Comienzos",
};

/** The descriptions this site writes, keyed by repository name. */
export const DESCRIPTIONS_ES: Record<string, string> = {
  portafolio: "Este sitio de portafolio.",
  mentora:
    "Fork de una base Mentora de la universidad. Carlos es el desarrollador principal de esta copia.",
  Jacobgolf:
    "Un minigolf en el navegador con canvas de HTML5 y JavaScript puro. Lo hizo Jacob, el hijo de Carlos, a los nueve años: su idea y sus propios arreglos.",
  StillasCalculator:
    "Una calculadora de andamios: dibuja el perímetro de un edificio y obtén una estimación de material para planificar.",
  pacha: "Web del Pasha International Food & Bar de Bergen.",
  chaclacayo: "Web inmobiliaria de una casa en Chaclacayo, Lima.",
  QubeSolve:
    "Un resolutor de cubo de Rubik en 3D con visualización interactiva y algoritmos de resolución paso a paso.",
  opennemoclaw:
    "Un marco de agentes personales con arquitectura local modular, integración con Docker y controles de política.",
  opennemoclawsite: "Web y documentación complementarias de OpenNemoClaw.",
  "3Doodle":
    "Una app de dibujo para niños: traza en el lienzo, pulsa Generate 3D y el resultado se guarda en una galería.",
  EFFATA:
    "Un escáner de salud y seguridad de productos: lee un código de barras o una etiqueta de ingredientes y busca carcinógenos, toxinas, alérgenos e ingredientes prohibidos. La app está en español y pide acceso a la cámara antes de escanear.",
  "My-Football-Game":
    "Un partido de fútbol en canvas para un jugador contra la máquina o dos jugadores en un mismo teclado. Lo hizo Jacob, el hijo de Carlos, a los nueve años: su idea y sus propios arreglos. El modo en línea sigue incluido, pero el servidor al que llama ya no responde.",
  "Monkey-Tug-of-War":
    "Un juego de aritmética con Flutter y Flame para una pantalla de aula: responde más rápido que el otro lado y arrastra la cuerda hacia ti.",
  gimmemycake:
    "Una escena 3D que se juega con las manos a través de la cámara: lánzale pastel al bebé que llora. Pesada - un archivo de modelo de 29,5 MB - y pide acceso a la cámara.",
  drone_Lips:
    "Un dron que se pilota con la cara: MediaPipe lee la boca y el parpadeo y los convierte en desplazamiento, acelerón y disparo. Pide acceso a la cámara.",
  iFoundYou:
    "Dommedag, un mapa con MapLibre y OpenStreetMap que comparte una posición y busca desde el centro del mapa.",
  bankAI:
    "Un concepto de banco con el que hablas en lugar de navegar menús: una consola de demostración construida alrededor de la voz, una acción decisiva por respuesta y un marco noruego de BankID y NAV. Un prototipo, no un banco.",
  "cookthis-":
    "Fotografía lo que hay en la nevera y recibe ideas de comida. Hecho para estudiantes que no saben qué cenar.",
  ReportAIEquinor:
    "Un trabajo de caso sobre la gobernanza de la IA y la sostenibilidad en Equinor, publicado como web: la estructura completa, un informe de unas 4.100 palabras y sus referencias.",
  "smartapply-app":
    "Un gestor de candidaturas con asistente de IA: solicitudes por etapa, CV y diplomas subidos y cartas de presentación generadas.",
  "DealDash-":
    "Un juego de conducción en el navegador: reparte paquetes en diez niveles contra el reloj, con las flechas o con controles en pantalla.",
};

/** Call-to-action labels, keyed by repository name. */
export const TRY_LABELS_ES: Record<string, string> = {
  StrudelAI: "Prueba StrudelAI",
  Jacobgolf: "Jugar a Jacobs Golfspill",
  QubeSolve: "Resolver con QubeSolve",
  opennemoclaw: "Abrir OpenNemoClaw",
  opennemoclawsite: "Abrir OpenNemoClaw",
  StillasCalculator: "Abrir StillasCalculator",
  pacha: "Abrir Pasha",
  chaclacayo: "Abrir Chaclacayo",
  "3Doodle": "Dibujar con 3Doodle",
  EFFATA: "Escanear con EFFATA",
  "My-Football-Game": "Jugar a My Football Game",
  "Monkey-Tug-of-War": "Jugar a Monkey Tug of War",
  gimmemycake: "Jugar a Gimme My Cake",
  drone_Lips: "Jugar a Drone Lips",
  iFoundYou: "Abrir Dommedag",
  bankAI: "Abrir AI Bank",
  "cookthis-": "Abrir COOKTHIS",
  ReportAIEquinor: "Leer el trabajo sobre Equinor",
  "smartapply-app": "Abrir SmartApply",
  "DealDash-": "Jugar a Deal Dash",
};

const ROOM_LABELS_ES: Record<string, string> = {
  "This site": "Este sitio",
  "On Sound": "En Sonido",
  "On Cosmos": "En Cosmos",
  "On Arcade": "En Arcade",
};

const OTHER_LABELS_ES: Record<string, string> = {
  "Open site": "Abrir la web",
  "No GitHub description.": "Sin descripción en GitHub.",
  "No licence file": "Sin archivo de licencia",
  "Licence unparsed": "Licencia sin identificar",
};

export function localizeWorkEntry(entry: GithubWorkEntry, locale: Locale): GithubWorkEntry {
  if (locale === "en") return entry;

  return {
    ...entry,
    description:
      DESCRIPTIONS_ES[entry.name] ?? OTHER_LABELS_ES[entry.description] ?? entry.description,
    licenseLabel: OTHER_LABELS_ES[entry.licenseLabel] ?? entry.licenseLabel,
    tryLabel: entry.tryLabel
      ? (TRY_LABELS_ES[entry.name] ?? OTHER_LABELS_ES[entry.tryLabel] ?? entry.tryLabel)
      : null,
    roomLabel: entry.roomLabel ? (ROOM_LABELS_ES[entry.roomLabel] ?? entry.roomLabel) : null,
  };
}
