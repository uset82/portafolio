/**
 * Spanish wording for the Sound room.
 *
 * Platform names, handles and URLs stay in `media-library.ts` so both languages
 * point at exactly the same places. Track titles stay as the platform stores
 * them; only the prose around a track is translated.
 */
import type { MusicTrack, VideoWork } from "@/content/media-library";
import type { Locale } from "@/lib/i18n";

export const SOUND_ROOM_ES = {
  eyebrow: "Sonido / 02",
  heading: "Música que puedes oír y vídeo que puedes ver.",
  description:
    "Música hecha con Suno, vídeo publicado en YouTube y StrudelAI, un sistema de música en código en vivo abierto para probar.",
  emptyState: {
    music:
      "Todavía no hay ninguna pista incrustada aquí. Mientras tanto, el catálogo publicado completo está en Suno.",
    video:
      "Todavía no hay ningún vídeo incrustado aquí. Mientras tanto, el canal publicado completo está en YouTube.",
  },
  playbackNote:
    "Pulsa play y la música se transmite directamente desde Suno; antes de eso no se le pide nada a nadie. Los reproductores de vídeo siguen cargándose al hacer clic, y la versión de prueba de StrudelAI se abre en su propio sitio.",
} as const;

export const MUSIC_PROFILE_ES = {
  description:
    "Las pistas llegan a esta página de una en una, a medida que se confirman sus derechos. El catálogo completo sigue en Suno.",
} as const;

export const VIDEO_PROFILE_ES = {
  description:
    "El canal de vídeo. Las piezas seleccionadas se incrustan aquí una vez confirmado que están publicadas y libres de derechos.",
} as const;

/** Per-track prose, keyed by the track id in `MUSIC_TRACKS`. */
export const MUSIC_TRACKS_ES: Record<string, { description: string; licence: string }> = {
  "abc-on-crete-beach": {
    description:
      "Zorba y sirtaki griegos frente a bhangra punyabí, con el bouzouki siempre por encima.",
    licence:
      "Hecha por Carlos con Suno y puesta aquí por él. Escucharla es gratis; esta página no concede derechos de reutilización.",
  },
};

/** Returns the track with its prose in `locale`. Titles and URLs never change. */
export function localizeTrack(track: MusicTrack, locale: Locale): MusicTrack {
  if (locale === "en") return track;

  const copy = MUSIC_TRACKS_ES[track.id];
  if (!copy) return track;

  return { ...track, description: copy.description, licence: copy.licence };
}

/**
 * Per-video prose, keyed by the video id in `VIDEO_WORKS`. `posterAlt` is
 * translated too: a poster with text baked into it needs that text readable in
 * the language of the page it sits on.
 */
export const VIDEO_WORKS_ES: Record<string, { description: string; posterAlt: string }> = {
  "hedra-seedance-2-5": {
    description:
      "El vídeo de la canción de arriba, generado en Hedra con Seedance 2.5. Tres minutos cincuenta y tres.",
    posterAlt:
      "Cuatro bailarines con ropa punyabí saltan descalzos en una playa griega, con casas encaladas, buganvillas y una barca de madera detrás. El título sobre la imagen dice, en inglés: da vida a tus imágenes y hazlas bailar, con Hedra + Seedance 2.5.",
  },
  "the-second-flood": {
    description:
      "Hecho para el concurso FUTURE VISION de XPRIZE con Flow de Google. Bíblico, profético, futurista: lo que fue volverá a ser, salvo que aprendamos. Una semana generando, arreglando la continuidad y reescribiendo el guión en torno a lo que Flow aceptaba representar. Tres minutos diez.",
    posterAlt:
      "Escena partida bajo una tormenta eléctrica. A la izquierda, un hombre barbudo con túnica de arpillera atada con cuerda está ante un gran arca de madera en construcción. A la derecha, un robot humanoide blanco marcado AURA-9 y dos hombres avanzan por una ciudad inundada de torres blancas curvas, levantando una cápsula de supervivencia iluminada con una persona dormida dentro. El título sobre la imagen dice, en inglés: THE SECOND FLOOD, WILL WE LEARN? — el segundo diluvio, ¿aprenderemos?",
  },
  "stillness-frequency-perfect-place": {
    description:
      "Hecho en Krea a partir de una canción escrita en Suno: Stillness Frequency contra Perfect Place. Un bosque invernal a la luz de la luna, apenas en movimiento, durante toda la pista. Cuatro minutos cuarenta y ocho.",
    posterAlt:
      "Una mujer de pelo blanco y largo, con un vestido azul grisáceo bordado en la cintura, está entre pinos cargados de nieve y mira por encima del hombro desnudo. Una luna llena asoma entre las ramas sobre ella. El encuadre es vertical y va enmarcado en franjas negras.",
  },
};

/** Returns the video with its prose in `locale`. Titles and URLs never change. */
export function localizeVideo(work: VideoWork, locale: Locale): VideoWork {
  if (locale === "en") return work;

  const copy = VIDEO_WORKS_ES[work.id];
  if (!copy) return work;

  return {
    ...work,
    description: copy.description,
    ...(work.poster ? { poster: { ...work.poster, alt: copy.posterAlt } } : {}),
  };
}

export const STRUDEL_AI_ES = {
  status: "Abierto para probar",
  summary:
    "Un sistema público de música en código en vivo. La versión está lista para que la gente la pruebe, y quien quiera contribuir es bienvenido.",
  demoLabel: "Abrir la versión de prueba",
  repositoryLabel: "Ver el repositorio",
} as const;
