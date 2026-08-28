import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArcadeGameDetail } from "@/components/arcade/arcade-game-detail";
import { ARCADE_GAMES, findArcadeGame, resolveArcadeSource } from "@/content/arcade";

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

  return {
    title: game.title,
    description: game.description,
    alternates: {
      canonical: `/arcade/${slug}`,
      languages: { en: `/arcade/${slug}`, es: `/es/arcade/${slug}` },
    },
  };
}

export default async function ArcadeGamePage({ params }: ArcadeGamePageProps) {
  const { slug } = await params;
  const game = findArcadeGame(slug);

  if (!game) notFound();

  return <ArcadeGameDetail game={game} source={resolveArcadeSource(game)} />;
}
