/**
 * Spanish wording for the Sound room.
 *
 * Platform names, handles and URLs stay in `media-library.ts` so both languages
 * point at exactly the same places. Track titles stay as the platform stores
 * them; only the prose around a track is translated.
 */
import type { MusicTrack } from "@/content/media-library";
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
    "Los reproductores se cargan al hacer clic. Cargar uno comparte tu dirección IP y la información de tu navegador con ese proveedor. La versión de prueba de StrudelAI se abre en su propio sitio.",
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
      "Zorba y sirtaki griegos frente a bhangra punyabí, con el bouzouki siempre por encima. Tres minutos y medio, casi sin voces.",
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

export const STRUDEL_AI_ES = {
  status: "Abierto para probar",
  summary:
    "Un sistema público de música en código en vivo. La versión está lista para que la gente la pruebe, y quien quiera contribuir es bienvenido.",
  demoLabel: "Abrir la versión de prueba",
  repositoryLabel: "Ver el repositorio",
} as const;
