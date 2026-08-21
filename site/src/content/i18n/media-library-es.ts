/**
 * Spanish wording for the Sound room.
 *
 * Platform names, handles, URLs and licence strings stay in `media-library.ts`
 * so both languages point at exactly the same places.
 */
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
    "Todo lo que he publicado con Suno vive aquí. Las pistas sueltas llegan a esta página a medida que se confirman sus derechos, una a una.",
} as const;

export const VIDEO_PROFILE_ES = {
  description:
    "El canal de vídeo. Las piezas seleccionadas se incrustan aquí una vez confirmado que están publicadas y libres de derechos.",
} as const;

export const STRUDEL_AI_ES = {
  status: "Abierto para probar",
  summary:
    "Un sistema público de música en código en vivo. La versión está lista para que la gente la pruebe, y quien quiera contribuir es bienvenido.",
  demoLabel: "Abrir la versión de prueba",
  repositoryLabel: "Ver el repositorio",
} as const;
