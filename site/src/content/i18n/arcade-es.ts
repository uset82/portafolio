import type { ArcadeGame } from "@/content/arcade";
import type { Locale } from "@/lib/i18n";

/**
 * The Spanish arcade roster.
 *
 * This is an overlay, not a second roster: `arcade.ts` stays the single record
 * of what was measured and when, and this file only restates the prose in
 * Spanish. Sizes, dates, licences and URLs are never duplicated here, so a
 * re-measurement cannot leave one language quietly claiming the old number.
 *
 * `builtSize` is the one exception. It is prose with a number inside it, so the
 * translation carries the number too, and the contract test in
 * `src/tests/i18n.test.ts` checks that every digit in the English string still
 * appears in the Spanish one.
 */
export type ArcadeGameCopy = {
  tagline: string;
  description: string;
  engine: string;
  input: string;
  controls: readonly string[];
  mobile: string;
  builtSize: string;
  license: string;
  blockedBy?: string;
};

const NO_LICENCE_CARLOS =
  "Todavía no hay archivo LICENSE en el repositorio - todos los derechos reservados por Carlos Carpio";

const NO_LICENCE_JACOB =
  "Todavía no hay archivo LICENSE en el repositorio - todos los derechos reservados por su autor, Jacob, hijo de Carlos Carpio";

export const ARCADE_GAMES_ES: Record<string, ArcadeGameCopy> = {
  jacobgolf: {
    tagline: "Minigolf en el navegador",
    description:
      "Este no es mío. Lo hizo mi hijo Jacob cuando tenía nueve años: su idea, su juego. Yo le expliqué las instrucciones y él mismo lo arregló. Es un minigolf en el navegador hecho con canvas de HTML5 y JavaScript puro: haz clic o arrastra para apuntar y suelta para tirar.",
    engine: "Canvas de HTML5 y JavaScript puro",
    input: "Ratón o toque",
    controls: [
      "Haz clic o arrastra desde la pelota para apuntar",
      "Suelta para tirar",
      "Esquiva el agua y las rocas",
    ],
    mobile: "La versión publicada es un juego de canvas que acepta apuntar con clic o arrastre.",
    builtSize: "17 KB alojados (702 B de HTML, 14,9 KB de JS, 1,4 KB de CSS), medido el 2026-08-16",
    license: NO_LICENCE_JACOB,
  },
  qubesolve: {
    tagline: "Resolutor de cubo de Rubik en 3D",
    description:
      "Un resolutor de cubo de Rubik en 3D y rompecabezas interactivo hecho con Three.js. Gira y manipula el cubo, introduce cualquier estado y sigue la solución óptima paso a paso.",
    engine: "TypeScript y Three.js",
    input: "Ratón o toque",
    controls: [
      "Haz clic o arrastra para girar las caras y verlo desde cualquier ángulo",
      "Sigue los algoritmos de resolución paso a paso",
    ],
    mobile: "El canvas 3D interactivo funciona en navegadores modernos de móvil y de escritorio.",
    builtSize: "Alojado en Netlify, medido el 2026-08-16",
    license: NO_LICENCE_CARLOS,
  },
  "my-football-game": {
    tagline: "Fútbol en canvas para dos",
    description:
      "Este también es de Jacob. Mi hijo lo hizo cuando tenía nueve años: su idea, su juego y sus propios arreglos una vez que le expliqué las instrucciones. Es un partido de fútbol en canvas: un jugador contra la máquina, o dos jugadores compartiendo el mismo teclado. También trae un modo en línea, pero el servidor de Socket.IO al que llama ya no responde, así que los modos locales son los fiables.",
    engine: "Canvas 2D, con Socket.IO detrás del modo en línea",
    input: "Teclado, con controles táctiles en pantalla",
    controls: [
      "Jugador uno: flechas para moverse, espacio para chutar, mayúsculas y espacio para el disparo potente",
      "Jugador dos: WASD para moverse, E para chutar, Q y E para el disparo potente",
      "Panel táctil en pantalla en el móvil",
    ],
    mobile: "Trae controles táctiles; dos jugadores en un mismo teclado pide un escritorio.",
    builtSize: "36 KB transferidos desde el servidor (1,9 KB de HTML), 154 KB descomprimidos",
    license: NO_LICENCE_JACOB,
  },
  "monkey-tug-of-war": {
    tagline: "Cálculo mental para clase",
    description:
      "Un juego de aula hecho con Flutter y Flame: responde la operación más rápido que el otro lado y arrastra la cuerda hacia ti. Está pensado para el navegador y para una pantalla compartida.",
    engine: "Flutter y Flame",
    input: "Toque o teclado numérico en pantalla",
    controls: ["Toca el teclado numérico para responder", "No hace falta teclado físico"],
    mobile:
      "Funciona en cualquier navegador; la carga de Flutter sigue siendo de varios megabytes en una conexión móvil.",
    builtSize:
      "774 KB transferidos desde el servidor, 2,6 MB descomprimidos, más el renderizador CanvasKit que la página descarga de un CDN de Google",
    license: NO_LICENCE_CARLOS,
  },
  gimmemycake: {
    tagline: "Alcanza el pastel con las manos",
    description:
      "Una escena en tres dimensiones que se juega con las manos: MediaPipe lee la cámara y tu gesto le lanza pastel al bebé que llora, y un modo de arrastrar y lanzar cubre los equipos sin cámara. Es con diferencia lo más pesado de aquí, así que ábrelo con una conexión que lo aguante.",
    engine: "Vite, Three.js y MediaPipe Hands",
    input: "Seguimiento de manos por cámara, con ratón y táctil",
    controls: [
      "Permite el acceso a la cámara, junta los dedos para coger un pastel y suelta para dárselo al bebé",
      "O arrastra un pastel con el ratón o el dedo, sin cámara",
    ],
    mobile:
      "Necesita HTTPS y permiso de cámara, y son 33 MB de descarga: poco amable con una conexión móvil.",
    builtSize:
      "32,7 MB transferidos desde el servidor, de los cuales un solo archivo de modelo de 29,5 MB es casi todo, más MediaPipe desde un CDN",
    license: NO_LICENCE_CARLOS,
  },
  "drone-lips": {
    tagline: "Pilota un dron con la cara",
    description:
      "MediaPipe sigue los puntos de tu cara y los convierte en mando de vuelo, así que el dron responde a tu gesto en lugar de a un control. Vuela solo hacia delante; tú lo llevas entre los diamantes y esquivando enemigos con la cara.",
    engine: "Astro, React Three Fiber y MediaPipe Face",
    input: "Seguimiento facial por cámara",
    controls: [
      "Permite el acceso a la cámara y pulsa empezar",
      "Mueve la boca a izquierda, derecha, arriba o abajo para desplazarte",
      "Abre la boca para acelerar; parpadea para disparar y mantén el parpadeo para disparar seguido",
    ],
    mobile: "Está pensado para la cámara del móvil; necesita HTTPS y permiso de cámara.",
    builtSize:
      "201 KB transferidos al abrir la página y unos 10 MB en cuanto pulsas empezar, casi todo el modelo facial de MediaPipe",
    license: NO_LICENCE_CARLOS,
  },
  "3doodle": {
    tagline: "Dibuja y guarda lo que dibujaste",
    description:
      "Un lienzo de dibujo para niños: elige un color, un grosor y una herramienta, traza un contorno y pulsa Generate 3D para que el resultado caiga en la galería que hay al lado. La versión publicada lleva su propio servidor, así que el dibujo se guarda en lugar de perderse al recargar.",
    engine: "Vite y React, con un servidor de Express, Drizzle y Postgres",
    input: "Dibujo con ratón o con el dedo",
    controls: [
      "Dibuja con el puntero o con el dedo",
      "Elige un color, un grosor o las herramientas de borrar y rellenar",
      "Pulsa Generate 3D para mandar el dibujo a la galería",
    ],
    mobile: "Incluye una disposición de dibujo para móvil.",
    builtSize:
      "140 KB transferidos desde el servidor (2,1 KB de HTML, 126 KB de JS, 12 KB de CSS), 493 KB descomprimidos",
    license: NO_LICENCE_CARLOS,
  },
  mandelbro: {
    tagline: "Creador de mundos para niños",
    description:
      "Esto fue un proyecto de idea: un prototipo hecho para probar si el concepto se sostenía, no un juego terminado. Elige un personaje, describe el mundo que quieras y constrúyelo a partir de una de seis plantillas: cuevas de bloques, defensa aérea, carreras, recreativa retro, océano o galaxia. La versión simplificada funciona entera en tu navegador, sin cuenta y sin llamadas de red.",
    engine: "Canvas de HTML5",
    input: "Ratón o toque",
    controls: [
      "Haz clic o toca para elegir personaje y plantilla",
      "Escribe una descripción del mundo que quieres",
    ],
    mobile:
      "Funciona en el móvil; la cuadrícula de plantillas se lee mejor en una pantalla grande.",
    builtSize: "74 KB, un único archivo autónomo",
    license: NO_LICENCE_CARLOS,
  },
  reactiongame: {
    tagline: "Reflejos, sobre hardware real",
    description:
      "Un juego de tiempo de reacción escrito en C para un microcontrolador, con botones y luces físicos. Es un juego real y terminado; sencillamente no vive en un navegador.",
    engine: "C sobre un microcontrolador",
    input: "Botones físicos",
    controls: ["Botones físicos en la placa"],
    mobile: "No aplica: este funciona sobre una placa de circuito.",
    builtSize: "0,8 MB de código fuente",
    license: NO_LICENCE_CARLOS,
    blockedBy:
      "Funciona sobre hardware, no en un navegador. El repositorio es el registro honesto.",
  },
  tetris: {
    tagline: "Trabajo de curso, en Java",
    description:
      "La implementación propia de Carlos en un curso donde el profesor dio un ejemplo. El código es suyo; es una aplicación Java de escritorio, así que aparece listada aquí en lugar de incrustada.",
    engine: "Java de escritorio",
    input: "Teclado",
    controls: ["Teclas de flecha, sobre un entorno Java de escritorio"],
    mobile: "No aplica: Java de escritorio.",
    builtSize: "1,8 MB de código fuente",
    license: "CC-BY-4.0 - requiere atribución",
    blockedBy:
      "Java de escritorio no funciona en un navegador. Queda fuera por su forma, no por su autoría.",
  },
};

export const ARCADE_SUMMARY_ES = {
  eyebrow: "Arcade / Juega",
  heading: "Juegos a los que puedes jugar, y el estado honesto del resto.",
  description:
    "Todos los juegos de aquí son míos, menos el minigolf y el fútbol: esos dos son de mi hijo Jacob, hechos cuando tenía nueve años. La mayoría funcionan en esta página; dos funcionan sobre hardware o sobre un entorno de escritorio y nunca lo harán. Cada uno dice cuál es su caso, qué necesita y dónde vive su código.",
  measurementNote:
    "Los tamaños salen de una compilación real de cada repositorio el 2026-07-31, no del tamaño del repositorio. Los juegos servidos desde un host de Netlify se volvieron a medir contra ese host: Jacobs Golfspill y QubeSolve el 2026-08-16, y 3Doodle, My Football Game, Monkey Tug of War, Gimme My Cake y Drone Lips el 2026-08-21.",
} as const;

/**
 * Returns the game with its prose in `locale`. The measured fields are copied
 * from the English record untouched, so only the wording changes.
 */
export function localizeArcadeGame(game: ArcadeGame, locale: Locale): ArcadeGame {
  if (locale === "en") return game;

  const copy = ARCADE_GAMES_ES[game.id];
  if (!copy) return game;

  return {
    ...game,
    tagline: copy.tagline,
    description: copy.description,
    engine: copy.engine,
    input: copy.input,
    controls: copy.controls,
    mobile: copy.mobile,
    builtSize: copy.builtSize,
    license: copy.license,
    ...(copy.blockedBy ? { blockedBy: copy.blockedBy } : {}),
  };
}
