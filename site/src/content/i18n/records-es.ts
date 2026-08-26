import type { SiteMetadata } from "@/content/schemas";
import type { Locale } from "@/lib/i18n";

/**
 * Spanish overlay for the approved content records.
 *
 * `records.ts` stays the single source of what has been approved, with its
 * provenance and verification intact. This file only restates the wording, and
 * it keys on the record ids so a renamed heading in English cannot silently
 * keep an old Spanish translation attached to it: the id is the join.
 */

/** Link labels, keyed by the `id` on the record. */
export const LINK_LABELS_ES: Record<string, string> = {
  "nav-work": "Trabajo",
  "nav-arcade": "Arcade",
  "nav-laboratory": "Laboratorio",
  "nav-sound": "Sonido",
  "nav-cosmos": "Cosmos",
  "nav-story": "Historia",
  "nav-support": "Apoyo",
  "nav-contact": "Contacto",
  "footer-visit-contact": "Ir a Contacto",
  "footer-view-github": "Ver GitHub",
  "visit-sound-foundation": "Ir a Sonido",
  "enter-cosmos-foundation": "Entrar en Cosmos",
  "enter-observatory": "Entrar en el Observatorio",
};

export const FOOTER_ES = {
  eyebrow: "Contacto / 05",
  heading: "Veamos lo que ya está ahí, y hagámoslo funcionar.",
  description:
    "La vía de contacto sigue priorizando la privacidad: sin correo público y sin formulario, y una convocatoria abierta en su lugar.",
  status: "Convocatoria abierta, una vía pública",
} as const;

/** Falls back to the English label when a link has not been translated yet. */
export function linkLabelEs(id: string, fallback: string): string {
  return LINK_LABELS_ES[id] ?? fallback;
}

/**
 * Home page copy. The record keeps its structure; only the wording changes, so
 * the page can spread this over the English metadata and keep every id, href
 * and provenance field intact.
 */
export const HOME_ES = {
  eyebrow: "Ingeniero · Inventor · Tecnólogo creativo",
  headline: "Convierto patrones ocultos en sistemas que funcionan.",
  supportingStatement:
    "Desde la inteligencia artificial, la electrónica y la energía del futuro hasta la música, la astrología y la numerología, transformo ideas complejas en experiencias prácticas y con sentido.",
  currentFocus:
    "Ahora mismo exploro agentes de IA, energía resiliente, herramientas creativas y los patrones que conectan la tecnología con la experiencia humana.",
  primaryActionLabel: "Explora el trabajo seleccionado",
  secondaryActionLabel: "Entrar en el Observatorio",
  mediaTeaser: {
    eyebrow: "Escucha / 02",
    heading: "Música que puedes oír y vídeo que puedes ver.",
    description:
      "Entra cuando quieras. Las canciones viven en Suno y los vídeos en YouTube, y nada empieza hasta que pulsas play.",
    status: "Escucha cuando te apetezca",
    formats: ["Música", "Vídeo"],
  },
  personalTeaser: {
    eyebrow: "Astrología + numerología / 03",
    heading: "Entra y prueba las dos apps.",
    description:
      "ASTROEA es astrología inspirada en astro.com. Pináculo es numerología con interpretaciones que se apoyan en Carl Jung. Las dos están abiertas para probar y los dos repositorios son públicos en GitHub.",
    status: "Dos apps que puedes probar",
    claimsBoundary: "Práctica creativa y personal: no es consejo científico, médico ni predictivo.",
  },
} as const;

/** The approved public profile, restated in Spanish. */
export const PROFILE_ES = {
  eyebrow: "Perfil / CV",
  heading: "Una práctica, muchas maneras de mirar.",
  headingAccent: "muchas maneras",
  role: "Ingeniero · Inventor · Tecnólogo creativo",
  biography:
    "Carlos trabaja entre la inteligencia artificial, la electrónica, la energía resiliente, la música, la astrología y la numerología. Su portafolio conecta la práctica de ingeniería con la experimentación creativa, y presenta el trabajo verificado por separado de los prototipos, los estudios personales y los conceptos futuros.",
  practiceThreads: ["IA y electrónica", "Energía resiliente", "Música y sistemas simbólicos"],
} as const;

/**
 * Spreads the Spanish wording over the approved English metadata, so a page
 * gets a record of exactly the same shape with the same ids, hrefs and
 * provenance fields. Only the strings a reader sees are replaced.
 */
export function localizeMetadata(metadata: SiteMetadata, locale: Locale): SiteMetadata {
  if (locale === "en") return metadata;

  return {
    ...metadata,
    eyebrow: HOME_ES.eyebrow,
    headline: HOME_ES.headline,
    supportingStatement: HOME_ES.supportingStatement,
    currentFocus: HOME_ES.currentFocus,
    primaryAction: { ...metadata.primaryAction, label: HOME_ES.primaryActionLabel },
    secondaryAction: { ...metadata.secondaryAction, label: HOME_ES.secondaryActionLabel },
    mediaTeaser: {
      ...metadata.mediaTeaser,
      eyebrow: HOME_ES.mediaTeaser.eyebrow,
      heading: HOME_ES.mediaTeaser.heading,
      description: HOME_ES.mediaTeaser.description,
      status: HOME_ES.mediaTeaser.status,
      formats: [...HOME_ES.mediaTeaser.formats],
      action: {
        ...metadata.mediaTeaser.action,
        label: linkLabelEs(metadata.mediaTeaser.action.id, metadata.mediaTeaser.action.label),
      },
    },
    personalTeaser: {
      ...metadata.personalTeaser,
      eyebrow: HOME_ES.personalTeaser.eyebrow,
      heading: HOME_ES.personalTeaser.heading,
      description: HOME_ES.personalTeaser.description,
      status: HOME_ES.personalTeaser.status,
      claimsBoundary: HOME_ES.personalTeaser.claimsBoundary,
      action: {
        ...metadata.personalTeaser.action,
        label: linkLabelEs(metadata.personalTeaser.action.id, metadata.personalTeaser.action.label),
      },
    },
    footer: {
      ...metadata.footer,
      eyebrow: FOOTER_ES.eyebrow,
      heading: FOOTER_ES.heading,
      description: FOOTER_ES.description,
      status: FOOTER_ES.status,
      primaryAction: {
        ...metadata.footer.primaryAction,
        label: linkLabelEs(metadata.footer.primaryAction.id, metadata.footer.primaryAction.label),
      },
    },
  };
}
