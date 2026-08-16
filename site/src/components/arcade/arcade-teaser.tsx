import { ActionLink } from "@/components/ui";
import { type ArcadeGame } from "@/content/arcade";

type ArcadeTeaserProps = {
  /** Games this build can actually serve. Resolved by the page, never guessed. */
  playable: readonly ArcadeGame[];
  /** How many games the roster carries in total, playable or not. */
  total: number;
};

/**
 * The homepage's one claim about the arcade.
 *
 * The count comes from the resolved roster, so this section cannot promise a
 * playable game that the deployment does not serve. Game titles live on
 * `/arcade`; repeating them here would make the click a second reading of the
 * same list. When nothing resolves it says so and still offers the route.
 */
export function ArcadeTeaser({ playable, total }: ArcadeTeaserProps) {
  const headingId = "arcade-teaser-title";
  const hasPlayable = playable.length > 0;

  return (
    <section className="arcade-teaser" aria-labelledby={headingId}>
      <div className="arcade-teaser__copy">
        <p className="section-label">Arcade / 03</p>
        <p className="arcade-teaser__status">
          <span aria-hidden="true" />
          {hasPlayable ? `${playable.length} playable now` : `${total} games, none hosted yet`}
        </p>
        <h2 id={headingId}>
          {hasPlayable
            ? "You can just play some of these games."
            : "The games, and what each one needs."}
        </h2>
        <p className="arcade-teaser__description">
          {hasPlayable
            ? "Come in and try a game whenever you like. They run here in the browser, and you are welcome to browse the ones still on the way."
            : "The full shelf is here: engine, controls, size, and why each one is not playable on this page yet."}
        </p>

        <ActionLink className="arcade-teaser__action" href="/arcade">
          Enter the Arcade <span aria-hidden="true">&#8594;</span>
        </ActionLink>
      </div>

      <div className="arcade-teaser__cabinet" aria-hidden="true">
        <span className="arcade-teaser__cabinet-label">Play / {total} titles</span>
        <div className="arcade-teaser__screen">
          <svg className="arcade-teaser__mark" viewBox="0 0 96 72" focusable="false">
            <rect className="arcade-teaser__mark-block" x="14" y="46" width="20" height="10" />
            <rect className="arcade-teaser__mark-cap" x="14" y="46" width="20" height="2.2" />
            <rect className="arcade-teaser__mark-block" x="38" y="34" width="18" height="10" />
            <rect className="arcade-teaser__mark-cap" x="38" y="34" width="18" height="2.2" />
            <rect className="arcade-teaser__mark-block" x="60" y="22" width="16" height="10" />
            <rect className="arcade-teaser__mark-cap" x="60" y="22" width="16" height="2.2" />
            <circle className="arcade-teaser__mark-figure" cx="24" cy="35.4" r="3.6" />
            <rect
              className="arcade-teaser__mark-figure"
              x="21.4"
              y="38.6"
              width="5.2"
              height="7.4"
            />
            <g className="arcade-teaser__mark-coin">
              <rect x="64.6" y="12.6" width="6.8" height="6.8" transform="rotate(45 68 16)" />
            </g>
            <rect className="arcade-teaser__mark-ground" x="10" y="60" width="76" height="2.4" />
          </svg>
        </div>
        <div className="arcade-teaser__controls">
          <b />
          <i />
          <i />
        </div>
        <small>{hasPlayable ? "Press play to load" : "Nothing loads on its own"}</small>
      </div>
    </section>
  );
}
