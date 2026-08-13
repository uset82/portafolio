import { GameFrame } from "@/components/arcade/game-frame";
import { ActionLink, StatusTag } from "@/components/ui";
import type { ArcadeGame } from "@/content/arcade";

type ArcadeGameDetailProps = {
  game: ArcadeGame;
  /** Resolved on the server. `null` means this build cannot serve the game. */
  source: string | null;
};

export function ArcadeGameDetail({ game, source }: ArcadeGameDetailProps) {
  const playable = game.status === "playable" && source !== null;
  const sameOrigin = game.source.kind === "same-origin";

  return (
    <main id="main-content" className="arcade-game">
      <section className="arcade-game__hero" aria-labelledby="arcade-game-title">
        <div className="arcade-game__rail">
          <p className="section-label">Arcade / {game.tagline}</p>
          <StatusTag tone={playable ? "ready" : "concept"}>
            {playable ? "Playable now" : "Not playable here yet"}
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
        />
      ) : (
        <section className="arcade-game__hold" aria-labelledby="arcade-game-hold-title">
          <h2 id="arcade-game-hold-title">Why you cannot play this one here</h2>
          <p>{game.blockedBy}</p>
          <p className="arcade-game__hold-note">
            The code is public either way. Nothing about this game is hidden; it simply is not
            honest to put a play button on something this page cannot serve.
          </p>
          <ActionLink variant="primary" href={game.repository} target="_blank" rel="noreferrer">
            Read the source <span aria-hidden="true">&#8599;</span>
          </ActionLink>
        </section>
      )}

      <section className="arcade-game__record" aria-labelledby="arcade-game-record-title">
        <header>
          <p className="section-label">The record / 01</p>
          <h2 id="arcade-game-record-title">What it is built from.</h2>
        </header>

        <dl>
          <div>
            <dt>Engine</dt>
            <dd>{game.engine}</dd>
          </div>
          <div>
            <dt>Input</dt>
            <dd>{game.input}</dd>
          </div>
          <div>
            <dt>Controls</dt>
            <dd>
              <ul>
                {game.controls.map((control) => (
                  <li key={control}>{control}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt>On a phone</dt>
            <dd>{game.mobile}</dd>
          </div>
          <div>
            <dt>Built size</dt>
            <dd>
              {game.builtSize}
              <small> Measured {game.measuredOn}.</small>
            </dd>
          </div>
          <div>
            <dt>Licence</dt>
            <dd>{game.license}</dd>
          </div>
        </dl>

        <nav aria-label="Arcade game links">
          <ActionLink variant="secondary" href="/arcade">
            Back to the arcade
          </ActionLink>
          <ActionLink href={game.repository} target="_blank" rel="noreferrer">
            Source on GitHub <span aria-hidden="true">&#8599;</span>
          </ActionLink>
        </nav>
      </section>
    </main>
  );
}
