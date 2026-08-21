import { ActionLink, StatusTag } from "@/components/ui";
import { ARCADE_SUMMARY_ES } from "@/content/i18n/arcade-es";
import { ui } from "@/content/i18n/ui";
import { ARCADE_SUMMARY, type ArcadeGame } from "@/content/arcade";
import { localeHref, type Locale } from "@/lib/i18n";

/**
 * A game plus the one thing the roster cannot know on its own: whether this
 * particular deployment can actually serve it. The page resolves that and hands
 * it down, so this component never reads the environment.
 */
export type ResolvedArcadeGame = ArcadeGame & { playable: boolean };

type ArcadeIndexProps = {
  games: readonly ResolvedArcadeGame[];
  locale?: Locale;
};

function toneFor(game: ResolvedArcadeGame) {
  if (game.playable) return "ready" as const;
  return game.status === "preparing" ? ("concept" as const) : ("neutral" as const);
}

function GameCard({ game, locale }: { game: ResolvedArcadeGame; locale: Locale }) {
  const copy = ui(locale).arcadeIndex;
  const statusLabel = game.playable
    ? copy.status.playable
    : game.status === "preparing"
      ? copy.status.preparing
      : copy.status.documentation;

  return (
    <li className="arcade-index__game">
      <div className="arcade-index__game-head">
        <StatusTag tone={toneFor(game)}>{statusLabel}</StatusTag>
        <p>{game.tagline}</p>
        <h3>{game.title}</h3>
      </div>

      <p className="arcade-index__game-body">{game.description}</p>

      <dl className="arcade-index__game-spec">
        <div>
          <dt>{copy.spec.engine}</dt>
          <dd>{game.engine}</dd>
        </div>
        <div>
          <dt>{copy.spec.input}</dt>
          <dd>{game.input}</dd>
        </div>
        <div>
          <dt>{copy.spec.mobile}</dt>
          <dd>{game.mobile}</dd>
        </div>
        <div>
          <dt>{copy.spec.builtSize}</dt>
          <dd>{game.builtSize}</dd>
        </div>
      </dl>

      {game.blockedBy ? <p className="arcade-index__game-block">{game.blockedBy}</p> : null}

      <div className="arcade-index__game-actions">
        {game.playable ? (
          <ActionLink variant="primary" href={localeHref(locale, `/arcade/${game.slug}`)}>
            {copy.play(game.title)}
          </ActionLink>
        ) : (
          <ActionLink variant="secondary" href={localeHref(locale, `/arcade/${game.slug}`)}>
            {copy.readDetail}
          </ActionLink>
        )}
        <ActionLink href={game.repository} target="_blank" rel="noreferrer">
          {copy.source} <span aria-hidden="true">&#8599;</span>
        </ActionLink>
      </div>
    </li>
  );
}

export function ArcadeIndex({ games, locale = "en" }: ArcadeIndexProps) {
  const copy = ui(locale).arcadeIndex;
  const summary = locale === "es" ? ARCADE_SUMMARY_ES : ARCADE_SUMMARY;

  const playable = games.filter((game) => game.playable);
  const preparing = games.filter((game) => !game.playable && game.status !== "documentation");
  const documented = games.filter((game) => !game.playable && game.status === "documentation");

  const groups = [
    { key: "playable", copy: { index: "01", ...copy.groups.playable }, items: playable },
    { key: "preparing", copy: { index: "02", ...copy.groups.preparing }, items: preparing },
    {
      key: "documentation",
      copy: { index: "03", ...copy.groups.documentation },
      items: documented,
    },
  ].filter((group) => group.items.length > 0);

  return (
    <main id="main-content" className="arcade-index">
      <section className="arcade-index__hero" aria-labelledby="arcade-title">
        <div className="arcade-index__rail">
          <p className="section-label">{summary.eyebrow}</p>
          <StatusTag tone={playable.length > 0 ? "ready" : "concept"}>
            {copy.playableNow(playable.length)}
          </StatusTag>
        </div>

        <div className="arcade-index__identity">
          <p>{copy.identity}</p>
          <h1 id="arcade-title">{summary.heading}</h1>
          <strong>{summary.description}</strong>
          <small>{summary.measurementNote}</small>
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
              <GameCard key={game.id} game={game} locale={locale} />
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
