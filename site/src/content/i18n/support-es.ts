/**
 * Spanish wording for the support content.
 *
 * As with the arcade, this is prose only: licences, repository names, URLs and
 * counts stay in `support.ts` so there is one place where they can be wrong.
 */
export const SUPPORT_TEASER_ES = {
  eyebrow: "GitHub / Contribuir",
  status: "El trabajo está en GitHub",
  heading: "Entra y curiosea el trabajo.",
  description:
    "Puedes recorrer los repositorios con toda libertad: juegos, música, IA, hardware y herramientas. Cuatro llevan licencia MIT por si quieres abrir una incidencia o mandar un pull request.",
  threads: ["Juegos", "Música", "IA", "Hardware", "Herramientas"],
  actionLabel: "Contribuir",
  actionHref: "/support",
  repositoriesLabel: "Ver los repositorios",
} as const;

export const SUPPORT_SUMMARY_ES = {
  eyebrow: "Apoyo / 06",
  heading: "Si algo de aquí te ha valido el rato.",
  description:
    "Hay dos formas de devolver algo, y ninguna es obligatoria. Contribuir al código, o invitarme un café.",
} as const;

export const OPEN_SOURCE_ES = {
  eyebrow: "Código abierto / Contribuir",
  heading: "Hoy hay cuatro repositorios abiertos a contribución.",
  description:
    "Estos llevan licencia MIT, lo que significa que puedes leerlos, bifurcarlos, cambiarlos y reutilizarlos. Abre una incidencia o manda un pull request; se leen las dos cosas.",
  repositoriesLabel: "Ver los repositorios",
  licensingNote: {
    heading: "El resto se puede leer, pero todavía no reutilizar.",
    body: "37 de mis 42 repositorios propios siguen sin archivo de licencia, lo que por defecto significa todos los derechos reservados. Puedes leerlos en GitHub, pero legalmente no puedes construir sobre ellos hasta que eso cambie. Aplicarles MIT es una decisión pendiente, no un descuido que esté escondiendo.",
  },
} as const;

/** Repository blurbs on the support page, keyed by repository id. */
export const CONTRIBUTABLE_REPOS_ES: Record<string, string> = {
  portafolio:
    "Este sitio. Next.js y TypeScript, con el modelo de contenido, el arcade y la sala de sonido a la vista.",
  "thesis-writer-kit":
    "Un kit de escritura para trabajos de tesis, y el único proyecto escrito en Rust. El mejor sitio para ayudar si lo tuyo son los lenguajes de sistemas.",
  smarthomecontrol:
    "Control de domótica en Python. Lo bastante pequeño para leerlo de una sentada, lo que lo hace una primera contribución justa.",
  "qr-code-generator":
    "Un generador de QR pequeño en JavaScript. El repositorio más pequeño de esta lista y el camino más corto a un primer pull request.",
};

export const TIP_ES = {
  note: "Totalmente opcional. Los juegos, la música y el código siguen siendo gratis y iguales de todas formas.",
} as const;

type SupportBundle<S, O, R extends readonly { id: string; description: string }[], T> = {
  summary: S;
  openSource: O;
  repos: R;
  tip: T;
};

/**
 * Restates the support room in `locale`. Licences, counts, dates and URLs come
 * from the English record in both languages.
 */
export function localizeSupport<
  S extends { eyebrow: string; heading: string; description: string },
  O extends {
    eyebrow: string;
    heading: string;
    description: string;
    repositoriesLabel: string;
    licensingNote: { heading: string; body: string; auditedOn: string };
  },
  R extends readonly { id: string; description: string }[],
  T extends { note: string },
>(bundle: SupportBundle<S, O, R, T>, locale: "en" | "es"): SupportBundle<S, O, R, T> {
  if (locale === "en") return bundle;

  return {
    summary: { ...bundle.summary, ...SUPPORT_SUMMARY_ES },
    openSource: {
      ...bundle.openSource,
      eyebrow: OPEN_SOURCE_ES.eyebrow,
      heading: OPEN_SOURCE_ES.heading,
      description: OPEN_SOURCE_ES.description,
      repositoriesLabel: OPEN_SOURCE_ES.repositoriesLabel,
      licensingNote: {
        ...bundle.openSource.licensingNote,
        heading: OPEN_SOURCE_ES.licensingNote.heading,
        body: OPEN_SOURCE_ES.licensingNote.body,
      },
    },
    repos: bundle.repos.map((repo) => ({
      ...repo,
      description: CONTRIBUTABLE_REPOS_ES[repo.id] ?? repo.description,
    })) as unknown as R,
    tip: { ...bundle.tip, note: TIP_ES.note },
  };
}
