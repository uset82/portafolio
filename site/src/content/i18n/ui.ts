import type { Locale } from "@/lib/i18n";

/**
 * Interface copy that lives in components rather than in the content records.
 *
 * The English object is the shape: `UiCopy` is derived from it, so a Spanish
 * translation that forgets a key fails the type check instead of silently
 * rendering English inside a Spanish page.
 */
const EN = {
  common: {
    skipToContent: "Skip to main content",
    externalSite: " — external site",
    switchLanguage: "Leer en español",
    switchLanguageAria: "Cambiar a español",
  },
  header: {
    homeAria: "Carlos Alfredo Carpio Meza — home",
    primaryNavAria: "Primary navigation",
    experienceAria: "Experience settings",
    experience: "Experience",
  },
  footer: {
    primaryNavAria: "Primary site navigation",
    secondaryNavAria: "Explore and external links",
    nav: {
      play: "Play",
      see: "See",
      listen: "Listen",
      about: "About",
      laboratory: "Laboratory",
      cosmos: "Cosmos",
      support: "Support",
    },
    signature:
      "Carlos Alfredo Carpio Meza · Engineer · Inventor · Creative Technologist · Built as a semantic portfolio with an optional immersive layer.",
  },
  home: {
    guideNote: "CACM AI remains the public portfolio guide.",
    soundLabTitle: "Sound Lab",
    soundLabDescriptor: "Harmonic instrument",
  },
  arcadeTeaser: {
    label: "Arcade / 03",
    playableNow: (count: number) => `${count} playable now`,
    noneHosted: (total: number) => `${total} games, none hosted yet`,
    headingPlayable: "You can just play some of these games.",
    headingEmpty: "The games, and what each one needs.",
    descriptionPlayable:
      "Come in and try a game whenever you like. They run here in the browser, and you are welcome to browse the ones still on the way.",
    descriptionEmpty:
      "The full shelf is here: engine, controls, size, and why each one is not playable on this page yet.",
    action: "Enter the Arcade",
    cabinet: (total: number) => `Play / ${total} titles`,
  },
  mediaTeaser: {
    instrumentLabel: "Sound / Listen",
    pressPlay: "Press play to hear it",
    formatsAria: "Music and video",
  },
  supportTeaser: {
    reposAria: "Kinds of work on GitHub",
    markLabel: "GitHub / uset82",
    comeAndLook: "Come and look through the work",
  },
  personalTeaser: {
    themesAria: "Apps in Cosmos",
    fieldLabel: "Cosmos / apps",
    bothOpen: "Both apps are open to try",
  },
  arcadeIndex: {
    identity: "Games, built and measured",
    playableNow: (count: number) => `${count} playable now`,
    status: {
      playable: "Playable now",
      preparing: "Waiting on hosting",
      documentation: "Documented only",
    },
    groups: {
      playable: {
        label: "Play now",
        heading: "These run in your browser, from this page.",
        description: "Press play and they load. Nothing starts on its own.",
      },
      preparing: {
        label: "In preparation",
        heading: "Built and measured, waiting on hosting.",
        description:
          "Each of these runs; none of them is ready to serve to you honestly yet. The reason is stated per game rather than hidden behind a coming-soon label.",
      },
      documentation: {
        label: "Not in a browser",
        heading: "Real games that a browser cannot run.",
        description:
          "One lives on a circuit board and one is a desktop Java application. They are listed because they are mine, not because you can click them.",
      },
    },
    spec: {
      engine: "Engine",
      input: "Input",
      mobile: "On a phone",
      builtSize: "Built size",
    },
    play: (title: string) => `Play ${title}`,
    readDetail: "Read the detail",
    source: "Source",
  },
  arcadeGame: {
    breadcrumb: "Arcade",
    playable: "Playable now",
    notPlayable: "Not playable here yet",
    holdHeading: "Why you cannot play this one here",
    holdNote:
      "The code is public either way. Nothing about this game is hidden; it simply is not honest to put a play button on something this page cannot serve.",
    readSource: "Read the source",
    recordLabel: "The record / 01",
    recordHeading: "What it is built from.",
    spec: {
      engine: "Engine",
      input: "Input",
      controls: "Controls",
      mobile: "On a phone",
      builtSize: "Built size",
      license: "Licence",
    },
    measuredOn: (date: string) => ` Measured ${date}.`,
    navAria: "Arcade game links",
    back: "Back to the arcade",
    sourceOnGitHub: "Source on GitHub",
  },
  gameFrame: {
    playAria: (title: string) => `Play ${title}`,
    frameTitle: (title: string) => `${title}, playable`,
    ready: "Ready to play",
    controlsAria: "Controls",
    cameraWarning:
      "This one asks for your camera. Your browser will ask first, and nothing is recorded or sent anywhere.",
    play: (title: string) => `Play ${title}`,
    openInNewTab: "Open in a new tab",
    stop: "Stop and unload",
    running: (title: string) => `${title} is loaded and running in an isolated frame.`,
    idle: (title: string) => `${title} has not loaded yet. Nothing runs until you press play.`,
  },
};

/**
 * Derived from the English object rather than declared separately, so adding a
 * string in English is what forces a Spanish translation to exist. `EN` is
 * deliberately not `as const`: literal types here would make every Spanish
 * string a type error instead of only the missing ones.
 */
type UiCopy = typeof EN;

const ES: UiCopy = {
  common: {
    skipToContent: "Saltar al contenido principal",
    externalSite: " — sitio externo",
    switchLanguage: "Read in English",
    switchLanguageAria: "Switch to English",
  },
  header: {
    homeAria: "Carlos Alfredo Carpio Meza — inicio",
    primaryNavAria: "Navegación principal",
    experienceAria: "Ajustes de la experiencia",
    experience: "Experiencia",
  },
  footer: {
    primaryNavAria: "Navegación principal del sitio",
    secondaryNavAria: "Explorar y enlaces externos",
    nav: {
      play: "Juega",
      see: "Mira",
      listen: "Escucha",
      about: "Sobre mí",
      laboratory: "Laboratorio",
      cosmos: "Cosmos",
      support: "Apoyo",
    },
    signature:
      "Carlos Alfredo Carpio Meza · Ingeniero · Inventor · Tecnólogo creativo · Hecho como un portafolio semántico con una capa inmersiva opcional.",
  },
  home: {
    guideNote: "CACM AI sigue siendo la guía pública del portafolio.",
    soundLabTitle: "Laboratorio de sonido",
    soundLabDescriptor: "Instrumento armónico",
  },
  arcadeTeaser: {
    label: "Arcade / 03",
    playableNow: (count: number) => `${count} jugables ahora`,
    noneHosted: (total: number) => `${total} juegos, ninguno alojado todavía`,
    headingPlayable: "A algunos de estos juegos puedes jugar sin más.",
    headingEmpty: "Los juegos, y qué necesita cada uno.",
    descriptionPlayable:
      "Entra y prueba un juego cuando quieras. Funcionan aquí, en el navegador, y puedes curiosear también los que aún están en camino.",
    descriptionEmpty:
      "El estante completo está aquí: motor, controles, tamaño y por qué cada uno todavía no se puede jugar en esta página.",
    action: "Entrar en el Arcade",
    cabinet: (total: number) => `Juega / ${total} títulos`,
  },
  mediaTeaser: {
    instrumentLabel: "Sonido / Escucha",
    pressPlay: "Pulsa play para oírlo",
    formatsAria: "Música y vídeo",
  },
  supportTeaser: {
    reposAria: "Tipos de trabajo en GitHub",
    markLabel: "GitHub / uset82",
    comeAndLook: "Ven a curiosear el trabajo",
  },
  personalTeaser: {
    themesAria: "Apps en Cosmos",
    fieldLabel: "Cosmos / apps",
    bothOpen: "Las dos apps están abiertas para probar",
  },
  arcadeIndex: {
    identity: "Juegos, hechos y medidos",
    playableNow: (count: number) => `${count} jugables ahora`,
    status: {
      playable: "Jugable ahora",
      preparing: "Esperando alojamiento",
      documentation: "Solo documentado",
    },
    groups: {
      playable: {
        label: "Juega ahora",
        heading: "Estos funcionan en tu navegador, desde esta página.",
        description: "Pulsa jugar y se cargan. Nada arranca por su cuenta.",
      },
      preparing: {
        label: "En preparación",
        heading: "Hechos y medidos, esperando alojamiento.",
        description:
          "Todos estos funcionan; ninguno está listo todavía para ofrecértelo con honestidad. El motivo se dice juego por juego en lugar de esconderlo tras un cartel de próximamente.",
      },
      documentation: {
        label: "Fuera del navegador",
        heading: "Juegos reales que un navegador no puede ejecutar.",
        description:
          "Uno vive en una placa de circuito y otro es una aplicación Java de escritorio. Están listados porque son míos, no porque puedas hacerles clic.",
      },
    },
    spec: {
      engine: "Motor",
      input: "Control",
      mobile: "En el móvil",
      builtSize: "Tamaño",
    },
    play: (title: string) => `Jugar a ${title}`,
    readDetail: "Leer la ficha",
    source: "Código",
  },
  arcadeGame: {
    breadcrumb: "Arcade",
    playable: "Jugable ahora",
    notPlayable: "Aquí todavía no se puede jugar",
    holdHeading: "Por qué a este no puedes jugar aquí",
    holdNote:
      "El código es público de todas formas. Nada de este juego está escondido; sencillamente no sería honesto poner un botón de jugar en algo que esta página no puede servir.",
    readSource: "Leer el código",
    recordLabel: "El registro / 01",
    recordHeading: "Con qué está hecho.",
    spec: {
      engine: "Motor",
      input: "Control",
      controls: "Controles",
      mobile: "En el móvil",
      builtSize: "Tamaño",
      license: "Licencia",
    },
    measuredOn: (date: string) => ` Medido el ${date}.`,
    navAria: "Enlaces del juego",
    back: "Volver al arcade",
    sourceOnGitHub: "Código en GitHub",
  },
  gameFrame: {
    playAria: (title: string) => `Jugar a ${title}`,
    frameTitle: (title: string) => `${title}, jugable`,
    ready: "Listo para jugar",
    controlsAria: "Controles",
    cameraWarning:
      "Este pide tu cámara. Tu navegador preguntará primero, y no se graba ni se envía nada a ninguna parte.",
    play: (title: string) => `Jugar a ${title}`,
    openInNewTab: "Abrir en una pestaña nueva",
    stop: "Parar y descargar",
    running: (title: string) => `${title} está cargado y funcionando en un marco aislado.`,
    idle: (title: string) =>
      `${title} todavía no se ha cargado. Nada funciona hasta que pulses jugar.`,
  },
};

export const UI: Record<Locale, UiCopy> = { en: EN, es: ES };

export function ui(locale: Locale): UiCopy {
  return UI[locale];
}
