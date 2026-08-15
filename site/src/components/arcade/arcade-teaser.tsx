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
 * The count and the named titles come from the resolved roster, so this section
 * cannot promise a playable game that the deployment does not serve. When
 * nothing resolves it says so and still offers the route, because the arcade
 * page is worth reading even when its games are waiting on hosting.
 */
export function ArcadeTeaser({ playable, total }: ArcadeTeaserProps) {
  const headingId = "arcade-teaser-title";
  const hasPlayable = playable.length > 0;

  return (
    <section className="arcade-teaser" aria-labelledby={headingId}>
      <div className="arcade-teaser__copy">
        <p className="section-label">Play / 01</p>
        <p className="arcade-teaser__status">
          <span aria-hidden="true" />
          {hasPlayable ? `${playable.length} playable now` : `${total} games, none hosted yet`}
        </p>
        <h2 id={headingId}>
          {hasPlayable ? "Some of this you can just play." : "The games, and what each one needs."}
        </h2>
        <p className="arcade-teaser__description">
          {hasPlayable
            ? "Games I built, running in the browser. Nothing loads until you press play, and every game that is not playable here says exactly why."
            : "Every game I have built, with its engine, controls, built size, and the specific reason it is not yet playable on this page."}
        </p>

        {/* The arcade page names the games. Repeating them here would make a
         * visitor read the same list twice and learn nothing from the click, so
         * this teaser carries the count and the reason to go instead. */}
        <ActionLink className="arcade-teaser__action" href="/arcade">
          {hasPlayable ? `See all ${total} games` : "See the games"}{" "}
          <span aria-hidden="true">&#8594;</span>
        </ActionLink>
      </div>

      <div className="arcade-teaser__cabinet" aria-hidden="true">
        <span className="arcade-teaser__cabinet-label">Play / {total} titles</span>
        <div className="arcade-teaser__screen">
          <i />
          <i />
          <i />
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
