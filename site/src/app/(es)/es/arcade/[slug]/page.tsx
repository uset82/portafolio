import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArcadeGameDetail } from "@/components/arcade/arcade-game-detail";
import { ARCADE_GAMES, findArcadeGame, resolveArcadeSource } from "@/content/arcade";
import { localizeArcadeGame } from "@/content/i18n/arcade-es";

type ArcadeGamePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return ARCADE_GAMES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ArcadeGamePageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = findArcadeGame(slug);
  if (!game) return {};

  const localized = localizeArcadeGame(game, "es");
  return {
    title: localized.title,
    description: localized.description,
    alternates: {
      canonical: `/es/arcade/${slug}`,
      languages: { en: `/arcade/${slug}`, es: `/es/arcade/${slug}` },
    },
  };
}

export default async function ArcadeGamePageEs({ params }: ArcadeGamePageProps) {
  const { slug } = await params;
  const game = findArcadeGame(slug);

  if (!game) notFound();

  return (
    <ArcadeGameDetail
      game={localizeArcadeGame(game, "es")}
      source={resolveArcadeSource(game)}
      locale="es"
    />
  );
}
