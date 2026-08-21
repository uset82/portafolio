import type { CosmosApp } from "@/content/cosmos";
import type { Locale } from "@/lib/i18n";

/**
 * Spanish wording for the two Cosmos apps. Repository URLs and app names come
 * from `cosmos.ts` in both languages.
 */
const COSMOS_APPS_ES: Record<
  CosmosApp["id"],
  Omit<CosmosApp, "id" | "name" | "repository" | "tryUrl">
> = {
  astraea: {
    kind: "Astrología",
    status: "Abierta para probar",
    summary:
      "Astrología de carta natal inspirada en astro.com, con interpretación por IA a partir de los datos de la carta. Puedes probarla en su propio sitio.",
    repositoryLabel: "Ver ASTROEA",
    tryLabel: "Probar ASTROEA",
  },
  pinaculo: {
    kind: "Numerología",
    status: "Abierta para probar",
    summary:
      "Un sistema de numerología de 24 posiciones. Las interpretaciones se apoyan en Carl Jung. Puedes probarlo en su propio sitio.",
    repositoryLabel: "Ver Pináculo",
    tryLabel: "Probar Pináculo",
  },
};

export const COSMOS_CONTRIBUTE_ES = {
  heading: "Los repositorios son públicos.",
  body: "Puedes leer el código y abrir una conversación en GitHub. Estos dos todavía no llevan licencia MIT, así que este sitio no invita a reutilizarlos como sí hace con los cuatro repositorios MIT de Apoyo.",
} as const;

export function localizeCosmosApp(app: CosmosApp, locale: Locale): CosmosApp {
  if (locale === "en") return app;

  const copy = COSMOS_APPS_ES[app.id];
  if (!copy) return app;

  return {
    ...app,
    kind: copy.kind,
    status: copy.status,
    summary: copy.summary,
    repositoryLabel: copy.repositoryLabel,
    tryLabel: app.tryLabel ? copy.tryLabel : null,
  };
}
