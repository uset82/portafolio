import { ThreadChips } from "@/components/thread-chips";
import { ActionLink, StatusTag } from "@/components/ui";
import { ARCADE_SUMMARY, type ArcadeGame } from "@/content/arcade";

/**
 * A game plus the one thing the roster cannot know on its own: whether this
 * particular deployment can actually serve it. The page resolves that and hands
 * it down, so this component never reads the environment.
 */
export type ResolvedArcadeGame = ArcadeGame & { playable: boolean };

type ArcadeIndexProps = {
  games: readonly ResolvedArcadeGame[];
};

const sectionCopy = {
  playable: {
    index: "01",
    label: "Play now",
    heading: "These run in your browser, from this page.",
    description: "Press play and they load. Nothing starts on its own.",
  },
  preparing: {
    index: "02",
    label: "In preparation",
    heading: "Built and measured, waiting on hosting.",
    description:
      "Each of these runs; none of them is ready to serve to you honestly yet. The reason is stated per game rather than hidden behind a coming-soon label.",
  },
  documentation: {
    index: "03",
    label: "Not in a browser",
    heading: "Real games that a browser cannot run.",
    description:
      "One lives on a circuit board and one is a desktop Java application. They are listed because they are mine, not because you can click them.",
  },
} as const;

function toneFor(game: ResolvedArcadeGame) {
  if (game.playable) return "ready" as const;
  return game.status === "preparing" ? ("concept" as const) : ("neutral" as const);
}

function statusLabel(game: ResolvedArcadeGame) {
  if (game.playable) return "Playable now";
  return game.status === "preparing" ? "Waiting on hosting" : "Documented only";
}

function GameCard({ game }: { game: ResolvedArcadeGame }) {
  return (
    <li className="arcade-index__game">
      <div className="arcade-index__game-head">
        <StatusTag tone={toneFor(game)}>{statusLabel(game)}</StatusTag>
        <p>{game.tagline}</p>
        <h3>{game.title}</h3>
      </div>

      <p className="arcade-index__game-body">{game.description}</p>

      <ThreadChips projectId={game.id} label={`What ${game.title} is about`} />

      <dl className="arcade-index__game-spec">
        <div>
          <dt>Engine</dt>
          <dd>{game.engine}</dd>
        </div>
        <div>
          <dt>Input</dt>
          <dd>{game.input}</dd>
        </div>
        <div>
          <dt>On a phone</dt>
          <dd>{game.mobile}</dd>
        </div>
        <div>
          <dt>Built size</dt>
          <dd>{game.builtSize}</dd>
        </div>
      </dl>

      {game.blockedBy ? <p className="arcade-index__game-block">{game.blockedBy}</p> : null}

      <div className="arcade-index__game-actions">
        {game.playable ? (
          <ActionLink variant="primary" href={`/arcade/${game.slug}`}>
            Play {game.title}
          </ActionLink>
        ) : (
          <ActionLink variant="secondary" href={`/arcade/${game.slug}`}>
            Read the detail
          </ActionLink>
        )}
        <ActionLink href={game.repository} target="_blank" rel="noreferrer">
          Source <span aria-hidden="true">&#8599;</span>
        </ActionLink>
      </div>
    </li>
  );
}

export function ArcadeIndex({ games }: ArcadeIndexProps) {
  const playable = games.filter((game) => game.playable);
  const preparing = games.filter((game) => !game.playable && game.status !== "documentation");
  const documented = games.filter((game) => !game.playable && game.status === "documentation");

  const groups = [
    { key: "playable", copy: sectionCopy.playable, items: playable },
    { key: "preparing", copy: sectionCopy.preparing, items: preparing },
    { key: "documentation", copy: sectionCopy.documentation, items: documented },
  ].filter((group) => group.items.length > 0);

  return (
    <main id="main-content" className="arcade-index">
      <section className="arcade-index__hero" aria-labelledby="arcade-title">
        <div className="arcade-index__rail">
          <p className="section-label">{ARCADE_SUMMARY.eyebrow}</p>
          <StatusTag tone={playable.length > 0 ? "ready" : "concept"}>
            {playable.length} playable now
          </StatusTag>
        </div>

        <div className="arcade-index__identity">
          <p>Games, built and measured</p>
          <h1 id="arcade-title">{ARCADE_SUMMARY.heading}</h1>
          <strong>{ARCADE_SUMMARY.description}</strong>
          <small>{ARCADE_SUMMARY.measurementNote}</small>
        </div>
      </section>

      {groups.map((group) => (
        <section
          key={group.key}
          className="arcade-index__group"
          aria-labelledby={`arcade-group-${group.key}`}
        >
          <header>
            <p className="section-label">
              {group.copy.label} / {group.copy.index}
            </p>
            <h2 id={`arcade-group-${group.key}`}>{group.copy.heading}</h2>
            <p>{group.copy.description}</p>
          </header>

          <ul className="arcade-index__games" aria-label={group.copy.label}>
            {group.items.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
