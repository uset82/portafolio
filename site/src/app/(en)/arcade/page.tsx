import type { Metadata } from "next";

import { ArcadeIndex, type ResolvedArcadeGame } from "@/components/arcade/arcade-index";
import { ARCADE_GAMES, isArcadeGamePlayable } from "@/content/arcade";

export const metadata: Metadata = {
  title: "Arcade",
  description:
    "Games built by Carlos Alfredo Carpio Meza: which ones you can play in the browser right now, which are waiting on hosting, and which run on hardware instead.",
  alternates: { canonical: "/arcade", languages: { en: "/arcade", es: "/es/arcade" } },
};

export default function ArcadePage() {
  const games: ResolvedArcadeGame[] = ARCADE_GAMES.map((game) => ({
    ...game,
    playable: isArcadeGamePlayable(game),
  }));

  return <ArcadeIndex games={games} />;
}
