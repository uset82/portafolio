import { GameFrame } from "@/components/arcade/game-frame";
import { ActionLink, StatusTag } from "@/components/ui";
import { ui } from "@/content/i18n/ui";
import type { ArcadeGame } from "@/content/arcade";
import { localeHref, type Locale } from "@/lib/i18n";

type ArcadeGameDetailProps = {
  game: ArcadeGame;
  /** Resolved on the server. `null` means this build cannot serve the game. */
  source: string | null;
  locale?: Locale;
};

export function ArcadeGameDetail({ game, source, locale = "en" }: ArcadeGameDetailProps) {
  const copy = ui(locale).arcadeGame;
  const playable = game.status === "playable" && source !== null;
  const sameOrigin = game.source.kind === "same-origin";

  return (
    <main id="main-content" className="arcade-game">
      <section className="arcade-game__hero" aria-labelledby="arcade-game-title">
        <div className="arcade-game__rail">
          <p className="section-label">
            {copy.breadcrumb} / {game.tagline}
          </p>
          <StatusTag tone={playable ? "ready" : "concept"}>
            {playable ? copy.playable : copy.notPlayable}
          </StatusTag>
        </div>

        <div className="arcade-game__identity">
          <h1 id="arcade-game-title">{game.title}</h1>
          <strong>{game.description}</strong>
        </div>
      </section>

      {playable && source ? (
        <GameFrame
          title={game.title}
          src={source}
          sameOrigin={sameOrigin}
          controls={game.controls}
          needsCamera={game.needsCamera}
          locale={locale}
        />
      ) : (
        <section className="arcade-game__hold" aria-labelledby="arcade-game-hold-title">
          <h2 id="arcade-game-hold-title">{copy.holdHeading}</h2>
          <p>{game.blockedBy}</p>
          <p className="arcade-game__hold-note">{copy.holdNote}</p>
          <ActionLink variant="primary" href={game.repository} target="_blank" rel="noreferrer">
            {copy.readSource} <span aria-hidden="true">&#8599;</span>
          </ActionLink>
        </section>
      )}

      <section className="arcade-game__record" aria-labelledby="arcade-game-record-title">
        <header>
          <p className="section-label">{copy.recordLabel}</p>
          <h2 id="arcade-game-record-title">{copy.recordHeading}</h2>
        </header>

        <dl>
          <div>
            <dt>{copy.spec.engine}</dt>
            <dd>{game.engine}</dd>
          </div>
          <div>
            <dt>{copy.spec.input}</dt>
            <dd>{game.input}</dd>
          </div>
          <div>
            <dt>{copy.spec.controls}</dt>
            <dd>
              <ul>
                {game.controls.map((control) => (
                  <li key={control}>{control}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt>{copy.spec.mobile}</dt>
            <dd>{game.mobile}</dd>
          </div>
          <div>
            <dt>{copy.spec.builtSize}</dt>
            <dd>
              {game.builtSize}
              <small>{copy.measuredOn(game.measuredOn)}</small>
            </dd>
          </div>
          <div>
            <dt>{copy.spec.license}</dt>
            <dd>{game.license}</dd>
          </div>
        </dl>

        <nav aria-label={copy.navAria}>
          <ActionLink variant="secondary" href={localeHref(locale, "/arcade")}>
            {copy.back}
          </ActionLink>
          <ActionLink href={game.repository} target="_blank" rel="noreferrer">
            {copy.sourceOnGitHub} <span aria-hidden="true">&#8599;</span>
          </ActionLink>
        </nav>
      </section>
    </main>
  );
}
