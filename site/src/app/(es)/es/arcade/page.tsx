import type { Metadata } from "next";

import { ArcadeIndex, type ResolvedArcadeGame } from "@/components/arcade/arcade-index";
import { ARCADE_GAMES, isArcadeGamePlayable } from "@/content/arcade";
import { localizeArcadeGame } from "@/content/i18n/arcade-es";

export const metadata: Metadata = {
  title: "Arcade",
  description:
    "Juegos hechos por Carlos Alfredo Carpio Meza: a cuáles puedes jugar ahora mismo en el navegador y cuáles funcionan sobre hardware.",
  alternates: { canonical: "/es/arcade", languages: { en: "/arcade", es: "/es/arcade" } },
};

export default function ArcadePageEs() {
  const games: ResolvedArcadeGame[] = ARCADE_GAMES.map((game) => ({
    ...localizeArcadeGame(game, "es"),
    playable: isArcadeGamePlayable(game),
  }));

  return <ArcadeIndex games={games} locale="es" />;
}
